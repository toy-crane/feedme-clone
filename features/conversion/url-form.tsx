"use client";

import { XIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type UrlFormProps = {
  value: string;
  invalid: boolean;
  pending: boolean;
  onValueChange: (value: string) => void;
  onSubmit: () => void;
  onClear: () => void;
};

export function UrlForm({ value, invalid, pending, onValueChange, onSubmit, onClear }: UrlFormProps) {
  return (
    <form
      className="flex flex-col gap-2"
      noValidate
      onSubmit={(event) => {
        event.preventDefault();
        if (!pending) onSubmit();
      }}
    >
      <div className="flex flex-col gap-2 sm:flex-row">
        <div className="relative min-w-0 flex-1">
          <Input
            type="url"
            inputMode="url"
            autoComplete="off"
            aria-label="변환할 페이지 URL"
            aria-invalid={invalid || undefined}
            aria-describedby={invalid ? "url-error" : undefined}
            placeholder="https://example.com/article"
            className="h-10 pr-10 text-base md:text-[15px]"
            value={value}
            onChange={(event) => onValueChange(event.target.value)}
          />
          {value && (
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              className="absolute top-1 right-1 text-muted-foreground"
              aria-label="입력 지우기"
              onClick={onClear}
            >
              <XIcon />
            </Button>
          )}
        </div>
        <Button type="submit" size="lg" className="h-10 px-4" disabled={pending}>
          Markdown으로 변환
        </Button>
      </div>
      {invalid && (
        <p id="url-error" className="text-sm text-destructive">
          http:// 또는 https://로 시작하는 웹 페이지 주소를 입력해 주세요.
        </p>
      )}
    </form>
  );
}
