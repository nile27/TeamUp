"use client";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface TagFilterProps {
  tags: string[];
  activeTag: string;
  onTagChange: (tag: string) => void;
}

export function TagFilter({ tags, activeTag, onTagChange }: TagFilterProps) {
  return (
    <Tabs value={activeTag} onValueChange={onTagChange} className="w-full mb-6">
      <TabsList className="bg-transparent p-0 border-b w-full justify-start rounded-none h-auto space-x-6 overflow-x-auto flex-nowrap">
        {tags.map((tag) => (
          <TabsTrigger
            key={tag}
            value={tag}
            className="rounded-none border-b-2 border-transparent px-1 pb-3 pt-2 text-[15px] font-medium text-muted-foreground hover:text-foreground data-[state=active]:border-[#FFA940] data-[state=active]:text-[#2B2620] data-[state=active]:font-bold data-[state=active]:bg-transparent shadow-none whitespace-nowrap"
          >
            {tag}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
}
