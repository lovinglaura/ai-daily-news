#!/usr/bin/env python3
"""
处理Coze搜索结果，过滤低质内容，生成高质量AI新闻
"""

import json
import re
from datetime import datetime, timedelta

# 从coze_web_search获取的结果
raw_results = [
    {
        "title": "OpenAI彻底震撼数学界，80年核心猜想被破解！菲尔兹奖得主惊呼坐不稳",
        "url": "http://finance.sina.cn/stock/jdts/2026-05-21/detail-inhyrrtt8277437.d.html",
        "source": "新浪财经",
        "content": "新智元报道，OpenAI的全新推理模型破解了埃尔德什80年几何猜想，菲尔兹奖得主惊呼：数学家们，你们得坐稳了。这是人类历史上第一次，AI独立、自主地解决了一个处于数学核心领域的重大开放性难题。",
        "published": "2026-05-21T12:49:00+08:00"
    },
    {
        "title": "SpaceX官宣重大布局 xAI解散并入开启太空算力新时代",
        "url": "https://news.china.com/socialgd/10000169/20260508/49480560.html",
        "source": "中华网",
        "content": "SpaceX宣布解散xAI，将其并入SpaceX，合并后的新品牌名为SpaceXAI。与Anthropic达成合作，将孟菲斯Colossus 1数据中心的全部算力提供给Anthropic，开启太空算力时代。",
        "published": "2026-05-08T13:34:00+08:00"
    },
    {
        "title": "OpenAI承诺投资超 3 亿新元，在新加坡打造海外首个应用型AI实验室",
        "url": "https://www.52ai.com/33504.html",
        "source": "中国AI网",
        "content": "OpenAI将在新加坡设立其在海外的首个应用型AI实验室，计划投资超过 3 亿新加坡元，团队规模扩大到约200个岗位，推动人工智能在多领域的实际应用。",
        "published": "2026-05-20T00:00:00+08:00"
    },
    {
        "title": "Anthropic B2B 市场份额首超 OpenAI，硅谷权力版图重构",
        "url": "https://www.52ai.com/33241.html",
        "source": "中国AI网",
        "content": "Anthropic在企业级应用市场的份额首次超越OpenAI，达到34.4%，OpenAI下滑至32.3%。Anthropic的市场占有率在过去一年实现了惊人的四倍增长。",
        "published": "2026-05-14T00:00:00+08:00"
    },
    {
        "title": "OpenAI将提交IPO文件，最早本周五秘密申请上市",
        "url": "https://finance.sina.com.cn/zmt/2026-05-21/doc-inhyshrf6319644.shtml",
        "source": "新浪财经",
        "content": "OpenAI正与包括高盛和摩根士丹利在内的投行合作，准备在未来几天或几周内秘密提交IPO申请文件，最早可能于本周五递交，计划今年9月完成上市。",
        "published": "2026-05-21T19:45:00+08:00"
    },
    {
        "title": "OpenAI 发布三款实时语音模型，GPT-5 级推理能力落地",
        "url": "https://www.52ai.com/32954.html",
        "source": "中国AI网",
        "content": "OpenAI推出三款全新实时语音模型：GPT-Realtime-2、GPT-Realtime-Translate和GPT-Realtime-Whisper。GPT-Realtime-2是首个具备GPT-5级推理能力的语音工具，能进行复杂逻辑推理。",
        "published": "2026-05-08T00:00:00+08:00"
    },
    {
        "title": "Google发布用于Android系统的Gemini intelligence，比苹果先一步推出移动端AI操作系统",
        "url": "https://finance.sina.com.cn/wm/2026-05-17/doc-inhyfhfm8724870.shtml",
        "source": "新浪财经",
        "content": "Google发布用于Android系统的Gemini intelligence，用户可以通过语音助手下达指令让AI帮自己叫车或填写复杂表单，识别照片或邮件中的商品并打开购物App。",
        "published": "2026-05-17T20:54:00+08:00"
    },
    {
        "title": "字节跳动AI基建投入上调25%至2000亿元，日均投入超5.5亿元",
        "url": "https://finance.sina.com.cn/wm/2026-05-17/doc-inhyfhfm8724870.shtml",
        "source": "新浪财经",
        "content": "字节跳动上调了2026年AI基础设施资本支出预算，从此前规划的1600亿元提升25%至2000亿元，日均投入超5.5亿元。2000亿元预算中，850亿元专项用于AI芯片采购。",
        "published": "2026-05-17T20:54:00+08:00"
    },
    {
        "title": "阿里首次披露AI模型和应用服务收入，ARR突破80亿元",
        "url": "https://finance.sina.com.cn/wm/2026-05-17/doc-inhyfhfm8724870.shtml",
        "source": "新浪财经",
        "content": "阿里公布2026财年第四季度业绩，AI相关产品收入为89.71亿元，实现连续第11个季度的三位数同比增长。管理层预计下季度将突破100亿元，年末有望达到300亿元。",
        "published": "2026-05-17T20:54:00+08:00"
    },
    {
        "title": "Figure机器人连续工作91小时，刷新机器人连续工作纪录",
        "url": "https://finance.sina.com.cn/wm/2026-05-17/doc-inhyfhfm8724870.shtml",
        "source": "新浪财经",
        "content": "美国机器人公司Figure开直播，派3台Figure 03人形机器人在工厂产线上分拣快递包裹。截至发稿，3名机器人已在直播中轮班工作超过91个小时，刷新了机器人连续工作纪录。",
        "published": "2026-05-17T20:54:00+08:00"
    }
]

