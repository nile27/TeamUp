import { Badge } from "@/components/ui/badge";

interface TechStackTagsProps {
  tags: string[];
  maxDisplay?: number;
}

export function TechStackTags({ tags, maxDisplay = 3 }: TechStackTagsProps) {
  if (!tags || tags.length === 0) return null;

  const displayedTags = tags.slice(0, maxDisplay);
  const remainingCount = tags.length - maxDisplay;

  return (
    <div className="flex flex-wrap gap-1.5 mt-2 mb-3">
      {displayedTags.map((tag) => (
        <Badge 
          key={tag} 
          variant="secondary" 
          className="bg-secondary text-secondary-foreground hover:bg-secondary font-medium text-[11px] px-2 py-0 border-transparent"
        >
          {tag}
        </Badge>
      ))}
      {remainingCount > 0 && (
        <Badge 
          variant="secondary" 
          className="bg-secondary text-secondary-foreground hover:bg-secondary font-medium text-[11px] px-2 py-0 border-transparent"
        >
          +{remainingCount}
        </Badge>
      )}
    </div>
  );
}
