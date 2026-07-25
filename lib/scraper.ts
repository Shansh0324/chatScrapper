import * as cheerio from "cheerio";
import puppeteer, { type Browser, type Page } from "puppeteer-core";
import TurndownService from "turndown";

// ─── Types ───────────────────────────────────────────────────────────────────

export interface ConversationTurn {
  role: "user" | "assistant";
  content: string;
}

export type Platform = "claude" | "chatgpt";

// ─── Platform Detection ─────────────────────────────────────────────────────

export function detectPlatform(url: string): Platform {
  const hostname = new URL(url).hostname.toLowerCase();
  if (hostname.includes("claude.ai")) return "claude";
  if (hostname.includes("chatgpt.com") || hostname.includes("chat.openai.com"))
    return "chatgpt";
  throw new Error(
    "Unsupported platform. Please provide a shared link from Claude.ai or ChatGPT."
  );
}

// ─── Constants ───────────────────────────────────────────────────────────────

const USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36";

import { launchBrowser } from "./browser";

// ─── Utility: clean text ─────────────────────────────────────────────────────

function cleanText(raw: string): string {
  let text = raw
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/?(p|div|li|ul|ol|h[1-6])[^>]*>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  return text;
}

// ─── ChatGPT: Backend API approach (fast path) ──────────────────────────────

function extractShareId(url: string): string | null {
  // URLs like https://chatgpt.com/share/6a65063f-0e60-83ee-97fa-5ee27b01218c
  const match = url.match(/\/share\/([a-f0-9-]+)/i);
  return match ? match[1] : null;
}

async function extractChatGPTViaApi(url: string): Promise<ConversationTurn[] | null> {
  const shareId = extractShareId(url);
  if (!shareId) return null;

  // ChatGPT has a backend API for shared conversations
  const apiUrl = `https://chatgpt.com/backend-api/share/conversation/${shareId}`;

  try {
    const res = await fetch(apiUrl, {
      headers: {
        "User-Agent": USER_AGENT,
        Accept: "application/json",
        "Accept-Language": "en-US,en;q=0.9",
        Referer: url,
      },
    });

    if (!res.ok) {
      console.log(`[scraper] ChatGPT API returned ${res.status}`);
      return null;
    }

    const data = await res.json();
    const turns: ConversationTurn[] = [];

    // The API returns conversation data with a mapping of messages
    const mapping = data?.mapping || data?.conversation_data?.mapping;
    if (mapping && typeof mapping === "object") {
      // Build ordered list from the tree structure
      const messages: Array<{ role: string; content: string; createTime: number }> = [];

      for (const node of Object.values(mapping)) {
        const n = node as Record<string, unknown>;
        const msg = n?.message as Record<string, unknown> | undefined;
        if (!msg) continue;

        const author = msg?.author as Record<string, unknown> | undefined;
        const role = author?.role as string | undefined;
        if (role !== "user" && role !== "assistant") continue;

        const content = msg?.content as Record<string, unknown> | undefined;
        if (!content) continue;

        let text = "";
        const parts = content?.parts as unknown[];
        if (Array.isArray(parts)) {
          text = parts
            .filter((p): p is string => typeof p === "string")
            .join("\n");
        } else if (typeof content?.text === "string") {
          text = content.text;
        }

        if (text.trim()) {
          messages.push({
            role,
            content: cleanText(text),
            createTime: (msg?.create_time as number) ?? 0,
          });
        }
      }

      // Sort by creation time
      messages.sort((a, b) => a.createTime - b.createTime);

      for (const m of messages) {
        turns.push({ role: m.role as "user" | "assistant", content: m.content });
      }
    }

    // Also try linear_conversation format
    if (turns.length === 0) {
      const linear = data?.linear_conversation;
      if (Array.isArray(linear)) {
        for (const item of linear) {
          const msg = item?.message;
          if (!msg) continue;
          const role = msg?.author?.role;
          if (role !== "user" && role !== "assistant") continue;

          let text = "";
          const parts = msg?.content?.parts;
          if (Array.isArray(parts)) {
            text = parts.filter((p: unknown) => typeof p === "string").join("\n");
          }

          if (text.trim()) {
            turns.push({ role, content: cleanText(text) });
          }
        }
      }
    }

    return turns.length > 0 ? turns : null;
  } catch (err) {
    console.log(`[scraper] ChatGPT API fetch failed: ${err instanceof Error ? err.message : err}`);
    return null;
  }
}

// ─── Cheerio-based extraction ────────────────────────────────────────────────

