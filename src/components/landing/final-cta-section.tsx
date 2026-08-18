"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export function FinalCtaSection() {
  return (
    <section className="bg-white py-[72px] md:py-[120px] text-center">
      <div className="max-w-[1200px] mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          viewport={{ once: true, margin: "-100px" }}
        >
          <h2 className="text-[28px] md:text-[36px] font-extrabold text-brand-ink">
            지금 바로 당신의 아이디어를 팀과 공유하세요
          </h2>
          <p className="text-[16px] text-brand-ink-soft my-3.5 mb-7">
            망설이지 마세요. 완벽한 계획보다 빠른 실행이 프로젝트의 첫 걸음입니다.
          </p>
          <Link
            href="/signup"
            className="inline-flex items-center justify-center gap-2 text-[16px] font-semibold rounded-lg px-6 py-[13px] bg-brand-amber text-brand-ink hover:bg-brand-amber-deep transition-colors"
          >
            프로젝트 시작하기
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
