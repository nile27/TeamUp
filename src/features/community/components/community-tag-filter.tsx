"use client";

import { useRouter, usePathname } from "next/navigation";
import { TagFilter } from "@/components/common/tag-filter";
import { COMMUNITY_TAG_FILTERS } from "@/config/labels";

interface CommunityTagFilterProps {
  activeTag: string;
}

export function CommunityTagFilter({ activeTag }: CommunityTagFilterProps) {
  const router = useRouter();
  const pathname = usePathname();

  const handleTagChange = (value: string) => {
    const params = new URLSearchParams();
    if (value !== "ALL") params.set("tag", value);
    router.push(`${pathname}${params.toString() ? `?${params.toString()}` : ""}`);
  };

  return (
    <TagFilter
      tags={COMMUNITY_TAG_FILTERS}
      activeTag={activeTag}
      onTagChange={handleTagChange}
    />
  );
}
