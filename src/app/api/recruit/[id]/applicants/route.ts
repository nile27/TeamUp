import { NextResponse } from "next/server";
import { getRecruitForApplicants } from "@/features/recruit/queries";
import { getUserFromRequest } from "@/server/api-auth";

// GET /api/recruit/[id]/applicants — 지원자 목록 (모집 작성자 본인만, Authorization: Bearer <supabase access token> 필요)
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getUserFromRequest(request);
  if (!user) {
    return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
  }

  const { id } = await params;
  const recruit = await getRecruitForApplicants(id);
  if (!recruit) {
    return NextResponse.json({ error: "모집을 찾을 수 없습니다." }, { status: 404 });
  }
  if (recruit.authorId !== user.id) {
    return NextResponse.json({ error: "작성자만 조회할 수 있습니다." }, { status: 403 });
  }

  return NextResponse.json({ data: recruit });
}
