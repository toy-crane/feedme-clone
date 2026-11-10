import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { Article, ConversionResult } from "@/features/conversion";

const convertUrl = vi.fn<(input: string) => Promise<ConversionResult>>();
vi.mock("@/features/conversion/convert-url", () => ({
  convertUrl: (input: string) => convertUrl(input),
}));

const toast = vi.hoisted(() => Object.assign(vi.fn(), { success: vi.fn(), info: vi.fn(), error: vi.fn() }));
vi.mock("sonner", () => ({ toast, Toaster: () => null }));

import { Converter } from "./converter";

const ARTICLE: Article = {
  url: "https://defuddle.md/docs",
  title: "Documentation Defuddle",
  author: "kepano",
  site: "defuddle.md",
  wordCount: 10,
  markdown: "## Installation\n\nRun it.",
};
const EXPORT_TEXT = "# Documentation Defuddle\n\n출처: https://defuddle.md/docs (kepano)\n\n## Installation\n\nRun it.";

let openSpy: ReturnType<typeof vi.spyOn>;
let clickedDownloads: { download: string; href: string }[];

beforeEach(() => {
  convertUrl.mockReset();
  Object.values(toast).forEach((fn) => typeof fn === "function" && "mockReset" in fn && fn.mockReset());
  openSpy = vi.spyOn(window, "open").mockReturnValue(null);
  clickedDownloads = [];
  vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(function (this: HTMLAnchorElement) {
    clickedDownloads.push({ download: this.download, href: this.href });
  });
  URL.createObjectURL = vi.fn(() => "blob:mock");
  URL.revokeObjectURL = vi.fn();
});

afterEach(() => {
  vi.restoreAllMocks();
});

async function showResult(article: Article = ARTICLE) {
  convertUrl.mockResolvedValue({ ok: true, article });
  const user = userEvent.setup();
  render(<Converter />);
  await user.type(screen.getByLabelText("변환할 페이지 URL"), article.url);
  await user.click(screen.getByRole("button", { name: "Markdown으로 변환" }));
  await screen.findByRole("article");
  return user;
}

