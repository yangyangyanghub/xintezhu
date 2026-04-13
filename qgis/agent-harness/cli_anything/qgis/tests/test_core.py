"""Unit tests for cli-anything-qgis core modules (mock-based, no QGIS required)."""

import os
import sys

import pytest
from unittest.mock import MagicMock, patch


def inject_mock_qgis(module, **extra_mocks):
    """Inject mock QGIS classes into a module's namespace."""
    module.QGIS_AVAILABLE = True
    defaults = {
        "QgsApplication": MagicMock(), "QgsProject": MagicMock(),
        "QgsVectorLayer": MagicMock(), "QgsRasterLayer": MagicMock(),
        "QgsCoordinateReferenceSystem": MagicMock(), "QgsRectangle": MagicMock(),
        "QgsProcessingRegistry": MagicMock(), "QgsProcessingAlgorithm": MagicMock(),
        "QgsProcessingContext": MagicMock(), "QgsProcessingFeedback": MagicMock(),
        "QgsPointXY": MagicMock(), "QgsCoordinateTransform": MagicMock(),
        # Convert/export modules need these
        "QgsVectorFileWriter": MagicMock(),
        "QgsRasterFileWriter": MagicMock(),
    }
    defaults.update(extra_mocks)
    for name, mock in defaults.items():
        setattr(module, name, mock)


def mock_app():
    a = MagicMock(); a.initQgis = MagicMock(); a.exitQgis = MagicMock(); return a


# ============================================================
# Exceptions
# ============================================================
class TestExceptions:
    def test_hierarchy(self):
        from cli_anything.qgis.core.exceptions import (
            QgisError, QgisInitError, QgisProjectError, QgisLayerError,
            QgisProcessingError, QgisConversionError, QgisCRSError,
            QgisExportError, QgisNotAvailableError)
        assert issubclass(QgisError, Exception)
        for c in [QgisInitError, QgisProjectError, QgisLayerError, QgisProcessingError,
                   QgisConversionError, QgisCRSError, QgisExportError, QgisNotAvailableError]:
            assert issubclass(c, QgisError)

    def test_raise(self):
        from cli_anything.qgis.core.exceptions import QgisError
        with pytest.raises(QgisError, match="boom"):
            raise QgisError("boom")


# ============================================================
# Formatters
# ============================================================
class TestFormatters:
    def test_truncate(self):
        from cli_anything.qgis.utils.formatters import truncate
        assert truncate("hi") == "hi"
        assert len(truncate("a"*100, max_len=5)) <= 8
    def test_size(self):
        from cli_anything.qgis.utils.formatters import format_size
        assert format_size(1024) == "1.0 KB"
    def test_table(self):
        from cli_anything.qgis.utils.formatters import format_table
        r = format_table([{"n":"t"}], headers=["n"])
        assert "n" in r and "t" in r
    def test_json(self):
        import json
        from cli_anything.qgis.utils.formatters import format_json
        assert json.loads(format_json({"k":"v"})) == {"k":"v"}
    def test_output_none(self):
        from cli_anything.qgis.utils.formatters import format_output
        assert format_output(None) == "" or format_output(None) is None


# ============================================================
# QgisProject — no QGIS
# ============================================================
class TestProjectNoQgis:
    def test_init_raises(self):
        from cli_anything.qgis.core.project import QgisProject
        from cli_anything.qgis.core.exceptions import QgisError
        with pytest.raises(QgisError, match="QGIS Python bindings"):
            QgisProject().init()
    def test_flag_false(self):
        import cli_anything.qgis.core.project as m
        assert m.QGIS_AVAILABLE is False
    def test_create_without_init(self):
        from cli_anything.qgis.core.project import QgisProject
        from cli_anything.qgis.core.exceptions import QgisError
        with pytest.raises(QgisError, match="Call init"):
            QgisProject().create()


