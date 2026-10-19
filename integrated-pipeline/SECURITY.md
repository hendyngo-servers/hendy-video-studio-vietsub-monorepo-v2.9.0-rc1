# Security notes

1. Không commit Telegram Bot Token, OpenAI API key, Gemini API key hoặc `EDGE_SHARED_SECRET`.
2. Source bot legacy từ bản cũ đã được tách thành `cloudflare/worker/src/legacyHendyBot.ts` và không chứa token hard-code.
3. OTP pipeline có TTL 60 giây, được xóa sau khi consume và chỉ dùng để cấp session Ktor qua HMAC giữa Worker và backend.
4. Không expose `127.0.0.1:8799` ra Internet; đây là cổng local developer sandbox.
5. Business state của legacy bot đang ở memory của Worker isolate; trước production nên chuyển users/order/account state sang KV/D1.
6. Nếu Bot Token đã từng xuất hiện trong source/repository/chat log của dự án, hãy revoke/rotate token qua BotFather trước khi deploy production.
7. `cloudflare/worker/wrangler.jsonc` intentionally contains placeholder KV IDs until provisioning. Do not deploy before replacing them with real namespace IDs using the provided provisioning script.
