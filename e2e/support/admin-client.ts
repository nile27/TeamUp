import { createClient } from "@supabase/supabase-js";

// 서버 코드가 쓰는 src/server/supabase.ts와 별개로, 여기는 Next.js 요청 컨텍스트(쿠키) 없이
// 순수 Node 스크립트(global.teardown)에서 service_role 키로 Auth 관리 API를 호출하기 위한 클라이언트.
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    return null;
  }

  return createClient(url, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
