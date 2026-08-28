import Link from 'next/link';
import { buttonVariants } from '@/components/ui/button';
import { createClient } from '@/server/supabase';
import { logout } from '@/features/auth/actions';

export async function AppNav() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-14 items-center px-4 md:px-6">
        <div className="mr-4 flex items-center">
          <Link href="/" className="mr-8 flex items-center">
            <img
              src="/brand/logo-wordmark.png"
              alt="TeamUp"
              className="h-7 w-auto"
            />
          </Link>
          <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
            <Link href="/recruit" className="transition-colors hover:text-foreground/80 text-foreground">
              팀 찾기
            </Link>
            <Link href="/community" className="transition-colors hover:text-foreground/80 text-muted-foreground">
              커뮤니티
            </Link>
          </nav>
        </div>
        <div className="flex flex-1 items-center justify-end space-x-2">
          <nav className="flex items-center space-x-2">
            {user ? (
              <>
                <Link href="/dashboard" className={buttonVariants({ variant: "ghost" })}>
                  마이페이지
                </Link>
                <form action={logout}>
                  <button type="submit" className={buttonVariants({ variant: "ghost" })}>
                    로그아웃
                  </button>
                </form>
              </>
            ) : (
              <>
                <Link href="/login" className={buttonVariants({ variant: "ghost" })}>
                  로그인
                </Link>
                <Link href="/signup" className={buttonVariants()}>
                  시작하기
                </Link>
              </>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}
