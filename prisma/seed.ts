// 화면(목록·상세·대시보드·필터) 채우기용 더미 데이터.
// 로그인용 계정 아님 — Supabase auth.users엔 아무것도 안 만듦(의도적으로 로그인 불가).
// 재실행해도 중복 안 쌓이도록: 매번 "@teamup.local" 이메일 유저를 통째로 지우고
// (onDelete: Cascade로 CommunityPost/Recruit/RecruitRole/Application/Comment까지 연쇄 삭제)
// 고정 id로 다시 생성한다.
import { PrismaClient, CommunityTag, RecruitType, RecruitStatus, ApplicationStatus } from "@prisma/client";

const prisma = new PrismaClient();

// 고정 UUID (crypto.randomUUID()로 한 번 생성해 하드코딩) — 재실행해도 항상 같은 id.
const USERS = [
  {
    id: "b1a2c3d4-1111-4a5b-9c6d-000000000001",
    email: "seed.kim@teamup.local",
    nickname: "김기획",
    bio: "아이디어를 실현하고 싶은 비개발자 기획자입니다.",
    avatarUrl: "https://i.pravatar.cc/150?u=seed-kim",
  },
  {
    id: "b1a2c3d4-1111-4a5b-9c6d-000000000002",
    email: "seed.lee@teamup.local",
    nickname: "이인섭",
    bio: "백엔드 3년차, Spring/Java 주력.",
    avatarUrl: "https://i.pravatar.cc/150?u=seed-lee",
  },
  {
    id: "b1a2c3d4-1111-4a5b-9c6d-000000000003",
    email: "seed.park@teamup.local",
    nickname: "박디자",
    bio: null,
    avatarUrl: "https://i.pravatar.cc/150?u=seed-park",
  },
  {
    id: "b1a2c3d4-1111-4a5b-9c6d-000000000004",
    email: "seed.choi@teamup.local",
    nickname: "최코드",
    bio: "프론트/백엔드 다 하는 풀스택 개발자.",
    avatarUrl: null,
  },
  {
    id: "b1a2c3d4-1111-4a5b-9c6d-000000000005",
    email: "seed.jung@teamup.local",
    nickname: "정성장",
    bio: "PM 지망생. 사이드프로젝트로 포트폴리오 채우는 중.",
    avatarUrl: null,
  },
  {
    id: "b1a2c3d4-1111-4a5b-9c6d-000000000006",
    email: "seed.han@teamup.local",
    nickname: "한스타",
    bio: null,
    avatarUrl: "https://i.pravatar.cc/150?u=seed-han",
  },
] as const;

const [KIM, LEE, PARK, CHOI, JUNG, HAN] = USERS.map((u) => u.id);

