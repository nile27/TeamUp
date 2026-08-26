import { notFound } from "next/navigation";
import Link from "next/link";
import { Eye } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { getRecruitById, getApplicationForUser, getBookmarkForUser } from "@/features/recruit/queries";
import { incrementRecruitViewCount } from "@/features/recruit/actions";
import { CompletenessGauge } from "@/features/recruit/components/completeness-gauge";
import { TechStackTags } from "@/features/recruit/components/tech-stack-tags";
import { ApplyBar } from "@/features/recruit/components/apply-bar";
import { BookmarkButton } from "@/features/recruit/components/bookmark-button";
import { createClient } from "@/server/supabase";
import { RECRUIT_TYPE_LABEL } from "@/config/labels";

const STRUCTURED_QUESTIONS: { key: "problem" | "targetUser" | "coreFeatures" | "reference"; label: string }[] = [
  { key: "problem", label: "어떤 문제를 겪었나요?" },
  { key: "targetUser", label: "누가 어떤 상황에 쓰나요?" },
  { key: "coreFeatures", label: "꼭 필요한 기능 3가지는?" },
  { key: "reference", label: "비슷한 앱/사이트" },
];

export default async function RecruitDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const recruit = await getRecruitById(id);

  if (!recruit) {
    notFound();
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const [application, bookmark, viewCount] = await Promise.all([
    user ? getApplicationForUser(recruit.id, user.id) : Promise.resolve(null),
    user ? getBookmarkForUser(recruit.id, user.id) : Promise.resolve(null),
    incrementRecruitViewCount(recruit.id),
  ]);

  const hasStructuredInfo = STRUCTURED_QUESTIONS.some((q) => recruit[q.key]?.trim());

  return (
    <AppShell>
      {/* 짧은 글에서도 ApplyBar가 뷰포트 하단에 붙도록(중간에 붕 뜨지 않게) 최소 높이 확보 */}
      <div className="flex flex-col min-h-[calc(100vh-3.5rem)]">
        <div className="container mx-auto max-w-4xl px-4 py-8 pb-4 flex-1">
        {/* 태그·버튼을 같은 줄에 두고 제목은 독립된 줄로 분리 — 저장 버튼 텍스트 길이가
            바뀌어도(저장 ↔ 저장됨) 제목 줄바꿈에는 영향이 없도록 함. */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Badge variant="secondary">{RECRUIT_TYPE_LABEL[recruit.type]}</Badge>
              {recruit.status !== "OPEN" && (
                <Badge variant="outline" className="text-muted-foreground">
                  {recruit.status === "CLOSED" ? "모집마감" : "팀 결성 완료"}
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {user?.id === recruit.authorId && (
                <Button render={<Link href={`/recruit/${recruit.id}/edit`} />} nativeButton={false} variant="outline" size="sm">
                  수정
                </Button>
              )}
              <BookmarkButton
                recruitId={recruit.id}
                isLoggedIn={!!user}
                initialBookmarked={!!bookmark}
                initialCount={recruit._count.bookmarks}
              />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-foreground">{recruit.title}</h1>
          <p className="text-sm text-muted-foreground flex items-center gap-1.5">
            {recruit.author.nickname} · {new Date(recruit.createdAt).toLocaleDateString("ko-KR")}
            <span data-testid="recruit-view-count" className="inline-flex items-center gap-1 ml-1">
              <Eye className="h-3.5 w-3.5" />
              {viewCount}
            </span>
          </p>
        </div>

        <TechStackTags tags={recruit.techStack} maxDisplay={recruit.techStack.length} />

        <Card className="mb-6 mt-4">
          <CardContent>
            <CompletenessGauge value={recruit.completeness} />
          </CardContent>
        </Card>

        <div className="space-y-2 mb-6">
          <h2 className="text-sm font-semibold text-foreground">모집 역할</h2>
          <div className="flex flex-wrap gap-2">
            {recruit.roles.map((role) => (
              <Badge key={role.id} variant="outline" className="px-3 py-1">
                {role.name} · {role.count}명
              </Badge>
            ))}
          </div>
        </div>

        <Separator className="mb-6" />

        <div className="space-y-3 mb-6">
          <h2 className="text-sm font-semibold text-foreground">소개</h2>
          <p className="text-[15px] leading-relaxed whitespace-pre-wrap text-foreground">
            {recruit.content}
          </p>
        </div>

        {hasStructuredInfo && (
          <div className="space-y-4 mb-6">
            <h2 className="text-sm font-semibold text-foreground">기획 정보</h2>
            {STRUCTURED_QUESTIONS.filter((q) => recruit[q.key]?.trim()).map((q) => (
              <Card key={q.key}>
                <CardContent className="space-y-1.5">
                  <p className="text-sm font-medium text-muted-foreground">{q.label}</p>
                  <p className="text-[15px] whitespace-pre-wrap text-foreground">{recruit[q.key]}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <ApplyBar
        recruitId={recruit.id}
        isLoggedIn={!!user}
        isAuthor={user?.id === recruit.authorId}
        alreadyApplied={!!application}
        isClosed={recruit.status !== "OPEN"}
        applicationCount={recruit._count.applications}
      />
      </div>
    </AppShell>
  );
}
