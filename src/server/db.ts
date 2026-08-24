import { PrismaClient, Prisma } from '@prisma/client'

// Supabase pooler(Supavisor)가 간헐적으로 몇 초간 연결을 못 받는 순간이 있음(free tier에서
// 관찰됨) — SSR 중 이게 터지면 페이지 전체가 error.tsx로 떨어져서 사용자 눈엔 "사이트가
// 끊겼다"로 보임. 연결 자체가 안 열린 경우(PrismaClientInitializationError)는 서버에 아무
// 요청도 안 갔으니 어떤 작업이든 재시도해도 안전. 연결이 도중에 끊긴 경우(P1017 등)는 읽기
// 작업만 재시도(부수효과 없어 안전, 쓰기는 이미 처리됐을 수도 있어 재시도 안 함).
const READ_OPERATIONS = new Set([
  'findUnique',
  'findUniqueOrThrow',
  'findFirst',
  'findFirstOrThrow',
  'findMany',
  'count',
  'aggregate',
  'groupBy',
])
const RETRYABLE_REQUEST_ERROR_CODES = new Set(['P1001', 'P1002', 'P1008', 'P1017', 'P2024'])
const MAX_RETRIES = 2
const RETRY_DELAYS_MS = [300, 800]

function isRetryable(error: unknown, operation: string): boolean {
  if (error instanceof Prisma.PrismaClientInitializationError) return true
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    return READ_OPERATIONS.has(operation) && RETRYABLE_REQUEST_ERROR_CODES.has(error.code)
  }
  return false
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

const prismaClientSingleton = () => {
  return new PrismaClient().$extends({
    query: {
      $allModels: {
        async $allOperations({ operation, args, query }) {
          let attempt = 0
          for (;;) {
            try {
              return await query(args)
            } catch (error) {
              if (attempt >= MAX_RETRIES || !isRetryable(error, operation)) {
                throw error
              }
              console.warn(`[prisma] ${operation} 실패, ${RETRY_DELAYS_MS[attempt]}ms 후 재시도 (${attempt + 1}/${MAX_RETRIES})`, error)
              await sleep(RETRY_DELAYS_MS[attempt] ?? 800)
              attempt += 1
            }
          }
        },
      },
    },
  })
}

declare global {
  var prismaGlobal: undefined | ReturnType<typeof prismaClientSingleton>
}

export const prisma = globalThis.prismaGlobal ?? prismaClientSingleton()

if (process.env.NODE_ENV !== 'production') globalThis.prismaGlobal = prisma