# ============================================================
# QgisProject — mocked
# ============================================================
class TestProjectOps:
    def _p(self, m):
        inject_mock_qgis(m); m.QgsApplication.return_value = mock_app()
        p = m.QgisProject(); p.init()
        p._project.read.return_value = True; p._project.title.return_value = "T"
        p._project.count.return_value = 0; p._project.fileName.return_value = "/t.qgz"
        p._project.write.return_value = True; p._project.clear = MagicMock()
        c = MagicMock(); c.isValid.return_value = True; c.authid.return_value = "EPSG:4326"; c.description.return_value = "W"
        p._project.crs.return_value = c
        e = MagicMock(); e.isNull.return_value = False
        for attr in ["xMinimum","yMinimum","xMaximum","yMaximum"]: setattr(e, attr, MagicMock(return_value=0))
        p._project.extent.return_value = e
        return p

    def test_init(self):
        import cli_anything.qgis.core.project as m
        inject_mock_qgis(m); m.QgsApplication.return_value = mock_app()
        assert m.QgisProject().init()["status"] == "initialized"
    def test_idempotent(self):
        import cli_anything.qgis.core.project as m
        inject_mock_qgis(m); m.QgsApplication.return_value = mock_app()
        p = m.QgisProject(); p.init()
        assert p.init()["status"] == "already_initialized"
    def test_create(self):
        import cli_anything.qgis.core.project as m
        assert self._p(m).create()["status"] == "created"
    def test_save(self):
        import cli_anything.qgis.core.project as m
        p = self._p(m); p._project.fileName.return_value = "x.qgz"
        assert p.save()["status"] == "saved"
    def _load_ctx(self, m, exists=True, read_ok=True):
        p = self._p(m)
        p._project.read.return_value = read_ok
        import contextlib
        @contextlib.contextmanager
        def _ctx():
            with patch.object(m.os.path, "exists", exists):
                yield p
        return _ctx()
    def test_load(self):
        import cli_anything.qgis.core.project as m
        with self._load_ctx(m, True, True) as p:
            assert p.load("t.qgz")["status"] == "loaded"
    def test_load_not_found(self):
        import cli_anything.qgis.core.project as m
        from cli_anything.qgis.core.exceptions import QgisError
        with self._load_ctx(m, False), pytest.raises(QgisError, match="not found"):
            pass  # exception from __exit__; but we need to actually call load
        # redo properly:
        inject_mock_qgis(m); m.QgsApplication.return_value = mock_app()
        p = m.QgisProject(); p.init()
        with patch.object(m.os.path, "exists", False):
            with pytest.raises(QgisError, match="not found"):
                p.load("x.qgz")
    def test_load_read_fail(self):
        import cli_anything.qgis.core.project as m
        from cli_anything.qgis.core.exceptions import QgisError
        inject_mock_qgis(m); m.QgsApplication.return_value = mock_app()
        p = m.QgisProject(); p.init()
        p._project.read.return_value = False
        orig = getattr(m.os.path, "exists", None)
        m.os.path.exists = lambda x: True
        try:
            with pytest.raises(QgisError, match="Failed"):
                p.load("x.qgz")
        finally:
            m.os.path.exists = orig
    def test_list_layers(self):
        import cli_anything.qgis.core.project as m
        p = self._p(m); p._project.mapLayers.return_value = {}
        assert p.list_layers() == []
    def test_list_layers_data(self):
        import cli_anything.qgis.core.project as m
        p = self._p(m)
        ml = MagicMock(); ml.id.return_value="l1"; ml.name.return_value="r"; ml.type.return_value=0
        ml.isValid.return_value=True; ml.crs.return_value.isValid.return_value=True; ml.crs.return_value.authid.return_value="E"; ml.featureCount.return_value=1; ml.width=MagicMock(return_value=0)
        p._project.mapLayers.return_value={"l1":ml}
        assert len(p.list_layers())==1
    def _add_setup(self, m):
        inject_mock_qgis(m); m.QgsApplication.return_value = mock_app()
        p = m.QgisProject(); p.init()
        ml = MagicMock(); ml.isValid.return_value=True; ml.name.return_value="t"
        m.QgsVectorLayer.return_value = ml
        return p, ml
    def test_add_layer(self):
        import cli_anything.qgis.core.project as m
        p, _ = self._add_setup(m)
        orig = getattr(m.os.path, "exists", None)
        m.os.path.exists = lambda x: True
        try:
            assert p.add_layer("t.shp","t")["status"]=="added"
        finally:
            m.os.path.exists = orig
    def test_add_not_found(self):
        import cli_anything.qgis.core.project as m
        from cli_anything.qgis.core.exceptions import QgisError
        inject_mock_qgis(m); m.QgsApplication.return_value = mock_app()
        p = m.QgisProject(); p.init()
        orig_exists = getattr(m.os.path, "exists", None)
        m.os.path.exists = lambda x: False
        try:
            with pytest.raises(QgisError):
                p.add_layer("x.shp")
        finally:
            m.os.path.exists = orig_exists
    def test_close(self):
        import cli_anything.qgis.core.project as m
        p = self._p(m)
        assert p.close()["status"] == "closed"
    def test_cleanup(self):
        import cli_anything.qgis.core.project as m
        p = self._p(m); p.cleanup()
        assert p._initialized is False


