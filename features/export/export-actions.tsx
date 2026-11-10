"use client";

import { CopyIcon, DownloadIcon } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import type { Article } from "@/features/conversion";

import { buildExportText, buildMarkdownFilename } from "./index";

async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

export function ExportActions({ article }: { article: Article }) {
  async function handleCopy() {
    if (await copyText(buildExportText(article))) toast.success("Markdown을 클립보드에 복사했습니다.");
    else toast.error("클립보드에 복사하지 못했습니다. 브라우저의 클립보드 권한을 확인해 주세요.");
  }

  function handleDownload() {
    const filename = buildMarkdownFilename(article);
    const blob = new Blob([buildExportText(article)], { type: "text/markdown;charset=utf-8" });
    const href = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = href;
    anchor.download = filename;
    anchor.click();
    URL.revokeObjectURL(href);
    toast.success(`${filename} 파일을 내려받았습니다.`);
  }

  return (
    <div className="flex shrink-0 gap-1">
      <Button variant="outline" size="icon" aria-label="Markdown 복사" title="Markdown 복사" onClick={handleCopy}>
        <CopyIcon />
      </Button>
      <Button variant="outline" size="icon" aria-label=".md 다운로드" title=".md 다운로드" onClick={handleDownload}>
        <DownloadIcon />
      </Button>
    </div>
  );
}
