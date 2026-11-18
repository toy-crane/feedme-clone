import { render } from "@testing-library/react";
import { expect, test } from "vitest";

import { MarkdownView } from "./markdown-view";

test("Markdown 안의 script와 이벤트 핸들러는 렌더링되지 않는다", () => {
  const { container } = render(
    <MarkdownView
      markdown={`# 제목\n\n<script>window.__xss = 1</script>\n\n<img src="x" onerror="window.__xss = 2">\n\n[링크](javascript:window.__xss=3)`}
    />
  );

  expect(container.querySelector("script")).toBeNull();
  expect(container.querySelector("[onerror]")).toBeNull();
  expect(container.querySelector("a")?.getAttribute("href") ?? "").not.toContain(
    "javascript:"
  );
  expect(container.querySelector("h1")).toHaveTextContent("제목");
});
