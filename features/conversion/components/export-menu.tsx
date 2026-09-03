"use client"

import { CopyIcon, DownloadIcon, ExternalLinkIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import type { ChatTarget } from "../handoff"

export function ExportMenu({
  onOpenChat,
  onCopy,
  onDownload,
}: {
  onOpenChat: (target: ChatTarget) => void
  onCopy: () => void
  onDownload: () => void
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={<Button>내보내기</Button>} />
      <DropdownMenuContent align="end" className="min-w-52">
        <DropdownMenuGroup>
          <DropdownMenuItem onClick={() => onOpenChat("claude")}>
            <ExternalLinkIcon data-icon="inline-start" />
            Claude로 열기
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onOpenChat("chatgpt")}>
            <ExternalLinkIcon data-icon="inline-start" />
            ChatGPT로 열기
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem onClick={onCopy}>
            <CopyIcon data-icon="inline-start" />
            Markdown 복사
          </DropdownMenuItem>
          <DropdownMenuItem onClick={onDownload}>
            <DownloadIcon data-icon="inline-start" />
            .md 파일로 저장
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
