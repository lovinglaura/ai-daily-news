#!/usr/bin/env node

/**
 * 金珂重点关注AI行业新闻动态 - 核心抓取脚本
 * 
 * 三级搜索策略：
 * 1. 实时新闻（最近24小时）
 * 2. 重要新闻（最近3天）
 * 3. 深度分析（最近7天）
 */

const fs = require('fs').promises;
const path = require('path');
const https = require('https');
const { Config, SearchClient, ChatClient } = require('coze-coding-dev-sdk');

// 权威财经来源白名单
const AUTHORITY_SOURCES = [
  // 国内权威财经网站
  'caixin.com', 'eeo.com.cn', 'yicai.com', 'stcn.com', 'cnstock.com.cn',
  'cs.com.cn', 'cls.cn', 'wallstreetcn.com', 'nbd.com.cn', 'eastmoney.com',
  '10jqka.com.cn', 'xueqiu.com', 'cninfo.com.cn', 'finance.sina.com.cn', 'jiemian.com',
  // 国际顶级财经网站
  'bloomberg.com', 'reuters.com', 'ft.com', 'wsj.com'
];

// 配置 - 三级搜索策略
const CONFIG = {
  companies: {
    llm: {
      queries: [
        { query: '大模型 最新进展 发布 今天', timeRange: '1d', priority: 1 },
        { query: 'GPT-5 Claude 3 Gemini 最新动态', timeRange: '3d', priority: 2 },
        { query: '大模型 技术突破 应用落地', timeRange: '3d', priority: 3 }
      ],
      ticker: '大模型',
      color: 'bg-blue-100 text-blue-800',
      icon: '🤖'
    },
    ai_chip: {
      queries: [
        { query: 'AI芯片 最新发布 性能 今天', timeRange: '1d', priority: 1 },
        { query: '英伟达 AMD 华为 昇腾 寒武纪 最新动态', timeRange: '3d', priority: 2 },
        { query: 'GPU H100 H200 MI300 产能 价格', timeRange: '3d', priority: 3 }
      ],
      ticker: 'AI芯片',
      color: 'bg-green-100 text-green-800',
      icon: '💻'
    },
    genai: {
      queries: [
        { query: '生成式AI 应用 产品 今天', timeRange: '1d', priority: 1 },
        { query: 'AI绘画 AI视频 AI生成 最新产品', timeRange: '3d', priority: 2 },
        { query: '生成式AI 商业化 投融资 政策', timeRange: '3d', priority: 3 }
      ],
      ticker: '生成式AI',
      color: 'bg-purple-100 text-purple-800',
      icon: '🎨'
    },
    ai_industry: {
      queries: [
        { query: '人工智能 行业动态 政策 今天', timeRange: '1d', priority: 1 },
        { query: 'AI 监管 法规 行业标准 最新', timeRange: '3d', priority: 2 },
        { query: 'AI 创业 投融资 并购 动态', timeRange: '3d', priority: 3 }
      ],
      ticker: 'AI行业',
      color: 'bg-orange-100 text-orange-800',
      icon: '📈'
    },
    robot: {
      queries: [
        { query: '人形机器人 自动驾驶 最新发布 今天', timeRange: '1d', priority: 1 },
        { query: '特斯拉Optimus 波士顿动力 小米机器人 最新', timeRange: '3d', priority: 2 },
        { query: '机器人 商业化 应用场景 技术突破', timeRange: '3d', priority: 3 }
      ],
      ticker: '机器人',
      color: 'bg-red-100 text-red-800',
      icon: '🦾'
    }
  },
  
  // 搜索配置
  maxItemsPerQuery: 3,
  finalNewsCount: 10,
  
  // 优先级权重
  priorityWeights: {
    1: 1.5, // 实时新闻权重最高
    2: 1.2, // 重要新闻中等权重
    3: 1.0  // 深度分析基础权重
  }
};

/**
 * 抓取新闻原文全文内容
 */
