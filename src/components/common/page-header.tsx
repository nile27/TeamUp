import React from "react";

interface PageHeaderProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export function PageHeader({ title, description, action }: PageHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-end justify-between pb-10 gap-4">
      <div className="space-y-2">
        <h1 className="text-4xl md:text-[2.75rem] font-extrabold tracking-tight leading-[1.05] text-foreground text-balance">
          {title}
        </h1>
        {description && (
          <p className="text-base text-muted-foreground max-w-[52ch]">
            {description}
          </p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
