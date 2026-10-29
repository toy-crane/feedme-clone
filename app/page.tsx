"use client";

import { useRef, useState, type FormEvent } from "react";
import { toast } from "sonner";

import { ModeToggle } from "@/components/mode-toggle";
import { ConverterForm } from "@/components/url-to-markdown/converter-form";
import { ResultView } from "@/components/url-to-markdown/result-view";
import {
  FAILURE_MESSAGES,
  isLikelyHttpUrl,
  slugifyFilename,
  type ConvertResult,
  type ConvertStatus,
} from "@/components/url-to-markdown/types";

export default function Home() {
  const [url, setUrl] = useState("");
  const [status, setStatus] = useState<ConvertStatus>("idle");
  const [formatError, setFormatError] = useState(false);
  const [failureMessage, setFailureMessage] = useState<string | null>(null);
  const [result, setResult] = useState<ConvertResult | null>(null);

  const [promptOpen, setPromptOpen] = useState(false);
  const [promptText, setPromptText] = useState("");
  const promptTextareaRef = useRef<HTMLTextAreaElement>(null);

  function resetAll() {
    setUrl("");
    setStatus("idle");
    setFormatError(false);
    setFailureMessage(null);
    setResult(null);
    setPromptOpen(false);
    setPromptText("");
  }

  function handleUrlChange(value: string) {
    setUrl(value);
    if (formatError) setFormatError(false);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = url.trim();
    if (!isLikelyHttpUrl(trimmed)) {
      setFormatError(true);
      return;
    }

    setFormatError(false);
    setFailureMessage(null);
    setStatus("loading");

    try {
      const response = await fetch("/api/convert", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: trimmed }),
      });
      const data = await response.json();

      if (!response.ok) {
        setFailureMessage(FAILURE_MESSAGES[data?.error] ?? FAILURE_MESSAGES.unknown);
        setStatus("failed");
        return;
      }

      setResult(data as ConvertResult);
      setStatus("success");
    } catch {
      setFailureMessage(FAILURE_MESSAGES.fetch_failed);
      setStatus("failed");
    }
  }

  function handleRetry() {
    setStatus("idle");
    setFailureMessage(null);
  }

  function togglePrompt() {
    setPromptOpen((open) => {
      const next = !open;
      if (next) requestAnimationFrame(() => promptTextareaRef.current?.focus());
      return next;
    });
  }

  function applyPreset(preset: string) {
    setPromptText(preset);
    promptTextareaRef.current?.focus();
  }

  async function copyToClipboard(text: string) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      return false;
    }
  }

  async function handleCopy() {
    if (!result) return;
    const ok = await copyToClipboard(result.markdown);
    if (ok) toast.success("복사했어요");
    else toast.error("복사에 실패했어요. 브라우저 권한을 확인해 주세요");
  }

  function handleDownload() {
    if (!result) return;
    const blob = new Blob([result.markdown], { type: "text/markdown;charset=utf-8" });
    const downloadUrl = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = downloadUrl;
    anchor.download = slugifyFilename(result.title);
    document.body.append(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(downloadUrl);
    toast.success(".md 파일을 내려받았어요");
  }

  async function handleOpenInService(service: "ChatGPT" | "Claude") {
    if (!result) return;
    // Open the tab synchronously, before any `await`, so it still carries the
    // click's user-gesture context — otherwise popup blockers can silently
    // drop it once we're past the clipboard write.
    window.open(
      service === "ChatGPT" ? "https://chatgpt.com/" : "https://claude.ai/new",
      "_blank",
      "noopener"
    );
    const prompt = promptText.trim();
    const payload = prompt ? `${prompt}\n\n${result.markdown}` : result.markdown;
    const ok = await copyToClipboard(payload);
    if (ok) toast.success(`클립보드에 복사했어요. ${service} 새 탭에 붙여넣어 주세요`);
    else toast.error("복사에 실패했어요");
  }

  return (
    <main className="flex flex-1 justify-center px-6 py-14 sm:py-16">
      <div className="flex w-full max-w-2xl flex-col gap-6">
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-2 font-heading text-sm font-semibold">
            <span className="flex size-6 items-center justify-center rounded-md bg-primary text-xs text-primary-foreground">
              MD
            </span>
            URL → Markdown
          </div>
          <ModeToggle />
        </header>

        {status !== "success" || !result ? (
          <ConverterForm
            url={url}
            onUrlChange={handleUrlChange}
            formatError={formatError}
            status={status}
            failureMessage={failureMessage}
            onSubmit={handleSubmit}
            onClear={resetAll}
            onRetry={handleRetry}
          />
        ) : (
          <ResultView
            result={result}
            onBack={resetAll}
            promptOpen={promptOpen}
            onTogglePrompt={togglePrompt}
            promptText={promptText}
            onPromptTextChange={setPromptText}
            onApplyPreset={applyPreset}
            promptTextareaRef={promptTextareaRef}
            onCopy={handleCopy}
            onDownload={handleDownload}
            onOpenChatGpt={() => handleOpenInService("ChatGPT")}
            onOpenClaude={() => handleOpenInService("Claude")}
          />
        )}
      </div>
    </main>
  );
}
