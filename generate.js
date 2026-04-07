const fs = require('fs');
const newsData = require('./latest_news.json');

const htmlTemplate = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>每日AI行业新闻动态 - 高价值精选</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
  <style>
    *{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif}
    body{background:#f5f7fa;margin:0;padding:20px}
    .container{max-width:1200px;margin:0 auto}
    .header{background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);color:white;padding:30px;border-radius:12px;margin-bottom:30px;box-shadow:0 4px 6px rgba(0,0,0,0.1)}
    .header h1{font-size:28px;font-weight:700;margin:0 0 10px 0}
    .header p{font-size:16px;opacity:0.9;margin:0}
    .stats-bar{background:white;padding:20px;border-radius:8px;box-shadow:0 2px 4px rgba(0,0,0,0.05);margin-bottom:20px;display:flex;justify-content:space-around}
    .stat-item{text-align:center}
    .stat-number{font-size:24px;font-weight:700;color:#667eea}
    .stat-label{font-size:14px;color:#6b7280;margin-top:4px}
    .news-section{background:white;border-radius:8px;box-shadow:0 2px 4px rgba(0,0,0,0.05);padding:25px}
    .section-title{font-size:20px;font-weight:600;color:#1f2937;margin:0 0 20px 0;padding-bottom:10px;border-bottom:1px solid #e5e7eb}
    .footer{margin-top:30px;padding:20px 0;border-top:1px solid #e5e7eb;text-align:center;color:#6b7280;font-size:14px}
    .footer a{color:#667eea;text-decoration:none}
    .footer a:hover{text-decoration:underline}
    .card-hover:hover{transform: translateY(-2px); box-shadow: 0 10px 25px -5px rgba(0,0,0,0.1); transition: all 0.3s ease;}
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🤖 每日AI行业新闻动态</h1>
      <p>精选高价值AI新闻 · 自动更新 · 专业分析 · 过滤低质内容</p>
    </div>
    
    <div class="stats-bar">
      <div class="stat-item">
        <div class="stat-number">${newsData.length}</div>
        <div class="stat-label">今日精选新闻</div>
      </div>
      <div class="stat-item">
        <div class="stat-number">9.0+</div>
        <div class="stat-label">平均价值评分</div>
      </div>
      <div class="stat-item">
        <div class="stat-number">${new Date().toLocaleDateString('zh-CN')}</div>
        <div class="stat-label">更新时间</div>
      </div>
    </div>
    
    <div class="news-section">
      <h2 class="section-title">📰 最新高价值AI新闻</h2>
      
      ${newsData.slice(0,8).map(news => {
        const categoryConfig = {
          "🤖 大模型": { color: "bg-purple-100 text-purple-800", icon: "🤖" },
          "💻 AI芯片": { color: "bg-blue-100 text-blue-800", icon: "💻" },
          "🏥 行业应用": { color: "bg-green-100 text-green-800", icon: "🏥" },
          "📈 AI行业": { color: "bg-amber-100 text-amber-800", icon: "📈" },
          "🦾 机器人": { color: "bg-red-100 text-red-800", icon: "🦾" }
        };
        const config = categoryConfig[news.category] || { color: "bg-gray-100 text-gray-800", icon: "📰" };
        const impactLevel = news.score >= 8 ? '高' : news.score >=7 ? '中' : '低';
        const impactColor = news.score >= 8 ? 'bg-green-100 text-green-800' : news.score >=7 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800';
        
        return `
<div class="bg-white rounded-xl p-6 shadow-sm card-hover border border-gray-100 mb-5">
  <div class="flex items-start justify-between mb-4">
    <div class="flex items-center space-x-3">
      <span class="flex items-center justify-center w-8 h-8 rounded-full ${config.color}">
        <span class="text-sm">${config.icon}</span>
      </span>
      <div>
        <span class="inline-block px-3 py-1 text-xs font-medium rounded-full ${config.color}">
          ${news.category}
        </span>
      </div>
    </div>
    <div class="text-right">
      <span class="inline-block px-2 py-1 text-xs font-medium rounded ${impactColor}">
        ${impactLevel}影响
      </span>
      <div class="mt-1 text-xs text-gray-500">${news.source || '未知来源'}</div>
    </div>
  </div>

  <h3 class="text-lg font-bold text-gray-900 mb-3 line-clamp-2">${news.title}</h3>
  
  <p class="text-gray-600 mb-4 line-clamp-3">${news.analysis}</p>
  
  <div class="flex items-center justify-between">
    <div class="text-sm text-gray-500">
      <span class="font-medium">价值评分:</span>
      <span class="ml-2 inline-flex items-center">
        ${'★'.repeat(Math.min(Math.floor(news.score || 7),5))}${'☆'.repeat(5 - Math.min(Math.floor(news.score || 7),5))}
        <span class="ml-1">${news.score || 7}/10</span>
      </span>
    </div>
    
    <div class="mt-3">
      <a href="${news.link}" target="_blank" rel="noopener noreferrer" class="inline-flex items-center text-sm text-blue-600 hover:text-blue-800 transition-colors">
        <span>阅读原文</span>
        <svg class="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path>
        </svg>
      </a>
    </div>
  </div>
</div>
`
      }).join('')}
      
    </div>
    
    <div class="footer">
      <p>💡 数据来源：全网权威AI行业媒体 · 自动更新：每天 09:00 (北京时间)</p>
      <p class="mt-2">
        <a href="https://github.com/lovinglaura/ai-daily-news" target="_blank">
          <i class="fab fa-github mr-1"></i>查看源码
        </a>
        · 官网：<a href="https://lovinglaura.github.io/ai-daily-news/" target="_blank">lovinglaura.github.io/ai-daily-news</a>
      </p>
      <p class="mt-2 text-xs">⚠️ 免责声明：本网站内容仅供参考，不构成任何投资建议。</p>
    </div>
  </div>
</body>
</html>`;

fs.writeFileSync('index.html', htmlTemplate);
console.log(`✅ 生成成功，共${newsData.length}条新闻，已写入index.html`);
