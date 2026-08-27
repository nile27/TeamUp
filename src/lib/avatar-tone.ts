// 닉네임/작성자명을 해시해서 아바타 배경색을 고정 배정 — 목록을 훑을 때 색으로도
// 구분되게 하기 위함(전부 같은 톤이면 텍스트만 있는 밋밋한 리스트가 됨).
const AVATAR_TONES = [
  "bg-brand-amber-soft text-brand-amber-deep",
  "bg-brand-sky text-sky-700",
  "bg-brand-mint text-emerald-700",
];

export function avatarTone(seed: string) {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) hash = (hash + seed.charCodeAt(i)) % AVATAR_TONES.length;
  return AVATAR_TONES[hash];
}
