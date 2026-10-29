"use client";

import { CircleAlertIcon, Loader2Icon, RotateCcwIcon, XIcon } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import type { ConvertStatus } from "@/components/url-to-markdown/types";

type ConverterFormProps = {
  url: string;
  onUrlChange: (value: string) => void;
  formatError: boolean;
  status: ConvertStatus;
  failureMessage: string | null;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  onClear: () => void;
  onRetry: () => void;
};

export function ConverterForm({
  url,
  onUrlChange,
  formatError,
  status,
  failureMessage,
  onSubmit,
  onClear,
  onRetry,
}: ConverterFormProps) {
  const isLoading = status === "loading";

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold tracking-tight text-balance">
          웹 페이지를 읽기 좋은 Markdown으로
        </h1>
        <p className="text-muted-foreground">
          URL을 붙여넣으면 본문만 깔끔하게 정리해서 보여드려요. 복사하거나 ChatGPT·Claude로 바로
          넘길 수 있어요.
        </p>
      </div>

      <form onSubmit={onSubmit} className="flex flex-col gap-2">
        <label htmlFor="url-input" className="text-sm font-medium">
          웹 페이지 주소
        </label>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Input
              id="url-input"
              type="text"
              inputMode="url"
              autoComplete="off"
              placeholder="https://example.com/article"
              value={url}
              aria-invalid={formatError || undefined}
              className="h-11 pr-9 text-base"
              disabled={isLoading}
              onChange={(event) => onUrlChange(event.target.value)}
            />
            {url.length > 0 && !isLoading && (
              <button
                type="button"
                aria-label="지우기"
                onClick={onClear}
                className="absolute top-1/2 right-1.5 flex size-7 -translate-y-1/2 items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                <XIcon className="size-4" />
              </button>
            )}
          </div>
          <Button type="submit" size="lg" disabled={isLoading}>
            {isLoading ? <Loader2Icon data-icon="inline-start" className="animate-spin" /> : null}
            {isLoading ? "변환 중…" : "변환하기"}
          </Button>
        </div>

        {formatError && (
          <p className="flex items-center gap-1.5 text-sm text-destructive">
            <CircleAlertIcon className="size-4 shrink-0" />
            올바른 URL 형식이 아니에요. https://로 시작하는 주소를 입력해 주세요.
          </p>
        )}
      </form>

      {isLoading && (
        <div className="flex flex-col gap-3 rounded-lg border p-4">
          <Skeleton className="h-3.5 w-2/5" />
          <Skeleton className="h-3 w-[92%]" />
          <Skeleton className="h-3 w-[85%]" />
          <Skeleton className="h-3 w-[70%]" />
        </div>
      )}

      {status === "failed" && (
        <Alert variant="destructive">
          <CircleAlertIcon />
          <AlertTitle>페이지를 변환할 수 없어요</AlertTitle>
          <AlertDescription>
            {failureMessage}
            <div className="mt-3">
              <Button type="button" variant="outline" size="sm" onClick={onRetry}>
                <RotateCcwIcon data-icon="inline-start" />
                다시 시도
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
