import { expect, test } from "@playwright/test";

test("홈 화면이 열리고 변환 전 빈 상태를 보여준다", async ({ page }) => {
  await page.goto("/");

  await expect(page).toHaveTitle("feedme");
  await expect(page.getByLabel("웹페이지 주소")).toBeVisible();
  await expect(page.getByText("아직 변환한 문서가 없습니다")).toBeVisible();
});

test("주소 형식이 아니면 형식 문제를 알리고 변환하지 않는다", async ({ page }) => {
  await page.goto("/");

  await page.getByLabel("웹페이지 주소").fill("react.dev 문서");
  await page.getByRole("button", { name: "변환" }).click();

  await expect(page.getByText("주소 형식이 아닙니다")).toBeVisible();
  await expect(page.getByRole("heading", { level: 1 })).toHaveCount(0);
});

test("지우기를 누르면 처음 상태로 돌아간다", async ({ page }) => {
  await page.goto("/");

  const field = page.getByLabel("웹페이지 주소");
  await field.fill("react.dev 문서");
  await page.getByRole("button", { name: "변환" }).click();
  await expect(page.getByText("주소 형식이 아닙니다")).toBeVisible();

  await page.getByRole("button", { name: "지우기" }).click();

  await expect(field).toHaveValue("");
  await expect(page.getByText("주소 형식이 아닙니다")).toHaveCount(0);
  await expect(page.getByText("아직 변환한 문서가 없습니다")).toBeVisible();
});
