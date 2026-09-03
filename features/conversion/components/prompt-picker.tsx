"use client"

import { Input } from "@/components/ui/input"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"

import { PROMPT_PRESETS } from "../handoff"

export const CUSTOM_PROMPT = "__custom"

export function PromptPicker({
  choice,
  customPrompt,
  onChoiceChange,
  onCustomPromptChange,
}: {
  choice: string
  customPrompt: string
  onChoiceChange: (next: string) => void
  onCustomPromptChange: (next: string) => void
}) {
  return (
    <div className="mt-5 flex flex-col gap-2">
      <span className="text-sm text-muted-foreground">프롬프트</span>
      <ToggleGroup
        variant="outline"
        size="sm"
        className="flex-wrap"
        value={choice ? [choice] : []}
        onValueChange={(next) => onChoiceChange(next[0] ?? "")}
        aria-label="프롬프트 선택"
      >
        {PROMPT_PRESETS.map((preset) => (
          <ToggleGroupItem key={preset} value={preset}>
            {preset}
          </ToggleGroupItem>
        ))}
        <ToggleGroupItem value={CUSTOM_PROMPT}>직접 입력</ToggleGroupItem>
      </ToggleGroup>
      {choice === CUSTOM_PROMPT && (
        <Input
          value={customPrompt}
          onChange={(event) => onCustomPromptChange(event.target.value)}
          placeholder="이 문서로 무엇을 할까요?"
          aria-label="직접 입력 프롬프트"
          autoFocus
        />
      )}
    </div>
  )
}