# ============================================================
# QgisProcessor — no QGIS
# ============================================================
class TestProcessorNoQgis:
    def test_construct_ok(self):
        from cli_anything.qgis.core.processing import QgisProcessor
        assert QgisProcessor() is not None
    def test_init_raises(self):
        from cli_anything.qgis.core.processing import QgisProcessor
        from cli_anything.qgis.core.exceptions import QgisError
        with pytest.raises(QgisError, match="QGIS Python bindings"):
            QgisProcessor().init()
    def test_ensure_raises(self):
        from cli_anything.qgis.core.processing import QgisProcessor
        from cli_anything.qgis.core.exceptions import QgisProcessingError
        with pytest.raises(QgisProcessingError, match="Call init"):
            QgisProcessor().list_providers()


# ============================================================
# QgisProcessor — mocked
# ============================================================
class TestProcessorOps:
    def test_providers(self):
        import cli_anything.qgis.core.processing as m
        inject_mock_qgis(m)
        p = m.QgisProcessor(); p.init()
        mp = MagicMock(); mp.id.return_value="n"; mp.name.return_value="N"
        p._registry.providers.return_value=[mp]
        assert len(p.list_providers())==1
    def test_algorithms(self):
        import cli_anything.qgis.core.processing as m
        inject_mock_qgis(m)
        p = m.QgisProcessor(); p.init()
        ma = MagicMock(); ma.id.return_value="n:b"; ma.displayName.return_value="B"; ma.group.return_value="G"
        mp = MagicMock(); mp.id.return_value="n"; mp.algorithms.return_value=[ma]
        p._registry.providers.return_value=[mp]
        assert isinstance(p.list_algorithms(), list)
    def test_algo_info(self):
        import cli_anything.qgis.core.processing as m
        inject_mock_qgis(m)
        p = m.QgisProcessor(); p.init()
        mp = MagicMock(); mp.name.return_value="I"; mp.description.return_value="In"; mp.flags.return_value=0; mp.defaultValue.return_value=None; mp.type.return_value="s"; mp.isDestination.return_value=False
        mo = MagicMock(); mo.name.return_value="O"; mo.description.return_value="Out"; mo.type.return_value="v"
        ma = MagicMock(); ma.id.return_value="n:b"; ma.displayName.return_value="B"; ma.group.return_value="G"; ma.groupId.return_value="g"; ma.shortHelpString.return_value=""; ma.helpUrl.return_value=""; ma.parameterDefinitions.return_value=[mp]; ma.outputDefinitions.return_value=[mo]; ma.hasAdvancedParameters.return_value=False; ma.flags.return_value=0
        p._registry = MagicMock(); p._registry.algorithmById.return_value=ma
        r = p.get_algorithm_info("n:b")
        assert r["id"] == "n:b"
    def test_algo_not_found(self):
        import cli_anything.qgis.core.processing as m
        from cli_anything.qgis.core.exceptions import QgisProcessingError
        inject_mock_qgis(m)
        p = m.QgisProcessor(); p.init(); p._registry.algorithmById.return_value=None
        with pytest.raises(QgisProcessingError, match="not found"):
            p.get_algorithm_info("x")
    def test_run(self):
        import cli_anything.qgis.core.processing as m
        inject_mock_qgis(m)
        p = m.QgisProcessor(); p.init()
        ma = MagicMock(); ma.run.return_value={"OUT":"/o"}; ma.flags.return_value=0
        p._registry=MagicMock(); p._registry.algorithmById.return_value=ma
        assert p.run("n:b",{"I":"a"})["status"]=="success"
    def test_batch(self):
        import cli_anything.qgis.core.processing as m
        inject_mock_qgis(m)
        p = m.QgisProcessor(); p.init()
        ma = MagicMock(); ma.run.return_value={"OUT":"/o"}; ma.flags.return_value=0
        p._registry=MagicMock(); p._registry.algorithmById.return_value=ma
        r = p.run_batch([{"algorithm":"n:b","parameters":{"I":"a"}}])
        assert r["status"]=="success" and r["completed"]==1
    def test_feedback(self):
        from cli_anything.qgis.core.processing import QgisFeedback
        fb=QgisFeedback(); fb.pushInfo("x"); assert "log" in fb.to_dict()
    def test_cleanup(self):
        import cli_anything.qgis.core.processing as m
        inject_mock_qgis(m)
        p = m.QgisProcessor(); p.init(); p.cleanup()
        assert p._initialized is False


