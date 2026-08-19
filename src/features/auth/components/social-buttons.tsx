"use client"

import { useState, useTransition } from "react"
import { Button } from "@/components/ui/button"
import { socialLogin } from "../actions"
import { Loader2 } from "lucide-react"

export function SocialButtons() {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const handleSocialLogin = (provider: "google" | "kakao") => {
    setError(null)
    startTransition(async () => {
      const result = await socialLogin(provider)
      if (result?.error) {
        setError(result.error)
      }
    })
  }

  return (
    <div className="flex flex-col space-y-3">
      {error && (
        <div className="rounded-md border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <Button
        type="button"
        variant="outline"
        className="w-full relative h-11 bg-white text-black hover:bg-slate-50 border-slate-200"
        onClick={() => handleSocialLogin("google")}
        disabled={isPending}
      >
        <div className="absolute left-4">
          {/* Google Logo SVG */}
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
        </div>
        {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Google로 계속하기"}
      </Button>

      <Button
        type="button"
        variant="outline"
        className="w-full relative h-11 bg-[#FEE500] text-black hover:bg-[#FEE500]/90 border-transparent font-medium"
        onClick={() => handleSocialLogin("kakao")}
        disabled={isPending}
      >
        <div className="absolute left-4">
          {/* Kakao Logo SVG */}
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 3C6.477 3 2 6.518 2 10.857c0 2.805 1.83 5.253 4.606 6.551-.157.575-.563 2.164-.64 2.518-.1.463.161.455.334.34.135-.09 2.15-1.442 3.023-2.034.863.125 1.76.19 2.677.19 5.523 0 10-3.518 10-7.857C22 6.518 17.523 3 12 3z" fill="#000000"/>
          </svg>
        </div>
        {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "카카오로 계속하기"}
      </Button>
    </div>
  )
}
