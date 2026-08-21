"use client";

import { ApiReferenceReact } from "@scalar/api-reference-react";

export function ApiDocClient() {
  return <ApiReferenceReact configuration={{ url: "/api/openapi.json" }} />;
}
