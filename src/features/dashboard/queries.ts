import { prisma } from "@/server/db";

export async function getDashboardProfile(userId: string) {
  return prisma.user.findUnique({ where: { id: userId } });
}

export async function getMyRecruits(userId: string) {
  return prisma.recruit.findMany({
    where: { authorId: userId },
    orderBy: { createdAt: "desc" },
    include: {
      roles: true,
      _count: { select: { applications: true, bookmarks: true } },
    },
  });
}

export async function getMyPosts(userId: string) {
  return prisma.communityPost.findMany({
    where: { authorId: userId },
    orderBy: { createdAt: "desc" },
    include: {
      author: { select: { nickname: true } },
      _count: { select: { comments: true, likes: true } },
    },
  });
}

export async function getMyApplications(userId: string) {
  return prisma.application.findMany({
    where: { applicantId: userId },
    orderBy: { createdAt: "desc" },
    include: { recruit: { select: { id: true, title: true, type: true } } },
  });
}
