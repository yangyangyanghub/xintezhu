"""QGIS export module.

Provides various export operations including layer export,
map rendering to images, PDF, and SVG export.
"""

import os

from .exceptions import QgisError, QgisExportError, QgisNotAvailableError

try:
    from qgis.core import (
        QgsVectorLayer,
        QgsRasterLayer,
        QgsVectorFileWriter,
        QgsCoordinateReferenceSystem,
        QgsCoordinateTransform,
        QgsProject,
        QgsMapSettings,
        QgsMapRendererSequentialJob,
    )
    from PyQt5.QtGui import QImage
    from PyQt5.QtCore import QSize
    QGIS_AVAILABLE = True
except ImportError:
    QGIS_AVAILABLE = False


class QgisExporter:
    """Handles various export operations for QGIS.

    Supports exporting layers to different formats, rendering maps
    to images, and exporting to PDF and SVG.

    Attributes:
        IMAGE_FORMATS: Supported image export formats.
        EXPORT_FORMAT_MAP: Mapping of format names to QGIS driver names.
    """

    IMAGE_FORMATS = ["PNG", "JPEG", "TIFF", "WEBP"]

    EXPORT_FORMAT_MAP = {
        "GeoJSON": "GeoJSON",
        "GPKG": "GPKG",
        "ESRI Shapefile": "ESRI Shapefile",
        "GeoParquet": "Parquet",
        "KML": "KML",
        "CSV": "CSV",
        "GML": "GML",
        "FlatGeobuf": "FlatGeobuf",
    }

    def __init__(self):
        """Initialize the exporter.

        Raises:
            QgisError: If QGIS is not available.
        """
        if not QGIS_AVAILABLE:
            raise QgisNotAvailableError("QGIS is not available. Please install QGIS Python bindings.")

    def list_export_formats(self):
        """List all supported export formats.

        Returns:
            list[dict]: List of format information dicts with keys:
                - format: Format name
                - extension: Primary file extension
                - description: Human-readable description
                - type: 'vector', 'raster', or 'image'
        """
        formats = [
            # Vector formats
            {"format": "GeoJSON", "extension": ".geojson", "description": "GeoJSON format", "type": "vector"},
            {"format": "GPKG", "extension": ".gpkg", "description": "GeoPackage format", "type": "vector"},
            {"format": "ESRI Shapefile", "extension": ".shp", "description": "ESRI Shapefile", "type": "vector"},
            {"format": "GeoParquet", "extension": ".parquet", "description": "GeoParquet format", "type": "vector"},
            {"format": "KML", "extension": ".kml", "description": "Keyhole Markup Language", "type": "vector"},
            {"format": "CSV", "extension": ".csv", "description": "Comma Separated Values", "type": "vector"},
            {"format": "GML", "extension": ".gml", "description": "Geography Markup Language", "type": "vector"},
            {"format": "FlatGeobuf", "extension": ".fgb", "description": "FlatGeobuf format", "type": "vector"},
            # Image formats
            {"format": "PNG", "extension": ".png", "description": "Portable Network Graphics", "type": "image"},
            {"format": "JPEG", "extension": ".jpg", "description": "JPEG format", "type": "image"},
            {"format": "TIFF", "extension": ".tif", "description": "Tagged Image File Format", "type": "image"},
            {"format": "WEBP", "extension": ".webp", "description": "WebP image format", "type": "image"},
            # Document formats
            {"format": "PDF", "extension": ".pdf", "description": "Portable Document Format", "type": "document"},
            {"format": "SVG", "extension": ".svg", "description": "Scalable Vector Graphics", "type": "document"},
        ]
        return formats

    def export_layer(self, layer, output_path, format=None, **options):
        """Export a single layer to a file.

        Args:
            layer: QgsVectorLayer or QgsRasterLayer instance, or path to a layer file.
            output_path: Path to export the layer to.
            format: Target format. If None, auto-detected from output extension.
            **options: Additional export options:
                - encoding: Output file encoding.
                - filter_expr: Filter expression for features.
                - target_crs: Target CRS for reprojection.

        Returns:
            dict: Export result with keys:
                - success: bool
                - output_path: str
                - file_size: int (bytes)
                - warnings: list of warning messages
        """
        result = {
            "success": False,
            "output_path": output_path,
            "file_size": 0,
            "warnings": [],
        }

        try:
            # If layer is a path, load it
            if isinstance(layer, str):
                layer = QgsVectorLayer(layer, os.path.basename(layer), "ogr")
                if not layer.isValid():
                    layer = QgsRasterLayer(layer, os.path.basename(layer))

            if not layer.isValid():
                result["warnings"].append(f"Invalid layer: {layer}")
                return result

            if not format:
                ext = os.path.splitext(output_path)[1].lower()
                ext_to_format = {
                    ".geojson": "GeoJSON",
                    ".json": "GeoJSON",
                    ".gpkg": "GPKG",
                    ".shp": "ESRI Shapefile",
                    ".parquet": "GeoParquet",
                    ".kml": "KML",
                    ".csv": "CSV",
                    ".gml": "GML",
                    ".fgb": "FlatGeobuf",
                }
                format = ext_to_format.get(ext, "GPKG")

            # Setup export options
            save_options = QgsVectorFileWriter.SaveVectorOptions()
            save_options.driverName = self.EXPORT_FORMAT_MAP.get(format, "GPKG")

            if "encoding" in options:
                save_options.fileEncoding = options["encoding"]

            # Handle CRS reprojection
            target_crs = options.get("target_crs")
            if target_crs:
                dst_crs = QgsCoordinateReferenceSystem()
                dst_crs.createFromOgcWmsCrs(target_crs)
                if dst_crs.isValid():
                    save_options.ct = QgsCoordinateTransform(
                        layer.crs(), dst_crs, QgsProject.instance().transformContext()
                    )
                    save_options.ct.setAllowFallbackTransforms(True)

            # Apply filter if specified
            if "filter_expr" in options and isinstance(layer, QgsVectorLayer):
                layer.setSubsetString(options["filter_expr"])

            # Perform export
            error_code, error_message = QgsVectorFileWriter.writeAsVectorFormatV3(
                layer, output_path, QgsProject.instance().transformContext(), save_options
            )

            if error_code != QgsVectorFileWriter.NoError:
                result["warnings"].append(f"Export issue: {error_message}")
                return result

            result["file_size"] = os.path.getsize(output_path) if os.path.exists(output_path) else 0
            result["success"] = True

        except QgisError:
            raise
        except Exception as e:
            result["warnings"].append(str(e))

        return result

    def export_map_image(self, output_path, width=800, height=600, dpi=96, extent=None):
        """Render the current map to an image file.

        Args:
            output_path: Path to save the image.
            width: Output image width in pixels.
            height: Output image height in pixels.
            dpi: Output DPI.
            extent: QgsRectangle for the map extent. If None, uses full extent.

        Returns:
            dict: Export result with keys:
                - success: bool
                - output_path: str
                - file_size: int (bytes)
                - warnings: list of warning messages
        """
        result = {
            "success": False,
            "output_path": output_path,
            "file_size": 0,
            "warnings": [],
        }

        try:
            project = QgsProject.instance()

            # Setup map settings
            settings = QgsMapSettings()
            settings.setOutputSize(QSize(width, height))
            settings.setOutputDpi(dpi)

            # Set layers from project
            layers = list(project.mapLayers().values())
            if not layers:
                result["warnings"].append("No layers in project to render")
                return result

            settings.setLayers(layers)

            # Set extent
            if extent:
                settings.setExtent(extent)
            else:
                # Use full extent of all layers
                full_extent = layers[0].extent()
                for layer in layers[1:]:
                    full_extent.combineExtentWith(layer.extent())
                settings.setExtent(full_extent)

            settings.setBackgroundColor(project.readNumEntry("Gui", "/CanvasColorB", 255))

            # Create renderer job
            image = QImage(settings.outputSize(), QImage.Format_ARGB32)
            renderer = QgsMapRendererSequentialJob(settings)
            renderer.setRenderFlags(QgsMapSettings.RenderFlag.Antialiasing)
            renderer.start()
            renderer.waitForFinished()

            # Render to image
            image = renderer.renderedImage()

            # Save image
            image.save(output_path)

            result["file_size"] = os.path.getsize(output_path) if os.path.exists(output_path) else 0
            result["success"] = True

        except QgisError:
            raise
        except Exception as e:
            result["warnings"].append(str(e))

        return result

    def export_pdf(self, output_path, width=210, height=297, dpi=300):
        """Export the current map to PDF.

        Args:
            output_path: Path to save the PDF.
            width: Page width in mm (A4 = 210).
            height: Page height in mm (A4 = 297).
            dpi: Output DPI.

        Returns:
            dict: Export result with keys:
                - success: bool
                - output_path: str
                - file_size: int (bytes)
                - warnings: list of warning messages
        """
        result = {
            "success": False,
            "output_path": output_path,
            "file_size": 0,
            "warnings": [],
        }

        try:
            project = QgsProject.instance()
            layers = list(project.mapLayers().values())

            if not layers:
                result["warnings"].append("No layers in project to render")
                return result

            # Convert mm to pixels
            mm_to_inches = 25.4
            pixel_width = int(width / mm_to_inches * dpi)
            pixel_height = int(height / mm_to_inches * dpi)

            settings = QgsMapSettings()
            settings.setOutputSize(QSize(pixel_width, pixel_height))
            settings.setOutputDpi(dpi)
            settings.setLayers(layers)
            settings.setBackgroundColor(project.readNumEntry("Gui", "/CanvasColorB", 255))

            # Compute extent
            full_extent = layers[0].extent()
            for layer in layers[1:]:
                full_extent.combineExtentWith(layer.extent())
            settings.setExtent(full_extent)

            # Render
            renderer = QgsMapRendererSequentialJob(settings)
            renderer.start()
            renderer.waitForFinished()
            image = renderer.renderedImage()

            # Save as PDF
            image.save(output_path, "PDF")

            result["file_size"] = os.path.getsize(output_path) if os.path.exists(output_path) else 0
            result["success"] = True

        except QgisError:
            raise
        except Exception as e:
            result["warnings"].append(str(e))

        return result

    def export_svg(self, output_path, width=800, height=600):
        """Export the current map to SVG.

        Args:
            output_path: Path to save the SVG.
            width: Output width in pixels.
            height: Output height in pixels.

        Returns:
            dict: Export result with keys:
                - success: bool
                - output_path: str
                - file_size: int (bytes)
                - warnings: list of warning messages
        """
        result = {
            "success": False,
            "output_path": output_path,
            "file_size": 0,
            "warnings": [],
        }

        try:
            project = QgsProject.instance()
            layers = list(project.mapLayers().values())

            if not layers:
                result["warnings"].append("No layers in project to render")
                return result

            settings = QgsMapSettings()
            settings.setOutputSize(QSize(width, height))
            settings.setLayers(layers)
            settings.setBackgroundColor(project.readNumEntry("Gui", "/CanvasColorB", 255))

            # Compute extent
            full_extent = layers[0].extent()
            for layer in layers[1:]:
                full_extent.combineExtentWith(layer.extent())
            settings.setExtent(full_extent)

            # Render
            renderer = QgsMapRendererSequentialJob(settings)
            renderer.start()
            renderer.waitForFinished()
            image = renderer.renderedImage()

            # Save as SVG
            image.save(output_path, "SVG")

            result["file_size"] = os.path.getsize(output_path) if os.path.exists(output_path) else 0
            result["success"] = True

        except QgisError:
            raise
        except Exception as e:
            result["warnings"].append(str(e))

        return result

    def export_geojson(self, layer, output_path, **options):
        """Convenience method for GeoJSON export.

        Args:
            layer: QgsVectorLayer instance or path to a vector layer.
            output_path: Path to save the GeoJSON file.
            **options: Additional export options passed to export_layer.

        Returns:
            dict: Export result with keys:
                - success: bool
                - output_path: str
                - file_size: int (bytes)
                - warnings: list of warning messages
        """
        return self.export_layer(layer, output_path, format="GeoJSON", **options)


