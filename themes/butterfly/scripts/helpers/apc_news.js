/**

 * 联萌新闻页：Markdown 渲染与活动状态计算

 */



'use strict'



const moment = require('moment')



function buildGallery (imgs) {

  if (!imgs || imgs.length === 0) return ''

  const items = imgs.map(img => `<div class="apc-news-gallery-item">${img}</div>`).join('')

  return `<div class="apc-news-gallery">${items}</div>`

}



function splitParagraphTextAndImgs (inner) {

  const imgs = inner.match(/<img\b[^>]*>/gi) || []

  let textPart = inner.replace(/<img\b[^>]*>/gi, '')

  textPart = textPart.replace(/(<br\s*\/?>\s*)+$/gi, '').trim()

  const hasText = textPart.replace(/<br\s*\/?>/gi, '').replace(/&nbsp;/gi, ' ').trim().length > 0

  return { imgs, textPart, hasText }

}



// 将连续的图片段落合并为横向画廊容器

function wrapImageGalleries (html) {

  // 处理含图片的段落（含「文字 + 多图同段」的常见写法）

  html = html.replace(/<p>([\s\S]*?)<\/p>/gi, (match, inner) => {

    if (!/<img\b/i.test(inner)) return match

    const { imgs, textPart, hasText } = splitParagraphTextAndImgs(inner)

    if (imgs.length === 0) return match

    if (hasText) return `<p>${textPart}</p>${buildGallery(imgs)}`

    return buildGallery(imgs)

  })



  // 合并相邻画廊（多个仅含图片的段落）

  html = html.replace(/(?:<div class="apc-news-gallery">(?:\s*<div class="apc-news-gallery-item">[\s\S]*?<\/div>\s*)+<\/div>\s*)+/gi, block => {

    const imgs = block.match(/<img\b[^>]*>/gi)

    if (!imgs || imgs.length === 0) return block

    return buildGallery(imgs)

  })



  return html

}



hexo.extend.helper.register('apc_md', function (content) {

  if (!content) return ''

  const html = hexo.render.renderSync({ text: content, engine: 'markdown' })

  return wrapImageGalleries(html)

})



hexo.extend.helper.register('apc_status', function (start, end) {

  const now = moment()

  const startDate = moment(start).startOf('day')

  const endDate = moment(end || start).endOf('day')



  if (now.isBefore(startDate)) {

    return { text: '筹备中', class: 'status-upcoming' }

  }

  if (now.isAfter(endDate)) {

    return { text: '已结束', class: 'status-ended' }

  }

  return { text: '进行中', class: 'status-ongoing' }
})

hexo.extend.helper.register('apc_news_year_url', function (year, years) {
  if (!years || !years.length) return this.url_for('/apc-news/')
  if (+year === +years[0]) return this.url_for('/apc-news/')
  return this.url_for('/apc-news/' + year + '/')
})

/** 返回当前进行中的联萌新闻（按 start 倒序） */
hexo.extend.helper.register('apc_ongoing_news', function () {
  const items = (this.site.data.apc_news || []).slice()
  const now = moment()

  return items.filter(function (item) {
    const startDate = moment(item.start).startOf('day')
    const endDate = moment(item.end || item.start).endOf('day')
    return !now.isBefore(startDate) && !now.isAfter(endDate)
  }).sort(function (a, b) {
    return new Date(b.start) - new Date(a.start)
  })
})

/** 首页新闻框：Markdown 转纯文本摘要 */
hexo.extend.helper.register('apc_news_excerpt', function (content, length) {
  length = length || 200
  if (!content) return ''
  const html = hexo.render.renderSync({ text: content, engine: 'markdown' })
  const text = html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
  return text.length > length ? text.slice(0, length) + '…' : text
})

