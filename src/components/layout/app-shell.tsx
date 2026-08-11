import { AppNav } from './app-nav';

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-screen flex-col bg-background">
      <AppNav />
      <main className="flex-1 w-full bg-slate-50/50">
        {children}
      </main>
    </div>
  );
}
