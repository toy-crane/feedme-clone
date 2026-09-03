import { Defuddle } from "defuddle/node"

import type { ConversionOutcome } from "./types"

const BROWSER_USER_AGENT =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"

export function parseTargetUrl(raw: string): URL | null {
  const value = raw.trim()
  if (!value) return null

  let url: URL
  try {
    url = new URL(value)
  } catch {
    return null
  }

  if (url.protocol !== "http:" && url.protocol !== "https:") return null
  return url
}

export async function convertUrl(raw: string): Promise<ConversionOutcome> {
  const target = parseTargetUrl(raw)
  if (!target) return { kind: "invalid-url", url: raw.trim() }

  let response: Response
  try {
    response = await fetch(target, {
      headers: { "user-agent": BROWSER_USER_AGENT },
      redirect: "follow",
    })
  } catch {
    return { kind: "fetch-failed", url: target.href }
  }

  if (!response.ok) {
    return { kind: "fetch-failed", url: target.href, status: response.status }
  }

  const parsed = await Defuddle(await response.text(), target.href, {
    separateMarkdown: true,
  })

  const markdown = (parsed.contentMarkdown ?? "").trim()
  if (!markdown) return { kind: "empty-content", url: target.href }

  return {
    kind: "converted",
    url: target.href,
    title: parsed.title || target.hostname,
    author: parsed.author ?? "",
    site: parsed.site ?? "",
    domain: parsed.domain || target.hostname,
    published: parsed.published ?? "",
    wordCount: parsed.wordCount ?? 0,
    html: parsed.content ?? "",
    markdown,
  }
}
