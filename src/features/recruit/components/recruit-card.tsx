import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CompletenessGauge } from "./completeness-gauge";
import { TechStackTags } from "./tech-stack-tags";
import { Eye, Bookmark } from "lucide-react";

export interface RecruitCardProps {
  id: string;
  title: string;
  summary: string;
  type: string;
  techStack: string[];
  completeness: number;
  roles: {
    name: string;
    current: number;
    total: number;
  }[];
  viewCount: number;
  bookmarkCount: number;
  isClosed?: boolean;
}

export function RecruitCard({ data }: { data: RecruitCardProps }) {
  return (
    <Link href={`/recruit/${data.id}`} className="block h-full group">
      <Card className="relative flex flex-col h-full p-0 gap-0 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl hover:shadow-black/[0.06] transition-all duration-300 border-border/50 group-hover:-translate-y-1.5">
        {/* 카드 상단 컬러 스트립 — 타입별 시각적 앵커, 텍스트만 있는 카드 탈피 */}
        <div className="h-1.5 w-full bg-gradient-to-r from-primary via-primary/70 to-secondary" />

        <div className="flex flex-col flex-1 p-6">
          <div className="flex justify-between items-start mb-4">
            <Badge variant="secondary" className="rounded-md font-semibold border-transparent">
              {data.type}
            </Badge>
            {data.isClosed && (
              <Badge variant="outline" className="rounded-md text-muted-foreground border-muted font-medium">
                모집마감
              </Badge>
            )}
          </div>

          <h3 className="text-xl font-bold text-foreground mb-2 line-clamp-2 leading-snug tracking-tight">
            {data.title}
          </h3>

          <TechStackTags tags={data.techStack} />

          <p className="text-[14px] text-muted-foreground line-clamp-2 mb-6 flex-1 leading-relaxed">
            {data.summary}
          </p>

          <div className="mb-6">
            <CompletenessGauge value={data.completeness} />
          </div>

          <div className="space-y-4 mt-auto">
            <div className="flex flex-wrap gap-2">
              {data.roles.map((role, idx) => {
                const filled = role.current >= role.total;
                return (
                  <div
                    key={idx}
                    className={`flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg font-medium ${
                      filled ? "bg-muted text-muted-foreground/70" : "bg-secondary text-secondary-foreground"
                    }`}
                  >
                    <span className={`size-1.5 rounded-full ${filled ? "bg-muted-foreground/40" : "bg-primary"}`} />
                    {role.name}
                    <span className={filled ? "" : "font-bold"}>{role.current}/{role.total}</span>
                  </div>
                );
              })}
            </div>

            <div className="flex items-center gap-3 pt-4 border-t border-border/60">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <span className="flex size-6 items-center justify-center rounded-full bg-muted">
                  <Eye className="w-3.5 h-3.5" />
                </span>
                {data.viewCount}
              </div>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <span className="flex size-6 items-center justify-center rounded-full bg-muted">
                  <Bookmark className="w-3.5 h-3.5" />
                </span>
                {data.bookmarkCount}
              </div>
            </div>
          </div>
        </div>
      </Card>
    </Link>
  );
}
