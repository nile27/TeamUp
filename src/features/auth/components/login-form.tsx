"use client"

import { useActionState, useEffect, useTransition } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { loginSchema, type LoginInput } from "../schema"
import { login } from "../actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2 } from "lucide-react"
import { useSearchParams } from "next/navigation"

export function LoginForm() {
  const [state, formAction, isPending] = useActionState(login, null)
  const [isTransitioning, startTransition] = useTransition()

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
    mode: "onBlur", // 타이핑 중엔 에러 안 띄우고 블러/제출 시 표시
  })

  useEffect(() => {
    if (state?.success) {
      window.location.href = "/"
      return
    }
    
    if (state?.fieldErrors) {
      Object.entries(state.fieldErrors).forEach(([key, message]) => {
        setError(key as keyof LoginInput, { type: "server", message })
      })
    }
  }, [state, setError])

  const searchParams = useSearchParams()
  const signupSuccess = searchParams.get("signup") === "success"

  useEffect(() => {
    if (signupSuccess) {
      // Remove the parameter from the URL so it doesn't show again on refresh
      const newUrl = new URL(window.location.href)
      newUrl.searchParams.delete("signup")
      window.history.replaceState({}, "", newUrl)
    }
  }, [signupSuccess])

  const onSubmit = (data: LoginInput) => {
    const formData = new FormData()
    formData.append("email", data.email)
    formData.append("password", data.password)
    startTransition(() => {
      formAction(formData)
    })
  }

  const isLoading = isPending || isTransitioning

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {signupSuccess && (
        <div className="rounded-md border border-green-600/30 bg-green-50 px-4 py-3 text-sm text-green-700">
          회원가입이 완료되었습니다. 로그인해주세요.
        </div>
      )}

      {state?.error && (
        <div className="rounded-md border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {state.error}
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="email">이메일</Label>
        <Input
          id="email"
          type="email"
          placeholder="name@example.com"
          {...register("email")}
          disabled={isLoading}
        />
        {errors.email && (
          <p className="text-sm text-destructive">{errors.email.message}</p>
        )}
      </div>
      
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="password">비밀번호</Label>
        </div>
        <Input
          id="password"
          type="password"
          {...register("password")}
          disabled={isLoading}
        />
        {errors.password && (
          <p className="text-sm text-destructive">{errors.password.message}</p>
        )}
      </div>

      <Button 
        type="submit" 
        className="w-full"
        disabled={isLoading}
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            로그인 중...
          </>
        ) : (
          "로그인"
        )}
      </Button>
    </form>
  )
}
