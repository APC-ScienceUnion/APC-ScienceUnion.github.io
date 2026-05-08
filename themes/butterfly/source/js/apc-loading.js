/**
 * 站内异步区块统一加载态：转圈 + 灰字（不依赖 Tailwind）。
 * 依赖方：必应壁纸、APOD、每日新闻、维基每日一图、科学史上的今天等。
 */
(function (w) {
  function injectKeyframes() {
    if (document.getElementById('apc-loading-keyframes')) return;
    const el = document.createElement('style');
    el.id = 'apc-loading-keyframes';
    el.textContent = '@keyframes apc-loading-spin{to{transform:rotate(360deg)}}';
    document.head.appendChild(el);
  }

  function esc(s) {
    return String(s || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  /**
   * @param {string} message 转圈旁提示文案
   * @returns {string} 可赋给 innerHTML 的片段（不含外层包裹，便于塞进任意容器）
   */
  w.apcLoadingHtml = function (message) {
    injectKeyframes();
    return (
      '<div class="apc-loading" style="display:flex;align-items:center;justify-content:center;padding:20px;min-height:52px;" role="status" aria-live="polite">' +
      '<div style="flex-shrink:0;width:28px;height:28px;border:3px solid #93c5fd;border-top-color:transparent;border-radius:50%;animation:apc-loading-spin 0.8s linear infinite" aria-hidden="true"></div>' +
      '<span style="margin-left:10px;color:#666;">' +
      esc(message) +
      '</span></div>'
    );
  };
})(typeof window !== 'undefined' ? window : this);
