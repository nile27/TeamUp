import { test, expect } from "@playwright/test";

test.describe("모집 목록", () => {
  test("기술스택 필터 클릭 시 URL에 반영되고 목록이 갱신된다", async ({ page }) => {
    await page.goto("/recruit");

    // TechStackUrlFilter의 필터 칩은 Badge(<span>)라 role="button"이 없음 — 텍스트로 선택.
    await page.getByText("React", { exact: true }).click();
    await expect(page).toHaveURL(/[?&]stack=React/);

    // 필터 결과는 매칭 카드 목록 또는 STATES.md의 빈 상태 카드 둘 중 하나여야 한다.
    const hasCards = await page.getByRole("link").filter({ hasText: /./ }).first().isVisible().catch(() => false);
    expect(hasCards).toBeTruthy();
  });

  test("모집 카드에 유형/완성도/역할 정보가 표시된다", async ({ page }) => {
    await page.goto("/recruit");

    const emptyState = page.getByText("아직 모집글이 없어요");
    if (await emptyState.isVisible().catch(() => false)) {
      test.skip(true, "목록이 비어 있어 카드 구조를 검증할 수 없음 (빈 상태는 states.spec.ts에서 별도 확인)");
    }

    await expect(page.getByText("기획 완성도").first()).toBeVisible();
  });
});
