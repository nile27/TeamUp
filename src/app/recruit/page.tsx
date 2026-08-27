import { Suspense } from "react";
import Link from "next/link";
import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/common/page-header";
import { Button } from "@/components/ui/button";
import { RecruitCard } from "@/features/recruit/components/recruit-card";
import { getRecruitList } from "@/features/recruit/queries";
import { TechStackUrlFilter } from "@/features/recruit/components/tech-stack-url-filter";
import { RECRUIT_TYPE_LABEL } from "@/config/labels";

// Data fetching component
async function RecruitList({ stackParam }: { stackParam?: string }) {
  const techStackFilter = stackParam ? stackParam.split(",") : [];
  const recruits = await getRecruitList(techStackFilter);

  if (recruits.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center bg-card border border-dashed border-border rounded-xl">
        <div className="mb-4 flex size-14 items-center justify-center rounded-2xl bg-secondary text-2xl">📭</div>
        <h3 className="text-lg font-bold text-foreground mb-2">아직 모집글이 없어요</h3>
        <p className="text-muted-foreground mb-6 text-sm">해당 기술 스택을 찾는 첫 번째 프로젝트의 리더가 되어보세요!</p>
        <Button render={<Link href="/recruit/new" />} nativeButton={false}>
          모집글 작성하기
        </Button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {recruits.map((recruit) => {
        const mappedData = {
          id: recruit.id,
          title: recruit.title,
          summary: recruit.content,
          type: RECRUIT_TYPE_LABEL[recruit.type],
          techStack: recruit.techStack,
          completeness: recruit.completeness,
          roles: recruit.roles.map(r => ({ name: r.name, current: 0, total: r.count })),
          viewCount: recruit.viewCount,
          bookmarkCount: recruit._count.bookmarks,
          isClosed: recruit.status !== "OPEN",
        };
        return <RecruitCard key={recruit.id} data={mappedData} />;
      })}
    </div>
  );
}

// Skeleton component
function RecruitListSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {[1, 2, 3, 4, 5, 6].map(i => (
        <div key={i} className="h-[280px] bg-card rounded-xl border border-border p-5 flex flex-col gap-4 animate-pulse">
          <div className="flex justify-between">
            <div className="w-16 h-5 bg-muted rounded"></div>
          </div>
          <div className="w-3/4 h-6 bg-muted rounded mt-2"></div>
          <div className="w-full h-4 bg-muted rounded mt-1"></div>
          <div className="w-5/6 h-4 bg-muted rounded"></div>
          <div className="w-full h-8 bg-muted rounded mt-4"></div>
          <div className="mt-auto flex gap-2">
            <div className="w-16 h-6 bg-muted rounded"></div>
            <div className="w-16 h-6 bg-muted rounded"></div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default async function RecruitPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const params = await searchParams;
  const stackParam = typeof params.stack === "string" ? params.stack : undefined;

  return (
    <AppShell>
      <div className="container mx-auto px-4 py-12 max-w-6xl">
        <PageHeader 
          title="팀 찾기" 
          description="다양한 아이디어가 당신의 합류를 기다리고 있습니다."
          action={
            <Button render={<Link href="/recruit/new" />} nativeButton={false}>
              모집글 작성
            </Button>
          }
        />
        
        <TechStackUrlFilter />

        <Suspense fallback={<RecruitListSkeleton />} key={stackParam}>
          <RecruitList stackParam={stackParam} />
        </Suspense>
      </div>
    </AppShell>
  );
}
