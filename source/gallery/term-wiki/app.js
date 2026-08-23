(function () {
  'use strict'

  const ALL_CATEGORIES = '__all__'
  const HASH_KEY = 'term'

  const onReady = callback => {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback, { once: true })
    } else {
      callback()
    }
  }

  const asText = (value, fallback = '') => {
    if (value === null || value === undefined) return fallback
    if (typeof value === 'string' || typeof value === 'number') return String(value).trim()
    return fallback
  }

  const normaliseSearchText = value => asText(value)
    .normalize('NFKC')
    .toLocaleLowerCase('zh-CN')

  const uniqueTexts = values => [...new Set(values.map(value => asText(value)).filter(Boolean))]

  const slugify = (value, fallback) => {
    const slug = normaliseSearchText(value)
      .replace(/[^\p{Letter}\p{Number}]+/gu, '-')
      .replace(/^-+|-+$/g, '')
    return slug || fallback
  }

  function normaliseKeywords (rawKeywords) {
    const values = Array.isArray(rawKeywords) ? rawKeywords : [rawKeywords]
    return uniqueTexts(values.flatMap(value => asText(value).split(/[,，;；|]/)))
  }

  function normaliseMeta (rawMeta) {
    if (Array.isArray(rawMeta)) {
      return rawMeta.map(entry => {
        if (entry && typeof entry === 'object') {
          return {
            label: asText(entry.label || entry.name || entry.key),
            value: asText(entry.value || entry.text || entry.content)
          }
        }
        return { label: '', value: asText(entry) }
      }).filter(entry => entry.value)
    }

    if (rawMeta && typeof rawMeta === 'object') {
      return Object.entries(rawMeta).map(([label, value]) => ({
        label: asText(label),
        value: Array.isArray(value) ? uniqueTexts(value).join(' · ') : asText(value)
      })).filter(entry => entry.value)
    }

    const value = asText(rawMeta)
    return value ? [{ label: '', value }] : []
  }

  function normaliseSections (rawSections) {
    if (!Array.isArray(rawSections)) return []
    return rawSections.map((section, index) => {
      if (typeof section === 'string') {
        return { title: `要点 ${index + 1}`, text: section.trim() }
      }
      if (!section || typeof section !== 'object') return null
      const textValue = Array.isArray(section.text || section.content)
        ? uniqueTexts(section.text || section.content).join('\n')
        : asText(section.text || section.content)
      return {
        title: asText(section.title || section.heading, `要点 ${index + 1}`),
        text: textValue
      }
    }).filter(section => section && (section.title || section.text))
  }

  function normaliseConfig (rawConfig) {
    const config = rawConfig && typeof rawConfig === 'object' ? rawConfig : {}
    const seenIds = new Set()
    const rawItems = Array.isArray(config.items) ? config.items : []

    const items = rawItems.map((rawItem, index) => {
      if (!rawItem || typeof rawItem !== 'object') return null
      const name = asText(rawItem.name, `未命名术语 ${index + 1}`)
      let id = asText(rawItem.id, slugify(name, `term-${index + 1}`))
      if (seenIds.has(id)) id = `${id}-${index + 1}`
      seenIds.add(id)

      const rawCategory = rawItem.category && typeof rawItem.category === 'object'
        ? rawItem.category.id || rawItem.category.name
        : rawItem.category

      const item = {
        id,
        name,
        en: asText(rawItem.en || rawItem.english),
        volume: asText(rawItem.volume),
        category: asText(rawCategory, 'uncategorised'),
        summary: asText(rawItem.summary || rawItem.description),
        sections: normaliseSections(rawItem.sections),
        keywords: normaliseKeywords(rawItem.keywords),
        meta: normaliseMeta(rawItem.meta)
      }
      return item
    }).filter(Boolean)

    const categories = []
    const categoryIds = new Set()
    const rawCategories = Array.isArray(config.categories) ? config.categories : []

    rawCategories.forEach((rawCategory, index) => {
      const category = rawCategory && typeof rawCategory === 'object'
        ? rawCategory
        : { id: rawCategory, name: rawCategory }
      const id = asText(category.id || category.value || category.name, `category-${index + 1}`)
      if (categoryIds.has(id)) return
      categoryIds.add(id)
      categories.push({
        id,
        name: asText(category.name || category.label, id),
        description: asText(category.description)
      })
    })

    items.forEach(item => {
      if (categoryIds.has(item.category)) return
      categoryIds.add(item.category)
      categories.push({
        id: item.category,
        name: item.category === 'uncategorised' ? '其他' : item.category,
        description: ''
      })
    })

    const categoryNameById = new Map(categories.map(category => [category.id, category.name]))
    items.forEach(item => {
      item.categoryName = categoryNameById.get(item.category) || item.category
      item.searchText = normaliseSearchText([
        item.name,
        item.en,
        item.volume,
        item.categoryName,
        item.summary,
        ...item.keywords,
        ...item.meta.flatMap(entry => [entry.label, entry.value]),
        ...item.sections.flatMap(section => [section.title, section.text])
      ].join(' '))
    })

    return {
      title: asText(config.title, '学科词卡 Wiki'),
      subtitle: asText(config.subtitle, '从索引进入，沿概念之间的联系继续探索。'),
      subject: asText(config.subject),
      categories,
      items
    }
  }

  function createElement (tagName, className, text) {
    const element = document.createElement(tagName)
    if (className) element.className = className
    if (text !== undefined) element.textContent = text
    return element
  }

  function setButtonState (button, selected) {
    button.classList.toggle('is-active', selected)
    button.setAttribute('aria-pressed', String(selected))
  }

  function getHashTermId (itemsById) {
    const rawHash = window.location.hash.slice(1)
    if (!rawHash) return ''

    const parameters = new URLSearchParams(rawHash)
    const parameterId = parameters.get(HASH_KEY)
    if (parameterId && itemsById.has(parameterId)) return parameterId

    try {
      const plainId = decodeURIComponent(rawHash)
      return itemsById.has(plainId) ? plainId : ''
    } catch (error) {
      return ''
    }
  }

  function buildTermUrl (id) {
    const url = new URL(window.location.href)
    url.hash = `${HASH_KEY}=${encodeURIComponent(id)}`
    return url
  }

  function clearTermHash () {
    const url = new URL(window.location.href)
    url.hash = ''
    window.history.replaceState(window.history.state, '', url)
  }

  function isTypingTarget (target) {
    return target instanceof HTMLElement && (
      target.isContentEditable ||
      ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)
    )
  }

  function initialiseTermWiki () {
    const config = normaliseConfig(window.TERM_WIKI)
    let root = document.querySelector('[data-term-wiki-root], #term-wiki')

    if (!root) {
      root = document.createElement('div')
      root.setAttribute('data-term-wiki-root', '')
      const host = document.querySelector('#article-container') || document.querySelector('main') || document.body
      host.appendChild(root)
    }

    const inferredSubject = /化学|chem/i.test(`${config.title} ${config.subtitle}`) ? 'chemistry' : 'geography'
    const subject = ['geography', 'chemistry'].includes(root.dataset.subject)
      ? root.dataset.subject
      : (['geography', 'chemistry'].includes(config.subject) ? config.subject : inferredSubject)

    root.classList.add('term-wiki')
    root.dataset.subject = subject

    root.replaceChildren()
    root.innerHTML = `
      <div class="term-wiki__toolbar">
        <label class="term-wiki__search">
          <span class="term-wiki__search-icon" aria-hidden="true">⌕</span>
          <span class="term-wiki__sr-only">搜索词卡</span>
          <input type="search" autocomplete="off" spellcheck="false" placeholder="搜索中文、English 或关键词">
          <button type="button" class="term-wiki__search-clear" data-action="clear-search" aria-label="清空搜索" hidden>×</button>
        </label>
      </div>

      <div class="term-wiki__layout">
        <aside class="term-wiki__tree" aria-label="词卡目录">
          <div class="term-wiki__tree-toolbar">
            <button type="button" class="term-wiki__tree-collapse" data-action="toggle-tree" aria-expanded="true" aria-controls="term-wiki-tree-content">
              <span class="term-wiki__tree-collapse-icon" aria-hidden="true">‹</span>
              <span class="term-wiki__tree-collapse-label">收起目录</span>
            </button>
          </div>
          <div class="term-wiki__tree-content" id="term-wiki-tree-content">
            <p class="term-wiki__tree-heading">概念目录</p>
            <div class="term-wiki__tree-list"></div>
          </div>
        </aside>

        <main class="term-wiki__index" id="term-wiki-index">
          <div class="term-wiki__index-header">
            <div>
              <p class="term-wiki__result-count" aria-live="polite"></p>
              <div class="term-wiki__filters" aria-label="按类别筛选"></div>
            </div>
            <button type="button" class="term-wiki__reset" data-action="reset-filters">重置筛选</button>
          </div>
          <div class="term-wiki__cards" aria-label="词卡索引"></div>
          <section class="term-wiki__empty" aria-live="polite" hidden>
            <span class="term-wiki__empty-mark" aria-hidden="true">∅</span>
            <h2>没有找到相符的词卡</h2>
            <p>换一个关键词，或清除类别筛选后再试。</p>
            <button type="button" data-action="reset-filters">查看全部词卡</button>
          </section>
        </main>
      </div>

      <div class="term-wiki__backdrop" data-action="close-detail" aria-hidden="true"></div>
      <aside class="term-wiki__drawer" role="dialog" aria-modal="true" aria-labelledby="term-wiki-detail-title" aria-hidden="true">
        <div class="term-wiki__drawer-toolbar">
          <button type="button" class="term-wiki__drawer-close" data-action="close-detail" aria-label="关闭详情">×</button>
          <button type="button" class="term-wiki__copy" data-action="copy-link">复制链接</button>
        </div>
        <div class="term-wiki__detail" tabindex="-1"></div>
        <nav class="term-wiki__detail-nav" aria-label="前后词条">
          <button type="button" data-action="previous-term"><span aria-hidden="true">←</span><span class="term-wiki__nav-copy"><span>上一条</span><strong></strong></span></button>
          <button type="button" data-action="next-term"><span class="term-wiki__nav-copy"><span>下一条</span><strong></strong></span><span aria-hidden="true">→</span></button>
        </nav>
      </aside>
      <div class="term-wiki__live term-wiki__sr-only" aria-live="polite" aria-atomic="true"></div>
    `

    const elements = {
      search: root.querySelector('.term-wiki__search input'),
      searchClear: root.querySelector('.term-wiki__search-clear'),
      tree: root.querySelector('.term-wiki__tree'),
      treeContent: root.querySelector('.term-wiki__tree-content'),
      treeList: root.querySelector('.term-wiki__tree-list'),
      treeCollapse: root.querySelector('.term-wiki__tree-collapse'),
      treeCollapseIcon: root.querySelector('.term-wiki__tree-collapse-icon'),
      treeCollapseLabel: root.querySelector('.term-wiki__tree-collapse-label'),
      count: root.querySelector('.term-wiki__result-count'),
      filters: root.querySelector('.term-wiki__filters'),
      reset: root.querySelector('.term-wiki__reset'),
      cards: root.querySelector('.term-wiki__cards'),
      empty: root.querySelector('.term-wiki__empty'),
      backdrop: root.querySelector('.term-wiki__backdrop'),
      drawer: root.querySelector('.term-wiki__drawer'),
      drawerClose: root.querySelector('.term-wiki__drawer-close'),
      detail: root.querySelector('.term-wiki__detail'),
      previous: root.querySelector('[data-action="previous-term"]'),
      next: root.querySelector('[data-action="next-term"]'),
      live: root.querySelector('.term-wiki__live')
    }

    const itemsById = new Map(config.items.map(item => [item.id, item]))
    const categoryCounts = new Map(config.categories.map(category => [category.id, 0]))
    config.items.forEach(item => categoryCounts.set(item.category, (categoryCounts.get(item.category) || 0) + 1))

    const state = {
      query: '',
      category: ALL_CATEGORIES,
      filteredItems: [...config.items],
      activeId: '',
      restoreFocusTo: null,
      treeCollapsed: false,
      expandedCategories: new Set(config.categories.map(category => category.id)),
      internalHashSession: false
    }

    elements.drawer.inert = true

    function announce (message) {
      elements.live.textContent = ''
      window.setTimeout(() => { elements.live.textContent = message }, 20)
    }

    function categoryButton (category, count, modifier) {
      const button = createElement('button', `term-wiki__category-button ${modifier || ''}`.trim())
      button.type = 'button'
      button.dataset.category = category.id
      button.setAttribute('aria-pressed', String(state.category === category.id))
      button.appendChild(createElement('span', '', category.name))
      button.appendChild(createElement('span', 'term-wiki__count-badge', String(count)))
      return button
    }

    function renderTree () {
      elements.treeList.replaceChildren()
      const allCategory = { id: ALL_CATEGORIES, name: '全部词卡' }
      elements.treeList.appendChild(categoryButton(allCategory, config.items.length, 'term-wiki__tree-all'))

      config.categories.forEach((category, index) => {
        const branch = createElement('section', 'term-wiki__tree-branch')
        const branchHeader = createElement('div', 'term-wiki__tree-branch-header')
        const filterButton = categoryButton(category, categoryCounts.get(category.id) || 0, 'term-wiki__tree-filter')
        const toggle = createElement('button', 'term-wiki__branch-toggle', '⌄')
        const branchId = `term-wiki-branch-${index + 1}`
        const isExpanded = state.expandedCategories.has(category.id)

        toggle.type = 'button'
        toggle.dataset.treeCategory = category.id
        toggle.setAttribute('aria-expanded', String(isExpanded))
        toggle.setAttribute('aria-controls', branchId)
        toggle.setAttribute('aria-label', `${isExpanded ? '收起' : '展开'}${category.name}`)

        const list = createElement('ul', 'term-wiki__tree-items')
        list.id = branchId
        list.hidden = !isExpanded

        config.items.filter(item => item.category === category.id).forEach(item => {
          const listItem = document.createElement('li')
          const button = createElement('button', 'term-wiki__tree-item')
          button.type = 'button'
          button.dataset.openTerm = item.id
          button.appendChild(createElement('span', 'term-wiki__tree-dot', ''))
          const copy = createElement('span', 'term-wiki__tree-item-copy')
          copy.appendChild(createElement('span', '', item.name))
          if (item.en) copy.appendChild(createElement('span', 'term-wiki__tree-item-en', item.en))
          button.appendChild(copy)
          listItem.appendChild(button)
          list.appendChild(listItem)
        })

        branchHeader.append(filterButton, toggle)
        branch.append(branchHeader, list)
        elements.treeList.appendChild(branch)
      })
    }

    function renderFilters () {
      elements.filters.replaceChildren()
      elements.filters.appendChild(categoryButton({ id: ALL_CATEGORIES, name: '全部' }, config.items.length, 'term-wiki__filter-chip'))
      config.categories.forEach(category => {
        elements.filters.appendChild(categoryButton(category, categoryCounts.get(category.id) || 0, 'term-wiki__filter-chip'))
      })
    }

    function renderCards () {
      const queryTokens = normaliseSearchText(state.query).split(/\s+/).filter(Boolean)
      state.filteredItems = config.items.filter(item => {
        const categoryMatches = state.category === ALL_CATEGORIES || item.category === state.category
        const queryMatches = queryTokens.every(token => item.searchText.includes(token))
        return categoryMatches && queryMatches
      })

      elements.cards.replaceChildren()
      state.filteredItems.forEach(item => {
        const card = createElement('button', 'term-wiki__card')
        card.type = 'button'
        card.dataset.openTerm = item.id
        card.setAttribute('aria-haspopup', 'dialog')
        card.setAttribute('aria-label', `查看${item.name}详情`)
        if (state.activeId === item.id) card.classList.add('is-current')

        const top = createElement('span', 'term-wiki__card-top')
        top.appendChild(createElement('span', 'term-wiki__card-category', item.categoryName))

        const heading = createElement('span', 'term-wiki__card-heading')
        heading.appendChild(createElement('strong', '', item.name))
        if (item.en) {
          const english = createElement('span', '', item.en)
          english.lang = 'en'
          heading.appendChild(english)
        }

        const summary = createElement('span', 'term-wiki__card-summary', item.summary || '打开词条，查看定义与扩展要点。')
        const footer = createElement('span', 'term-wiki__card-footer')
        footer.appendChild(createElement('span', '', item.volume || `${item.sections.length} 个知识段`))
        footer.appendChild(createElement('span', 'term-wiki__card-arrow', '查看详情 →'))

        card.append(top, heading, summary, footer)
        elements.cards.appendChild(card)
      })

      const hasActiveFilters = Boolean(state.query) || state.category !== ALL_CATEGORIES
      elements.count.textContent = hasActiveFilters
        ? `找到 ${state.filteredItems.length} / ${config.items.length} 个词条`
        : `共收录 ${config.items.length} 个词条`
      elements.reset.hidden = !hasActiveFilters
      elements.empty.hidden = state.filteredItems.length !== 0
      elements.cards.hidden = state.filteredItems.length === 0
      elements.searchClear.hidden = !state.query
    }

    function updateSelectedCategory () {
      root.querySelectorAll('[data-category]').forEach(button => {
        setButtonState(button, button.dataset.category === state.category)
      })
    }

    function updateCurrentTermMarkers () {
      root.querySelectorAll('[data-open-term]').forEach(button => {
        const current = button.dataset.openTerm === state.activeId
        button.classList.toggle('is-current', current)
        if (current) button.setAttribute('aria-current', 'true')
        else button.removeAttribute('aria-current')
      })
    }

    function applyFilters () {
      renderCards()
      updateSelectedCategory()
      updateCurrentTermMarkers()
    }

    function setCategory (categoryId) {
      if (categoryId !== ALL_CATEGORIES && !categoryCounts.has(categoryId)) return
      state.category = categoryId
      applyFilters()
      const category = config.categories.find(entry => entry.id === categoryId)
      announce(category ? `已筛选${category.name}，显示${state.filteredItems.length}个词条` : `已显示全部${state.filteredItems.length}个词条`)
    }

    function resetFilters () {
      state.query = ''
      state.category = ALL_CATEGORIES
      elements.search.value = ''
      applyFilters()
      announce(`已重置筛选，共${config.items.length}个词条`)
    }

    function appendDefinitionList (container, entries) {
      if (!entries.length) return
      const list = createElement('dl', 'term-wiki__meta')
      entries.forEach(entry => {
        if (entry.label) list.appendChild(createElement('dt', '', entry.label))
        list.appendChild(createElement('dd', entry.label ? '' : 'term-wiki__meta-wide', entry.value))
      })
      container.appendChild(list)
    }

    function navigationSequence () {
      const filteredIndex = state.filteredItems.findIndex(item => item.id === state.activeId)
      return filteredIndex >= 0 ? state.filteredItems : config.items
    }

    function renderDetail (item) {
      elements.detail.replaceChildren()

      const header = createElement('header', 'term-wiki__detail-header')
      const tags = createElement('div', 'term-wiki__detail-tags')
      tags.appendChild(createElement('span', '', item.categoryName))
      if (item.volume) tags.appendChild(createElement('span', '', item.volume))
      header.appendChild(tags)

      const title = createElement('h2', '', item.name)
      title.id = 'term-wiki-detail-title'
      title.tabIndex = -1
      header.appendChild(title)

      if (item.en) {
        const english = createElement('p', 'term-wiki__detail-en', item.en)
        english.lang = 'en'
        header.appendChild(english)
      }
      if (item.summary) header.appendChild(createElement('p', 'term-wiki__detail-summary', item.summary))
      elements.detail.appendChild(header)

      appendDefinitionList(elements.detail, item.meta)

      if (item.keywords.length) {
        const keywordSection = createElement('section', 'term-wiki__keyword-section')
        keywordSection.appendChild(createElement('h3', '', '关联关键词'))
        const keywordList = createElement('ul', 'term-wiki__keywords')
        item.keywords.forEach(keyword => {
          const listItem = document.createElement('li')
          listItem.textContent = keyword
          keywordList.appendChild(listItem)
        })
        keywordSection.appendChild(keywordList)
        elements.detail.appendChild(keywordSection)
      }

      item.sections.forEach(section => {
        const sectionElement = createElement('section', 'term-wiki__section')
        const sectionBody = createElement('div', 'term-wiki__section-body')
        sectionBody.appendChild(createElement('h3', '', section.title))
        if (section.text) sectionBody.appendChild(createElement('p', '', section.text))
        sectionElement.appendChild(sectionBody)
        elements.detail.appendChild(sectionElement)
      })

      if (!item.sections.length) {
        const placeholder = createElement('p', 'term-wiki__detail-placeholder', '这个词条的扩展内容仍在整理中。')
        elements.detail.appendChild(placeholder)
      }

      const sequence = navigationSequence()
      const index = sequence.findIndex(entry => entry.id === item.id)
      const previousItem = index > 0 ? sequence[index - 1] : null
      const nextItem = index >= 0 && index < sequence.length - 1 ? sequence[index + 1] : null
      const previousName = elements.previous.querySelector('strong')
      const nextName = elements.next.querySelector('strong')
      elements.previous.disabled = !previousItem
      elements.next.disabled = !nextItem
      elements.previous.dataset.targetTerm = previousItem ? previousItem.id : ''
      elements.next.dataset.targetTerm = nextItem ? nextItem.id : ''
      previousName.textContent = previousItem ? previousItem.name : '已经是第一条'
      nextName.textContent = nextItem ? nextItem.name : '已经是最后一条'
      elements.detail.scrollTop = 0
    }

    function writeTermHash (id) {
      const url = buildTermUrl(id)
      if (state.internalHashSession) {
        window.history.replaceState(window.history.state, '', url)
      } else {
        window.history.pushState(window.history.state, '', url)
        state.internalHashSession = true
      }
    }

    function showDrawer () {
      elements.drawer.classList.add('is-open')
      elements.drawer.setAttribute('aria-hidden', 'false')
      elements.drawer.inert = false
      elements.backdrop.classList.add('is-open')
      elements.backdrop.setAttribute('aria-hidden', 'false')
      document.body.classList.add('term-wiki-scroll-lock')
    }

    function openTerm (id, options = {}) {
      const item = itemsById.get(id)
      if (!item) return

      const wasOpen = Boolean(state.activeId)
      if (!wasOpen && options.rememberFocus !== false) {
        state.restoreFocusTo = document.activeElement instanceof HTMLElement ? document.activeElement : null
      }

      state.activeId = id
      renderDetail(item)
      updateCurrentTermMarkers()
      showDrawer()
      if (options.updateHash !== false) writeTermHash(id)

      if (options.focus !== false) {
        window.requestAnimationFrame(() => {
          const title = elements.detail.querySelector('#term-wiki-detail-title')
          if (title) title.focus({ preventScroll: true })
        })
      }
    }

    function hideDrawer (options = {}) {
      if (!state.activeId) return
      state.activeId = ''
      elements.drawer.classList.remove('is-open')
      elements.drawer.setAttribute('aria-hidden', 'true')
      elements.drawer.inert = true
      elements.backdrop.classList.remove('is-open')
      elements.backdrop.setAttribute('aria-hidden', 'true')
      document.body.classList.remove('term-wiki-scroll-lock')
      updateCurrentTermMarkers()

      if (options.updateHash !== false && getHashTermId(itemsById)) clearTermHash()
      state.internalHashSession = false

      if (options.restoreFocus !== false && state.restoreFocusTo && document.contains(state.restoreFocusTo)) {
        state.restoreFocusTo.focus({ preventScroll: true })
      }
      state.restoreFocusTo = null
    }

    function syncWithHash () {
      const id = getHashTermId(itemsById)
      if (id) {
        openTerm(id, { updateHash: false, focus: false, rememberFocus: false })
      } else {
        hideDrawer({ updateHash: false, restoreFocus: false })
      }
      state.internalHashSession = false
    }

    async function copyActiveLink () {
      if (!state.activeId) return
      const link = buildTermUrl(state.activeId).href
      let copied = false

      if (navigator.clipboard && window.isSecureContext) {
        try {
          await navigator.clipboard.writeText(link)
          copied = true
        } catch (error) {
          copied = false
        }
      }

      if (!copied) {
        const helper = document.createElement('textarea')
        helper.value = link
        helper.setAttribute('readonly', '')
        helper.className = 'term-wiki__copy-helper'
        document.body.appendChild(helper)
        helper.select()
        try {
          copied = document.execCommand('copy')
        } catch (error) {
          copied = false
        }
        helper.remove()
      }

      announce(copied ? '词条链接已复制' : '复制失败，请从地址栏复制当前链接')
      const copyButton = root.querySelector('[data-action="copy-link"]')
      if (copyButton) {
        const originalText = copyButton.textContent
        copyButton.textContent = copied ? '已复制' : '请手动复制'
        window.setTimeout(() => { copyButton.textContent = originalText }, 1600)
      }
    }

    function toggleTree () {
      state.treeCollapsed = !state.treeCollapsed
      root.classList.toggle('is-tree-collapsed', state.treeCollapsed)
      elements.treeCollapse.setAttribute('aria-expanded', String(!state.treeCollapsed))
      elements.treeCollapseIcon.textContent = state.treeCollapsed ? '›' : '‹'
      elements.treeCollapseLabel.textContent = state.treeCollapsed ? '展开目录' : '收起目录'
    }

    function toggleCategoryBranch (button) {
      const categoryId = button.dataset.treeCategory
      const list = document.getElementById(button.getAttribute('aria-controls'))
      if (!list) return
      const expanding = list.hidden
      list.hidden = !expanding
      button.setAttribute('aria-expanded', String(expanding))
      button.setAttribute('aria-label', `${expanding ? '收起' : '展开'}${config.categories.find(category => category.id === categoryId)?.name || '类别'}`)
      button.textContent = expanding ? '⌄' : '›'
      if (expanding) state.expandedCategories.add(categoryId)
      else state.expandedCategories.delete(categoryId)
    }

    function moveDetail (direction) {
      const button = direction === 'previous' ? elements.previous : elements.next
      const targetId = button.dataset.targetTerm
      if (targetId) openTerm(targetId, { updateHash: true, rememberFocus: false })
    }

    root.addEventListener('click', event => {
      const target = event.target instanceof Element ? event.target.closest('button, [data-action]') : null
      if (!target || !root.contains(target)) return

      if (target.dataset.category) {
        setCategory(target.dataset.category)
        return
      }
      if (target.dataset.openTerm) {
        openTerm(target.dataset.openTerm)
        return
      }
      if (target.dataset.treeCategory) {
        toggleCategoryBranch(target)
        return
      }

      switch (target.dataset.action) {
        case 'clear-search':
          state.query = ''
          elements.search.value = ''
          applyFilters()
          elements.search.focus()
          break
        case 'reset-filters':
          resetFilters()
          break
        case 'toggle-tree':
          toggleTree()
          break
        case 'close-detail':
          hideDrawer()
          break
        case 'copy-link':
          copyActiveLink()
          break
        case 'previous-term':
          moveDetail('previous')
          break
        case 'next-term':
          moveDetail('next')
          break
      }
    })

    elements.search.addEventListener('input', event => {
      state.query = event.target.value.trim()
      applyFilters()
    })

    document.addEventListener('keydown', event => {
      if (event.key === 'Escape') {
        if (state.activeId) {
          event.preventDefault()
          hideDrawer()
        } else if (document.activeElement === elements.search && elements.search.value) {
          event.preventDefault()
          state.query = ''
          elements.search.value = ''
          applyFilters()
        }
        return
      }

      if ((event.key === '/' && !isTypingTarget(event.target)) || ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k')) {
        event.preventDefault()
        elements.search.focus()
        elements.search.select()
        return
      }

      if (event.key === 'Tab' && state.activeId) {
        const focusable = [...elements.drawer.querySelectorAll('button:not([disabled]), [href], input:not([disabled]), [tabindex]:not([tabindex="-1"])')]
          .filter(element => !element.hidden && element.getClientRects().length)
        if (!focusable.length) return
        const first = focusable[0]
        const last = focusable[focusable.length - 1]
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault()
          last.focus()
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault()
          first.focus()
        }
      }
    })

    window.addEventListener('hashchange', syncWithHash)

    renderTree()
    renderFilters()
    applyFilters()
    if (window.matchMedia('(max-width: 760px)').matches) toggleTree()
    syncWithHash()
    root.dataset.ready = 'true'
  }

  onReady(initialiseTermWiki)
})()
