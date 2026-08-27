import { notFound } from "next/navigation";
import Link from "next/link";
import { Eye } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AppShell } from "@/components/layout/app-shell";
import { Separator } from "@/components/ui/separator";
import { getCommunityPostById, getLikeForUser } from "@/features/community/queries";
import { incrementPostViewCount } from "@/features/community/actions";
import { PromoteBanner } from "@/features/community/components/promote-banner";
import { CommentList } from "@/features/community/components/comment-list";
import { LikeButton } from "@/features/community/components/like-button";
import { DeletePostButton } from "@/features/community/components/delete-post-button";
import { createClient } from "@/server/supabase";
import { COMMUNITY_TAG_LABEL } from "@/config/labels";

export default async function CommunityDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { id } = await params;
  const { promoteError } = await searchParams;
  const post = await getCommunityPostById(id);

  if (!post) {
    notFound();
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const isAuthor = user?.id === post.authorId;

  const [like, viewCount] = await Promise.all([
    user ? getLikeForUser(post.id, user.id) : Promise.resolve(null),
    incrementPostViewCount(post.id),
  ]);

  return (
    <AppShell>
      <div className="container mx-auto max-w-2xl px-4 py-8">
        {/* 태그·버튼을 같은 줄에 두고 제목은 독립된 줄로 분리 — 좋아요 버튼 텍스트 길이가
            바뀌어도(좋아요 ↔ 좋아요 취소) 제목 줄바꿈에는 영향이 없도록 함. */}
        <div className="space-y-2 mb-6">
          <div className="flex items-center justify-between gap-4">
            <Badge variant="outline">{COMMUNITY_TAG_LABEL[post.tag]}</Badge>
            <div className="flex items-center gap-2 shrink-0">
              {isAuthor && (
                <>
                  <Button render={<Link href={`/community/${post.id}/edit`} />} nativeButton={false} variant="outline" size="sm">
                    수정
                  </Button>
                  <DeletePostButton postId={post.id} />
                </>
              )}
              <LikeButton
                postId={post.id}
                isLoggedIn={!!user}
                initialLiked={!!like}
                initialCount={post._count.likes}
              />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-foreground">{post.title}</h1>
          <p className="text-sm text-muted-foreground flex items-center gap-1.5">
            {post.author.nickname} · {new Date(post.createdAt).toLocaleDateString("ko-KR")}
            <span data-testid="post-view-count" className="inline-flex items-center gap-1 ml-1">
              <Eye className="h-3.5 w-3.5" />
              {viewCount}
            </span>
          </p>
        </div>

        {typeof promoteError === "string" && (
          <div className="rounded-md border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive mb-6">
            {promoteError}
          </div>
        )}

        {post.tag === "IDEA" && !post.promotedRecruit && (
          <div className="mb-6">
            <PromoteBanner postId={post.id} isAuthor={isAuthor} />
          </div>
        )}

        <p className="text-[15px] leading-relaxed whitespace-pre-wrap text-foreground mb-8">
          {post.content}
        </p>

        <Separator className="mb-6" />

        <CommentList
          postId={post.id}
          isLoggedIn={!!user}
          comments={post.comments.map((c) => ({
            id: c.id,
            content: c.content,
            createdAt: new Date(c.createdAt).toLocaleDateString("ko-KR"),
            author: { nickname: c.author.nickname },
          }))}
        />
      </div>
    </AppShell>
  );
}
