"use client";

import { motion } from "framer-motion";

export function FlowSection() {
  const steps = [
    {
      num: 1,
      title: "아이디어 등록",
      desc: "풀고 싶은 문제와 솔루션을 간략히 정리해 팀원을 모집하세요.",
    },
    {
      num: 2,
      title: "개발자 매칭",
      desc: "내 아이디어에 공감하는 개발자가 합류하여 팀이 결성됩니다.",
    },
    {
      num: 3,
      title: "프로젝트 진행",
      desc: "기획자로서 요구사항을 정의하고 개발 과정의 방향을 잡습니다.",
    },
    {
      num: 4,
      title: "런칭 및 포트폴리오",
      desc: "실제 서비스를 런칭하고 나의 기여도를 증명하는 포트폴리오를 얻습니다.",
    },
  ];

  return (
    <section className="py-[72px] md:py-[120px] bg-white">
      <div className="max-w-[1200px] mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          viewport={{ once: true, margin: "-100px" }}
          className="mb-14"
        >
          <h2 className="font-['Plus_Jakarta_Sans',var(--font-sans)] text-[36px] md:text-[48px] font-black tracking-[-0.02em] text-brand-amber text-center leading-[1.1]">
            How it works
          </h2>
          <h3 className="text-[26px] md:text-[32px] font-extrabold text-center mt-1">
            기획부터 런칭까지, 이렇게 진행됩니다
          </h3>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-x-5 gap-y-10 mt-2">
          {steps.map((step, idx) => (
            <motion.div
              key={step.num}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: "easeOut", delay: idx * 0.1 }}
              viewport={{ once: true, margin: "-50px" }}
              className="relative px-2 text-center"
            >
              {/* 카드 대신 연결된 타임라인 — 숫자 원 사이를 선으로 이어서 "단계"라는
                  흐름을 시각적으로 보여줌. FlowSection만의 정체성을 줌. */}
              {idx < steps.length - 1 && (
                <div className="hidden md:block absolute top-5 left-[calc(50%+24px)] right-[calc(-50%+24px)] h-px bg-brand-line" />
              )}
              <div className="relative z-10 w-10 h-10 rounded-full bg-brand-amber text-brand-ink font-extrabold flex items-center justify-center mx-auto mb-4 text-[16px] ring-4 ring-white">
                {step.num}
              </div>
              <h3 className="text-[16px] font-bold mb-1.5">{step.title}</h3>
              <p className="text-[13px] text-brand-ink-soft">{step.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
