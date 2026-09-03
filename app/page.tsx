import { Converter } from "@/features/conversion"

import { ThemeToggle } from "@/components/theme-toggle"

export default function Home() {
  return (
    <main className="flex-1">
      <div className="mx-auto flex w-full max-w-2xl items-center justify-between px-4 py-5">
        <div className="flex items-center gap-2 text-[15px] font-medium tracking-tight">
          <span
            aria-hidden
            className="grid size-6 place-items-center rounded-md bg-primary text-xs text-primary-foreground"
          >
            f
          </span>
          feedme
        </div>
        <ThemeToggle />
      </div>
      <Converter />
    </main>
  )
}