# 低质内容过滤关键词
LOW_QUALITY_KEYWORDS = [
    "wiki", "wikipedia", "百科", "定义", "什么是", "how to", "how do",
    "tutorial", "guide", "入门", "基础", "beginners", "getting started",
    "course", "lesson", "learn", "study", "教学", "教程", "课程",
    "简介", "概述", "概览", "introduction", "overview"
]

def is_low_quality(text):
    """检查内容是否为低质内容"""
    text_lower = text.lower()
    for keyword in LOW_QUALITY_KEYWORDS:
        if keyword.lower() in text_lower:
            return True
    return False

def calculate_value_score(title, content):
    """计算新闻价值评分 (1-10)"""
    score = 7.0  # 基础分
    text = (title + " " + content).lower()

    # 加分项
    if any(keyword in text for keyword in ["breakthrough", "突破", "破解", "历史性"]):
        score += 1.5
    if any(keyword in text for keyword in ["ipo", "ipo文件", "上市", "融资"]):
        score += 1.0
    if any(keyword in text for keyword in ["billion", "亿", "亿新元"]):
        score += 0.8
    if any(keyword in text for keyword in ["模型", "model", "gpt", "gemini"]):
        score += 0.5
    if any(keyword in text for keyword in ["首次", "首超", "first"]):
        score += 0.7
    if any(keyword in text for keyword in ["超越", "超过", "超过", "超越"]):
        score += 0.6

    # 减分项
    if len(content) < 50:
        score -= 1.0
    if is_low_quality(title):
        score -= 3.0

    return round(min(score, 10.0), 1)

def categorize_news(title, content):
    """分类新闻"""
    text = (title + " " + content).lower()
    if any(keyword in text for keyword in ["数学", "证明", "猜想", "conjecture", "proof"]):
        return "技术突破"
    elif any(keyword in text for keyword in ["ipo", "上市", "融资", "funding", "investment"]):
        return "投融资"
    elif any(keyword in text for keyword in ["模型", "model", "gpt", "gemini", "语音", "voice"]):
        return "技术突破"
    elif any(keyword in text for keyword in ["市场份额", "份额", "超越"]):
        return "行业动态"
    elif any(keyword in text for keyword in ["机器人", "robot", "figure"]):
        return "技术趋势"
    else:
        return "行业动态"

def main():
    today = datetime.now().strftime("%Y-%m-%d")

    # 过滤和评分
    processed_news = []
    seen_titles = set()

    for item in raw_results:
        title = item["title"]
        # 去重
        if title in seen_titles:
            continue
        seen_titles.add(title)

        # 过滤低质内容
        if is_low_quality(title):
            continue

        # 计算评分
        score = calculate_value_score(title, item["content"])

        # 分类
        category = categorize_news(title, item["content"])

        # 生成摘要
        summary = item["content"]
        if len(summary) > 300:
            summary = summary[:300] + "..."

        processed_news.append({
            "title": title,
            "summary": summary,
            "source": item["source"],
            "url": item["url"],
            "valueScore": score,
            "category": category
        })

    # 按分数排序，取前10条
    processed_news.sort(key=lambda x: x['valueScore'], reverse=True)
    final_news = processed_news[:10]

    # 生成JSON
    output = {
        "date": today,
        "updateTime": datetime.now().strftime("%Y-%m-%dT%H:%M:%S+08:00"),
        "news": final_news
    }

    # 保存到文件
    output_path = "/workspace/projects/workspace/ai-daily-news/latest_ai_news.json"
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(output, f, ensure_ascii=False, indent=2)

    print(f"✅ 成功生成 {len(final_news)} 条高价值AI新闻")
    print(f"📅 日期: {today}")
    print(f"⭐ 平均评分: {sum(item['valueScore'] for item in final_news) / len(final_news):.2f}")
    print(f"💾 保存到: {output_path}")

    # 打印新闻摘要
    print("\n" + "="*60)
    print("📰 新闻摘要")
    print("="*60)
    for i, news in enumerate(final_news, 1):
        print(f"\n{i}. {news['title']}")
        print(f"   评分: {news['valueScore']}/10 | 分类: {news['category']}")
        print(f"   来源: {news['source']}")
        print(f"   摘要: {news['summary'][:100]}...")

if __name__ == "__main__":
    main()