"""
Core exceptions for cli-anything-qgis.
"""


class QgisError(Exception):
    """Base exception for all QGIS CLI harness errors."""


class QgisInitError(QgisError):
    """Raised when QGIS application fails to initialize."""


class QgisProjectError(QgisError):
    """Raised when project operations fail (load, save, create)."""


class QgisLayerError(QgisError):
    """Raised when layer operations fail (add, remove, export)."""


class QgisProcessingError(QgisError):
    """Raised when processing algorithm operations fail."""


class QgisConversionError(QgisError):
    """Raised when format conversion fails."""


class QgisCRSError(QgisError):
    """Raised when CRS operations fail."""


class QgisExportError(QgisError):
    """Raised when export operations fail."""


class QgisNotAvailableError(QgisError):
    """Raised when QGIS is not installed or not accessible."""
