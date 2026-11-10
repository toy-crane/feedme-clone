"use client";

import { MoonIcon, SunIcon } from "lucide-react";
import { useTheme } from "next-themes";

import { Button } from "@/components/ui/button";

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label="다크 모드 전환"
      title="다크 모드 전환"
      onClick={() => setTheme(isDark ? "light" : "dark")}
    >
      {/* 서버는 테마를 모르므로 두 아이콘을 모두 그리고 CSS로 고른다(깜박임 방지). */}
      <MoonIcon className="dark:hidden" />
      <SunIcon className="hidden dark:block" />
    </Button>
  );
}
