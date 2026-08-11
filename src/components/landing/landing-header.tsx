import Link from 'next/link';

export function LandingHeader() {
  return (
    <header className="sticky top-0 z-50 bg-white/85 backdrop-blur-[8px] border-b border-brand-line">
      <div className="max-w-[1200px] mx-auto px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2 text-xl font-extrabold">
          <span className="w-[22px] h-[22px] rounded-md bg-brand-amber"></span>
          TeamUp
        </div>
        <nav className="hidden md:flex gap-7 text-[15px] font-medium">
          <Link href="#" className="text-brand-ink-soft hover:text-brand-ink transition-colors">
            팀 찾기
          </Link>
          <Link href="#" className="text-brand-ink-soft hover:text-brand-ink transition-colors">
            아이디어 랩
          </Link>
          <Link href="#" className="text-brand-ink-soft hover:text-brand-ink transition-colors">
            커뮤니티
          </Link>
          <Link href="#" className="text-brand-ink-soft hover:text-brand-ink transition-colors">
            소개
          </Link>
        </nav>
        <div className="flex items-center gap-3.5 text-[15px]">
          <Link
            href="#"
            className="text-brand-ink-soft font-semibold hover:text-brand-ink transition-colors"
          >
            로그인
          </Link>
          <button className="inline-flex items-center gap-2 text-[14px] font-semibold rounded-lg px-[18px] py-[9px] bg-brand-amber text-brand-ink hover:bg-brand-amber-deep transition-colors">
            회원가입
          </button>
        </div>
      </div>
    </header>
  );
}
