import Link from 'next/link';

export function LandingFooter() {
  return (
    <footer className="bg-brand-ink text-[#EDE8E0] py-14 pb-8">
      <div className="max-w-[1200px] mx-auto px-6">
        <div className="flex justify-between items-start flex-wrap gap-6">
          <div className="text-[22px] font-extrabold text-white">TeamUp</div>
          <div className="flex gap-8 text-[14px] text-[#b6ada2] flex-col sm:flex-row">
            <Link href="#" className="hover:text-white transition-colors">
              서비스 소개
            </Link>
            <Link href="#" className="hover:text-white transition-colors">
              이용약관
            </Link>
            <Link href="#" className="hover:text-white transition-colors">
              개인정보처리방침
            </Link>
            <Link href="#" className="hover:text-white transition-colors">
              고객센터
            </Link>
          </div>
        </div>
        <div className="mt-8 pt-6 border-t border-[#453c33] text-[13px] text-[#8a8177]">
          © {new Date().getFullYear()} TeamUp. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
