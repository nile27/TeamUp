import { NextResponse } from "next/server";
import { getRecruitById } from "@/features/recruit/queries";

// GET /api/recruit/[id] — 모집 상세 (역할·지원수 포함)
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const recruit = await getRecruitById(id);

  if (!recruit) {
    return NextResponse.json({ error: "모집을 찾을 수 없습니다." }, { status: 404 });
  }

  return NextResponse.json({ data: recruit });
}
