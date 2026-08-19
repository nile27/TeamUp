import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { RECRUIT_TYPE_LABEL } from "@/config/labels";
import type { ApplicationStatus, RecruitType } from "@prisma/client";

const STATUS_LABEL: Record<ApplicationStatus, string> = {
  PENDING: "대기 중",
  ACCEPTED: "수락됨",
  REJECTED: "거절됨",
};

const STATUS_VARIANT: Record<ApplicationStatus, "outline" | "default" | "destructive"> = {
  PENDING: "outline",
  ACCEPTED: "default",
  REJECTED: "destructive",
};

interface ApplicationItemProps {
  recruit: { id: string; title: string; type: RecruitType };
  status: ApplicationStatus;
}

export function ApplicationItem({ recruit, status }: ApplicationItemProps) {
  return (
    <Link
      href={`/recruit/${recruit.id}`}
      className="flex items-center justify-between gap-4 p-4 border-b last:border-b-0 hover:bg-slate-50/50 transition-colors"
    >
      <div className="space-y-1 min-w-0">
        <p className="text-[15px] font-medium text-foreground truncate">{recruit.title}</p>
        <p className="text-xs text-muted-foreground">{RECRUIT_TYPE_LABEL[recruit.type]}</p>
      </div>
      <Badge variant={STATUS_VARIANT[status]} className="shrink-0">
        {STATUS_LABEL[status]}
      </Badge>
    </Link>
  );
}