async function fetchHTML(url: string): Promise<string> {
  const res = await fetch(url, {
    headers: {
      "User-Agent": USER_AGENT,
      Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      "Accept-Language": "en-US,en;q=0.9",
    },
    redirect: "follow",
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch page: ${res.status} ${res.statusText}`);
  }

  return res.text();
}

function extractChatGPTCheerio(html: string): ConversationTurn[] | null {
  const $ = cheerio.load(html);
  const turns: ConversationTurn[] = [];

  // Try __NEXT_DATA__ (older ChatGPT versions)
  const nextDataScript = $('script#__NEXT_DATA__[type="application/json"]');
  if (nextDataScript.length > 0) {
    try {
      const json = JSON.parse(nextDataScript.text());
      const serverResponse = json?.props?.pageProps?.serverResponse ?? json?.props?.pageProps?.data;
      if (serverResponse) {
        const mapping = serverResponse?.mapping ?? serverResponse?.linear_conversation;
        if (mapping && typeof mapping === "object") {
          const messages = Object.values(mapping)
            .map((node: unknown) => {
              const n = node as Record<string, unknown>;
              return (n?.message ?? n) as Record<string, unknown>;
            })
            .filter(
              (msg) =>
                msg &&
                typeof msg === "object" &&
                (msg.role === "user" || msg.role === "assistant") &&
                msg.content
            );

          for (const msg of messages) {
            const content = msg.content as Record<string, unknown>;
            let text = "";
            if (typeof content === "string") {
              text = content;
            } else if (content?.parts && Array.isArray(content.parts)) {
              text = content.parts.filter((p: unknown) => typeof p === "string").join("\n");
            } else if (content?.text && typeof content.text === "string") {
              text = content.text;
            }
            if (text.trim()) {
              turns.push({ role: msg.role as "user" | "assistant", content: cleanText(text) });
            }
          }
        }
      }
    } catch {
      // parse failed
    }
  }

  if (turns.length > 0) return turns;

  // Try to find embedded JSON in script tags
  $("script").each((_, el) => {
    if (turns.length > 0) return;
    const scriptText = $(el).text();
    const patterns = [/"role"\s*:\s*"(user|assistant)"/, /linear_conversation/, /mapping.*message/];
    if (!patterns.some((p) => p.test(scriptText))) return;

    try {
      const jsonMatches = scriptText.match(/\{[\s\S]*?"role"\s*:\s*"(?:user|assistant)"[\s\S]*?\}/g);
      if (jsonMatches) {
        for (const match of jsonMatches) {
          try {
            const obj = JSON.parse(match);
            if ((obj.role === "user" || obj.role === "assistant") && (obj.content || obj.text)) {
              const text =
                typeof obj.content === "string"
                  ? obj.content
                  : obj.content?.parts?.join("\n") ?? obj.text ?? "";
              if (text.trim()) {
                turns.push({ role: obj.role, content: cleanText(text) });
              }
            }
          } catch {
            // skip
          }
        }
      }
    } catch {
      // skip
    }
  });

  return turns.length > 0 ? turns : null;
}

function extractClaudeCheerio(html: string): ConversationTurn[] | null {
  const $ = cheerio.load(html);
  const turns: ConversationTurn[] = [];

  $("script").each((_, el) => {
    if (turns.length > 0) return;
    const scriptText = $(el).text();

    if (
      !scriptText.includes('"role"') ||
      !(scriptText.includes('"human"') || scriptText.includes('"assistant"') || scriptText.includes('"user"'))
    ) {
      return;
    }

    try {
      const data = JSON.parse(scriptText);
      const extractFromData = (obj: unknown): void => {
        if (Array.isArray(obj)) {
          for (const item of obj) extractFromData(item);
        } else if (obj && typeof obj === "object") {
          const record = obj as Record<string, unknown>;
          if (
            (record.role === "human" || record.role === "user" || record.role === "assistant") &&
            (record.content || record.text)
          ) {
            const rawContent = record.content ?? record.text;
            let text = "";
            if (typeof rawContent === "string") {
              text = rawContent;
            } else if (Array.isArray(rawContent)) {
              text = rawContent
                .map((part: unknown) => {
                  if (typeof part === "string") return part;
                  if (part && typeof part === "object" && "text" in (part as Record<string, unknown>)) {
                    return (part as Record<string, unknown>).text;
                  }
                  return "";
                })
                .filter(Boolean)
                .join("\n");
            }
            if (text.trim()) {
              turns.push({
                role: record.role === "human" || record.role === "user" ? "user" : "assistant",
                content: cleanText(text),
              });
            }
          }
          for (const val of Object.values(record)) {
            extractFromData(val);
          }
        }
      };
      extractFromData(data);
    } catch {
      const jsonRegex = /\[[\s\S]*?\]/g;
      let match;
      while ((match = jsonRegex.exec(scriptText)) !== null) {
        try {
          const arr = JSON.parse(match[0]);
          if (Array.isArray(arr)) {
            for (const item of arr) {
              if (
                item &&
                typeof item === "object" &&
                (item.role === "human" || item.role === "user" || item.role === "assistant") &&
                (item.content || item.text)
              ) {
                const rawContent = item.content ?? item.text;
                const text =
                  typeof rawContent === "string"
                    ? rawContent
                    : Array.isArray(rawContent)
                      ? rawContent
                          .map((p: unknown) =>
                            typeof p === "string" ? p : (p as Record<string, unknown>)?.text ?? ""
                          )
                          .join("\n")
                      : "";
                if (text.trim()) {
                  turns.push({
                    role: item.role === "human" || item.role === "user" ? "user" : "assistant",
                    content: cleanText(text),
                  });
                }
              }
            }
          }
        } catch {
          // skip
        }
      }
    }
  });

  return turns.length > 0 ? turns : null;
}

// ─── Puppeteer-based extraction (fallback) ───────────────────────────────────

async function autoScroll(page: Page): Promise<void> {
  await page.evaluate(async () => {
    await new Promise<void>((resolve) => {
      let totalHeight = 0;
      const distance = 500;
      const timer = setInterval(() => {
        const scrollHeight = Math.max(
          document.body.scrollHeight,
          document.documentElement.scrollHeight,
          document.body.offsetHeight,
          document.documentElement.offsetHeight,
          document.body.clientHeight,
          document.documentElement.clientHeight
        );
        window.scrollBy(0, distance);
        totalHeight += distance;

        if (totalHeight >= scrollHeight) {
          // Wait a bit to see if more content loads
          setTimeout(() => {
            const newScrollHeight = document.body.scrollHeight;
            if (newScrollHeight > scrollHeight) {
              // more content loaded, keep going
              totalHeight = scrollHeight; // reset to allow more scrolling
            } else {
              clearInterval(timer);
              resolve();
            }
          }, 1000);
        }
      }, 100);
    });
  });
}

async function extractChatGPTPuppeteer(url: string): Promise<ConversationTurn[]> {
  const browser = await launchBrowser();
  const turndownService = new TurndownService({ codeBlockStyle: 'fenced' });

  try {
    const page = await browser.newPage();
    await page.setUserAgent(USER_AGENT);
    await page.goto(url, { waitUntil: "networkidle2", timeout: 30000 });

    // Wait for conversation messages to appear
    await page
      .waitForSelector('[data-message-author-role], [data-role], .text-base', { timeout: 15000 })
      .catch(() => null);

    // Scroll to the bottom to trigger lazy loading
    await autoScroll(page);

    const turnsHtml = await page.evaluate(() => {
      const results: Array<{ role: string; html: string }> = [];

      // Method 1: data-message-author-role attribute
      const messageEls = document.querySelectorAll('[data-message-author-role]');
      if (messageEls.length > 0) {
        messageEls.forEach((el) => {
          const role = el.getAttribute("data-message-author-role");
          if (role === "user" || role === "assistant") {
            const textEl = el.querySelector(".markdown, .whitespace-pre-wrap, [class*='markdown']");
            const html = textEl?.innerHTML ?? el.innerHTML ?? "";
            if (html) {
              results.push({ role, html });
            }
          }
        });
        return results;
      }

      // Method 2: Look for message containers by article/div structure
      const articles = document.querySelectorAll('article, [data-testid*="conversation-turn"]');
      if (articles.length > 0) {
        articles.forEach((article) => {
          const html = article.innerHTML ?? "";
          if (!html) return;
          const hasUserIcon = article.querySelector('[data-testid*="user"], img[alt*="User"]');
          const role = hasUserIcon ? "user" : "assistant";
          results.push({ role, html });
        });
        return results;
      }

      return results;
    });

    const turns: ConversationTurn[] = [];
    for (const item of turnsHtml) {
      if (item.html.trim()) {
        try {
          const content = turndownService.turndown(item.html);
          turns.push({ role: item.role as "user" | "assistant", content });
        } catch {
          // Fallback if turndown fails
          turns.push({ role: item.role as "user" | "assistant", content: cleanText(item.html) });
        }
      }
    }

    return turns;
  } finally {
    await browser.close();
  }
}


async function extractClaudePuppeteer(url: string): Promise<ConversationTurn[]> {
  const browser = await launchBrowser();
  const turndownService = new TurndownService({ codeBlockStyle: 'fenced' });

  try {
    const page = await browser.newPage();
    await page.setUserAgent(USER_AGENT);
    await page.goto(url, { waitUntil: "networkidle2", timeout: 30000 });

    await page
      .waitForSelector('[class*="message"], [class*="Message"], [data-role]', { timeout: 15000 })
      .catch(() => null);

    // Scroll to the bottom to trigger lazy loading
    await autoScroll(page);

    const turnsHtml = await page.evaluate(() => {
      const results: Array<{ role: string; html: string }> = [];

      // Try data-role attributes first
      const byDataRole = document.querySelectorAll("[data-role]");
      if (byDataRole.length > 0) {
        byDataRole.forEach((el) => {
          const role = el.getAttribute("data-role");
          if (role === "human" || role === "user" || role === "assistant") {
            const html = el.innerHTML ?? "";
            if (html) {
              results.push({ role: role === "human" ? "user" : role, html });
            }
          }
        });
        return results;
      }

      // Fallback: class-based detection
      const containers = document.querySelectorAll(
        '[class*="human"], [class*="Human"], [class*="assistant"], [class*="Assistant"], [class*="user"], [class*="User"]'
      );
      containers.forEach((el) => {
        const classes = el.className.toLowerCase();
        let role: string | null = null;
        if (classes.includes("human") || classes.includes("user")) {
          role = "user";
        } else if (classes.includes("assistant")) {
          role = "assistant";
        }
        if (role) {
          const html = el.innerHTML ?? "";
          if (html) results.push({ role, html });
        }
      });

      return results;
    });

    const turns: ConversationTurn[] = [];
    for (const item of turnsHtml) {
      if (item.html.trim()) {
        try {
          const content = turndownService.turndown(item.html);
          turns.push({ role: item.role as "user" | "assistant", content });
        } catch {
          turns.push({ role: item.role as "user" | "assistant", content: cleanText(item.html) });
        }
      }
    }

    return turns;
  } finally {
    await browser.close();
  }
}

// ─── Main scraper entry point ────────────────────────────────────────────────

export async function scrapeConversation(
  url: string
): Promise<{ turns: ConversationTurn[]; platform: Platform; method: string }> {
  const platform = detectPlatform(url);

  // ── Fast path 1: ChatGPT Backend API (most reliable for ChatGPT) ──
  if (platform === "chatgpt") {
    try {
      console.log("[scraper] Attempting ChatGPT backend API extraction…");
      const turns = await extractChatGPTViaApi(url);
      if (turns && turns.length > 0) {
        console.log(`[scraper] ✓ Backend API succeeded: ${turns.length} turns extracted`);
        return { turns, platform, method: "api" };
      }
      console.log("[scraper] Backend API returned no turns");
    } catch (err) {
      console.log(`[scraper] Backend API failed: ${err instanceof Error ? err.message : err}`);
    }
  }

  // ── Fast path 2: Cheerio HTML parsing ──
  try {
    console.log(`[scraper] Attempting Cheerio extraction for ${platform}…`);
    const html = await fetchHTML(url);
    const turns = platform === "chatgpt" ? extractChatGPTCheerio(html) : extractClaudeCheerio(html);

    if (turns && turns.length > 0) {
      console.log(`[scraper] ✓ Cheerio succeeded: ${turns.length} turns extracted`);
      return { turns, platform, method: "cheerio" };
    }
    console.log("[scraper] Cheerio returned no turns, falling back to Puppeteer…");
  } catch (err) {
    console.log(`[scraper] Cheerio failed: ${err instanceof Error ? err.message : err}`);
  }

  // ── Fallback: Puppeteer ──
  try {
    console.log(`[scraper] Attempting Puppeteer extraction for ${platform}…`);
    const turns =
      platform === "chatgpt" ? await extractChatGPTPuppeteer(url) : await extractClaudePuppeteer(url);

    if (turns.length > 0) {
      console.log(`[scraper] ✓ Puppeteer succeeded: ${turns.length} turns extracted`);
      return { turns, platform, method: "puppeteer" };
    }
    throw new Error("Puppeteer extracted 0 turns");
  } catch (err) {
    console.log(`[scraper] Puppeteer failed: ${err instanceof Error ? err.message : err}`);
  }

  throw new Error(
    `Could not extract conversation from the provided ${platform === "chatgpt" ? "ChatGPT" : "Claude"} link. ` +
      "Please make sure the conversation is shared and the link is publicly accessible."
  );
}
