import { test, expect } from "@playwright/test";
import { signupAndLogin } from "./support/auth-helpers";
import { PASSWORD } from "./support/test-users";

// 작성자가 지원자를 확인·수락하고, 지원자가 그 결과를 자기 마이페이지에서 보는지까지 검증.
// 두 계정이 동시에 필요해서 별도 브라우저 컨텍스트 2개를 이 테스트 안에서 직접 만든다
// (setup 프로젝트의 storageState는 재사용하지 않음 — 프로젝트 간 실행 순서에 기대지 않기 위해).
test("모집 작성자가 지원자를 수락하면 지원자 마이페이지에도 반영된다", async ({ browser }) => {
  test.setTimeout(90_000); // 회원가입 2회 + 모집 작성 + 지원 + 수락까지 한 테스트에서 처리
  const ts = Date.now();
  const author = { email: `teamup.e2e.appmgmt-a.${ts}@gmail.com`, password: PASSWORD, nickname: "E2E관리자A" };
  const applicant = { email: `teamup.e2e.appmgmt-b.${ts}@gmail.com`, password: PASSWORD, nickname: "E2E관리자B" };

  const authorContext = await browser.newContext();
  const authorPage = await authorContext.newPage();
  await signupAndLogin(authorPage, author);

  await authorPage.goto("/recruit/new");
  await authorPage.getByTestId("recruit-type-DEV").click();
  await authorPage.getByLabel("제목").fill("[E2E] 지원자 관리 테스트 모집");
  await authorPage.getByLabel("소개").fill("지원자 수락/거절 플로우를 검증하는 모집글입니다.");
  await authorPage.getByPlaceholder("역할명 (예: 프론트엔드)").first().fill("백엔드");
  await authorPage.getByRole("button", { name: "모집글 등록하기" }).click();
  await authorPage.waitForURL(
    (url) => url.pathname.startsWith("/recruit/") && url.pathname !== "/recruit/new",
    { timeout: 20_000 }
  );
  const recruitUrl = authorPage.url();

  const applicantContext = await browser.newContext();
  const applicantPage = await applicantContext.newPage();
  await signupAndLogin(applicantPage, applicant);
  await applicantPage.goto(recruitUrl);
  await applicantPage.getByPlaceholder("지원 메시지 (선택)").fill("[E2E] 수락 플로우 지원");
  await applicantPage.getByRole("button", { name: "지원하기" }).click();
  await expect(applicantPage.getByRole("button", { name: "지원 완료" })).toBeVisible({ timeout: 15_000 });

  // 작성자: 상세 페이지 ApplyBar에서 지원자 확인 페이지로 진입 (Base UI Button+Link라 role=button)
  await authorPage.goto(recruitUrl);
  await authorPage.getByRole("button", { name: /지원자 확인하기/ }).click();
  await authorPage.waitForURL(/\/applicants$/, { timeout: 15_000 });
  await expect(authorPage.getByText("E2E관리자B")).toBeVisible();
  await expect(authorPage.getByText("[E2E] 수락 플로우 지원")).toBeVisible();

  // updateApplicationStatus는 같은 /applicants URL로 redirect하므로 waitForURL로는
  // 실제 반영 시점을 못 잡음 — 상태 텍스트가 바뀌는 것 자체를 기다린다.
  await authorPage.getByRole("button", { name: "수락하기" }).click();
  await expect(authorPage.getByText("수락됨")).toBeVisible({ timeout: 15_000 });
  await expect(authorPage.getByRole("button", { name: "수락하기" })).not.toBeVisible();

  // 지원자: 마이페이지 "지원한 모집"에 결과가 반영됐는지 확인
  await applicantPage.goto("/dashboard");
  await applicantPage.getByRole("tab", { name: /지원한 모집/ }).click();
  await expect(applicantPage.getByText("수락됨")).toBeVisible({ timeout: 15_000 });

  await authorContext.close();
  await applicantContext.close();
});
