import { NextResponse } from "next/server";
import { getRecruitList } from "@/features/recruit/queries";
import { createRecruitSchema } from "@/features/recruit/schema";
import { calcCompleteness } from "@/features/recruit/completeness";
import { getUserFromRequest } from "@/server/api-auth";
import { prisma } from "@/server/db";

// GET /api/recruit?stack=React,Node.js — 모집 목록
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const stack = searchParams.get("stack");
  const techStackFilter = stack ? stack.split(",").filter(Boolean) : undefined;

  const recruits = await getRecruitList(techStackFilter);
  return NextResponse.json({ data: recruits });
}

// POST /api/recruit — 모집 생성 (Authorization: Bearer <supabase access token> 필요)
export async function POST(request: Request) {
  const user = await getUserFromRequest(request);
  if (!user) {
    return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
  }

  const body = await request.json();
  const parsed = createRecruitSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "입력값을 다시 확인해주세요.", fieldErrors: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  const completeness = calcCompleteness(parsed.data);

  const recruit = await prisma.recruit.create({
    data: {
      type: parsed.data.type,
      title: parsed.data.title,
      content: parsed.data.content,
      techStack: parsed.data.techStack,
      problem: parsed.data.problem,
      targetUser: parsed.data.targetUser,
      coreFeatures: parsed.data.coreFeatures,
      reference: parsed.data.reference,
      completeness,
      authorId: user.id,
      roles: {
        create: parsed.data.roles.map((role) => ({ name: role.name, count: role.count })),
      },
    },
  });

  return NextResponse.json({ data: recruit }, { status: 201 });
}
