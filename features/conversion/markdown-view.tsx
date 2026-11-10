import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import { cn } from "@/lib/utils";

export function MarkdownView({ markdown, className }: { markdown: string; className?: string }) {
  return (
    <div
      className={cn(
        "text-[15px] leading-7 break-words",
        "[&_h1]:mt-8 [&_h1]:mb-3 [&_h1]:text-xl [&_h1]:font-semibold",
        "[&_h2]:mt-7 [&_h2]:mb-2 [&_h2]:text-lg [&_h2]:font-semibold",
        "[&_h3]:mt-5 [&_h3]:mb-1.5 [&_h3]:text-base [&_h3]:font-semibold",
        "[&_p]:my-3 [&_ul]:my-3 [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:my-3 [&_ol]:list-decimal [&_ol]:pl-6",
        "[&_a]:underline [&_a]:underline-offset-4",
        "[&_blockquote]:my-4 [&_blockquote]:border-l-4 [&_blockquote]:border-border [&_blockquote]:pl-4 [&_blockquote]:text-muted-foreground",
        "[&_code]:rounded [&_code]:bg-muted [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-[0.875em]",
        "[&_pre]:my-4 [&_pre]:overflow-x-auto [&_pre]:rounded-lg [&_pre]:bg-muted [&_pre]:p-3.5 [&_pre_code]:bg-transparent [&_pre_code]:p-0",
        "[&_img]:my-4 [&_img]:h-auto [&_img]:max-w-full [&_table]:my-4 [&_table]:block [&_table]:overflow-x-auto",
        "[&_th]:border [&_th]:px-2 [&_th]:py-1 [&_td]:border [&_td]:px-2 [&_td]:py-1",
        className
      )}
    >
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{markdown}</ReactMarkdown>
    </div>
  );
}
