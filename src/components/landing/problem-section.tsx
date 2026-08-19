"use client";

import Image from "next/image";
import { motion } from "framer-motion";

export function ProblemSection() {
  return (
    <section className="bg-brand-amber-soft py-[72px] md:py-[120px]">
      <div className="max-w-[1200px] mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-9 md:gap-6 items-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          viewport={{ once: true, margin: "-100px" }}
        >
          <div className="mb-14">
            <h2 className="font-['Plus_Jakarta_Sans',var(--font-sans)] text-[36px] md:text-[48px] font-black tracking-[-0.02em] text-brand-amber text-center md:text-left leading-[1.1]">
              Why TeamUp?
            </h2>
            <h3 className="text-[26px] md:text-[32px] font-extrabold text-center md:text-left mt-1">
              이런 고민 해보신 적 있나요?
            </h3>
          </div>
          
          <div className="flex flex-col gap-4">
            <div className="bg-white border border-brand-line rounded-xl p-6 flex gap-4 items-start">
              <div className="shrink-0 w-10 h-10 rounded-md bg-brand-amber-soft flex items-center justify-center text-[20px]">
                🤔
              </div>
              <div>
                <h3 className="text-[17px] font-bold mb-1.5">아이디어는 많은데 개발을 못해요</h3>
                <p className="text-[14px] text-brand-ink-soft">
                  혼자서 앱을 만들 수 없어서 아이디어 노트에만 묵혀두고 계신가요?
                </p>
              </div>
            </div>
            
            <div className="bg-white border border-brand-line rounded-xl p-6 flex gap-4 items-start">
              <div className="shrink-0 w-10 h-10 rounded-md bg-brand-amber-soft flex items-center justify-center text-[20px]">
                🔍
              </div>
              <div>
                <h3 className="text-[17px] font-bold mb-1.5">개발자 모임에 가면 소외감을 느껴요</h3>
                <p className="text-[14px] text-brand-ink-soft">
                  테크 위주의 네트워킹에서는 기획자가 설 자리가 없으셨죠?
                </p>
              </div>
            </div>
            
            <div className="bg-white border border-brand-line rounded-xl p-6 flex gap-4 items-start">
              <div className="shrink-0 w-10 h-10 rounded-md bg-brand-amber-soft flex items-center justify-center text-[20px]">
                🚀
              </div>
              <div>
                <h3 className="text-[17px] font-bold mb-1.5">실전 포트폴리오가 필요해요</h3>
                <p className="text-[14px] text-brand-ink-soft">
                  강의 과제가 아닌, 실제로 작동하는 프로덕트를 만들어보고 싶으신가요?
                </p>
              </div>
            </div>
          </div>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut", delay: 0.2 }}
          viewport={{ once: true, margin: "-100px" }}
          className="flex items-center justify-center rounded-2xl min-h-[200px] md:min-h-[300px]"
        >
          <Image
            src="/illustrations/problem.svg"
            alt="고민하는 기획자 일러스트"
            width={400}
            height={400}
            className="w-full max-w-[400px] h-auto object-contain"
          />
        </motion.div>
      </div>
    </section>
  );
}
