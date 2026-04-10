import React from 'react';
import { Composition } from 'remotion';
import { WeeklyReport } from './Composition';
import { WeeklyBrief } from './WeeklyBriefComposition';
import { NewsItem, CategorySection } from './components/CategorySection';

// 2026-W14 周报数据（3/31 - 4/3）
const reportData = {
  coverTitle: '2026-W14 周报',
  coverSubtitle: '武洋的一周工作总结',
  days: [
    {
      date: '3/31 周一',
      title: '生产系统开发 & 技术沉淀',
      highlights: [
        '生产系统：流程设计、首页调整、合同管理优化',
        'AI 数据集索引：整理 742 期开源数据集（猫脸码客）',
        '模型测试：千问 qwen-image-2.0-pro 效果最佳',
      ],
    },
    {
      date: '4/1 周三',
      title: '深度调研 & 项目沟通',
      highlights: [
        'Claude Code 源码调研：三层自愈记忆架构',
        'gstack 技能包调研：YC 产品方法论编码化',
        '教育评估系统沟通完成，方案确定',
      ],
    },
    {
      date: '4/2 周四',
      title: '大模型调研 & 知识库建设',
      highlights: [
        '国外大模型调研：1 份主报告 + 5 份子报告',
        'OpenCode 插件系统：推荐 opencode-pty',
        'Obsidian Bases 调研报告库（28 份报告）',
      ],
    },
    {
      date: '4/3 周五',
      title: 'GeoAI 双链 & 技能测试',
      highlights: [
        'GeoAI 调研报告双链网络构建完成',
        'baoyu-slide-deck 技能测试对比',
        '曲周县项目临时用地报卷审核',
      ],
    },
  ],
  weekHighlights: [
    'Claude Code 三层自愈记忆架构（教科书级参考）',
    'gstack 把 YC 方法论编码成可执行技能',
    '国外大模型全面调研（Claude/OpenAI/Gemini）',
    '知识库体系化建设（28 份报告分类展示）',
  ],
};

