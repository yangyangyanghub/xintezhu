"""QGIS format conversion module.

Handles conversion between vector and raster GIS formats,
with automatic format detection and CRS reprojection support.
"""

import os

from .exceptions import QgisError, QgisConversionError, QgisNotAvailableError

try:
    from qgis.core import (
        QgsVectorLayer,
        QgsRasterLayer,
        QgsRasterFileWriter,
        QgsCoordinateReferenceSystem,
        QgsCoordinateTransform,
        QgsCoordinateTransformContext,
        QgsProject,
        QgsVectorFileWriter,
    )
    QGIS_AVAILABLE = True
except ImportError:
    QGIS_AVAILABLE = False


class QgisConverter:
    """Handles format conversions for vector and raster data.

    Supports conversion between multiple GIS formats with optional
    CRS reprojection during conversion.

    Attributes:
        VECTOR_FORMATS: Dict mapping format keys to (extension, description) tuples.
        RASTER_FORMATS: Dict mapping format keys to (extension, description) tuples.
        EXTENSION_MAP: Dict mapping file extensions to format keys.
    """

    VECTOR_FORMATS = {
        "GeoJSON": (".geojson", "GeoJSON format"),
        "GPKG": (".gpkg", "GeoPackage format"),
        "ESRI Shapefile": (".shp", "ESRI Shapefile format"),
        "GeoParquet": (".parquet", "GeoParquet format"),
        "KML": (".kml", "Keyhole Markup Language"),
        "CSV": (".csv", "Comma Separated Values"),
        "GML": (".gml", "Geography Markup Language"),
        "FlatGeobuf": (".fgb", "FlatGeobuf format"),
    }

    RASTER_FORMATS = {
        "GeoTIFF": (".tif", "GeoTIFF format"),
        "COG": (".tif", "Cloud Optimized GeoTIFF"),
        "PNG": (".png", "Portable Network Graphics"),
        "JPEG": (".jpg", "JPEG format"),
        "PDF": (".pdf", "Portable Document Format"),
        "NetCDF": (".nc", "Network Common Data Form"),
        "Zarr": (".zarr", "Zarr format"),
    }

    # Build extension to format mapping
    EXTENSION_MAP = {}
    for _fmt, (_ext, _desc) in VECTOR_FORMATS.items():
        EXTENSION_MAP[_ext] = _fmt
        # Also handle alternative extensions
        if _fmt == "GeoJSON":
            EXTENSION_MAP[".json"] = _fmt
        elif _fmt == "JPEG":
            EXTENSION_MAP[".jpeg"] = _fmt

    def __init__(self):
        """Initialize the converter.

        Raises:
            QgisError: If QGIS is not available.
        """
        if not QGIS_AVAILABLE:
            raise QgisNotAvailableError("QGIS is not available. Please install QGIS Python bindings.")

    def detect_format(self, path):
        """Auto-detect file format from extension.

        Args:
            path: File path to detect format for.

        Returns:
            str: Detected format key (e.g., 'GeoJSON', 'GPKG').

        Raises:
            QgisError: If format cannot be determined from extension.
        """
        ext = os.path.splitext(path)[1].lower()
        if ext in self.EXTENSION_MAP:
            return self.EXTENSION_MAP[ext]

        # Try matching against all known extensions
        for fmt_key, (fmt_ext, _) in {**self.VECTOR_FORMATS, **self.RASTER_FORMATS}.items():
            if ext == fmt_ext:
                return fmt_key

        raise QgisError(f"Cannot determine format from extension: {ext}")

    def list_supported_formats(self, data_type="vector"):
        """List all supported formats with descriptions.

        Args:
            data_type: Type of data to list formats for. One of 'vector' or 'raster'.

        Returns:
            list[dict]: List of format information dicts with keys:
                - format: Format key name
                - extension: Primary file extension
                - description: Human-readable description
        """
        formats = self.VECTOR_FORMATS if data_type == "vector" else self.RASTER_FORMATS
        return [
            {
                "format": fmt_key,
                "extension": fmt_ext,
                "description": fmt_desc,
            }
            for fmt_key, (fmt_ext, fmt_desc) in formats.items()
        ]

    def convert_vector(self, input_path, output_path, output_format=None, **options):
        """Convert a vector file to a different format.

        Args:
            input_path: Path to input vector file.
            output_path: Path to output file.
            output_format: Target format key. If None, auto-detected from output extension.
            **options: Additional conversion options:
                - target_crs: Target CRS string (e.g., 'EPSG:4326').
                - layer_name: Name of the layer to convert.
                - filter_expr: SQL-like filter expression.
                - encoding: Output encoding.

        Returns:
            dict: Conversion result with keys:
                - success: bool
                - input_info: dict with input layer info
                - output_info: dict with output file info
                - warnings: list of warning messages
                - errors: list of error messages
        """
        result = {
            "success": False,
            "input_info": {},
            "output_info": {},
            "warnings": [],
            "errors": [],
        }

        try:
            if not output_format:
                output_format = self.detect_format(output_path)

            # Load input layer
            layer_name = options.get("layer_name", os.path.basename(input_path))
            layer = QgsVectorLayer(input_path, layer_name, "ogr")

            if not layer.isValid():
                result["errors"].append(f"Invalid input layer: {input_path}")
                return result

            # Gather input info
            result["input_info"] = {
                "path": input_path,
                "format": self.detect_format(input_path),
                "feature_count": layer.featureCount(),
                "crs": layer.crs().authid(),
                "field_count": len(layer.fields()),
            }

            # Setup save options
            save_options = QgsVectorFileWriter.SaveVectorOptions()

            # Set output format driver
            driver_map = {
                "GeoJSON": "GeoJSON",
                "GPKG": "GPKG",
                "ESRI Shapefile": "ESRI Shapefile",
                "GeoParquet": "Parquet",
                "KML": "KML",
                "CSV": "CSV",
                "GML": "GML",
                "FlatGeobuf": "FlatGeobuf",
            }
            save_options.driverName = driver_map.get(output_format, "GPKG")

            # Handle CRS reprojection
            target_crs = options.get("target_crs")
            transform_context = QgsProject.instance().transformContext()

            if target_crs:
                src_crs = layer.crs()
                dst_crs = QgsCoordinateReferenceSystem()
                dst_crs.createFromOgcWmsCrs(target_crs)

                if dst_crs.isValid():
                    save_options.ct = QgsCoordinateTransform(src_crs, dst_crs, transform_context)
                    save_options.ct.setAllowFallbackTransforms(True)
                else:
                    result["warnings"].append(f"Invalid target CRS: {target_crs}, skipping reprojection")

            # Apply encoding if specified
            if "encoding" in options:
                save_options.fileEncoding = options["encoding"]

            # Apply filter expression if specified
            if "filter_expr" in options:
                layer.setSubsetString(options["filter_expr"])

            # Perform the conversion
            error_code, error_message = QgsVectorFileWriter.writeAsVectorFormatV3(
                layer, output_path, transform_context, save_options
            )

            if error_code != QgsVectorFileWriter.NoError:
                result["errors"].append(f"Conversion failed: {error_message}")
                return result

            # Gather output info
            result["output_info"] = {
                "path": output_path,
                "format": output_format,
                "file_size": os.path.getsize(output_path) if os.path.exists(output_path) else 0,
            }
            result["success"] = True

        except QgisError:
            raise
        except Exception as e:
            result["errors"].append(str(e))

        return result

    def convert_raster(self, input_path, output_path, output_format=None, **options):
        """Convert a raster file to a different format.

        Args:
            input_path: Path to input raster file.
            output_path: Path to output file.
            output_format: Target format key. If None, auto-detected from output extension.
            **options: Additional conversion options:
                - target_crs: Target CRS string (e.g., 'EPSG:4326').
                - output_crs: Alias for target_crs.
                - width: Output width in pixels.
                - height: Output height in pixels.

        Returns:
            dict: Conversion result with keys:
                - success: bool
                - input_info: dict with input raster info
                - output_info: dict with output file info
                - warnings: list of warning messages
                - errors: list of error messages
        """
        result = {
            "success": False,
            "input_info": {},
            "output_info": {},
            "warnings": [],
            "errors": [],
        }

        try:
            if not output_format:
                output_format = self.detect_format(output_path)

            # Load input raster
            layer_name = options.get("layer_name", os.path.basename(input_path))
            layer = QgsRasterLayer(input_path, layer_name)

            if not layer.isValid():
                result["errors"].append(f"Invalid input raster: {input_path}")
                return result

            # Gather input info
            provider = layer.dataProvider()
            result["input_info"] = {
                "path": input_path,
                "format": self.detect_format(input_path),
                "crs": layer.crs().authid(),
                "width": provider.xSize(),
                "height": provider.ySize(),
                "band_count": provider.bandCount(),
            }

            # Determine output format driver string
            driver_map = {
                "GeoTIFF": "GTiff",
                "COG": "COG",
                "PNG": "PNG",
                "JPEG": "JPEG",
                "PDF": "PDF",
                "NetCDF": "NetCDF",
                "Zarr": "Zarr",
            }
            driver_name = driver_map.get(output_format, "GTiff")

            # Setup raster file writer
            writer = QgsRasterFileWriter(output_path)
            writer.setOutputProviderKey("gdal")
            writer.setOutputFormat(driver_name)

            # Handle CRS reprojection
            target_crs = options.get("target_crs") or options.get("output_crs")
            if target_crs:
                dst_crs = QgsCoordinateReferenceSystem()
                dst_crs.createFromOgcWmsCrs(target_crs)
                if dst_crs.isValid():
                    writer.setDestinationCrs(dst_crs, QgsProject.instance().transformContext())
                else:
                    result["warnings"].append(f"Invalid target CRS: {target_crs}, skipping reprojection")

            # Create pipe for raster conversion
            pipe = QgsRasterPipe()
            if not pipe.set(provider.clone()):
                result["errors"].append("Failed to set raster pipe")
                return result

            # Write the raster
            error_code = writer.writeRaster(
                pipe,
                provider.xSize(),
                provider.ySize(),
                layer.extent(),
                layer.crs(),
            )

            if error_code != 0:
                result["errors"].append(f"Raster conversion failed with error code: {error_code}")
                return result

            # Gather output info
            result["output_info"] = {
                "path": output_path,
                "format": output_format,
                "file_size": os.path.getsize(output_path) if os.path.exists(output_path) else 0,
            }
            result["success"] = True

        except QgisError:
            raise
        except Exception as e:
            result["errors"].append(str(e))

        return result
