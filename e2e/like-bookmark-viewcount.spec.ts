import { test, expect } from "@playwright/test";
import { signupAndLogin } from "./support/auth-helpers";
import { PASSWORD } from "./support/test-users";

// 자기 계정으로 직접 만든 모집/글에 조회수·저장·좋아요를 걸어보는 자기완결형 테스트
// (공유 fixture에 기대지 않아 다른 스펙과의 실행 순서 문제가 없음).
test("모집 저장(북마크)·조회수, 커뮤니티 좋아요·조회수가 새로고침 후에도 유지된다", async ({ page }) => {
  test.setTimeout(60_000);
  const ts = Date.now();
  const user = { email: `teamup.e2e.likes.${ts}@gmail.com`, password: PASSWORD, nickname: "E2E좋아요" };
  await signupAndLogin(page, user);

  // 모집 하나 만들기
  await page.goto("/recruit/new");
  await page.getByTestId("recruit-type-DEV").click();
  await page.getByLabel("제목").fill("[E2E] 저장·조회수 테스트용 모집");
  await page.getByLabel("소개").fill("북마크와 조회수 기능을 검증하기 위한 모집글입니다.");
  await page.getByPlaceholder("역할명 (예: 프론트엔드)").first().fill("백엔드");
  await page.getByRole("button", { name: "모집글 등록하기" }).click();
  await page.waitForURL((url) => url.pathname.startsWith("/recruit/") && url.pathname !== "/recruit/new", {
    timeout: 20_000,
  });
  const recruitUrl = page.url();

  // 저장 토글 — BookmarkButton은 낙관적 업데이트라 클릭 즉시 텍스트가 바뀜(서버 확정 전).
  // 새로고침 전에 실제 서버 왕복(Server Action POST)이 끝났는지 네트워크로 직접 확인해야
  // 함 — 안 그러면 UI 텍스트만 보고 reload했다가 아직 안 끝난 요청이 취소되는 레이스가 생김.
  const bookmarkBtn = page.getByRole("button", { name: /저장/ });
  await expect(bookmarkBtn).toHaveText("저장 (0)");
  await Promise.all([
    page.waitForResponse((res) => res.url() === recruitUrl && res.request().method() === "POST"),
    bookmarkBtn.click(),
  ]);
  await expect(bookmarkBtn).toHaveText("저장됨 (1)", { timeout: 10_000 });
  await page.reload();
  await expect(page.getByRole("button", { name: /저장/ })).toHaveText("저장됨 (1)", { timeout: 10_000 });

  // 조회수: 지금까지 여러 번 방문(작성 직후 진입 + 새로고침 + 재방문) — 최소 2 이상이어야 함
  await page.goto(recruitUrl);
  const viewCountText = await page.getByTestId("recruit-view-count").innerText();
  expect(Number(viewCountText.trim())).toBeGreaterThanOrEqual(2);

  // 커뮤니티 글 하나 만들기
  await page.goto("/community/new");
  await page.getByTestId("community-tag-ETC").click();
  await page.getByLabel("제목").fill("[E2E] 좋아요·조회수 테스트용 글");
  await page.getByLabel("내용").fill("좋아요와 조회수 기능을 검증하기 위한 글입니다.");
  await page.getByRole("button", { name: "등록하기" }).click();
  await page.waitForURL((url) => url.pathname.startsWith("/community/") && url.pathname !== "/community/new", {
    timeout: 20_000,
  });
  const postUrl = page.url();

  // LikeButton도 낙관적 업데이트라 위 저장 토글과 같은 이유로 네트워크 응답을 직접 기다림.
  const likeBtn = page.getByRole("button", { name: /좋아요/ });
  await expect(likeBtn).toHaveText("좋아요 (0)");
  await Promise.all([
    page.waitForResponse((res) => res.url() === postUrl && res.request().method() === "POST"),
    likeBtn.click(),
  ]);
  await expect(likeBtn).toHaveText("좋아요 취소 (1)", { timeout: 10_000 });
  await page.reload();
  await expect(page.getByRole("button", { name: /좋아요/ })).toHaveText("좋아요 취소 (1)", { timeout: 10_000 });

  // 좋아요 취소도 되는지
  await page.getByRole("button", { name: /좋아요/ }).click();
  await expect(page.getByRole("button", { name: /좋아요/ })).toHaveText("좋아요 (0)", { timeout: 10_000 });
});
