'use strict';

const fs = require('node:fs');
const path = require('node:path');
const { buildImagePlan } = require('../tools/publish_categorized_images');

hexo.extend.filter.register('after_generate', function remapCategorizedImageRoutes() {
  const sourceRoot = path.join(this.source_dir, 'images');
  const plan = buildImagePlan({ sourceRoot });
  const remaps = plan.records.filter(record => record.categorized);
  const routes = new Set(this.route.list().map(route => this.route.format(route)));

  for (const record of remaps) {
    const sourceRoute = this.route.format(record.sourceRoute);
    const publicRoute = this.route.format(record.publicRoute);
    if (!routes.has(sourceRoute)) throw new Error(`missing generated categorized image route: ${sourceRoute}`);
    if (routes.has(publicRoute) && publicRoute !== sourceRoute) {
      throw new Error(`flattened image route collision: ${sourceRoute} -> ${publicRoute}`);
    }
  }

  for (const record of remaps) {
    const sourceRoute = this.route.format(record.sourceRoute);
    const publicRoute = this.route.format(record.publicRoute);
    this.route.set(publicRoute, () => fs.createReadStream(record.sourceFile));
    this.route.remove(sourceRoute);
    routes.delete(sourceRoute);
    routes.add(publicRoute);
  }

  this.log.info(
    'Remapped %d categorized image route(s) to their legacy flat /images/ URLs.',
    remaps.length
  );
}, 1);
