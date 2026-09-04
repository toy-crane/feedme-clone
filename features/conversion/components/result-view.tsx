"use client"

import { CheckIcon } from "lucide-react"
import { Fragment } from "react"

import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"

import type { ChatTarget } from "../handoff"
import { sourceLabels } from "../handoff"
import type { ConversionSuccess } from "../types"
import { ExportMenu } from "./export-menu"
import { PromptPicker } from "./prompt-picker"

export function ResultView({
  result,
  notice,
  promptChoice,
  customPrompt,
  onPromptChoiceChange,
  onCustomPromptChange,
  onOpenChat,
  onCopy,
  onDownload,
}: {
  result: ConversionSuccess
  notice: string
  promptChoice: string
  customPrompt: string
  onPromptChoiceChange: (next: string) => void
  onCustomPromptChange: (next: string) => void
  onOpenChat: (target: ChatTarget) => void
  onCopy: () => void
  onDownload: () => void
}) {
  const labels = sourceLabels(result)

  return (
    <section className="mt-6">
      <header className="flex items-start justify-between gap-4 border-b pb-4">
        <div className="min-w-0">
          <h1 className="text-xl leading-snug font-medium tracking-tight">
            {result.title}
          </h1>
          <div className="mt-2 flex flex-wrap items-center gap-x-1.5 gap-y-1 text-sm text-muted-foreground">
            {labels.map((label, index) => (
              <Fragment key={`${index}-${label}`}>
                {index > 0 && <span aria-hidden>·</span>}
                <span>{label}</span>
              </Fragment>
            ))}
            {result.wordCount > 0 && (
              <>
                <span aria-hidden>·</span>
                <Badge variant="secondary">
                  {result.wordCount.toLocaleString()} 단어
                </Badge>
              </>
            )}
          </div>
        </div>
        <div className="shrink-0">
          <ExportMenu
            onOpenChat={onOpenChat}
            onCopy={onCopy}
            onDownload={onDownload}
          />
        </div>
      </header>

      {notice && (
        <Alert className="mt-4" role="status">
          <CheckIcon />
          <AlertDescription>{notice}</AlertDescription>
        </Alert>
      )}

      <PromptPicker
        choice={promptChoice}
        customPrompt={customPrompt}
        onChoiceChange={onPromptChoiceChange}
        onCustomPromptChange={onCustomPromptChange}
      />

      <div
        className="markdown-body mt-6"
        dangerouslySetInnerHTML={{ __html: result.html }}
      />
    </section>
  )
}
