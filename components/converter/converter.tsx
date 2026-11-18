"use client";

import { FileTextIcon, Loader2Icon, XIcon, CircleAlertIcon, BanIcon } from "lucide-react";
import { useRef, useState } from "react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { parseConvertUrl } from "@/lib/convert/url";

import { describeError, type ConvertErrorCode } from "./errors";
import { ResultCard, type ConvertedPage, type PromptState } from "./result-card";

type State =
  | { phase: "idle" }
  | { phase: "loading" }
  | { phase: "done"; page: ConvertedPage }
  | { phase: "error"; code: ConvertErrorCode; status?: number };

export function Converter() {
  const [url, setUrl] = useState("");
  const [state, setState] = useState<State>({ phase: "idle" });
  const [prompt, setPrompt] = useState<PromptState>({ open: false, text: "" });
  // 지우기 등으로 무효가 된 요청의 늦은 응답을 버리기 위한 번호.
  const requestId = useRef(0);

  const loading = state.phase === "loading";

  async function convert(event: React.FormEvent) {
    event.preventDefault();
    if (loading) return;
    const parsed = parseConvertUrl(url);
    if (!parsed.ok && parsed.reason === "invalid") {
      requestId.current++;
      setState({ phase: "error", code: "invalid" });
      return;
    }
    const id = ++requestId.current;
    setState({ phase: "loading" });
    try {
      const response = await fetch("/api/convert", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ url }),
      });
      const data = await response.json();
      if (id !== requestId.current) return;
      if (response.ok) setState({ phase: "done", page: data });
      else setState({ phase: "error", code: data.error, status: data.status });
    } catch {
      if (id !== requestId.current) return;
      setState({ phase: "error", code: "unreachable" });
    }
  }

  function clear() {
    requestId.current++;
    setUrl("");
    setState({ phase: "idle" });
  }

  const error = state.phase === "error" ? describeError(state.code, state.status) : null;
  const fieldError = error?.placement === "field" ? error : null;
  const noBody = state.phase === "error" && (state.code === "empty" || state.code === "not-html");
  const alertError = error?.placement === "alert" ? error : null;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1.5">
        <h1 className="font-heading text-2xl font-semibold tracking-tight max-sm:text-xl">
          웹 페이지를 Markdown으로
        </h1>
        <p className="text-sm leading-relaxed text-muted-foreground">
          URL을 붙여넣으면 본문만 뽑아 Markdown으로 바꿔 드려요. 그대로 복사하거나
          ChatGPT·Claude로 가져가세요.
        </p>
      </div>

      <form onSubmit={convert} noValidate>
        <Field data-invalid={fieldError ? true : undefined}>
          <FieldLabel htmlFor="url">페이지 URL</FieldLabel>
          <div className="flex gap-2 max-sm:flex-col">
            <div className="relative min-w-0 flex-1">
              <Input
                id="url"
                type="url"
                inputMode="url"
                autoComplete="off"
                spellCheck={false}
                placeholder="https://example.com/article"
                value={url}
                aria-invalid={fieldError ? true : undefined}
                onChange={(e) => setUrl(e.target.value)}
                className="pr-9"
              />
              {(url || state.phase !== "idle") && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  className="absolute top-0.5 right-0.5 text-muted-foreground"
                  aria-label="지우기"
                  title="지우기"
                  onClick={clear}
                >
                  <XIcon />
                </Button>
              )}
            </div>
            <Button type="submit" disabled={loading} aria-busy={loading}>
              {loading && <Loader2Icon className="animate-spin" data-icon="inline-start" />}
              {loading ? "변환 중…" : "변환하기"}
            </Button>
          </div>
          {fieldError && <FieldError>{fieldError.description}</FieldError>}
        </Field>
      </form>

      {state.phase === "idle" || fieldError ? (
        <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed px-6 py-10 text-center text-sm text-muted-foreground">
          <FileTextIcon className="size-5" />
          <p className="font-medium text-foreground">변환 결과가 여기에 보여요</p>
          <p>블로그 글, 뉴스 기사, 문서 페이지처럼 본문이 있는 주소가 잘 바뀌어요.</p>
        </div>
      ) : null}

      {loading && (
        <div
          aria-busy="true"
          role="status"
          aria-label="변환 중"
          className="flex flex-col gap-2.5 rounded-xl border p-6"
        >
          <Skeleton className="h-6 w-3/5" />
          <Skeleton className="mb-4 h-3.5 w-1/4" />
          <Skeleton className="h-3.5 w-full" />
          <Skeleton className="h-3.5 w-[94%]" />
          <Skeleton className="h-3.5 w-[97%]" />
          <Skeleton className="h-3.5 w-3/5" />
        </div>
      )}

      {state.phase === "done" && (
        <ResultCard page={state.page} prompt={prompt} onPromptChange={setPrompt} />
      )}

      {alertError && (
        <Alert variant={noBody ? "default" : "destructive"}>
          {state.phase === "error" && state.code === "blocked" ? <BanIcon /> : <CircleAlertIcon />}
          <AlertTitle>{alertError.title}</AlertTitle>
          <AlertDescription>{alertError.description}</AlertDescription>
        </Alert>
      )}
    </div>
  );
}
