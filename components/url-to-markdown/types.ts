export type ConvertResult = {
  title: string;
  author: string | null;
  markdown: string;
  html: string;
};

export type ConvertStatus = "idle" | "loading" | "failed" | "success";

export const PROMPT_PRESETS = ["요약해줘", "한국어로 번역해줘", "쉽게 설명해줘"] as const;

export const FAILURE_MESSAGES: Record<string, string> = {
  invalid_url: "올바른 URL 형식이 아니에요. https://로 시작하는 주소를 입력해 주세요.",
  blocked_host: "로그인이 필요하거나 내부 네트워크 주소라 접근할 수 없어요.",
  fetch_failed: "페이지에 접근할 수 없어요. 접근이 차단된 페이지일 수 있어요.",
  timeout: "페이지를 불러오는 데 시간이 너무 오래 걸렸어요.",
  not_html: "웹 페이지가 아닌 주소예요. 다른 URL을 입력해 주세요.",
  extract_failed: "본문을 추출할 수 없는 페이지예요.",
  unknown: "페이지를 변환할 수 없어요. 잠시 후 다시 시도해 주세요.",
};

export function isLikelyHttpUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

export function slugifyFilename(title: string): string {
  const base = title.trim().replace(/\s+/g, "-").replace(/[\\/:*?"<>|]/g, "");
  return `${base || "markdown"}.md`;
}
