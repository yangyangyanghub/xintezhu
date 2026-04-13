"""
Core modules for cli-anything-qgis.

Provides high-level wrappers around QGIS Python API for:
- Project management (project.py)
- Processing algorithms (processing.py)
- Layer management (layers.py)
- CRS management (crs.py)
- Format conversion and export (export.py)
"""

from cli_anything.qgis.core.exceptions import (
    QgisError,
    QgisInitError,
    QgisProjectError,
    QgisLayerError,
    QgisProcessingError,
    QgisConversionError,
    QgisCRSError,
    QgisExportError,
    QgisNotAvailableError,
)

__all__ = [
    "QgisError",
    "QgisInitError",
    "QgisProjectError",
    "QgisLayerError",
    "QgisProcessingError",
    "QgisConversionError",
    "QgisCRSError",
    "QgisExportError",
    "QgisNotAvailableError",
]

# Lazy imports for modules that depend on QGIS bindings
# Only import when the caller actually needs them


def __getattr__(name):
    """Lazy attribute access for QGIS-dependent modules."""
    if name == "QgisProject":
        from cli_anything.qgis.core.project import QgisProject as _QP
        return _QP
    elif name == "QgisProcessor":
        from cli_anything.qgis.core.processing import QgisProcessor as _QS
        return _QS
    elif name == "PROJECT_AVAILABLE":
        from cli_anything.qgis.core.project import QGIS_AVAILABLE
        return QGIS_AVAILABLE
    elif name == "PROCESSING_AVAILABLE":
        from cli_anything.qgis.core.processing import QGIS_AVAILABLE
        return QGIS_AVAILABLE
    raise AttributeError(f"module {__name__!r} has no attribute {name!r}")