const POSTS = [
  {
    id: "seed-post-1",
    tag: CommunityTag.IDEA,
    title: "[SEED] 자취생끼리 밥 같이 먹을 사람 매칭 앱 어때요?",
    content: "혼밥이 지겨운 자취생들끼리 근처에서 같이 밥 먹을 사람을 찾는 앱이 있으면 좋겠다는 생각이 들었어요. 다들 어떻게 생각하시나요?",
    authorId: JUNG,
  },
  {
    id: "seed-post-2",
    tag: CommunityTag.IDEA,
    title: "[SEED] 헬스장 루틴 공유하는 서비스 아이디어 있어요",
    content: "헬스 초보들이 루틴을 짜기 어려워하는 걸 많이 봤어요. 사람들이 자기 루틴을 공유하고 따라할 수 있는 서비스를 만들어보고 싶습니다.",
    authorId: HAN,
  },
  {
    id: "seed-post-3",
    tag: CommunityTag.QUESTION,
    title: "[SEED] Next.js 앱라우터 서버 액션 에러 핸들링 어떻게 하시나요?",
    content: "useActionState로 에러를 받아서 폼에 뿌려주고 있는데, 더 좋은 패턴이 있는지 궁금합니다.",
    authorId: CHOI,
  },
  {
    id: "seed-post-4",
    tag: CommunityTag.QUESTION,
    title: "[SEED] 사이드프로젝트 팀원 몇 명이 적당할까요?",
    content: "처음 사이드프로젝트를 시작하려는데 개발자+기획자 합쳐서 몇 명 정도가 적당한지 경험담 듣고 싶어요.",
    authorId: KIM,
  },
  {
    id: "seed-post-5",
    tag: CommunityTag.ETC,
    title: "[SEED] 사이드프로젝트 하면서 느낀 점 공유합니다",
    content: "1년간 사이드프로젝트를 하면서 느낀 시행착오들을 정리해봤어요. 다들 참고하시면 좋을 것 같아요.",
    authorId: LEE,
  },
  {
    id: "seed-post-6",
    tag: CommunityTag.ETC,
    title: "[SEED] 프론트엔드 스터디원 구합니다",
    content: "매주 토요일 오전에 온라인으로 프론트엔드 스터디 하실 분 구해요. React 기초~중급 다룰 예정입니다.",
    authorId: PARK,
  },
  {
    id: "seed-post-7",
    tag: CommunityTag.IDEA,
    title: "[SEED] 동네 책방 큐레이션 앱 어떨까요",
    content: "대형 서점 말고 동네 책방들의 개성 있는 큐레이션을 모아 보여주는 앱이 있으면 좋겠어요.",
    authorId: KIM,
  },
  {
    id: "seed-post-8",
    tag: CommunityTag.IDEA,
    title: "[SEED] 강아지 산책 메이트 매칭 서비스",
    content: "혼자 산책시키기 심심한 강아지 주인들끼리 매칭해주는 서비스, 이미 비슷한 거 있나요?",
    authorId: HAN,
  },
  {
    id: "seed-post-9",
    tag: CommunityTag.QUESTION,
    title: "[SEED] Prisma 트랜잭션 처리 팁 있으신가요",
    content: "여러 테이블에 걸친 생성 로직에서 트랜잭션 묶을 때 다들 어떻게 처리하시나요?",
    authorId: LEE,
  },
  {
    id: "seed-post-10",
    tag: CommunityTag.QUESTION,
    title: "[SEED] 사이드프로젝트 이름 어떻게 짓나요",
    content: "매번 프로젝트 이름 짓는 게 제일 어려운 것 같아요. 나름의 기준이 있으신가요?",
    authorId: JUNG,
  },
  {
    id: "seed-post-11",
    tag: CommunityTag.ETC,
    title: "[SEED] 첫 사이드프로젝트 회고 남깁니다",
    content: "3개월간 진행한 첫 사이드프로젝트가 드디어 끝났어요. 배운 점 정리해봤습니다.",
    authorId: CHOI,
  },
  {
    id: "seed-post-12",
    tag: CommunityTag.ETC,
    title: "[SEED] 백엔드 스터디원 모집합니다",
    content: "매주 일요일 저녁에 Node.js/Express 스터디 하실 분 구해요. 초급 환영합니다.",
    authorId: PARK,
  },
] as const;

const COMMENTS = [
  { id: "seed-comment-1-1", postId: "seed-post-1", authorId: LEE, content: "[SEED] 좋은 아이디어네요! 위치 기반으로 하면 재밌을 것 같아요." },
  { id: "seed-comment-1-2", postId: "seed-post-1", authorId: PARK, content: "[SEED] 저도 자취생인데 완전 공감돼요. 만들어지면 써보고 싶습니다." },
  { id: "seed-comment-1-3", postId: "seed-post-1", authorId: CHOI, content: "[SEED] 개발 도와드릴 수 있을 것 같은데 더 자세한 기획 있으면 공유해주세요." },
  { id: "seed-comment-2-1", postId: "seed-post-2", authorId: KIM, content: "[SEED] 루틴 인증샷 기능도 있으면 재밌겠네요." },
  { id: "seed-comment-2-2", postId: "seed-post-2", authorId: JUNG, content: "[SEED] 헬스장 제휴까지 가면 사업성도 있어 보여요." },
] as const;

