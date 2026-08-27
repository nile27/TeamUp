import { OpenAPIRegistry, OpenApiGeneratorV31, extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import { z } from "zod";
import {
  createRecruitSchema,
  applyToRecruitSchema,
} from "@/features/recruit/schema";
import { ensureProfileSchema } from "@/features/auth/schema";
import { createCommentSchema } from "@/features/community/schema";

// z.object() 인스턴스에 .openapi()를 붙일 수 있게 zod 프로토타입 확장.
// 요청 스키마는 features/*/schema.ts의 기존 zod를 그대로 재사용 — 여기서 다시 정의하지 않음.
extendZodWithOpenApi(z);

const registry = new OpenAPIRegistry();

registry.registerComponent("securitySchemes", "bearerAuth", {
  type: "http",
  scheme: "bearer",
  description: "Supabase access token. 쿠키 세션이 없는 클라이언트(RN 등)가 사용.",
});

// ── 응답 스키마 (문서 전용 — Prisma 반환값 설명. 요청 검증에는 관여하지 않음) ──

const errorSchema = registry.register(
  "Error",
  z.object({
    error: z.string(),
    fieldErrors: z.record(z.string(), z.array(z.string())).optional(),
  })
);

const recruitRoleSchema = registry.register(
  "RecruitRole",
  z.object({
    id: z.string(),
    name: z.string(),
    count: z.number(),
  })
);

const recruitCountSchema = z.object({
  applications: z.number(),
  bookmarks: z.number(),
});

const recruitSchema = registry.register(
  "Recruit",
  z.object({
    id: z.string(),
    type: z.enum(["DEV", "PLAN"]),
    title: z.string(),
    content: z.string(),
    techStack: z.array(z.string()),
    problem: z.string().nullable(),
    targetUser: z.string().nullable(),
    coreFeatures: z.string().nullable(),
    reference: z.string().nullable(),
    completeness: z.number(),
    status: z.enum(["OPEN", "CLOSED", "DONE"]),
    viewCount: z.number(),
    createdAt: z.string(),
    updatedAt: z.string(),
    roles: z.array(recruitRoleSchema),
    _count: recruitCountSchema,
  })
);

const applicationSchema = registry.register(
  "Application",
  z.object({
    id: z.string(),
    recruitId: z.string(),
    applicantId: z.string(),
    message: z.string().nullable(),
    status: z.enum(["PENDING", "ACCEPTED", "REJECTED"]),
    createdAt: z.string(),
  })
);

const profileSchema = registry.register(
  "Profile",
  z.object({
    id: z.string(),
    email: z.string(),
    nickname: z.string(),
    bio: z.string().nullable(),
    portfolio: z.string().nullable(),
    avatarUrl: z.string().nullable(),
  })
);

const dashboardSchema = registry.register(
  "Dashboard",
  z.object({
    profile: profileSchema,
    myRecruits: z.array(recruitSchema),
    myPosts: z.array(z.object({ id: z.string(), title: z.string() })),
    myApplications: z.array(
      applicationSchema.extend({
        recruit: z.object({ id: z.string(), title: z.string(), type: z.enum(["DEV", "PLAN"]) }),
      })
    ),
  })
);

const communityPostSchema = registry.register(
  "CommunityPost",
  z.object({
    id: z.string(),
    title: z.string(),
    content: z.string(),
    tag: z.enum(["IDEA", "QUESTION", "ETC"]),
    viewCount: z.number(),
    createdAt: z.string(),
    updatedAt: z.string(),
    author: z.object({ nickname: z.string() }),
    _count: z.object({ comments: z.number(), likes: z.number() }),
  })
);

const commentSchema = registry.register(
  "Comment",
  z.object({
    id: z.string(),
    content: z.string(),
    createdAt: z.string(),
    author: z.object({ nickname: z.string() }),
  })
);

const communityPostDetailSchema = registry.register(
  "CommunityPostDetail",
  communityPostSchema.extend({
    comments: z.array(commentSchema),
    alreadyLiked: z.boolean(),
  })
);

function envelope<T extends z.ZodTypeAny>(data: T) {
  return z.object({ data });
}

const badRequest = { description: "검증 실패", content: { "application/json": { schema: errorSchema } } };
const unauthorized = { description: "미인증", content: { "application/json": { schema: errorSchema } } };
const notFound = { description: "찾을 수 없음", content: { "application/json": { schema: errorSchema } } };
const forbidden = { description: "작성자 아님", content: { "application/json": { schema: errorSchema } } };

// ── 경로 정의 ──

registry.registerPath({
  method: "get",
  path: "/api/recruit",
  summary: "모집 목록",
  request: {
    query: z.object({
      stack: z.string().optional().openapi({ description: "콤마로 구분된 기술스택 필터. 예: React,Node.js" }),
    }),
  },
  responses: {
    200: {
      description: "모집 목록",
      content: { "application/json": { schema: envelope(z.array(recruitSchema)) } },
    },
  },
});

registry.registerPath({
  method: "post",
  path: "/api/recruit",
  summary: "모집 생성",
  security: [{ bearerAuth: [] }],
  request: {
    body: { content: { "application/json": { schema: createRecruitSchema } } },
  },
  responses: {
    201: {
      description: "생성됨",
      content: { "application/json": { schema: envelope(recruitSchema) } },
    },
    400: badRequest,
    401: unauthorized,
  },
});

registry.registerPath({
  method: "get",
  path: "/api/recruit/{id}",
  summary: "모집 상세",
  request: {
    params: z.object({ id: z.string() }),
  },
  responses: {
    200: {
      description: "모집 상세",
      content: { "application/json": { schema: envelope(recruitSchema) } },
    },
    404: notFound,
  },
});

registry.registerPath({
  method: "delete",
  path: "/api/recruit/{id}",
  summary: "모집글 삭제 (작성자 본인만)",
  security: [{ bearerAuth: [] }],
  request: {
    params: z.object({ id: z.string() }),
  },
  responses: {
    200: {
      description: "삭제 완료",
      content: { "application/json": { schema: envelope(z.object({ deleted: z.literal(true) })) } },
    },
    401: unauthorized,
    403: forbidden,
    404: notFound,
  },
});

registry.registerPath({
  method: "post",
  path: "/api/applications",
  summary: "지원",
  security: [{ bearerAuth: [] }],
  request: {
    body: {
      content: {
        "application/json": {
          schema: applyToRecruitSchema.extend({ recruitId: z.string() }),
        },
      },
    },
  },
  responses: {
    201: {
      description: "지원 완료",
      content: { "application/json": { schema: envelope(applicationSchema) } },
    },
    400: { description: "검증 실패 또는 중복 지원", content: { "application/json": { schema: errorSchema } } },
    401: unauthorized,
  },
});

registry.registerPath({
  method: "post",
  path: "/api/profile",
  summary: "프로필 생성(회원가입 2단계)",
  security: [{ bearerAuth: [] }],
  request: {
    body: { content: { "application/json": { schema: ensureProfileSchema } } },
  },
  responses: {
    200: {
      description: "이미 존재하는 프로필 반환",
      content: { "application/json": { schema: envelope(profileSchema) } },
    },
    201: {
      description: "새로 생성됨",
      content: { "application/json": { schema: envelope(profileSchema) } },
    },
    400: badRequest,
    401: unauthorized,
  },
});

registry.registerPath({
  method: "get",
  path: "/api/dashboard",
  summary: "내 모집/내 글/지원현황",
  security: [{ bearerAuth: [] }],
  responses: {
    200: {
      description: "대시보드 데이터",
      content: { "application/json": { schema: envelope(dashboardSchema) } },
    },
    401: unauthorized,
  },
});

registry.registerPath({
  method: "get",
  path: "/api/community",
  summary: "커뮤니티 글 목록",
  request: {
    query: z.object({
      tag: z.enum(["IDEA", "QUESTION", "ETC"]).optional().openapi({ description: "말머리 필터. 잘못된 값은 무시." }),
      page: z.string().optional().openapi({ description: "페이지 번호(기본 1), 페이지당 10개" }),
    }),
  },
  responses: {
    200: {
      description: "글 목록",
      content: {
        "application/json": {
          schema: envelope(z.object({ posts: z.array(communityPostSchema), page: z.number(), totalPages: z.number() })),
        },
      },
    },
  },
});

registry.registerPath({
  method: "get",
  path: "/api/community/{id}",
  summary: "커뮤니티 글 상세",
  request: {
    params: z.object({ id: z.string() }),
  },
  responses: {
    200: {
      description: "글 상세(댓글 포함)",
      content: { "application/json": { schema: envelope(communityPostDetailSchema) } },
    },
    404: notFound,
  },
});

registry.registerPath({
  method: "delete",
  path: "/api/community/{id}",
  summary: "커뮤니티 글 삭제 (작성자 본인만)",
  security: [{ bearerAuth: [] }],
  request: {
    params: z.object({ id: z.string() }),
  },
  responses: {
    200: {
      description: "삭제 완료",
      content: { "application/json": { schema: envelope(z.object({ deleted: z.literal(true) })) } },
    },
    401: unauthorized,
    403: forbidden,
    404: notFound,
  },
});

registry.registerPath({
  method: "post",
  path: "/api/community/{id}/like",
  summary: "커뮤니티 글 좋아요 토글",
  security: [{ bearerAuth: [] }],
  request: {
    params: z.object({ id: z.string() }),
  },
  responses: {
    200: {
      description: "토글 결과",
      content: {
        "application/json": { schema: envelope(z.object({ liked: z.boolean(), count: z.number() })) },
      },
    },
    401: unauthorized,
  },
});

registry.registerPath({
  method: "post",
  path: "/api/community/{id}/comments",
  summary: "댓글 작성",
  security: [{ bearerAuth: [] }],
  request: {
    params: z.object({ id: z.string() }),
    body: { content: { "application/json": { schema: createCommentSchema } } },
  },
  responses: {
    201: {
      description: "작성됨",
      content: { "application/json": { schema: envelope(commentSchema) } },
    },
    400: badRequest,
    401: unauthorized,
  },
});

export function getOpenApiDocument() {
  const generator = new OpenApiGeneratorV31(registry.definitions);
  return generator.generateDocument({
    openapi: "3.1.0",
    info: {
      title: "TeamUp API",
      version: "1.0.0",
      description:
        "RN 앱(및 추후 Spring 이관)이 호출할 얇은 REST 레이어. 웹 화면(SSR/ISR)·Server Action과는 별개. 자세한 배경은 docs/api-contract.md 참고.",
    },
    servers: [{ url: "/", description: "현재 배포/로컬 서버" }],
  });
}
