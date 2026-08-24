import { NextResponse } from "next/server";
import { getApplicationForUser, getRecruitById } from "@/features/recruit/queries";
import { getUserFromRequest } from "@/server/api-auth";

// GET /api/recruit/[id] — 모집 상세 (역할·지원수 포함)
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const recruit = await getRecruitById(id);

  if (!recruit) {
    return NextResponse.json({ error: "모집을 찾을 수 없습니다." }, { status: 404 });
  }

  const user = await getUserFromRequest(request);
  const application = user ? await getApplicationForUser(recruit.id, user.id) : null;

  return NextResponse.json({ data: { ...recruit, alreadyApplied: !!application } });
}
