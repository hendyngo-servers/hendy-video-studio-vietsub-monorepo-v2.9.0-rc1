import { createLegacyHendyBot } from "./legacyHendyBot";

export interface TelegramEnv {
  BOT_TOKEN: string;
  ADMIN_ID?: string;
  MINI_APP_URL?: string;
  WEB_APP_URL?: string;
  BOT_STATE?: KVNamespace;
}

type TelegramUpdate = { message?: { chat: { id: number }; text?: string; from?: { first_name?: string; username?: string } } }

let legacy: ((update: unknown, botToken: string) => Promise<void>) | null = null;
let legacyKey = "";

function getLegacy(env: TelegramEnv) {
  const key = `${env.ADMIN_ID || ""}|${env.MINI_APP_URL || ""}|${env.WEB_APP_URL || ""}`;
  if (!legacy || key !== legacyKey) {
    legacy = createLegacyHendyBot(env);
    legacyKey = key;
  }
  return legacy;
}

async function telegram(env: TelegramEnv, method: string, payload: unknown) {
  if (!env.BOT_TOKEN) throw new Error("BOT_TOKEN_NOT_CONFIGURED");
  return fetch(`https://api.telegram.org/bot${env.BOT_TOKEN}/${method}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(payload),
  });
}

function randomToken(length = 6) {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const bytes = crypto.getRandomValues(new Uint8Array(length));
  return Array.from(bytes, (v) => alphabet[v % alphabet.length]).join("");
}

async function sha256(value: string) {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, "0")).join("");
}

export async function handleTelegramUpdate(update: TelegramUpdate, env: TelegramEnv) {
  const text = update.message?.text?.trim() || "";
  const chatId = update.message?.chat.id;
  if (!chatId) return;

  if (text === "/token") {
    const token = randomToken();
    if (env.BOT_STATE) {
      await env.BOT_STATE.put(`otp:${token}`, JSON.stringify({ chatId: String(chatId), hash: await sha256(token), expiresAt: Date.now() + 60_000 }), { expirationTtl: 60 });
    }
    await telegram(env, "sendMessage", { chat_id: chatId, text: `🔐 OTP Pipeline: \`${token}\`\nHiệu lực 60 giây.`, parse_mode: "Markdown" });
    return;
  }

  await getLegacy(env)(update, env.BOT_TOKEN);
}
