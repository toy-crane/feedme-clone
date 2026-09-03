"use client"

import { CircleAlertIcon, EyeOffIcon, TriangleAlertIcon } from "lucide-react"
import type { ComponentType } from "react"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"

import type { ConversionFailure } from "../types"

type FailureCopy = {
  icon: ComponentType<{ className?: string }>
  title: string
  describe: (failure: ConversionFailure) => string
  destructive: boolean
  showUrl: boolean
  actions: Array<"retry" | "open-original">
}

const COPY: Record<ConversionFailure["kind"], FailureCopy> = {
  "invalid-url": {
    icon: CircleAlertIcon,
    title: "주소 형식이 아닙니다",
    describe: () => "웹페이지 주소를 넣어 주세요. https://로 시작하는 주소면 됩니다.",
    destructive: true,
    showUrl: false,
    actions: [],
  },
  "fetch-failed": {
    icon: TriangleAlertIcon,
    title: "페이지를 가져오지 못했습니다",
    describe: (failure) =>
      failure.status
        ? `서버가 ${failure.status}로 답했습니다. 삭제되었거나 주소가 바뀐 문서일 수 있습니다.`
        : "페이지에 닿지 못했습니다. 주소와 연결 상태를 확인한 뒤 다시 시도해 주세요.",
    destructive: true,
    showUrl: true,
    actions: ["retry", "open-original"],
  },
  "empty-content": {
    icon: EyeOffIcon,
    title: "본문을 찾지 못했습니다",
    describe: () =>
      "페이지는 열렸지만 글이 비어 있습니다. 자바스크립트로 내용을 그리는 페이지는 이 방식으로 읽을 수 없습니다. 원본에서 필요한 부분을 직접 복사해 주세요.",
    destructive: false,
    showUrl: true,
    actions: ["open-original", "retry"],
  },
}

export function FailureAlert({
  failure,
  onRetry,
}: {
  failure: ConversionFailure
  onRetry: () => void
}) {
  const copy = COPY[failure.kind]
  const Icon = copy.icon

  return (
    <Alert variant={copy.destructive ? "destructive" : "default"} className="mt-6">
      <Icon />
      <AlertTitle>{copy.title}</AlertTitle>
      <AlertDescription>
        <p>{copy.describe(failure)}</p>
        {copy.showUrl && (
          <p className="font-mono text-xs break-all">{failure.url}</p>
        )}
        {copy.actions.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {copy.actions.map((action) =>
              action === "retry" ? (
                <Button key={action} variant="outline" size="sm" onClick={onRetry}>
                  다시 시도
                </Button>
              ) : (
                <Button key={action} variant="ghost" size="sm" render={<a href={failure.url} target="_blank" rel="noreferrer" />}>
                  원본 열기
                </Button>
              )
            )}
          </div>
        )}
      </AlertDescription>
    </Alert>
  )
}
