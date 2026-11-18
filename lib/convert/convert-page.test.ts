import { expect, test } from "vitest";

import { convertPage } from "./convert-page";

const articleHtml = `<!doctype html><html><head><title>Hello Post</title>
<meta name="author" content="Jane Doe"></head><body><article>
<h1>Hello Post</h1><p>${"This is a long paragraph of real content. ".repeat(20)}</p>
<h2>Section</h2><p>${"More meaningful text for extraction. ".repeat(20)}</p>
<script>alert(1)</script></article></body></html>`;

function htmlResponse(body: string, init: ResponseInit = {}) {
  return new Response(body, {
    status: 200,
    headers: { "content-type": "text/html; charset=utf-8" },
    ...init,
  });
}

const url = new URL("https://example.com/post");

test("HTML 응답에서 제목, 저자, Markdown 본문을 뽑는다", async () => {
  const result = await convertPage(url, async () => htmlResponse(articleHtml));
  expect(result).toMatchObject({ ok: true, title: "Hello Post", author: "Jane Doe" });
  if (result.ok) expect(result.markdown).toContain("More meaningful text");
});

test("저자가 없으면 author가 비어 있다", async () => {
  const html = articleHtml.replace('<meta name="author" content="Jane Doe">', "");
  const result = await convertPage(url, async () => htmlResponse(html));
  expect(result).toMatchObject({ ok: true, author: "" });
});

test("제목이 없으면 도메인을 제목으로 쓴다", async () => {
  const html = articleHtml.replace("<title>Hello Post</title>", "").replace("<h1>Hello Post</h1>", "");
  const result = await convertPage(url, async () => htmlResponse(html));
  expect(result).toMatchObject({ ok: true, title: "example.com" });
});

test.each([403, 404, 500])("대상이 %i를 돌려주면 http-status 오류다", async (status) => {
  const result = await convertPage(url, async () =>
    htmlResponse("<html><body>nope</body></html>", { status })
  );
  expect(result).toEqual({ ok: false, error: "http-status", status });
});

test("HTML이 아닌 응답(PDF)은 not-html 오류다", async () => {
  const result = await convertPage(
    url,
    async () => new Response("%PDF-1.4", { headers: { "content-type": "application/pdf" } })
  );
  expect(result).toEqual({ ok: false, error: "not-html" });
});

test("본문이 비어 있으면 empty 오류다", async () => {
  const result = await convertPage(url, async () => htmlResponse("<html><body></body></html>"));
  expect(result).toEqual({ ok: false, error: "empty" });
});

test("접속 실패와 시간 초과는 unreachable 오류다", async () => {
  const result = await convertPage(url, async () => {
    throw new TypeError("fetch failed");
  });
  expect(result).toEqual({ ok: false, error: "unreachable" });
});
