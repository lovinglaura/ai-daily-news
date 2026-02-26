#!/usr/bin/env node

/**
 * 生成AI行业新闻动态HTML
 */

const fs = require('fs').promises;
const path = require('path');

// 配置
const getDataFile = () => {
  const today = new Date().toISOString().split('T')[0];
  const todayFile = path.join(__dirname, 'scripts', 'data', `company-news-${today}.json`);
  const fixedFile = path.join(__dirname, 'scripts', 'data', 'company-news-fixed.json');
  const testFile = path.join(__dirname, 'scripts', 'data', 'company-news-test.json');
  
  // 优先使用当天的真实数据，然后使用修复后的测试数据，最后使用原始测试数据
  if (require('fs').existsSync(todayFile)) {
    return todayFile;
  } else if (require('fs').existsSync(fixedFile)) {
    return fixedFile;
  }
  return testFile;
};

const DATA_FILE = getDataFile();
const OUTPUT_FILE = path.join(__dirname, 'index.html');

// 公司信息
const COMPANY_INFO = {
  llm: { 
    name: '大模型', 
    ticker: '大模型', 
    color: 'bg-blue-100 text-blue-800', 
    icon: '🤖',
    bgColor: 'from-blue-50 to-blue-100'
  },
  ai_chip: { 
    name: 'AI芯片', 
    ticker: 'AI芯片', 
    color: 'bg-green-100 text-green-800', 
    icon: '💻',
    bgColor: 'from-green-50 to-green-100'
  },
  genai: { 
    name: '生成式AI', 
    ticker: '生成式AI', 
    color: 'bg-purple-100 text-purple-800', 
    icon: '🎨',
    bgColor: 'from-purple-50 to-purple-100'
  },
  ai_industry: { 
    name: 'AI行业', 
    ticker: 'AI行业', 
    color: 'bg-orange-100 text-orange-800', 
    icon: '📈',
    bgColor: 'from-orange-50 to-orange-100'
  },
  robot: { 
    name: '机器人', 
    ticker: '机器人', 
    color: 'bg-red-100 text-red-800', 
    icon: '🦾',
    bgColor: 'from-red-50 to-red-100'
  }
};

// 生成HTML内容
function generateHTML(data) {
  const now = new Date();
  const currentTime = `${now.getFullYear()}/${(now.getMonth()+1).toString().padStart(2,'0')}/${now.getDate().toString().padStart(2,'0')} ${now.getHours().toString().padStart(2,'0')}:${now.getMinutes().toString().padStart(2,'0')}:${now.getSeconds().toString().padStart(2,'0')}`;
  
  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>金珂重点关注AI行业新闻动态 | 每日AI行业新闻深度分析</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, system-ui, sans-serif;
        }
        .gradient-bg {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }
        .card-hover {
            transition: all 0.3s ease;
        }
        .card-hover:hover {
            transform: translateY(-4px);
            box-shadow: 0 20px 40px rgba(0,0,0,0.12);
        }
    </style>