describe("내보내기", () => {
  it("Markdown 복사는 내보내기 텍스트를 클립보드에 넣고 알림을 띄운다", async () => {
    const user = await showResult();

    await user.click(screen.getByRole("button", { name: "Markdown 복사" }));

    expect(await navigator.clipboard.readText()).toBe(EXPORT_TEXT);
    expect(toast.success).toHaveBeenCalledWith("Markdown을 클립보드에 복사했습니다.");
  });

  it(".md 다운로드는 제목에서 만든 파일 이름으로 내려받고 알림을 띄운다", async () => {
    const user = await showResult();

    await user.click(screen.getByRole("button", { name: ".md 다운로드" }));

    expect(clickedDownloads).toHaveLength(1);
    expect(clickedDownloads[0].download).toBe("Documentation-Defuddle.md");
    const blob = vi.mocked(URL.createObjectURL).mock.calls[0][0] as Blob;
    expect(blob.type).toContain("text/markdown");
    expect(await blob.text()).toBe(EXPORT_TEXT);
    expect(toast.success).toHaveBeenCalledWith("Documentation-Defuddle.md 파일을 내려받았습니다.");
  });

  it("프롬프트를 고르지 않고 열면 내보내기 텍스트만 ChatGPT 주소에 담긴다", async () => {
    const user = await showResult();

    await user.click(screen.getByRole("button", { name: "ChatGPT로 열기" }));

    const [url, target] = openSpy.mock.calls[0] as [string, string];
    expect(target).toBe("_blank");
    expect(new URL(url).searchParams.get("q")).toBe(EXPORT_TEXT);
  });

  it("프리셋을 고르면 프롬프트가 본문 앞에 붙고, 같은 칩을 다시 누르면 선택이 풀린다", async () => {
    const user = await showResult();
    const chip = screen.getByRole("button", { name: "한국어로 번역해줘" });

    await user.click(chip);
    expect(chip).toHaveAttribute("aria-pressed", "true");
    await user.click(screen.getByRole("button", { name: "Claude로 열기" }));
    const [url] = openSpy.mock.calls[0] as [string];
    expect(new URL(url).origin + new URL(url).pathname).toBe("https://claude.ai/new");
    expect(new URL(url).searchParams.get("q")).toBe(`한국어로 번역해줘\n\n${EXPORT_TEXT}`);

    await user.click(chip);
    expect(chip).toHaveAttribute("aria-pressed", "false");
    await user.click(screen.getByRole("button", { name: "Claude로 열기" }));
    expect(new URL((openSpy.mock.calls[1] as [string])[0]).searchParams.get("q")).toBe(EXPORT_TEXT);
  });

  it("프리셋은 한 번에 하나만 선택된다", async () => {
    const user = await showResult();

    await user.click(screen.getByRole("button", { name: "요약해줘" }));
    await user.click(screen.getByRole("button", { name: "쉽게 설명해줘" }));

    expect(screen.getByRole("button", { name: "요약해줘" })).toHaveAttribute("aria-pressed", "false");
    expect(screen.getByRole("button", { name: "쉽게 설명해줘" })).toHaveAttribute("aria-pressed", "true");
  });

  it("직접 입력을 고르면 입력칸이 나타나고, 입력한 문장이 프롬프트로 붙는다", async () => {
    const user = await showResult();
    expect(screen.queryByLabelText("직접 입력한 프롬프트")).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "직접 입력" }));
    await user.type(screen.getByLabelText("직접 입력한 프롬프트"), "핵심만 3줄로");
    await user.click(screen.getByRole("button", { name: "ChatGPT로 열기" }));

    expect(new URL((openSpy.mock.calls[0] as [string])[0]).searchParams.get("q")).toBe(`핵심만 3줄로\n\n${EXPORT_TEXT}`);
  });

  it("직접 입력을 골랐지만 칸이 비어 있으면 프롬프트 없이 전달한다", async () => {
    const user = await showResult();

    await user.click(screen.getByRole("button", { name: "직접 입력" }));
    await user.click(screen.getByRole("button", { name: "Claude로 열기" }));

    expect(new URL((openSpy.mock.calls[0] as [string])[0]).searchParams.get("q")).toBe(EXPORT_TEXT);
  });

  it("다른 프리셋으로 바꾸면 직접 입력 칸이 사라지고 내용도 남지 않는다", async () => {
    const user = await showResult();
    await user.click(screen.getByRole("button", { name: "직접 입력" }));
    await user.type(screen.getByLabelText("직접 입력한 프롬프트"), "임시 지시");

    await user.click(screen.getByRole("button", { name: "요약해줘" }));
    await user.click(screen.getByRole("button", { name: "직접 입력" }));

    expect(screen.getByLabelText("직접 입력한 프롬프트")).toHaveValue("");
  });

  it("글이 길어 주소에 담을 수 없으면 전체를 클립보드에 복사하고 빈 대화를 열며 안내한다", async () => {
    const long = { ...ARTICLE, markdown: "가".repeat(6000) };
    const user = await showResult(long);

    await user.click(screen.getByRole("button", { name: "요약해줘" }));
    await user.click(screen.getByRole("button", { name: "Claude로 열기" }));

    expect(openSpy).toHaveBeenCalledWith("https://claude.ai/new", "_blank");
    const copied = await navigator.clipboard.readText();
    expect(copied.startsWith("요약해줘\n\n# Documentation Defuddle")).toBe(true);
    expect(copied.endsWith("가".repeat(6000))).toBe(true);
    expect(toast.info).toHaveBeenCalledWith(
      expect.stringContaining("Claude"),
      expect.objectContaining({ description: expect.stringContaining("붙여 넣") })
    );
  });

  it("새 URL을 변환하면 프롬프트 선택과 직접 입력 내용이 초기화된다", async () => {
    const user = await showResult();
    await user.click(screen.getByRole("button", { name: "직접 입력" }));
    await user.type(screen.getByLabelText("직접 입력한 프롬프트"), "임시 지시");

    convertUrl.mockResolvedValue({ ok: true, article: { ...ARTICLE, url: "https://other.example/a" } });
    const input = screen.getByLabelText("변환할 페이지 URL");
    await user.clear(input);
    await user.type(input, "https://other.example/a");
    await user.click(screen.getByRole("button", { name: "Markdown으로 변환" }));
    await screen.findByRole("article");

    for (const name of ["요약해줘", "한국어로 번역해줘", "쉽게 설명해줘", "직접 입력"]) {
      expect(screen.getByRole("button", { name })).toHaveAttribute("aria-pressed", "false");
    }
    expect(screen.queryByLabelText("직접 입력한 프롬프트")).not.toBeInTheDocument();
  });
});
