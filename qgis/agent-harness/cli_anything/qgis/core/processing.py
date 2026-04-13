"""QGIS 处理算法模块。

封装 Processing Framework，支持算法列举、信息查询和执行。
"""

import os
from typing import Dict, List, Optional, Any, Callable

from cli_anything.qgis.core.exceptions import QgisError, QgisProcessingError

# 延迟导入 QGIS
try:
    from qgis.core import (
        QgsApplication,
        QgsProcessingAlgorithm,
        QgsProcessingContext,
        QgsProcessingFeedback,
        QgsProcessingRegistry,
        QgsProject,
    )
    QGIS_AVAILABLE = True
except ImportError:
    QGIS_AVAILABLE = False
    # Fallback base class when QGIS is not available
    QgsProcessingFeedback = object


class QgisFeedback(QgsProcessingFeedback):
    """自定义反馈处理器，收集进度和日志。"""

    def __init__(self, callback: Optional[Callable] = None):
        super().__init__()
        self._progress = 0
        self._log: List[str] = []
        self._warnings: List[str] = []
        self._errors: List[str] = []
        self._callback = callback

    def setProgress(self, progress: float):
        self._progress = progress
        if self._callback:
            self._callback("progress", progress)

    def pushInfo(self, info: str):
        self._log.append(info)
        if self._callback:
            self._callback("info", info)

    def pushWarning(self, warning: str):
        self._warnings.append(warning)
        if self._callback:
            self._callback("warning", warning)

    def pushDebugInfo(self, info: str):
        self._log.append(f"[DEBUG] {info}")

    def reportError(self, error: str):
        self._errors.append(error)
        if self._callback:
            self._callback("error", error)

    def to_dict(self) -> Dict[str, Any]:
        """将反馈序列化为 dict。"""
        return {
            "progress": self._progress,
            "log": self._log,
            "warnings": self._warnings,
            "errors": self._errors,
        }


