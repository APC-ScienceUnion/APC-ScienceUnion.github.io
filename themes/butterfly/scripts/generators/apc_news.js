/**
 * 联萌新闻：按年份生成分页
 */

'use strict'

const moment = require('moment')

function buildRoutes (items, english) {
  const all = (items || []).slice().sort(function (a, b) {
    return new Date(b.start) - new Date(a.start)
  })

  if (!all.length) return []

  const byYear = {}
  all.forEach(function (item) {
    const year = String(moment(item.start).year())
    if (!byYear[year]) byYear[year] = []
    byYear[year].push(item)
  })

  const years = Object.keys(byYear).sort(function (a, b) { return b - a })
  const latestYear = years[0]
  const routes = []
  const basePath = english ? 'en/apc-news' : 'apc-news'

  years.forEach(function (year, idx) {
    const yearNum = +year
    routes.push({
      path: year === latestYear ? `${basePath}/index.html` : `${basePath}/${year}/index.html`,
      layout: ['page'],
      data: {
        type: 'apc-news',
        title: english ? 'APC News' : '联萌新闻',
        lang: english ? 'en' : 'zh-CN',
        aside: true,
        __apcNews: true,
        date: new Date(`${year}-06-09`),
        posts: byYear[year],
        apc_news_year: yearNum,
        apc_news_years: years.map(Number),
        apc_news_newer_year: idx > 0 ? +years[idx - 1] : 0,
        apc_news_older_year: idx < years.length - 1 ? +years[idx + 1] : 0
      }
    })
  })

  return routes
}

hexo.extend.generator.register('apc-news', function (locals) {
  return [].concat(
    buildRoutes(locals.data.apc_news, false),
    buildRoutes(locals.data.apc_news_en, true)
  )
})
