"use server";

import { Defuddle } from "defuddle/node";
import { parseHTML } from "linkedom";

import type { ConversionResult } from "./types";
import { parseWebUrl } from "./web-url";

const FETCH_TIMEOUT_MS = 10_000;
const USER_AGENT =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0 Safari/537.36";

export async function convertUrl(input: string): Promise<ConversionResult> {
  const url = parseWebUrl(input);
  if (!url) return { ok: false, error: { kind: "invalid-url" } };

  const host = url.hostname;
  let response: Response;
  try {
    response = await fetch(url, {
      headers: { "user-agent": USER_AGENT, accept: "text/html,*/*;q=0.8" },
      redirect: "follow",
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    });
  } catch {
    return { ok: false, error: { kind: "fetch-failed", host } };
  }
  // 차단된 페이지도 defuddle은 "Please enable JS…" 같은 내용을 본문으로 돌려주므로
  // 응답 상태로 먼저 걸러 낸다.
  if (!response.ok) {
    return { ok: false, error: { kind: "fetch-failed", host, status: response.status } };
  }

  const html = await response.text();
  const { document } = parseHTML(html);
  const parsed = await Defuddle(document as unknown as Document, url.href, {
    markdown: true,
  });

  const markdown = parsed.content.trim();
  if (!markdown || parsed.wordCount === 0) {
    return { ok: false, error: { kind: "empty-content" } };
  }

  return {
    ok: true,
    article: {
      url: url.href,
      title: parsed.title?.trim() || host,
      author: parsed.author?.trim() ?? "",
      // defuddle의 site는 저자 이름으로 채워지기도 해서(defuddle.md → "kepano") 도메인을 쓴다.
      site: host.replace(/^www\./, ""),
      wordCount: parsed.wordCount,
      markdown,
    },
  };
}
