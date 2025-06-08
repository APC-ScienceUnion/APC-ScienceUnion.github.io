document.addEventListener('DOMContentLoaded', () => {
    // 获取所有 APOD 容器
    const apodContainers = document.querySelectorAll('[data-apod]');
    
    if (apodContainers.length === 0) return;
    
    // NASA API 密钥
    const apiKey = '5a1S3uxboIVQSPCg6bdNSg2pjHnaelBbedbgUhbE';
    
    // 构建 API URL
    const apiUrl = `https://api.nasa.gov/planetary/apod?api_key=${apiKey}`;
    
    // 获取 APOD 数据
    fetch(apiUrl)
      .then(response => {
        if (!response.ok) throw new Error(`HTTP 错误! 状态: ${response.status}`);
        return response.json();
      })
      .then(data => {
        // 处理每个容器
        apodContainers.forEach(container => {
          // 检查是否包含图片
          const mediaType = data.media_type || 'image';
          const isImage = mediaType === 'image';
          
          // 构建 HTML 内容
          let content = '';
          
          // 添加图片（如果是图像类型）
          if (isImage) {
            content += `<img src="${data.url}" alt="${data.title}" style="max-width: 100%; display: block; margin: 0 auto;">`;
          }
          
          // 添加标题和日期
          content += `<div style="margin-top: 15px;">
            <h2 style="margin-bottom: 5px;">${data.title}</h2>
            <p style="color: #666; font-size: 0.9em;">${data.date}</p>
          </div>`;
          
          // 添加解释
          content += `<div style="margin-top: 15px; line-height: 1.6;">${data.explanation}</div>`;
          
          // 添加版权信息
          if (data.copyright) {
            content += `<div style="margin-top: 15px; font-size: 0.9em; color: #888;">
              版权信息：${data.copyright}
            </div>`;
          }
          
          // 插入内容
          container.innerHTML = content;
        });
      })
      .catch(error => {
        // 错误处理
        apodContainers.forEach(container => {
          container.innerHTML = `<div style="color: #d9534f; padding: 15px; background: #f8d7da; border-left: 4px solid #d9534f;">
            加载 APOD 数据失败: ${error.message}
          </div>`;
        });
      });
  });