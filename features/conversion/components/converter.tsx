"use client"

import { FileTextIcon, XIcon } from "lucide-react"
import { useState, useTransition } from "react"

import { Button } from "@/components/ui/button"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { Field } from "@/components/ui/field"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group"
import { Spinner } from "@/components/ui/spinner"

import { requestConversion } from "../actions"
import type { ChatTarget } from "../handoff"
import {
  CHAT_LABEL,
  NEW_CHAT_URL,
  composeHandoff,
  toFileName,
} from "../handoff"
import type { ConversionOutcome } from "../types"
import { isConverted } from "../types"
import { ConvertingSkeleton } from "./converting-skeleton"
import { FailureAlert } from "./failure-alert"
import { CUSTOM_PROMPT } from "./prompt-picker"
import { ResultView } from "./result-view"

export function Converter() {
  const [url, setUrl] = useState("")
  const [outcome, setOutcome] = useState<ConversionOutcome | null>(null)
  const [promptChoice, setPromptChoice] = useState("")
  const [customPrompt, setCustomPrompt] = useState("")
  const [notice, setNotice] = useState("")
  const [converting, startConverting] = useTransition()

  const result = outcome && isConverted(outcome) ? outcome : null

  function convert(target: string) {
    setNotice("")
    startConverting(async () => {
      setOutcome(await requestConversion(target))
    })
  }

  function clear() {
    setUrl("")
    setOutcome(null)
    setNotice("")
    setPromptChoice("")
    setCustomPrompt("")
  }

  function selectedPrompt() {
    if (!promptChoice) return ""
    return promptChoice === CUSTOM_PROMPT ? customPrompt : promptChoice
  }

  async function writeToClipboard(text: string) {
    try {
      await navigator.clipboard.writeText(text)
      return true
    } catch {
      return false
    }
  }

  async function copyMarkdown() {
    if (!result) return
    const copied = await writeToClipboard(result.markdown)
    setNotice(
      copied
        ? "본문 Markdown을 클립보드에 담았습니다."
        : "클립보드에 담지 못했습니다. 브라우저의 클립보드 권한을 확인해 주세요."
    )
  }

  function downloadMarkdown() {
    if (!result) return
    const blob = new Blob([result.markdown], {
      type: "text/markdown;charset=utf-8",
    })
    const href = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = href
    link.download = toFileName(result.title)
    link.click()
    URL.revokeObjectURL(href)
    setNotice(`${toFileName(result.title)} 파일로 저장했습니다.`)
  }

  async function openChat(target: ChatTarget) {
    if (!result) return
    window.open(NEW_CHAT_URL[target], "_blank", "noopener,noreferrer")

    const prompt = selectedPrompt()
    const copied = await writeToClipboard(composeHandoff(result.markdown, prompt))
    if (!copied) {
      setNotice(
        `${CHAT_LABEL[target]} 새 대화를 열었지만 클립보드에 담지 못했습니다. 브라우저의 클립보드 권한을 확인해 주세요.`
      )
      return
    }
    setNotice(
      `${CHAT_LABEL[target]} 새 대화를 열었습니다. ${
        prompt.trim() ? `"${prompt.trim()}"와 본문을` : "본문을"
      } 클립보드에 담았으니 붙여넣으세요.`
    )
  }

  return (
    <div className="mx-auto w-full max-w-2xl px-4 pb-24">
      <form
        onSubmit={(event) => {
          event.preventDefault()
          convert(url)
        }}
      >
        <Field orientation="horizontal">
          <InputGroup>
            <InputGroupInput
              value={url}
              onChange={(event) => setUrl(event.target.value)}
              placeholder="읽던 문서의 주소를 붙여넣으세요"
              aria-label="웹페이지 주소"
              autoComplete="off"
              spellCheck={false}
            />
            {url && (
              <InputGroupAddon align="inline-end">
                <InputGroupButton
                  type="button"
                  size="icon-xs"
                  aria-label="지우기"
                  onClick={clear}
                >
                  <XIcon />
                </InputGroupButton>
              </InputGroupAddon>
            )}
          </InputGroup>
          <Button type="submit" disabled={converting}>
            {converting && <Spinner data-icon="inline-start" />}
            변환
          </Button>
        </Field>
      </form>

      {!outcome && !converting && (
        <>
          <p className="mt-2 px-1 text-sm text-muted-foreground">
            광고와 네비게이션을 걷어낸 본문만 Markdown으로 만듭니다.
          </p>
          <Empty className="mt-8">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <FileTextIcon />
              </EmptyMedia>
              <EmptyTitle>아직 변환한 문서가 없습니다</EmptyTitle>
              <EmptyDescription>
                주소를 넣고 변환을 누르면 제목과 본문이 여기에 나타납니다. 결과는
                클립보드에 담아 Claude나 ChatGPT로 바로 넘길 수 있습니다.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        </>
      )}

      {converting && <ConvertingSkeleton />}

      {!converting && outcome && !isConverted(outcome) && (
        <FailureAlert failure={outcome} onRetry={() => convert(url)} />
      )}

      {!converting && result && (
        <ResultView
          result={result}
          notice={notice}
          promptChoice={promptChoice}
          customPrompt={customPrompt}
          onPromptChoiceChange={setPromptChoice}
          onCustomPromptChange={setCustomPrompt}
          onOpenChat={openChat}
          onCopy={copyMarkdown}
          onDownload={downloadMarkdown}
        />
      )}
    </div>
  )
}
