import { NextResponse } from "next/server";
import { parseHTML } from "linkedom";
import { Defuddle } from "defuddle/node";

import { markdownToSafeHtml } from "@/lib/markdown";

export const runtime = "nodejs";

type ConvertError =
  | "invalid_url"
  | "blocked_host"
  | "fetch_failed"
  | "timeout"
  | "not_html"
  | "extract_failed";

const FETCH_TIMEOUT_MS = 15_000;
const USER_AGENT =
  "Mozilla/5.0 (compatible; URLtoMarkdownBot/1.0; +https://example.com/bot)";

function errorResponse(error: ConvertError, status: number) {
  return NextResponse.json({ error }, { status });
}

/** Rejects localhost and private-network hosts; the server can't reach them anyway. */
function isBlockedHost(hostname: string): boolean {
  const host = hostname.toLowerCase();
  if (host === "localhost" || host === "0.0.0.0" || host === "::1") return true;
  if (/^127\./.test(host)) return true;
  if (/^10\./.test(host)) return true;
  if (/^192\.168\./.test(host)) return true;
  if (/^172\.(1[6-9]|2\d|3[0-1])\./.test(host)) return true;
  if (/^169\.254\./.test(host)) return true;
  return false;
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const rawUrl = typeof body?.url === "string" ? body.url.trim() : "";

  let url: URL;
  try {
    url = new URL(rawUrl);
  } catch {
    return errorResponse("invalid_url", 400);
  }
  if (url.protocol !== "http:" && url.protocol !== "https:") {
    return errorResponse("invalid_url", 400);
  }
  if (isBlockedHost(url.hostname)) {
    return errorResponse("blocked_host", 400);
  }

  let html: string;
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
    try {
      const response = await fetch(url.toString(), {
        signal: controller.signal,
        redirect: "follow",
        headers: {
          "User-Agent": USER_AGENT,
          Accept: "text/html,application/xhtml+xml",
        },
      });

      if (!response.ok) {
        return errorResponse("fetch_failed", 502);
      }
      const contentType = response.headers.get("content-type") ?? "";
      if (!contentType.includes("text/html") && !contentType.includes("application/xhtml+xml")) {
        return errorResponse("not_html", 415);
      }
      // Keep the abort timer armed through the body read too — a page that
      // sends headers quickly but drips its body slowly must still time out.
      html = await response.text();
    } finally {
      clearTimeout(timeoutId);
    }
  } catch (error) {
    const timedOut = error instanceof Error && error.name === "AbortError";
    return errorResponse(timedOut ? "timeout" : "fetch_failed", 502);
  }

  try {
    const { document } = parseHTML(html);
    const result = await Defuddle(document, url.toString(), { markdown: true });

    if (!result?.content || !result.content.trim()) {
      return errorResponse("extract_failed", 422);
    }

    const contentHtml = await markdownToSafeHtml(result.content);

    return NextResponse.json({
      title: result.title?.trim() || url.hostname,
      author: result.author?.trim() || null,
      markdown: result.content,
      html: contentHtml,
    });
  } catch {
    return errorResponse("extract_failed", 422);
  }
}
