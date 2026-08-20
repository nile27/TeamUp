import { PrismaClient } from "@prisma/client";
import { createAdminClient } from "./support/admin-client";

// E2E가 만드는 계정은 전부 이메일이 이 접두사로 시작한다 (test-users.ts, 각 spec의 자체 signup 포함).
const E2E_EMAIL_PREFIX = "teamup.e2e.";

export default async function globalTeardown() {
  const admin = createAdminClient();
  if (!admin) {
    console.warn(
      "[e2e teardown] SUPABASE_SERVICE_ROLE_KEY가 없어 Auth 고아 계정 정리를 건너뜁니다. " +
      "(로컬 개발에서는 정상 — CI에서만 시크릿으로 주입됨)"
    );
    return;
  }

  const prisma = new PrismaClient();

  try {
    const { count } = await prisma.user.deleteMany({
      where: { email: { startsWith: E2E_EMAIL_PREFIX } },
    });
    console.log(`[e2e teardown] public.User ${count}건 정리 (cascade로 연관 데이터도 함께 삭제됨)`);
  } finally {
    await prisma.$disconnect();
  }

  let page = 1;
  let deleted = 0;
  while (true) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 200 });
    if (error) {
      console.warn(`[e2e teardown] auth.users 목록 조회 실패: ${error.message}`);
      break;
    }
    if (data.users.length === 0) break;

    const targets = data.users.filter((u) => u.email?.startsWith(E2E_EMAIL_PREFIX));
    for (const target of targets) {
      const { error: deleteError } = await admin.auth.admin.deleteUser(target.id);
      if (deleteError) {
        console.warn(`[e2e teardown] ${target.email} 삭제 실패: ${deleteError.message}`);
      } else {
        deleted += 1;
      }
    }

    if (data.users.length < 200) break;
    page += 1;
  }
  console.log(`[e2e teardown] auth.users ${deleted}건 정리`);
}
