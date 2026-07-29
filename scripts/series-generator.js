'use strict';

hexo.extend.generator.register('series', function (locals) {
  const seriesDefs = hexo.locals.get('data').series || [];
  const allPosts = locals.posts.toArray();

  // Group posts by series frontmatter
  const postsBySeries = {};
  allPosts.forEach(function (post) {
    if (!post.series) return;
    if (!postsBySeries[post.series]) {
      postsBySeries[post.series] = [];
    }
    postsBySeries[post.series].push(post);
  });

  // Sort each series by date ascending (tutorial order)
  Object.keys(postsBySeries).forEach(function (key) {
    postsBySeries[key].sort(function (a, b) {
      return a.date.isBefore(b.date) ? -1 : 1;
    });
  });

  // Enrich series definitions with post data
  const enriched = seriesDefs.map(function (s) {
    const posts = postsBySeries[s.id] || [];
    return Object.assign({}, s, {
      posts: posts,
      postCount: posts.length
    });
  });

  const routes = [];

  // Series overview page
  routes.push({
    path: 'series/index.html',
    layout: ['series'],
    data: {
      title: '专题',
      type: 'series',
      series: enriched
    }
  });

  // Individual series detail pages
  enriched.forEach(function (s) {
    routes.push({
      path: 'series/' + s.id + '/index.html',
      layout: ['series-detail'],
      data: {
        title: s.name + ' · 专题',
        type: 'series-detail',
        series: s,
        posts: s.posts
      }
    });
  });

  return routes;
});
