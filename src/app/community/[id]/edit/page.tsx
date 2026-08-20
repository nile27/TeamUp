import { notFound, redirect } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/common/page-header";
import { CommunityForm } from "@/features/community/components/community-form";
import { getCommunityPostById } from "@/features/community/queries";
import { createClient } from "@/server/supabase";

export const metadata = {
  title: "글 수정 - TeamUp",
};

export default async function CommunityEditPage({
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

  const post = await getCommunityPostById(id);
  if (!post) {
    notFound();
  }
  if (post.authorId !== user.id) {
    redirect(`/community/${id}`);
  }

  return (
    <AppShell>
      <div className="container mx-auto max-w-2xl px-4 py-8">
        <PageHeader title="글 수정" description="내용을 수정해보세요." />
        <CommunityForm post={{ id: post.id, tag: post.tag, title: post.title, content: post.content }} />
      </div>
    </AppShell>
  );
}
