document.addEventListener('DOMContentLoaded', function() {
  // 创建容器
  const container = document.createElement('div');
  container.id = 'wiki-picture-container';
  container.className = 'm-auto max-w-4xl bg-white rounded-lg shadow-md p-5 my-6';
  
  // 创建加载提示
  const loading = document.createElement('div');
  loading.id = 'wiki-loading';
  loading.className = 'flex justify-center items-center py-10';
  loading.innerHTML = `
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      <p class="ml-4 text-gray-600">正在加载维基百科每日图片...</p>
  `;
  container.appendChild(loading);
  
  // 查找占位符并插入容器
  const placeholder = document.getElementById('wiki-daily-placeholder');
  if (!placeholder) return;
  
  placeholder.parentNode.replaceChild(container, placeholder);
  
  // 获取当前日期
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  const dateISO = `${year}-${month}-${day}`;
  const title = `Template:POTD_protected/${dateISO}`;
  
  // 第一步：获取图片文件名
  fetch(`https://en.wikipedia.org/w/api.php?action=query&format=json&formatversion=2&prop=images&titles=${encodeURIComponent(title)}&origin=*`)
      .then(response => response.json())
      .then(data => {
          if (!data.query || !data.query.pages || data.query.pages.length === 0) {
              throw new Error('未找到图片信息');
          }
          
          const page = data.query.pages[0];
          if (!page.images || page.images.length === 0) {
              throw new Error('未找到当日图片');
          }
          
          const filename = page.images[0].title;
          
          // 第二步：获取图片URL
          return fetch(`https://en.wikipedia.org/w/api.php?action=query&format=json&prop=imageinfo&iiprop=url&titles=${encodeURIComponent(filename)}&origin=*`)
              .then(response => response.json())
              .then(data => {
                  if (!data.query || !data.query.pages) {
                      throw new Error('未找到图片URL信息');
                  }
                  
                  const pageId = Object.keys(data.query.pages)[0];
                  const pageInfo = data.query.pages[pageId];
                  
                  if (!pageInfo.imageinfo || pageInfo.imageinfo.length === 0) {
                      throw new Error('无法获取图片URL');
                  }
                  
                  const imageUrl = pageInfo.imageinfo[0].url;
                  
                  // 第三步：获取原始描述文本（修复代理URL）
                  const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(
                      `https://en.wikipedia.org/w/index.php?title=${title}&action=raw`
                  )}`;
                  
                  // 创建图片元素
                  const img = document.createElement('img');
                  img.src = imageUrl;
                  img.alt = filename.replace('File:', '');
                  img.className = 'w-full h-auto rounded-lg shadow-lg transition-transform duration-500 hover:scale-[1.02]';
                  
                  // 创建日期显示
                  const dateDisplay = document.createElement('div');
                  dateDisplay.className = 'text-xl font-bold text-gray-800 mb-4';
                  dateDisplay.textContent = `${year}年${month}月${day}日`;
                  
                  // 获取描述文本
                  return fetch(proxyUrl)
                      .then(response => response.text())
                      .then(rawText => {
                          try {
                              // 解析代理返回的JSON数据
                              const responseData = JSON.parse(rawText);
                              const encodedContent = responseData.contents;
                              
                              // 正则匹配Base64数据
                              const base64Regex = /^data:text\/x-wiki;\s*charset=UTF-8;base64,(.+)$/;
                              const match = encodedContent.match(base64Regex);
                              
                              if (!match || !match[1]) {
                                  // 尝试宽松匹配
                                  const looseRegex = /^data:.*?;base64,(.+)$/;
                                  const looseMatch = encodedContent.match(looseRegex);
                                  
                                  if (!looseMatch || !looseMatch[1]) {
                                      throw new Error('未找到有效的Base64数据');
                                  }
                                  
                                  console.warn('使用宽松匹配解析Base64数据');
                                  var base64Data = looseMatch[1];
                              } else {
                                  var base64Data = match[1];
                              }
                              
                              // 解码Base64字符串
                              const decodedText = atob(base64Data);
                              console.log(decodedText);
                              // 提取描述文本
                              const description = extractDescription(decodedText);
                              
                              // 渲染内容
                              renderContent(container, dateDisplay, img, description);
                              
                          } catch (error) {
                              console.error('解码描述失败:', error);
                              // 解码失败时，只显示图片和错误信息
                              showImageWithError(container, dateDisplay, img, '描述解码失败: ' + error.message);
                          }
                      })
                      .catch(error => {
                          console.error('获取描述失败:', error);
                          showImageWithError(container, dateDisplay, img, '无法获取描述信息: ' + error.message);
                      });
              })
              .catch(error => {
                  console.error('获取图片URL失败:', error);
                  container.innerHTML = `
                      <div class="bg-red-50 border border-red-200 rounded-lg p-4">
                          <div class="flex items-center">
                              <i class="fas fa-exclamation-triangle text-red-500 mr-3"></i>
                              <p class="text-red-700">无法获取图片URL: ${error.message}</p>
                          </div>
                      </div>
                  `;
              });
      })
      .catch(error => {
          console.error('获取文件名失败:', error);
          container.innerHTML = `
              <div class="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div class="flex items-center">
                      <i class="fas fa-exclamation-triangle text-red-500 mr-3"></i>
                      <p class="text-red-700">无法获取图片信息: ${error.message}</p>
                  </div>
              </div>
          `;
      });
});

// 渲染内容
function renderContent(container, dateDisplay, img, description) {
  container.innerHTML = '';
  
  const imgContainer = document.createElement('div');
  imgContainer.className = 'overflow-hidden rounded-lg shadow-lg mb-6';
  imgContainer.appendChild(img);
  container.appendChild(imgContainer);

  container.appendChild(dateDisplay);
  
  if (description) {
      const descContainer = document.createElement('div');
      descContainer.className = 'bg-gray-50 p-4 rounded-lg border border-gray-200';
      descContainer.innerHTML = convertWikiToHtml(description);
      container.appendChild(descContainer);
  }
}

// 只显示图片和错误信息的辅助函数
function showImageWithError(container, dateDisplay, img, errorMessage) {
  container.innerHTML = '';
  container.appendChild(dateDisplay);
  
  const imgContainer = document.createElement('div');
  imgContainer.className = 'overflow-hidden rounded-lg shadow-lg mb-6';
  imgContainer.appendChild(img);
  container.appendChild(imgContainer);
  
  const errorContainer = document.createElement('div');
  errorContainer.className = 'bg-red-50 border border-red-200 rounded-lg p-4';
  errorContainer.innerHTML = `
      <div class="flex items-center">
          <i class="fas fa-exclamation-triangle text-red-500 mr-3"></i>
          <p class="text-red-700">${errorMessage}</p>
      </div>
  `;
  container.appendChild(errorContainer);
}

// 从原始文本中提取描述的函数（优化匹配逻辑）
function extractDescription(rawText) {
  // 尝试匹配标准格式
  const startMarker = '| style="padding:0 6px 0 0" |';
  const startIndex = rawText.indexOf(startMarker);
  
  if (startIndex !== -1) {
      const descriptionStart = startIndex + startMarker.length;
      
      // 查找结束标记
      const endMarkers = [
          '\n<div class="potd-recent"',
          '\n{{flatlist|class=potd-footer',
          '\n|}<noinclude>',
          '\n== See also =='
      ];
      
      let endIndex = -1;
      for (const marker of endMarkers) {
          const index = rawText.indexOf(marker, descriptionStart);
          if (index !== -1 && (endIndex === -1 || index < endIndex)) {
              endIndex = index;
          }
      }
      
      if (endIndex === -1) {
          endIndex = rawText.length;
      }
      
      let description = rawText.substring(descriptionStart, endIndex).trim();
      description = description.replace(/\n{2,}/g, '\n').replace(/^\s+|\s+$/g, '');
      return description || '无描述信息';
  }
  
  // 尝试替代格式
  const altStartMarker = '<td class="description">';
  const altStartIndex = rawText.indexOf(altStartMarker);
  
  if (altStartIndex !== -1) {
      const descriptionStart = altStartIndex + altStartMarker.length;
      const endMarker = '</td>';
      const endIndex = rawText.indexOf(endMarker, descriptionStart);
      
      if (endIndex !== -1) {
          return rawText.substring(descriptionStart, endIndex).trim();
      }
  }
  
  return '无描述信息';
}

// 改进的Wiki标记转HTML函数
function convertWikiToHtml(wikiText) {
  if (!wikiText) return '无描述信息';
  
  // 替换粗体和斜体
  let html = wikiText
      .replace(/'''(.+?)'''/g, '<strong>$1</strong>')
      .replace(/''(.+?)''/g, '<em>$1</em>');
  
  // 替换内部链接
  html = html.replace(/\[\[([^\]|]+)\]\]/g, '<a href="https://en.wikipedia.org/wiki/$1">$1</a>');
  html = html.replace(/\[\[([^|]+)\|([^\]]+)\]\]/g, '<a href="https://en.wikipedia.org/wiki/$1">$2</a>');
  
  // 替换外部链接
  html = html.replace(/\[([^ ]+) ([^\]]+)\]/g, '<a href="$1">$2</a>');
  
  // 替换换行符为<br>，保留段落结构
  html = html.replace(/\n\n/g, '</p><p>');
  html = html.replace(/\n/g, '<br>');
  html = `<p>${html}</p>`;
  
  // 移除模板标签和其他不需要的标记
  html = html.replace(/\{\{.*?\}\}/g, '');
  
  return html;
}    