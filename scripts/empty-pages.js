'use strict';

// 当没有任何文章时，默认的 index / archive generator 不会输出页面，
// 这里补齐空的首页与归档页，保证站点骨架始终可访问。
hexo.extend.generator.register('empty-pages', function (locals) {
  if (locals.posts.length > 0) return [];

  return [
    {
      path: 'index.html',
      layout: ['index'],
      data: { type: 'index' }
    },
    {
      path: 'archives/index.html',
      layout: ['archive'],
      data: { type: 'archive' }
    }
  ];
});
