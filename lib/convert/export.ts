/** 복사·다운로드·LLM 전달에 공통으로 쓰는 Markdown. 첫 줄에 제목을 둔다. */
export function buildExportMarkdown(title: string, body: string): string {
  return `# ${title}\n\n${body}`;
}

/** LLM으로 보낼 텍스트. 프롬프트가 있으면 프롬프트, 빈 줄, Markdown 순서다. */
export function composeLlmText(markdown: string, prompt: string): string {
  const trimmed = prompt.trim();
  return trimmed ? `${trimmed}\n\n${markdown}` : markdown;
}

export function fileNameFromTitle(title: string): string {
  const safe = title
    .replace(/[\\/:*?"<>|\u0000-\u001f]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 100)
    .trim();
  return `${safe || "markdown"}.md`;
}
