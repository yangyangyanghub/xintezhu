"""QGIS 图层管理模块。

封装 QgsVectorLayer 和 QgsRasterLayer 的核心操作，支持图层查询、过滤、属性管理等。
"""
import os
from typing import Dict, List, Optional, Any

from cli_anything.qgis.core.exceptions import QgisError, QgisLayerError

# 延迟导入 QGIS，避免在未安装环境中报错
try:
    from qgis.core import (
        QgsVectorLayer,
        QgsRasterLayer,
        QgsFeatureRequest,
        QgsExpression,
        QgsProject,
    )
    QGIS_AVAILABLE = True
except ImportError:
    QGIS_AVAILABLE = False


class LayerManager:
    """QGIS 图层管理器。

    提供图层的添加、删除、查询、属性操作等功能。
    所有方法返回值均为 JSON 可序列化的 dict 或 list。

    用法:
        mgr = LayerManager()
        mgr.add_vector("data.shp")
        layers = mgr.list_layers()
    """

    @staticmethod
    def _get_project():
        """获取当前 QgsProject 实例。

        Returns:
            QgsProject 实例或 None。
        """
        if not QGIS_AVAILABLE:
            return None
        try:
            return QgsProject.instance()
        except Exception:
            return None

    @staticmethod
    def _detect_layer_type(path: str) -> str:
        """根据文件扩展名判断图层类型。

        Args:
            path: 文件路径。

        Returns:
            'vector' 或 'raster'。
        """
        ext = os.path.splitext(path)[1].lower()
        raster_exts = {
            ".tif", ".tiff", ".img", ".asc", ".dem", ".vrt",
            ".png", ".jpg", ".jpeg", ".bmp", ".gif", ".jp2",
        }
        return "raster" if ext in raster_exts else "vector"

    @classmethod
    def add_vector(cls, path: str, name: Optional[str] = None,
                   provider: str = "ogr") -> Dict[str, Any]:
        """添加矢量图层到当前项目。

        Args:
            path: 矢量文件路径（.shp, .geojson, .gpkg 等）。
            name: 图层显示名称，默认使用文件名。
            provider: 数据提供者，默认 "ogr"。

        Returns:
            包含添加状态的 dict。

        Raises:
            QgisLayerError: 文件不存在或图层无效时抛出。
        """
        project = cls._get_project()
        if project is None:
            raise QgisLayerError("QGIS 不可用，无法添加矢量图层。")

        if not os.path.exists(path):
            raise QgisLayerError(f"文件不存在: {path}")

        layer_name = name or os.path.splitext(os.path.basename(path))[0]
        uri = f"{path}" if provider == "ogr" else path
        layer = QgsVectorLayer(uri, layer_name, provider)

        if not layer.isValid():
            raise QgisLayerError(f"无效的矢量图层: {path}")

        project.addMapLayer(layer)

        return {
            "status": "added",
            "name": layer.name(),
            "id": layer.id(),
            "type": "vector",
            "crs": layer.crs().authid() if layer.crs().isValid() else None,
            "feature_count": layer.featureCount(),
            "provider": provider,
            "source": path,
        }

    @classmethod
    def add_raster(cls, path: str, name: Optional[str] = None) -> Dict[str, Any]:
        """添加栅格图层到当前项目。

        Args:
            path: 栅格文件路径（.tif, .img, .png 等）。
            name: 图层显示名称，默认使用文件名。

        Returns:
            包含添加状态的 dict。

        Raises:
            QgisLayerError: 文件不存在或图层无效时抛出。
        """
        project = cls._get_project()
        if project is None:
            raise QgisLayerError("QGIS 不可用，无法添加栅格图层。")

        if not os.path.exists(path):
            raise QgisLayerError(f"文件不存在: {path}")

        layer_name = name or os.path.splitext(os.path.basename(path))[0]
        layer = QgsRasterLayer(path, layer_name)

        if not layer.isValid():
            raise QgisLayerError(f"无效的栅格图层: {path}")

        project.addMapLayer(layer)

        return {
            "status": "added",
            "name": layer.name(),
            "id": layer.id(),
            "type": "raster",
            "crs": layer.crs().authid() if layer.crs().isValid() else None,
            "width": layer.width(),
            "height": layer.height(),
            "band_count": layer.bandCount(),
            "source": path,
        }

    @classmethod
    def add_layer(cls, path: str, name: Optional[str] = None) -> Dict[str, Any]:
        """智能添加矢量或栅格图层。

        根据文件扩展名自动判断图层类型。

        Args:
            path: 文件路径。
            name: 图层显示名称。

        Returns:
            包含添加状态的 dict。
        """
        layer_type = cls._detect_layer_type(path)
        if layer_type == "raster":
            return cls.add_raster(path, name=name)
        return cls.add_vector(path, name=name)

    @classmethod
    def list_layers(cls) -> List[Dict[str, Any]]:
        """列出当前项目中的所有图层。

        Returns:
            图层信息列表。如果 QGIS 不可用，返回空列表。
        """
        project = cls._get_project()
        if project is None:
            return []

        layers = []
        for layer in project.mapLayers().values():
            layer_info = {
                "id": layer.id(),
                "name": layer.name(),
                "type": "raster" if hasattr(layer, "bandCount") else "vector",
                "crs": layer.crs().authid() if layer.crs().isValid() else None,
                "is_valid": layer.isValid(),
                "source": layer.source(),
            }

            if hasattr(layer, "featureCount"):
                layer_info["feature_count"] = layer.featureCount()
            if hasattr(layer, "bandCount"):
                layer_info["band_count"] = layer.bandCount()
                layer_info["width"] = layer.width()
                layer_info["height"] = layer.height()

            layers.append(layer_info)

        return layers

    @classmethod
    def get_layer_info(cls, name: str) -> Dict[str, Any]:
        """获取指定图层的详细信息。

        Args:
            name: 图层名称。

        Returns:
            图层详细信息 dict。

        Raises:
            QgisLayerError: 图层不存在时抛出。
        """
        project = cls._get_project()
        if project is None:
            raise QgisLayerError("QGIS 不可用。")

        layers = project.mapLayersByName(name)
        if not layers:
            raise QgisLayerError(f"图层不存在: {name}")

        layer = layers[0]
        info = {
            "id": layer.id(),
            "name": layer.name(),
            "type": "raster" if hasattr(layer, "bandCount") else "vector",
            "crs": layer.crs().authid() if layer.crs().isValid() else None,
            "is_valid": layer.isValid(),
            "source": layer.source(),
            "extent": {
                "xmin": layer.extent().xMinimum(),
                "ymin": layer.extent().yMinimum(),
                "xmax": layer.extent().xMaximum(),
                "ymax": layer.extent().yMaximum(),
            },
        }

        if hasattr(layer, "featureCount"):
            info["feature_count"] = layer.featureCount()
            info["geometry_type"] = layer.geometryType()
            info["fields"] = [
                {
                    "name": field.name(),
                    "type": field.typeName(),
                    "length": field.length(),
                    "precision": field.precision(),
                }
                for field in layer.fields()
            ]
        if hasattr(layer, "bandCount"):
            info["band_count"] = layer.bandCount()
            info["width"] = layer.width()
            info["height"] = layer.height()

        return info

    @classmethod
    def remove_layer(cls, name: str) -> Dict[str, Any]:
        """移除指定图层。

        Args:
            name: 图层名称。

        Returns:
            包含移除状态的 dict。

        Raises:
            QgisLayerError: 图层不存在时抛出。
        """
        project = cls._get_project()
        if project is None:
            raise QgisLayerError("QGIS 不可用。")

        layers = project.mapLayersByName(name)
        if not layers:
            raise QgisLayerError(f"图层不存在: {name}")

        layer_id = layers[0].id()
        project.removeMapLayer(layer_id)

        return {"status": "removed", "name": name, "id": layer_id}

    @classmethod
    def query(cls, name: str, expression: Optional[str] = None,
              limit: Optional[int] = None) -> Dict[str, Any]:
        """查询图层要素。

        Args:
            name: 图层名称。
            expression: 过滤表达式（QGIS 表达式语法）。
            limit: 最大返回要素数。

        Returns:
            包含查询结果的 dict。

        Raises:
            QgisLayerError: 图层不存在或表达式无效时抛出。
        """
        project = cls._get_project()
        if project is None:
            raise QgisLayerError("QGIS 不可用。")

        layers = project.mapLayersByName(name)
        if not layers:
            raise QgisLayerError(f"图层不存在: {name}")

        layer = layers[0]
        if not hasattr(layer, "getFeatures"):
            raise QgisLayerError(f"图层 {name} 不支持要素查询（可能是栅格图层）。")

        request = QgsFeatureRequest()
        if expression:
            expr = QgsExpression(expression)
            if not expr.isValid():
                raise QgisLayerError(f"无效的表达式: {expression} ({expr.parserErrorString()})")
            request.setFilterExpression(expression)

        if limit:
            request.setLimit(limit)

        features = []
        for feature in layer.getFeatures(request):
            feat_dict = {
                "id": feature.id(),
                "attributes": dict(zip(
                    [field.name() for field in layer.fields()],
                    list(feature.attributes()),
                )),
            }
            if layer.geometry():
                geom = layer.geometry()
                feat_dict["geometry_type"] = geom.wkbType()
            features.append(feat_dict)

        return {
            "layer": name,
            "expression": expression,
            "count": len(features),
            "features": features,
        }
