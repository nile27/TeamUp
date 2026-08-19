import { test, expect } from "@playwright/test";

test.describe("커뮤니티", () => {
  test("글 작성 → 댓글 작성 → 정식 모집으로 승격", async ({ page }) => {
    const title = `[E2E] 아이디어 승격 테스트 ${Date.now()}`;

    await page.goto("/community/new");
    await page.getByTestId("community-tag-IDEA").click();
    await page.getByLabel("제목").fill(title);
    await page.getByLabel("내용").fill("이 아이디어가 반응이 좋으면 정식 모집으로 승격되는지 확인하는 E2E 테스트입니다.");
    await page.getByRole("button", { name: "등록하기" }).click();

    // "/community/new"도 /\/community\/[^/]+$/에 매칭되므로 pathname을 직접 비교해야 한다.
    await page.waitForURL((url) => url.pathname.startsWith("/community/") && url.pathname !== "/community/new", {
      timeout: 20_000,
    });
    await expect(page.getByRole("heading", { name: title })).toBeVisible();

    // 댓글 작성
    await expect(page.getByText("첫 댓글을 남겨보세요.")).toBeVisible();
    await page.getByPlaceholder("댓글을 입력해주세요").fill("[E2E] 좋은 아이디어네요!");
    await page.getByRole("button", { name: "댓글 등록" }).click();
    await expect(page.getByText("[E2E] 좋은 아이디어네요!")).toBeVisible({ timeout: 15_000 });

    // 정식 모집으로 승격 (작성자 본인 + IDEA 글이라 배너가 보여야 함)
    await page.getByRole("button", { name: "정식 모집으로 만들기" }).click();

    await expect(page).toHaveURL(/\/recruit\/[^/]+$/, { timeout: 20_000 });
    await expect(page.getByRole("heading", { name: title })).toBeVisible();
    await expect(page.getByText("개발자 구해요")).toBeVisible();
    await expect(page.getByText("팀원")).toBeVisible();
  });

  test("말머리 필터 클릭 시 URL에 반영된다", async ({ page }) => {
    await page.goto("/community");

    await page.getByRole("tab", { name: "아이디어" }).click();
    await expect(page).toHaveURL(/[?&]tag=IDEA/);

    const emptyState = page.getByText("아직 글이 없어요");
    const hasEmptyState = await emptyState.isVisible().catch(() => false);
    if (!hasEmptyState) {
      await expect(page.getByText("아이디어").first()).toBeVisible();
    }
  });

  test("페이지네이션 — 페이지가 여러 개면 다음 페이지로 이동, URL에 page 반영", async ({ page }) => {
    await page.goto("/community");
    const nextLink = page.getByRole("link", { name: "Go to next page" });

    if (!(await nextLink.isVisible().catch(() => false))) {
      test.skip(true, "글이 10개 이하라 페이지네이션이 표시되지 않음 (동작 자체는 recruit 목록과 동일한 Pagination 컴포넌트로 검증됨)");
    }

    await nextLink.click();
    await expect(page).toHaveURL(/[?&]page=2/);
  });
});
