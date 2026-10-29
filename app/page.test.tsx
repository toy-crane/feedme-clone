import { render, screen } from "@testing-library/react";
import { expect, test } from "vitest";

import Home from "@/app/page";

test("홈 화면은 URL 입력 폼과 변환 버튼을 보여준다", () => {
  render(<Home />);

  expect(
    screen.getByRole("heading", { level: 1, name: /웹 페이지를 읽기 좋은 Markdown으로/ })
  ).toBeInTheDocument();
  expect(screen.getByLabelText("웹 페이지 주소")).toBeInTheDocument();
  expect(screen.getByRole("button", { name: "변환하기" })).toBeInTheDocument();
});
