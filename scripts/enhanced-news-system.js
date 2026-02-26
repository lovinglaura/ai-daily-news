#!/usr/bin/env node

/**
 * 增强版新闻系统
 * 解决三个问题：
 * 1. 深度分析质量
 * 2. 内容完整展示
 * 3. 评分逻辑透明
 */

const fs = require('fs').promises;
const path = require('path');

// 评分标准定义
const SCORING_LOGIC = {
  // 影响程度评分标准（1-10分）
  impact: {
    criteria: [
      { min: 9, level: '极高影响', description: '重大战略调整、并购、监管变化、财报大幅超预期/不及预期' },
      { min: 7, level: '高影响', description: '重要产品发布、高管变动、市场份额变化、季度财报' },
      { min: 5, level: '中影响', description: '业务进展、合作伙伴关系、技术突破、行业趋势' },
      { min: 3, level: '低影响', description: '常规运营更新、市场传闻、分析师观点' },
      { min: 1, level: '极低影响', description: '日常新闻、公司活动、无关紧要的更新' }
    ],
    
    // 根据新闻内容计算影响分数
    calculate: (news) => {
      let score = 5; // 基础分
      
      // 关键词加分
      const keywords = {
        // 高影响关键词
        '财报': 2, '盈利': 2, '亏损': 2, '营收': 2, '净利润': 2,
        '并购': 3, '收购': 3, '分拆': 3, '重组': 3,
        '监管': 2, '调查': 2, '罚款': 2, '诉讼': 2,
        'CEO': 1, '高管': 1, '辞职': 1, '任命': 1,
        
        // 中影响关键词  
        '发布': 1, '推出': 1, '上市': 1, '合作': 1,
        '增长': 1, '下滑': 1, '突破': 1, '创新': 1,
        '订单': 1, '签约': 1, '投资': 1, '融资': 1,
        
        // 数据相关
        '亿元': 1, '亿美元': 1, '百分比': 1, '增长': 1, '下降': 1
      };
      
      const text = (news.title + ' ' + news.summary).toLowerCase();
      for (const [keyword, points] of Object.entries(keywords)) {
        if (text.includes(keyword.toLowerCase())) {
          score += points;
        }
      }
      
      // 限制在1-10分
      return Math.max(1, Math.min(10, score));
    }
  },
  
  // 价值评分标准（1-10分）
  value: {
    criteria: [
      { min: 9, level: '极高价值', description: '独家信息、深度分析、前瞻性洞察、对投资决策有决定性影响' },
      { min: 7, level: '高价值', description: '重要数据、详细分析、行业洞察、对投资有重要参考价值' },
      { min: 5, level: '中价值', description: '常规新闻、基本信息、对投资有一定参考价值' },
      { min: 3, level: '低价值', description: '表面信息、重复内容、参考价值有限' },
      { min: 1, level: '极低价值', description: '无实质内容、营销软文、参考价值很低' }
    ],
    
    // 根据新闻内容计算价值分数
    calculate: (news) => {
      let score = 5; // 基础分
      
      // 内容质量加分
      const content = news.summary || '';
      
      // 数据丰富度
      const hasNumbers = /\d+(\.\d+)?(亿|万|百万|千万|%)/.test(content);
      if (hasNumbers) score += 1;
      
      // 分析深度
      const analysisKeywords = ['分析', '解读', '认为', '指出', '预计', '预测', '趋势'];
      const hasAnalysis = analysisKeywords.some(kw => content.includes(kw));
      if (hasAnalysis) score += 1;
      
      // 来源权威性
      const authoritativeSources = ['财报', '公告', '官方', '证监会', '交易所'];
      const isAuthoritative = authoritativeSources.some(src => content.includes(src));
      if (isAuthoritative) score += 1;
      
      // 内容长度（越长通常信息越多）
      if (content.length > 500) score += 1;
      if (content.length > 1000) score += 1;
      
      // 限制在1-10分
      return Math.max(1, Math.min(10, score));
    }
  }
};