# ---------------------------------------------------------------------------
# ExportManager — Static API expected by qgis_cli.py
# ---------------------------------------------------------------------------

class ExportManager:
    """Static facade for QGIS export operations, used by the CLI module.

    Delegates to QgisExporter internally but exposes a class-based API
    so the CLI can call methods without instantiating objects.
    """

    @classmethod
    def _get_exporter(cls):
        """Create and return a QgisExporter instance.

        Returns:
            QgisExporter instance.

        Raises:
            QgisNotAvailableError: If QGIS is not installed.
        """
        return QgisExporter()

    @classmethod
    def convert_vector(cls, input_path, output_path, format_type=None,
                       as_json=False):
        """Convert vector data from one format to another.

        Args:
            input_path: Source file path.
            output_path: Destination file path.
            format_type: Target format name (e.g. "GeoJSON", "GPKG").
                         Auto-detected from output extension if omitted.
            as_json: Whether to return JSON-formatted output.

        Returns:
            dict with status, input/output paths, format, feature_count.
        """
        if not QGIS_AVAILABLE:
            raise QgisNotAvailableError("QGIS 不可用。")
        if not os.path.exists(input_path):
            raise QgisError(f"输入文件不存在: {input_path}")

        exporter = cls._get_exporter()
        layer = QgsVectorLayer(input_path, "convert_temp", "ogr")
        if not layer.isValid():
            raise QgisError(f"无效的矢量图层: {input_path}")

        result = exporter.export_layer(
            layer, output_path, format=format_type
        )

        if not result["success"]:
            raise QgisError(
                f"矢量转换失败: {result.get('warnings', '未知错误')}"
            )

        return {
            "status": "converted",
            "input": os.path.abspath(input_path),
            "output": os.path.abspath(output_path),
            "format": format_type or "auto",
            "feature_count": layer.featureCount(),
            "size_bytes": result.get("file_size", 0),
        }

    @classmethod
    def convert_raster(cls, input_path, output_path, format_type=None,
                       as_json=False):
        """Convert raster data from one format to another.

        Args:
            input_path: Source file path.
            output_path: Destination file path.
            format_type: Target format name (e.g. "GTiff", "PNG").
                         Auto-detected from output extension if omitted.
            as_json: Whether to return JSON-formatted output.

        Returns:
            dict with status, input/output paths, format, dimensions.
        """
        if not QGIS_AVAILABLE:
            raise QgisNotAvailableError("QGIS 不可用。")
        if not os.path.exists(input_path):
            raise QgisError(f"输入文件不存在: {input_path}")

        layer = QgsRasterLayer(input_path, "convert_raster_temp")
        if not layer.isValid():
            raise QgisError(f"无效的栅格图层: {input_path}")

        # Use QgsRasterFileWriter for format conversion
        try:
            from qgis.core import (
                QgsRasterFileWriter,
                QgsRasterPipe,
            )

            pipe = QgsRasterPipe()
            if not pipe.set(layer.dataProvider().clone()):
                raise QgisError("栅格管道设置失败")

            writer = QgsRasterFileWriter(output_path)
            error_code = writer.writeRaster(
                pipe,
                layer.width(),
                layer.height(),
                layer.extent(),
                layer.crs(),
            )

            if error_code != QgsRasterFileWriter.NoError:
                raise QgisError(f"栅格写入失败 [错误码: {error_code}]")

        except Exception as e:
            raise QgisError(f"栅格转换失败: {e}")

        return {
            "status": "converted",
            "input": os.path.abspath(input_path),
            "output": os.path.abspath(output_path),
            "format": format_type or "auto",
            "width": layer.width(),
            "height": layer.height(),
            "band_count": layer.bandCount(),
            "size_bytes": os.path.getsize(output_path) if os.path.exists(output_path) else 0,
        }

    @classmethod
    def export_layer(cls, layer_name, output_path, format_type=None,
                     as_json=False):
        """Export a named layer from the current project to a file.

        Args:
            layer_name: Name of the layer in the current project.
            output_path: Destination file path.
            format_type: Target format name. Auto-detected if omitted.
            as_json: Whether to return JSON-formatted output.

        Returns:
            dict with status, layer name, output path, size.
        """
        if not QGIS_AVAILABLE:
            raise QgisNotAvailableError("QGIS 不可用。")

        exporter = cls._get_exporter()
        project = QgsProject.instance()
        layers = project.mapLayersByName(layer_name)

        if not layers:
            raise QgisError(f"图层不存在: {layer_name}")

        layer = layers[0]
        result = exporter.export_layer(
            layer, output_path, format=format_type
        )

        if not result["success"]:
            raise QgisError(
                f"导出图层失败 [{layer_name}]: {result.get('warnings', '未知错误')}"
            )

        return {
            "status": "exported",
            "layer": layer_name,
            "output": os.path.abspath(output_path),
            "format": format_type or "auto",
            "size_bytes": result.get("file_size", 0),
        }

    @classmethod
    def export_map(cls, output_path, width=1920, height=1080, dpi=96,
                   as_json=False):
        """Export the current map view as an image.

        Args:
            output_path: Destination file path.
            width: Image width in pixels.
            height: Image height in pixels.
            dpi: Image DPI.
            as_json: Whether to return JSON-formatted output.

        Returns:
            dict with status, output path, dimensions, size.
        """
        if not QGIS_AVAILABLE:
            raise QgisNotAvailableError("QGIS 不可用。")

        exporter = cls._get_exporter()
        result = exporter.export_map_image(
            output_path, width=width, height=height, dpi=dpi
        )

        if not result["success"]:
            raise QgisError(
                f"导出地图失败: {result.get('warnings', '未知错误')}"
            )

        return {
            "status": "exported",
            "output": os.path.abspath(output_path),
            "width": width,
            "height": height,
            "dpi": dpi,
            "size_bytes": result.get("file_size", 0),
        }
