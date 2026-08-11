"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { createClient } from "@/server/supabase"
import { loginSchema, signupSchema, type LoginInput, type SignupInput } from "./schema"
import { prisma } from "@/server/db"

export type AuthActionState = {
  error?: string
  fieldErrors?: Record<string, string>
} | null

export async function login(prevState: AuthActionState, formData: FormData): Promise<AuthActionState> {
  const data = Object.fromEntries(formData.entries())
  const parsed = loginSchema.safeParse(data)
  
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {}
    parsed.error.issues.forEach((issue) => {
      if (issue.path[0] !== undefined) fieldErrors[String(issue.path[0])] = issue.message
    })
    return { error: "입력값이 올바르지 않습니다.", fieldErrors }
  }

  const supabase = await createClient()
  
  const { error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  })

  if (error) {
    return { 
      error: "이메일 또는 비밀번호가 일치하지 않습니다.",
      fieldErrors: { email: "이메일 또는 비밀번호가 일치하지 않습니다." }
    }
  }

  revalidatePath("/")
  redirect("/")
}

export async function signup(prevState: AuthActionState, formData: FormData): Promise<AuthActionState> {
  const data = Object.fromEntries(formData.entries())
  const parsed = signupSchema.safeParse(data)
  
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {}
    parsed.error.issues.forEach((issue) => {
      if (issue.path[0] !== undefined) fieldErrors[String(issue.path[0])] = issue.message
    })
    return { error: "입력값이 올바르지 않습니다.", fieldErrors }
  }

  const supabase = await createClient()

  // 1. Supabase Auth에 사용자 생성
  const { data: authData, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: {
        nickname: parsed.data.nickname,
      },
    },
  })

  if (error) {
    if (error.message.includes("already registered") || error.message.includes("already exists")) {
      return { 
        error: "회원가입에 실패했습니다.",
        fieldErrors: { email: "이미 가입된 이메일입니다." }
      }
    }
    return { error: error.message }
  }

  if (authData.user) {
    // 2. Prisma User 테이블에 프로필 레코드 생성
    try {
      // 이미 존재하는지 확인 (만약의 경우 대비)
      const existingUser = await prisma.user.findUnique({
        where: { id: authData.user.id },
      })

      if (!existingUser) {
        await prisma.user.create({
          data: {
            id: authData.user.id,
            email: parsed.data.email,
            nickname: parsed.data.nickname,
          },
        })
      }
    } catch (dbError) {
      console.error("DB 생성 에러:", dbError)
      return { error: "프로필 생성 중 오류가 발생했습니다. 다시 시도해주세요." }
    }
  }

  // Next.js redirect는 에러를 던지기 때문에 성공 토스트를 클라이언트에서 띄우기 위해
  // 리다이렉트 파라미터나 쿠키를 사용할 수도 있지만,
  // 가장 단순하게는 로그인 페이지로 리다이렉트하거나 홈으로 보냅니다.
  // 성공 메시지는 login 후 리다이렉트 시 확인하기 어려우므로, 
  // 여기서는 클라이언트 측에서 상태를 받지 못하고 바로 넘어갑니다.
  revalidatePath("/")
  redirect("/?signup=success")
}

export async function logout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  revalidatePath("/")
  redirect("/login")
}

export async function socialLogin(provider: "google" | "kakao") {
  const supabase = await createClient()
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      // OAuth 로그인 후 콜백 라우트로 리다이렉트 (여기서 DB 동기화 등 처리)
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'}/auth/callback`,
    },
  })

  if (error) {
    console.error("OAuth 로그인 에러:", error.message)
    return { error: "소셜 로그인 중 오류가 발생했습니다." }
  }

  if (data.url) {
    redirect(data.url)
  }
}
