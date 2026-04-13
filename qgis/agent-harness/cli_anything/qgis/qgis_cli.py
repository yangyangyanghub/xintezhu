"""QGIS CLI - 命令行接口，基于 Click 框架。

提供 QGIS 项目的创建、加载、处理、坐标系转换等功能。
支持 JSON 模式输出、交互式 Shell、优雅降级（QGIS 未安装时给出提示）。

用法示例::

    # 查看 QGIS 版本信息
    cli-anything-qgis info

    # 创建新项目
    cli-anything-qgis project create my_project.qgs

    # 以 JSON 格式列出项目图层
    cli-anything-qgis project layers --json

    # 运行处理算法
    cli-anything-qgis process run native:buffer --param INPUT=layer.shp --param DISTANCE=100

    # 进入交互式 Shell
    cli-anything-qgis shell
"""
import json
import sys

import click

from cli_anything.qgis.utils.formatters import (
    format_output,
    format_json,
    format_tree,
)


# ---------------------------------------------------------------------------
# 全局上下文 & 主 Group
# ---------------------------------------------------------------------------

@click.group()
@click.option("--json", "json_output", is_flag=True, help="输出为 JSON 格式")
@click.option("--verbose", is_flag=True, help="显示详细输出")
@click.option("--qgis-prefix", default=None, help="QGIS 安装路径")
@click.pass_context
def cli(ctx, json_output, verbose, qgis_prefix):
    """QGIS CLI - 命令行接口，用于 QGIS 项目管理和数据处理。"""
    ctx.ensure_object(dict)
    ctx.obj["json"] = json_output
    ctx.obj["verbose"] = verbose
    ctx.obj["qgis_prefix"] = qgis_prefix

    if verbose:
        click.echo("[verbose] QGIS CLI 初始化完成", err=True)


def _safe_get_core(name: str):
    """延迟导入 QGIS 核心模块，QGIS 未安装时返回 None 而不是报错。

    Args:
        name: 模块名，如 'project', 'layers', 'processing'

    Returns:
        模块对象或 None
    """
    module_map = {
        "project": "cli_anything.qgis.core.project",
        "layers": "cli_anything.qgis.core.layers",
        "processing": "cli_anything.qgis.core.processing",
        "crs": "cli_anything.qgis.core.crs",
        "export": "cli_anything.qgis.core.export",
    }
    import_path = module_map.get(name, f"cli_anything.qgis.core.{name}")
    try:
        __import__(import_path)
        return sys.modules[import_path]
    except (ImportError, ModuleNotFoundError) as e:
        click.echo(f"错误: 无法加载模块 {name}: {e}", err=True)
        return None
    except Exception as e:
        click.echo(f"错误: 模块 {name} 抛出异常: {e}", err=True)
        return None


def _json_mode(ctx):
    """从上下文中获取 json 标志。"""
    return ctx.obj.get("json", False)


def _verbose(ctx):
    """从上下文中获取 verbose 标志。"""
    return ctx.obj.get("verbose", False)


def _qgis_prefix(ctx):
    """从上下文中获取 qgis_prefix。"""
    return ctx.obj.get("qgis_prefix")


# ---------------------------------------------------------------------------
# info 命令
# ---------------------------------------------------------------------------

@cli.command()
@click.pass_context
def info(ctx):
    """显示 QGIS 版本与功能信息。

    示例::

        cli-anything-qgis info
        cli-anything-qgis info --json
    """
    try:
        # 延迟导入 QGIS
        try:
            import qgis.core

            qgis_installed = True
            version = qgis.core.Qgis.QGIS_VERSION
            version_int = qgis.core.Qgis.QGIS_VERSION_INT

            info_data = {
                "qgis_installed": True,
                "version": version,
                "version_int": version_int,
                "qgis_prefix": _qgis_prefix(ctx) or qgis.core.QgsApplication.prefixPath(),
            }
            # pluginPaths() 需要实例化后调用，info 阶段可能未初始化
            try:
                info_data["plugin_paths"] = list(qgis.core.QgsApplication.pluginPaths())
            except (TypeError, AttributeError):
                info_data["plugin_paths"] = "需初始化后获取"
        except (ImportError, ModuleNotFoundError):
            qgis_installed = False
            info_data = {
                "qgis_installed": False,
                "message": "QGIS 未安装或不在 Python 路径中",
                "qgis_prefix": _qgis_prefix(ctx),
            }

        click.echo(format_output(info_data, json_mode=_json_mode(ctx)))
    except Exception as e:
        click.echo(f"错误: 获取 QGIS 信息失败: {e}", err=True)
        raise SystemExit(1)


