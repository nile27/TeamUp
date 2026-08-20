import { test, expect } from "@playwright/test";
import { signupAndLogin } from "./support/auth-helpers";
import { PASSWORD } from "./support/test-users";

test("프로필(자기소개·포트폴리오) 수정 → 마이페이지에 반영된다", async ({ page }) => {
  const user = {
    email: `teamup.e2e.profile.${Date.now()}@gmail.com`,
    password: PASSWORD,
    nickname: "E2E프로필",
  };
  await signupAndLogin(page, user);

  await page.goto("/dashboard/edit");
  await page.getByLabel("한 줄 자기소개").fill("[E2E] 테스트 자기소개입니다.");
  await page.getByLabel("포트폴리오 · 경력").fill("## 프로젝트\n- [E2E] 테스트 프로젝트");

  // 미리보기 탭에서 마크다운이 실제로 렌더링되는지 확인
  await page.getByText("미리보기", { exact: true }).click();
  await expect(page.getByRole("heading", { name: "프로젝트" })).toBeVisible();

  await page.getByText("작성", { exact: true }).click();
  await page.getByRole("button", { name: "저장하기" }).click();

  await page.waitForURL(/\/dashboard$/, { timeout: 15_000 });
  await expect(page.getByText("[E2E] 테스트 자기소개입니다.")).toBeVisible();
  await expect(page.getByRole("heading", { name: "프로젝트" })).toBeVisible();
});
