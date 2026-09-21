'use strict';

const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..', 'source', 'news');
if (!fs.existsSync(root)) process.exit(0);

const errors = [];
const forbidden = /(?:\bEnglish\s*[.:：]|\bVocabulary\b|可积累表达|词汇表达|中文解读|Language Review|今日英语复习|今日翻译自测||<\s*(?:script|iframe|object|embed)\b|\bon\w+\s*=|javascript:|data:)/i;

for (const entry of fs.readdirSync(root, { withFileTypes: true })) {
  if (!entry.isDirectory()) continue;
  const issueDate = entry.name;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(issueDate)) continue;
  const file = path.join(root, issueDate, 'index.md');
  if (!fs.existsSync(file)) {
    errors.push(`${issueDate}: 缺少 index.md`);
    continue;
  }

  const raw = fs.readFileSync(file, 'utf8');
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
  if (!match) {
    errors.push(`${issueDate}: frontmatter 格式错误`);
    continue;
  }
  const frontmatter = match[1];
  const body = match[2];
  const required = [
    /^layout:\s*news-detail\s*$/m,
    /^news_issue:\s*true\s*$/m,
    /^title:\s*.+$/m,
    new RegExp(`^date:\\s*${issueDate}(?:\\s|$)`, 'm')
  ];
  if (required.some((pattern) => !pattern.test(frontmatter))) {
    errors.push(`${issueDate}: 缺少或不匹配的栏目元数据`);
  }
  if (/^description:\s*.+$/m.test(frontmatter)) {
    errors.push(`${issueDate}: 不要添加整期主题罗列式简介`);
  }
  if (forbidden.test(raw)) {
    errors.push(`${issueDate}: 含英文摘要、词汇练习或对话专用标记`);
  }
  const sections = body.split(/^##\s+/m);
  if (sections[0].trim()) {
    errors.push(`${issueDate}: 正文应直接从第一条消息开始`);
  }
  const items = sections.slice(1);
  if (items.length === 0) errors.push(`${issueDate}: 至少需要一条消息`);
  items.forEach((item, index) => {
    for (const heading of ['解读', '为什么值得关注', '来源']) {
      if (!new RegExp(`^###\\s+${heading}\\s*$`, 'm').test(item)) {
        errors.push(`${issueDate} 第 ${index + 1} 条: 缺少「${heading}」`);
      }
    }
    if (!/\]\(https:\/\/[^\s)]+\)/.test(item)) {
      errors.push(`${issueDate} 第 ${index + 1} 条: 缺少 HTTPS 来源链接`);
    }
    for (const image of item.matchAll(/!\[([^\]]*)\]\(([^\s)]+)\)/g)) {
      const localPath = image[2];
      const imagePath = path.join(__dirname, '..', 'source', localPath.slice(1));
      if (!image[1].trim() || !localPath.startsWith(`/images/news/${issueDate}/`) || localPath.includes('..') || !/\.(?:svg|png|webp)$/i.test(localPath) || !fs.existsSync(imagePath)) {
        errors.push(`${issueDate} 第 ${index + 1} 条: 图片缺少替代文本、路径错误或文件不存在`);
      } else if (/\.svg$/i.test(localPath)) {
        const svg = fs.readFileSync(imagePath, 'utf8');
        if (/<\s*(?:script|foreignObject|image)\b|\bon\w+\s*=|(?:href|xlink:href)\s*=\s*["'](?!#)|url\(\s*["']?(?:https?:|data:)/i.test(svg)) {
          errors.push(`${issueDate} 第 ${index + 1} 条: SVG 含不安全的脚本或外部资源`);
        }
      }
    }
  });
}

if (errors.length) {
  console.error('消息栏目校验失败：\n' + errors.join('\n'));
  process.exit(1);
}

console.log('消息栏目校验通过。');