const RECRUITS = [
  {
    id: "seed-recruit-1",
    type: RecruitType.DEV,
    title: "[SEED] 자취생 밥친구 매칭 앱 개발자 모집",
    content: "커뮤니티에서 반응 좋았던 자취생 밥친구 매칭 아이디어를 정식으로 만들어보려 합니다. 프론트/백엔드 함께해주실 분을 찾아요.",
    authorId: JUNG,
    techStack: ["React", "Next.js", "TypeScript"],
    problem: "자취생들이 혼밥을 자주 하고 같이 먹을 사람을 찾기 어려워함.",
    targetUser: "1인 가구, 자취 중인 대학생·직장인.",
    coreFeatures: "1) 근처 사용자 매칭 2) 채팅 3) 약속 인증",
    reference: null,
    completeness: 75,
    status: RecruitStatus.OPEN,
    promotedFromId: "seed-post-1",
    roles: [
      { id: "seed-role-1-1", name: "프론트엔드", count: 2 },
      { id: "seed-role-1-2", name: "백엔드", count: 1 },
    ],
  },
  {
    id: "seed-recruit-2",
    type: RecruitType.DEV,
    title: "[SEED] 헬스 루틴 공유 서비스 - 백엔드 개발자",
    content: "헬스 루틴을 공유하고 따라할 수 있는 서비스입니다. 백엔드 개발자를 찾고 있어요.",
    authorId: HAN,
    techStack: ["Spring", "Java", "MySQL"],
    problem: "헬스 초보가 루틴을 짜기 어려워함.",
    targetUser: "헬스 입문자.",
    coreFeatures: null,
    reference: null,
    completeness: 50,
    status: RecruitStatus.OPEN,
    promotedFromId: null,
    roles: [{ id: "seed-role-2-1", name: "백엔드", count: 1 }],
  },
  {
    id: "seed-recruit-3",
    type: RecruitType.DEV,
    title: "[SEED] 반려동물 산책 매칭 앱 Flutter 개발자",
    content: "근처 반려동물 산책 메이트를 찾는 앱을 기획 중입니다. 모바일 개발자와 디자이너를 찾아요.",
    authorId: PARK,
    techStack: ["Flutter", "Firebase", "Figma"],
    problem: "혼자 산책시키기 심심하고 사회성 훈련이 필요한 반려동물이 많음.",
    targetUser: null,
    coreFeatures: null,
    reference: null,
    completeness: 25,
    status: RecruitStatus.OPEN,
    promotedFromId: null,
    roles: [
      { id: "seed-role-3-1", name: "모바일", count: 1 },
      { id: "seed-role-3-2", name: "디자이너", count: 1 },
    ],
  },
  {
    id: "seed-recruit-4",
    type: RecruitType.DEV,
    title: "[SEED] 중고거래 안전결제 서비스 개발팀",
    content: "중고거래 사기를 막기 위한 안전결제(에스크로) 서비스를 만들려고 합니다. 팀원을 모읍니다.",
    authorId: CHOI,
    techStack: ["React", "Node.js", "PostgreSQL"],
    problem: "중고거래 사기 피해가 꾸준히 발생함.",
    targetUser: "중고거래 플랫폼 이용자.",
    coreFeatures: "1) 에스크로 결제 2) 거래 후기 3) 신고 기능",
    reference: "당근마켓, 번개장터",
    completeness: 100,
    status: RecruitStatus.OPEN,
    promotedFromId: null,
    roles: [
      { id: "seed-role-4-1", name: "프론트엔드", count: 1 },
      { id: "seed-role-4-2", name: "백엔드", count: 1 },
      { id: "seed-role-4-3", name: "디자이너", count: 1 },
    ],
  },
  {
    id: "seed-recruit-5",
    type: RecruitType.DEV,
    title: "[SEED] AI 독서모임 매칭 서비스 (모집 마감)",
    content: "독서 취향이 비슷한 사람끼리 매칭해주는 서비스입니다. 현재 팀 구성이 완료돼 모집을 마감했습니다.",
    authorId: HAN,
    techStack: ["Python", "FastAPI", "React"],
    problem: "독서모임을 찾기 어렵고 취향이 안 맞는 경우가 많음.",
    targetUser: "독서를 좋아하는 20~30대.",
    coreFeatures: "1) 취향 기반 매칭 2) 모임 일정 관리",
    reference: null,
    completeness: 90,
    status: RecruitStatus.CLOSED,
    promotedFromId: null,
    roles: [
      { id: "seed-role-5-1", name: "백엔드", count: 1 },
      { id: "seed-role-5-2", name: "프론트엔드", count: 1 },
    ],
  },
  {
    id: "seed-recruit-6",
    type: RecruitType.DEV,
    title: "[SEED] 완성된 팀 - 여행 코스 추천 서비스",
    content: "여행 코스를 자동으로 추천해주는 서비스를 팀원들과 함께 완성했습니다.",
    authorId: KIM,
    techStack: ["Next.js", "TypeScript", "Supabase"],
    problem: "여행 계획 세우는 데 시간이 오래 걸림.",
    targetUser: "국내 여행을 준비하는 사람들.",
    coreFeatures: "1) 코스 자동 추천 2) 일정표 생성 3) 공유 기능",
    reference: "마이리얼트립",
    completeness: 100,
    status: RecruitStatus.DONE,
    promotedFromId: null,
    roles: [{ id: "seed-role-6-1", name: "풀스택", count: 2 }],
  },
  {
    id: "seed-recruit-7",
    type: RecruitType.PLAN,
    title: "[SEED] 프리랜서 매칭 플랫폼 기획자를 찾습니다",
    content: "개발은 할 수 있는데 서비스 방향을 같이 잡아줄 기획자가 필요합니다.",
    authorId: CHOI,
    techStack: [],
    problem: "프리랜서와 클라이언트를 이어주는 플랫폼이 필요함.",
    targetUser: null,
    coreFeatures: null,
    reference: null,
    completeness: 25,
    status: RecruitStatus.OPEN,
    promotedFromId: null,
    roles: [{ id: "seed-role-7-1", name: "기획", count: 1 }],
  },
  {
    id: "seed-recruit-8",
    type: RecruitType.PLAN,
    title: "[SEED] 로컬 소품샵 지도 서비스 기획 함께해요",
    content: "동네 소품샵들을 모아 보여주는 지도 서비스입니다. 기획을 같이 다듬어주실 분을 찾아요.",
    authorId: LEE,
    techStack: [],
    problem: "동네 소품샵 정보를 한눈에 보기 어려움.",
    targetUser: "소품샵을 좋아하는 20~30대.",
    coreFeatures: null,
    reference: null,
    completeness: 50,
    status: RecruitStatus.OPEN,
    promotedFromId: null,
    roles: [{ id: "seed-role-8-1", name: "기획", count: 1 }],
  },
  {
    id: "seed-recruit-9",
    type: RecruitType.PLAN,
    title: "[SEED] 시니어 IT 재교육 커뮤니티 기획자 모집",
    content: "시니어 세대의 IT 재교육을 돕는 커뮤니티 서비스입니다. 기획자를 찾습니다.",
    authorId: HAN,
    techStack: [],
    problem: "시니어 세대가 IT 교육 정보를 접하기 어려움.",
    targetUser: "IT 재취업을 준비하는 5060 세대.",
    coreFeatures: "1) 커리큘럼 추천 2) 멘토 매칭",
    reference: null,
    completeness: 75,
    status: RecruitStatus.OPEN,
    promotedFromId: null,
    roles: [{ id: "seed-role-9-1", name: "기획", count: 1 }],
  },
  {
    id: "seed-recruit-10",
    type: RecruitType.PLAN,
    title: "[SEED] 반려식물 관리 알림 서비스 기획 아이디어",
    content: "반려식물 물주기·햇빛 관리를 알려주는 서비스입니다. 기획과 디자인을 함께할 분을 찾습니다.",
    authorId: PARK,
    techStack: [],
    problem: "반려식물을 자주 죽이는 초보 식집사가 많음.",
    targetUser: "반려식물을 처음 키우는 사람.",
    coreFeatures: "1) 식물별 관리 알림 2) 상태 기록 3) 커뮤니티",
    reference: "그로우, 플랜트파파",
    completeness: 100,
    status: RecruitStatus.OPEN,
    promotedFromId: null,
    roles: [
      { id: "seed-role-10-1", name: "기획", count: 1 },
      { id: "seed-role-10-2", name: "디자이너", count: 1 },
    ],
  },
  {
    id: "seed-recruit-11",
    type: RecruitType.DEV,
    title: "[SEED] 동네 책방 큐레이션 앱 개발팀",
    content: "동네 책방들의 큐레이션을 모아 보여주는 앱입니다. 프론트엔드 개발자를 찾습니다.",
    authorId: KIM,
    techStack: ["React Native", "Firebase"],
    problem: "대형 서점 위주로만 책 추천 정보가 몰려있음.",
    targetUser: "독립서점을 좋아하는 20~30대.",
    coreFeatures: "1) 서점별 큐레이션 2) 위치 기반 검색",
    reference: null,
    completeness: 50,
    status: RecruitStatus.OPEN,
    promotedFromId: "seed-post-7",
    roles: [{ id: "seed-role-11-1", name: "모바일", count: 1 }],
  },
  {
    id: "seed-recruit-12",
    type: RecruitType.DEV,
    title: "[SEED] 강아지 산책 메이트 매칭 서비스 개발자",
    content: "강아지 산책 메이트를 찾는 서비스입니다. 백엔드 개발자를 구합니다.",
    authorId: HAN,
    techStack: ["Django", "PostgreSQL"],
    problem: "혼자 산책시키기 심심한 반려견이 많음.",
    targetUser: "반려견을 키우는 1인 가구.",
    coreFeatures: null,
    reference: null,
    completeness: 25,
    status: RecruitStatus.OPEN,
    promotedFromId: "seed-post-8",
    roles: [{ id: "seed-role-12-1", name: "백엔드", count: 1 }],
  },
  {
    id: "seed-recruit-13",
    type: RecruitType.PLAN,
    title: "[SEED] 사이드프로젝트 회고 아카이빙 서비스 기획",
    content: "사이드프로젝트 회고글을 모아 아카이빙하는 서비스 기획을 함께할 분을 찾습니다.",
    authorId: CHOI,
    techStack: [],
    problem: "회고글이 여러 블로그에 흩어져있어 찾아보기 어려움.",
    targetUser: null,
    coreFeatures: null,
    completeness: 25,
    reference: null,
    status: RecruitStatus.OPEN,
    promotedFromId: "seed-post-11",
    roles: [{ id: "seed-role-13-1", name: "기획", count: 1 }],
  },
  {
    id: "seed-recruit-14",
    type: RecruitType.PLAN,
    title: "[SEED] 백엔드 스터디 커뮤니티 기획자 모집",
    content: "백엔드 스터디원들을 위한 커뮤니티 서비스입니다. 기획자를 찾습니다.",
    authorId: PARK,
    techStack: [],
    problem: "스터디 자료·일정 공유가 카톡방에 흩어져 비효율적임.",
    targetUser: "온라인 스터디 참여자.",
    coreFeatures: "1) 자료 아카이빙 2) 일정 관리",
    reference: null,
    completeness: 75,
    status: RecruitStatus.OPEN,
    promotedFromId: "seed-post-12",
    roles: [{ id: "seed-role-14-1", name: "기획", count: 1 }],
  },
  {
    id: "seed-recruit-15",
    type: RecruitType.DEV,
    title: "[SEED] 책방 큐레이션 앱 - 백엔드 합류자 구함 (모집 마감)",
    content: "큐레이션 앱 백엔드 팀이 이미 꾸려져서 모집을 마감했습니다.",
    authorId: JUNG,
    techStack: ["Node.js", "MongoDB"],
    problem: null,
    targetUser: null,
    coreFeatures: null,
    reference: null,
    completeness: 60,
    status: RecruitStatus.CLOSED,
    promotedFromId: null,
    roles: [{ id: "seed-role-15-1", name: "백엔드", count: 1 }],
  },
];

