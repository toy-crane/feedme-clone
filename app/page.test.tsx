import { render, screen } from "@testing-library/react";
import { expect, test, vi } from "vitest";

vi.mock("@/features/conversion/convert-url", () => ({ convertUrl: vi.fn() }));
vi.mock("next-themes", () => ({ useTheme: () => ({ resolvedTheme: "light", setTheme: vi.fn() }) }));

import Home from "@/app/page";

test("홈 화면은 URL 입력칸과 변환 버튼, 다크 모드 토글을 보여 준다", () => {
  render(<Home />);

  expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("웹 페이지를 Markdown으로");
  expect(screen.getByLabelText("변환할 페이지 URL")).toBeInTheDocument();
  expect(screen.getByRole("button", { name: "Markdown으로 변환" })).toBeEnabled();
  expect(screen.getByRole("button", { name: "다크 모드 전환" })).toBeInTheDocument();
  expect(screen.getByText("변환 결과가 여기에 나타납니다.")).toBeInTheDocument();
});
