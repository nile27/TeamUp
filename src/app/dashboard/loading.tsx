import { AppShell } from "@/components/layout/app-shell";

export default function DashboardLoading() {
  return (
    <AppShell>
      <div className="container mx-auto max-w-4xl px-4 py-8 animate-pulse">
        <div className="flex items-center gap-4 mb-8">
          <div className="size-10 rounded-full bg-slate-200" />
          <div className="space-y-2">
            <div className="h-5 w-32 bg-slate-200 rounded" />
            <div className="h-4 w-40 bg-slate-200 rounded" />
          </div>
        </div>
        <div className="h-8 w-64 bg-slate-200 rounded mb-6" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2].map((i) => (
            <div key={i} className="h-[200px] bg-slate-100 rounded-xl" />
          ))}
        </div>
      </div>
    </AppShell>
  );
}