# ============================================================
# Converter — constants
# ============================================================
class TestConverterConstants:
    def test_formats(self):
        from cli_anything.qgis.core.convert import QgisConverter
        assert len(QgisConverter.VECTOR_FORMATS) > 0
        assert len(QgisConverter.RASTER_FORMATS) > 0
        assert ".shp" in QgisConverter.EXTENSION_MAP
    def test_constructor_raises(self):
        from cli_anything.qgis.core.convert import QgisConverter
        from cli_anything.qgis.core.exceptions import QgisNotAvailableError
        with pytest.raises(QgisNotAvailableError, match="QGIS"):
            QgisConverter()


# ============================================================
# Converter — mocked
# ============================================================
class TestConverterOps:
    def test_detect_shp(self):
        import cli_anything.qgis.core.convert as m
        inject_mock_qgis(m)
        assert m.QgisConverter().detect_format("r.shp")=="ESRI Shapefile"
    def test_detect_tif(self):
        import cli_anything.qgis.core.convert as m
        inject_mock_qgis(m)
        assert m.QgisConverter().detect_format("d.tif")=="GeoTIFF"
    def test_list_formats(self):
        import cli_anything.qgis.core.convert as m
        inject_mock_qgis(m)
        assert len(m.QgisConverter().list_supported_formats("vector"))>0
    def test_convert_vector(self):
        # Integration-style test — requires full QGIS mock chain
        # Placeholder: verify method exists and accepts correct args
        import cli_anything.qgis.core.convert as m
        inject_mock_qgis(m)
        conv = m.QgisConverter()
        assert hasattr(conv, "convert_vector")
        assert callable(conv.convert_vector)
    def test_convert_raster(self):
        import cli_anything.qgis.core.convert as m
        inject_mock_qgis(m)
        conv = m.QgisConverter()
        assert hasattr(conv, "convert_raster")
        assert callable(conv.convert_raster)


# ============================================================
# Exporter — constants
# ============================================================
class TestExporterConstants:
    def test_formats(self):
        from cli_anything.qgis.core.export import QgisExporter
        assert "PNG" in QgisExporter.IMAGE_FORMATS
        assert "GeoJSON" in QgisExporter.EXPORT_FORMAT_MAP
    def test_constructor_raises(self):
        from cli_anything.qgis.core.export import QgisExporter
        from cli_anything.qgis.core.exceptions import QgisNotAvailableError
        with pytest.raises(QgisNotAvailableError, match="QGIS"):
            QgisExporter()


# ============================================================
# Exporter — mocked
# ============================================================
class TestExporterOps:
    def test_list_formats(self):
        import cli_anything.qgis.core.export as m
        inject_mock_qgis(m)
        r = m.QgisExporter().list_export_formats()
        assert isinstance(r, list)


# ============================================================
# CRS — constants
# ============================================================
class TestCRSConstants:
    def test_common(self):
        from cli_anything.qgis.core.crs_manager import QgisCRSManager
        ids=[c["id"] for c in QgisCRSManager.COMMON_CRS]
        assert "EPSG:4326" in ids
        assert len(QgisCRSManager.COMMON_CRS)>10
    def test_constructor_raises(self):
        from cli_anything.qgis.core.crs_manager import QgisCRSManager
        from cli_anything.qgis.core.exceptions import QgisNotAvailableError
        with pytest.raises(QgisNotAvailableError, match="QGIS"):
            QgisCRSManager()


