import { NextResponse } from "next/server";

// Route Handler(=React 트리 밖)로 직접 HTML을 반환 — page.tsx로 만들면 루트 layout.tsx의
// Tailwind(globals.css) preflight가 Scalar 자체 스타일과 충돌해서 레이아웃이 깨짐
// (기본 리셋이 Scalar 컴포넌트 CSS를 덮어써 버림). 그래서 이 문서는 앱의 CSS를 아예
// 안 타는 독립 HTML로 서빙하고, Scalar 스크립트는 CDN에서 로드(설치된 @scalar/api-reference
// 코어 버전과 동일하게 고정).
const SCALAR_VERSION = "1.66.1";

export async function GET() {
  // /api/openapi.json과 동일한 기준으로 프로덕션에선 비공개(내부 API 표면 노출 방지)
  if (process.env.NODE_ENV === "production") {
    return new NextResponse("Not Found", { status: 404 });
  }

  const html = `<!doctype html>
<html lang="ko">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>TeamUp API 문서</title>
  </head>
  <body>
    <div id="app"></div>
    <script src="https://cdn.jsdelivr.net/npm/@scalar/api-reference@${SCALAR_VERSION}"></script>
    <script>
      Scalar.createApiReference('#app', {
        url: '/api/openapi.json',
        theme: 'default',
      })
    </script>
  </body>
</html>`;

  return new NextResponse(html, {
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}
