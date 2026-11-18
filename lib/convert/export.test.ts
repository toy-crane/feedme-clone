import { expect, test } from "vitest";

import { buildExportMarkdown, composeLlmText, fileNameFromTitle } from "./export";

test("내보낼 Markdown은 # 제목, 빈 줄, 본문 순서다", () => {
  expect(buildExportMarkdown("글 제목", "본문입니다")).toBe(
    "# 글 제목\n\n본문입니다"
  );
});

test("프롬프트가 있으면 프롬프트, 빈 줄, Markdown 순서로 합친다", () => {
  expect(composeLlmText("# T\n\nbody", "요약해줘")).toBe(
    "요약해줘\n\n# T\n\nbody"
  );
});

test("프롬프트가 비었거나 공백뿐이면 Markdown만 보낸다", () => {
  expect(composeLlmText("# T\n\nbody", "")).toBe("# T\n\nbody");
  expect(composeLlmText("# T\n\nbody", "  \n ")).toBe("# T\n\nbody");
});

test("파일 이름은 제목에서 만들고 파일 시스템에 안전하지 않은 문자를 뺀다", () => {
  expect(fileNameFromTitle("Use the saw, fear the saw")).toBe(
    "Use the saw, fear the saw.md"
  );
  expect(fileNameFromTitle('a/b\\c:d*e?"f<g>h|i')).toBe("abcdefghi.md");
  expect(fileNameFromTitle("   ")).toBe("markdown.md");
});
