import React from "react";

interface PageHeaderProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export function PageHeader({ title, description, action }: PageHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-end justify-between pb-6 gap-4">
      <div className="space-y-1.5">
        <h1 className="text-2xl font-bold tracking-tight text-[#2B2620]">{title}</h1>
        {description && (
          <p className="text-[15px] text-muted-foreground">
            {description}
          </p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
