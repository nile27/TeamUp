import { Suspense } from "react"
import Link from "next/link"
import { LoginForm } from "@/features/auth/components/login-form"
import { SocialButtons } from "@/features/auth/components/social-buttons"
import { AppShell } from "@/components/layout/app-shell"

export const metadata = {
  title: "로그인 - TeamUp",
  description: "TeamUp에 로그인하세요.",
}

function AuthFormSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="space-y-2">
        <div className="h-3.5 w-12 rounded bg-muted" />
        <div className="h-8 w-full rounded-lg bg-muted" />
      </div>
      <div className="space-y-2">
        <div className="h-3.5 w-16 rounded bg-muted" />
        <div className="h-8 w-full rounded-lg bg-muted" />
      </div>
      <div className="h-9 w-full rounded-lg bg-muted mt-6" />
    </div>
  )
}

export default function LoginPage() {
  return (
    <AppShell>
      <div className="relative flex min-h-[80vh] flex-col items-center justify-center overflow-hidden py-12 px-4 sm:px-6 lg:px-8">
        {/* 랜딩 톤을 살짝 빌려온 은은한 앰버 그라데이션 — 밋밋한 회색 배경 대신 */}
        <div
          className="pointer-events-none absolute inset-0 -z-10"
          style={{
            background:
              "radial-gradient(60% 50% at 50% 0%, var(--brand-amber-soft) 0%, transparent 70%)",
          }}
        />
        <div className="w-full max-w-md space-y-8 bg-card p-8 rounded-2xl shadow-lg shadow-black/5">
          <div className="text-center">
            <div className="mx-auto mb-4 flex size-11 items-center justify-center rounded-xl bg-primary text-primary-foreground text-lg font-bold">
              T
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-foreground">
              환영합니다
            </h2>
            <p className="mt-1.5 text-sm text-muted-foreground">
              프로젝트를 함께할 팀원을 찾아보세요.
            </p>
          </div>

          <Suspense fallback={<AuthFormSkeleton />}>
            <LoginForm />
          </Suspense>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-card px-2 text-muted-foreground">
                또는
              </span>
            </div>
          </div>

          <SocialButtons />

          <div className="text-center text-sm">
            <span className="text-muted-foreground">계정이 없으신가요? </span>
            <Link href="/signup" className="font-semibold text-primary hover:opacity-80">
              회원가입
            </Link>
          </div>
        </div>
      </div>
    </AppShell>
  )
}
