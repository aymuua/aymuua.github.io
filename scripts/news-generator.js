'use strict';

hexo.extend.generator.register('news', function (locals) {
  const issues = locals.pages.toArray()
    .filter(function (page) { return page.news_issue === true; })
    .sort(function (a, b) { return b.date.valueOf() - a.date.valueOf(); });

  return [{
    path: 'news/index.html',
    layout: ['news'],
    data: {
      title: '最新消息学习',
      description: '机器人与 AI 的每日精选：中文解读、研究意义与原始来源。',
      issues: issues
    }
  }];
});