# ---------------------------------------------------------------------------
# project 子组
# ---------------------------------------------------------------------------

@cli.group()
@click.pass_context
def project(ctx):
    """管理 QGIS 项目（创建、加载、查看、保存）。

    示例::

        cli-anything-qgis project create my_project.qgs
        cli-anything-qgis project load my_project.qgs
        cli-anything-qgis project info --json
        cli-anything-qgis project layers --json
    """
    pass


@project.command(name="create")
@click.argument("path", required=False, default="untitled.qgz")
@click.pass_context
def project_create(ctx, path):
    """创建新的 QGIS 项目。

    PATH: 项目文件路径（默认: untitled.qgz）

    示例::

        cli-anything-qgis project create my_project.qgs
        cli-anything-qgis project create my_project.qgz --json
    """
    core = _safe_get_core("project")
    if core is None:
        raise SystemExit(1)

    try:
        proj = core.QgisProject()
        proj.init()
        result = proj.create()
        click.echo(format_output(result, json_mode=_json_mode(ctx)))
    except Exception as e:
        click.echo(f"错误: 创建项目失败: {e}", err=True)
        raise SystemExit(1)


@project.command(name="load")
@click.argument("path", required=True)
@click.pass_context
def project_load(ctx, path):
    """加载已有的 QGIS 项目。

    PATH: 项目文件路径

    示例::

        cli-anything-qgis project load my_project.qgs
    """
    core = _safe_get_core("project")
    if core is None:
        raise SystemExit(1)

    try:
        proj = core.QgisProject()
        proj.init()
        result = proj.load(path)
        click.echo(format_output(result, json_mode=_json_mode(ctx)))
    except Exception as e:
        click.echo(f"错误: 加载项目失败: {e}", err=True)
        raise SystemExit(1)


@project.command(name="info")
@click.pass_context
def project_info(ctx):
    """显示当前项目信息。

    示例::

        cli-anything-qgis project info
        cli-anything-qgis project info --json
    """
    core = _safe_get_core("project")
    if core is None:
        raise SystemExit(1)

    try:
        proj = core.QgisProject.get_current()
        if proj is None:
            click.echo("项目未加载", err=True)
            raise SystemExit(1)
        result = proj.info()
        click.echo(format_output(result, json_mode=_json_mode(ctx)))
    except Exception as e:
        click.echo(f"错误: 获取项目信息失败: {e}", err=True)
        raise SystemExit(1)


@project.command(name="layers")
@click.pass_context
def project_layers(ctx):
    """列出项目中的所有图层。

    示例::

        cli-anything-qgis project layers
        cli-anything-qgis project layers --json
    """
    layers_core = _safe_get_core("layers")
    if layers_core is None:
        raise SystemExit(1)

    try:
        result = layers_core.LayerManager.list_layers()
        click.echo(format_output(result, json_mode=_json_mode(ctx)))
    except Exception as e:
        click.echo(f"错误: 获取图层列表失败: {e}", err=True)
        raise SystemExit(1)


@project.command(name="save")
@click.argument("path", required=False, default=None)
@click.pass_context
def project_save(ctx, path):
    """保存当前项目。

    PATH: 保存路径（默认: 当前项目路径）

    示例::

        cli-anything-qgis project save
        cli-anything-qgis project save my_project_backup.qgs
    """
    core = _safe_get_core("project")
    if core is None:
        raise SystemExit(1)

    try:
        proj = core.QgisProject()
        proj.init()
        # 如果有当前项目文件，先加载
        if os.path.exists("untitled.qgz"):
            proj.load("untitled.qgz")
        result = proj.save(path)
        click.echo(format_output(result, json_mode=_json_mode(ctx)))
    except Exception as e:
        click.echo(f"错误: 保存项目失败: {e}", err=True)
        raise SystemExit(1)


