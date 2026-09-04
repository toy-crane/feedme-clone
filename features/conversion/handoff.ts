import type { ConversionSuccess } from "./types"

export const PROMPT_PRESETS = ["요약해줘", "한국어로 번역해줘", "쉽게 설명해줘"] as const

export const NEW_CHAT_URL = {
  claude: "https://claude.ai/new",
  chatgpt: "https://chatgpt.com/",
} as const

export type ChatTarget = keyof typeof NEW_CHAT_URL

export const CHAT_LABEL: Record<ChatTarget, string> = {
  claude: "Claude",
  chatgpt: "ChatGPT",
}

/** 프롬프트를 고른 경우에만 본문 앞에 붙인다. */
export function composeHandoff(markdown: string, prompt: string): string {
  const intro = prompt.trim()
  return intro ? `${intro}\n\n${markdown}` : markdown
}

/** 파일 이름으로 쓸 수 없는 문자를 걷어낸 뒤 확장자를 붙인다. */
export function toFileName(title: string): string {
  const safe = title
    .replace(/[\\/:*?"<>|]/g, "-")
    .replace(/\s+/g, " ")
    .trim()
  return `${safe || "document"}.md`
}

/**
 * 출처 표시. 사이트명이 도메인에 이미 담겨 있거나 저자와 겹치면 같은 말을
 * 두 번 보여주지 않는다. 위키백과처럼 저자와 사이트명이 같은 문서가 있다.
 */
export function sourceLabels(result: ConversionSuccess): string[] {
  const site = result.site.trim()
  const domain = result.domain.trim()
  const siteIsInDomain =
    site !== "" && domain.toLowerCase().startsWith(site.toLowerCase())

  const candidates = [
    result.author,
    siteIsInDomain ? "" : site,
    domain,
    result.published,
  ]

  const labels: string[] = []
  for (const candidate of candidates) {
    const value = candidate.trim()
    if (!value) continue
    if (labels.some((seen) => seen.toLowerCase() === value.toLowerCase())) continue
    labels.push(value)
  }
  return labels
}
