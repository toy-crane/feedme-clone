export type ConversionFailureKind = "invalid-url" | "fetch-failed" | "empty-content"

export type ConversionFailure = {
  kind: ConversionFailureKind
  url: string
  status?: number
}

export type ConversionSuccess = {
  kind: "converted"
  url: string
  title: string
  author: string
  site: string
  domain: string
  published: string
  wordCount: number
  html: string
  markdown: string
}

export type ConversionOutcome = ConversionSuccess | ConversionFailure

export function isConverted(outcome: ConversionOutcome): outcome is ConversionSuccess {
  return outcome.kind === "converted"
}
