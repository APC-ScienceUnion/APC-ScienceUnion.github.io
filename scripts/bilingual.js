'use strict';

const pagination = require('hexo-pagination');
const { sort } = require('timsort');
const searchXmlGenerator = require('hexo-generator-search/lib/xml_generator');

const ENGLISH_PREFIX = 'en/';

const CATEGORY_TRANSLATIONS = Object.freeze({
  '天文历法': { name: 'Astronomy & Calendars', slug: 'astronomy-calendars' },
  '生命科学': { name: 'Life Sciences', slug: 'life-sciences' },
  '数学': { name: 'Mathematics', slug: 'mathematics' },
  '计算机科学': { name: 'Computer Science', slug: 'computer-science' },
  '人文历史': { name: 'Humanities & History', slug: 'humanities-history' },
  '物理学': { name: 'Physics', slug: 'physics' },
  '社会经济': { name: 'Society & Economics', slug: 'society-economics' },
  '航空航天': { name: 'Aerospace', slug: 'aerospace' },
  '化学': { name: 'Chemistry', slug: 'chemistry' },
  '地球科学': { name: 'Earth Science', slug: 'earth-science' },
  '心理学': { name: 'Psychology', slug: 'psychology' },
  '联盟活动': { name: 'APC Activities', slug: 'apc-activities' }
});

function collectionData(collection) {
  if (!collection) return [];
  if (Array.isArray(collection)) return collection;
  if (Array.isArray(collection.data)) return collection.data;
  if (typeof collection.toArray === 'function') return collection.toArray();
  return [];
}

function isEnglish(item) {
  if (!item) return false;
  const language = String(item.lang || item.language || '').toLowerCase();
  const source = String(item.source || '').replace(/\\/g, '/');
  return language === 'en' || language.startsWith('en-') || source.startsWith('_posts/en/');
}

function cleanPublicPath(value) {
  const path = String(value || '').replace(/\\/g, '/').replace(/^\/+/, '');
  return `/${path.replace(/(?:^|\/)index\.html$/i, '/').replace(/\/{2,}/g, '/')}`
    .replace(/\/{2,}/g, '/');
}

function postQuery(ctx, posts) {
  const Query = ctx.model('Post').Query;
  return new Query(posts);
}

function pageQuery(ctx, pages) {
  const Query = ctx.model('Page').Query;
  return new Query(pages);
}

function postsForLanguage(ctx, posts, english) {
  return postQuery(ctx, collectionData(posts).filter(post => isEnglish(post) === english));
}

function categoryNames(post) {
  return collectionData(post && post.categories)
    .map(category => String(category && category.name ? category.name : category || '').trim())
    .filter(Boolean);
}

function englishCategoryData(posts) {
  const allPosts = collectionData(posts);
  const englishByKey = new Map(
    allPosts
      .filter(isEnglish)
      .map(post => [String(post.translation_key || ''), post])
      .filter(([key]) => key)
  );
  const groups = new Map(
    Object.entries(CATEGORY_TRANSLATIONS).map(([key, localized]) => [
      key,
      { key, name: localized.name, slug: localized.slug, path: `/en/categories/${localized.slug}/`, posts: [] }
    ])
  );

  allPosts.filter(post => !isEnglish(post)).forEach(chinesePost => {
    const key = String(chinesePost.translation_key || chinesePost.slug || '');
    const englishPost = englishByKey.get(key);
    if (!englishPost) return;
    categoryNames(chinesePost).forEach(category => {
      const group = groups.get(category);
      if (group) group.posts.push(englishPost);
    });
  });

  return [...groups.values()]
    .filter(group => group.posts.length)
    .map(group => ({ ...group, length: group.posts.length }))
    .sort((left, right) => right.length - left.length || left.name.localeCompare(right.name, 'en'));
}

hexo.extend.helper.register('bilingual_categories', function bilingualCategories() {
  return englishCategoryData(hexo.locals.get('posts'))
    .map(({ posts, ...category }) => category);
});

