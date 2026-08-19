"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";

export function PlannerSection() {
  return (
    <section className="bg-brand-amber-soft py-[72px] md:py-[120px]">
      <div className="max-w-[1200px] mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-9 md:gap-12 items-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          viewport={{ once: true, margin: "-100px" }}
          className="order-last md:order-first flex items-center justify-center min-h-[280px]"
        >
          <Image
            src="/illustrations/planner.svg"
            alt="기획자를 위한 가이드 일러스트"
            width={400}
            height={400}
            className="w-full max-w-[400px] h-auto object-contain"
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut", delay: 0.2 }}
          viewport={{ once: true, margin: "-100px" }}
          className="text-center md:text-left"
        >
          <h2 className="font-['Plus_Jakarta_Sans',var(--font-sans)] text-[36px] md:text-[48px] font-black tracking-[-0.02em] text-brand-amber leading-[1.1]">
            For Planners
          </h2>
          <h3 className="text-[26px] md:text-[32px] font-extrabold mt-1 mb-4">
            기획자를 위한 특별한 공간
          </h3>
          <p className="text-[16px] text-brand-ink-soft mb-3 leading-[1.6]">
            단순히 아이디어를 내는 것에 그치지 않습니다.
          </p>
          <p className="text-[16px] text-brand-ink-soft mb-3 leading-[1.6]">
            체계적인 가이드와 템플릿을 통해 전문적인 기획 문서 작성법을 배우고, 팀원들과 원활하게 소통하는 방법을 체득하세요.
          </p>
          <Link
            href="/recruit/new"
            className="mt-5 inline-flex items-center gap-2 text-[16px] font-semibold rounded-lg px-6 py-[13px] bg-transparent text-brand-ink border-[1.5px] border-brand-ink hover:bg-brand-ink hover:text-white transition-colors"
          >
            기획자 가이드 보기
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
