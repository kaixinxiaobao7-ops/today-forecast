# 星签 · 今日星座运势

[![在线体验](https://img.shields.io/badge/在线体验-星签-e6c78d?style=flat-square)](https://kaixinxiaobao7-ops.github.io/today-forecast/) [![Deploy](https://github.com/kaixinxiaobao7-ops/today-forecast/actions/workflows/deploy.yml/badge.svg)](https://github.com/kaixinxiaobao7-ops/today-forecast/actions/workflows/deploy.yml)

**在线体验：<https://kaixinxiaobao7-ops.github.io/today-forecast/>**

一个使用 **React + TypeScript + Vite** 构建的今日星座运势网页。选择你的星座，查看爱情、事业、财运、健康四维能量与今日指引，再摇一支只属于你的「今日运势签」，并保存为精美的分享卡片。

![星签预览](public/assets/img/og.png)

## 功能

- **12 星座今日运势**：综合评分、四维能量、专属解读、今日星语
- **星盘选座**：环形星盘交互，支持 URL 深链 `?sign=leo`
- **今日运势签**：摇签动画 + 24 支原创签文，每日每星座固定
- **今日锦囊**：幸运色、幸运数字、幸运方位、幸运时段、速配星座、宜忌
- **分享卡片**：Canvas 生成 1080 × 1440 高清运势签，可下载 / 复制 / 调起系统分享
- **确定性算法**：结果由「日期 + 星座」哈希生成，同一天刷新结果一致
- **移动端适配**：响应式布局，支持 `prefers-reduced-motion`
- **隐私友好**：无后端、无统计、无外部请求，星座选择只存于浏览器本地

## 技术栈

| 层 | 选型 |
| --- | --- |
| UI | React 18 + TypeScript 5 |
| 构建 | Vite 6 |
| 样式 | 原生 CSS（沿用星象视觉体系） |
| 部署 | GitHub Actions → GitHub Pages |

## 本地开发

```bash
npm install
npm run dev
# 打开终端提示的地址，默认 http://localhost:5173/
```

构建与本地预览生产版本：

```bash
npm run build
npm run preview
```

类型检查：

```bash
npm run typecheck
```

## 项目结构

```text
.
├── index.html                     # Vite HTML 入口与 SEO 元信息
├── src/
│   ├── main.tsx                   # React 挂载入口
│   ├── App.tsx                    # 日期、星座、摇签与分享状态
│   ├── types.ts                   # 全量类型定义
│   ├── data/                      # 星座、星象主题、24 支签文
│   ├── lib/
│   │   ├── daily.ts               # 确定性评分与签文选取
│   │   ├── date.ts / random.ts    # 日期与哈希随机
│   │   └── share.ts               # 分享文案与 Canvas 运势卡
│   ├── hooks/                     # toast / reveal / header 滚动
│   ├── components/                # 星盘、运势卡、签筒、页面区块
│   └── styles/global.css          # 视觉与响应式样式
├── public/                        # 图标、OG 图、manifest、404 等静态资源
├── .github/workflows/deploy.yml   # GitHub Pages 自动部署
└── tools/generate-images.py       # 图标 / OG 图生成脚本
```

## 部署到 GitHub Pages

仓库已包含 GitHub Actions 工作流：推送到 `main` 分支后自动安装依赖、构建 `dist` 并发布。

1. 在仓库 **Settings → Pages → Build and deployment** 中，将 Source 设为 **GitHub Actions**。
2. 推送到 `main`，等待 Actions 中的 `Deploy to GitHub Pages` 完成。
3. 访问 `https://<username>.github.io/<repo>/`。本项目当前地址：<https://kaixinxiaobao7-ops.github.io/today-forecast/>。

`vite.config.ts` 使用 `base: './'`，因此仓库改名或部署在任意子路径下也能正常加载资源。

## 自定义内容

- **星座文案 / 语气**：编辑 `src/data/signs.ts`
- **今日星象主题**：编辑 `src/data/content.ts` 中的 `THEMES`
- **24 支运势签**：编辑 `src/data/content.ts` 中的 `FORTUNES`（`rankKey` 支持 `shangshang` / `shangji` / `zhongji` / `ping`）
- **评分范围与权重**：编辑 `src/lib/daily.ts`
- **配色与版式**：编辑 `src/styles/global.css` 顶部 CSS 变量
- **分享卡片版式**：编辑 `src/lib/share.ts`

## 说明

本站所有文案均为原创文化娱乐内容，星象主题并非实时天文测算，不构成任何专业建议。愿你在这里获得一点安静的力量。
