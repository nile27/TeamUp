import { test, expect } from "@playwright/test";

test.describe("마이페이지", () => {
  test("탭 3개(내 모집/내 글/지원한 모집)가 데이터 또는 빈 상태를 보여준다", async ({ page }) => {
    await page.goto("/dashboard");

    await expect(page.getByRole("tab", { name: /내 모집/ })).toBeVisible();
    await expect(page.getByRole("tab", { name: /내 글/ })).toBeVisible();
    await expect(page.getByRole("tab", { name: /지원한 모집/ })).toBeVisible();

    // 내 모집 탭 (기본 활성)
    const myRecruitsEmpty = page.getByText("아직 등록한 모집이 없어요.");
    const myRecruitsHasData = page.getByText("기획 완성도").first();
    await expect(myRecruitsEmpty.or(myRecruitsHasData)).toBeVisible({ timeout: 10_000 });

    await page.getByRole("tab", { name: /내 글/ }).click();
    const myPostsEmpty = page.getByText("아직 작성한 글이 없어요.");
    const myPostsHasData = page.getByText(/^(아이디어|질문|기타)$/).first();
    await expect(myPostsEmpty.or(myPostsHasData)).toBeVisible({ timeout: 10_000 });

    await page.getByRole("tab", { name: /지원한 모집/ }).click();
    const applicationsEmpty = page.getByText("아직 지원한 모집이 없어요. 둘러볼까요?");
    const applicationsHasData = page.getByText(/대기 중|수락됨|거절됨/).first();
    await expect(applicationsEmpty.or(applicationsHasData)).toBeVisible({ timeout: 10_000 });
  });
});
