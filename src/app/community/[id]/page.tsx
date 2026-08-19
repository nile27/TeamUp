import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { AppShell } from "@/components/layout/app-shell";
import { Separator } from "@/components/ui/separator";
import { getCommunityPostById } from "@/features/community/queries";
import { PromoteBanner } from "@/features/community/components/promote-banner";
import { CommentList } from "@/features/community/components/comment-list";
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

  return (
    <AppShell>
      <div className="container mx-auto max-w-2xl px-4 py-8">
        <div className="space-y-2 mb-6">
          <Badge variant="outline">{COMMUNITY_TAG_LABEL[post.tag]}</Badge>
          <h1 className="text-2xl font-bold text-foreground">{post.title}</h1>
          <p className="text-sm text-muted-foreground">
            {post.author.nickname} · {new Date(post.createdAt).toLocaleDateString("ko-KR")}
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
