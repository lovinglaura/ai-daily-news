import feedparser
from datetime import datetime, timedelta
import pytz
import json
import os

# 配置RSS源
RSS_SOURCES = [
    "https://techcrunch.com/category/artificial-intelligence/feed/",
    "https://www.theverge.com/rss/ai/index.xml",
    "https://huggingface.co/blog/feed.xml",
    "https://www.technologyreview.com/c/ai/feed/"
]

# 过滤关键词（低质量内容排除）
FILTER_KEYWORDS = ["encyclopedia", "wikipedia", "wiki", "definition", "what is", "how to", "beginners guide", "tutorial"]
TIMEZONE = pytz.timezone("Asia/Shanghai")
TIME_WINDOW = timedelta(hours=24)

def fetch_news():
    news_items = []
    now = datetime.now(TIMEZONE)
    
    for source in RSS_SOURCES:
        try:
            feed = feedparser.parse(source)
            for entry in feed.entries:
                # 解析发布时间
                if hasattr(entry, 'published_parsed'):
                    pub_date = datetime(*entry.published_parsed[:6], tzinfo=pytz.UTC)
                    pub_date_cn = pub_date.astimezone(TIMEZONE)
                    
                    # 只保留24小时内的新闻
                    if now - pub_date_cn > TIME_WINDOW:
                        continue
                        
                    # 过滤低质量内容
                    title = entry.title.lower()
                    summary = entry.summary.lower() if hasattr(entry, 'summary') else ""
                    is_low_quality = any(k in title or k in summary for k in FILTER_KEYWORDS)
                    if is_low_quality:
                        continue
                        
                    # 去重（基于标题）
                    duplicate = any(item['title'] == entry.title for item in news_items)
                    if duplicate:
                        continue
                        
                    news_items.append({
                        "title": entry.title,
                        "link": entry.link,
                        "source": feed.feed.title,
                        "pub_date": pub_date_cn.strftime("%Y-%m-%d %H:%M"),
                        "summary": entry.summary[:200] + "..." if hasattr(entry, 'summary') else "暂无摘要"
                    })
        except Exception as e:
            print(f"Error fetching {source}: {e}")
            continue
    
    # 按时间倒序排列
    news_items.sort(key=lambda x: x['pub_date'], reverse=True)
    return news_items

def update_index(news_items):
    # 读取现有index.html
    with open("index.html", "r", encoding="utf-8") as f:
        content = f.read()
    
    # 生成今日新闻HTML
    today_str = datetime.now(TIMEZONE).strftime("%Y年%m月%d日")
    news_html = f"<h2>{today_str} 最新AI新闻</h2>\n<ul class='news-list'>\n"
    for item in news_items:
        news_html += f"""<li class="news-item">
            <h3><a href="{item['link']}" target="_blank">{item['title']}</a></h3>
            <div class="meta">来源：{item['source']} | 发布时间：{item['pub_date']}</div>
            <p class="summary">{item['summary']}</p>
        </li>\n"""
    news_html += "</ul>\n"
    
    # 插入新闻到内容区域（替换旧的今日新闻）
    start_tag = "<!-- START DAILY NEWS -->"
    end_tag = "<!-- END DAILY NEWS -->"
    start_idx = content.find(start_tag) + len(start_tag)
    end_idx = content.find(end_tag)
    
    new_content = content[:start_idx] + "\n" + news_html + "\n" + content[end_idx:]
    
    # 写入更新后的index.html
    with open("index.html", "w", encoding="utf-8") as f:
        f.write(new_content)
    
    return len(news_items)

if __name__ == "__main__":
    # 安装依赖
    os.system("pip install feedparser pytz")
    
    # 获取新闻
    news = fetch_news()
    if not news:
        print("未获取到今日新的AI新闻")
        exit(0)
    
    # 更新首页
    count = update_index(news)
    print(f"成功更新{count}条今日AI新闻")
    
    # 提交并部署
    os.system("git config user.name 'OpenClaw Bot'")
    os.system("git config user.email 'bot@openclaw.dev'")
    os.system("git add index.html")
    os.system(f"git commit -m 'feat: 更新{datetime.now(TIMEZONE).strftime('%Y-%m-%d')} AI新闻'")
    os.system("git push origin main")
    print("部署完成，站点已更新：https://lovinglaura.github.io/ai-daily-news/")
