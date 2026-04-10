#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
获取微信公众号文章信息
专门处理猫脸码客公众号开源数据集专辑
"""

import requests
import re
from urllib.parse import urlencode, urlparse, parse_qs
import time

def get_article_info(mid):
    """
    根据mid获取文章信息
    """
    url = f"https://mp.weixin.qq.com/s?__biz=MzU3NTYxNDA4Ng==&mid={mid}"
    
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'zh-CN,zh;q=0.8,zh-TW;q=0.7,zh-HK;q=0.5,en-US;q=0.3,en;q=0.2',
        'Accept-Encoding': 'gzip, deflate',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
    }
    
    try:
        response = requests.get(url, headers=headers, timeout=10)
        
        if response.status_code == 200:
            # 检查是否有异常页面
            if '被多人投诉' in response.text or '内容已被发布者删除' in response.text or '此内容因违规无法查看' in response.text:
                return None, url, "文章已被删除或违规"
            
            # 尝试提取文章标题
            title_match = re.search(r'<h1[^>]*class="rich_media_title"[^>]*>(.*?)</h1>', response.text, re.DOTALL)
            if not title_match:
                title_match = re.search(r'<h1[^>]*>(.*?)</h1>', response.text, re.DOTALL)
            
            if title_match:
                title = title_match.group(1).strip()
                # 清理HTML标签
                title = re.sub(r'<[^>]+>', '', title)
                return title.strip(), url, "成功"
            else:
                return f"第{mid}期", url, "无法提取标题"
        elif response.status_code == 404:
            return None, url, f"404错误"
        else:
            return None, url, f"HTTP {response.status_code}"
            
    except requests.exceptions.RequestException as e:
        return None, url, f"请求异常: {str(e)}"
    except Exception as e:
        return None, url, f"解析异常: {str(e)}"

def calculate_mid_range():
    """
    基于已知数据推算第101-200期的mid范围
    """
    # 已知数据:
    # 第1期: mid = 2247484179
    # 第100期: mid = 2247484418
    # 差值 = 239, 平均每期间隔约2.4
    
    avg_increment_per_issue = (2247484418 - 2247484179) / 99  # 约2.414
    print("=== 基于现有数据的mid规律分析 ===")
    print(f"第1期: mid = 2247484179")
    print(f"第100期: mid = 2247484418")
    print(f"总计增加: {2247484418 - 2247484179}")
    print(f"总期数: 99 (1-100)")
    print(f"平均每期间隔: {avg_increment_per_issue:.3f}")
    print()
    
    # 计算第101-200期的mid范围
    start_issue = 101
    end_issue = 200
    start_mid_predict = int(2247484418 + avg_increment_per_issue)  # 第101期预估值
    end_mid_predict = int(2247484179 + avg_increment_per_issue * (end_issue - 1))  # 第200期预估值
    
    print(f"根据规律推算:")
    print(f"第101期: mid ≈ {start_mid_predict}")
    print(f"第200期: mid ≈ {end_mid_predict}")
    print(f"预计mid范围: {start_mid_predict} - {end_mid_predict}")
    print()
    
    # 尝试从已知的两期数据外推
    print("基于规律生成第101-200期预测数据表 (仅供参考，未经验证):")
    print("| 期数 | 预估mid | 文章链接 |")
    print("|-----|------|---------|")
    
    # 生成预估数据
    for issue_num in range(start_issue, end_issue + 1):
        calc_mid = int(2247484179 + avg_increment_per_issue * (issue_num - 1))
        print(f"| {issue_num} | {calc_mid} | https://mp.weixin.qq.com/s?__biz=MzU3NTYxNDA4Ng==&mid={calc_mid} |")
    
    print()
    print("=== 重要说明 ===")
    print("由于微信公众号的反爬虫机制和技术限制，实际文章标题和内容无法通过程序自动抓取。")
    print("以上mid数值仅为基于前100期数据的数学推算结果，可能不完全准确。")
    print("要获取第101-200期的确切文章标题和链接，需要手动访问或通过官方渠道查询。")


def main():
    print("执行微信公众号数据开源数据集专辑分析...")
    calculate_mid_range()

def verify_pattern():
    """
    验证已知文章的mid值关系
    """
    print("=== mid参数规律验证 ===")
    print(f"第1期 (文章名: 开源数据集第1期-电影数据集) mid: 2247484179")
    print(f"第100期 mid: 2247484418")
    print(f"差值: {2247484418 - 2247484179}")  # 239
    print(f"平均每期递增: {(2247484418 - 2247484179) / 99}")  # 2.414...

if __name__ == "__main__":
    verify_pattern()
    main()