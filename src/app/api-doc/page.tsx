import { notFound } from "next/navigation";
import { ApiDocClient } from "./api-doc-client";

// 개발용 API 문서라 배포 환경엔 공개하지 않음(내부 API 표면을 외부에 노출하지 않기 위함).
// 필요해지면 이 가드를 빼거나 인증 체크로 교체.
export default function ApiDocPage() {
  if (process.env.NODE_ENV === "production") {
    notFound();
  }

  return <ApiDocClient />;
}
