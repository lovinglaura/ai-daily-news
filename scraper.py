import feedparser
import requests
from datetime import datetime
import re
from bs4 import BeautifulSoup

# 高价值AI新闻源
RSS_FEEDS = [
    "https://techcrunch.com/category/artificial-intelligence/feed/",
    "https://venturebeat.com/category/ai/feed/",
    "https://www.wired.com/feed/category/ai/latest/rss",
    "https://www.technologyreview.com/topic/artificial-intelligence/feed/",
    "https://aibusiness.com/rss/news.xml",
]

# 过滤关键词（低质量内容）
FILTER_KEYWORDS = [
    "wiki", "百科", "定义", "什么是", "how to", "tutorial", "guide", "入门", "基础",
    "press release", "新闻稿", "招聘", "职位", "融资", "上市", "财报", "季度报",
    "评测", "测评", "对比", "横评", "榜单", "排名"
]

# 分类关键词
CATEGORIES = {
    "🤖 大模型": ["大模型", "llm", "gpt", "gemini", "claude", "llama", "mistral", "foundation model"],
    "💻 AI芯片": ["芯片", "gpu", "nvidia", "amd", "intel", "半导体", "ai chip", "h100", "h200"],
    "🎨 生成式AI": ["生成式ai", "文生图", "文生视频", "sora", "midjourney", "dall-e", "stable diffusion"],
    "📈 AI行业": ["ai行业", "人工智能产业", "监管", "政策", "伦理", "ai应用", "企业级ai"],
    "🦾 机器人": ["机器人", "人形机器人", "optimus", "波士顿动力", "autonomous robot"]
}

def is_high_quality(title, summary):
    content = (title + " " + summary).lower()
    # 过滤低质量内容
    for keyword in FILTER_KEYWORDS:
        if keyword.lower() in content:
            return False
    # 确保内容有实际价值
    if len(content) < 100:
        return False
    return True

def get_category(title, summary):
    content = (title + " " + summary).lower()
    for category, keywords in CATEGORIES.items():
        for keyword in keywords:
            if keyword.lower() in content:
                return category
    return "📈 AI行业"

def get_score(title, summary):
    score = 7.0
    content = (title + " " + summary).lower()
    # 加分项
    if "release" in content or "launch" in content or "发布" in content:
        score += 0.5
    if "breakthrough" in content or "突破" in content or "state-of-the-art" in content:
        score += 0.8
    if "regulation" in content or "政策" in content or "监管" in content:
        score += 0.6
    if "billion" in content or "亿" in content or "million" in content:
        score += 0.4
    # 减分项
    if len(summary) < 200:
        score -= 0.5
    return round(min(score, 10.0), 1)

def fetch_news():
    news_list = []
    seen_titles = set()
    
    for feed_url in RSS_FEEDS:
        try:
            feed = feedparser.parse(feed_url)
            for entry in feed.entries[:10]: # 每个源取前10条
                title = entry.title.strip()
                if title in seen_titles:
                    continue
                seen_titles.add(title)
                
                summary = entry.summary.strip() if hasattr(entry, 'summary') else ""
                # 清理HTML标签
                summary = BeautifulSoup(summary, "html.parser").get_text()
                link = entry.link
                pub_date = entry.published if hasattr(entry, 'published') else datetime.now().strftime("%Y-%m-%d")
                
                if not is_high_quality(title, summary):
                    continue
                
                category = get_category(title, summary)
                score = get_score(title, summary)
                
                # 生成深度解读
                if len(summary) > 200:
                    analysis = summary[:300] + "..." if len(summary) > 300 else summary
                else:
                    analysis = summary
                
                # 提取关键点
                key_points = []
                sentences = re.split(r'[。！？.!?]', summary)
                for s in sentences[:3]:
                    if len(s.strip()) > 10:
                        key_points.append(s.strip()[:30])
                
                news_list.append({
                    "title": title,
                    "analysis": analysis,
                    "key_points": key_points,
                    "category": category,
                    "score": score,
                    "date": datetime.now().strftime("%Y-%m-%d"),
                    "source": feed.feed.title if hasattr(feed, 'feed') and hasattr(feed.feed, 'title') else "行业媒体",
                    "link": link
                })
        except Exception as e:
            print(f"Error fetching {feed_url}: {e}")
    
    # 按分数排序，取前10条
    news_list.sort(key=lambda x: x['score'], reverse=True)
    return news_list[:10]

if __name__ == "__main__":
    news = fetch_news()
    # 保存为json文件
    import json
    with open('/workspace/projects/workspace/ai-daily-news/latest_news.json', 'w', encoding='utf-8') as f:
        json.dump(news, f, ensure_ascii=False, indent=2)
    print(f"Fetched {len(news)} high quality AI news items")
