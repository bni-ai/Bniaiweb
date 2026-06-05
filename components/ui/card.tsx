import type { HTMLAttributes, ReactNode } from "react";

type CardProps = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode;
};

export function Card({ children, className = "", ...props }: CardProps) {
  return (
    <div
      className={`rounded-[var(--radius-card)] border border-border bg-surface shadow-[0_1px_2px_rgba(0,0,0,0.05)] ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
