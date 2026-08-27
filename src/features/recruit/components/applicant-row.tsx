import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MarkdownContent } from "@/components/common/markdown-content";
import { updateApplicationStatus } from "../actions";
import { avatarTone } from "@/lib/avatar-tone";
import type { ApplicationStatus } from "@prisma/client";

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

interface ApplicantRowProps {
  applicationId: string;
  status: ApplicationStatus;
  message: string | null;
  applicant: {
    nickname: string;
    bio: string | null;
    email: string;
    portfolio: string | null;
  };
}

export function ApplicantRow({ applicationId, status, message, applicant }: ApplicantRowProps) {
  return (
    <div className="border border-border/60 rounded-2xl bg-card p-5 space-y-3 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <Avatar size="lg">
            <AvatarFallback className={`font-semibold ${avatarTone(applicant.nickname)}`}>
              {applicant.nickname[0]}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-semibold text-foreground">{applicant.nickname}</p>
            <p className="text-xs text-muted-foreground">{applicant.email}</p>
          </div>
        </div>
        <Badge variant={STATUS_VARIANT[status]}>{STATUS_LABEL[status]}</Badge>
      </div>

      {applicant.bio && (
        <p className="text-sm text-muted-foreground whitespace-pre-wrap">{applicant.bio}</p>
      )}

      {applicant.portfolio && (
        <details className="rounded-md border border-border">
          <summary className="cursor-pointer select-none px-3 py-2 text-sm font-medium text-foreground">
            포트폴리오 · 경력 보기
          </summary>
          <div className="px-3 pb-3">
            <MarkdownContent content={applicant.portfolio} />
          </div>
        </details>
      )}

      {message && (
        <div className="rounded-md bg-muted px-3 py-2 text-sm text-foreground whitespace-pre-wrap">
          {message}
        </div>
      )}

      {status === "PENDING" && (
        <div className="flex gap-2 pt-1">
          <form action={updateApplicationStatus}>
            <input type="hidden" name="applicationId" value={applicationId} />
            <input type="hidden" name="status" value="ACCEPTED" />
            <Button type="submit" size="sm">수락하기</Button>
          </form>
          <form action={updateApplicationStatus}>
            <input type="hidden" name="applicationId" value={applicationId} />
            <input type="hidden" name="status" value="REJECTED" />
            <Button type="submit" size="sm" variant="outline">거절하기</Button>
          </form>
        </div>
      )}
    </div>
  );
}
