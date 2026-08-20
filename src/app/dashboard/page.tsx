import Link from "next/link";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { MarkdownContent } from "@/components/common/markdown-content";
import { RecruitCard } from "@/features/recruit/components/recruit-card";
import { PostListItem } from "@/features/community/components/post-list-item";
import { ApplicationItem } from "@/features/dashboard/components/application-item";
import { getDashboardProfile, getMyRecruits, getMyPosts, getMyApplications } from "@/features/dashboard/queries";
import { RECRUIT_TYPE_LABEL, COMMUNITY_TAG_LABEL } from "@/config/labels";
import { createClient } from "@/server/supabase";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login");
  }

  const [profile, recruits, posts, applications] = await Promise.all([
    getDashboardProfile(user.id),
    getMyRecruits(user.id),
    getMyPosts(user.id),
    getMyApplications(user.id),
  ]);

  return (
    <AppShell>
      <div className="container mx-auto max-w-4xl px-4 py-8">
        <div className="flex items-start justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <Avatar size="lg">
              <AvatarFallback>{profile?.nickname?.[0] ?? "U"}</AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-xl font-bold text-foreground">{profile?.nickname ?? "사용자"}</h1>
              <p className="text-sm text-muted-foreground">{profile?.email}</p>
              {profile?.bio && <p className="text-sm text-foreground mt-1">{profile.bio}</p>}
            </div>
          </div>
          <Button render={<Link href="/dashboard/edit" />} nativeButton={false} variant="outline" size="sm">
            프로필 수정
          </Button>
        </div>

        {profile?.portfolio && (
          <div className="mb-8 rounded-xl border bg-white p-5">
            <h2 className="text-sm font-semibold text-foreground mb-3">포트폴리오 · 경력</h2>
            <MarkdownContent content={profile.portfolio} />
          </div>
        )}

        <Tabs defaultValue="recruits" className="w-full">
          <TabsList>
            <TabsTrigger value="recruits">내 모집 ({recruits.length})</TabsTrigger>
            <TabsTrigger value="posts">내 글 ({posts.length})</TabsTrigger>
            <TabsTrigger value="applications">지원한 모집 ({applications.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="recruits" className="pt-6">
            {recruits.length === 0 ? (
              <EmptyState
                message="아직 등록한 모집이 없어요."
                actionLabel="모집 등록"
                actionHref="/recruit/new"
              />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {recruits.map((recruit) => (
                  <div key={recruit.id} className="space-y-2">
                    <RecruitCard
                      data={{
                        id: recruit.id,
                        title: recruit.title,
                        summary: recruit.content,
                        type: RECRUIT_TYPE_LABEL[recruit.type],
                        techStack: recruit.techStack,
                        completeness: recruit.completeness,
                        roles: recruit.roles.map((r) => ({ name: r.name, current: 0, total: r.count })),
                        viewCount: recruit.viewCount,
                        bookmarkCount: recruit._count.bookmarks,
                        isClosed: recruit.status !== "OPEN",
                      }}
                    />
                    <Link
                      href={`/recruit/${recruit.id}/applicants`}
                      className="block text-center text-sm font-medium text-primary hover:underline"
                    >
                      지원자 보기 ({recruit._count.applications})
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="posts" className="pt-6">
            {posts.length === 0 ? (
              <EmptyState message="아직 작성한 글이 없어요." actionLabel="글쓰기" actionHref="/community/new" />
            ) : (
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
              </div>
            )}
          </TabsContent>

          <TabsContent value="applications" className="pt-6">
            {applications.length === 0 ? (
              <EmptyState
                message="아직 지원한 모집이 없어요. 둘러볼까요?"
                actionLabel="모집 보기"
                actionHref="/recruit"
              />
            ) : (
              <div className="bg-white border rounded-xl overflow-hidden">
                {applications.map((app) => (
                  <ApplicationItem key={app.id} recruit={app.recruit} status={app.status} />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </AppShell>
  );
}

function EmptyState({
  message,
  actionLabel,
  actionHref,
}: {
  message: string;
  actionLabel: string;
  actionHref: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center bg-white border border-dashed border-border rounded-xl">
      <p className="text-muted-foreground mb-6 text-sm">{message}</p>
      <Button render={<Link href={actionHref} />} nativeButton={false}>
        {actionLabel}
      </Button>
    </div>
  );
}
