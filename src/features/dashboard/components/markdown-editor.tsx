"use client";

import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { MarkdownContent } from "@/components/common/markdown-content";

interface MarkdownEditorProps {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

// 작성/미리보기 탭을 오가는 마크다운 입력기. react-hook-form의 Controller로 감싸서
// 쓰는 controlled 컴포넌트 (RecruitForm의 TechStackInput과 동일 패턴).
export function MarkdownEditor({ id, value, onChange, placeholder }: MarkdownEditorProps) {
  const [tab, setTab] = useState<"write" | "preview">("write");

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <Badge
          onClick={() => setTab("write")}
          variant={tab === "write" ? "default" : "outline"}
          className="cursor-pointer px-3 py-1 text-xs"
        >
          작성
        </Badge>
        <Badge
          onClick={() => setTab("preview")}
          variant={tab === "preview" ? "default" : "outline"}
          className="cursor-pointer px-3 py-1 text-xs"
        >
          미리보기
        </Badge>
      </div>

      {/* 탭을 바꿔도 값이 유지되도록 textarea는 항상 DOM에 두고 숨김만 처리 */}
      <Textarea
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={10}
        className={tab === "write" ? "font-mono text-sm" : "hidden"}
      />
      {tab === "preview" && (
        <div className="min-h-[220px] rounded-lg border border-input px-3 py-2">
          {value.trim() ? (
            <MarkdownContent content={value} />
          ) : (
            <p className="text-sm text-muted-foreground">미리볼 내용이 없어요.</p>
          )}
        </div>
      )}

      <p className="text-xs text-muted-foreground">마크다운 문법을 지원해요 (제목, 목록, 링크, 표 등).</p>
    </div>
  );
}
