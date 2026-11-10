import { expect, test } from "@playwright/test";

test("홈 화면이 열리고 URL 입력칸이 보인다", async ({ page }) => {
  await page.goto("/");

  await expect(page).toHaveTitle(/feedme/);
  await expect(page.getByLabel("변환할 페이지 URL")).toBeVisible();
});
