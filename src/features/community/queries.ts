import { prisma } from "@/server/db";
import type { CommunityTag } from "@prisma/client";

const PAGE_SIZE = 10;

export async function getCommunityPosts(tag: CommunityTag | undefined, page: number) {
  const where = tag ? { tag } : {};

  const [posts, total] = await Promise.all([
    prisma.communityPost.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      include: {
        author: { select: { nickname: true } },
        _count: { select: { comments: true } },
      },
    }),
    prisma.communityPost.count({ where }),
  ]);

  return { posts, totalPages: Math.max(1, Math.ceil(total / PAGE_SIZE)) };
}

export async function getCommunityPostById(id: string) {
  return prisma.communityPost.findUnique({
    where: { id },
    include: {
      author: { select: { id: true, nickname: true } },
      promotedRecruit: { select: { id: true } },
      comments: {
        orderBy: { createdAt: "asc" },
        include: { author: { select: { nickname: true } } },
      },
    },
  });
}
