import { AppShell } from "@/components/layout/app-shell";

export default function RecruitDetailLoading() {
  return (
    <AppShell>
      <div className="container mx-auto max-w-4xl px-4 py-8 animate-pulse">
        <div className="h-5 w-24 bg-muted rounded mb-4" />
        <div className="h-8 w-2/3 bg-muted rounded mb-2" />
        <div className="h-4 w-40 bg-muted rounded mb-6" />
        <div className="h-20 w-full bg-muted rounded mb-6" />
        <div className="h-4 w-full bg-muted rounded mb-2" />
        <div className="h-4 w-5/6 bg-muted rounded mb-2" />
        <div className="h-4 w-3/4 bg-muted rounded" />
      </div>
    </AppShell>
  );
}
