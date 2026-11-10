"use client";

import { useRef, useState, useTransition } from "react";

import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ConversionErrorAlert,
  MarkdownView,
  UrlForm,
  convertUrl,
  parseWebUrl,
  type Article,
  type ConversionError,
} from "@/features/conversion";
import { ExportActions } from "@/features/export/export-actions";
import { LlmSendBar } from "@/features/export/llm-send-bar";

type View =
  | { kind: "idle" }
  | { kind: "result"; article: Article; id: number }
  | { kind: "error"; error: Exclude<ConversionError, { kind: "invalid-url" }> };

export function Converter() {
  const [url, setUrl] = useState("");
  const [invalid, setInvalid] = useState(false);
  const [view, setView] = useState<View>({ kind: "idle" });
  const [pending, startTransition] = useTransition();
  // 지우기를 누르면 번호를 올려, 그 전에 시작한 변환의 늦은 응답을 버린다.
  const generation = useRef(0);

  function handleValueChange(value: string) {
    setUrl(value);
    setInvalid(false);
  }

  function handleSubmit() {
    if (!parseWebUrl(url)) {
      setInvalid(true);
      setView({ kind: "idle" });
      return;
    }
    setInvalid(false);
    const started = generation.current;
    startTransition(async () => {
      const result = await convertUrl(url);
      if (started !== generation.current) return;
      if (result.ok) setView((prev) => ({ kind: "result", article: result.article, id: (prev.kind === "result" ? prev.id : 0) + 1 }));
      else if (result.error.kind === "invalid-url") setInvalid(true);
      else setView({ kind: "error", error: result.error });
    });
  }

  function handleClear() {
    generation.current += 1;
    setUrl("");
    setInvalid(false);
    setView({ kind: "idle" });
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="font-heading text-2xl font-semibold tracking-tight text-balance">
          웹 페이지를 Markdown으로,
          <br />
          바로 LLM에게.
        </h1>
        <p className="text-sm leading-relaxed text-muted-foreground">
          URL을 붙여 넣으면 본문만 깔끔하게 Markdown으로 뽑아 드립니다. 복사하거나, 파일로 받거나, ChatGPT·Claude에서 바로 이어
          가세요.
        </p>
      </div>
      <UrlForm
        value={url}
        invalid={invalid}
        pending={pending}
        onValueChange={handleValueChange}
        onSubmit={handleSubmit}
        onClear={handleClear}
      />
      {pending ? (
        <Card data-testid="conversion-loading" aria-busy="true" className="gap-4">
          <div className="flex flex-col gap-3 px-6">
            <Skeleton className="h-6 w-2/3" />
            <Skeleton className="h-4 w-2/5" />
          </div>
          <div className="flex flex-col gap-3 px-6">
            <Skeleton className="h-4 w-11/12" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        </Card>
      ) : view.kind === "error" ? (
        <ConversionErrorAlert error={view.error} />
      ) : view.kind === "result" ? (
        <ArticleCard key={view.id} article={view.article} />
      ) : (
        <div className="rounded-xl border border-dashed px-4 py-10 text-center text-sm text-muted-foreground">
          변환 결과가 여기에 나타납니다.
        </div>
      )}
    </div>
  );
}

function ArticleCard({ article }: { article: Article }) {
  const meta = [article.author, article.site, `${article.wordCount.toLocaleString("en-US")} 단어`].filter(Boolean);
  return (
    <Card role="article" className="gap-0 overflow-visible py-0">
      <header className="flex items-start justify-between gap-3 rounded-t-xl border-b px-5 py-5">
        <div className="flex min-w-0 flex-col gap-2">
          <h2 className="font-heading text-xl leading-snug font-semibold">{article.title}</h2>
          <div data-testid="article-meta" className="flex flex-wrap gap-x-2.5 gap-y-1 text-sm text-muted-foreground">
            {meta.map((item, index) => (
              <span key={index} className="not-first:before:mr-2.5 not-first:before:content-['·']">
                {item}
              </span>
            ))}
          </div>
        </div>
        <ExportActions article={article} />
      </header>
      <MarkdownView markdown={article.markdown} className="px-5 py-4" />
      <LlmSendBar article={article} />
    </Card>
  );
}
