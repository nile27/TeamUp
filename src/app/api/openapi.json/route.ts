import { NextResponse } from "next/server";
import { getOpenApiDocument } from "@/server/openapi/registry";

export async function GET() {
  return NextResponse.json(getOpenApiDocument());
}