/**
 * 生成深度分析内容
 * 1. 总结提炼原文内容
 * 2. 保留原文逻辑框架
 * 3. 高亮重点信息
 */
function generateDeepAnalysis(news) {
  const title = news.title || '';
  const summary = news.summary || '';
  const source = news.source || '';
  
  // 提取关键信息
  const keyInfo = extractKeyInformation(summary);
  
  // 构建深度分析
  let analysis = `## 📊 **深度分析：${title}**\n\n`;
  
  // 来源信息
  analysis += `**📰 来源：${source}**\n\n`;
  
  // 核心要点
  analysis += `### 🔍 **核心要点**\n`;
  if (keyInfo.corePoints.length > 0) {
    keyInfo.corePoints.forEach((point, index) => {
      analysis += `${index + 1}. **${point}**\n`;
    });
  } else {
    analysis += `- ${summary.substring(0, 100)}...\n`;
  }
  analysis += '\n';
  
  // 重要数据（高亮显示）
  if (keyInfo.importantData.length > 0) {
    analysis += `### 📈 **重要数据**\n`;
    keyInfo.importantData.forEach(data => {
      analysis += `- 🎯 **${data}**\n`;
    });
    analysis += '\n';
  }
  
  // 业务影响
  analysis += `### 💼 **业务影响分析**\n`;
  analysis += `**短期影响：** ${assessShortTermImpact(news)}\n\n`;
  analysis += `**长期影响：** ${assessLongTermImpact(news)}\n\n`;
  
  // 投资建议（基于分析）
  analysis += `### 🎯 **投资参考**\n`;
  analysis += `1. **关注点：** ${keyInfo.investmentFocus || '公司基本面变化'}\n`;
  analysis += `2. **风险提示：** ${keyInfo.risks || '市场波动风险'}\n`;
  analysis += `3. **机会窗口：** ${keyInfo.opportunities || '需结合市场环境判断'}\n\n`;
  
  // 原文摘要（完整展示）
  analysis += `### 📝 **原文摘要**\n`;
  analysis += `${summary}\n\n`;
  
  return analysis;
}

/**
 * 提取关键信息
 */
function extractKeyInformation(text) {
  const result = {
    corePoints: [],
    importantData: [],
    investmentFocus: '',
    risks: '',
    opportunities: ''
  };
  
  if (!text) return result;
  
  // 提取数据（数字+单位）
  const dataRegex = /(\d+(\.\d+)?)(亿|万|百万|千万|%)?(元|美元|港元)?/g;
  const dataMatches = text.match(dataRegex) || [];
  result.importantData = dataMatches.slice(0, 5); // 最多取5个重要数据
  
  // 提取核心要点（包含关键动词）
  const sentences = text.split(/[。！？.!?]/).filter(s => s.trim().length > 10);
  const keyVerbs = ['公布', '发布', '宣布', '表示', '预计', '增长', '下降', '突破', '创新', '合作'];
  
  result.corePoints = sentences
    .filter(sentence => keyVerbs.some(verb => sentence.includes(verb)))
    .slice(0, 3) // 最多取3个核心要点
    .map(s => s.trim());
  
  // 简单推断投资关注点
  if (text.includes('增长') || text.includes('提升') || text.includes('改善')) {
    result.investmentFocus = '业绩增长动力';
    result.opportunities = '业绩改善可能带来估值修复';
  }
  
  if (text.includes('下滑') || text.includes('下降') || text.includes('亏损')) {
    result.investmentFocus = '业绩压力因素';
    result.risks = '业绩下滑可能影响股价';
  }
  
  if (text.includes('创新') || text.includes('技术') || text.includes('研发')) {
    result.investmentFocus = '技术创新能力';
    result.opportunities = '技术突破可能带来长期竞争优势';
  }
  
  return result;
}

/**
 * 评估短期影响
 */
