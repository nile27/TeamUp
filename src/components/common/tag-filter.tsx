"use client";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface TagFilterOption {
  value: string;
  label: string;
}

interface TagFilterProps {
  tags: TagFilterOption[];
  activeTag: string;
  onTagChange: (tag: string) => void;
}

export function TagFilter({ tags, activeTag, onTagChange }: TagFilterProps) {
  return (
    <Tabs value={activeTag} onValueChange={onTagChange} className="w-full mb-6">
      <TabsList className="bg-transparent p-0 border-b w-full justify-start rounded-none h-auto space-x-6 overflow-x-auto flex-nowrap">
        {tags.map((tag) => (
          <TabsTrigger
            key={tag.value}
            value={tag.value}
            className="rounded-none border-b-2 border-transparent px-1 pb-3 pt-2 text-[15px] font-medium text-muted-foreground hover:text-foreground data-[state=active]:border-primary data-[state=active]:text-foreground data-[state=active]:font-bold data-[state=active]:bg-transparent shadow-none whitespace-nowrap"
          >
            {tag.label}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
}