class QgisProcessor:
    """QGIS 处理算法封装类。

    提供算法列举、参数查询和执行功能。
    支持单个和批量算法执行。

    用法:
        proc = QgisProcessor()
        proc.init()
        algs = proc.list_algorithms()
        result = proc.run("native:buffer", {"INPUT": "...", "DISTANCE": 100})
        proc.cleanup()
    """

    def __init__(self):
        self._initialized = False
        self._registry: Optional[QgsProcessingRegistry] = None

    def init(self) -> Dict[str, Any]:
        """初始化处理框架。

        确保 QgsApplication 已初始化后调用。

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

        self._registry = QgsApplication.processingRegistry()
        self._initialized = True

        return {
            "status": "initialized",
            "providers_count": len(self._registry.providers()),
        }

    def _ensure_initialized(self):
        if not self._initialized:
            raise QgisProcessingError(
                "Processing registry not initialized. Call init() first."
            )

    def list_providers(self) -> List[Dict[str, Any]]:
        """列出所有可用的处理提供者。

        Returns:
            提供者列表，每个包含 ID、名称、算法数量。
        """
        self._ensure_initialized()

        providers = []
        for provider in self._registry.providers():
            alg_count = len(provider.algorithms())
            providers.append({
                "id": provider.id(),
                "name": provider.displayName(),
                "algorithms_count": alg_count,
                "short_description": provider.longName() if hasattr(provider, "longName") else None,
            })

        return providers

    def list_algorithms(self, provider: Optional[str] = None,
                        provider_filter: Optional[str] = None,
                        as_json: bool = False) -> List[Dict[str, Any]]:
        """列出可用的处理算法。

        Args:
            provider: 可选，按提供者 ID 过滤（如 "native", "gdal"）。
            provider_filter: 兼容性别名，同 provider。
            as_json: 是否返回 JSON 友好格式。

        Returns:
            算法列表，每个包含 ID、名称、分组、简短描述。
        """
        self._ensure_initialized()

        # Support both parameter names
        effective_provider = provider or provider_filter

        algorithms = []
        for alg in self._registry.algorithms():
            # 如果指定了 provider，进行过滤
            if effective_provider:
                alg_provider = alg.provider()
                if alg_provider is None or alg_provider.id() != effective_provider:
                    continue

            algorithms.append({
                "id": alg.id(),
                "name": alg.displayName(),
                "group": alg.group(),
                "short_description": alg.shortHelpString(),
                "provider": alg.provider().id() if alg.provider() else None,
            })

        return algorithms

    def get_algorithm_info(self, alg_id: str) -> Dict[str, Any]:
        """获取算法详细信息。

        Args:
            alg_id: 算法 ID，如 "native:buffer"。

        Returns:
            包含算法描述、参数定义、输出定义的 dict。

        Raises:
            QgisProcessingError: 算法不存在时抛出。
        """
        self._ensure_initialized()

        alg = self._registry.algorithmById(alg_id)
        if alg is None:
            raise QgisProcessingError(f"Algorithm not found: {alg_id}")

        # 获取参数信息
        params = []
        for param in alg.parameterDefinitions():
            params.append({
                "name": param.name(),
                "description": param.description(),
                "type": param.__class__.__name__,
                "is_optional": param.flags() & QgsProcessingAlgorithm.ParameterFlag.Optional,
                "is_advanced": param.flags() & QgsProcessingAlgorithm.ParameterFlag.Advanced,
                "default": param.defaultValue() if hasattr(param, "defaultValue") else None,
            })

        # 获取输出信息
        outputs = []
        for out in alg.outputDefinitions():
            outputs.append({
                "name": out.name(),
                "description": out.description(),
                "type": out.__class__.__name__,
            })

        return {
            "id": alg.id(),
            "name": alg.displayName(),
            "group": alg.group(),
            "group_id": alg.groupId(),
            "short_description": alg.shortHelpString(),
            "help_url": alg.helpUrl(),
            "parameters": params,
            "outputs": outputs,
            "has_advanced_parameters": alg.hasAdvancedParameters(),
        }

    def run(
        self,
        algorithm: str,
        parameters: Dict[str, Any],
        ellipsoid: Optional[str] = None,
        distance_unit: Optional[str] = None,
        area_unit: Optional[str] = None,
        project_path: Optional[str] = None,
        feedback_callback: Optional[Callable] = None,
        **kwargs,
    ) -> Dict[str, Any]:
        """执行单个处理算法。

        Args:
            algorithm: 算法 ID，如 "native:buffer"。
            parameters: 算法参数字典。
            ellipsoid: 椭球体名称，用于距离/面积计算。
            distance_unit: 距离单位。
            area_unit: 面积单位。
            project_path: 关联的项目文件路径。
            feedback_callback: 进度回调函数，接收 (event_type, data)。
            **kwargs: 额外参数。

        Returns:
            包含执行结果、日志、警告、错误的 dict。

        Raises:
            QgisProcessingError: 算法不存在或执行失败时抛出。
        """
        self._ensure_initialized()

        alg = self._registry.algorithmById(algorithm)
        if alg is None:
            raise QgisProcessingError(f"Algorithm not found: {algorithm}")

        # 构建处理上下文
        context = QgsProcessingContext()

        # 加载项目（如果指定）
        if project_path and os.path.exists(project_path):
            project = QgsProject.instance()
            project.read(project_path)

        # 设置椭球体和单位
        if ellipsoid:
            context.setEllipsoid(ellipsoid)

        # 创建反馈处理器
        feedback = QgisFeedback(callback=feedback_callback)

        # 执行算法
        try:
            result = alg.run(parameters, context, feedback)

            output = {
                "status": "success" if result else "completed_with_warnings",
                "algorithm": algorithm,
                "results": result if isinstance(result, dict) else {},
                "feedback": feedback.to_dict(),
            }

            if feedback._errors:
                output["status"] = "error"
                output["error"] = "Algorithm execution reported errors."

            return output

        except Exception as e:
            return {
                "status": "error",
                "algorithm": algorithm,
                "results": {},
                "feedback": feedback.to_dict(),
                "exception": str(e),
            }

    def run_batch(
        self,
        algorithm_configs: List[Dict[str, Any]],
        stop_on_error: bool = True,
    ) -> Dict[str, Any]:
        """批量执行多个算法。

        按顺序执行，前一个算法的输出可作为后一个的输入。

        Args:
            algorithm_configs: 算法配置列表，每项包含:
                - algorithm: 算法 ID
                - parameters: 参数字典
                - 其他可选参数（同 run 方法）
            stop_on_error: 遇到错误时是否停止，默认 True。

        Returns:
            包含所有算法执行结果的 dict。
        """
        self._ensure_initialized()

        results = []
        overall_status = "success"

        for i, config in enumerate(algorithm_configs):
            alg_id = config.get("algorithm")
            params = config.get("parameters", {})

            if not alg_id:
                error_result = {
                    "index": i,
                    "status": "error",
                    "error": "Missing 'algorithm' key in config.",
                }
                results.append(error_result)
                if stop_on_error:
                    break
                continue

            # 提取 run 方法的可选参数
            run_kwargs = {
                k: v
                for k, v in config.items()
                if k not in ("algorithm", "parameters")
            }

            try:
                result = self.run(alg_id, params, **run_kwargs)
                result["index"] = i
                results.append(result)

                if result.get("status") == "error":
                    overall_status = "error"
                    if stop_on_error:
                        break

            except QgisProcessingError as e:
                error_result = {
                    "index": i,
                    "algorithm": alg_id,
                    "status": "error",
                    "error": str(e),
                }
                results.append(error_result)
                overall_status = "error"
                if stop_on_error:
                    break

        return {
            "status": overall_status,
            "total": len(algorithm_configs),
            "completed": len([r for r in results if r.get("status") != "error"]),
            "failed": len([r for r in results if r.get("status") == "error"]),
            "results": results,
        }

    def cleanup(self):
        """清理处理框架资源。"""
        self._initialized = False
        self._registry = None


# Alias for CLI compatibility — class-level wrapper
class ProcessingEngine:
    """Static facade for QgisProcessor, used by the CLI module."""

    _instance = None

    @classmethod
    def _get_instance(cls):
        """Get or create the singleton QgisProcessor instance.

        Returns:
            QgisProcessor instance or None if QGIS is not available.
        """
        if not QGIS_AVAILABLE:
            return None
        if cls._instance is None:
            cls._instance = QgisProcessor()
            try:
                cls._instance.init()
            except Exception:
                cls._instance = None
        return cls._instance

    @classmethod
    def list_algorithms(cls, provider=None, provider_filter=None, as_json=False):
        instance = cls._get_instance()
        if instance is None:
            return {"status": "qgis_not_available", "message": "QGIS Python 绑定不可用，无法列出算法。"}
        return instance.list_algorithms(provider=provider or provider_filter, as_json=as_json)

    @classmethod
    def get_algorithm_info(cls, algorithm_id, as_json=False):
        instance = cls._get_instance()
        if instance is None:
            return {"status": "qgis_not_available", "message": "QGIS 不可用。"}
        return instance.get_algorithm_info(algorithm_id)

    @classmethod
    def run_algorithm(cls, algorithm_id, params, json_mode=False):
        instance = cls._get_instance()
        if instance is None:
            return {"status": "error", "message": "QGIS 不可用，无法执行算法。"}
        return instance.run(algorithm_id, params)
