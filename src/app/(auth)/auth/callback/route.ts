import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { prisma } from '@/server/db'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  // if "next" is in param, use it as the redirect URL
  const next = searchParams.get('next') ?? '/'

  if (code) {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              )
            } catch (error) {
              // Ignore
            }
          },
        },
      }
    )
    
    const { error, data } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error && data.session?.user) {
      const user = data.session.user
      
      try {
        // OAuth 로그인 시 Prisma User 테이블 동기화
        const existingUser = await prisma.user.findUnique({
          where: { id: user.id },
        })

        if (!existingUser) {
          // OAuth에서 제공하는 정보로 닉네임 생성 (구글/카카오)
          const metadata = user.user_metadata
          const defaultNickname = metadata.full_name || metadata.name || metadata.preferred_username || user.email?.split('@')[0] || '사용자'
          
          await prisma.user.create({
            data: {
              id: user.id,
              email: user.email ?? '',
              nickname: defaultNickname,
              avatarUrl: metadata.avatar_url || metadata.picture || null,
            },
          })
        }
      } catch (dbError) {
        console.error('OAuth 유저 동기화 실패:', dbError)
      }
      
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth-callback-failed`)
}
