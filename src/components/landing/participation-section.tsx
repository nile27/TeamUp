"use client";

import { motion } from "framer-motion";

export function ParticipationSection() {
  const roles = [
    {
      icon: "💡",
      title: "아이디어 제안자",
      desc: "해결하고 싶은 문제가 있다면 누구나 리더가 될 수 있습니다. 아이디어를 등록하고 팀을 구성하세요.",
    },
    {
      icon: "✍️",
      title: "기획/운영",
      desc: "다른 사람의 아이디어에 공감한다면 기획자로 합류하세요. 요구사항 정의와 프로젝트 매니징을 담당합니다.",
    },
    {
      icon: "💻",
      title: "개발자 (예정)",
      desc: "추후 업데이트 될 기능입니다. 아이디어를 실현할 기술 파트너로 합류하여 개발 경험을 쌓으세요.",
    },
  ];

  return (
    <section className="bg-brand-mint py-[72px] md:py-[120px]">
      <div className="max-w-[1200px] mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          viewport={{ once: true, margin: "-100px" }}
          className="mb-14"
        >
          <h2 className="font-['Plus_Jakarta_Sans',var(--font-sans)] text-[36px] md:text-[48px] font-black tracking-[-0.02em] text-brand-amber text-center leading-[1.1]">
            Participation
          </h2>
          <h3 className="text-[26px] md:text-[32px] font-extrabold text-center mt-1">
            어떤 역할로 참여할 수 있나요?
          </h3>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {roles.map((role, idx) => (
            <motion.div
              key={role.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: "easeOut", delay: idx * 0.1 }}
              viewport={{ once: true, margin: "-50px" }}
              className="bg-white rounded-2xl px-7 py-8 shadow-[0_2px_8px_rgba(43,38,32,0.06)] hover:shadow-[0_8px_24px_rgba(43,38,32,0.1)] transition-shadow"
            >
              <div className="w-12 h-12 rounded-full bg-brand-amber flex items-center justify-center text-[24px] mb-[18px]">
                {role.icon}
              </div>
              <h3 className="text-[18px] font-bold mb-2">{role.title}</h3>
              <p className="text-[14px] text-brand-ink-soft leading-[1.6]">
                {role.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
