// @vitest-environment node
import { afterEach, describe, expect, it, vi } from "vitest";

import { convertUrl } from "./convert-url";

const ARTICLE_HTML = `<!doctype html><html><head>
<title>How to Do Great Work</title>
<meta name="author" content="Paul Graham">
</head><body>
<nav><a href="/">Home</a><a href="/about">About</a></nav>
<article>
<h1>How to Do Great Work</h1>
<p>If you collected lists of techniques for doing great work in a lot of different fields, what would the intersection look like? I decided to find out by making it.</p>
<p>Partly my goal was to create a guide that could be used by someone working in any field. But I was also curious about the shape of the intersection.</p>
<h2>The first step</h2>
<p>The first step is to decide what to work on. The work you choose needs to have three qualities.</p>
</article>
<footer>Copyright</footer>
</body></html>`;

function mockFetch(response: Response | Error) {
  const fn = vi.fn(async () => {
    if (response instanceof Error) throw response;
    return response;
  });
  vi.stubGlobal("fetch", fn);
  return fn;
}

function html(body: string, status = 200) {
  return new Response(body, {
    status,
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("convertUrl", () => {
  it("웹 페이지의 제목·저자·단어 수와 본문 Markdown을 돌려준다", async () => {
    mockFetch(html(ARTICLE_HTML));

    const result = await convertUrl("https://example.com/great-work");

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.article.title).toBe("How to Do Great Work");
    expect(result.article.author).toBe("Paul Graham");
    expect(result.article.site).toBe("example.com");
    expect(result.article.wordCount).toBeGreaterThan(0);
    expect(result.article.url).toBe("https://example.com/great-work");
    expect(result.article.markdown).toContain("## The first step");
    expect(result.article.markdown).not.toContain("Copyright");
  });

  it("http(s) 형식이 아닌 입력은 요청을 보내지 않고 형식 오류를 돌려준다", async () => {
    const fetchFn = mockFetch(html(ARTICLE_HTML));

    for (const input of ["defuddle 문서", "ftp://example.com/a", "", "https://"]) {
      const result = await convertUrl(input);
      expect(result).toEqual({ ok: false, error: { kind: "invalid-url" } });
    }
    expect(fetchFn).not.toHaveBeenCalled();
  });

  it("대상 사이트가 오류 응답을 주면 상태 코드와 함께 가져오기 실패를 돌려준다", async () => {
    mockFetch(html("<html><body><p>Please enable JS and disable any ad blocker</p></body></html>", 403));

    const result = await convertUrl("https://www.nytimes.com/2026/11/09/tech.html");

    expect(result).toEqual({
      ok: false,
      error: { kind: "fetch-failed", host: "www.nytimes.com", status: 403 },
    });
  });

  it("접속할 수 없으면 상태 코드 없이 가져오기 실패를 돌려준다", async () => {
    mockFetch(new TypeError("fetch failed"));

    const result = await convertUrl("https://no-such-host.example/a");

    expect(result).toEqual({
      ok: false,
      error: { kind: "fetch-failed", host: "no-such-host.example" },
    });
  });

  it("본문을 추출하지 못하면 본문 없음을 돌려준다", async () => {
    mockFetch(html('<!doctype html><html><head><title>App</title></head><body><div id="root"></div><script>render()</script></body></html>'));

    const result = await convertUrl("https://app.example.com/dashboard");

    expect(result).toEqual({ ok: false, error: { kind: "empty-content" } });
  });
});
