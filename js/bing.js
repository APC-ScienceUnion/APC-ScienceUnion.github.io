document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('[data-bing-description]').forEach(el => {
      const url = el.dataset.url;

      function formatDate(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0'); // 保证月份是两位数
        const day = String(date.getDate()).padStart(2, '0'); // 保证日期是两位数
        return `${year}${month}${day}`;
      }
      
      const currentDate = new Date();
      const formattedDate = formatDate(currentDate);
      const fullurl = url + formattedDate;
      
      fetch(`/api/bing-description?url=${encodeURIComponent(fullurl)}`)
        .then(response => response.text())
        .then(text => {
          el.innerHTML = text; // 使用innerHTML以保留<br>标签
        })
        .catch(error => {
          el.textContent = `加载失败: ${error.message}`;
        });
    });
});