document.addEventListener('DOMContentLoaded', () => {
    const newsContainers = document.querySelectorAll('[data-news60]');
    if (newsContainers.length === 0) return;
    
    const apiUrl = 'https://60s-api.viki.moe/v2/60s?encoding=text';
    
    fetch(apiUrl)
      .then(response => {
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        return response.text();
      })
      .then(text => {
        // 分割文本为行
        const lines = text.split('\n').filter(line => line.trim() !== '');
        
        // 确保至少有1行
        if (lines.length === 0) {
          throw new Error('API返回空内容');
        }
        
        // 处理文本格式
        let formattedContent = '';
        
        // 1. 第一行用<h2>标签
        formattedContent += `<h2>${lines[0]}</h2>`;
        
        // 2. 中间行用无序列表展示
        if (lines.length > 2) {
          formattedContent += '<ul style="margin-left: 20px; padding-left: 0; list-style-type: none;">';
          
          // 处理中间行（从第2行到倒数第2行）
          for (let i = 1; i < lines.length - 1; i++) {
            // 移除原始文本中的数字序号（如"1."、"2."等）
            const cleanedLine = lines[i].replace(/^\d+\.\s*/, '');
            formattedContent += `<li style="margin-bottom: 8px; position: relative; padding-left: 15px;">
              <span style="position: absolute; left: 0;">-</span> ${cleanedLine}
            </li>`;
          }
          
          formattedContent += '</ul>';
        }
        
        // 3. 最后一行原样展示
        if (lines.length > 1) {
          formattedContent += `<div style="margin-top: 15px; font-style: italic;">${lines[lines.length - 1]}</div>`;
        }
        
        // 插入处理后的内容
        newsContainers.forEach(container => {
          container.innerHTML = formattedContent;
          
          // 添加基本容器样式
          container.style.background = '#f8f9fa';
          container.style.borderLeft = '4px solid #4e73df';
          container.style.padding = '20px';
          container.style.margin = '25px 0';
          container.style.borderRadius = '0 4px 4px 0';
        });
      })
      .catch(error => {
        newsContainers.forEach(container => {
          container.innerHTML = `<div style="color: #d9534f; padding: 15px; background: #f8d7da; border-left: 4px solid #d9534f;">
            加载60秒新闻失败: ${error.message}
          </div>`;
        });
      });
  });