#!/usr/bin/env python3
import json, sys

try:
    import scrapy
    from scrapy.crawler import CrawlerProcess
    from scrapy.http import TextResponse
except ImportError:
    print(json.dumps({"text": "", "error": "Scrapy chưa được cài. pip install -r pipeline-agent/requirements.txt"}))
    raise SystemExit(2)

url = sys.argv[1]
result = {"text": ""}

class SinglePageSpider(scrapy.Spider):
    name = "single_page"
    start_urls = [url]
    custom_settings = {
        "LOG_ENABLED": False,
        "ROBOTSTXT_OBEY": True,
        "DOWNLOAD_TIMEOUT": 20,
    }

    def parse(self, response: TextResponse):
        text = " ".join(t.strip() for t in response.css("body *::text").getall() if t.strip())
        result["text"] = text[:100_000]

process = CrawlerProcess()
process.crawl(SinglePageSpider)
process.start()
print(json.dumps(result, ensure_ascii=False))
