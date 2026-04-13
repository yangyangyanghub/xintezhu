"""工具函数：格式化输出、截断、尺寸转换等。"""
import json


def truncate(s, max_len=50):
    """截断过长字符串，末尾添加省略号。

    Args:
        s: 原始字符串
        max_len: 最大显示长度

    Returns:
        截断后的字符串
    """
    if s is None:
        return ""
    s = str(s)
    if len(s) <= max_len:
        return s
    return s[: max_len - 3] + "..."


def format_size(size_bytes):
    """将字节数转换为人类可读的文件大小。

    Args:
        size_bytes: 字节数

    Returns:
        格式化后的字符串，如 "1.5 MB"
    """
    if size_bytes is None or size_bytes < 0:
        return "N/A"
    if size_bytes == 0:
        return "0 B"

    units = ("B", "KB", "MB", "GB", "TB")
    unit_index = 0
    size = float(size_bytes)

    while size >= 1024 and unit_index < len(units) - 1:
        size /= 1024
        unit_index += 1

    if unit_index == 0:
        return f"{int(size)} B"
    return f"{size:.1f} {units[unit_index]}"


def format_crs(crs_string):
    """格式化 CRS 坐标系的显示。

    Args:
        crs_string: CRS 字符串，如 "EPSG:4326" 或 "4326"

    Returns:
        格式化后的字符串
    """
    if not crs_string:
        return "Unknown CRS"

    crs_string = str(crs_string).strip()
    if crs_string.upper().startswith("EPSG:"):
        epsg_code = crs_string.split(":")[1].strip()
        return f"EPSG:{epsg_code}"
    try:
        code = int(crs_string)
        return f"EPSG:{code}"
    except (ValueError, TypeError):
        return crs_string


def format_table(data, headers):
    """将字典列表格式化为对齐的表格。

    Args:
        data: 字典列表，每个字典代表一行
        headers: 列标题列表

    Returns:
        格式化后的表格字符串
    """
    if not data or not headers:
        return ""

    # 确保所有行数据存在
    rows = []
    for item in data:
        if item is None:
            rows.append([""] * len(headers))
            continue
        row = []
        for h in headers:
            val = item.get(h, "")
            row.append(truncate(val if val is not None else ""))
        rows.append(row)

    # 计算每列最大宽度
    col_widths = []
    for i, header in enumerate(headers):
        max_width = len(str(header))
        for row in rows:
            if i < len(row):
                max_width = max(max_width, len(str(row[i])))
        col_widths.append(max_width)

    # 生成表格
    def make_row(cells):
        parts = []
        for i, cell in enumerate(cells):
            width = col_widths[i] if i < len(col_widths) else 20
            parts.append(str(cell).ljust(width))
        return "  ".join(parts)

    lines = []
    lines.append(make_row(headers))
    lines.append("  ".join("-" * w for w in col_widths))
    for row in rows:
        lines.append(make_row(row))

    return "\n".join(lines)


def format_json(data, indent=2):
    """将数据格式化为美化的 JSON 字符串。

    Args:
        data: 可 JSON 序列化的数据
        indent: 缩进空格数

    Returns:
        JSON 字符串
    """
    if data is None:
        return "null"

    def _default(obj):
        """处理无法直接序列化的对象。"""
        return str(obj)

    return json.dumps(data, indent=indent, default=_default, ensure_ascii=False)


def format_tree(data, indent=0):
    """将嵌套字典格式化为缩进树形结构。

    Args:
        data: 要格式化的数据（字典、列表或其他类型）
        indent: 当前缩进级别

    Returns:
        格式化后的树形字符串
    """
    if data is None:
        return ""

    prefix = "  " * indent

    if isinstance(data, dict):
        lines = []
        for key, value in data.items():
            formatted_key = f"{prefix}{key}: "
            if isinstance(value, (dict, list)):
                lines.append(f"{prefix}{key}:")
                child = format_tree(value, indent + 1)
                if child:
                    lines.append(child)
            else:
                lines.append(f"{formatted_key}{value}")
        return "\n".join(lines)
    elif isinstance(data, list):
        lines = []
        for i, item in enumerate(data):
            if isinstance(item, (dict, list)):
                lines.append(f"{prefix}[{i}]:")
                child = format_tree(item, indent + 1)
                if child:
                    lines.append(child)
            else:
                lines.append(f"{prefix}[{i}]: {item}")
        return "\n".join(lines)
    else:
        return f"{prefix}{data}"


def format_output(data, json_mode=False):
    """根据 json_mode 标志自动选择格式。

    Args:
        data: 要格式化的数据
        json_mode: 是否以 JSON 模式输出

    Returns:
        格式化后的字符串
    """
    if data is None:
        return "No data"

    if json_mode:
        return format_json(data)

    # 非 JSON 模式：智能选择格式
    if isinstance(data, (dict, list)):
        if isinstance(data, list) and len(data) > 0 and isinstance(data[0], dict):
            # 字典列表 -> 表格
            headers = list(data[0].keys())
            return format_table(data, headers)
        elif isinstance(data, dict):
            # 嵌套字典 -> 树形
            return format_tree(data)
        elif isinstance(data, list):
            # 简单列表 -> 每行一项
            return "\n".join(str(item) for item in data)
        return format_json(data)
    else:
        return str(data)
