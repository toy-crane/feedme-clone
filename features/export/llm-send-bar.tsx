"use client";

import { ArrowUpRightIcon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import type { Article } from "@/features/conversion";

import { buildExportText, buildLlmHandoff, type LlmTarget } from "./index";

const PRESETS = ["요약해줘", "한국어로 번역해줘", "쉽게 설명해줘"] as const;
const CUSTOM = "직접 입력";
const LLM_NAMES: Record<LlmTarget, string> = { chatgpt: "ChatGPT", claude: "Claude" };

/** 프롬프트 선택은 변환 결과마다 새로 시작하도록 결과 카드 단위로 마운트한다. 저장하지 않는다. */
export function LlmSendBar({ article }: { article: Article }) {
  const [selected, setSelected] = useState<string>("");
  const [customPrompt, setCustomPrompt] = useState("");

  function handleSelect(values: string[]) {
    const next = values[0] ?? "";
    setSelected(next);
    setCustomPrompt("");
  }

  const prompt = selected === CUSTOM ? customPrompt : selected;

  function handleOpen(target: LlmTarget) {
    const handoff = buildLlmHandoff(target, prompt, buildExportText(article));
    const name = LLM_NAMES[target];
    // 팝업 차단을 피하려고 클릭과 같은 흐름에서 먼저 탭을 연다.
    window.open(handoff.url, "_blank");
    if (handoff.mode === "url") return;
    navigator.clipboard.writeText(handoff.clipboardText).then(
      () =>
        toast.info(`${name}를 새 탭에서 열었습니다.`, {
          description: "글이 길어 주소에 다 담을 수 없었습니다. 클립보드에 복사했으니 입력창에 붙여 넣어 주세요.",
        }),
      () => toast.error("클립보드에 복사하지 못했습니다. 브라우저의 클립보드 권한을 확인해 주세요.")
    );
  }

  return (
    <div className="sticky bottom-0 z-10 flex flex-col gap-2.5 rounded-b-xl border-t bg-card px-4 py-3 shadow-[0_-8px_20px_rgb(0_0_0/0.06)] sm:px-5">
      <ToggleGroup
        aria-label="프롬프트"
        value={selected ? [selected] : []}
        onValueChange={handleSelect}
        variant="outline"
        size="sm"
        spacing={1.5}
        className="flex-wrap"
      >
        {[...PRESETS, CUSTOM].map((label) => (
          <ToggleGroupItem key={label} value={label} className="rounded-full px-3 data-[pressed]:bg-primary data-[pressed]:text-primary-foreground">
            {label}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
      {selected === CUSTOM && (
        <Input
          aria-label="직접 입력한 프롬프트"
          placeholder="예: 핵심 주장 3개와 반론을 정리해줘"
          value={customPrompt}
          onChange={(event) => setCustomPrompt(event.target.value)}
          autoFocus
        />
      )}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Button size="sm" className="flex-1 sm:flex-none" onClick={() => handleOpen("chatgpt")}>
          ChatGPT로 열기
          <ArrowUpRightIcon data-icon="inline-end" />
        </Button>
        <Button size="sm" className="flex-1 sm:flex-none" onClick={() => handleOpen("claude")}>
          Claude로 열기
          <ArrowUpRightIcon data-icon="inline-end" />
        </Button>
      </div>
    </div>
  );
}
