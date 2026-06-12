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

