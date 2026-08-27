import Link from "next/link";
import { MessageSquare, ThumbsUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { avatarTone } from "@/lib/avatar-tone";

export interface PostListItemProps {
  id: string;
  category: string;
  title: string;
  author: string;
  createdAt: string;
  likeCount: number;
  commentCount: number;
}

// actions: 마이페이지 "내 글" 탭처럼 작성자 본인만 보는 목록에서 삭제 버튼 등을 붙일 때 사용.
// /community 전체 목록에서는 넘기지 않음.
export function PostListItem({ post, actions }: { post: PostListItemProps; actions?: React.ReactNode }) {
  return (
    <div className="border-b last:border-b-0 transition-colors hover:bg-muted/40 flex items-center">
      <Link href={`/community/${post.id}`} className="flex-1 min-w-0 block">
        <div className="py-4 px-4 sm:px-6 flex items-center gap-3 sm:gap-4">
          <div
            className={`hidden sm:flex size-9 shrink-0 items-center justify-center rounded-full text-sm font-semibold ${avatarTone(post.author)}`}
          >
            {post.author.slice(0, 1)}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="outline" className="w-fit text-[11px] font-medium text-muted-foreground px-2 py-0">
                {post.category}
              </Badge>
              <span className="text-[13px] text-muted-foreground truncate">{post.author} · {post.createdAt}</span>
            </div>
            <h3 className="text-[15px] font-medium text-foreground line-clamp-1">{post.title}</h3>
          </div>

          <div className="flex items-center gap-3 text-[13px] text-muted-foreground shrink-0">
            <span className="flex items-center gap-1">
              <ThumbsUp className="w-3.5 h-3.5" /> {post.likeCount}
            </span>
            <span className="flex items-center gap-1">
              <MessageSquare className="w-3.5 h-3.5" /> {post.commentCount}
            </span>
          </div>
        </div>
      </Link>
      {actions && <div className="shrink-0 pr-4 sm:pr-6">{actions}</div>}
    </div>
  );
}
