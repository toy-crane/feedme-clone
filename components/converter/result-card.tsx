"use client";

import {
  ChevronDownIcon,
  CopyIcon,
  DownloadIcon,
  ExternalLinkIcon,
  PlusIcon,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Textarea } from "@/components/ui/textarea";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
  buildExportMarkdown,
  composeLlmText,
  fileNameFromTitle,
} from "@/lib/convert/export";

import { MarkdownView } from "./markdown-view";

export type ConvertedPage = {
  title: string;
  author: string;
  markdown: string;
  sourceUrl: string;
};

export type PromptState = {
  open: boolean;
  text: string;
};

const PRESETS = ["요약해줘", "한국어로 번역해줘", "쉽게 설명해줘"];

const LLM_TARGETS = {
  chatgpt: { label: "ChatGPT", url: "https://chatgpt.com/" },
  claude: { label: "Claude", url: "https://claude.ai/new" },
} as const;

export function ResultCard({
  page,
  prompt,
  onPromptChange,
}: {
  page: ConvertedPage;
  prompt: PromptState;
  onPromptChange: (next: PromptState) => void;
}) {
  const exported = buildExportMarkdown(page.title, page.markdown);

  async function copy() {
    try {
      await navigator.clipboard.writeText(exported);
      toast.success("Markdown을 복사했어요");
    } catch {
      toast.error("복사하지 못했어요", {
        description: "브라우저가 클립보드 접근을 막았어요.",
      });
    }
  }

  function download() {
    const blob = new Blob([exported], { type: "text/markdown;charset=utf-8" });
    const href = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = href;
    a.download = fileNameFromTitle(page.title);
    a.click();
    URL.revokeObjectURL(href);
  }

  function openInLlm(target: keyof typeof LLM_TARGETS) {
    const { label, url } = LLM_TARGETS[target];
    const text = composeLlmText(
      exported,
      prompt.open ? prompt.text : ""
    );
    // 클립보드 쓰기는 사용자 클릭 직후에 시작하고, 새 탭도 같은 클릭 안에서 연다.
    const copied = navigator.clipboard.writeText(text);
    window.open(url, "_blank", "noopener,noreferrer");
    copied.then(
      () =>
        toast.success("복사했어요. 새 탭에서 붙여넣어 주세요", {
          description: `${label} 입력창을 누르고 붙여넣기(⌘V / Ctrl+V)를 하면 돼요.`,
        }),
      () =>
        toast.error("복사하지 못했어요", {
          description: "브라우저가 클립보드 접근을 막았어요. 복사하기를 먼저 눌러 보세요.",
        })
    );
  }

  const selectedPreset = PRESETS.find((p) => p === prompt.text);

  return (
    <Card>
      <CardHeader className="flex flex-col gap-4 border-b">
        <div className="flex min-w-0 flex-col gap-1">
          <h2 className="font-heading text-xl font-semibold leading-snug wrap-anywhere">
            {page.title}
          </h2>
          <div className="flex flex-col gap-0.5 text-[13px] text-muted-foreground">
            {page.author && (
              <span className="font-medium text-foreground">{page.author}</span>
            )}
            <a
              href={page.sourceUrl}
              target="_blank"
              rel="noreferrer"
              className="underline underline-offset-3 wrap-anywhere"
            >
              {page.sourceUrl}
            </a>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 *:max-sm:flex-1">
          <Button variant="outline" size="sm" onClick={copy}>
            <CopyIcon data-icon="inline-start" />
            복사하기
          </Button>
          <Button variant="outline" size="sm" onClick={download}>
            <DownloadIcon data-icon="inline-start" />
            .md 다운로드
          </Button>
          <span aria-hidden className="mx-0.5 h-5 w-px bg-border max-sm:hidden" />
          <Button variant="outline" size="sm" onClick={() => openInLlm("chatgpt")}>
            <ExternalLinkIcon data-icon="inline-start" />
            ChatGPT로 열기
          </Button>
          <Button variant="outline" size="sm" onClick={() => openInLlm("claude")}>
            <ExternalLinkIcon data-icon="inline-start" />
            Claude로 열기
          </Button>
        </div>

        <Collapsible
          open={prompt.open}
          onOpenChange={(open) => onPromptChange({ ...prompt, open })}
          className="flex flex-col items-start gap-2.5"
        >
          <CollapsibleTrigger
            render={<Button variant="secondary" size="sm" />}
          >
            <PlusIcon data-icon="inline-start" />
            프롬프트 추가하기
            <ChevronDownIcon
              data-icon="inline-end"
              className={prompt.open ? "rotate-180" : undefined}
            />
          </CollapsibleTrigger>
          <CollapsibleContent className="flex w-full flex-col gap-2.5">
            <Textarea
              rows={3}
              placeholder="ex) 이 글을 요약해줘"
              aria-label="본문 앞에 붙일 프롬프트"
              value={prompt.text}
              onChange={(e) => onPromptChange({ ...prompt, text: e.target.value })}
            />
            <ToggleGroup
              aria-label="프롬프트 예시"
              variant="outline"
              size="sm"
              className="flex-wrap"
              value={selectedPreset ? [selectedPreset] : []}
              onValueChange={(values) => {
                const next = values[0];
                if (next) onPromptChange({ ...prompt, text: next });
              }}
            >
              {PRESETS.map((preset) => (
                <ToggleGroupItem
                  key={preset}
                  value={preset}
                  className="rounded-full px-3"
                >
                  {preset}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          </CollapsibleContent>
        </Collapsible>
      </CardHeader>
      <CardContent className="pt-2">
        <MarkdownView markdown={page.markdown} />
      </CardContent>
    </Card>
  );
}