# ---------------------------------------------------------------------------
# process 子组
# ---------------------------------------------------------------------------

@cli.group()
@click.pass_context
def process(ctx):
    """管理处理算法（列出、查看信息、运行）。

    示例::

        cli-anything-qgis process list
        cli-anything-qgis process info native:buffer
        cli-anything-qgis process run native:buffer --param INPUT=data.shp --param DISTANCE=50
    """
    pass


@process.command(name="list")
@click.option("--provider", default=None, help="按 Provider 过滤")
@click.pass_context
def process_list(ctx, provider):
    """列出可用的处理算法。

    示例::

        cli-anything-qgis process list
        cli-anything-qgis process list --provider native
        cli-anything-qgis process list --provider qgis --json
    """
    proc_core = _safe_get_core("processing")
    if proc_core is None:
        raise SystemExit(1)

    try:
        result = proc_core.ProcessingEngine.list_algorithms(
            provider_filter=provider, as_json=_json_mode(ctx)
        )
        click.echo(format_output(result, json_mode=_json_mode(ctx)))
    except Exception as e:
        click.echo(f"错误: 获取算法列表失败: {e}", err=True)
        raise SystemExit(1)


@process.command(name="info")
@click.argument("algorithm_id")
@click.pass_context
def process_info(ctx, algorithm_id):
    """显示指定算法的详细信息。

    ALGORITHM_ID: 算法 ID（如 native:buffer）

    示例::

        cli-anything-qgis process info native:buffer
        cli-anything-qgis process info qgis:fixeddistancebuffer --json
    """
    proc_core = _safe_get_core("processing")
    if proc_core is None:
        raise SystemExit(1)

    try:
        result = proc_core.ProcessingEngine.get_algorithm_info(
            algorithm_id, as_json=_json_mode(ctx)
        )
        click.echo(format_output(result, json_mode=_json_mode(ctx)))
    except Exception as e:
        click.echo(f"错误: 获取算法信息失败 [{algorithm_id}]: {e}", err=True)
        raise SystemExit(1)


@process.command(name="run")
@click.argument("algorithm_id")
@click.option("--param", multiple=True, type=click.UNPROCESSED, help="算法参数 KEY=VALUE")
@click.option("--json-input", type=click.Path(exists=True), help="从 JSON 文件加载参数")
@click.pass_context
def process_run(ctx, algorithm_id, param, json_input):
    """运行处理算法。

    ALGORITHM_ID: 算法 ID（如 native:buffer）

    参数可通过 --param KEY=VALUE 指定，或通过 --json-input 从文件加载。

    示例::

        cli-anything-qgis process run native:buffer --param INPUT=data.shp --param DISTANCE=100
        cli-anything-qgis process run native:buffer --json-input params.json --json
    """
    proc_core = _safe_get_core("processing")
    if proc_core is None:
        raise SystemExit(1)

    # 组装参数字典
    params = {}
    if json_input:
        try:
            with open(json_input, "r", encoding="utf-8") as f:
                params.update(json.load(f))
        except json.JSONDecodeError as e:
            click.echo(f"错误: JSON 文件格式不正确: {e}", err=True)
            raise SystemExit(1)

    for p in param:
        if "=" not in p:
            click.echo(f"错误: 参数格式不正确 '{p}'，应为 KEY=VALUE", err=True)
            raise SystemExit(1)
        key, value = p.split("=", 1)
        params[key.strip()] = value.strip()

    if not params:
        click.echo("错误: 未提供任何参数，请至少使用 --param KEY=VALUE 指定一个参数", err=True)
        raise SystemExit(1)

    try:
        result = proc_core.ProcessingEngine.run_algorithm(
            algorithm_id, params, json_mode=_json_mode(ctx)
        )
        click.echo(format_output(result, json_mode=_json_mode(ctx)))
    except Exception as e:
        click.echo(f"错误: 运行算法失败 [{algorithm_id}]: {e}", err=True)
        raise SystemExit(1)


# ---------------------------------------------------------------------------
# convert 子组
# ---------------------------------------------------------------------------

@cli.group()
@click.pass_context
def convert(ctx):
    """矢量和栅格数据格式转换。

    示例::

        cli-anything-qgis convert vector input.shp output.gpkg --format GPKG
        cli-anything-qgis convert raster input.tif output.png --format PNG
    """
    pass


