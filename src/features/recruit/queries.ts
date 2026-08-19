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
