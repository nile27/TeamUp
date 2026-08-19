import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/common/page-header";
import { Button } from "@/components/ui/button";
import { ApplicantRow } from "@/features/recruit/components/applicant-row";
import { getRecruitForApplicants } from "@/features/recruit/queries";
import { createClient } from "@/server/supabase";

export default async function RecruitApplicantsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login");
  }

  const recruit = await getRecruitForApplicants(id);
  if (!recruit) {
    notFound();
  }
  if (recruit.authorId !== user.id) {
    redirect(`/recruit/${id}`);
  }

  return (
    <AppShell>
      <div className="container mx-auto max-w-2xl px-4 py-8">
        <PageHeader
          title="지원자 목록"
          description={recruit.title}
          action={
            <Button render={<Link href={`/recruit/${id}`} />} nativeButton={false} variant="outline">
              모집글로 돌아가기
            </Button>
          }
        />

        {recruit.applications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center bg-white border border-dashed border-border rounded-xl">
            <p className="text-muted-foreground text-sm">아직 지원자가 없어요.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {recruit.applications.map((app) => (
              <ApplicantRow
                key={app.id}
                applicationId={app.id}
                status={app.status}
                message={app.message}
                applicant={app.applicant}
              />
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
