# 发布清单

> 每次发布文章前，对照这份清单检查要提交的内容。本文件不发布到站点。

## 一篇文章要提交什么

| 情况 | 要提交 |
| --- | --- |
| 任何文章 | 文章 Markdown（`source/_posts/标题.md`） |
| 文章含图片 | 图片文件（`source/images/`，见下） |
| 开新系列 | `source/_data/series.yml` 增加系列定义 |

其余全部自动生成，**不需要提交**：`db.json`、`public/`、标签页、归档、搜索索引。

---

## 1. 文章 frontmatter 模板

```yaml
---
title: 文章标题
date: 2026-08-13 19:00:00
type: note
series: robot-leg-design
tags: [标签1, 标签2]
description: 一句话摘要
mathjax: true
---
```

字段说明：

| 字段 | 取值 | 说明 |
| --- | --- | --- |
| `title` | 任意 | 文章标题 |
| `date` | `YYYY-MM-DD HH:mm:ss` | 发布日期，决定排序 |
| `type` | `note` / `reflection` / `log` | 笔记（推导）· 心得（观点）· 日志（记录） |
| `series` | 系列 id | `robot-leg-design` / `robotics-fundamentals` |
| `tags` | 2–4 个 | 标签数组 |
| `description` | 一句话 | 列表页摘要 + SEO |
| `mathjax` | `true` / 省略 | 含公式时写 `true`，否则省略 |

---

## 2. 代码高亮

代码块必须在开头标注语言，主题会自动显示语言名并按对应语法高亮：

````markdown
```matlab
A = [1, 2; 3, 4];
```

```python
import numpy as np
```
````

常用标记：`matlab`、`python`、`cpp`、`javascript`、`typescript`、`bash`、`yaml`、`json`。未标注的代码块会尝试自动识别，但建议始终显式标注，避免误判。

---

## 3. 图片

- 目录：`source/images/`（可按系列再分：`source/images/robot-leg-design/`）
- 引用：`![](/images/xxx.jpg)`
- 首次使用手动创建该目录

---

## 4. 开新系列

在 `source/_data/series.yml` 末尾加一条：

```yaml
- id: 系列id
  index: "02"
  name: 中文名
  english: English Name
  description: 一句话描述
  status: 持续更新
```

然后把文章的 `series` 字段改成新系列的 id。

---

## 5. 发布命令

```bash
npx hexo server      # 本地预览 http://localhost:4000
npx hexo generate    # 生成静态文件
npx hexo deploy      # 部署到 GitHub Pages
```
