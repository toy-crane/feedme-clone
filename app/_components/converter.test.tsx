import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { ConversionResult } from "@/features/conversion";

const convertUrl = vi.fn<(input: string) => Promise<ConversionResult>>();
vi.mock("@/features/conversion/convert-url", () => ({
  convertUrl: (input: string) => convertUrl(input),
}));

import { Converter } from "./converter";

const ARTICLE = {
  url: "https://defuddle.md/docs",
  title: "Documentation · Defuddle",
  author: "kepano",
  site: "defuddle.md",
  wordCount: 1352,
  markdown: "## Installation\n\nRun `npm install defuddle`.\n\n> Use the markdown option.",
};

async function convert(url: string) {
  const user = userEvent.setup();
  render(<Converter />);
  await user.type(screen.getByLabelText("변환할 페이지 URL"), url);
  await user.click(screen.getByRole("button", { name: "Markdown으로 변환" }));
  return user;
}

beforeEach(() => {
  convertUrl.mockReset();
});

describe("Converter", () => {
  it("변환하면 제목, 저자·사이트·단어 수, 렌더링된 Markdown 본문을 보여 준다", async () => {
    convertUrl.mockResolvedValue({ ok: true, article: ARTICLE });

    await convert("https://defuddle.md/docs");

    const article = await screen.findByRole("article");
    expect(within(article).getByRole("heading", { level: 2, name: "Documentation · Defuddle" })).toBeInTheDocument();
    expect(within(article).getByText("kepano")).toBeInTheDocument();
    expect(within(article).getByText("defuddle.md")).toBeInTheDocument();
    expect(within(article).getByText("1,352 단어")).toBeInTheDocument();
    expect(within(article).getByRole("heading", { level: 2, name: "Installation" })).toBeInTheDocument();
    expect(within(article).getByText("npm install defuddle").tagName).toBe("CODE");
    expect(convertUrl).toHaveBeenCalledWith("https://defuddle.md/docs");
  });

  it("저자가 비어 있으면 저자 자리를 그리지 않는다", async () => {
    convertUrl.mockResolvedValue({
      ok: true,
      article: { ...ARTICLE, author: "", site: "paulgraham.com", title: "How to Do Great Work" },
    });

    await convert("https://paulgraham.com/greatwork.html");

    const meta = await screen.findByTestId("article-meta");
    expect(Array.from(meta.children).map((el) => el.textContent)).toEqual([
      "paulgraham.com",
      "1,352 단어",
    ]);
  });

  it("변환 중에는 로딩 상태를 보여 주고 변환 버튼을 다시 누를 수 없다", async () => {
    let resolve!: (r: ConversionResult) => void;
    convertUrl.mockReturnValue(new Promise((r) => (resolve = r)));

    const user = await convert("https://defuddle.md/docs");

    const button = screen.getByRole("button", { name: "Markdown으로 변환" });
    expect(button).toBeDisabled();
    expect(screen.getByTestId("conversion-loading")).toBeInTheDocument();
    await user.click(button);
    expect(convertUrl).toHaveBeenCalledTimes(1);

    resolve({ ok: true, article: ARTICLE });
    await screen.findByRole("article");
    expect(button).toBeEnabled();
  });

  it("http(s) 형식이 아닌 입력은 요청 없이 입력칸 아래에 형식 오류를 보여 준다", async () => {
    await convert("defuddle 문서");

    expect(
      screen.getByText("http:// 또는 https://로 시작하는 웹 페이지 주소를 입력해 주세요.")
    ).toBeInTheDocument();
    expect(screen.getByLabelText("변환할 페이지 URL")).toHaveAttribute("aria-invalid", "true");
    expect(convertUrl).not.toHaveBeenCalled();
  });

  it("이전 변환 결과나 오류가 있어도 형식이 틀린 입력으로 다시 변환하면 이전 내용은 사라진다", async () => {
    convertUrl.mockResolvedValue({ ok: false, error: { kind: "fetch-failed", host: "www.nytimes.com", status: 403 } });
    const user = await convert("https://www.nytimes.com/a");
    await screen.findByRole("alert");

    const input = screen.getByLabelText("변환할 페이지 URL");
    await user.clear(input);
    await user.type(input, "defuddle 문서");
    await user.click(screen.getByRole("button", { name: "Markdown으로 변환" }));

    expect(screen.queryByText("페이지를 가져오지 못했습니다")).not.toBeInTheDocument();
    expect(screen.getByText("http:// 또는 https://로 시작하는 웹 페이지 주소를 입력해 주세요.")).toBeInTheDocument();
  });

  it("가져오기에 실패하면 사이트와 사유를 담은 오류를 보여 주고 결과는 보여 주지 않는다", async () => {
    convertUrl.mockResolvedValue({
      ok: false,
      error: { kind: "fetch-failed", host: "www.nytimes.com", status: 403 },
    });

    await convert("https://www.nytimes.com/a");

    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent("페이지를 가져오지 못했습니다");
    expect(alert).toHaveTextContent("www.nytimes.com");
    expect(alert).toHaveTextContent("HTTP 403");
    expect(screen.queryByRole("article")).not.toBeInTheDocument();
  });

  it("본문이 비어 있으면 본문 없음 오류를 보여 준다", async () => {
    convertUrl.mockResolvedValue({ ok: false, error: { kind: "empty-content" } });

    await convert("https://app.example.com/dashboard");

    expect(await screen.findByRole("alert")).toHaveTextContent("본문을 찾지 못했습니다");
  });

  it("지우기 버튼은 입력과 결과를 모두 지워 첫 화면으로 돌아간다", async () => {
    convertUrl.mockResolvedValue({ ok: true, article: ARTICLE });
    const user = await convert("https://defuddle.md/docs");
    await screen.findByRole("article");

    await user.click(screen.getByRole("button", { name: "입력 지우기" }));

    expect(screen.getByLabelText("변환할 페이지 URL")).toHaveValue("");
    expect(screen.queryByRole("article")).not.toBeInTheDocument();
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "입력 지우기" })).not.toBeInTheDocument();
    expect(screen.getByText("변환 결과가 여기에 나타납니다.")).toBeInTheDocument();
  });

  it("변환 중에 지우기를 눌렀다면 늦게 도착한 결과는 화면에 나타나지 않는다", async () => {
    let resolve!: (r: ConversionResult) => void;
    convertUrl.mockReturnValue(new Promise((r) => (resolve = r)));
    const user = await convert("https://defuddle.md/docs");

    await user.click(screen.getByRole("button", { name: "입력 지우기" }));
    resolve({ ok: true, article: ARTICLE });

    await waitFor(() => expect(screen.getByRole("button", { name: "Markdown으로 변환" })).toBeEnabled());
    expect(screen.queryByRole("article")).not.toBeInTheDocument();
    expect(screen.getByLabelText("변환할 페이지 URL")).toHaveValue("");
    expect(screen.getByText("변환 결과가 여기에 나타납니다.")).toBeInTheDocument();
  });

  it("지우기 버튼은 오류도 지운다", async () => {
    const user = await convert("not a url");
    await user.click(screen.getByRole("button", { name: "입력 지우기" }));

    await waitFor(() =>
      expect(
        screen.queryByText("http:// 또는 https://로 시작하는 웹 페이지 주소를 입력해 주세요.")
      ).not.toBeInTheDocument()
    );
  });
});
