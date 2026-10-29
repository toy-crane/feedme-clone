"use client";

import { RefObject } from "react";
import {
  ArrowLeftIcon,
  ArrowUpRightIcon,
  ChevronDownIcon,
  ClipboardIcon,
  DownloadIcon,
  PlusIcon,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { PROMPT_PRESETS, type ConvertResult } from "@/components/url-to-markdown/types";

type ResultViewProps = {
  result: ConvertResult;
  onBack: () => void;
  promptOpen: boolean;
  onTogglePrompt: () => void;
  promptText: string;
  onPromptTextChange: (value: string) => void;
  onApplyPreset: (preset: string) => void;
  promptTextareaRef: RefObject<HTMLTextAreaElement | null>;
  onCopy: () => void;
  onDownload: () => void;
  onOpenChatGpt: () => void;
  onOpenClaude: () => void;
};

export function ResultView({
  result,
  onBack,
  promptOpen,
  onTogglePrompt,
  promptText,
  onPromptTextChange,
  onApplyPreset,
  promptTextareaRef,
  onCopy,
  onDownload,
  onOpenChatGpt,
  onOpenClaude,
}: ResultViewProps) {
  return (
    <div className="flex flex-col gap-4">
      <Button type="button" variant="ghost" size="sm" className="w-fit text-muted-foreground" onClick={onBack}>
        <ArrowLeftIcon data-icon="inline-start" />
        새 URL 변환하기
      </Button>

      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 flex-col gap-1.5">
          <h1 className="text-xl font-bold tracking-tight text-balance">{result.title}</h1>
          {result.author && (
            <p className="text-sm text-muted-foreground">{result.author}</p>
          )}
        </div>

        <div className="flex shrink-0 overflow-hidden rounded-md border">
          <Button
            type="button"
            variant="ghost"
            className="h-9 gap-1.5 rounded-none border-0 px-3"
            onClick={onCopy}
          >
            <ClipboardIcon data-icon="inline-start" />
            복사하기
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-9 w-8 rounded-none border-0 border-l"
                  aria-label="다른 방법으로 내보내기"
                />
              }
            >
              <ChevronDownIcon />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="min-w-44">
              <DropdownMenuItem onClick={onDownload}>
                <DownloadIcon />
                마크다운 다운로드
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onOpenChatGpt}>
                <ArrowUpRightIcon />
                ChatGPT에서 열기
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onOpenClaude}>
                <ArrowUpRightIcon />
                Claude에서 열기
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="rounded-full border-dashed text-muted-foreground"
          aria-expanded={promptOpen}
          onClick={onTogglePrompt}
        >
          <PlusIcon data-icon="inline-start" />
          프롬프트 추가하기
          <ChevronDownIcon
            data-icon="inline-end"
            className={cn("transition-transform", promptOpen && "rotate-180")}
          />
        </Button>

        {promptOpen && (
          <div className="mt-2.5 flex max-w-md flex-col gap-2.5">
            <Textarea
              ref={promptTextareaRef}
              placeholder="ex) 이 글을 요약해줘"
              value={promptText}
              onChange={(event) => onPromptTextChange(event.target.value)}
              className="min-h-14"
            />
            <div className="flex flex-wrap gap-2">
              {PROMPT_PRESETS.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => onApplyPreset(preset)}
                  className={cn(
                    "h-8 rounded-full border px-3.5 text-sm transition-colors",
                    promptText === preset
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-background hover:bg-muted"
                  )}
                >
                  {preset}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <article
        className={cn(
          "rounded-xl border bg-card p-6 text-sm leading-7 text-card-foreground",
          "[&_h2]:mt-6 [&_h2]:mb-2 [&_h2]:font-heading [&_h2]:text-lg [&_h2]:font-bold first:[&_h2]:mt-0",
          "[&_h3]:mt-4 [&_h3]:mb-1.5 [&_h3]:font-heading [&_h3]:text-base [&_h3]:font-semibold",
          "[&_p]:mb-3",
          "[&_ul]:mb-3.5 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:mb-3.5 [&_ol]:list-decimal [&_ol]:pl-5 [&_li]:mb-1",
          "[&_blockquote]:mb-3 [&_blockquote]:border-l-2 [&_blockquote]:pl-3.5 [&_blockquote]:text-muted-foreground",
          "[&_code]:rounded [&_code]:bg-muted [&_code]:px-1 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-[0.85em]",
          "[&_pre]:mb-3 [&_pre]:overflow-x-auto [&_pre]:rounded-md [&_pre]:bg-muted [&_pre]:p-3 [&_pre_code]:bg-transparent [&_pre_code]:p-0",
          "[&_a]:underline [&_a]:underline-offset-2 [&_a]:hover:text-muted-foreground",
          "[&_img]:mb-3 [&_img]:rounded-md"
        )}
        dangerouslySetInnerHTML={{ __html: result.html }}
      />
    </div>
  );
}
