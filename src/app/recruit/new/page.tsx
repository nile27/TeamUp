import { redirect } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/common/page-header";
import { RecruitForm } from "@/features/recruit/components/recruit-form";
import { createClient } from "@/server/supabase";

export const metadata = {
  title: "모집글 작성 - TeamUp",
  description: "함께할 팀원을 찾는 모집글을 작성해보세요.",
};

export default async function RecruitNewPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login");
  }

  return (
    <AppShell>
      <div className="container mx-auto max-w-2xl px-4 py-8">
        <PageHeader title="모집글 작성" description="함께할 팀원을 찾아보세요." />
        <RecruitForm />
      </div>
    </AppShell>
  );
}