@convert.command()
@click.argument("input_path")
@click.argument("output_path")
@click.option("--format", "fmt", default=None, help="输出格式（如 GPKG, GeoJSON, ESRI Shapefile）")
@click.pass_context
def vector(ctx, input_path, output_path, fmt):
    """转换矢量数据格式。

    INPUT: 输入文件路径
    OUTPUT: 输出文件路径

    示例::

        cli-anything-qgis convert vector road.shp road.gpkg
        cli-anything-qgis convert vector road.shp road.json --format GeoJSON
    """
    export_core = _safe_get_core("export")
    if export_core is None:
        raise SystemExit(1)

    try:
        result = export_core.ExportManager.convert_vector(
            input_path, output_path, format_type=fmt, as_json=_json_mode(ctx)
        )
        click.echo(format_output(result, json_mode=_json_mode(ctx)))
    except Exception as e:
        click.echo(f"错误: 矢量格式转换失败: {e}", err=True)
        raise SystemExit(1)


@convert.command()
@click.argument("input_path")
@click.argument("output_path")
@click.option("--format", "fmt", default=None, help="输出格式（如 GeoTIFF, PNG, JPEG）")
@click.pass_context
def raster(ctx, input_path, output_path, fmt):
    """转换栅格数据格式。

    INPUT: 输入文件路径
    OUTPUT: 输出文件路径

    示例::

        cli-anything-qgis convert raster dem.tif dem.png
        cli-anything-qgis convert raster dem.tif dem.tif --format GeoTIFF
    """
    export_core = _safe_get_core("export")
    if export_core is None:
        raise SystemExit(1)

    try:
        result = export_core.ExportManager.convert_raster(
            input_path, output_path, format_type=fmt, as_json=_json_mode(ctx)
        )
        click.echo(format_output(result, json_mode=_json_mode(ctx)))
    except Exception as e:
        click.echo(f"错误: 栅格格式转换失败: {e}", err=True)
        raise SystemExit(1)


# ---------------------------------------------------------------------------
# crs 子组
# ---------------------------------------------------------------------------

@cli.group()
@click.pass_context
def crs(ctx):
    """坐标系（CRS）管理——列出、查询详细信息。

    示例::

        cli-anything-qgis crs list
        cli-anything-qgis crs list --filter 4326
        cli-anything-qgis crs info EPSG:4326
    """
    pass


@crs.command(name="list")
@click.option("--filter", "filter_text", default=None, help="按名称或 EPSG 编码过滤")
@click.pass_context
def crs_list(ctx, filter_text):
    """列出可用的坐标系定义。

    示例::

        cli-anything-qgis crs list
        cli-anything-qgis crs list --filter WGS84
        cli-anything-qgis crs list --filter 3857 --json
    """
    crs_core = _safe_get_core("crs")
    if crs_core is None:
        raise SystemExit(1)

    try:
        result = crs_core.CrsManager.list_crs(
            filter_text=filter_text, as_json=_json_mode(ctx)
        )
        click.echo(format_output(result, json_mode=_json_mode(ctx)))
    except Exception as e:
        click.echo(f"错误: 获取 CRS 列表失败: {e}", err=True)
        raise SystemExit(1)


@crs.command(name="info")
@click.argument("crs_id")
@click.pass_context
def crs_info(ctx, crs_id):
    """显示指定坐标系的详细信息。

    CRS_ID: 坐标系 ID（如 EPSG:4326）

    示例::

        cli-anything-qgis crs info EPSG:4326
        cli-anything-qgis crs info 3857 --json
    """
    crs_core = _safe_get_core("crs")
    if crs_core is None:
        raise SystemExit(1)

    try:
        result = crs_core.CrsManager.get_crs_info(crs_id, as_json=_json_mode(ctx))
        click.echo(format_output(result, json_mode=_json_mode(ctx)))
    except Exception as e:
        click.echo(f"错误: 获取 CRS 信息失败 [{crs_id}]: {e}", err=True)
        raise SystemExit(1)


# ---------------------------------------------------------------------------
# export 子组
# ---------------------------------------------------------------------------

