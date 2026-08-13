'use strict';

// 在 Markdown 渲染阶段保护数学公式（$$ 块级 / $ 行内），
// 避免 marked 把公式里的 `\\`、`&`、`_` 等当作 Markdown 语法破坏。
// 输出保持纯 `$$...$$` / `$...$` 形式，交由 hexo-filter-mathjax 做服务端渲染。
hexo.extend.filter.register('marked:extensions', extensions => {
  extensions.push({
    name: 'blockMath',
    level: 'block',
    start(source) {
      return source.indexOf('$$');
    },
    tokenizer(source) {
      const match = /^\s{0,3}\$\$\s*\n?([\s\S]+?)\n?\s*\$\$(?:\n|$)/.exec(source);
      if (!match) return undefined;
      return { type: 'blockMath', raw: match[0], math: match[1] };
    },
    renderer(token) {
      return `\n$$${token.math}$$\n`;
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
      return { type: 'inlineMath', raw: match[0], math: match[1] };
    },
    renderer(token) {
      return `$${token.math}$`;
    }
  });
});
