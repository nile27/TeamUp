import Link from "next/link"
import { LoginForm } from "@/features/auth/components/login-form"
import { SocialButtons } from "@/features/auth/components/social-buttons"
import { AppShell } from "@/components/layout/app-shell"

export const metadata = {
  title: "로그인 - TeamUp",
  description: "TeamUp에 로그인하세요.",
}

export default function LoginPage() {
  return (
    <AppShell>
      <div className="flex min-h-[80vh] flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-[#F9FAFB]">
        <div className="w-full max-w-md space-y-8 bg-white p-8 rounded-2xl shadow-sm border border-border/50">
          <div className="text-center">
            <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-[#2B2620]">
              환영합니다!
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              프로젝트를 함께할 팀원을 찾아보세요.
            </p>
          </div>
          
          <LoginForm />
          
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-white px-2 text-muted-foreground">
                또는
              </span>
            </div>
          </div>
          
          <SocialButtons />
          
          <div className="text-center text-sm">
            <span className="text-muted-foreground">계정이 없으신가요? </span>
            <Link href="/signup" className="font-semibold text-[#FFA940] hover:text-[#F08C00]">
              회원가입
            </Link>
          </div>
        </div>
      </div>
    </AppShell>
  )
}
