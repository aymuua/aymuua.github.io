'use strict';

const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');

const assetVersions = new Map();

hexo.extend.helper.register('gridspace_asset_url', function gridspaceAssetUrl(assetPath) {
  const normalizedPath = String(assetPath).replace(/^\/+/, '');
  const sourcePath = path.join(hexo.theme_dir, 'source', normalizedPath);

  if (!assetVersions.has(sourcePath)) {
    if (!fs.existsSync(sourcePath)) {
      throw new Error(`Gridspace asset not found: ${sourcePath}`);
    }

    const digest = crypto
      .createHash('sha256')
      .update(fs.readFileSync(sourcePath))
      .digest('hex')
      .slice(0, 12);

    assetVersions.set(sourcePath, digest);
  }

  const url = this.url_for(`/${normalizedPath}`);
  return `${url}?v=${assetVersions.get(sourcePath)}`;
});