@cli.group()
@click.pass_context
def export(ctx):
    """导出图层和地图图片。

    示例::

        cli-anything-qgis export layer roads output.json --format GeoJSON
        cli-anything-qgis export map output.png --width 1920 --height 1080 --dpi 300
    """
    pass


@export.command(name="layer")
@click.argument("layer_name")
@click.argument("output_path")
@click.option("--format", "fmt", default=None, help="导出格式（如 GeoJSON, GPKG, Shapefile）")
@click.pass_context
def export_layer(ctx, layer_name, output_path, fmt):
    """导出指定图层到文件。

    LAYER_NAME: 图层名称
    OUTPUT_PATH: 输出文件路径

    示例::

        cli-anything-qgis export layer roads output.gpkg
        cli-anything-qgis export layer buildings buildings.json --format GeoJSON
    """
    export_core = _safe_get_core("export")
    if export_core is None:
        raise SystemExit(1)

    try:
        result = export_core.ExportManager.export_layer(
            layer_name, output_path, format_type=fmt, as_json=_json_mode(ctx)
        )
        click.echo(format_output(result, json_mode=_json_mode(ctx)))
    except Exception as e:
        click.echo(f"错误: 导出图层失败 [{layer_name}]: {e}", err=True)
        raise SystemExit(1)


@export.command(name="map")
@click.argument("output_path")
@click.option("--width", default=1920, type=int, help="图片宽度（像素）")
@click.option("--height", default=1080, type=int, help="图片高度（像素）")
@click.option("--dpi", default=96, type=int, help="DPI 分辨率")
@click.pass_context
def export_map(ctx, output_path, width, height, dpi):
    """导出当前地图视图为图片。

    OUTPUT_PATH: 输出图片路径

    示例::

        cli-anything-qgis export map screenshot.png
        cli-anything-qgis export map map.png --width 2560 --height 1440 --dpi 300
    """
    export_core = _safe_get_core("export")
    if export_core is None:
        raise SystemExit(1)

    try:
        result = export_core.ExportManager.export_map(
            output_path, width=width, height=height, dpi=dpi, as_json=_json_mode(ctx)
        )
        click.echo(format_output(result, json_mode=_json_mode(ctx)))
    except Exception as e:
        click.echo(f"错误: 导出地图失败: {e}", err=True)
        raise SystemExit(1)


# ---------------------------------------------------------------------------
# shell 命令（交互式 REPL）
# ---------------------------------------------------------------------------

@cli.command()
@click.pass_context
def shell(ctx):
    """进入交互式 QGIS Shell。

    进入后可直接运行 Python 代码，内置以下对象：
    - `ctx`: Click 上下文
    - `qgis_prefix`: QGIS 安装路径
    - `format_output`: 格式化输出函数

    示例::

        cli-anything-qgis shell

    在 Shell 中:
        >>> list_layers()
        >>> run_algorithm('native:buffer', INPUT='data.shp', DISTANCE=50)
    """
    import code
    import readline  # noqa: F401

    click.echo("QGIS Interactive Shell")
    click.echo("Type 'quit' or press Ctrl+D to exit.\n")

    # 准备 Shell 命名空间
    namespace = {
        "ctx": ctx,
        "qgis_prefix": _qgis_prefix(ctx),
        "format_output": format_output,
        "format_json": format_json,
        "format_tree": format_tree,
        "_json_mode": _json_mode(ctx),
        "_verbose": _verbose(ctx),
    }

    # 尝试预加载便捷函数
    for mod_name, methods in [
        ("cli_anything.qgis.core.project", ["QgisProject"]),
        ("cli_anything.qgis.core.layers", ["LayerManager"]),
        ("cli_anything.qgis.core.processing", ["ProcessingEngine"]),
    ]:
        try:
            __import__(mod_name)
            mod = sys.modules[mod_name]
            for method_name in methods:
                if hasattr(mod, method_name):
                    namespace[method_name] = getattr(mod, method_name)
        except (ImportError, ModuleNotFoundError):
            pass

    console = code.InteractiveConsole(locals=namespace)
    console.interact(banner="")


# ---------------------------------------------------------------------------
# 入口点
# ---------------------------------------------------------------------------

if __name__ == "__main__":
    cli()
