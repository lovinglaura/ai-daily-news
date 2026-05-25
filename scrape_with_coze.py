#!/usr/bin/env python3
"""
AI新闻抓取脚本 - 使用Coze Web Search API
过滤低质内容，生成高价值新闻
"""

import json
import re
from datetime import datetime
from pathlib import Path

# 低质内容过滤关键词（百科、定义、教程类）
LOW_QUALITY_KEYWORDS = [
    "wiki", "wikipedia", "百科", "定义", "什么是", "how to", "how do",
    "tutorial", "guide", "入门", "基础", "beginners", "getting started",
    "course", "lesson", "learn", "study", "教学", "教程", "课程",
    "简介", "概述", "概览", "introduction", "overview", "what is",
    "primer", "crash course", "101", "for dummies"
]

# 高质量AI新闻关键词（用于筛选和分类）
HIGH_VALUE_KEYWORDS = {
    "技术突破": ["breakthrough", "突破", "launch", "发布", "release", "model", "模型",
                 "performance", "性能", "benchmark", "基准", "state-of-the-art", "SOTA"],
    "投融资": ["funding", "融资", "investment", "投资", "round", "轮次", "raise", "募资",
              "valuation", "估值", "IPO", "上市", "acquisition", "收购"],
    "行业动态": ["policy", "政策", "regulation", "监管", "law", "法律", "government", "政府",
                "collaboration", "合作", "partnership", "伙伴关系", "agreement", "协议"],
    "产品发布": ["product", "产品", "feature", "功能", "update", "更新", "version", "版本",
                "app", "应用", "platform", "平台", "service", "服务"],
    "学术研究": ["research", "研究", "paper", "论文", "study", "学术", "university", "大学",
                "journal", "期刊", "conference", "会议", "arxiv", "arXiv"],
    "行业应用": ["application", "应用", "deployment", "部署", "implementation", "实施",
                "enterprise", "企业", "industry", "行业", "business", "商业"]
}

def is_low_quality(text):
    """检查内容是否为低质内容"""
    text_lower = text.lower()
    for keyword in LOW_QUALITY_KEYWORDS:
        if keyword.lower() in text_lower:
            return True
    return False

def calculate_value_score(title, summary):
    """计算新闻价值评分 (1-10)"""
    score = 7.0  # 基础分
    content = (title + " " + summary).lower()

    # 加分项
    if any(keyword in content for keyword in ["breakthrough", "突破", "state-of-the-art"]):
        score += 1.0
    if any(keyword in content for keyword in ["billion", "十亿", "billion dollars", "$", "美元"]):
        score += 0.5
    if any(keyword in content for keyword in ["release", "发布", "launch", "launch"]):
        score += 0.5
    if any(keyword in content for keyword in ["regulation", "监管", "policy", "政策"]):
        score += 0.6
    if any(keyword in content for keyword in ["google", "openai", "anthropic", "microsoft", "meta"]):
        score += 0.3

    # 减分项
    if len(summary) < 100:
        score -= 0.5
    if is_low_quality(title):
        score -= 3.0
    if is_low_quality(summary):
        score -= 2.0

    return round(min(score, 10.0), 1)

def categorize_news(title, summary):
    """分类新闻"""
    content = (title + " " + summary).lower()
    for category, keywords in HIGH_VALUE_KEYWORDS.items():
        for keyword in keywords:
            if keyword.lower() in content:
                return category
    return "行业动态"

def extract_key_points(summary):
    """提取关键点"""
    # 按句子分割
    sentences = re.split(r'[。！？.!?]', summary)
    key_points = []
    for sentence in sentences:
        sentence = sentence.strip()
        if len(sentence) > 15 and len(sentence) < 100:
            key_points.append(sentence[:50] + "..." if len(sentence) > 50 else sentence)
            if len(key_points) >= 3:
                break
    return key_points

def scrape_ai_news():
    """抓取AI新闻 - 返回需要外部API调用的数据"""
    # 这里返回查询参数，由外部Coze API调用
    return {
        "query": "AI artificial intelligence news 2026 latest breakthrough funding regulation",
        "count": 15,
        "time_range": "1d",  # 最近1天
        "sites": "techcrunch.com,venturebeat.com,theverge.com,wired.com,technologyreview.com"
    }

if __name__ == "__main__":
    print("AI新闻抓取脚本")
    print("使用coze_web_search API抓取最新的AI行业新闻")
    print("过滤低质内容，生成高价值新闻数据")