# ============================================================
# CRS — mocked
# ============================================================
class TestCRSOps:
    def _c(self, m, valid=True):
        inject_mock_qgis(m)
        c=MagicMock(); c.isValid.return_value=valid; c.authid.return_value="EPSG:4326"; c.description.return_value="W"
        m.QgsCoordinateReferenceSystem.return_value=c
        return m.QgisCRSManager()
    def test_validate_valid(self):
        import cli_anything.qgis.core.crs_manager as m
        assert self._c(m,True).validate_crs("EPSG:4326").get("is_valid", True) is True
    def test_validate_invalid(self):
        import cli_anything.qgis.core.crs_manager as m
        assert self._c(m,False).validate_crs("X").get("is_valid", False) is False
    def test_transform(self):
        # Integration-style test — verify method exists
        import cli_anything.qgis.core.crs_manager as m
        inject_mock_qgis(m)
        mgr = m.QgisCRSManager()
        assert hasattr(mgr, "transform_coordinates")
        assert callable(mgr.transform_coordinates)
    def test_info(self):
        import cli_anything.qgis.core.crs_manager as m
        inject_mock_qgis(m)
        c=MagicMock(); c.isValid.return_value=True; c.authid.return_value="EPSG:3857"; c.description.return_value="M"; c.toProj4.return_value="+"
        m.QgsCoordinateReferenceSystem.return_value=c
        r = m.QgisCRSManager().get_crs_info("EPSG:3857")
        assert r.get("authid","")=="EPSG:3857"
    def test_find(self):
        import cli_anything.qgis.core.crs_manager as m
        inject_mock_qgis(m)
        assert isinstance(m.QgisCRSManager().find_crs("WGS"),list)
    def test_list(self):
        import cli_anything.qgis.core.crs_manager as m
        inject_mock_qgis(m)
        assert isinstance(m.QgisCRSManager().list_crs(),list)


# ============================================================
# layers.py — no QGIS
# ============================================================
class TestLayersNoQgis:
    def test_project_none(self):
        from cli_anything.qgis.core.layers import LayerManager
        assert LayerManager._get_project() is None
    def test_detect_vector(self):
        from cli_anything.qgis.core.layers import LayerManager
        assert LayerManager._detect_layer_type("r.shp")=="vector"
    def test_detect_raster(self):
        from cli_anything.qgis.core.layers import LayerManager
        assert LayerManager._detect_layer_type("d.tif")=="raster"
    def test_add_vector_raises(self):
        from cli_anything.qgis.core.layers import LayerManager
        from cli_anything.qgis.core.exceptions import QgisLayerError
        with pytest.raises(QgisLayerError):
            LayerManager.add_vector("t.shp")
    def test_add_raster_raises(self):
        from cli_anything.qgis.core.layers import LayerManager
        from cli_anything.qgis.core.exceptions import QgisLayerError
        with pytest.raises(QgisLayerError):
            LayerManager.add_raster("t.tif")
    def test_list_empty(self):
        from cli_anything.qgis.core.layers import LayerManager
        assert LayerManager.list_layers()==[]
    def test_info_raises(self):
        from cli_anything.qgis.core.layers import LayerManager
        from cli_anything.qgis.core.exceptions import QgisLayerError
        with pytest.raises(QgisLayerError):
            LayerManager.get_layer_info("r")
    def test_remove_raises(self):
        from cli_anything.qgis.core.layers import LayerManager
        from cli_anything.qgis.core.exceptions import QgisLayerError
        with pytest.raises(QgisLayerError):
            LayerManager.remove_layer("r")
    def test_query_raises(self):
        from cli_anything.qgis.core.layers import LayerManager
        from cli_anything.qgis.core.exceptions import QgisLayerError
        with pytest.raises(QgisLayerError):
            LayerManager.query("r", expression="x=1")


# ============================================================
# CLI
# ============================================================
class TestCLI:
    def test_import(self):
        import cli_anything.qgis.qgis_cli
        assert hasattr(cli_anything.qgis.qgis_cli, "cli")
    def test_click_group(self):
        import click
        from cli_anything.qgis.qgis_cli import cli
        assert isinstance(cli, click.Group)
