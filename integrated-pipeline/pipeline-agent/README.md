# Local Pipeline Agent :8799

Development-only WebSocket bridge. It runs strict dry-run commands and invokes the Scrapy extractor. Do not expose port 8799 to the Internet.

```powershell
python -m venv .venv
.\.venv\Scripts\pip install -r requirements.txt
npm install
npm run dev
```

Supported messages:

```json
{"action":"dry-run"}
{"action":"extract","url":"https://example.com"}
```
