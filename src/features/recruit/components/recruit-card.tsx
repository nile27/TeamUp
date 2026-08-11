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
      <Card className="flex flex-col h-full p-5 shadow-sm hover:shadow-md transition-all duration-200 border-border/60 hover:border-border group-hover:-translate-y-1">
        <div className="flex justify-between items-start mb-3">
          <Badge variant="secondary" className="bg-[#FFF4E3] text-[#2B2620] hover:bg-[#FFF4E3] font-semibold border-transparent">
            {data.type}
          </Badge>
          {data.isClosed && (
            <Badge variant="outline" className="text-muted-foreground border-muted font-medium">
              모집마감
            </Badge>
          )}
        </div>
        
        <h3 className="text-lg font-bold text-[#2B2620] mb-1.5 line-clamp-2 leading-tight">
          {data.title}
        </h3>
        
        <TechStackTags tags={data.techStack} />
        
        <p className="text-[14px] text-muted-foreground line-clamp-2 mb-5 flex-1 leading-relaxed">
          {data.summary}
        </p>
        
        <div className="mb-5">
          <CompletenessGauge value={data.completeness} />
        </div>
        
        <div className="space-y-3 mt-auto">
          <div className="flex flex-wrap gap-2">
            {data.roles.map((role, idx) => (
              <div key={idx} className="flex items-center text-xs px-2 py-1 bg-slate-100 rounded-md text-[#6B6257]">
                <span className="font-medium mr-1.5">{role.name}</span>
                <span className={role.current >= role.total ? "text-slate-400" : "text-[#FFA940] font-bold"}>
                  {role.current}/{role.total}
                </span>
              </div>
            ))}
          </div>
          
          <div className="flex items-center gap-4 text-xs text-muted-foreground pt-3 border-t">
            <div className="flex items-center gap-1.5">
              <Eye className="w-3.5 h-3.5" />
              {data.viewCount}
            </div>
            <div className="flex items-center gap-1.5">
              <Bookmark className="w-3.5 h-3.5" />
              {data.bookmarkCount}
            </div>
          </div>
        </div>
      </Card>
    </Link>
  );
}
