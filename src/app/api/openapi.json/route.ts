import { NextResponse } from "next/server";
import { getOpenApiDocument } from "@/server/openapi/registry";

export async function GET() {
  // /api-doc 페이지와 동일하게, 프로덕션에선 API 표면(스펙) 노출 방지
  if (process.env.NODE_ENV === "production") {
    return new NextResponse("Not Found", { status: 404 });
  }
  return NextResponse.json(getOpenApiDocument());
}
