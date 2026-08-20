import { test, expect } from "@playwright/test";

test("모집글 작성 — 구조화 폼 채울수록 완성도 게이지 상승, 저장 후 상세로 이동", async ({ page }) => {
  await page.goto("/recruit/new");

  await expect(page.getByText("0%", { exact: true })).toBeVisible();

  await page.getByTestId("recruit-type-PLAN").click();
  await page.getByLabel("제목").fill("[E2E] 완성도 게이지 검증용 모집글");
  await page.getByLabel("소개").fill("완성도 게이지가 구조화 폼 입력에 따라 올라가는지 확인하는 E2E 테스트입니다.");
  await page.getByPlaceholder("역할명 (예: 프론트엔드)").first().fill("기획");

  // 기술스택은 자유 텍스트가 아니라 프리셋에서 클릭으로 선택
  await page.getByText("Figma", { exact: true }).click();

  await page.getByLabel("어떤 문제를 겪었나요?").fill("사이드프로젝트 팀원을 구하기 어려웠어요.");
  await expect(page.getByText("25%", { exact: true })).toBeVisible();

  await page.getByLabel("누가 어떤 상황에 쓰나요?").fill("아이디어는 있지만 개발을 못 하는 기획자.");
  await expect(page.getByText("50%", { exact: true })).toBeVisible();

  await page.getByLabel("꼭 필요한 기능 3가지는?").fill("매칭, 모집글 작성, 지원/수락");
  await expect(page.getByText("75%", { exact: true })).toBeVisible();

  await page.getByLabel("비슷한 앱/사이트가 있다면?").fill("https://example.com");
  await expect(page.getByText("100%", { exact: true })).toBeVisible();

  await page.getByRole("button", { name: "모집글 등록하기" }).click();

  // "/recruit/new"도 /\/recruit\/[^/]+$/에 매칭되므로 pathname을 직접 비교해야 한다.
  await page.waitForURL((url) => url.pathname.startsWith("/recruit/") && url.pathname !== "/recruit/new", {
    timeout: 20_000,
  });
  await expect(page.getByRole("heading", { name: "[E2E] 완성도 게이지 검증용 모집글" })).toBeVisible();
  await expect(page.getByText("기획자 구해요")).toBeVisible();
  await expect(page.getByText("Figma")).toBeVisible();
  await expect(page.getByText("100%", { exact: true })).toBeVisible();
});

test("모집글 작성 → 수정 → 변경 내용이 상세에 반영된다", async ({ page }) => {
  const title = `[E2E] 수정 전 모집글 ${Date.now()}`;
  const editedTitle = `[E2E] 수정 후 모집글 ${Date.now()}`;

  await page.goto("/recruit/new");
  await page.getByTestId("recruit-type-DEV").click();
  await page.getByLabel("제목").fill(title);
  await page.getByLabel("소개").fill("수정 전 소개입니다.");
  await page.getByPlaceholder("역할명 (예: 프론트엔드)").first().fill("백엔드");
  await page.getByRole("button", { name: "모집글 등록하기" }).click();

  await page.waitForURL((url) => url.pathname.startsWith("/recruit/") && url.pathname !== "/recruit/new", {
    timeout: 20_000,
  });
  await expect(page.getByRole("heading", { name: title })).toBeVisible();

  await page.getByRole("button", { name: "수정" }).click();
  await page.waitForURL(/\/edit$/, { timeout: 15_000 });
  await expect(page.getByLabel("제목")).toHaveValue(title);

  await page.getByLabel("제목").fill(editedTitle);
  await page.getByLabel("소개").fill("수정 후 소개입니다.");
  await page.getByRole("button", { name: "모집글 수정하기" }).click();

  await page.waitForURL((url) => url.pathname.startsWith("/recruit/") && !url.pathname.endsWith("/edit"), {
    timeout: 20_000,
  });
  await expect(page.getByRole("heading", { name: editedTitle })).toBeVisible();
  await expect(page.getByText("수정 후 소개입니다.")).toBeVisible();
});
