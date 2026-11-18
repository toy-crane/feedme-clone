import { Converter } from "@/components/converter/converter";
import { ThemeToggle } from "@/components/converter/theme-toggle";

export default function Home() {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-8 px-4 py-6 sm:px-6">
      <header className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-[15px] font-semibold tracking-tight">
          <span className="grid size-6 place-items-center rounded-md bg-primary font-mono text-[11px] text-primary-foreground">
            md
          </span>
          Feedme
        </div>
        <ThemeToggle />
      </header>
      <Converter />
    </main>
  );
}
