import { Page, expect } from "@playwright/test";

interface TestUser {
  email: string;
  password: string;
  nickname: string;
}

// 회원가입 → (필요 시) 로그인까지 마치고 로그인 상태로 만든다.
//
// src/proxy.ts 미들웨어가 "이미 로그인된 사용자가 /login·/signup 접근" 시 "/"로 튕겨낸다.
// Supabase "Confirm email"이 꺼져 있으면 signUp() 시점에 이미 세션이 생기므로, 회원가입
// 직후 /login으로 리다이렉트되자마자 미들웨어가 다시 "/"로 튕겨내며 자동 로그인 상태가 된다
// (이 경우 로그인 폼을 볼 필요조차 없음). 켜져 있으면 세션이 없어 /login에 남고, 수동
// 로그인을 시도해야 하며 "이메일 인증이 필요합니다" 에러가 뜨는 게 정상 — 이 경우 자동화가
// 불가능하므로 원인을 명확히 알려주는 에러로 실패시킨다.
export async function signupAndLogin(page: Page, user: TestUser) {
  await page.goto("/signup");
  await page.getByLabel("이메일").fill(user.email);
  await page.getByLabel("닉네임").fill(user.nickname);
  await page.getByLabel("비밀번호").fill(user.password);
  await page.getByRole("button", { name: "회원가입" }).click();

  await page.waitForURL(/\/login/, { timeout: 15_000 });

  // 미들웨어가 "/"로 튕겨내는 경우(Confirm email OFF → 이미 로그인 상태)를 최대 15초간 기다린다.
  // dev 서버 첫 컴파일 때문에 느릴 수 있어 넉넉히 잡음. 안 튕기면 /login에 그대로 남는다.
  const dashboardLink = page.getByRole("link", { name: "마이페이지" });
  const autoLoggedIn = await dashboardLink
    .waitFor({ state: "visible", timeout: 15_000 })
    .then(() => true)
    .catch(() => false);

  if (autoLoggedIn) {
    return;
  }

  await page.getByLabel("이메일").fill(user.email);
  await page.getByLabel("비밀번호").fill(user.password);
  await page.getByRole("button", { name: "로그인" }).click();

  const confirmRequired = page.getByText("이메일 인증이 필요합니다");
  const loggedIn = page.getByRole("link", { name: "마이페이지" });

  await Promise.race([
    loggedIn.waitFor({ state: "visible", timeout: 20_000 }).catch(() => undefined),
    confirmRequired.waitFor({ state: "visible", timeout: 20_000 }).catch(() => undefined),
  ]);

  if (await confirmRequired.isVisible().catch(() => false)) {
    throw new Error(
      `[E2E 세팅 실패] Supabase "Confirm email"이 켜져 있어 ${user.email} 로그인이 막혔습니다. ` +
      `Supabase 대시보드 → Authentication → Providers → Email → "Confirm email"을 끄고 다시 실행해주세요.`
    );
  }

  await expect(loggedIn).toBeVisible({ timeout: 20_000 });
}