</head>
<body class="bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
    <!-- 头部 -->
    <header class="gradient-bg text-white py-10 px-4">
        <div class="max-w-7xl mx-auto">
            <div class="flex items-center gap-3 mb-3">
                <span class="text-5xl">📈</span>
                <div>
                    <h1 class="text-3xl md:text-4xl font-bold mb-1">金珂重点关注AI行业新闻动态</h1>
                    <p class="text-white/90 text-lg font-medium">深度分析 · 股价影响评估 · 每日更新</p>
                </div>
            </div>
            <div class="flex items-center gap-4 text-white/80 text-sm mt-4">
                <span class="flex items-center gap-1">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                    更新时间：${currentTime}
                </span>
                <span class="flex items-center gap-1">
                    <span class="text-lg">📊</span>
                    今日精选：${data.selected}条（从${data.totalSearched}条中筛选）
                </span>
            </div>
        </div>
    </header>

    <!-- 统计栏 -->
    <div class="bg-white border-b border-gray-200 py-6 px-4 shadow-sm">
        <div class="max-w-7xl mx-auto">
            <div class="flex items-center justify-between mb-4">
                <h2 class="text-lg font-bold text-gray-900">📈 AI行业新闻统计</h2>
                <span class="text-sm text-gray-500">共覆盖 ${data.companies.length} 家公司</span>
            </div>
            <div class="grid grid-cols-2 md:grid-cols-5 gap-3">
                ${data.companies.map(company => {
                  const info = COMPANY_INFO[company];
                  const companyNews = data.news.filter(n => n.company === info.ticker);
                  const highImpact = companyNews.filter(n => n.valueScore >= 8).length;
                  
                  return `
                <div class="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
                  <div class="flex items-center gap-3 mb-2">
                    <span class="text-xl">${info.icon}</span>
                    <span class="font-semibold text-gray-900">${info.name}</span>
                  </div>
                  <div class="text-sm text-gray-600">
                    <div class="flex items-center justify-between">
                      <span>新闻数量:</span>
                      <span class="font-medium">${companyNews.length}条</span>
                    </div>
                    <div class="flex items-center justify-between mt-1">
                      <span>高影响新闻:</span>
                      <span class="font-medium text-red-600">${highImpact}条</span>
                    </div>
                  </div>
                </div>`;
                }).join('')}
            </div>
        </div>
    </div>

    <!-- 主内容区 -->
    <main class="max-w-7xl mx-auto py-8 px-4">
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            ${data.news.map((news, index) => {
              const company = Object.values(COMPANY_INFO).find(c => c.ticker === news.company);
              const scoreColor = news.valueScore >= 8 ? 'bg-red-100 border-red-500 text-red-900' : 
                                news.valueScore >= 6 ? 'bg-amber-100 border-amber-500 text-amber-900' : 
                                'bg-blue-100 border-blue-500 text-blue-900';
              const scoreLabel = news.valueScore >= 8 ? '🔥 必读' : 
                                news.valueScore >= 6 ? '⭐ 推荐' : '📰 新闻';
              
              return `
            <div class="bg-white rounded-xl p-6 shadow-sm card-hover transition-all duration-300 hover:shadow-lg border border-gray-100">
                <!-- 头部 -->
                <div class="flex items-start justify-between mb-4">
                    <div class="flex items-center gap-3">
                        <span class="text-2xl">${company.icon}</span>
                        <span class="inline-block px-3 py-1 rounded-full text-xs font-medium ${company.color}">
                            ${company.name}
                        </span>
                    </div>
                    <span class="inline-block px-2 py-1 rounded-full text-xs font-medium border ${scoreColor}">
                        ${scoreLabel} ${news.valueScore}分
                    </span>
                </div>

                <!-- 标题 -->
                <h3 class="text-lg font-bold text-gray-900 mb-3 leading-tight">${news.title}</h3>

                <!-- 深度摘要 -->
                <div class="bg-gradient-to-r ${company.bgColor} border-l-4 border-blue-500 p-4 rounded-r-lg mb-4">
                    <div class="font-semibold text-blue-800 mb-2 flex items-center">
                        <span class="mr-2">📖</span>
                        <span>深度解读</span>
                    </div>
                    <p class="text-blue-900 text-sm leading-relaxed">${news.deepSummary || news.summary || '暂无深度分析内容'}</p>
                </div>

                <!-- 逻辑框架 -->
                <div class="mt-2 flex items-center text-sm text-gray-600">
                    <span class="font-medium mr-2">🔗 逻辑框架:</span>
                    <span class="px-3 py-1 bg-gray-100 rounded-full">${news.logicChain}</span>
                </div>

                <!-- 关键数据 -->
                ${news.keyData && news.keyData.length > 0 ? `
                <div class="mt-4 pt-4 border-t border-gray-200">
                    <div class="text-sm font-semibold text-gray-700 mb-2">📊 关键数据</div>
                    <ul class="space-y-1 text-sm text-gray-700">
                        ${news.keyData.map(item => `<li class="flex items-start"><span class="mr-2">📊</span><span>${item}</span></li>`).join('')}
                    </ul>
                </div>` : ''}

                <!-- 重要信息 -->
                ${news.importantInfo && news.importantInfo.length > 0 ? `
                <div class="mt-3">
                    <div class="text-sm font-semibold text-gray-700 mb-1">🎯 重要信息</div>
                    <div class="flex flex-wrap gap-1">
                        ${news.importantInfo.map(info => `<span class="px-2 py-1 bg-indigo-50 text-indigo-700 text-xs rounded border border-indigo-200">${info}</span>`).join('')}
                    </div>
                </div>` : ''}

                <!-- 股价影响 -->
                <div class="mt-4 pt-4 border-t border-gray-200">
                    <div class="text-sm font-semibold text-gray-700 mb-2">💰 股价影响评估</div>
                    <div class="flex items-center gap-2">
                        <span class="px-2 py-1 ${news.stockImpact.level === '高' ? 'bg-red-100 text-red-800' : 
                                              news.stockImpact.level === '中' ? 'bg-amber-100 text-amber-800' : 
                                              'bg-blue-100 text-blue-800'} text-xs rounded font-medium">
                            ${news.stockImpact.level}影响
                        </span>
                        <span class="text-sm text-gray-600">${news.stockImpact.description}</span>
                    </div>
                </div>

                <!-- 页脚 -->
                <div class="mt-4 pt-4 border-t border-gray-200 flex items-center justify-between text-xs text-gray-500">
                    <div class="flex items-center gap-2">
                        <span>📅 ${news.publishTime ? news.publishTime.split('T')[0] : '未知日期'}</span>
                        <span>📰 ${news.source || '未知来源'}</span>
                    </div>
                    <div class="flex items-center gap-2">
                        <span>🏷️ ${news.company}</span>
                    </div>
                </div>

                <!-- 链接 -->
                <div class="mt-3">
                    <a href="${news.url}" target="_blank" rel="noopener noreferrer" class="inline-flex items-center text-sm text-blue-600 hover:text-blue-800 transition-colors">
                        <span>阅读原文</span>
                        <svg class="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path>
                        </svg>
                    </a>
                </div>
            </div>`;
            }).join('')}
        </div>
    </main>

    <!-- 页脚 -->
    <footer class="bg-white border-t border-gray-200 py-6 px-4 mt-8">
        <div class="max-w-7xl mx-auto">
            <div class="flex flex-col md:flex-row justify-between items-center gap-4">
                <div class="text-sm text-gray-600">
                    <p>📊 数据统计：总搜索 ${data.totalSearched}条，精选 ${data.selected}条，实时新闻 ${data.realTimeNews}条</p>
                    <p class="mt-1">⏰ 更新时间：${currentTime}</p>
                </div>
                <div class="text-sm text-gray-600">
                    <p>🏢 覆盖公司：${data.companies.map(c => COMPANY_INFO[c].name).join('、')}</p>
                    <p class="mt-1">🔄 自动更新：每天北京时间9:00</p>
                </div>
            </div>
            <div class="mt-4 text-center text-xs text-gray-500">
                <p>© 2026 金珂重点关注AI行业新闻动态 · 每日自动更新 · 深度分析 · 股价影响评估</p>
                <p class="mt-1">GitHub: <a href="https://github.com/lovinglaura/company-news" class="text-blue-600 hover:text-blue-800">lovinglaura/company-news</a></p>
            </div>
        </div>
    </footer>
</body>
</html>`;
}

/**
 * 主函数
 */
async function main() {
  console.log('🔨 生成AI行业新闻动态HTML...');
  
  try {
    // 读取数据
    const data = JSON.parse(await fs.readFile(DATA_FILE, 'utf8'));
    
    // 生成HTML
    const html = generateHTML(data);
    
    // 写入文件
    await fs.writeFile(OUTPUT_FILE, html, 'utf8');
    
    console.log(`✅ HTML生成成功: ${OUTPUT_FILE}`);
    console.log(`📊 总条数: ${data.selected}`);
    console.log(`💥 高影响新闻: ${data.news.filter(n => n.valueScore >= 8).length}条`);
    console.log(`📈 中影响新闻: ${data.news.filter(n => n.valueScore >= 6 && n.valueScore < 8).length}条`);
    console.log(`📊 低影响新闻: ${data.news.filter(n => n.valueScore < 6).length}条`);
    console.log(`⏰ 时间: ${new Date().toLocaleString('zh-CN')}`);
    
  } catch (error) {
    console.error('❌ 生成失败:', error.message);
    process.exit(1);
  }
}

// 执行
if (require.main === module) {
  main().catch(error => {
    console.error('❌ 执行失败:', error);
    process.exit(1);
  });
}