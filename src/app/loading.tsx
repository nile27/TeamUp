import { AppShell } from "@/components/layout/app-shell";

// recruit/[id]·dashboard처럼 자체 loading.tsx가 있는 세그먼트는 그게 우선 적용되고,
// 이건 그 외(recruit/new, community/new 등 auth 확인 후 렌더되는 폼 페이지)의 폴백.
export default function GlobalLoading() {
  return (
    <AppShell>
      <div className="container mx-auto max-w-4xl px-4 py-8 animate-pulse">
        <div className="h-8 w-48 bg-slate-200 rounded mb-6" />
        <div className="space-y-3">
          <div className="h-4 w-full bg-slate-100 rounded" />
          <div className="h-4 w-5/6 bg-slate-100 rounded" />
          <div className="h-4 w-2/3 bg-slate-100 rounded" />
        </div>
        <div className="h-40 bg-slate-100 rounded-xl mt-6" />
      </div>
    </AppShell>
  );
}