const APPLICATIONS = [
  { id: "seed-application-1", applicantId: LEE, recruitId: "seed-recruit-1", message: "[SEED] 백엔드로 지원합니다. Node.js 경험 있어요.", status: ApplicationStatus.PENDING },
  { id: "seed-application-2", applicantId: PARK, recruitId: "seed-recruit-1", message: "[SEED] 디자인 쪽으로 함께하고 싶어요.", status: ApplicationStatus.ACCEPTED },
  { id: "seed-application-3", applicantId: KIM, recruitId: "seed-recruit-2", message: "[SEED] 기획으로 참여하고 싶습니다.", status: ApplicationStatus.PENDING },
  { id: "seed-application-4", applicantId: KIM, recruitId: "seed-recruit-7", message: "[SEED] 기획자로 지원합니다.", status: ApplicationStatus.REJECTED },
  { id: "seed-application-5", applicantId: HAN, recruitId: "seed-recruit-4", message: "[SEED] 프론트엔드로 지원해요.", status: ApplicationStatus.PENDING },
  { id: "seed-application-6", applicantId: JUNG, recruitId: "seed-recruit-9", message: "[SEED] 같이 기획하고 싶습니다.", status: ApplicationStatus.ACCEPTED },
] as const;

async function cleanup() {
  const { count } = await prisma.user.deleteMany({ where: { email: { contains: "@teamup.local" } } });
  console.log(`정리: 기존 시드 User ${count}명 삭제 (연쇄로 Recruit/CommunityPost/RecruitRole/Application/Comment도 함께 삭제됨)`);
}

