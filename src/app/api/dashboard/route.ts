import { NextResponse } from "next/server";
import {
  getDashboardProfile,
  getMyRecruits,
  getMyPosts,
  getMyApplications,
} from "@/features/dashboard/queries";
import { getUserFromRequest } from "@/server/api-auth";

// GET /api/dashboard — 내 모집/내 글/지원현황 (Authorization: Bearer <supabase access token> 필요)
export async function GET(request: Request) {
  const user = await getUserFromRequest(request);
  if (!user) {
    return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
  }

  const [profile, myRecruits, myPosts, myApplications] = await Promise.all([
    getDashboardProfile(user.id),
    getMyRecruits(user.id),
    getMyPosts(user.id),
    getMyApplications(user.id),
  ]);

  return NextResponse.json({ data: { profile, myRecruits, myPosts, myApplications } });
}
