#!/usr/bin/env python
# -*- coding: utf-8 -*-
import json
from pathlib import Path
import sys

# 添加脚本目录到路径
script_dir = Path(r'E:/code/my-ai-workspace/.opencode/skill/daily-report-analyzer/scripts')
sys.path.insert(0, str(script_dir))

from analyze_reports import ReportAnalyzer, generate_scores_file, generate_analysis_file

def main():
    date_str = '2026-03-10'
    input_dir = Path(r'E:/code/my-ai-workspace/daily-reports')
    
    # 读取日报数据
    raw_file = input_dir / date_str / 'raw_reports.json'
    with open(raw_file, 'r', encoding='utf-8') as f:
        reports = json.load(f)
    print(f'[INFO] 读取日报: {len(reports)} 条')
    
    # 读取部门人数配置
    dept_member_count = None
    
    # 方式1：从summary.json读取
    summary_file = input_dir / date_str / 'summary.json'
    if summary_file.exists():
        with open(summary_file, 'r', encoding='utf-8') as f:
            summary_data = json.load(f)
            dept_member_count = summary_data.get('dept_member_count')
            if dept_member_count:
                print(f'[INFO] 从summary.json读取部门人数: {len(dept_member_count)}个部门, 共{sum(dept_member_count.values())}人')
    
    # 方式2：从dept_member_count.json读取
    if not dept_member_count:
        dept_config_file = input_dir / 'dept_member_count.json'
        if dept_config_file.exists():
            with open(dept_config_file, 'r', encoding='utf-8') as f:
                dept_member_count = json.load(f)
                if dept_member_count:
                    print(f'[INFO] 从dept_member_count.json读取部门人数: {len(dept_member_count)}个部门, 共{sum(dept_member_count.values())}人')
    
    # 执行分析
    analyzer = ReportAnalyzer()
    results = analyzer.analyze_all(reports, dept_member_count)
    
    # 保存结果
    output_dir = input_dir / date_str
    generate_scores_file(results, output_dir / 'scores.json')
    generate_analysis_file(results, output_dir / 'analysis.json')
    
    print(f'[RESULT] 应提交人数: {results["total_should_submit"]}')
    print(f'[RESULT] 已提交人数: {results["total_count"]}')
    print('[SUCCESS] 分析完成!')

if __name__ == '__main__':
    main()