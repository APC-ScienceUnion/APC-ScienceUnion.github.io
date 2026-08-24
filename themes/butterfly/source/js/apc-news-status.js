/**
 * 联萌新闻：在浏览器端按 start/end 刷新活动状态（静态站构建时写入的状态会过期）
 */
(function () {
  var english = String(document.documentElement.lang || '').toLowerCase().indexOf('en') === 0
  var STATUS = english
    ? {
        upcoming: { text: 'Upcoming', className: 'status-upcoming' },
        ongoing: { text: 'Ongoing', className: 'status-ongoing' },
        ended: { text: 'Ended', className: 'status-ended' }
      }
    : {
        upcoming: { text: '筹备中', className: 'status-upcoming' },
        ongoing: { text: '进行中', className: 'status-ongoing' },
        ended: { text: '已结束', className: 'status-ended' }
      }

  function parseDay (value) {
    if (!value) return null
    var parts = String(value).trim().slice(0, 10).split('-')
    if (parts.length !== 3) return null
    var y = Number(parts[0])
    var m = Number(parts[1])
    var d = Number(parts[2])
    if (!y || !m || !d) return null
    return new Date(y, m - 1, d)
  }

  function getStatus (start, end) {
    var today = new Date()
    today = new Date(today.getFullYear(), today.getMonth(), today.getDate())
    var startDate = parseDay(start)
    var endDate = parseDay(end || start)
    if (!startDate || !endDate) return STATUS.ended
    if (today < startDate) return STATUS.upcoming
    if (today > endDate) return STATUS.ended
    return STATUS.ongoing
  }

  function applyStatusEl (el) {
    var start = el.getAttribute('data-start')
    var end = el.getAttribute('data-end') || start
    var status = getStatus(start, end)
    el.textContent = status.text
    el.classList.remove('status-upcoming', 'status-ongoing', 'status-ended')
    el.classList.add(status.className)
  }

  function refreshHomeNewsBox () {
    var box = document.querySelector('.home-apc-news-box')
    if (!box) return
    var tag = box.querySelector('.home-apc-news-box-tag')
    if (!tag) return
    var start = tag.getAttribute('data-start')
    var end = tag.getAttribute('data-end') || start
    var status = getStatus(start, end)
    if (status.className !== 'status-ongoing') {
      box.style.display = 'none'
      return
    }
    applyStatusEl(tag)
  }

  function init () {
    document.querySelectorAll('.apc-status[data-start]').forEach(applyStatusEl)
    refreshHomeNewsBox()
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init)
  } else {
    init()
  }
})()
