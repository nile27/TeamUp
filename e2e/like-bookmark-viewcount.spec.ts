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

  // 조회수: 방문 시 1 이상으로 올라가고, 새로고침/재방문해도 0으로 리셋되지 않아야 함.
  // (조회수 쿠키 dedup 도입 이후엔 같은 세션 내 재방문은 중복으로 안 세는 게 의도된
  // 동작이라 정확히 1로 유지되는 게 정상 — 예전엔 방문마다 계속 올라가는 걸 기대했지만
  // 그게 바로 "좋아요만 눌러도 조회수가 같이 오르던" 버그와 같은 원인이었음.)
  await page.goto(recruitUrl);
  // ViewTracker는 마운트 후 클라이언트에서 비동기로 조회수를 반영하므로, 즉시
  // innerText()로 스냅샷 찍으면 아직 안 바뀐 값을 읽는 레이스가 생길 수 있음 — 폴링.
  await expect
    .poll(async () => Number((await page.getByTestId("recruit-view-count").innerText()).trim()), { timeout: 10_000 })
    .toBeGreaterThanOrEqual(1);

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
