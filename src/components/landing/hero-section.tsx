"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";

export function HeroSection() {
  return (
    <section className="bg-brand-sky min-h-[calc(100vh-64px)] flex items-center py-10 md:py-18">
      <div className="max-w-[1200px] mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-9 md:gap-12 items-center w-full">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          viewport={{ once: true }}
          className="text-center md:text-left"
        >
          <h1 className="font-['Plus_Jakarta_Sans',var(--font-sans)] text-[34px] sm:text-[40px] md:text-[56px] font-extrabold leading-[1.2] tracking-[-0.01em]">
            개발 못 해도,<br />
            기획자로 참여하세요
          </h1>
          <p className="text-[18px] text-brand-ink-soft my-5 md:my-8">
            아이디어만 있어도 괜찮습니다. 함께 팀을 이뤄 프로젝트를 현실로 만드세요.
          </p>
          <div className="flex justify-center md:justify-start gap-3">
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 text-[16px] font-semibold rounded-lg px-6 py-[13px] bg-brand-amber text-brand-ink hover:bg-brand-amber-deep transition-colors"
            >
              시작하기
            </Link>
            <Link
              href="/recruit"
              className="inline-flex items-center gap-2 text-[16px] font-semibold rounded-lg px-6 py-[13px] bg-transparent text-brand-ink border-[1.5px] border-brand-ink hover:bg-brand-ink hover:text-white transition-colors"
            >
              둘러보기
            </Link>
          </div>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut", delay: 0.2 }}
          viewport={{ once: true }}
          className="flex items-center justify-center min-h-[300px]"
        >
          <Image
            src="/illustrations/hero.svg"
            alt="팀업 히어로 일러스트"
            width={440}
            height={440}
            className="w-full max-w-[440px] h-auto object-contain"
            priority
          />
        </motion.div>
      </div>
    </section>
  );
}