function assessShortTermImpact(news) {
  const text = (news.title + ' ' + news.summary).toLowerCase();
  
  if (text.includes('财报') || text.includes('业绩') || text.includes('盈利')) {
    return '直接影响股价，财报季关键信息';
  }
  
  if (text.includes('并购') || text.includes('收购') || text.includes('重组')) {
    return '可能引发股价大幅波动，需关注交易细节';
  }
  
  if (text.includes('监管') || text.includes('调查') || text.includes('罚款')) {
    return '可能带来负面情绪，影响短期股价';
  }
  
  if (text.includes('合作') || text.includes('签约') || text.includes('订单')) {
    return '正面消息，可能提振市场信心';
  }
  
  return '对短期股价影响有限，需结合市场环境判断';
}

/**
 * 评估长期影响
 */
function assessLongTermImpact(news) {
  const text = (news.title + ' ' + news.summary).toLowerCase();
  
  if (text.includes('战略') || text.includes('转型') || text.includes('布局')) {
    return '影响公司长期发展方向，需持续跟踪';
  }
  
  if (text.includes('技术') || text.includes('创新') || text.includes('研发')) {
    return '增强长期竞争力，但需关注商业化进展';
  }
  
  if (text.includes('市场') || text.includes('份额') || text.includes('竞争')) {
    return '影响市场地位，决定长期增长潜力';
  }
  
  if (text.includes('监管') || text.includes('政策') || text.includes('合规')) {
    return '可能改变行业格局，影响长期经营环境';
  }
  
  return '对长期价值影响需结合公司基本面综合判断';
}

/**
 * 获取评分等级描述
 */
function getScoreDescription(score, type = 'impact') {
  const criteria = SCORING_LOGIC[type].criteria;
  for (const criterion of criteria) {
    if (score >= criterion.min) {
      return {
        level: criterion.level,
        description: criterion.description
      };
    }
  }
  return { level: '未知', description: '未评分' };
}

/**
 * 生成新闻卡片HTML（完整内容版）
 */
function generateNewsCardWithFullAnalysis(news, index) {
  // 计算评分
  const impactScore = SCORING_LOGIC.impact.calculate(news);
  const valueScore = SCORING_LOGIC.value.calculate(news);
  
  const impactDesc = getScoreDescription(impactScore, 'impact');
  const valueDesc = getScoreDescription(valueScore, 'value');
  
  // 生成深度分析
  const deepAnalysis = generateDeepAnalysis(news);
  
  return `
      <div class="bg-white rounded-xl p-6 shadow-sm card-hover border border-gray-100 mb-6">
        <!-- 头部：公司信息和评分 -->
        <div class="flex items-start justify-between mb-6">
          <div class="flex items-center space-x-3">
            <span class="flex items-center justify-center w-10 h-10 rounded-full ${news.color || 'bg-gray-100'}">
              <span class="text-base">${news.icon || '📰'}</span>
            </span>
            <div>
              <span class="inline-block px-3 py-1 text-sm font-medium rounded-full ${news.color || 'bg-gray-100 text-gray-800'}">
                ${news.company || '未知公司'}
              </span>
              <span class="ml-2 text-sm text-gray-500">${news.ticker || ''}</span>
              <div class="mt-1 text-xs text-gray-500">${news.source || '未知来源'}</div>
            </div>
          </div>
          
          <div class="text-right">
            <div class="mb-2">
              <span class="inline-block px-3 py-1 text-xs font-medium rounded ${
                impactScore >= 7 ? 'bg-red-100 text-red-800' : 
                impactScore >= 5 ? 'bg-yellow-100 text-yellow-800' : 
                'bg-green-100 text-green-800'
              }">
                ${impactDesc.level} (${impactScore}/10)
              </span>
            </div>
            <div class="text-xs text-gray-600">${impactDesc.description}</div>
          </div>
        </div>

        <!-- 新闻标题 -->
        <h3 class="text-xl font-bold text-gray-900 mb-4">${news.title}</h3>
        
        <!-- 深度分析内容（完整展示） -->
        <div class="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <div class="prose prose-sm max-w-none">
            ${deepAnalysis.replace(/\n/g, '<br>').replace(/## (.*?)<br>/g, '<h4 class="text-lg font-semibold mt-4 mb-2">$1</h4>').replace(/### (.*?)<br>/g, '<h5 class="text-md font-medium mt-3 mb-1">$1</h5>')}
          </div>
        </div>
        
        <!-- 评分详情 -->
        <div class="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-100">
          <h4 class="text-md font-semibold text-blue-800 mb-3">📊 评分逻辑说明</h4>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h5 class="text-sm font-medium text-gray-700 mb-1">影响程度评分：${impactScore}/10</h5>
              <p class="text-xs text-gray-600">${impactDesc.description}</p>
              <div class="mt-2 text-xs text-gray-500">
                评分依据：${getScoringBasis(news, 'impact')}
              </div>
            </div>
            <div>
              <h5 class="text-sm font-medium text-gray-700 mb-1">价值评分：${valueScore}/10</h5>
              <p class="text-xs text-gray-600">${valueDesc.description}</p>
              <div class="mt-2 text-xs text-gray-500">
                评分依据：${getScoringBasis(news, 'value')}
              </div>
            </div>
          </div>
        </div>
        
        <!-- 底部：原文链接和操作 -->
        <div class="flex items-center justify-between pt-4 border-t border-gray-200">
          <div class="text-sm text-gray-600">
            <span class="font-medium">综合评分：</span>
            <span class="ml-2 inline-flex items-center">
              ${'★'.repeat(Math.floor((impactScore + valueScore) / 2))}${'☆'.repeat(5 - Math.floor((impactScore + valueScore) / 2))}
              <span class="ml-1">${Math.round((impactScore + valueScore) / 2)}/10</span>
            </span>
          </div>
          
          <div class="flex space-x-3">
            <a href="${news.url}" target="_blank" rel="noopener noreferrer" 
               class="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors">
              <span>阅读原文</span>
              <svg class="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path>
              </svg>
            </a>
          </div>
        </div>
      </div>
  `;
}

