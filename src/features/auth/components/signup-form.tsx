"use client"

import { useActionState, useEffect, useTransition } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { signupSchema, type SignupInput } from "../schema"
import { signup } from "../actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2 } from "lucide-react"

export function SignupForm() {
  const [state, formAction, isPending] = useActionState(signup, null)
  const [isTransitioning, startTransition] = useTransition()

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<SignupInput>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      email: "",
      password: "",
      nickname: "",
    },
    mode: "onBlur", // 타이핑 중엔 에러 안 띄우고 블러/제출 시 표시
  })

  // 서버 에러 동기화
  useEffect(() => {
    if (state?.fieldErrors) {
      Object.entries(state.fieldErrors).forEach(([key, message]) => {
        setError(key as any, { type: "server", message })
      })
    }
  }, [state, setError])

  // 성공 메시지 (actions.ts에서 redirect('/?signup=success')로 보낸 경우 등 처리)
  // 단, 여기서는 signup 라우트 자체에 있을 때를 대비해 처리하지 않고 layout이나 page에서 처리해도 되지만
  // 가장 단순하게 폼에서 바로 토스트를 띄우려면 리다이렉트가 일어나기 전을 알 수 없으므로 
  // actions.ts에서 리다이렉트 한 뒤 메인 페이지에서 띄워주는 것이 안전합니다. (현재는 메인에서 처리 권장)

  const onSubmit = (data: SignupInput) => {
    const formData = new FormData()
    formData.append("email", data.email)
    formData.append("password", data.password)
    formData.append("nickname", data.nickname)
    startTransition(() => {
      formAction(formData)
    })
  }

  const isLoading = isPending || isTransitioning

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
        <Label htmlFor="nickname">닉네임</Label>
        <Input
          id="nickname"
          type="text"
          placeholder="사용하실 닉네임을 입력해주세요"
          {...register("nickname")}
          disabled={isLoading}
        />
        {errors.nickname && (
          <p className="text-sm text-destructive">{errors.nickname.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">비밀번호</Label>
        <Input
          id="password"
          type="password"
          placeholder="영문, 숫자, 특수문자 포함 8자 이상"
          {...register("password")}
          disabled={isLoading}
        />
        {errors.password ? (
          <p className="text-sm text-destructive">{errors.password.message}</p>
        ) : (
          <p className="text-sm text-muted-foreground">영문, 숫자, 특수문자를 모두 포함해 8자 이상 입력해주세요.</p>
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
            가입 중...
          </>
        ) : (
          "회원가입"
        )}
      </Button>
    </form>
  )
}
