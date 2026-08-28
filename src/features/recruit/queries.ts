import { unstable_cache } from "next/cache";
import { prisma } from "@/server/db";

const PAGE_SIZE = 9;
const CURSOR_PAGE_SIZE = 10;

// GET /api/recruit(모바일 무한 스크롤)용 — 페이지 번호가 아니라 "마지막으로 받은 항목의
// id 다음부터 N개" 방식. 스크롤 중 새 글이 올라와도 offset 방식과 달리 항목이 밀려서
// 중복/누락되는 문제가 없음. cursor 없으면 최신부터 시작.
export async function getCursorRecruitList(techStackFilter: string[] | undefined, cursor?: string) {
  const whereClause = techStackFilter && techStackFilter.length > 0
    ? { techStack: { hasSome: techStackFilter } }
    : {};

  const recruits = await prisma.recruit.findMany({
    where: whereClause,
    orderBy: { createdAt: "desc" },
    take: CURSOR_PAGE_SIZE + 1, // +1개를 더 가져와서 다음 페이지 존재 여부 판단(별도 count 쿼리 없이)
    ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    include: {
      roles: true,
      _count: {
        select: { applications: true, bookmarks: true }
      }
    }
  });

  const hasMore = recruits.length > CURSOR_PAGE_SIZE;
  const page = hasMore ? recruits.slice(0, CURSOR_PAGE_SIZE) : recruits;
  const nextCursor = hasMore ? page[page.length - 1].id : null;

  return { recruits: page, nextCursor };
}

export async function getPaginatedRecruitList(techStackFilter: string[] | undefined, page: number) {
  const whereClause = techStackFilter && techStackFilter.length > 0
    ? { techStack: { hasSome: techStackFilter } }
    : {};

  const [recruits, total] = await Promise.all([
    prisma.recruit.findMany({
      where: whereClause,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      include: {
        roles: true,
        _count: {
          select: { applications: true, bookmarks: true }
        }
      }
    }),
    prisma.recruit.count({ where: whereClause }),
  ]);

  return { recruits, totalPages: Math.max(1, Math.ceil(total / PAGE_SIZE)) };
}

// ISR: /recruit/[id] — revalidateTag(`recruit-${id}`)로 지원/수정 시 갱신
export function getRecruitById(id: string) {
  return unstable_cache(
    async () => {
      return prisma.recruit.findUnique({
        where: { id },
        include: {
          author: { select: { id: true, nickname: true, avatarUrl: true } },
          roles: true,
          _count: { select: { applications: true, bookmarks: true } },
        },
      });
    },
    [`recruit-${id}`],
    { tags: [`recruit-${id}`] }
  )();
}

export async function getApplicationForUser(recruitId: string, userId: string) {
  return prisma.application.findUnique({
    where: { applicantId_recruitId: { applicantId: userId, recruitId } },
  });
}

// 로그인 유저가 이 모집을 저장(북마크)했는지 — getRecruitById는 모든 유저가 공유하는
// ISR 캐시라 유저별 상태를 못 담음. 별도의 캐시 안 되는 쿼리로 분리.
export async function getBookmarkForUser(recruitId: string, userId: string) {
  return prisma.recruitBookmark.findUnique({
    where: { userId_recruitId: { userId, recruitId } },
  });
}

// 수정 폼 프리필용 — ISR 캐시(getRecruitById)를 안 쓰고 매번 최신 값을 직접 조회.
export async function getRecruitForEdit(id: string) {
  return prisma.recruit.findUnique({
    where: { id },
    include: { roles: true },
  });
}

// 모집 작성자용 — 지원자 확인/수락/거절 화면(/recruit/[id]/applicants)에서 사용.
// 작성자 본인인지는 페이지에서 recruit.authorId로 확인.
export async function getRecruitForApplicants(id: string) {
  return prisma.recruit.findUnique({
    where: { id },
    include: {
      applications: {
        orderBy: { createdAt: "desc" },
        include: {
          applicant: { select: { id: true, nickname: true, avatarUrl: true, bio: true, email: true, portfolio: true } },
        },
      },
    },
  });
}