function pairedPostInfo(page) {
  const posts = collectionData(hexo.locals.get('posts'));
  const english = isEnglish(page);
  const key = String(page.translation_key || (!english && page.slug) || '');
  const isArticle = Boolean(page.__post || page.layout === 'post');
  let chinesePost;
  let englishPost;

  if (isArticle && key) {
    chinesePost = posts.find(post => !isEnglish(post) && String(post.translation_key || post.slug) === key);
    englishPost = posts.find(post => isEnglish(post) && String(post.translation_key || '') === key);
  }

  if (chinesePost && englishPost) {
    const zhPath = cleanPublicPath(chinesePost.path);
    const enPath = cleanPublicPath(englishPost.path);
    return {
      language: english ? 'en' : 'zh-CN',
      targetLanguage: english ? 'zh-CN' : 'en',
      switchPath: english ? zhPath : enPath,
      zhPath,
      enPath,
      paired: true
    };
  }

  const currentPath = cleanPublicPath(page.path);

  if (page.__englishCategories || (!english && currentPath === '/categories/')) {
    return {
      language: english ? 'en' : 'zh-CN',
      targetLanguage: english ? 'zh-CN' : 'en',
      switchPath: english ? '/categories/' : '/en/categories/',
      zhPath: '/categories/',
      enPath: '/en/categories/',
      paired: true
    };
  }

  const categoryKey = String(page.category_key || page.category || '');
  const localizedCategory = CATEGORY_TRANSLATIONS[categoryKey];
  if (localizedCategory && page.category) {
    const paginationMatch = currentPath.match(/\/page\/\d+\/$/u);
    const paginationSuffix = paginationMatch ? paginationMatch[0].replace(/^\//u, '') : '';
    const zhPath = `/categories/${categoryKey}/${paginationSuffix}`;
    const enPath = `/en/categories/${localizedCategory.slug}/${paginationSuffix}`;
    return {
      language: english ? 'en' : 'zh-CN',
      targetLanguage: english ? 'zh-CN' : 'en',
      switchPath: english ? zhPath : enPath,
      zhPath,
      enPath,
      paired: true
    };
  }

  const isEnglishIndex = english && Boolean(page.__index);
  const isChineseIndex = !english && Boolean(page.__index);

  if (isEnglishIndex || isChineseIndex) {
    const zhPath = currentPath.replace(/^\/en(?=\/)/u, '') || '/';
    const enPath = currentPath.startsWith('/en/')
      ? currentPath
      : currentPath === '/'
        ? '/en/'
        : `/en${currentPath}`.replace(/\/{2,}/g, '/');
    return {
      language: english ? 'en' : 'zh-CN',
      targetLanguage: english ? 'zh-CN' : 'en',
      switchPath: english ? zhPath : enPath,
      zhPath,
      enPath,
      paired: true
    };
  }

  if (page.archive && !page.category && !page.tag) {
    const withoutEnglish = currentPath.replace(/^\/en\//, '/');
    const withEnglish = currentPath.startsWith('/en/')
      ? currentPath
      : `/en${currentPath}`.replace(/\/{2,}/g, '/');
    return {
      language: english ? 'en' : 'zh-CN',
      targetLanguage: english ? 'zh-CN' : 'en',
      switchPath: english ? withoutEnglish : withEnglish,
      zhPath: withoutEnglish,
      enPath: withEnglish,
      paired: true
    };
  }

  return {
    language: english ? 'en' : 'zh-CN',
    targetLanguage: english ? 'zh-CN' : 'en',
    switchPath: english ? '/' : '/en/',
    zhPath: english ? '/' : currentPath,
    enPath: english ? currentPath : '/en/',
    paired: false
  };
}

hexo.extend.helper.register('bilingual_info', pairedPostInfo);

function bilingualPostGenerator(locals) {
  const posts = locals.posts.sort('-date').toArray();
  const groups = [posts.filter(post => !isEnglish(post)), posts.filter(isEnglish)];

  groups.forEach(group => {
    group.forEach((post, index) => {
      post.prev = index > 0 ? group[index - 1] : null;
      post.next = index < group.length - 1 ? group[index + 1] : null;
    });
  });

  return posts.map(post => {
    const { path, layout } = post;
    if (!layout || layout === 'false') return { path, data: post.content };

    const layouts = ['post', 'page', 'index'];
    if (layout !== 'post') layouts.unshift(layout);
    post.__post = true;
    return { path, layout: layouts, data: post };
  });
}

function bilingualIndexGenerator(locals) {
  const config = this.config;
  const paginationDir = config.pagination_dir || 'page';
  const perPage = config.index_generator.per_page;
  const orderBy = config.index_generator.order_by;

  const makeIndex = (english, basePath) => {
    const posts = postsForLanguage(this, locals.posts, english).sort(orderBy);
    sort(posts.data, (a, b) => (b.sticky || 0) - (a.sticky || 0));
    return pagination(basePath, posts, {
      perPage,
      layout: ['index', 'archive'],
      format: `${paginationDir}/%d/`,
      data: {
        __index: true,
        lang: english ? 'en' : 'zh-CN',
        aside: true
      }
    });
  };

  return [].concat(
    makeIndex(false, config.index_generator.path || ''),
    makeIndex(true, ENGLISH_PREFIX)
  );
}

function generateArchives(ctx, posts, archiveDir, language) {
  const config = ctx.config;
  const paginationDir = config.pagination_dir || 'page';
  const perPage = config.archive_generator.per_page;
  const allPosts = posts.sort(config.archive_generator.order_by || '-date');
  const result = [];
  if (!allPosts.length) return result;
  if (!archiveDir.endsWith('/')) archiveDir += '/';

  const generate = (path, pagePosts, options = {}) => {
    result.push(...pagination(path, pagePosts, {
      perPage,
      layout: ['archive', 'index'],
      format: `${paginationDir}/%d/`,
      data: Object.assign({
        archive: true,
        lang: language,
        aside: true
      }, options)
    }));
  };

  generate(archiveDir, allPosts);
  if (!config.archive_generator.yearly) return result;

  const buckets = {};
  allPosts.forEach(post => {
    const year = post.date.year();
    const month = post.date.month() + 1;
    if (!buckets[year]) buckets[year] = Array.from({ length: 13 }, () => []);
    buckets[year][0].push(post);
    buckets[year][month].push(post);
  });

  const Query = ctx.model('Post').Query;
  Object.keys(buckets).forEach(yearValue => {
    const year = Number(yearValue);
    const yearBuckets = buckets[year];
    const yearPath = `${archiveDir}${year}/`;
    generate(yearPath, new Query(yearBuckets[0]), { year });
    if (!config.archive_generator.monthly) return;
    for (let month = 1; month <= 12; month += 1) {
      if (!yearBuckets[month].length) continue;
      generate(`${yearPath}${String(month).padStart(2, '0')}/`, new Query(yearBuckets[month]), {
        year,
        month
      });
    }
  });

  return result;
}

function bilingualArchiveGenerator(locals) {
  const chinesePosts = postsForLanguage(this, locals.posts, false);
  const englishPosts = postsForLanguage(this, locals.posts, true);
  const archiveDir = this.config.archive_dir || 'archives';
  return [].concat(
    generateArchives(this, chinesePosts, archiveDir, 'zh-CN'),
    generateArchives(this, englishPosts, `${ENGLISH_PREFIX}${archiveDir}`, 'en')
  );
}

function bilingualSearchGenerator(locals) {
  const originalPath = this.config.search.path;
  const outputs = [];

  const generate = (english, outputPath) => {
    const filteredLocals = Object.assign({}, locals, {
      posts: postsForLanguage(this, locals.posts, english),
      pages: pageQuery(this, collectionData(locals.pages).filter(page => isEnglish(page) === english))
    });
    this.config.search.path = outputPath;
    const generated = searchXmlGenerator.call(this, filteredLocals);
    // Hexo prefixes explicit front-matter permalinks with a slash.  The search
    // template also prepends config.root, which would otherwise emit `//en/…`
    // and make browsers treat `en` as a hostname instead of a local route.
    if (english && generated && typeof generated.data === 'string') {
      generated.data = generated.data
        .replace(/(<link\s+href=")\/{2,}/gu, '$1/')
        .replace(/(<url>)\/{2,}/gu, '$1/');
    }
    outputs.push(generated);
  };

  try {
    generate(false, originalPath);
    generate(true, `${ENGLISH_PREFIX}${originalPath}`);
  } finally {
    this.config.search.path = originalPath;
  }
  return outputs;
}

function bilingualEnglishCategoryGenerator(locals) {
  const categoryDir = this.config.category_dir || 'categories';
  const perPage = this.config.category_generator.per_page || this.config.per_page || 10;
  const paginationDir = this.config.pagination_dir || 'page';
  const categories = englishCategoryData(locals.posts);
  const routes = [{
    path: `${ENGLISH_PREFIX}${categoryDir}/`,
    layout: ['en-categories', 'page'],
    data: {
      title: 'Categories',
      lang: 'en',
      aside: true,
      __englishCategories: true
    }
  }];

  categories.forEach(category => {
    const posts = postQuery(this, category.posts).sort('-date');
    routes.push(...pagination(`${ENGLISH_PREFIX}${categoryDir}/${category.slug}/`, posts, {
      perPage,
      layout: ['category', 'archive', 'index'],
      format: `${paginationDir}/%d/`,
      data: {
        category: category.name,
        category_key: category.key,
        lang: 'en',
        aside: true,
        __englishCategory: true
      }
    }));
  });
  return routes;
}

// External generators are loaded before project scripts, so registering the
// same names here deliberately replaces their mixed-language implementations.
hexo.extend.generator.register('post', bilingualPostGenerator);
hexo.extend.generator.register('index', bilingualIndexGenerator);
hexo.extend.generator.register('archive', bilingualArchiveGenerator);
hexo.extend.generator.register('xml', bilingualSearchGenerator);
hexo.extend.generator.register('bilingual-english-categories', bilingualEnglishCategoryGenerator);

hexo.extend.filter.register('template_locals', function filterSitePostsByLanguage(locals) {
  const english = isEnglish(locals.page);
  const filteredPosts = postsForLanguage(this, locals.site.posts, english);
  const site = Object.assign(Object.create(Object.getPrototypeOf(locals.site)), locals.site);
  site.posts = filteredPosts;
  locals.site = site;

  // Only Hexo listing pages contain Post models here.  Custom generators such
  // as APC News also use a `page.posts` field for their own plain data; turning
  // that array into a Post query corrupts those pages.
  if (locals.page.posts && (locals.page.__index || locals.page.archive)) {
    locals.page.posts = postsForLanguage(this, locals.page.posts, english);
  }
  return locals;
}, 20);
