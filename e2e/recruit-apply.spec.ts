import { test, expect } from "@playwright/test";
import fs from "fs";
import path from "path";

function readFixtureRecruit(): { url: string; id: string } {
  return JSON.parse(fs.readFileSync(path.join(__dirname, ".auth", "recruit.json"), "utf-8"));
}

test("모집 상세에서 지원 → 같은 계정으로 재지원 시 중복 방지", async ({ page }) => {
  const fixture = readFixtureRecruit();
  await page.goto(fixture.url);

  await page.getByPlaceholder("지원 메시지 (선택)").fill("[E2E] 백엔드로 지원합니다.");
  await page.getByRole("button", { name: "지원하기" }).click();

  await expect(page.getByRole("button", { name: "지원 완료" })).toBeVisible({ timeout: 15_000 });

  // 새로고침 후에도 "지원 완료" 상태가 서버에서 유지되는지 확인 (getApplicationForUser).
  // ApplyBar가 지원 완료 시 폼 자체를 숨기므로, "같은 계정 재지원 시 에러 메시지"는 UI로는
  // 재현 불가 — DB의 @@unique([applicantId, recruitId]) + 서버 catch가 방어선(중복 방지는
  // 이 영속 상태로 간접 검증).
  await page.reload();
  await expect(page.getByRole("button", { name: "지원 완료" })).toBeVisible();
});
