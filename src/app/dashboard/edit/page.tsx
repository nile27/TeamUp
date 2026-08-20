import { redirect } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/common/page-header";
import { ProfileEditForm } from "@/features/dashboard/components/profile-edit-form";
import { getDashboardProfile } from "@/features/dashboard/queries";
import { createClient } from "@/server/supabase";

export const metadata = {
  title: "프로필 수정 - TeamUp",
};

export default async function ProfileEditPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login");
  }

  const profile = await getDashboardProfile(user.id);
  if (!profile) {
    redirect("/dashboard");
  }

  return (
    <AppShell>
      <div className="container mx-auto max-w-2xl px-4 py-8">
        <PageHeader title="프로필 수정" description="닉네임, 자기소개, 포트폴리오를 관리하세요." />
        <ProfileEditForm
          defaultValues={{
            nickname: profile.nickname,
            bio: profile.bio ?? "",
            portfolio: profile.portfolio ?? "",
          }}
        />
      </div>
    </AppShell>
  );
}
