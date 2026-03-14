import json
from datetime import datetime

# 读取新闻数据
with open('/workspace/projects/workspace/ai-daily-news/latest_news.json', 'r', encoding='utf-8') as f:
    news_list = json.load(f)

# 统计各分类数量
category_stats = {}
for news in news_list:
    cat = news['category']
    if cat not in category_stats:
        category_stats[cat] = {"count": 0, "high_impact": 0}
    category_stats[cat]["count"] += 1
    if news['score'] >= 8.5:
        category_stats[cat]["high_impact"] += 1

# 生成统计卡片HTML
stats_html = ""
for cat, stats in category_stats.items():
    emoji = cat.split(" ")[0]
    name = cat.split(" ")[1]
    stats_html += f"""
                <div class="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
                  <div class="flex items-center gap-3 mb-2">
                    <span class="text-xl">{emoji}</span>
                    <span class="font-semibold text-gray-900">{name}</span>
                  </div>
                  <div class="text-sm text-gray-600">
                    <div class="flex items-center justify-between">
                      <span>新闻数量:</span>
                      <span class="font-medium">{stats['count']}条</span>
                    </div>
                    <div class="flex items-center justify-between mt-1">
                      <span>高影响新闻:</span>
                      <span class="font-medium text-red-600">{stats['high_impact']}条</span>
                    </div>
                  </div>
                </div>
"""

# 生成新闻卡片HTML
news_html = ""
for news in news_list:
    # 分类样式
    category_class = {
        "🤖 大模型": "bg-blue-100 text-blue-800",
        "💻 AI芯片": "bg-purple-100 text-purple-800",
        "🎨 生成式AI": "bg-green-100 text-green-800",
        "📈 AI行业": "bg-amber-100 text-amber-800",
        "🦾 机器人": "bg-red-100 text-red-800"
    }.get(news['category'], "bg-gray-100 text-gray-800")
    
    # 分数标签
    score_tag = "🔥 必读 " + str(news['score']) + "分" if news['score'] >= 8.5 else "📰 推荐 " + str(news['score']) + "分"
    score_class = "bg-red-100 border-red-500 text-red-900" if news['score'] >= 8.5 else "bg-blue-100 border-blue-500 text-blue-900"
    
    # 关键点
    key_points_html = ""
    for point in news['key_points']:
        key_points_html += f'<li class="flex items-start"><span class="mr-2 text-amber-500">★</span><span class="bg-amber-50 px-2 py-1 rounded">{point}</span></li>\n'
    
    # 卡片HTML
    news_html += f"""
            <div class="bg-white rounded-xl p-6 shadow-sm card-hover transition-all duration-300 hover:shadow-lg border border-gray-100">
                <!-- 头部 -->
                <div class="flex items-start justify-between mb-4">
                    <div class="flex items-center gap-3">
                        <span class="text-2xl">{news['category'].split(" ")[0]}</span>
                        <span class="inline-block px-3 py-1 rounded-full text-xs font-medium {category_class}">
                            {news['category'].split(" ")[1]}
                        </span>
                    </div>
                    <span class="inline-block px-2 py-1 rounded-full text-xs font-medium border {score_class}">
                        {score_tag}
                    </span>
                </div>

                <!-- 标题 -->
                <h3 class="text-lg font-bold text-gray-900 mb-3 leading-tight">{news['title']}</h3>

                <!-- 深度解读 -->
                <div class="bg-gradient-to-r from-blue-50 to-blue-100 border-l-4 border-blue-500 p-4 rounded-r-lg mb-4">
                    <div class="font-semibold text-blue-800 mb-2 flex items-center">
                        <span class="mr-2">📖</span>
                        <span>深度解读</span>
                    </div>
                    <p class="text-blue-900 text-sm leading-relaxed">{news['analysis']}</p>
                </div>

                <!-- 重要信息 -->
                <div class="mt-4 pt-4 border-t border-gray-200">
                    <div class="text-sm font-semibold text-gray-700 mb-2">🎯 重要信息</div>
                    <ul class="space-y-1 text-sm text-gray-700">
                        {key_points_html}
                    </ul>
                </div>

                <!-- 页脚 -->
                <div class="mt-4 pt-4 border-t border-gray-200 flex items-center justify-between text-xs text-gray-500">
                    <div class="flex items-center gap-2">
                        <span>📅 {news['date']}</span>
                        <span>📰 {news['source']}</span>
                    </div>
                    <div class="flex items-center gap-2">
                        <span>🏷️ {news['category'].split(" ")[1]}</span>
                    </div>
                </div>

                <!-- 链接 -->
                <div class="mt-3">
                    <a href="{news['link']}" target="_blank" rel="noopener noreferrer" class="inline-flex items-center text-sm text-blue-600 hover:text-blue-800 transition-colors">
                        <span>阅读原文</span>
                        <svg class="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path>
                        </svg>
                    </a>
                </div>
            </div>
"""

# 生成完整HTML
current_time = datetime.now().strftime("%Y/%m/%d %H:%M:%S")
html_template = f"""<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>金珂重点关注AI行业新闻动态 | 每日AI行业新闻深度分析</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        body {{
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, system-ui, sans-serif;
        }}
        .gradient-bg {{
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }}
        .card-hover {{
            transition: all 0.3s ease;
        }}
        .card-hover:hover {{
            transform: translateY(-4px);
            box-shadow: 0 20px 40px rgba(0,0,0,0.12);
        }}
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
                    更新时间：{current_time}
                </span>
                <span class="flex items-center gap-1">
                    <span class="text-lg">📊</span>
                    今日精选：{len(news_list)}条（从50+条中筛选）
                </span>
            </div>
        </div>
    </header>

    <!-- 统计栏 -->
    <div class="bg-white border-b border-gray-200 py-6 px-4 shadow-sm">
        <div class="max-w-7xl mx-auto">
            <div class="flex items-center justify-between mb-4">
                <h2 class="text-lg font-bold text-gray-900">📈 AI行业新闻统计</h2>
                <span class="text-sm text-gray-500">共覆盖 {len(category_stats)} 个赛道</span>
            </div>
            <div class="grid grid-cols-2 md:grid-cols-5 gap-3">
                {stats_html}
            </div>
        </div>
    </div>

    <!-- 主内容区 -->
    <main class="max-w-7xl mx-auto py-8 px-4">
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {news_html}
        </div>
    </main>
    <footer class="bg-gray-800 text-white py-6 px-4 mt-12">
        <div class="max-w-7xl mx-auto text-center text-sm text-gray-400">
            <p>© 2026 AI行业新闻动态 | 每日自动更新 | 内容来源于公开权威媒体</p>
        </div>
    </footer>
</body>
</html>
"""

# 写入新的index.html
with open('/workspace/projects/workspace/ai-daily-news/index.html', 'w', encoding='utf-8') as f:
    f.write(html_template)

print("Successfully generated new index.html with latest news")
