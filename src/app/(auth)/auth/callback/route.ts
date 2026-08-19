import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { prisma } from '@/server/db'
import { Prisma } from '@prisma/client'

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

          // 카카오는 비즈니스 채널 연동 전엔 이메일 동의항목을 못 받아서 email이
          // 빈 값으로 올 수 있음. User.email이 @unique라 빈 문자열로 두 명 이상
          // 가입하면 충돌하므로, 없으면 auth id 기반의 유일한 값으로 대체.
          const email = user.email || `${user.id}@users.teamup.local`

          await prisma.user.create({
            data: {
              id: user.id,
              email,
              nickname: defaultNickname,
              avatarUrl: metadata.avatar_url || metadata.picture || null,
            },
          })
        }
      } catch (dbError) {
        // 정상적인 경우 Supabase가 같은 이메일의 기존 계정과 auth id를 자동으로
        // 합쳐주기 때문에(automatic identity linking) 이 unique 충돌은 거의 안
        // 일어나야 정상. 혹시 발생하면(예: 이메일 인증 상태 불일치 등) 프로필 없이
        // 로그인만 된 반쪽 상태로 두지 않고, 세션을 정리하고 안내 메시지로 돌려보냄.
        const isEmailConflict =
          dbError instanceof Prisma.PrismaClientKnownRequestError &&
          dbError.code === 'P2002' &&
          (dbError.meta?.target as string[] | undefined)?.includes('email')

        console.error('OAuth 유저 동기화 실패:', dbError)

        if (isEmailConflict) {
          await supabase.auth.signOut()
          return NextResponse.redirect(`${origin}/login?error=email-already-registered`)
        }
      }

      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth-callback-failed`)
}
