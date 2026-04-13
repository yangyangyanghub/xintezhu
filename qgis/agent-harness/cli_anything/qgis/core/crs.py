"""QGIS 坐标系（CRS）管理模块。

封装 QgsCoordinateReferenceSystem 的核心操作，支持坐标系查询、检索、转换等。
"""
from typing import Dict, List, Optional, Any

from cli_anything.qgis.core.exceptions import QgisError, QgisCRSError

# 延迟导入 QGIS
try:
    from qgis.core import (
        QgsCoordinateReferenceSystem,
        QgsCoordinateTransform,
        QgsProject,
    )
    QGIS_AVAILABLE = True
except ImportError:
    QGIS_AVAILABLE = False


class CrsManager:
    """QGIS 坐标系管理器。

    提供 CRS 查询、检索、转换等功能。
    所有方法返回值均为 JSON 可序列化的 dict 或 list。

    用法:
        crs_info = CrsManager.get_crs_info("EPSG:4326")
        results = CrsManager.list_crs(filter_text="WGS")
    """

    @staticmethod
    def _parse_crs_id(crs_id: str) -> str:
        """标准化 CRS ID 字符串。

        Args:
            crs_id: 用户输入的 CRS ID，如 "4326", "EPSG:4326"。

        Returns:
            标准化后的 CRS ID，如 "EPSG:4326"。
        """
        crs_id = str(crs_id).strip()
        if crs_id.upper().startswith("EPSG:"):
            epsg_code = crs_id.split(":")[1].strip()
            return f"EPSG:{epsg_code}"
        # 尝试纯数字
        try:
            code = int(crs_id)
            return f"EPSG:{code}"
        except ValueError:
            return crs_id

    @classmethod
    def get_crs_info(cls, crs_id: str,
                     as_json: bool = False) -> Dict[str, Any]:
        """获取指定 CRS 的详细信息。

        Args:
            crs_id: CRS ID，如 "EPSG:4326"。
            as_json: 是否返回 JSON 友好格式。

        Returns:
            包含 CRS 详细信息的 dict。

        Raises:
            QgisCRSError: CRS 不存在时抛出。
        """
        if not QGIS_AVAILABLE:
            return {
                "status": "qgis_not_available",
                "crs_id": crs_id,
                "message": "QGIS Python 绑定不可用，无法查询 CRS 详情。",
            }

        std_id = cls._parse_crs_id(crs_id)
        crs = QgsCoordinateReferenceSystem(std_id)

        if not crs.isValid():
            raise QgisCRSError(f"无效的 CRS: {crs_id}")

        return {
            "status": "ok",
            "authid": crs.authid(),
            "description": crs.description(),
            "type": crs.type(),
            "is_geographic": crs.isGeographic(),
            "units": crs.mapUnits(),
            "units_name": crs.mapUnits() if hasattr(crs, "mapUnits") else None,
            "wkt": crs.toWkt() if hasattr(crs, "toWkt") else None,
            "proj4": crs.toProj4() if hasattr(crs, "toProj4") else None,
            "srid": crs.postgisSrid() if hasattr(crs, "postgisSrid") else None,
        }

    @classmethod
    def list_crs(cls, filter_text: Optional[str] = None,
                 limit: int = 100,
                 as_json: bool = False) -> List[Dict[str, Any]]:
        """列出可用的 CRS 定义。

        注意：QGIS CRS 数据库包含 7000+ 条记录。建议使用 filter_text 缩小范围。

        Args:
            filter_text: 可选，按名称或 EPSG 编码过滤。
            limit: 最大返回条数，默认 100。
            as_json: 是否返回 JSON 友好格式。

        Returns:
            CRS 信息列表。
        """
        if not QGIS_AVAILABLE:
            return [{
                "status": "qgis_not_available",
                "message": "QGIS 不可用。",
            }]

        results = []

        # 如果提供了过滤文本，使用 QGIS 的 match 功能
        if filter_text:
            # 先尝试作为 EPSG 代码直接查找
            try:
                crs = QgsCoordinateReferenceSystem.fromEpsgId(int(filter_text))
                if crs.isValid():
                    results.append({
                        "authid": crs.authid(),
                        "description": crs.description(),
                        "is_geographic": crs.isGeographic(),
                    })
                    return results
            except (ValueError, TypeError):
                pass

        # 遍历常见 EPSG 代码范围
        # QGIS 的 QgsCoordinateReferenceSystem 没有直接的列表 API
        # 我们通过常见 EPSG 代码范围来收集
        common_epsg_ranges = [
            (32601, 32660),  # UTM North
            (32701, 32760),  # UTM South
            (2000, 2200),    # Various national grids
            (3000, 3300),    # European grids
            (4000, 4999),    # Geographic CRS (WGS84, NAD83, etc.)
            (20000, 21000),  # Various projected CRS
            (21000, 22000),  # Various projected CRS
        ]

        for start, end in common_epsg_ranges:
            for epsg in range(start, end, 5):  # 步进 5 以减少数量
                try:
                    crs = QgsCoordinateReferenceSystem.fromEpsgId(epsg)
                    if crs.isValid():
                        desc = crs.description()
                        if filter_text and filter_text.lower() not in desc.lower():
                            continue
                        results.append({
                            "authid": crs.authid(),
                            "description": desc,
                            "is_geographic": crs.isGeographic(),
                        })
                except Exception:
                    continue

                if len(results) >= limit:
                    break

            if len(results) >= limit:
                break

        # 添加最常见的手动 CRS
        well_known = [
            3857,  # Web Mercator
            4326,  # WGS 84
            2361,  # Beijing 1954
            4490,  # CGCS2000
            4547,  # CGCS2000 / 3-degree Gauss-Kruger CM 117E
        ]
        for epsg in well_known:
            try:
                crs = QgsCoordinateReferenceSystem.fromEpsgId(epsg)
                if crs.isValid():
                    desc = crs.description()
                    if filter_text and filter_text.lower() not in desc.lower():
                        continue
                    entry = {
                        "authid": crs.authid(),
                        "description": desc,
                        "is_geographic": crs.isGeographic(),
                    }
                    # 避免重复
                    if entry not in results:
                        results.insert(0, entry)
            except Exception:
                continue

        return results[:limit]

    @classmethod
    def detect_crs(cls, layer_path: str) -> Dict[str, Any]:
        """检测图层文件的 CRS。

        Args:
            layer_path: 图层文件路径。

        Returns:
            包含 CRS 信息的 dict。

        Raises:
            QgisCRSError: 文件不存在或无法检测时抛出。
        """
        if not QGIS_AVAILABLE:
            raise QgisCRSError("QGIS 不可用。")

        import os
        if not os.path.exists(layer_path):
            raise QgisCRSError(f"文件不存在: {layer_path}")

        # 尝试从矢量图层检测
        try:
            from qgis.core import QgsVectorLayer
            vlayer = QgsVectorLayer(layer_path, "temp", "ogr")
            if vlayer.isValid():
                crs = vlayer.crs()
                if crs.isValid():
                    return {
                        "status": "detected",
                        "authid": crs.authid(),
                        "description": crs.description(),
                        "source": layer_path,
                    }
        except Exception:
            pass

        # 尝试从栅格图层检测
        try:
            from qgis.core import QgsRasterLayer
            rlayer = QgsRasterLayer(layer_path, "temp")
            if rlayer.isValid():
                crs = rlayer.crs()
                if crs.isValid():
                    return {
                        "status": "detected",
                        "authid": crs.authid(),
                        "description": crs.description(),
                        "source": layer_path,
                    }
        except Exception:
            pass

        raise QgisCRSError(f"无法检测文件的 CRS: {layer_path}")

    @classmethod
    def transform(cls, input_path: str, output_path: str,
                  target_crs: str) -> Dict[str, Any]:
        """将图层转换到目标 CRS。

        Args:
            input_path: 输入文件路径。
            output_path: 输出文件路径。
            target_crs: 目标 CRS ID，如 "EPSG:4326"。

        Returns:
            包含转换状态的 dict。

        Raises:
            QgisCRSError: 转换失败时抛出。
        """
        if not QGIS_AVAILABLE:
            raise QgisCRSError("QGIS 不可用。")

        target = cls._parse_crs_id(target_crs)
        target_crs_obj = QgsCoordinateReferenceSystem(target)
        if not target_crs_obj.isValid():
            raise QgisCRSError(f"无效的目标 CRS: {target_crs}")

        # 使用 processing 进行重投影
        try:
            from qgis.core import (
                QgsVectorLayer,
                QgsProcessingContext,
                QgsProcessingFeedback,
                QgsApplication,
            )

            # 初始化 QGIS（如未初始化）
            try:
                QgsApplication.processingRegistry()
            except Exception:
                QgsApplication([], False)
                QgsApplication.initQgis()

            vlayer = QgsVectorLayer(input_path, "temp", "ogr")
            if not vlayer.isValid():
                raise QgisCRSError(f"无效的输入图层: {input_path}")

            from qgis import processing
            result = processing.run(
                "native:reprojectlayer",
                {
                    "INPUT": input_path,
                    "TARGET_CRS": target,
                    "OUTPUT": output_path,
                },
                context=QgsProcessingContext(),
                feedback=QgsProcessingFeedback(),
            )

            return {
                "status": "transformed",
                "source": input_path,
                "output": output_path,
                "target_crs": target,
            }

        except Exception as e:
            raise QgisCRSError(f"CRS 转换失败: {e}")
