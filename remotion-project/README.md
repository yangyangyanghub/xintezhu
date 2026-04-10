# 2026-W14 周报视频

武洋的工作周报视频项目，使用 Remotion 制作。

## 项目结构

```
remotion-project/
├── package.json           # 项目配置和依赖
├── tsconfig.json          # TypeScript 配置
└── src/
    ├── Root.tsx           # Composition 入口，包含周报数据
    ├── Composition.tsx    # 主视频组件（TransitionSeries）
    └── components/
        ├── Cover.tsx      # 封面动画组件
        ├── DailyCard.tsx  # 日报卡片组件
        └── Summary.tsx    # 周总结组件
```

## 技术规格

- **分辨率**: 1080x1920（竖版，抖音/小红书格式）
- **帧率**: 30 fps
- **时长**: 约 24 秒（705 帧）
  - 封面：3 秒
  - 日报卡片：4 天 × 5 秒 = 20 秒
  - 周总结：6 秒
  - 转场：4 次 × 0.5 秒 = 2 秒（重叠）

## 快速开始

### 1. 安装依赖

```bash
cd remotion-project
npm install
```

### 2. 预览播放

```bash
npm start
```

Remotion Studio 会在浏览器中打开，可以实时预览动画效果。

### 3. 渲染视频

```bash
# 完整渲染
npm run build

# 预览渲染（前 10 秒）
npm run build:preview
```

渲染完成后，视频会输出到 `out/video.mp4`

## 自定义内容

编辑 `src/Root.tsx` 中的 `reportData` 对象：

```typescript
const reportData = {
  coverTitle: '2026-W14 周报',
  coverSubtitle: '武洋的一周工作总结',
  days: [
    {
      date: '3/31 周一',
      title: '工作内容概述',
      highlights: ['工作项 1', '工作项 2', '工作项 3'],
    },
    // ...
  ],
  weekHighlights: ['亮点 1', '亮点 2', '亮点 3', '亮点 4'],
};
```

## 动画说明

所有动画基于 `useCurrentFrame()` 和 `interpolate()` 实现：

- **封面**: 标题淡入放大 (0-2s)，副标题延迟淡入 (2-3.5s)
- **日报卡片**: 工作内容逐个淡入（每条间隔 0.8 秒）
- **周总结**: 亮点逐条出现（每条间隔 1 秒）
- **转场**: 使用 `@remotion/transitions` 的 fade 效果

## 依赖说明

- `remotion` - 核心视频引擎
- `@remotion/cli` - 命令行工具（渲染、Studio）
- `@remotion/transitions` - 转场效果库
- `@remotion/player` - 预览播放器

## 输出设置

渲染参数可在 `package.json` 中调整：

```json
{
  "scripts": {
    "build": "remotion render WeeklyReport out/video.mp4 --codec=h264 --crf=23"
  }
}
```

## 常见问题

**Q: 渲染速度慢？**
A: 使用 `--frames` 参数限制帧数测试，或使用 `npm run build:preview`

**Q: 修改后没变化？**
A: Remotion Studio 需要刷新页面，或重启 `npm start`

**Q: 输出文件太大？**
A: 调整 `--crf` 参数（23-28 之间，数字越大文件越小）
