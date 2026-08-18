import Link from "next/link";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
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
        <div className="flex items-center gap-4 mb-8">
          <Avatar size="lg">
            <AvatarFallback>{profile?.nickname?.[0] ?? "U"}</AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-xl font-bold text-foreground">{profile?.nickname ?? "사용자"}</h1>
            <p className="text-sm text-muted-foreground">{profile?.email}</p>
          </div>
        </div>

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
                  <RecruitCard
                    key={recruit.id}
                    data={{
                      id: recruit.id,
                      title: recruit.title,
                      summary: recruit.content,
                      type: RECRUIT_TYPE_LABEL[recruit.type],
                      techStack: recruit.techStack,
                      completeness: recruit.completeness,
                      roles: recruit.roles.map((r) => ({ name: r.name, current: 0, total: r.count })),
                      viewCount: 0,
                      bookmarkCount: 0,
                      isClosed: recruit.status !== "OPEN",
                    }}
                  />
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
                      likeCount: 0,
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
