import { expect, test } from "@playwright/test";

test("홈 화면이 열리고 URL 입력칸이 보인다", async ({ page }) => {
  await page.goto("/");

  await expect(page).toHaveTitle(/Feedme/);
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "Markdown"
  );
  await expect(page.getByLabel("페이지 URL")).toBeVisible();
});