async function fetchArticleContent(url) {
  return new Promise((resolve) => {
    // 支持http和https
    const httpModule = url.startsWith('https') ? require('https') : require('http');
    httpModule.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => { resolve(data.substring(0, 10000)); }); // 只取前1万字符
    }).on('error', () => { resolve(''); });
  });
}

/**
 * 深度总结新闻内容，保留完整核心信息和数据，去除来源等非核心信息
 */
async function summarizeArticle(title, content) {
  // 过滤无效内容（302跳转、403、空内容、js代码等）
  if (content.includes('302 Found') || content.includes('403 Forbidden') || content.includes('NotFound') || content.trim().length < 50) {
    // 抓取失败直接用标题+核心背景
    return title + '。具体内容请查看原文链接。';
  }
  
  // 去掉script标签、style标签和所有js代码
  content = content.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');
  content = content.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '');
  // 去掉所有HTML标签
  content = content.replace(/<[^>]*>/g, '');
  // 先过滤所有JavaScript代码片段，只要包含JS相关关键词的内容直接删除
  content = content.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');
  content = content.replace(/function\s+.*?\{[\s\S]*?\}/gi, '');
  content = content.replace(/var\s+.*?;|let\s+.*?;|const\s+.*?;/gi, '');
  content = content.replace(/window\..*?;|document\..*?;|navigator\..*?;/gi, '');
  content = content.replace(/location\..*?;|userAgent|isAndroid|isIOS|isWechat|isQQ/gi, '');
  // 先过滤所有ASCII控制字符（0x00-0x1F, 0x7F）
  content = content.replace(/[\x00-\x1F\x7F]/g, '');
  // 过滤所有乱码、特殊符号、不可见字符，只保留中文、数字、中文标点
  content = content.replace(/[^\u4e00-\u9fa50-9，。；：“”‘’（）【】、%+]/g, '');
  // 过滤无意义的纯数字串、乱码数字字符
  content = content.replace(/\d{6,}/g, ''); // 过滤6位以上连续无意义数字串
  content = content.replace(/([^\u4e00-\u9fa5%+])(\d+)([^\u4e00-\u9fa5%+])/g, '$1$3'); // 过滤孤立无意义数字
  // 过滤连续多个重复符号
  content = content.replace(/[，。；：“”‘’（）【】、+%]{2,}/g, s => s[0]);
  // 过滤掉所有非核心信息：来源、发布时间、作者、编辑、媒体号、地理位置、平台信息、时间戳、媒体名称等
  content = content.replace(/来源：.*?([\n。])/g, '$1')
    .replace(/发布时间：.*?([\n。])/g, '$1')
    .replace(/作者：.*?([\n。])/g, '$1')
    .replace(/记者：.*?([\n。])/g, '$1')
    .replace(/编辑：.*?([\n。])/g, '$1')
    .replace(/本文来自.*?([\n。])/g, '$1')
    .replace(/澎湃号/gi, '')
    .replace(/官方账号|媒体号|澎湃新闻|国际金融报|财新|第一财经|证券时报|中国证券报|财联社|华尔街见闻|每日经济新闻|东方财富|同花顺|雪球|新浪财经|界面新闻|彭博|路透|金融时报|华尔街日报/gi, '')
    .replace(/北京|上海|广州|深圳|杭州|成都|武汉|南京/gi, '')
    .replace(/下载APP|扫码关注|点击查看|微信公众号|微博|小红书/gi, '')
    .replace(/\d{4}年\d{1,2}月\d{1,2}/g, '') // 去除所有日期时间格式
    .replace(/【.*?】/g, '')
    .replace(/\s+/g, ' ')
    .trim();
  
  // 如果过滤后内容还是太短，直接返回完整标题
  if (content.length < 50) {
    return title;
  }
  
  // 提取完整核心内容，不截断，保留所有关键数据和信息点
  // 筛选出包含核心关键词的句子，合并成完整总结
  const keySentences = content.split(/[。；]/).filter(sentence => {
    const keywords = ['营收', '净利润', '增长', '下降', '同比', '环比', '发布', '推出', '合作', '投资', '收购', '财报', '业绩', '股价', '涨', '跌', '产能', '销量', '收入', '利润', 'AI', '技术', '产品'];
    return keywords.some(key => sentence.includes(key)) && sentence.trim().length > 10;
  });
  
  let summary = keySentences.join('。').trim();
  if (!summary.endsWith('。')) summary += '。';
  
  // 确保内容完整，不省略，同时去除和标题重复的内容
  let finalSummary = summary.length > 0 ? summary : content.substring(0, 500).trim();
  // 去除和标题重复的部分
  if (title && finalSummary.includes(title.trim())) {
    finalSummary = finalSummary.replace(title.trim(), '').trim();
  }
  // 如果去除后内容太短，就保留标题+核心内容，但避免重复
  if (finalSummary.length < 30) {
    finalSummary = content.substring(0, 300).replace(title.trim(), '').trim();
  }
  if (!finalSummary.endsWith('。')) finalSummary += '。';
  return finalSummary;
}