async function main() {
  await cleanup();

  await prisma.user.createMany({ data: USERS.map(({ id, email, nickname, bio, avatarUrl }) => ({ id, email, nickname, bio, avatarUrl })) });

  await prisma.communityPost.createMany({
    data: POSTS.map(({ id, tag, title, content, authorId }) => ({ id, tag, title, content, authorId })),
  });

  await prisma.comment.createMany({ data: [...COMMENTS] });

  for (const recruit of RECRUITS) {
    const { roles, ...data } = recruit;
    await prisma.recruit.create({
      data: {
        ...data,
        roles: { createMany: { data: roles.map(({ id, name, count }) => ({ id, name, count })) } },
      },
    });
  }

  await prisma.application.createMany({ data: [...APPLICATIONS] });

  const [userCount, postCount, commentCount, recruitCount, roleCount, applicationCount] = await Promise.all([
    prisma.user.count({ where: { email: { contains: "@teamup.local" } } }),
    prisma.communityPost.count({ where: { title: { startsWith: "[SEED]" } } }),
    prisma.comment.count({ where: { content: { startsWith: "[SEED]" } } }),
    prisma.recruit.count({ where: { title: { startsWith: "[SEED]" } } }),
    prisma.recruitRole.count({ where: { recruitId: { startsWith: "seed-recruit-" } } }),
    prisma.application.count({ where: { id: { startsWith: "seed-application-" } } }),
  ]);

  console.log("시드 완료:");
  console.log({ userCount, postCount, commentCount, recruitCount, roleCount, applicationCount });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
