"use client";

import DOMPurify from "dompurify";
import { marked } from "marked";
import { useMemo } from "react";

/** Markdown을 렌더링하고, 원본 페이지에서 온 스크립트·이벤트 핸들러는 제거한다. */
export function MarkdownView({ markdown }: { markdown: string }) {
  const html = useMemo(
    () => DOMPurify.sanitize(marked.parse(markdown, { async: false })),
    [markdown]
  );
  return (
    <div
      className="markdown-body text-[15px] leading-7 wrap-anywhere"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
