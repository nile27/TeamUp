import { NextResponse } from "next/server";
import { revalidatePath, revalidateTag } from "next/cache";
import { getApplicationForUser, getRecruitById } from "@/features/recruit/queries";
import { getUserFromRequest } from "@/server/api-auth";
import { prisma } from "@/server/db";

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

// DELETE /api/recruit/[id] — 모집글 삭제 (작성자 본인만, Authorization: Bearer <supabase access token> 필요)
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getUserFromRequest(request);
  if (!user) {
    return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
  }

  const { id } = await params;
  const recruit = await prisma.recruit.findUnique({ where: { id }, select: { authorId: true } });
  if (!recruit) {
    return NextResponse.json({ error: "모집을 찾을 수 없습니다." }, { status: 404 });
  }
  if (recruit.authorId !== user.id) {
    return NextResponse.json({ error: "작성자만 삭제할 수 있습니다." }, { status: 403 });
  }

  // Role/Application/Bookmark는 schema.prisma에서 onDelete: Cascade로 걸려있어
  // 이 한 줄로 연관 데이터까지 함께 삭제됨.
  await prisma.recruit.delete({ where: { id } });

  // updateTag는 Server Action 전용이라 Route Handler에서는 revalidateTag(..., "max")로
  // 즉시 만료시켜야 함 (features/applications/route.ts와 동일한 이유).
  revalidateTag(`recruit-${id}`, "max");
  revalidatePath("/recruit");
  revalidatePath("/dashboard");

  return NextResponse.json({ data: { deleted: true } });
}
