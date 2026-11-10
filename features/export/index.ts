import type { Article } from "@/features/conversion";

/** 완성된 열기 주소(인코딩 후)가 이 길이를 넘으면 주소에 담지 않고 클립보드로 넘긴다. */
export const MAX_LLM_URL_LENGTH = 8000;

export type LlmTarget = "chatgpt" | "claude";

export type LlmHandoff =
  | { mode: "url"; url: string }
  | { mode: "clipboard"; url: string; clipboardText: string };

const CHAT_URLS: Record<LlmTarget, string> = {
  chatgpt: "https://chatgpt.com/",
  claude: "https://claude.ai/new",
};

/** 복사·다운로드·LLM 전달에 공통으로 쓰는 텍스트: 제목, 출처(저자), 본문. */
export function buildExportText(article: Article): string {
  const source = article.author ? `출처: ${article.url} (${article.author})` : `출처: ${article.url}`;
  return `# ${article.title}\n\n${source}\n\n${article.markdown}`;
}

export function buildMarkdownFilename(article: Pick<Article, "title" | "site">): string {
  const base = article.title
    .replace(/[\\/:*?"<>|]+/g, " ")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-{2,}/g, "-")
    .replace(/^-+|-+$/g, "");
  return `${base || article.site}.md`;
}

export function buildLlmHandoff(target: LlmTarget, prompt: string, exportText: string): LlmHandoff {
  const trimmedPrompt = prompt.trim();
  const fullText = trimmedPrompt ? `${trimmedPrompt}\n\n${exportText}` : exportText;
  const base = CHAT_URLS[target];
  const url = `${base}?q=${encodeURIComponent(fullText)}`;
  if (url.length <= MAX_LLM_URL_LENGTH) return { mode: "url", url };
  return { mode: "clipboard", url: base, clipboardText: fullText };
}
