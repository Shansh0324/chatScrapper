import { NextRequest, NextResponse } from "next/server";
import { scrapeConversation, detectPlatform } from "@/lib/scraper";
import { extractNotes } from "@/lib/extractNotes";
import { generatePdf } from "@/lib/generatePdf";

// ─── Rate Limiter (in-memory, per-instance) ──────────────────────────────────

const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 5; // 5 requests per minute per IP

const rateLimitMap = new Map<
  string,
  { count: number; resetAt: number }
>();

// Cleanup stale entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of rateLimitMap.entries()) {
    if (now > value.resetAt) {
      rateLimitMap.delete(key);
    }
  }
}, 60000);

function checkRateLimit(ip: string): {
  allowed: boolean;
  remaining: number;
  resetAt: number;
} {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  if (!entry || now > entry.resetAt) {
    const resetAt = now + RATE_LIMIT_WINDOW_MS;
    rateLimitMap.set(ip, { count: 1, resetAt });
    return { allowed: true, remaining: RATE_LIMIT_MAX_REQUESTS - 1, resetAt };
  }

  if (entry.count >= RATE_LIMIT_MAX_REQUESTS) {
    return { allowed: false, remaining: 0, resetAt: entry.resetAt };
  }

  entry.count++;
  return {
    allowed: true,
    remaining: RATE_LIMIT_MAX_REQUESTS - entry.count,
    resetAt: entry.resetAt,
  };
}

// ─── URL Validation ──────────────────────────────────────────────────────────

function isValidConversationUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    const hostname = parsed.hostname.toLowerCase();
    return (
      hostname.includes("claude.ai") ||
      hostname.includes("chatgpt.com") ||
      hostname.includes("chat.openai.com")
    );
  } catch {
    return false;
  }
}

// ─── Route Configuration ─────────────────────────────────────────────────────

export const maxDuration = 60; // Allow up to 60s for scraping + PDF gen
export const dynamic = "force-dynamic";

// ─── POST Handler ────────────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  // Get client IP
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    "unknown";

  // Rate limit check
  const rateLimit = checkRateLimit(ip);
  if (!rateLimit.allowed) {
    return NextResponse.json(
      {
        error:
          "Too many requests. Please wait a minute before trying again.",
      },
      {
        status: 429,
        headers: {
          "Retry-After": String(
            Math.ceil((rateLimit.resetAt - Date.now()) / 1000)
          ),
          "X-RateLimit-Remaining": "0",
        },
      }
    );
  }

  // Parse request body
  let url: string;
  let topic: string | undefined;

  try {
    const body = await request.json();
    url = body.url;
    topic = body.topic;
  } catch {
    return NextResponse.json(
      { error: "Invalid request body. Please provide a JSON body with a 'url' field." },
      { status: 400 }
    );
  }

  // Validate URL
  if (!url || typeof url !== "string") {
    return NextResponse.json(
      { error: "Please provide a conversation URL." },
      { status: 400 }
    );
  }

  if (!isValidConversationUrl(url)) {
    return NextResponse.json(
      {
        error:
          "Unsupported URL. Please provide a shared link from Claude.ai or ChatGPT.",
      },
      { status: 400 }
    );
  }

  // Detect platform early for error messages
  let platform: ReturnType<typeof detectPlatform>;
  try {
    platform = detectPlatform(url);
  } catch (err) {
    return NextResponse.json(
      {
        error:
          err instanceof Error
            ? err.message
            : "Could not detect the platform from the URL.",
      },
      { status: 400 }
    );
  }

  // ── Step 1: Scrape ──
  let turns;
  try {
    console.log(`[api] Starting scrape for ${platform}: ${url}`);
    const result = await scrapeConversation(url);
    turns = result.turns;
    console.log(
      `[api] Scrape complete: ${turns.length} turns via ${result.method}`
    );
  } catch (err) {
    console.error("[api] Scrape failed:", err);
    return NextResponse.json(
      {
        error:
          err instanceof Error
            ? err.message
            : "Failed to extract the conversation. Make sure the link is publicly shared.",
      },
      { status: 422 }
    );
  }

  if (!turns || turns.length === 0) {
    return NextResponse.json(
      {
        error:
          "No conversation content found. The link may not be publicly accessible or the conversation may be empty.",
      },
      { status: 422 }
    );
  }

  // ── Step 2: Extract notes (local AI) ──
  let markdown: string;
  try {
    console.log(`[api] Extracting notes with clean pipeline (topic: ${topic ?? "none"})…`);
    markdown = await extractNotes(turns, topic);
    console.log(`[api] Notes extracted: ${markdown.length} chars`);
  } catch (err) {
    console.error("[api] Note extraction failed:", err);
    return NextResponse.json(
      {
        error: "Failed to generate study notes. The content may be unsupported.",
      },
      { status: 500 }
    );
  }

  // Return the markdown and platform so the frontend can preview it
  return NextResponse.json({ markdown, platform });
}