/**
 * 获取评分依据
 */
function getScoringBasis(news, type) {
  const text = (news.title + ' ' + news.summary).toLowerCase();
  const bases = [];
  
  if (type === 'impact') {
    if (text.includes('财报') || text.includes('盈利') || text.includes('营收')) {
      bases.push('财报数据');
    }
    if (text.includes('并购') || text.includes('收购') || text.includes('重组')) {
      bases.push('资本运作');
    }
    if (text.includes('监管') || text.includes('调查') || text.includes('政策')) {
      bases.push('监管因素');
    }
    if (text.includes('发布') || text.includes('推出') || text.includes('上市')) {
      bases.push('产品发布');
    }
    if (bases.length === 0) bases.push('常规运营');
  } else {
    if (text.includes('分析') || text.includes('解读') || text.includes('认为')) {
      bases.push('分析深度');
    }
    if (/\d+(\.\d+)?(亿|万|%)/.test(text)) {
      bases.push('数据丰富');
    }
    if (text.includes('趋势') || text.includes('预测') || text.includes('预计')) {
      bases.push('前瞻性');
    }
    if (bases.length === 0) bases.push('基本信息');
  }
  
  return bases.join('、');
}

/**
 * 生成完整的HTML页面
 */
function generateFullHtmlWithAnalysis(newsList) {
  const today = new Date();
  const dateStr = today.toLocaleDateString('zh-CN', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric',
    weekday: 'long'
  });
  
  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>金珂重点关注AI行业新闻动态 - 深度分析版</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
  <style>
    * { font-family: 'Inter', sans-serif; }
    .card-hover { transition: all 0.3s ease; }
    .card-hover:hover { transform: translateY(-2px); box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1); }
    .prose { color: #374151; }
    .prose h4 { color: #111827; }
    .prose h5 { color: #1f2937; }
    .bg-gradient-primary { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }
  </style>
</head>
<body class="bg-gray-50 min-h-screen">
  <div class="max-w-6xl mx-auto px-4 py-8">
    <!-- 头部 -->
    <header class="mb-10">
      <div class="flex flex-col md:flex-row md:items-center justify-between mb-6">
        <div>
          <h1 class="text-3xl font-bold text-gray-900">📈 金珂重点关注AI行业新闻动态</h1>
          <p class="text-gray-600 mt-2">深度分析 + 评分逻辑透明 + 完整内容展示</p>
        </div>
        <div class="mt-4 md:mt-0">
          <div class="inline-flex items-center px-4 py-2 bg-white rounded-lg shadow-sm border border-gray-200">
            <i class="fas fa-calendar-alt text-blue-500 mr-2"></i>
            <span class="text-gray-700 font-medium">${dateStr}</span>
          </div>
        </div>
      </div>
      
      <div class="bg-gradient-primary rounded-2xl p-6 text-white shadow-lg">
        <div class="flex flex-col md:flex-row md:items-center justify-between">
          <div>
            <h2 class="text-xl font-bold mb-2">🎯 深度分析系统</h2>
            <p class="opacity-90">解决三个核心问题：1.深度分析质量 2.内容完整展示 3.评分逻辑透明</p>
          </div>
          <div class="mt-4 md:mt-0">
            <div class="flex items-center space-x-4">
              <div class="text-center">
                <div class="text-2xl font-bold">${newsList.length}</div>
                <div class="text-sm opacity-80">深度分析</div>
              </div>
              <div class="h-10 w-px bg-white opacity-30"></div>
              <div class="text-center">
                <div class="text-2xl font-bold">5</div>
                <div class="text-sm opacity-80">关注公司</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>

    <!-- 系统说明 -->
    <div class="mb-8 p-6 bg-white rounded-xl shadow-sm border border-gray-200">
      <h3 class="text-lg font-semibold text-gray-800 mb-3">📋 系统特点说明</h3>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div class="p-3 bg-blue-50 rounded-lg">
          <div class="text-blue-600 font-medium mb-1">1. 深度分析质量</div>
          <div class="text-sm text-gray-600">总结提炼原文内容，保留逻辑框架，高亮重点信息</div>
        </div>
        <div class="p-3 bg-green-50 rounded-lg">
          <div class="text-green-600 font-medium mb-1">2. 内容完整展示</div>
          <div class="text-sm text-gray-600">不截断内容，完整呈现深度分析，确保信息完整性</div>
        </div>
        <div class="p-3 bg-purple-50 rounded-lg">
          <div class="text-purple-600 font-medium mb-1">3. 评分逻辑透明</div>
          <div class="text-sm text-gray-600">明确评分标准，解释评分依据，消除疑惑</div>
        </div>
      </div>
    </div>

    <!-- 新闻列表 -->
    <main>
      <div class="mb-6 flex items-center justify-between">
        <h3 class="text-xl font-bold text-gray-900">📰 今日深度分析</h3>
        <div class="text-sm text-gray-500">
          <i class="fas fa-sync-alt mr-1"></i>
          最后更新: ${today.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>
      
      ${newsList.length === 0 ? `
      <div class="text-center py-12">
        <div class="text-5xl mb-4">📰</div>
        <h3 class="text-xl font-semibold text-gray-700 mb-2">今日暂无新闻</h3>
        <p class="text-gray-500">请稍后再试或检查网络连接</p>
      </div>
      ` : `
      <div class="space-y-6">
        ${newsList.map((news, index) => generateNewsCardWithFullAnalysis(news, index)).join('')}
      </div>
      `}
    </main>

    <!-- 页脚 -->
    <footer class="mt-12 pt-8 border-t border-gray-200">
      <div class="flex flex-col md:flex-row justify-between items-center">
        <div class="mb-4 md:mb-0">
          <p class="text-gray-600">💡 深度分析系统 v2.0 - 解决三个核心问题</p>
          <p class="text-gray-500 text-sm mt-1">自动更新: 每天 09:00 (北京时间)</p>
        </div>
        <div class="flex items-center space-x-4">
          <a href="https://github.com/lovinglaura/company-news" class="text-blue-400 hover:text-blue-300 transition-colors">
            <i class="fab fa-github mr-1"></i>查看源码
          </a>
          <span class="text-gray-400">|</span>
          <span class="text-gray-500 text-sm">版本: 深度分析版</span>
        </div>
      </div>
      <div class="mt-4 text-center text-gray-400 text-sm">
        <p>⚠️ 免责声明: 本网站内容仅供参考，不构成投资建议。投资有风险，决策需谨慎。</p>
      </div>
    </footer>
  </div>

  <script>
    // 简单的交互效果
    document.addEventListener('DOMContentLoaded', function() {
      // 卡片悬停效果
      const cards = document.querySelectorAll('.card-hover');
      cards.forEach(card => {
        card.addEventListener('mouseenter', () => {
          card.style.transform = 'translateY(-4px)';
        });
        card.addEventListener('mouseleave', () => {
          card.style.transform = 'translateY(0)';
        });
      });
    });
  </script>
</body>
</html>`;
}

/**
 * 主函数
 */
async function main() {
  console.log('🚀 启动增强版新闻系统...');
  console.log('🎯 解决三个核心问题：');
  console.log('  1. 深度分析质量');
  console.log('  2. 内容完整展示');  
  console.log('  3. 评分逻辑透明');
  
  const today = new Date().toISOString().split('T')[0];
  const dataFile = path.join(__dirname, 'data', `real-news-${today}.json`);
  
  try {
    // 读取真实新闻数据
    const data = JSON.parse(await fs.readFile(dataFile, 'utf8'));
    
    if (!data.news || !Array.isArray(data.news) || data.news.length === 0) {
      console.log('❌ 没有找到新闻数据');
      return false;
    }
    
    console.log(`📊 处理 ${data.news.length} 条新闻的深度分析...`);
    
    // 为每条新闻计算评分
    data.news.forEach(news => {
      news.impactScore = SCORING_LOGIC.impact.calculate(news);
      news.valueScore = SCORING_LOGIC.value.calculate(news);
      news.impactDesc = getScoreDescription(news.impactScore, 'impact');
      news.valueDesc = getScoreDescription(news.valueScore, 'value');
      
      console.log(`  ${news.company}: 影响${news.impactScore}/10, 价值${news.valueScore}/10`);
    });
    
    // 生成HTML
    const html = generateFullHtmlWithAnalysis(data.news.slice(0, 8)); // 取前8条
    
    // 保存HTML文件
    const outputFile = path.join(__dirname, '..', 'index.html');
    await fs.writeFile(outputFile, html, 'utf8');
    
    console.log(`\n✅ 增强版网站生成成功！`);
    console.log(`📄 保存到: ${outputFile}`);
    console.log(`📰 包含 ${Math.min(data.news.length, 8)} 条深度分析新闻`);
    
    // 显示评分逻辑示例
    console.log(`\n📊 评分逻辑示例:`);
    const exampleNews = data.news[0];
    if (exampleNews) {
      console.log(`  新闻: ${exampleNews.title.substring(0, 50)}...`);
      console.log(`  影响评分: ${exampleNews.impactScore}/10 - ${exampleNews.impactDesc.level}`);
      console.log(`  价值评分: ${exampleNews.valueScore}/10 - ${exampleNews.valueDesc.level}`);
      console.log(`  评分依据: ${getScoringBasis(exampleNews, 'impact')}`);
    }
    
    return true;
    
  } catch (error) {
    console.error(`❌ 生成失败: ${error.message}`);
    return false;
  }
}

// 运行主函数
main().then(success => {
  if (success) {
    console.log('\n🎉 增强版网站已更新！');
    console.log('\n✅ 已解决的三个问题:');
    console.log('  1. ✅ 深度分析质量 - 总结提炼原文，保留逻辑框架，高亮重点信息');
    console.log('  2. ✅ 内容完整展示 - 不截断内容，完整呈现深度分析');
    console.log('  3. ✅ 评分逻辑透明 - 明确评分标准，解释评分依据');
    console.log('\n🔗 网站地址: https://lovinglaura.github.io/company-news/');
  } else {
    console.log('\n❌ 生成失败，请检查数据文件');
  }
  process.exit(success ? 0 : 1);
});