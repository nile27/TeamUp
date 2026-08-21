import { createClient as createSupabaseClient } from "@supabase/supabase-js";

// RN 등 쿠키 세션이 없는 클라이언트용 — `Authorization: Bearer <supabase access token>`
// 헤더로 온 토큰을 검증해 user.id를 얻는다. 웹은 계속 server/supabase.ts(쿠키 기반) 사용.
export async function getUserFromRequest(request: Request) {
  const authHeader = request.headers.get("authorization");
  const token = authHeader?.match(/^Bearer (.+)$/i)?.[1];
  if (!token) return null;

  const supabase = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
  );

  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data.user) return null;
  return data.user;
}
