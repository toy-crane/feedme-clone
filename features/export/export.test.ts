import { describe, expect, it } from "vitest";

import type { Article } from "@/features/conversion";

import { buildExportText, buildLlmHandoff, buildMarkdownFilename, MAX_LLM_URL_LENGTH } from "./index";

const ARTICLE: Article = {
  url: "https://defuddle.md/docs",
  title: "Documentation · Defuddle",
  author: "kepano",
  site: "defuddle.md",
  wordCount: 1352,
  markdown: "## Installation\n\nRun it.",
};

describe("buildExportText", () => {
  it("제목, 출처와 저자, 본문 순서로 조립한다", () => {
    expect(buildExportText(ARTICLE)).toBe(
      "# Documentation · Defuddle\n\n출처: https://defuddle.md/docs (kepano)\n\n## Installation\n\nRun it."
    );
  });

  it("저자가 없으면 출처만 적는다", () => {
    expect(buildExportText({ ...ARTICLE, author: "" })).toContain("출처: https://defuddle.md/docs\n\n");
    expect(buildExportText({ ...ARTICLE, author: "" })).not.toContain("()");
  });
});

describe("buildMarkdownFilename", () => {
  it("제목에서 파일명에 쓸 수 없는 문자를 걷어 낸다", () => {
    expect(buildMarkdownFilename({ title: 'A/B: "C"?', site: "x.com" })).toBe("A-B-C.md");
  });

  it("한글 제목은 그대로 쓰고 공백은 하이픈으로 바꾼다", () => {
    expect(buildMarkdownFilename({ title: "웹 페이지에서 본문 뽑기", site: "x.com" })).toBe("웹-페이지에서-본문-뽑기.md");
  });

  it("제목이 비면 도메인 이름을 쓴다", () => {
    expect(buildMarkdownFilename({ title: "  ", site: "paulgraham.com" })).toBe("paulgraham.com.md");
  });
});

describe("buildLlmHandoff", () => {
  const text = "# T\n\n본문";

  it("짧으면 프롬프트를 본문 앞에 붙여 ChatGPT 주소에 담는다", () => {
    const handoff = buildLlmHandoff("chatgpt", "요약해줘", text);

    expect(handoff.mode).toBe("url");
    const url = new URL(handoff.url);
    expect(url.origin + url.pathname).toBe("https://chatgpt.com/");
    expect(url.searchParams.get("q")).toBe("요약해줘\n\n# T\n\n본문");
  });

  it("Claude는 claude.ai/new 주소를 쓴다", () => {
    const handoff = buildLlmHandoff("claude", "", text);

    expect(handoff.mode).toBe("url");
    const url = new URL(handoff.url);
    expect(url.origin + url.pathname).toBe("https://claude.ai/new");
    expect(url.searchParams.get("q")).toBe(text);
  });

  it("프롬프트가 비어 있거나 공백뿐이면 본문만 전달한다", () => {
    for (const prompt of ["", "   "]) {
      const handoff = buildLlmHandoff("chatgpt", prompt, text);
      expect(new URL(handoff.url).searchParams.get("q")).toBe(text);
    }
  });

  it("주소가 기준 길이를 넘으면 전체 텍스트를 클립보드용으로 돌려주고 빈 대화를 연다", () => {
    const long = "가".repeat(5000);
    const handoff = buildLlmHandoff("claude", "요약해줘", long);

    expect(handoff.mode).toBe("clipboard");
    if (handoff.mode !== "clipboard") return;
    expect(handoff.url).toBe("https://claude.ai/new");
    expect(handoff.clipboardText).toBe(`요약해줘\n\n${long}`);
  });

  it("기준 길이 경계: 인코딩된 주소가 딱 기준이면 주소에 담고, 1자 넘으면 클립보드로 간다", () => {
    const base = buildLlmHandoff("chatgpt", "", "").url.length; // "https://chatgpt.com/?q="
    const fits = "a".repeat(MAX_LLM_URL_LENGTH - base);

    expect(buildLlmHandoff("chatgpt", "", fits).mode).toBe("url");
    expect(buildLlmHandoff("chatgpt", "", fits + "a").mode).toBe("clipboard");
  });
});
