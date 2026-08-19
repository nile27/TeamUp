import { AppShell } from "@/components/layout/app-shell";

export default function CommunityDetailLoading() {
  return (
    <AppShell>
      <div className="container mx-auto max-w-2xl px-4 py-8 animate-pulse">
        <div className="h-5 w-16 bg-slate-200 rounded mb-3" />
        <div className="h-8 w-3/4 bg-slate-200 rounded mb-2" />
        <div className="h-4 w-32 bg-slate-200 rounded mb-6" />
        <div className="h-4 w-full bg-slate-200 rounded mb-2" />
        <div className="h-4 w-5/6 bg-slate-200 rounded mb-2" />
        <div className="h-4 w-2/3 bg-slate-200 rounded" />
      </div>
    </AppShell>
  );
}
