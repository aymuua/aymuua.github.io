'use strict';

hexo.extend.filter.register('marked:extensions', extensions => {
  const escapeMath = math => math
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;');

  extensions.push({
    name: 'blockMath',
    level: 'block',
    start(source) {
      return source.indexOf('$$');
    },
    tokenizer(source) {
      const match = /^\s{0,3}\$\$\s*\n?([\s\S]+?)\n?\s*\$\$(?:\n|$)/.exec(source);

      if (!match) return undefined;

      return {
        type: 'blockMath',
        raw: match[0],
        math: match[1]
      };
    },
    renderer(token) {
      return `<div class="math-display">$$\n${escapeMath(token.math)}\n$$</div>\n`;
    }
  });

  extensions.push({
    name: 'inlineMath',
    level: 'inline',
    start(source) {
      return source.indexOf('$');
    },
    tokenizer(source) {
      const match = /^\$(?!\$)([^\n$]+?)\$(?!\$)/.exec(source);

      if (!match) return undefined;

      return {
        type: 'inlineMath',
        raw: match[0],
        math: match[1]
      };
    },
    renderer(token) {
      return `<span class="math-inline">$${escapeMath(token.math)}$</span>`;
    }
  });
});
