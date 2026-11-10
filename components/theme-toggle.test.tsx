import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ThemeProvider } from "next-themes";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { ThemeToggle } from "./theme-toggle";

function stubSystemTheme(prefersDark: boolean) {
  vi.stubGlobal(
    "matchMedia",
    vi.fn((query: string) => ({
      matches: query.includes("dark") ? prefersDark : false,
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
    }))
  );
}

function renderToggle() {
  return render(
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <ThemeToggle />
    </ThemeProvider>
  );
}

beforeEach(() => {
  localStorage.clear();
  document.documentElement.className = "";
  vi.unstubAllGlobals();
});

describe("ThemeToggle", () => {
  it("토글을 누르면 어두운 테마로 바뀌고, 다시 누르면 밝은 테마로 돌아온다", async () => {
    stubSystemTheme(false);
    const user = userEvent.setup();
    renderToggle();

    await user.click(await screen.findByRole("button", { name: "다크 모드 전환" }));
    expect(document.documentElement).toHaveClass("dark");

    await user.click(screen.getByRole("button", { name: "다크 모드 전환" }));
    expect(document.documentElement).not.toHaveClass("dark");
  });

  it("처음에는 시스템 설정을 따른다", async () => {
    stubSystemTheme(true);
    renderToggle();

    await screen.findByRole("button", { name: "다크 모드 전환" });
    expect(document.documentElement).toHaveClass("dark");
  });

  it("사용자가 고른 값은 같은 브라우저에서 다시 열어도 유지된다", async () => {
    stubSystemTheme(false);
    const user = userEvent.setup();
    const first = renderToggle();
    await user.click(await screen.findByRole("button", { name: "다크 모드 전환" }));
    first.unmount();
    document.documentElement.className = "";

    renderToggle();

    await screen.findByRole("button", { name: "다크 모드 전환" });
    expect(document.documentElement).toHaveClass("dark");
  });
});