// 2026-W14 Weekly Brief 数据
const weeklyBriefData = {
  title: '每周新闻摘要',
  weekRange: '2026年第14周（03-30 至 04-05）',
  totalNews: 972,
  highScoreNews: 959,
  days: 7,
  categories: [
    {
      name: 'AI 人工智能',
      image: 'AI.png',
      totalCount: 131,
      newsItems: [
        { title: '企业级模型即服务平台开源', date: '04-04', source: '开源项目Git精选', summary: '完全开源，免费，可商业化' },
        { title: 'rs-embed: 遥感基础模型 Embedding', date: '04-04', source: '遥感与深度学习', summary: '让任意时空的遥感模型随叫随到' },
        { title: 'OpenEarth-Agent 开放环境遥感智能体', date: '04-02', source: '遥感与深度学习', summary: '从工具调用到工具创建' },
        { title: 'PaddleOCR Star突破73.3K', date: '03-30', source: '百度AI', summary: '成为全球OCR最亮的星' },
        { title: '对AI说"请"和"谢谢"真的有用', date: '04-03', source: '阿里研究院', summary: '说话方式改变模型内部状态' },
      ] as NewsItem[],
    },
    {
      name: '测绘地理信息',
      image: '测绘地理信息.png',
      totalCount: 104,
      newsItems: [
        { title: '海南"一张图"地理底图建设纪实', date: '04-01', source: '中国测绘学会', summary: '为自贸港筑牢空间信息底座' },
        { title: '青海测绘行业安全生产培训', date: '04-02', source: '中国测绘学会', summary: '全省甲级乙级测绘资质单位' },
        { title: '陈军院士：自然资源"一张图"', date: '04-01', source: '中国地理信息产业协会', summary: '技术内涵与发展方向' },
        { title: '湖南测绘地理信息学会会议', date: '04-01', source: '中国测绘学会', summary: '第十二届理事会第一次会议' },
        { title: '北航：地图视觉搜索效率研究', date: '04-03', source: '中国地理信息产业协会', summary: '熟悉度维度建筑高度影响' },
      ] as NewsItem[],
    },
    {
      name: '遥感与无人机',
      image: '遥感与无人机.png',
      totalCount: 56,
      newsItems: [
        { title: '西南首个商业卫星遥感测运控站启用', date: '03-30', source: '中国地理信息产业协会', summary: '环天星座卫星地面接收站' },
        { title: 'CAD图纸导入奥维地图教程', date: '03-30', source: '三维地图资源馆', summary: '工程人必备技能' },
        { title: '遥感影像自适应降位拉伸', date: '04-04', source: '西风图像', summary: '附Python代码及测试数据' },
        { title: '河湖库亚米级卫星遥感项目', date: '04-01', source: '测绘地信论坛', summary: '1706万招标' },
        { title: '中国高分卫星影像图集发布', date: '04-01', source: '西风图像', summary: '视界系列' },
      ] as NewsItem[],
    },
    {
      name: '政策与会议',
      image: '政策与会议.png',
      totalCount: 128,
      newsItems: [
        { title: '第二届全国遥感地理学大会', date: '04-03', source: '遥感学报', summary: '一号通知' },
        { title: '第四届中国数字地球大会', date: '03-30', source: '遥感学报', summary: '第一轮通知' },
        { title: '2026空间智能软件技术大会', date: '04-01', source: '中国地理学会', summary: '打造智能经济新形态' },
        { title: '最新采购示范文本发布', date: '03-30', source: '中国政府采购报', summary: '本国产品标准政策' },
        { title: '全国遥感地理学大会通知', date: '04-02', source: '中国地理学会', summary: '遥感地理专业委员会' },
      ] as NewsItem[],
    },
    {
      name: '招聘与人才',
      image: '招聘与人才.png',
      totalCount: 6,
      newsItems: [
        { title: '云南师范大学硕士调剂', date: '04-04', source: '慧天地', summary: '2026年硕士研究生调剂公告' },
        { title: '浙江海洋大学硕士调剂', date: '04-03', source: '慧天地', summary: '2026年硕士研究生招生调剂' },
        { title: '桂林理工大学硕士调剂', date: '04-02', source: '慧天地', summary: '硕士研究生招生调剂公告' },
        { title: '湖北师范大学硕士调剂', date: '04-03', source: 'GIS高等教育', summary: '硕士研究生招生调剂工作办法' },
        { title: '新疆大学硕士调剂通知', date: '04-02', source: '慧天地', summary: '全国硕士研究生招生考试调剂' },
      ] as NewsItem[],
    },
    {
      name: '数据资源',
      image: '数据资源.png',
      totalCount: 4,
      newsItems: [
        { title: '地图瓦片下载器v1.0', date: '04-05', source: '测绘地信', summary: '谷歌等15种遥感影像图源' },
        { title: '国家地球系统科学数据中心Q1发布', date: '03-31', source: '国家地球系统科学数据中心', summary: '2026年第一季度数据产品清单' },
        { title: 'ArcGIS Network Analyst教程', date: '04-01', source: 'ArcGis爱学习', summary: '路径选择网络数据创建' },
        { title: '地学大数据资源汇总', date: '03-30', source: '地学大数据', summary: '26年第14周汇总' },
        { title: 'POI数据获取工具v1.6', date: '03-30', source: '地学大数据', summary: '坐标系转换工具v1.4' },
      ] as NewsItem[],
    },
    {
      name: '技术工具',
      image: '技术工具.png',
      totalCount: 5,
      newsItems: [
        { title: 'CC工具箱2.2.0更新', date: '03-30', source: '规划GIS会', summary: '免费200+工具' },
        { title: '10款免费GitHub开源工具', date: '03-31', source: '小众软件', summary: '好用实用' },
        { title: '全国地表形变成果在线服务系统', date: '04-04', source: '中国测绘科学研究院', summary: '2022版灾害与环境雷达监测' },
        { title: '工业视觉模型训练平台开源', date: '03-30', source: '开源项目Git精选', summary: '可私有化部署开箱即用' },
        { title: '低代码AI模型训练系统', date: '03-30', source: '开源项目Git精选', summary: '图像采集智能检测标注训练' },
      ] as NewsItem[],
    },
  ],
  dailyStats: [
    { date: '03-30', weekday: '周一', count: 185 },
    { date: '03-31', weekday: '周二', count: 140 },
    { date: '04-01', weekday: '周三', count: 150 },
    { date: '04-02', weekday: '周四', count: 173 },
    { date: '04-03', weekday: '周五', count: 192 },
    { date: '04-04', weekday: '周六', count: 99 },
    { date: '04-05', weekday: '周日', count: 33 },
  ],
  categoryStats: [
    { name: 'AI', count: 131, ratio: 13.5 },
    { name: '政策/通知', count: 128, ratio: 13.2 },
    { name: '测绘地理信息', count: 104, ratio: 10.7 },
    { name: '遥感', count: 47, ratio: 4.8 },
    { name: '其他', count: 553, ratio: 56.9 },
  ],
};

// 计算周报总时长
const WEEKLY_REPORT_TRANSITION = 15;
const TOTAL_REPORT_DURATION =
  90 + WEEKLY_REPORT_TRANSITION + 4 * 150 + 3 * WEEKLY_REPORT_TRANSITION + 180;

// 计算Weekly Brief总时长
// 封面3秒 + 7个分类*3秒 + 7个过渡*0.5秒 + 统计6秒 + 过渡0.5秒 + 结尾2秒
// = 90 + 630 + 105 + 180 + 15 + 60 = 1080帧（36秒）
const TOTAL_BRIEF_DURATION =
  90 + // 封面
  15 + // 过渡
  7 * 90 + // 7个分类
  6 * 15 + // 6个过渡
  15 + // 过渡
  180 + // 统计
  15 + // 过渡
  60; // 结尾
// = 90 + 15 + 630 + 90 + 15 + 180 + 15 + 60 = 1095帧

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="WeeklyReport"
        component={WeeklyReport}
        durationInFrames={TOTAL_REPORT_DURATION}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={reportData}
      />
      <Composition
        id="WeeklyBrief"
        component={WeeklyBrief}
        durationInFrames={TOTAL_BRIEF_DURATION}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={weeklyBriefData}
      />
    </>
  );
};

export default RemotionRoot;