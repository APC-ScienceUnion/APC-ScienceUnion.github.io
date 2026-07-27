/**
 * 首頁分類橫條：拖動橫向滾動；僅在真正拖動後才攔截點擊，避免誤觸跳轉。
 */
(function () {
  const DRAG_THRESHOLD = 8

  function initHomeCategoryBarDrag () {
    const list = document.querySelector('.home-category-bar-list')
    if (!list || list.dataset.dragBound === '1') return
    list.dataset.dragBound = '1'

    let active = false
    let dragged = false
    let startX = 0
    let scrollStart = 0

    const finish = () => {
      if (dragged) {
        const blockClickOnce = (ev) => {
          ev.preventDefault()
          ev.stopPropagation()
          list.removeEventListener('click', blockClickOnce, true)
        }
        list.addEventListener('click', blockClickOnce, true)
      }
      active = false
      dragged = false
      list.classList.remove('is-dragging')
    }

    list.addEventListener('pointerdown', (e) => {
      if (e.pointerType === 'mouse' && e.button !== 0) return
      active = true
      dragged = false
      startX = e.clientX
      scrollStart = list.scrollLeft
    })

    list.addEventListener('pointermove', (e) => {
      if (!active) return
      const dx = e.clientX - startX
      if (!dragged && Math.abs(dx) > DRAG_THRESHOLD) {
        dragged = true
        list.classList.add('is-dragging')
      }
      if (dragged) {
        e.preventDefault()
        list.scrollLeft = scrollStart - dx
      }
    })

    list.addEventListener('pointerup', finish)
    list.addEventListener('pointercancel', finish)
  }

  function boot () {
    initHomeCategoryBarDrag()
  }

  document.addEventListener('DOMContentLoaded', boot)
  document.addEventListener('pjax:complete', boot)
})()
