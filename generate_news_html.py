#!/usr/bin/env python3
import json
from datetime import datetime
from pathlib import Path

# 读取新闻数据
with open('latest_ai_news.json', 'r', encoding='utf-8') as f:
    news_data = json.load(f)

# 计算统计数据
total_news = len(news_data['news'])
avg_score = sum(item['valueScore'] for item in news_data['news']) / total_news
update_time = datetime.now().strftime('%Y/%m/%d')

# 生成新闻卡片HTML
news_cards_html = ''
category_icons = {
    '技术突破': '🚀',
    '产业数据': '📊',
    '行业动态': '🌐',
    '投融资': '💰',
    '技术趋势': '📈',
    '行业观察': '👀',
    '行业报告': '📋'
}

category_colors = {
    '技术突破': 'bg-purple-100 text-purple-800',
    '产业数据': 'bg-blue-100 text-blue-800',
    '行业动态': 'bg-indigo-100 text-indigo-800',
    '投融资': 'bg-green-100 text-green-800',
    '技术趋势': 'bg-amber-100 text-amber-800',
    '行业观察': 'bg-orange-100 text-orange-800',
    '行业报告': 'bg-cyan-100 text-cyan-800'
}

for news in news_data['news']:
    category = news['category']
    icon = category_icons.get(category, '📰')
    color_class = category_colors.get(category, 'bg-gray-100 text-gray-800')

    # 根据价值评分确定影响级别（整数映射便于星级）
    score = int(news.get('valueScore', 8.0))
    if score >= 9:
        impact = '极高影响'
        impact_color = 'bg-red-100 text-red-800'
    elif score >= 8:
        impact = '高影响'
        impact_color = 'bg-green-100 text-green-800'
    else:
        impact = '中等影响'
        impact_color = 'bg-yellow-100 text-yellow-800'

    # 生成星级评分
    sstars = '★' * score

    news_card = """<div class="bg-white rounded-xl p-6 shadow-sm card-hover border border-gray-100 mb-5">
  <div class="flex items-start justify-between mb-4">
    <div class="flex items-center space-x-3">
      <span class="flex items-center justify-center w-8 h-8 rounded-full {color_class}">
        <span class="text-sm">{icon}</span>
      </span>
      <div>
        <span class="inline-block px-3 py-1 text-xs font-medium rounded-full {color_class}">
          {category}
        </span>
      </div>
    </div>
    <div class="text-right">
      <span class="inline-block px-2 py-1 text-xs font-medium rounded {impact_color}">
        {impact}
      </span>
      <div class="mt-1 text-xs text-gray-500">{source} · {date}</div>
    </div>
  </div>

  <h3 class="text-lg font-bold text-gray-900 mb-3 line-clamp-2">{title}</h3>

  <p class="text-gray-600 mb-4 line-clamp-3">{summary}</p>

  <div class="flex items-center justify-between">
    <div class="text-sm text-gray-500">
      <span class="font-medium">价值评分:</span>
      <span class="ml-2 inline-flex items-center">
        {sstars}
        <span class="ml-1">{score}/10</span>
      </span>
    </div>

    <div class="mt-3">
      <a href="{url}" target="_blank" rel="noopener noreferrer" class="inline-flex items-center text-sm text-blue-600 hover:text-blue-800 transition-colors">
        <span>阅读原文</span>
        <svg class="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path>
        </svg>
      </a>
    </div>
  </div>
</div>""".format(
        icon=icon,
        color_class=color_class,
        category=category,
        impact=impact,
        impact_color=impact_color,
        source=news['source'],
        date=news_data['date'],
        title=news['title'],
        summary=news['summary'],
        sstars=sstars,
        score=score,
        url=news['url']
    )

    news_cards_html += news_card

# 生成完整的HTML文件
html_content = f'''<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>每日AI行业新闻动态 - 高价值精选</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
  <style>
    *{{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif}}
    body{{background:#f5f7fa;margin:0;padding:20px}}
    .container{{max-width:1200px;margin:0 auto}}
    .header{{background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);color:white;padding:30px;border-radius:12px;margin-bottom:30px;box-shadow:0 4px 6px rgba(0,0,0,0.1)}}
    .header h1{{font-size:28px;font-weight:700;margin:0 0 10px 0}}
    .header p{{font-size:16px;opacity:0.9;margin:0}}
    .stats-bar{{background:white;padding:20px;border-radius:8px;box-shadow:0 2px 4px rgba(0,0,0,0.05);margin-bottom:20px;display:flex;justify-content:space-around}}
    .stat-item{{text-align:center}}
    .stat-number{{font-size:24px;font-weight:700;color:#667eea}}
    .stat-label{{font-size:14px;color:#6b7280;margin-top:4px}}
    .news-section{{background:white;border-radius:8px;box-shadow:0 2px 4px rgba(0,0,0,0.05);padding:25px}}
    .section-title{{font-size:20px;font-weight:600;color:#1f2937;margin:0 0 20px 0;padding-bottom:10px;border-bottom:1px solid #e5e7eb}}
    .footer{{margin-top:30px;padding:20px 0;border-top:1px solid #e5e7eb;text-align:center;color:#6b7280;font-size:14px}}
    .footer a{{color:#667eea;text-decoration:none}}
    .footer a:hover{{text-decoration:underline}}
    .card-hover:hover{{transform: translateY(-2px); box-shadow: 0 10px 25px -5px rgba(0,0,0,0.1); transition: all 0.3s ease;}}
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
        <div class="stat-number">{total_news}</div>
        <div class="stat-label">今日精选新闻</div>
      </div>
      <div class="stat-item">
        <div class="stat-number">{avg_score:.1f}+</div>
        <div class="stat-label">平均价值评分</div>
      </div>
      <div class="stat-item">
        <div class="stat-number">{update_time}</div>
        <div class="stat-label">更新时间</div>
      </div>
    </div>

    <div class="news-section">
      <h2 class="section-title">📰 最新高价值AI新闻</h2>
{news_cards_html}
    </div>

    <div class="footer">
      <p>本网站由OpenClaw自动维护 · 数据来源：主流科技媒体</p>
      <p>
        <a href="https://github.com/lovinglaura/ai-daily-news" target="_blank">GitHub仓库</a> ·
        <a href="https://lovinglaura.github.io/ai-daily-news/" target="_blank">网站地址</a>
      </p>
    </div>
  </div>
</body>
</html>'''

# 写入新的index.html
with open('index.html', 'w', encoding='utf-8') as f:
    f.write(html_content)

print(f'✅ 成功更新网站内容')
print(f'📊 新闻数量: {total_news}')
print(f'⭐ 平均评分: {avg_score:.2f}')
print(f'📅 更新时间: {update_time}')