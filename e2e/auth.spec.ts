import { test, expect } from "@playwright/test";
import { PASSWORD } from "./support/test-users";
import { signupAndLogin } from "./support/auth-helpers";

test.describe("인증", () => {
  test("회원가입 → 로그인 페이지 진입 (또는 자동 로그인)", async ({ page }) => {
    const email = `teamup.e2e.signup.${Date.now()}@gmail.com`;

    await page.goto("/signup");
    await page.getByLabel("이메일").fill(email);
    await page.getByLabel("닉네임").fill("E2E신규가입자");
    await page.getByLabel("비밀번호").fill(PASSWORD);
    await page.getByRole("button", { name: "회원가입" }).click();

    await page.waitForURL(/\/login/, { timeout: 15_000 });
    // Confirm email이 꺼져 있으면 signUp() 시점에 세션이 생기고, proxy.ts 미들웨어가
    // 이미 로그인된 사용자의 /login 접근을 "/"로 튕겨내 "회원가입 완료" 배너를 볼 새 없이
    // 곧장 로그인 상태가 된다. 켜져 있으면 /login에 남아 배너가 보인다.
    const dashboardLink = page.getByRole("link", { name: "마이페이지" });
    const autoLoggedIn = await dashboardLink
      .waitFor({ state: "visible", timeout: 15_000 })
      .then(() => true)
      .catch(() => false);

    if (autoLoggedIn) {
      await expect(dashboardLink).toBeVisible();
    } else {
      await expect(page).toHaveURL(/\/login\?signup=success/);
      await expect(page.getByText("회원가입이 완료되었습니다")).toBeVisible();
    }
  });

  test("로그아웃", async ({ page }) => {
    const user = {
      email: `teamup.e2e.logout.${Date.now()}@gmail.com`,
      password: PASSWORD,
      nickname: "E2E로그아웃",
    };

    await signupAndLogin(page, user);
    await expect(page.getByRole("link", { name: "마이페이지" })).toBeVisible();

    await page.getByRole("button", { name: "로그아웃" }).click();

    await expect(page).toHaveURL(/\/login$/, { timeout: 15_000 });
    await expect(page.getByRole("link", { name: "로그인" })).toBeVisible();
  });

  test("미로그인 상태에서 /recruit/new 접근 시 /login으로 리다이렉트", async ({ page }) => {
    await page.goto("/recruit/new");
    await expect(page).toHaveURL(/\/login$/, { timeout: 15_000 });
  });
});
