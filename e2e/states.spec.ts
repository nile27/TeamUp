import { test, expect } from "@playwright/test";

test.describe("존재하지 않는 리소스", () => {
  test("존재하지 않는 /recruit/[id]는 404 안내를 보여준다", async ({ page }) => {
    await page.goto("/recruit/does-not-exist-xyz");
    await expect(page.getByRole("heading", { name: "모집글을 찾을 수 없어요" })).toBeVisible();
    // Base UI Button은 <a>로 렌더링돼도 useButton()이 role="button"을 강제 부여함(의도된 동작).
    await expect(page.getByRole("button", { name: "목록으로 돌아가기" })).toBeVisible();
  });

  test("존재하지 않는 /community/[id]는 404 안내를 보여준다", async ({ page }) => {
    await page.goto("/community/does-not-exist-xyz");
    await expect(page.getByRole("heading", { name: "글을 찾을 수 없어요" })).toBeVisible();
  });
});

test.describe("폼 검증", () => {
  test("모집 작성 — 타이핑 중엔 에러 없음, 블러/제출 시 필드 에러 표시", async ({ page }) => {
    await page.goto("/recruit/new");

    const title = page.getByLabel("제목");
    await title.click();
    await title.type("a");
    // 타이핑 중엔 에러 문구가 뜨지 않아야 함
    await expect(page.getByText("제목을 입력해주세요.")).not.toBeVisible();

    await title.fill("");
    await page.getByLabel("소개").click(); // blur title
    await expect(page.getByText("제목을 입력해주세요.")).toBeVisible();

    // 제출 시 전체 필드 에러
    await page.getByRole("button", { name: "모집글 등록하기" }).click();
    await expect(page.getByText("설명을 조금 더 작성해주세요.")).toBeVisible();
  });

  test("커뮤니티 작성 — 빈 값 제출 시 필드 에러 표시", async ({ page }) => {
    await page.goto("/community/new");
    await page.getByRole("button", { name: "등록하기" }).click();

    await expect(page.getByText("제목을 입력해주세요.")).toBeVisible();
    await expect(page.getByText("내용을 입력해주세요.")).toBeVisible();
  });
});
