'use strict';

const path = require('node:path');
const fs = require('node:fs');
function topicFor(page) {
  const key = page.translation_key || path.posix.basename(String(page.source || page.slug || page.path).replace(/\\/g, '/')).replace(/\.md$/i, '');
  return '/articles/' + encodeURIComponent(key.normalize('NFC'));
}
hexo.extend.helper.register('community_topic', topicFor);
hexo.extend.helper.register('visitor_stats_url', function () {
  const value = this.config.visitor_stats?.api_url || '';
  if (value && !/^https:\/\/[^/]+$/.test(value)) throw new Error('visitor_stats.api_url must be an HTTPS origin.');
  return value;
});
hexo.extend.helper.register('image_host_url', function () {
  const value=process.env.IMAGE_HOST_URL || this.config.image_server?.url || '';
  if(value && !/^https:\/\/[^/]+$/.test(value))throw new Error('IMAGE_HOST_URL must be an HTTPS origin.');
  return value;
});
hexo.extend.helper.register('daily_wallpaper_url', function () {
  const snapshot=JSON.parse(fs.readFileSync(path.join(hexo.source_dir,'images/daily/daily-images.json'),'utf8'));
  const image=snapshot.providers?.bing?.local_url;
  return typeof image==='string' && image.startsWith('/images/daily/') ? image : '/img/site/asset-b01097236e.png';
});
hexo.extend.helper.register('community_api_url', function () {
  const value = process.env.COMMUNITY_API_URL || this.config.community?.api_url || '';
  if (value && !/^https:\/\/[^/]+$/.test(value)) throw new Error('COMMUNITY_API_URL must be an HTTPS origin, without a trailing slash.');
  return value;
});
hexo.extend.generator.register('community-topics', function (locals) {
  return { path: 'community-topics.json', data: JSON.stringify({ version: 1, topics: [...new Set(locals.posts.toArray().map(topicFor))].sort() }) };
});
