import type { HTMLAttributes, ReactNode } from "react";

type CardProps = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode;
};

export function Card({ children, className = "", ...props }: CardProps) {
  return (
    <div
      className={`rounded-[var(--radius-card)] border border-border bg-surface shadow-[0_16px_44px_rgba(17,24,39,0.04)] ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
