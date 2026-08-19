import { redirect } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/common/page-header";
import { CommunityForm } from "@/features/community/components/community-form";
import { createClient } from "@/server/supabase";

export const metadata = {
  title: "글쓰기 - TeamUp",
  description: "커뮤니티에 아이디어나 질문을 남겨보세요.",
};

export default async function CommunityNewPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login");
  }

  return (
    <AppShell>
      <div className="container mx-auto max-w-2xl px-4 py-8">
        <PageHeader title="글쓰기" description="부담 없이 남겨보세요." />
        <CommunityForm />
      </div>
    </AppShell>
  );
}
