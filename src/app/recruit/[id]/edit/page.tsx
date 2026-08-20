import { notFound, redirect } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/common/page-header";
import { RecruitForm } from "@/features/recruit/components/recruit-form";
import { getRecruitForEdit } from "@/features/recruit/queries";
import { createClient } from "@/server/supabase";

export const metadata = {
  title: "모집글 수정 - TeamUp",
};

export default async function RecruitEditPage({
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

  const recruit = await getRecruitForEdit(id);
  if (!recruit) {
    notFound();
  }
  if (recruit.authorId !== user.id) {
    redirect(`/recruit/${id}`);
  }

  return (
    <AppShell>
      <div className="container mx-auto max-w-2xl px-4 py-8">
        <PageHeader title="모집글 수정" description="내용을 수정해보세요." />
        <RecruitForm
          recruit={{
            id: recruit.id,
            type: recruit.type,
            title: recruit.title,
            content: recruit.content,
            techStack: recruit.techStack,
            roles: recruit.roles.map((r) => ({ name: r.name, count: r.count })),
            problem: recruit.problem ?? "",
            targetUser: recruit.targetUser ?? "",
            coreFeatures: recruit.coreFeatures ?? "",
            reference: recruit.reference ?? "",
          }}
        />
      </div>
    </AppShell>
  );
}
