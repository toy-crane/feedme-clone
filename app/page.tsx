import { ThemeToggle } from "@/components/theme-toggle";

import { Converter } from "./_components/converter";

export default function Home() {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-4 py-4 sm:px-6">
      <header className="flex items-center justify-between py-2">
        <div className="flex items-center gap-2 text-base font-semibold tracking-tight">
          <span className="grid size-[22px] place-items-center rounded-md bg-primary font-mono text-xs text-primary-foreground">
            md
          </span>
          feedme
        </div>
        <ThemeToggle />
      </header>
      <Converter />
    </main>
  );
}
