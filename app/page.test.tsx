import { render, screen } from "@testing-library/react";
import { expect, test } from "vitest";

import Home from "@/app/page";

test("홈 화면은 주소 입력과 빈 상태를 보여준다", () => {
  render(<Home />);

  expect(screen.getByLabelText("웹페이지 주소")).toBeInTheDocument();
  expect(screen.getByRole("button", { name: "변환" })).toBeInTheDocument();
  expect(screen.getByText("아직 변환한 문서가 없습니다")).toBeInTheDocument();
});
