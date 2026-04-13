"""QGIS 项目管理模块。

封装 QgsProject 的核心操作，支持无头模式运行。
"""

import os
from typing import Dict, List, Optional, Any

from cli_anything.qgis.core.exceptions import QgisError

# 延迟导入 QGIS，避免在未安装环境中报错
try:
    from qgis.core import (
        QgsApplication,
        QgsProject,
        QgsVectorLayer,
        QgsRasterLayer,
        QgsCoordinateReferenceSystem,
        QgsRectangle,
    )
    QGIS_AVAILABLE = True
except ImportError:
    QGIS_AVAILABLE = False


class QgisProject:
    """QGIS 项目封装类。

    提供项目的创建、加载、保存、图层管理等核心功能。
    所有方法返回值均为 JSON 可序列化的 dict。

    用法:
        proj = QgisProject()
        proj.init()  # 初始化 QGIS 应用
        proj.create()
        proj.add_layer("data.shp")
        proj.save("output.qgz")
        proj.cleanup()
    """

    def __init__(self, gui: bool = False):
        """初始化项目实例。

        Args:
            gui: 是否启用 GUI 模式，默认 False（无头模式）。
        """
        self._initialized = False
        self._gui = gui
        self._project: Optional["QgsProject"] = None

    def init(self) -> Dict[str, Any]:
        """初始化 QgsApplication。

        必须在调用任何其他方法之前执行。

        Returns:
            包含初始化状态的 dict。

        Raises:
            QgisError: QGIS 不可用时抛出。
        """
        if not QGIS_AVAILABLE:
            raise QgisError(
                "QGIS Python bindings not found. "
                "Ensure QGIS is installed and PYTHONPATH includes qgis."
            )

        if self._initialized:
            return {"status": "already_initialized"}

        QgsApplication([], self._gui)
        QgsApplication.initQgis()
        self._initialized = True
        self._project = QgsProject.instance()

        return {"status": "initialized", "gui_mode": self._gui}

    def _ensure_initialized(self):
        """确保 QGIS 已初始化，否则抛出异常。"""
        if not self._initialized:
            raise QgisError("QgsApplication not initialized. Call init() first.")

    def create(self) -> Dict[str, Any]:
        """创建一个新的空项目。

        Returns:
            包含项目状态的 dict。
        """
        self._ensure_initialized()
        self._project.clear()
        return {"status": "created", "path": None}

    def load(self, path: str) -> Dict[str, Any]:
        """加载现有的 .qgz/.qgs 项目文件。

        Args:
            path: 项目文件路径。

        Returns:
            包含加载状态和项目信息的 dict。

        Raises:
            QgisError: 文件不存在或加载失败时抛出。
        """
        self._ensure_initialized()

        if not os.path.exists(path):
            raise QgisError(f"Project file not found: {path}")

        ok = self._project.read(path)
        if not ok:
            raise QgisError(f"Failed to read project file: {path}")

        return {
            "status": "loaded",
            "path": os.path.abspath(path),
            **self.info(),
        }

    def save(self, path: Optional[str] = None) -> Dict[str, Any]:
        """保存当前项目。

        Args:
            path: 保存路径，若为 None 则覆盖原文件。

        Returns:
            包含保存状态的 dict。

        Raises:
            QgisError: 保存失败时抛出。
        """
        self._ensure_initialized()

        target = path or self._project.fileName()
        if not target:
            raise QgisError("No path specified and project has no existing file.")

        ok = self._project.write(target)
        if not ok:
            raise QgisError(f"Failed to save project: {target}")

        return {"status": "saved", "path": os.path.abspath(target)}

    def info(self) -> Dict[str, Any]:
        """返回项目基本信息。

        Returns:
            包含标题、CRS、图层数量、范围等信息的 dict。
        """
        self._ensure_initialized()

        crs = self._project.crs()
        extent = self._project.extent()

        return {
            "title": self._project.title(),
            "path": self._project.fileName() or None,
            "crs": crs.authid() if crs.isValid() else None,
            "crs_description": crs.description() if crs.isValid() else None,
            "layers_count": self._project.count(),
            "extent": {
                "xmin": extent.xMinimum(),
                "ymin": extent.yMinimum(),
                "xmax": extent.xMaximum(),
                "ymax": extent.yMaximum(),
            }
            if extent is not None and not extent.isNull()
            else None,
            "is_dirty": self._project.isDirty(),
        }

    def add_layer(self, path: str, name: Optional[str] = None) -> Dict[str, Any]:
        """向项目添加矢量或栅格图层。

        自动根据文件扩展名判断图层类型。

        Args:
            path: 数据文件路径（.shp, .geojson, .tif 等）。
            name: 图层显示名称，默认使用文件名。

        Returns:
            包含添加状态的 dict。

        Raises:
            QgisError: 文件不存在或图层无效时抛出。
        """
        self._ensure_initialized()

        if not os.path.exists(path):
            raise QgisError(f"Layer file not found: {path}")

        layer_name = name or os.path.splitext(os.path.basename(path))[0]

        # 按扩展名判断图层类型
        ext = os.path.splitext(path)[1].lower()
        raster_exts = {".tif", ".tiff", ".img", ".asc", ".dem", ".vrt", ".png", ".jpg", ".jpeg"}

        if ext in raster_exts:
            layer = QgsRasterLayer(path, layer_name)
        else:
            layer = QgsVectorLayer(path, layer_name, "ogr")

        if not layer.isValid():
            raise QgisError(f"Invalid layer: {path}")

        QgsProject.instance().addMapLayer(layer)

        return {
            "status": "added",
            "name": layer.name(),
            "id": layer.id(),
            "type": "raster" if ext in raster_exts else "vector",
            "crs": layer.crs().authid() if layer.crs().isValid() else None,
        }

    def list_layers(self) -> List[Dict[str, Any]]:
        """列出项目中所有图层。

        Returns:
            图层信息列表，每个元素为包含名称、类型、CRS、要素数的 dict。
        """
        self._ensure_initialized()

        layers = []
        for layer in self._project.mapLayers().values():
            layer_info = {
                "id": layer.id(),
                "name": layer.name(),
                "type": layer.type(),  # 0=Vector, 1=Raster, 2=Plugin, 3=Mesh, 4=VectorTile, 5=PointCloud, 6=Annotation, 7=Group
                "crs": layer.crs().authid() if layer.crs().isValid() else None,
                "is_valid": layer.isValid(),
            }

            # 补充矢量图层特有信息
            if hasattr(layer, "featureCount"):
                layer_info["feature_count"] = layer.featureCount()

            # 补充栅格图层特有信息
            if hasattr(layer, "width") and hasattr(layer, "height"):
                layer_info["width"] = layer.width()
                layer_info["height"] = layer.height()

            layers.append(layer_info)

        return layers

    def get_layer(self, name: str) -> Optional[Dict[str, Any]]:
        """按名称获取图层。

        Args:
            name: 图层名称。

        Returns:
            图层信息的 dict，不存在时返回 None。
        """
        self._ensure_initialized()

        layer = self._project.mapLayersByName(name)
        if not layer:
            return None

        layer = layer[0]
        return {
            "id": layer.id(),
            "name": layer.name(),
            "type": layer.type(),
            "crs": layer.crs().authid() if layer.crs().isValid() else None,
            "is_valid": layer.isValid(),
            "source": layer.source(),
        }

    def remove_layer(self, layer_id: str) -> Dict[str, Any]:
        """按 ID 移除图层。

        Args:
            layer_id: 图层的唯一标识符。

        Returns:
            包含移除状态的 dict。
        """
        self._ensure_initialized()

        layers = self._project.mapLayers()
        if layer_id not in layers:
            raise QgisError(f"Layer not found: {layer_id}")

        self._project.removeMapLayer(layer_id)
        return {"status": "removed", "id": layer_id}

    def close(self) -> Dict[str, Any]:
        """清空当前项目（不删除文件）。

        Returns:
            包含关闭状态的 dict。
        """
        self._ensure_initialized()
        self._project.clear()
        return {"status": "closed"}

    def cleanup(self):
        """退出 QGIS 应用，释放资源。

        应在程序结束前调用。
        """
        if self._initialized:
            QgsApplication.exitQgis()
            self._initialized = False
            self._project = None
