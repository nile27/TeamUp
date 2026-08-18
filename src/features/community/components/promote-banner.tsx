import { Button } from "@/components/ui/button";
import { promoteToRecruit } from "../actions";

interface PromoteBannerProps {
  postId: string;
  isAuthor: boolean;
}

export function PromoteBanner({ postId, isAuthor }: PromoteBannerProps) {
  if (!isAuthor) return null;

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-secondary bg-secondary/60 p-4">
      <div>
        <p className="text-sm font-semibold text-foreground">🌱 반응이 좋다면?</p>
        <p className="text-sm text-muted-foreground">이 아이디어를 정식 모집으로 만들어 팀원을 구해보세요.</p>
      </div>
      <form action={promoteToRecruit}>
        <input type="hidden" name="postId" value={postId} />
        <Button type="submit" className="shrink-0">정식 모집으로 만들기</Button>
      </form>
    </div>
  );
}
