"use client";

import { Eye } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface ViewTrackerProps {
  initialCount: number;
  endpoint: string;
  testId: string;
}

// 상세 페이지 마운트 시 딱 한 번만 조회수 증가 API(Route Handler)를 fetch로 호출하고,
// 그 결과로 화면에 표시되는 조회수 숫자도 직접 갱신함.
//
// Server Action(직접 함수 호출)이 아니라 Route Handler + fetch를 쓰는 이유: Server
// Action은 호출될 때마다 Next.js가 현재 라우트를 자동으로 다시 렌더링하는데, 그러면
// (1) 페이지의 다른 Server Action(좋아요 토글 등)을 눌러도 조회수 증가 함수가 같이
// 재실행되어 조회수가 같이 오르는 버그가 생기고, (2) 이 조회수 호출 자체도 매 방문마다
// 불필요한 자동 새로고침을 유발해 다른 상태 갱신과 레이스가 생김. 순수 fetch는 이
// 자동 새로고침을 안 일으킴.
//
// 모집 상세는 ISR 캐시(getRecruitById)라 recruit.viewCount를 그대로 쓰면 캐시가
// 갱신될 때까지 값이 안 바뀌어 보임 — 그래서 서버 컴포넌트가 넘겨준 initialCount를
// 시작값으로 쓰고, 여기서 클라이언트 상태로 직접 최신값을 반영한다.
export function ViewTracker({ initialCount, endpoint, testId }: ViewTrackerProps) {
  const [count, setCount] = useState(initialCount);
  const firedRef = useRef(false);

  useEffect(() => {
    if (firedRef.current) return;
    firedRef.current = true;
    fetch(endpoint, { method: "POST" })
      .then((res) => res.json())
      .then((json) => {
        if (typeof json?.data?.viewCount === "number" && json.data.viewCount > 0) {
          setCount(json.data.viewCount);
        }
      })
      .catch(() => {
        // 조회수 반영 실패는 조용히 무시 — 핵심 기능이 아님.
      });
  }, [endpoint]);

  return (
    <span data-testid={testId} className="inline-flex items-center gap-1 ml-1">
      <Eye className="h-3.5 w-3.5" />
      {count}
    </span>
  );
}
