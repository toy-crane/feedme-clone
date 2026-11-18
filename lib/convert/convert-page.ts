import { Defuddle } from "defuddle/node";
import { parseHTML } from "linkedom";

export type ConvertError = "unreachable" | "http-status" | "not-html" | "empty";

export type ConvertPageResult =
  | { ok: true; title: string; author: string; markdown: string }
  | { ok: false; error: "http-status"; status: number }
  | { ok: false; error: Exclude<ConvertError, "http-status"> };

type Fetcher = (url: string, init: RequestInit) => Promise<Response>;

const FETCH_TIMEOUT_MS = 15_000;

/**
 * 페이지를 가져와 본문을 Markdown으로 바꾼다.
 * defuddle은 오류 본문이나 빈 문서에서 예외를 던지므로 응답 상태와 content-type을 먼저 본다.
 */
export async function convertPage(
  url: URL,
  fetcher: Fetcher = fetch
): Promise<ConvertPageResult> {
  let response: Response;
  try {
    response = await fetcher(url.href, {
      headers: {
        "user-agent": "Mozilla/5.0 (compatible; FeedmeBot/1.0)",
        accept: "text/html,application/xhtml+xml",
      },
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    });
  } catch {
    return { ok: false, error: "unreachable" };
  }

  if (!response.ok) {
    return { ok: false, error: "http-status", status: response.status };
  }
  const contentType = response.headers.get("content-type") ?? "";
  if (!/html/i.test(contentType)) return { ok: false, error: "not-html" };

  let html: string;
  try {
    html = await response.text();
  } catch {
    return { ok: false, error: "unreachable" };
  }

  try {
    const { document } = parseHTML(html);
    const result = await Defuddle(document as unknown as Document, url.href, {
      markdown: true,
    });
    const markdown = (result.content ?? "").trim();
    if (!markdown) return { ok: false, error: "empty" };
    return {
      ok: true,
      title: result.title?.trim() || url.hostname,
      author: result.author?.trim() || "",
      markdown,
    };
  } catch {
    return { ok: false, error: "empty" };
  }
}
