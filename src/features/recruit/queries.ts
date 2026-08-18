import { unstable_cache } from "next/cache";
import { prisma } from "@/server/db";

export async function getRecruitList(techStackFilter?: string[]) {
  const whereClause = techStackFilter && techStackFilter.length > 0
    ? { techStack: { hasSome: techStackFilter } }
    : {};

  const recruits = await prisma.recruit.findMany({
    where: whereClause,
    orderBy: { createdAt: "desc" },
    include: {
      roles: true,
      _count: {
        select: { applications: true }
      }
    }
  });

  return recruits;
}

// ISR: /recruit/[id] — revalidateTag(`recruit-${id}`)로 지원/수정 시 갱신
export function getRecruitById(id: string) {
  return unstable_cache(
    async () => {
      return prisma.recruit.findUnique({
        where: { id },
        include: {
          author: { select: { id: true, nickname: true, avatarUrl: true } },
          roles: true,
          _count: { select: { applications: true } },
        },
      });
    },
    [`recruit-${id}`],
    { tags: [`recruit-${id}`] }
  )();
}

export async function getApplicationForUser(recruitId: string, userId: string) {
  return prisma.application.findUnique({
    where: { applicantId_recruitId: { applicantId: userId, recruitId } },
  });
}