/**
 * 真实coze-web-search API调用
 */
async function searchNews(query, timeRange = '1d', maxResults = 10) {
  console.log(`🔍 搜索: "${query}" (时间范围: ${timeRange})`);
  
  const config = new Config();
  const client = new SearchClient(config);

  try {
    const result = await client.advancedSearch(query, {
      searchType: 'web',
      count: maxResults,
      timeRange: timeRange,
      needSummary: false,
      needContent: false
    });

    if (!result.web_items || result.web_items.length === 0) {
      console.log(`   ⚠️  未找到新闻`);
      return [];
    }

    console.log(`   ✅ 找到 ${result.web_items.length} 条新闻`);
    // 优先保留权威来源，不足的话保留其他来源内容
    let filteredItems = result.web_items.filter(item => {
      if (!item.url) return false;
      try {
        const url = new URL(item.url);
        const domain = url.hostname.replace('www.', '');
        return AUTHORITY_SOURCES.some(source => domain.includes(source));
      } catch (e) {
        return false;
      }
    });
    // 如果权威来源不足3条，补充其他来源内容
    if (filteredItems.length < 3) {
      const otherItems = result.web_items.filter(item => {
        if (!item.url) return false;
        try {
          const url = new URL(item.url);
          const domain = url.hostname.replace('www.', '');
          return !AUTHORITY_SOURCES.some(source => domain.includes(source));
        } catch (e) {
          return false;
        }
      });
      filteredItems = filteredItems.concat(otherItems.slice(0, 3 - filteredItems.length));
    }
    console.log(`   🎯 筛选出 ${filteredItems.length} 条新闻（优先权威来源）`);
    return filteredItems.map((item, index) => ({
      title: item.title || '无标题',
      url: item.url,
      source: item.site_name || '未知来源',
      publish_time: item.publish_time,
      snippet: item.snippet || '无摘要'
    }));
  } catch (error) {
    console.log(`   ❌ 搜索失败: ${error.message}`);
    return [];
  }
}

/**
 * 简化分析函数 - 快速处理
 */
