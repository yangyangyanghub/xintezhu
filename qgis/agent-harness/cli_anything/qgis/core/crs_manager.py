"""QGIS CRS management module.

Provides coordinate reference system operations including listing,
searching, validating CRS definitions, and coordinate transformations.
"""

from .exceptions import QgisError, QgisCRSError, QgisNotAvailableError

try:
    from qgis.core import (
        QgsCoordinateReferenceSystem,
        QgsCoordinateTransform,
        QgsPointXY,
        QgsProject,
    )
    QGIS_AVAILABLE = True
except ImportError:
    QGIS_AVAILABLE = False


class QgisCRSManager:
    """Manages coordinate reference system operations.

    Provides methods for listing, searching, validating CRS definitions,
    and performing coordinate transformations between CRS.

    Attributes:
        COMMON_CRS: List of commonly used CRS with metadata.
    """

    COMMON_CRS = [
        {"id": "EPSG:4326", "name": "WGS 84", "description": "Geographic coordinate system, global", "type": "geographic"},
        {"id": "EPSG:3857", "name": "WGS 84 / Pseudo-Mercator", "description": "Web Mercator, used by web maps", "type": "projected"},
        {"id": "EPSG:4269", "name": "NAD83", "description": "North American Datum 1983", "type": "geographic"},
        {"id": "EPSG:4267", "name": "NAD27", "description": "North American Datum 1927", "type": "geographic"},
        {"id": "EPSG:32633", "name": "WGS 84 / UTM zone 33N", "description": "UTM zone 33 North", "type": "projected"},
        {"id": "EPSG:32632", "name": "WGS 84 / UTM zone 32N", "description": "UTM zone 32 North", "type": "projected"},
        {"id": "EPSG:25832", "name": "ETRS89 / UTM zone 32N", "description": "European Terrestrial Reference System", "type": "projected"},
        {"id": "EPSG:25833", "name": "ETRS89 / UTM zone 33N", "description": "European Terrestrial Reference System", "type": "projected"},
        {"id": "EPSG:2154", "name": "RGF93 / Lambert-93", "description": "France - onshore", "type": "projected"},
        {"id": "EPSG:7415", "name": "EPSG7415", "description": "ETRS89 / UTM zone 32N + DVR90 height", "type": "projected"},
        {"id": "EPSG:4490", "name": "CGCS2000", "description": "China Geodetic Coordinate System 2000", "type": "geographic"},
        {"id": "EPSG:4547", "name": "CGCS2000 / 3-degree Gauss-Kruger zone 39", "description": "China - onshore", "type": "projected"},
        {"id": "EPSG:4548", "name": "CGCS2000 / 3-degree Gauss-Kruger zone 40", "description": "China - onshore", "type": "projected"},
        {"id": "EPSG:4549", "name": "CGCS2000 / 3-degree Gauss-Kruger zone 41", "description": "China - onshore", "type": "projected"},
        {"id": "EPSG:4322", "name": "WGS 72", "description": "World Geodetic System 1972", "type": "geographic"},
    ]

    def __init__(self):
        """Initialize the CRS manager.

        Raises:
            QgisError: If QGIS is not available.
        """
        if not QGIS_AVAILABLE:
            raise QgisNotAvailableError("QGIS is not available. Please install QGIS Python bindings.")

    def list_crs(self, filter_text=None):
        """List available coordinate reference systems.

        Args:
            filter_text: Optional text to filter CRS by name or ID.

        Returns:
            list[dict]: List of CRS information dicts with keys:
                - authid: Authority ID (e.g., 'EPSG:4326')
                - name: CRS name
                - description: CRS description
                - type: 'geographic' or 'projected'
        """
        try:
            # Use QGIS internal database to list CRS
            crs_list = []

            # Get all CRS from QGIS database
            crs_db = QgsCoordinateReferenceSystem.validSrsIds()

            for auth_id in crs_db:
                crs = QgsCoordinateReferenceSystem()
                crs.createFromOgcWmsCrs(auth_id)

                if crs.isValid():
                    crs_info = {
                        "authid": crs.authid(),
                        "name": crs.description(),
                        "description": crs.description(),
                        "type": "geographic" if crs.isGeographicCRS() else "projected",
                    }

                    if filter_text:
                        filter_lower = filter_text.lower()
                        if (
                            filter_lower not in crs_info["authid"].lower()
                            and filter_lower not in crs_info["name"].lower()
                            and filter_lower not in crs_info["description"].lower()
                        ):
                            continue

                    crs_list.append(crs_info)

            return crs_list

        except Exception as e:
            return [{"error": str(e)}]

    def get_crs_info(self, crs_id):
        """Get detailed information about a specific CRS.

        Args:
            crs_id: CRS authority ID (e.g., 'EPSG:4326') or full CRS string.

        Returns:
            dict: CRS information with keys:
                - authid: Authority ID
                - name: CRS name
                - proj4: Proj4 string
                - wkt: Well-Known Text representation
                - units: Linear or angular units
                - bounds: Valid usage bounds (if available)
                - is_valid: Whether the CRS is valid
                - type: 'geographic' or 'projected'
        """
        try:
            crs = QgsCoordinateReferenceSystem()

            # Try parsing as OGC WMS CRS first (EPSG:XXXX format)
            if ":" in crs_id:
                crs.createFromOgcWmsCrs(crs_id)
            else:
                # Try as proj4 or WKT
                crs = QgsCoordinateReferenceSystem(crs_id)

            if not crs.isValid():
                return {
                    "authid": crs_id,
                    "is_valid": False,
                    "error": f"Invalid CRS: {crs_id}",
                }

            # Get units
            if crs.isGeographicCRS():
                units = crs.mapUnits()
                units_name = "degrees" if units == QgsCoordinateReferenceSystem.Degrees else str(units)
            else:
                units = crs.mapUnits()
                units_name = str(units)

            result = {
                "authid": crs.authid(),
                "name": crs.description(),
                "proj4": crs.toProj(),
                "wkt": crs.toWkt(),
                "units": units_name,
                "is_valid": True,
                "type": "geographic" if crs.isGeographicCRS() else "projected",
            }

            # Try to get bounds if available
            try:
                bounds = crs.bounds()
                if bounds:
                    result["bounds"] = {
                        "west": bounds.xMinimum(),
                        "south": bounds.yMinimum(),
                        "east": bounds.xMaximum(),
                        "north": bounds.yMaximum(),
                    }
            except Exception:
                pass

            return result

        except Exception as e:
            return {
                "authid": crs_id,
                "is_valid": False,
                "error": str(e),
            }

    def find_crs(self, query):
        """Search for CRS by name, authority ID, or code.

        Args:
            query: Search query (e.g., 'EPSG:4326', 'WGS 84', 'Web Mercator').

        Returns:
            list[dict]: List of matching CRS with same structure as get_crs_info.
        """
        try:
            query_lower = query.lower()
            results = []

            # Check if query looks like an authority ID (EPSG:XXXX or similar)
            if ":" in query:
                crs_info = self.get_crs_info(query)
                if crs_info.get("is_valid"):
                    results.append(crs_info)

            # Also search through common CRS list
            for common in self.COMMON_CRS:
                if (
                    query_lower in common["id"].lower()
                    or query_lower in common["name"].lower()
                    or query_lower in common["description"].lower()
                ):
                    crs_info = self.get_crs_info(common["id"])
                    if crs_info.get("is_valid") and crs_info not in results:
                        results.append(crs_info)

            # Broader search through QGIS CRS database
            if len(results) < 10:  # Limit results to prevent overwhelming output
                try:
                    crs_db = QgsCoordinateReferenceSystem.validSrsIds()
                    for auth_id in crs_db:
                        if len(results) >= 50:
                            break

                        crs = QgsCoordinateReferenceSystem()
                        crs.createFromOgcWmsCrs(auth_id)

                        if crs.isValid():
                            desc_lower = crs.description().lower()
                            authid_lower = crs.authid().lower()
                            if query_lower in desc_lower or query_lower in authid_lower:
                                crs_info = self.get_crs_info(auth_id)
                                if crs_info.get("is_valid"):
                                    results.append(crs_info)
                except Exception:
                    pass  # Fall back to partial results

            return results

        except Exception as e:
            return [{"error": str(e)}]

    def transform_coordinates(self, x, y, source_crs, target_crs):
        """Transform a coordinate pair from one CRS to another.

        Args:
            x: X coordinate (longitude or easting).
            y: Y coordinate (latitude or northing).
            source_crs: Source CRS string (e.g., 'EPSG:4326').
            target_crs: Target CRS string (e.g., 'EPSG:3857').

        Returns:
            dict: Transformation result with keys:
                - success: bool
                - x: Transformed X coordinate
                - y: Transformed Y coordinate
                - source_crs: Source CRS ID
                - target_crs: Target CRS ID
                - error: Error message if transformation failed
        """
        result = {
            "success": False,
            "x": None,
            "y": None,
            "source_crs": source_crs,
            "target_crs": target_crs,
        }

        try:
            # Create source CRS
            src_crs = QgsCoordinateReferenceSystem()
            if ":" in source_crs:
                src_crs.createFromOgcWmsCrs(source_crs)
            else:
                src_crs = QgsCoordinateReferenceSystem(source_crs)

            if not src_crs.isValid():
                result["error"] = f"Invalid source CRS: {source_crs}"
                return result

            # Create target CRS
            dst_crs = QgsCoordinateReferenceSystem()
            if ":" in target_crs:
                dst_crs.createFromOgcWmsCrs(target_crs)
            else:
                dst_crs = QgsCoordinateReferenceSystem(target_crs)

            if not dst_crs.isValid():
                result["error"] = f"Invalid target CRS: {target_crs}"
                return result

            # Same CRS, no transformation needed
            if src_crs.authid() == dst_crs.authid():
                result["x"] = x
                result["y"] = y
                result["success"] = True
                return result

            # Create transform
            transform = QgsCoordinateTransform(src_crs, dst_crs, QgsProject.instance())

            # Transform the point
            point = QgsPointXY(x, y)
            transformed = transform.transform(point)

            result["x"] = transformed.x()
            result["y"] = transformed.y()
            result["success"] = True

        except Exception as e:
            result["error"] = str(e)

        return result

    def validate_crs(self, crs_string):
        """Check if a CRS string is valid.

        Args:
            crs_string: CRS string to validate (e.g., 'EPSG:4326', proj4 string, or WKT).

        Returns:
            dict: Validation result with keys:
                - is_valid: bool
                - authid: Authority ID if valid
                - name: CRS name if valid
                - error: Error message if invalid
        """
        try:
            crs = QgsCoordinateReferenceSystem()

            if ":" in crs_string:
                crs.createFromOgcWmsCrs(crs_string)
            else:
                crs = QgsCoordinateReferenceSystem(crs_string)

            if crs.isValid():
                return {
                    "is_valid": True,
                    "authid": crs.authid(),
                    "name": crs.description(),
                    "type": "geographic" if crs.isGeographicCRS() else "projected",
                }
            else:
                return {
                    "is_valid": False,
                    "error": f"Invalid CRS: {crs_string}",
                }

        except Exception as e:
            return {
                "is_valid": False,
                "error": str(e),
            }

    def list_common_crs(self):
        """List commonly used coordinate reference systems.

        Returns:
            list[dict]: List of common CRS with keys:
                - id: Authority ID
                - name: CRS name
                - description: Human-readable description
                - type: 'geographic' or 'projected'
        """
        return self.COMMON_CRS.copy()
