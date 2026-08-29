(function () {
  'use strict'

  const LABELS = {
    'zh-CN': {
      searchHeading: '查询荣誉证书',
      queryLabel: '证书获得者的昵称',
      queryLabelNicknameOnly: '证书获得者的昵称',
      queryPlaceholder: '输入完整 QQ 号或昵称',
      queryPlaceholderNicknameOnly: '输入完整昵称',
      queryButton: '查询',
      querying: '查询中',
      privacyNote: '昵称查询在当前页面完成；QQ 号仅在查询时发送至本站的安全查询接口，不会写入网址。',
      privacyNoteNicknameOnly: '昵称查询只在当前页面完成，不会保存或写入网址。',
      showAll: '返回全部证书',
      foundResults: '找到 {count} 张荣誉证书',
      noMatchTitle: '没有找到对应的荣誉证书',
      noMatchHelp: '请检查输入是否与证书登记的昵称一致。',
      qqUnavailable: 'QQ 查询尚未开放，目前请使用昵称查询。',
      qqFailed: 'QQ 查询暂时不可用，请稍后重试或改用昵称。',
      activityFallback: '活动 {index}',
      certificateFallback: '荣誉证书',
      activityEmpty: '证书正在整理中。',
      openCertificate: '查看{recipient}的{title}',
      defaultRecipient: '获奖者',
      defaultImageAlt: '{recipient}的{activity}荣誉证书',
      modalTitle: '荣誉证书',
      closeModal: '关闭证书',
      imageLoading: '正在载入证书……',
      imageError: '证书图片暂时无法载入。'
    },
    en: {
      searchHeading: 'Find a certificate',
      queryLabel: 'Certificate recipient nickname',
      queryLabelNicknameOnly: 'Certificate recipient nickname',
      queryPlaceholder: 'Enter a full QQ number or nickname',
      queryPlaceholderNicknameOnly: 'Enter a full nickname',
      queryButton: 'Search',
      querying: 'Searching',
      privacyNote: 'Nickname matching happens on this page. A QQ number is sent only to this site’s secure lookup service and is never written into the URL.',
      privacyNoteNicknameOnly: 'Nickname matching happens only on this page and is never saved or written into the URL.',
      showAll: 'Show all certificates',
      foundResults: '{count} certificate(s) found',
      noMatchTitle: 'No matching certificate found',
      noMatchHelp: 'Check that your entry exactly matches the nickname registered with the certificate.',
      qqUnavailable: 'QQ lookup is not available yet. Please search by nickname.',
      qqFailed: 'QQ lookup is temporarily unavailable. Try again later or search by nickname.',
      activityFallback: 'Event {index}',
      certificateFallback: 'Certificate of honour',
      activityEmpty: 'Certificates are being prepared.',
      openCertificate: 'View {recipient} — {title}',
      defaultRecipient: 'recipient',
      defaultImageAlt: '{recipient}’s certificate for {activity}',
      modalTitle: 'Certificate of honour',
      closeModal: 'Close certificate',
      imageLoading: 'Loading certificate…',
      imageError: 'The certificate image could not be loaded.'
    }
  }

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

  const normaliseNickname = value => asText(value)
    .normalize('NFKC')
    .toLocaleLowerCase('zh-CN')
    .replace(/\s+/g, '')

  const normaliseQQ = value => asText(value).normalize('NFKC').replace(/\s+/g, '')
  const isQQ = value => /^\d{5,12}$/.test(value)

  const interpolate = (template, values) => Object.entries(values).reduce(
    (result, [key, value]) => result.replaceAll(`{${key}}`, asText(value)),
    asText(template)
  )

  const localUrlPath = (value, includeHash) => {
    const source = asText(value)
    if (!source) return ''

    try {
      const url = new URL(source, window.location.origin)
      if (url.origin !== window.location.origin) return ''
      return `${url.pathname}${url.search}${includeHash ? url.hash : ''}`
    } catch (error) {
      return ''
    }
  }

  const createElement = (tagName, className, text) => {
    const element = document.createElement(tagName)
    if (className) element.className = className
    if (text !== undefined) element.textContent = text
    return element
  }

  function resolveLabels (config, locale) {
    const language = locale.toLocaleLowerCase('en-US').startsWith('en') ? 'en' : 'zh-CN'
    const rawLabels = config.labels && typeof config.labels === 'object' ? config.labels : {}
    const nestedLabels = rawLabels[locale] || rawLabels[language] || rawLabels[language === 'en' ? 'en-US' : 'zh']
    const overrides = nestedLabels && typeof nestedLabels === 'object' ? nestedLabels : rawLabels
    const labels = { ...LABELS[language] }

    Object.keys(labels).forEach(key => {
      const override = asText(overrides[key])
      if (override) labels[key] = override
    })

    return labels
  }

  function normaliseConfig (rawConfig) {
    const config = rawConfig && typeof rawConfig === 'object' ? rawConfig : {}
    const locale = asText(config.locale, document.documentElement.lang || 'zh-CN')
    const labels = resolveLabels(config, locale)
    const seenActivityIds = new Set()
    const seenCertificateIds = new Set()
    const rawActivities = Array.isArray(config.events) ? config.events : config.activities

    const activities = (Array.isArray(rawActivities) ? rawActivities : []).map((rawActivity, activityIndex) => {
      if (!rawActivity || typeof rawActivity !== 'object') return null

      let id = asText(rawActivity.id, `activity-${activityIndex + 1}`)
      if (seenActivityIds.has(id)) id = `${id}-${activityIndex + 1}`
      seenActivityIds.add(id)

      const title = asText(
        rawActivity.title,
        interpolate(labels.activityFallback, { index: activityIndex + 1 })
      )
      const certificates = (Array.isArray(rawActivity.certificates) ? rawActivity.certificates : []).map((rawCertificate, certificateIndex) => {
        if (!rawCertificate || typeof rawCertificate !== 'object') return null

        let certificateId = asText(rawCertificate.id, `${id}-certificate-${certificateIndex + 1}`)
        if (seenCertificateIds.has(certificateId)) certificateId = `${certificateId}-${certificateIndex + 1}`
        seenCertificateIds.add(certificateId)

        const recipientName = asText(rawCertificate.recipient || rawCertificate.recipientName || rawCertificate.name)
        const rawIdentifiers = rawCertificate.identifiers || rawCertificate.recipientAliases
        const identifiers = Array.isArray(rawIdentifiers) ? rawIdentifiers : [rawIdentifiers]
        const normalisedIdentifiers = [...new Set([
          recipientName,
          ...identifiers
        ].map(normaliseNickname).filter(Boolean))]
        const image = localUrlPath(rawCertificate.image || rawCertificate.src, true)
        if (!image) return null

        return {
          id: certificateId,
          activityId: id,
          activityTitle: title,
          title: asText(rawCertificate.detail || rawCertificate.title || rawCertificate.award, labels.certificateFallback),
          recipientName,
          normalisedIdentifiers,
          image,
          imageAlt: asText(
            rawCertificate.imageAlt || rawCertificate.alt,
            interpolate(labels.defaultImageAlt, {
              recipient: recipientName || labels.defaultRecipient,
              activity: title
            })
          )
        }
      }).filter(Boolean)

      return {
        id,
        title,
        date: asText(rawActivity.date),
        certificates
      }
    }).filter(Boolean)

    return {
      locale,
      labels,
      qqLookupEndpoint: localUrlPath(config.qqLookupEndpoint, false),
      activities
    }
  }

  async function lookupQQ (qq, endpoint) {
    if (!endpoint) return { unavailable: true, ids: new Set() }

    const response = await window.fetch(endpoint, {
      method: 'POST',
      credentials: 'same-origin',
      cache: 'no-store',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ qq })
    })
    if (!response.ok) throw new Error(`QQ lookup failed with ${response.status}`)

    const payload = await response.json()
    const rawIds = payload && Array.isArray(payload.certificateIds) ? payload.certificateIds : []
    return {
      unavailable: false,
      ids: new Set(rawIds.map(id => asText(id)).filter(Boolean))
    }
  }

  function addAssetVersion (path, assetVersion) {
    if (!assetVersion) return path
    const url = new URL(path, window.location.origin)
    url.searchParams.set('v', assetVersion)
    return `${url.pathname}${url.search}${url.hash}`
  }

  function initialiseHonorHall () {
    const root = document.querySelector('[data-honor-hall-root]')
    if (!root) return

    const config = normaliseConfig(window.HONOR_HALL_DATA || window.HONOR_HALL)
    const { labels } = config
    const assetVersion = /^[A-Za-z0-9._-]{1,80}$/.test(root.dataset.assetVersion || '')
      ? root.dataset.assetVersion
      : ''

    config.activities.forEach(activity => {
      activity.certificates.forEach(certificate => {
        certificate.image = addAssetVersion(certificate.image, assetVersion)
      })
    })

    root.classList.add('honor-hall')
    root.innerHTML = `
      <section class="honor-hall__search-panel" aria-labelledby="honor-hall-search-heading">
        <h2 id="honor-hall-search-heading"></h2>
        <form class="honor-hall__search-form" novalidate>
          <label class="honor-hall__sr-only" for="honor-hall-query"></label>
          <input id="honor-hall-query" name="identifier" type="search" inputmode="text" autocomplete="off" autocapitalize="none" spellcheck="false" maxlength="80">
          <button type="submit"></button>
        </form>
        <p class="honor-hall__privacy-note"></p>
      </section>
      <div class="honor-hall__result-bar" hidden>
        <p class="honor-hall__result-message" role="status" aria-live="polite"></p>
        <button type="button" data-action="show-all"></button>
      </div>
      <div class="honor-hall__gallery" aria-live="polite"></div>
    `

    const elements = {
      searchHeading: root.querySelector('#honor-hall-search-heading'),
      label: root.querySelector('label[for="honor-hall-query"]'),
      form: root.querySelector('.honor-hall__search-form'),
      input: root.querySelector('#honor-hall-query'),
      submit: root.querySelector('.honor-hall__search-form button'),
      privacyNote: root.querySelector('.honor-hall__privacy-note'),
      resultBar: root.querySelector('.honor-hall__result-bar'),
      resultMessage: root.querySelector('.honor-hall__result-message'),
      showAll: root.querySelector('[data-action="show-all"]'),
      gallery: root.querySelector('.honor-hall__gallery')
    }

    elements.searchHeading.textContent = labels.searchHeading
    elements.label.textContent = config.qqLookupEndpoint
      ? labels.queryLabel
      : labels.queryLabelNicknameOnly
    elements.input.placeholder = config.qqLookupEndpoint
      ? labels.queryPlaceholder
      : labels.queryPlaceholderNicknameOnly
    elements.submit.textContent = labels.queryButton
    elements.privacyNote.textContent = config.qqLookupEndpoint
      ? labels.privacyNote
      : labels.privacyNoteNicknameOnly
    elements.showAll.textContent = labels.showAll

    const oldPortal = document.querySelector('.honor-hall__portal')
    if (oldPortal) oldPortal.remove()

    const portal = createElement('div', 'honor-hall__portal')
    portal.innerHTML = `
      <div class="honor-hall__backdrop" data-action="close-certificate" hidden></div>
      <section class="honor-hall__modal" role="dialog" aria-modal="true" aria-labelledby="honor-hall-modal-title" aria-hidden="true">
        <header class="honor-hall__modal-header">
          <h2 id="honor-hall-modal-title" tabindex="-1"></h2>
          <button type="button" class="honor-hall__modal-close" data-action="close-certificate">×</button>
        </header>
        <div class="honor-hall__modal-image-wrap is-loading">
          <img class="honor-hall__modal-image" alt="" decoding="async">
          <p class="honor-hall__modal-loading" role="status"></p>
          <p class="honor-hall__modal-error" role="alert" hidden></p>
        </div>
      </section>
    `
    document.body.appendChild(portal)

    const modal = portal.querySelector('.honor-hall__modal')
    const backdrop = portal.querySelector('.honor-hall__backdrop')
    const modalTitle = portal.querySelector('#honor-hall-modal-title')
    const modalImageWrap = portal.querySelector('.honor-hall__modal-image-wrap')
    const modalImage = portal.querySelector('.honor-hall__modal-image')
    const modalLoading = portal.querySelector('.honor-hall__modal-loading')
    const modalError = portal.querySelector('.honor-hall__modal-error')
    const modalClose = portal.querySelector('.honor-hall__modal-close')
    modalClose.setAttribute('aria-label', labels.closeModal)
    modalLoading.textContent = labels.imageLoading
    modalError.textContent = labels.imageError

    let lastFocusedElement = null
    let inertedSiblings = []

    const setPageInert = inert => {
      if (inert) {
        inertedSiblings = [...document.body.children].filter(element => element !== portal).map(element => ({
          element,
          inert: Boolean(element.inert),
          ariaHidden: element.getAttribute('aria-hidden')
        }))
        inertedSiblings.forEach(({ element }) => {
          element.inert = true
          element.setAttribute('aria-hidden', 'true')
        })
        return
      }

      inertedSiblings.forEach(({ element, inert: wasInert, ariaHidden }) => {
        element.inert = wasInert
        if (ariaHidden === null) element.removeAttribute('aria-hidden')
        else element.setAttribute('aria-hidden', ariaHidden)
      })
      inertedSiblings = []
    }

    const setModalImageLoading = () => {
      modalImageWrap.classList.add('is-loading')
      modalImageWrap.classList.remove('is-error')
      modalLoading.hidden = false
      modalError.hidden = true
    }

    modalImage.addEventListener('load', () => {
      modalImageWrap.classList.remove('is-loading', 'is-error')
      modalLoading.hidden = true
      modalError.hidden = true
    })

    modalImage.addEventListener('error', () => {
      modalImageWrap.classList.remove('is-loading')
      modalImageWrap.classList.add('is-error')
      modalLoading.hidden = true
      modalError.hidden = false
    })

    const openCertificate = (certificate, trigger) => {
      lastFocusedElement = trigger || document.activeElement
      modalTitle.textContent = certificate.recipientName
        ? `${certificate.title} · ${certificate.recipientName}`
        : certificate.title || labels.modalTitle
      setModalImageLoading()
      modalImage.alt = certificate.imageAlt
      modalImage.src = certificate.image
      backdrop.hidden = false
      modal.classList.add('is-open')
      modal.setAttribute('aria-hidden', 'false')
      document.body.classList.add('honor-hall-scroll-lock')
      setPageInert(true)
      modalTitle.focus({ preventScroll: true })
    }

    const closeCertificate = () => {
      if (!modal.classList.contains('is-open')) return
      modal.classList.remove('is-open')
      modal.setAttribute('aria-hidden', 'true')
      backdrop.hidden = true
      modalImage.removeAttribute('src')
      modalImage.alt = ''
      modalLoading.hidden = true
      modalError.hidden = true
      document.body.classList.remove('honor-hall-scroll-lock')
      setPageInert(false)
      if (lastFocusedElement && document.contains(lastFocusedElement)) {
        lastFocusedElement.focus({ preventScroll: true })
      }
    }

    const createCertificateCard = certificate => {
      const card = createElement('button', 'honor-hall__certificate')
      card.type = 'button'
      card.setAttribute('aria-label', interpolate(labels.openCertificate, {
        recipient: certificate.recipientName || labels.defaultRecipient,
        title: certificate.title
      }))

      const imageWrap = createElement('span', 'honor-hall__certificate-image-wrap is-loading')
      const image = document.createElement('img')
      image.className = 'honor-hall__certificate-image'
      image.alt = ''
      image.loading = 'lazy'
      image.decoding = 'async'
      const imageStatus = createElement('span', 'honor-hall__certificate-image-status', labels.imageLoading)
      imageWrap.append(image, imageStatus)
      image.addEventListener('load', () => {
        imageWrap.classList.remove('is-loading', 'is-error')
        imageStatus.hidden = true
      })
      image.addEventListener('error', () => {
        imageWrap.classList.remove('is-loading')
        imageWrap.classList.add('is-error')
        imageStatus.textContent = labels.imageError
        imageStatus.hidden = false
      })
      image.src = certificate.image

      const copy = createElement('span', 'honor-hall__certificate-copy')
      copy.appendChild(createElement('strong', 'honor-hall__certificate-title', certificate.title))
      if (certificate.recipientName) {
        copy.appendChild(createElement('span', 'honor-hall__certificate-recipient', certificate.recipientName))
      }
      copy.appendChild(createElement('span', 'honor-hall__certificate-arrow', '→'))

      card.append(imageWrap, copy)
      card.addEventListener('click', () => openCertificate(certificate, card))
      return card
    }

    const renderActivities = activities => {
      elements.gallery.replaceChildren()

      if (!activities.length) {
        const empty = createElement('section', 'honor-hall__empty')
        empty.appendChild(createElement('h2', '', labels.noMatchTitle))
        empty.appendChild(createElement('p', '', labels.noMatchHelp))
        elements.gallery.appendChild(empty)
        return
      }

      activities.forEach(activity => {
        const section = createElement('section', 'honor-hall__activity')
        const headingId = `honor-activity-${activity.id}`
        section.setAttribute('aria-labelledby', headingId)
        const heading = createElement('h2', 'honor-hall__activity-title', activity.title)
        heading.id = headingId
        section.appendChild(heading)

        if (activity.certificates.length) {
          const grid = createElement('div', 'honor-hall__certificate-grid')
          activity.certificates.forEach(certificate => grid.appendChild(createCertificateCard(certificate)))
          section.appendChild(grid)
        } else {
          section.appendChild(createElement('p', 'honor-hall__activity-empty', labels.activityEmpty))
        }

        elements.gallery.appendChild(section)
      })
    }

    const showAll = () => {
      elements.form.reset()
      elements.resultBar.hidden = true
      elements.resultMessage.textContent = ''
      renderActivities(config.activities)
      elements.input.focus({ preventScroll: true })
    }

    elements.form.addEventListener('submit', async event => {
      event.preventDefault()
      const rawQuery = asText(elements.input.value)
      if (!rawQuery) {
        elements.input.focus()
        return
      }

      const nicknameQuery = normaliseNickname(rawQuery)
      const qqQuery = normaliseQQ(rawQuery)
      const queryIsQQ = isQQ(qqQuery)
      let qqLookup = { unavailable: false, ids: new Set() }
      let qqLookupFailed = false

      elements.submit.disabled = true
      elements.submit.textContent = labels.querying

      if (queryIsQQ) {
        try {
          qqLookup = await lookupQQ(qqQuery, config.qqLookupEndpoint)
        } catch (error) {
          qqLookupFailed = true
        }
      }

      const matchingActivities = config.activities.map(activity => ({
        ...activity,
        certificates: activity.certificates.filter(certificate => (
          certificate.normalisedIdentifiers.includes(nicknameQuery) ||
          qqLookup.ids.has(certificate.id)
        ))
      })).filter(activity => activity.certificates.length)

      const matchCount = matchingActivities.reduce((total, activity) => total + activity.certificates.length, 0)
      elements.resultBar.hidden = false
      if (qqLookupFailed) {
        elements.resultMessage.textContent = labels.qqFailed
      } else if (queryIsQQ && qqLookup.unavailable && !matchCount) {
        elements.resultMessage.textContent = labels.qqUnavailable
      } else if (matchCount) {
        elements.resultMessage.textContent = interpolate(labels.foundResults, { count: matchCount })
      } else {
        elements.resultMessage.textContent = labels.noMatchTitle
      }
      renderActivities(matchingActivities)
      elements.submit.disabled = false
      elements.submit.textContent = labels.queryButton
    })

    elements.showAll.addEventListener('click', showAll)
    portal.querySelectorAll('[data-action="close-certificate"]').forEach(button => {
      button.addEventListener('click', closeCertificate)
    })

    document.addEventListener('keydown', event => {
      if (!modal.classList.contains('is-open')) return

      if (event.key === 'Escape') {
        event.preventDefault()
        closeCertificate()
        return
      }

      if (event.key !== 'Tab') return
      const focusable = [...modal.querySelectorAll(
        'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
      )].filter(element => !element.hidden && element.getClientRects().length)
      if (!focusable.length) {
        event.preventDefault()
        modalTitle.focus()
        return
      }

      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      if (event.shiftKey && (document.activeElement === first || document.activeElement === modalTitle)) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    })

    document.addEventListener('pjax:send', closeCertificate)
    renderActivities(config.activities)
  }

  onReady(initialiseHonorHall)
})()
