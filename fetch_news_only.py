import feedparser
from datetime import datetime, timedelta
import pytz

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

if __name__ == "__main__":
    news = fetch_news()
    if not news:
        print("📰 今日暂无新的AI行业新闻")
        exit(0)
    
    print(f"✅ 成功获取{len(news)}条2026年3月10日最新AI行业高价值新闻：\n")
    for i, item in enumerate(news, 1):
        print(f"{i}. 【{item['source']}】{item['title']}")
        print(f"   发布时间：{item['pub_date']}")
        print(f"   摘要：{item['summary']}")
        print(f"   链接：{item['link']}\n")
