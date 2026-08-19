import { Suspense } from "react";
import Link from "next/link";
import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/common/page-header";
import { Button } from "@/components/ui/button";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { PostListItem } from "@/features/community/components/post-list-item";
import { CommunityTagFilter } from "@/features/community/components/community-tag-filter";
import { getCommunityPosts } from "@/features/community/queries";
import { COMMUNITY_TAG_LABEL } from "@/config/labels";
import type { CommunityTag } from "@prisma/client";

async function CommunityPostList({ tag, page }: { tag?: CommunityTag; page: number }) {
  const { posts, totalPages } = await getCommunityPosts(tag, page);

  if (posts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center bg-white border border-dashed border-border rounded-xl">
        <div className="text-4xl mb-4">💬</div>
        <h3 className="text-lg font-bold text-foreground mb-2">아직 글이 없어요</h3>
        <p className="text-muted-foreground mb-6 text-sm">첫 아이디어를 남겨보세요.</p>
        <Button render={<Link href="/community/new" />} nativeButton={false}>
          글쓰기
        </Button>
      </div>
    );
  }

  return (
    <div className="bg-white border rounded-xl overflow-hidden">
      {posts.map((post) => (
        <PostListItem
          key={post.id}
          post={{
            id: post.id,
            category: COMMUNITY_TAG_LABEL[post.tag],
            title: post.title,
            author: post.author.nickname,
            createdAt: new Date(post.createdAt).toLocaleDateString("ko-KR"),
            likeCount: post._count.likes,
            commentCount: post._count.comments,
          }}
        />
      ))}

      {totalPages > 1 && (
        <div className="p-4 border-t">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  href={page > 1 ? `?page=${page - 1}${tag ? `&tag=${tag}` : ""}` : "#"}
                  aria-disabled={page <= 1}
                />
              </PaginationItem>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <PaginationItem key={p}>
                  <PaginationLink href={`?page=${p}${tag ? `&tag=${tag}` : ""}`} isActive={p === page}>
                    {p}
                  </PaginationLink>
                </PaginationItem>
              ))}
              <PaginationItem>
                <PaginationNext
                  href={page < totalPages ? `?page=${page + 1}${tag ? `&tag=${tag}` : ""}` : "#"}
                  aria-disabled={page >= totalPages}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </div>
  );
}

function CommunityListSkeleton() {
  return (
    <div className="bg-white border rounded-xl overflow-hidden animate-pulse">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="p-4 border-b last:border-b-0 flex items-center justify-between">
          <div className="w-1/2 h-5 bg-slate-200 rounded" />
          <div className="w-24 h-4 bg-slate-200 rounded" />
        </div>
      ))}
    </div>
  );
}

export default async function CommunityPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const tagParam = typeof params.tag === "string" ? (params.tag as CommunityTag) : undefined;
  const page = typeof params.page === "string" ? Math.max(1, Number(params.page) || 1) : 1;

  return (
    <AppShell>
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <PageHeader
          title="커뮤니티"
          description="부담 없이 아이디어를 던지고, 반응을 확인해보세요."
          action={
            <Button render={<Link href="/community/new" />} nativeButton={false}>
              글쓰기
            </Button>
          }
        />

        <CommunityTagFilter activeTag={tagParam ?? "ALL"} />

        <Suspense fallback={<CommunityListSkeleton />} key={`${tagParam}-${page}`}>
          <CommunityPostList tag={tagParam} page={page} />
        </Suspense>
      </div>
    </AppShell>
  );
}
