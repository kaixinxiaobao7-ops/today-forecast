# 星签 · 今日星座运势

一个纯静态、零依赖的今日星座运势网页。选择你的星座，查看爱情、事业、财运、健康四维能量与今日指引，再摇一支只属于你的「今日运势签」，并保存为精美的分享卡片。

![星签预览](assets/img/og.png)

## 功能

- **12 星座今日运势**：综合评分、四维能量、专属解读、今日星语
- **星盘选座**：环形星盘交互，支持 URL 深链 `?sign=leo`
- **今日运势签**：摇签动画 + 24 支原创签文，每日每星座固定
- **今日锦囊**：幸运色、幸运数字、幸运方位、幸运时段、速配星座、宜忌
- **分享卡片**：Canvas 生成 1080 × 1440 高清运势签，可下载 / 复制 / 调起系统分享
- **确定性算法**：结果由「日期 + 星座」哈希生成，同一天刷新结果一致
- **移动端适配**：响应式布局，支持 `prefers-reduced-motion`
- **隐私友好**：无后端、无统计、无外部请求，星座选择只存于浏览器本地

## 本地预览

无需安装依赖，直接启动任意静态服务器：

```bash
python3 -m http.server 4173
# 打开 http://127.0.0.1:4173/
```

也可以直接用浏览器打开 `index.html`。

## 项目结构

```text
.
├── index.html                  # 单页结构
├── assets/
│   ├── css/style.css           # 视觉与响应式样式
│   ├── js/data.js              # 星座、星象主题、24 支签文
│   ├── js/app.js               # 评分、渲染、摇签、Canvas 分享卡
│   └── img/                    # 图标与 OG 图
├── manifest.webmanifest        # PWA 清单
├── .github/workflows/deploy.yml# GitHub Pages 自动部署
├── tools/generate-images.py    # 图标 / OG 图生成脚本
└── 404.html
```

## 部署到 GitHub Pages

仓库已包含 GitHub Actions 工作流：推送到 `main` 分支后自动发布。

1. 在仓库 **Settings → Pages → Build and deployment** 中，将 Source 设为 **GitHub Actions**。
2. 推送到 `main`，等待 Actions 中的 `Deploy to GitHub Pages` 完成。
3. 访问 `https://<username>.github.io/<repo>/`。

如需部署到自己的仓库：

```bash
git remote set-url origin git@github.com:<username>/<repo>.git
git push -u origin main
```

## 自定义内容

- **星座文案 / 语气**：编辑 `assets/js/data.js` 中的 `signs`
- **今日星象主题**：编辑 `themes`
- **24 支运势签**：编辑 `fortunes`（`rankKey` 支持 `shangshang` / `shangji` / `zhongji` / `ping`）
- **评分范围与权重**：编辑 `assets/js/app.js` 中的 `computeDaily`
- **配色与版式**：编辑 `assets/css/style.css` 顶部 CSS 变量

## 说明

本站所有文案均为原创文化娱乐内容，星象主题并非实时天文测算，不构成任何专业建议。愿你在这里获得一点安静的力量。
