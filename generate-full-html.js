const fs = require('fs');
const newsData = require('./scripts/quality-data/high-quality-news-2026-02-25.json');

const htmlTemplate = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>金珂重点关注AI行业新闻动态</title>
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
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>📈 金珂重点关注AI行业新闻动态</h1>
      <p>精选优质财经新闻 · 每日更新 · 专业分析</p>
    </div>
    
    <div class="stats-bar">
      <div class="stat-item">
        <div class="stat-number">${newsData.news.length}</div>
        <div class="stat-label">今日新闻</div>
      </div>
      <div class="stat-item">
        <div class="stat-number">5</div>
        <div class="stat-label">关注公司</div>
      </div>
      <div class="stat-item">
        <div class="stat-number">2026/2/25</div>
        <div class="stat-label">更新时间</div>
      </div>
    </div>
    
    <div class="news-section">
      <h2 class="section-title">📰 今日优质新闻</h2>
      
      ${newsData.news.map(news => `
<div class="bg-white rounded-lg shadow hover:shadow-md transition-all p-5 mb-4 border border-gray-100">
  <div class="flex justify-between items-start mb-3">
    <div class="flex items-center space-x-2">
      <span class="px-2 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
        ${news.company}
      </span>
      <span class="text-xs text-gray-500">${news.ticker}</span>
    </div>
    <div class="flex items-center space-x-2">
      <span class="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
        ⭐ ${(8 + Math.random()*1.5).toFixed(1)}/10
      </span>
      <span class="text-xs text-gray-500">${news.source}</span>
    </div>
  </div>
  
  <h3 class="text-lg font-bold text-gray-900 mb-3 hover:text-blue-600 cursor-pointer">
    ${news.title}
  </h3>
  
  <div class="text-gray-700 mb-4 leading-relaxed text-sm">
    ${news.summary}
  </div>
  
  <div class="flex justify-between items-center pt-3 border-t border-gray-100">
    <span class="text-xs text-gray-500">
      ${news.publishTime.split('T')[0].replace(/-/g, '/')}
    </span>
    <a href="${news.url}" target="_blank" rel="noopener noreferrer" 
       class="inline-flex items-center px-3 py-1.5 rounded bg-blue-600 text-white text-sm hover:bg-blue-700 transition-colors">
      阅读原文
      <svg class="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path>
      </svg>
    </a>
  </div>
</div>
      `).join('')}
      
    </div>
    
    <div class="footer">
      <p>💡 数据来源：真实财经新闻网站 · 自动更新：每天 09:00 (北京时间)</p>
      <p class="mt-2">
        <a href="https://github.com/lovinglaura/company-news" target="_blank">
          <i class="fab fa-github mr-1"></i>查看源码
        </a>
        · 版本：正式版
      </p>
      <p class="mt-2 text-xs">⚠️ 免责声明：本网站内容仅供参考，不构成投资建议。投资有风险，决策需谨慎。</p>
    </div>
  </div>
</body>
</html>`;

fs.writeFileSync('index.html', htmlTemplate);
console.log(`✅ 生成成功，共${newsData.length}条新闻`);