async function quickAnalyze(article, companyInfo, queryPriority) {
  const title = article.title || '无标题';
  const source = article.source || '未知来源';
  const publishTime = article.publish_time || new Date().toISOString();
  
  // 抓取原文并深度总结，只保留关键信息和数据
  const rawContent = await fetchArticleContent(article.url);
  const deepSummary = await summarizeArticle(title, rawContent);
  
  // 过滤原文内容，提取纯文本
  let cleanContent = rawContent.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');
  cleanContent = cleanContent.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '');
  cleanContent = cleanContent.replace(/<[^>]*>/g, '');
  cleanContent = cleanContent.replace(/[^\u4e00-\u9fa50-9，。；：“”‘’（）【】、%+]/g, '').trim();
  
  // 基础评分
  let score = 5;
  
  // 关键词影响
  const highImpactWords = ['财报', '盈利', '亏损', '营收', '净利润', '增长率', '回购', '拆分'];
  const mediumImpactWords = ['产品发布', '新品', '技术突破', '合作', '协议', '订单'];
  
  let impactLevel = '低';
  let impactType = '长期';
  
  // 检查高影响关键词
  for (const word of highImpactWords) {
    if (title.includes(word) || cleanContent.includes(word)) {
      score = 8;
      impactLevel = '高';
      impactType = '短期';
      break;
    }
  }
  
  // 检查中影响关键词
  if (score === 5) {
    for (const word of mediumImpactWords) {
      if (title.includes(word) || cleanContent.includes(word)) {
        score = 7;
        impactLevel = '中';
        impactType = '中期';
        break;
      }
    }
  }
  
  // 应用优先级权重
  score *= CONFIG.priorityWeights[queryPriority] || 1.0;
  score = Math.min(10, Math.max(1, score));
  
  // 提取重要信息 - 从原文提取完整金句，不是关键词
  const importantInfo = [];
  const infoPatterns = ['营收', '净利润', '增长', '下降', '发布', '合作', '投资', '收购', '突破', '产能', '订单'];
  if (cleanContent.length > 50) {
    const sentences = cleanContent.split(/[。；]/);
    for (const sentence of sentences) {
      if (infoPatterns.some(pattern => sentence.includes(pattern)) && sentence.trim().length > 15 && sentence.trim().length < 100) {
        importantInfo.push(sentence.trim() + '。');
        if (importantInfo.length >= 3) break; // 最多提取3条重要信息
      }
    }
  }
  
  // 如果没有从原文提取到，就从标题提取
  if (importantInfo.length === 0) {
    importantInfo.push(title);
  }
  
  // 确定逻辑链条
  let logicChain = '事件→进展→意义';
  if (title.includes('财报')) {
    logicChain = '数据发布→市场反应→投资建议';
  } else if (title.includes('产品')) {
    logicChain = '产品发布→技术特点→市场影响';
  }
  
  return {
    id: `${companyInfo.ticker}-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
    title: title,
    summary: article.snippet || '无摘要',
    url: article.url,
    source: source,
    publishTime: publishTime,
    company: companyInfo.ticker,
    valueScore: parseFloat(score.toFixed(1)),
    stockImpact: {
      score: score,
      type: impactType,
      level: impactLevel,
      description: getImpactDescription(score, impactType, impactLevel)
    },
    logicChain: logicChain,
    keyData: [],
    importantInfo: importantInfo,
    deepSummary: deepSummary
  };
}

function getImpactDescription(score, type, level) {
  if (score >= 8) return `对股价有显著${type}影响（高级别），建议重点关注`;
  if (score >= 5) return `对股价有中等${type}影响，建议关注`;
  return `对股价影响较小，可作为参考信息`;
}

/**
 * 主函数 - 执行每日更新
 */
async function main() {
  console.log('🚀 金珂重点关注AI行业新闻动态 - 每日自动更新');
  console.log('==================================================');
  console.log('📈 覆盖公司: 人工智能、大模型、AI芯片、生成式AI、机器人');
  console.log('🎯 重点关注: 影响股价的最新新闻');
  console.log('⏰ 时间: ' + new Date().toLocaleString('zh-CN'));
  console.log('');
  
  const allNews = [];
  let totalSearched = 0;
  let realTimeCount = 0;
  let importantCount = 0;
  let deepCount = 0;
  
  // 遍历所有公司
  for (const [companyName, companyInfo] of Object.entries(CONFIG.companies)) {
    console.log(`📡 搜索 ${companyName} (${companyInfo.ticker})...`);
    
    let companyNews = [];
    
    // 三级搜索策略
    for (const queryConfig of companyInfo.queries) {
      const { query, timeRange, priority } = queryConfig;
      
      // 执行搜索
      const searchResults = await searchNews(query, timeRange, CONFIG.maxItemsPerQuery);
      totalSearched += searchResults.length;
      
      // 统计时效性
      if (priority === 1) realTimeCount += searchResults.length;
      else if (priority === 2) importantCount += searchResults.length;
      else if (priority === 3) deepCount += searchResults.length;
      
      // 快速分析每篇文章
      for (const article of searchResults) {
        const analyzed = await quickAnalyze(article, companyInfo, priority);
        if (analyzed) {
          companyNews.push(analyzed);
        }
      }
      
      // 稍微等待，避免请求过快
      await new Promise(resolve => setTimeout(resolve, 800));
    }
    
    // 按价值评分排序，每家公司至少保留1条，最多3条，确保覆盖所有公司
    companyNews.sort((a, b) => b.valueScore - a.valueScore);
    // 每家公司至少留1条，最多3条
    const takeCount = Math.max(1, Math.min(3, companyNews.length));
    const topNews = companyNews.slice(0, takeCount);
    
    allNews.push(...topNews);
    console.log(`   ✅ 精选 ${topNews.length} 条高价值新闻`);
  }
  
  // 按价值评分全局排序
  allNews.sort((a, b) => b.valueScore - a.valueScore);
  
  // 优先保留最近7天的新闻，确保每家公司至少1条
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  sevenDaysAgo.setHours(0, 0, 0, 0);
  
  // 统计每家公司的新闻数量
  const companyCount = {};
  const filteredNews = [];
  
  // 加7天内的所有权威来源新闻
  for (const news of allNews) {
    if (!news.publishTime) continue;
    const publishTime = new Date(news.publishTime).getTime();
    if (publishTime >= sevenDaysAgo.getTime()) {
      filteredNews.push(news);
      companyCount[news.company] = (companyCount[news.company] || 0) + 1;
    }
  }
  
  // 每家公司不足1条的，放宽到15天内的
  for (const [companyName, companyInfo] of Object.entries(CONFIG.companies)) {
    const ticker = companyInfo.ticker;
    if (!companyCount[ticker] || companyCount[ticker] < 1) {
      const fifteenDaysAgo = new Date();
      fifteenDaysAgo.setDate(fifteenDaysAgo.getDate() - 15);
      fifteenDaysAgo.setHours(0, 0, 0, 0);
      for (const news of allNews) {
        if (news.company === ticker && news.publishTime) {
          const publishTime = new Date(news.publishTime).getTime();
          if (publishTime >= fifteenDaysAgo.getTime()) {
            filteredNews.push(news);
            companyCount[ticker] = (companyCount[ticker] || 0) + 1;
            break;
          }
        }
      }
    }
  }
  
  // 最终按评分排序，最多10条
  filteredNews.sort((a, b) => b.valueScore - a.valueScore);
  const finalNews = filteredNews.slice(0, 10);
  
  // 准备输出数据
  const outputData = {
    date: new Date().toISOString(),
    totalSearched: totalSearched,
    selected: finalNews.length,
    realTimeNews: realTimeCount,
    importantNews: importantCount,
    deepNews: deepCount,
    companies: Object.keys(CONFIG.companies),
    news: finalNews
  };
  
  // 保存数据
  const dateStr = new Date().toISOString().split('T')[0];
  const dataDir = path.join(__dirname, 'data');
  await fs.mkdir(dataDir, { recursive: true });
  
  const outputPath = path.join(dataDir, `company-news-${dateStr}.json`);
  await fs.writeFile(outputPath, JSON.stringify(outputData, null, 2));
  
  console.log('');
  console.log('💾 数据已保存到:', outputPath);
  console.log('📊 统计信息:');
  console.log(`   总搜索量: ${totalSearched}条`);
  console.log(`   实时新闻(1d): ${realTimeCount}条`);
  console.log(`   重要新闻(3d): ${importantCount}条`);
  console.log(`   深度分析(7d): ${deepCount}条`);
  console.log(`   精选新闻: ${finalNews.length}条`);
  
  // 显示高价值新闻
  console.log('');
  console.log('🔥 今日高价值新闻:');
  finalNews.slice(0, 5).forEach((news, index) => {
    console.log(`   ${index + 1}. ${news.title} (${news.valueScore}/10)`);
  });
  
  console.log('');
  console.log('🎉 新闻抓取完成！');
  
  return outputData;
}

// 执行主函数
if (require.main === module) {
  main().catch(error => {
    console.error('❌ 执行失败:', error);
    process.exit(1);
  });
}

module.exports = { main };