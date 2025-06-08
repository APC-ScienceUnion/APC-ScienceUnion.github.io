document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('[data-bing-description]').forEach(el => {
        // 生成当天日期的函数
        function getCurrentFormattedDate() {
            const now = new Date();
            const year = now.getFullYear();
            const month = String(now.getMonth() + 1).padStart(2, '0'); // 月份从0开始，需要+1
            const day = String(now.getDate()).padStart(2, '0');
            return `${year}${month}${day}`;
        }
        
        // 获取基础URL（从元素属性获取或使用默认值）
        const baseUrl = el.dataset.url || 'https://bing.ee123.net/detail/';
        
        // 生成当天日期
        const currentDate = getCurrentFormattedDate();
        
        // 构建完整URL
        const fullUrl = baseUrl + currentDate;
        console.log('正在请求:', fullUrl);
        
        // 使用可靠的CORS代理服务
        const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(fullUrl)}`;
        
        fetch(proxyUrl)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`网络错误: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                // 创建临时元素解析HTML
                const parser = new DOMParser();
                const doc = parser.parseFromString(data.contents, 'text/html');
                
                // 提取description
                const meta = doc.querySelector('meta[name="description"]');
                if (!meta || !meta.content) {
                    throw new Error('未找到描述内容');
                }
                
                let description = meta.content;
                
                // 格式处理
                // 将第一行转换为<h2>
                description = description.replace('必应壁纸 - 每日一图，', '</h2>');
                description = "<h2>" + description;
                
                // 插入内容
                el.innerHTML = description;
            })
            .catch(error => {
                console.error('加载失败:', error);
                el.innerHTML = `<div style="color: red; padding: 10px; border: 1px solid #f0c0c0;">
                    加载必应描述失败: ${error.message}
                </div>`;
            });
    });
});