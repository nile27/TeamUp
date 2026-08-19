"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { useCallback } from "react";

const PREDEFINED_STACKS = [
  "React", "Next.js", "TypeScript", "Node.js", 
  "Python", "Spring", "Figma", "UI/UX", "Java"
];

export function TechStackUrlFilter() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  const currentStacks = searchParams.get("stack")?.split(",").filter(Boolean) || [];

  const toggleStack = useCallback((stack: string) => {
    const newStacks = currentStacks.includes(stack)
      ? currentStacks.filter(s => s !== stack)
      : [...currentStacks, stack];
      
    const params = new URLSearchParams(searchParams.toString());
    if (newStacks.length > 0) {
      params.set("stack", newStacks.join(","));
    } else {
      params.delete("stack");
    }
    
    router.push(`${pathname}?${params.toString()}`);
  }, [currentStacks, pathname, router, searchParams]);

  return (
    <div data-testid="tech-stack-filter" className="flex flex-wrap gap-2 mb-6">
      {PREDEFINED_STACKS.map(stack => {
        const isActive = currentStacks.includes(stack);
        return (
          <Badge
            key={stack}
            variant={isActive ? "default" : "outline"}
            className={`cursor-pointer transition-colors px-3 py-1 ${
              isActive 
                ? 'bg-[#FFA940] text-[#2B2620] hover:bg-[#F08C00] border-transparent' 
                : 'bg-white hover:bg-slate-100 text-muted-foreground border-border'
            }`}
            onClick={() => toggleStack(stack)}
          >
            {stack}
          </Badge>
        );
      })}
    </div>
  );
}
