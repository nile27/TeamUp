import { test as setup, expect } from "@playwright/test";
import fs from "fs";
import path from "path";
import { USER_A, USER_B } from "./support/test-users";
import { signupAndLogin } from "./support/auth-helpers";

const authDir = path.join(__dirname, ".auth");

setup.beforeAll(() => {
  fs.mkdirSync(authDir, { recursive: true });
});

setup("authenticate author A + create fixture recruit", async ({ page }) => {
  await signupAndLogin(page, USER_A);

  // 지원(apply) 테스트가 쓸 고정 모집글을 A 계정으로 미리 만들어둔다.
  await page.goto("/recruit/new");
  await page.getByTestId("recruit-type-DEV").click();
  await page.getByLabel("제목").fill("[E2E] 지원 테스트용 고정 모집글");
  await page.getByLabel("소개").fill("Playwright E2E 테스트가 지원(apply) 플로우를 검증하기 위해 만든 고정 모집글입니다.");
  await page.getByPlaceholder("역할명 (예: 프론트엔드)").first().fill("백엔드");
  await page.getByRole("button", { name: "모집글 등록하기" }).click();

  // "/recruit/new"도 /\/recruit\/[^/]+$/에 매칭되므로 pathname을 직접 비교해야 한다.
  await page.waitForURL((url) => url.pathname.startsWith("/recruit/") && url.pathname !== "/recruit/new", {
    timeout: 20_000,
  });

  fs.writeFileSync(
    path.join(authDir, "recruit.json"),
    JSON.stringify({ url: page.url(), id: page.url().split("/").pop() })
  );

  await page.context().storageState({ path: path.join(authDir, "a.json") });
});

setup("authenticate applicant B", async ({ page }) => {
  await signupAndLogin(page, USER_B);
  await page.context().storageState({ path: path.join(authDir, "b.json") });
});
