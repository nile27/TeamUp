import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getUserFromRequest } from "@/server/api-auth";
import { prisma } from "@/server/db";

// PATCH /api/applications/[id]/status — 지원 수락/거절 (모집 작성자 본인만, Authorization: Bearer <supabase access token> 필요)
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getUserFromRequest(request);
  if (!user) {
    return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json();
  const status = body.status;
  if (status !== "ACCEPTED" && status !== "REJECTED") {
    return NextResponse.json({ error: "status는 ACCEPTED 또는 REJECTED여야 합니다." }, { status: 400 });
  }

  const application = await prisma.application.findUnique({
    where: { id },
    select: { recruitId: true, recruit: { select: { authorId: true } } },
  });
  if (!application) {
    return NextResponse.json({ error: "지원 내역을 찾을 수 없습니다." }, { status: 404 });
  }
  if (application.recruit.authorId !== user.id) {
    return NextResponse.json({ error: "작성자만 처리할 수 있습니다." }, { status: 403 });
  }

  const updated = await prisma.application.update({
    where: { id },
    data: { status },
  });

  revalidatePath(`/recruit/${application.recruitId}/applicants`);
  revalidatePath("/dashboard");

  return NextResponse.json({ data: { id: updated.id, status: updated.status } });
}
