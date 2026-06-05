import type { ReactNode } from "react";

type IconProps = {
  size?: number;
};

function Svg({ children, size = 18 }: IconProps & { children: ReactNode }) {
  return (
    <svg aria-hidden="true" fill="none" height={size} viewBox="0 0 20 20" width={size}>
      {children}
    </svg>
  );
}

export function PlusIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M4 10h12M10 4v12" stroke="currentColor" strokeLinecap="round" strokeWidth="1.5" />
    </Svg>
  );
}

export function BriefIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M4 5h12v10H4z" stroke="currentColor" strokeWidth="1.5" />
      <path d="M7 8h6M7 11h4" stroke="currentColor" strokeLinecap="round" strokeWidth="1.5" />
    </Svg>
  );
}

export function UserIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M10 10.5c2.49 0 4.5-2.01 4.5-4.5S12.49 1.5 10 1.5 5.5 3.51 5.5 6 7.51 10.5 10 10.5Z" stroke="currentColor" strokeWidth="1.5" />
      <path d="M3.25 17c1.5-2.55 4-3.83 6.75-3.83S15.25 14.45 16.75 17" stroke="currentColor" strokeLinecap="round" strokeWidth="1.5" />
    </Svg>
  );
}

export function CalendarIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M4 5.5h12v9H4z" stroke="currentColor" strokeWidth="1.5" />
      <path d="M4 8.5h12" stroke="currentColor" strokeWidth="1.5" />
    </Svg>
  );
}

export function ClockIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M10 3.2c3.76 0 6.8 3.04 6.8 6.8S13.76 16.8 10 16.8 3.2 13.76 3.2 10 6.24 3.2 10 3.2Z" stroke="currentColor" strokeWidth="1.5" />
      <path d="M10 6.4v3.8l2.6 1.6" stroke="currentColor" strokeLinecap="round" strokeWidth="1.5" />
    </Svg>
  );
}

export function DocumentIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M4 4.5h12v11H4z" stroke="currentColor" strokeWidth="1.5" />
      <path d="M7 8h6M7 11h6" stroke="currentColor" strokeLinecap="round" strokeWidth="1.5" />
    </Svg>
  );
}

export function MonitorIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M4 5h12v8H4z" stroke="currentColor" strokeWidth="1.5" />
      <path d="M10 13v3M7.5 16h5" stroke="currentColor" strokeLinecap="round" strokeWidth="1.5" />
    </Svg>
  );
}

export function NotesIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M6 3.5h8a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-9a2 2 0 0 1 2-2Z" stroke="currentColor" strokeWidth="1.5" />
      <path d="M7 7.5h6M7 10.5h6M7 13.5h3.5" stroke="currentColor" strokeLinecap="round" strokeWidth="1.5" />
    </Svg>
  );
}

export function ShieldIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M10 2.5 16 5.5V10c0 3.63-2.36 6.92-6 7.93C6.36 16.92 4 13.63 4 10V5.5L10 2.5Z" stroke="currentColor" strokeWidth="1.5" />
      <path d="M7.3 9.8 9 11.5l3.7-3.8" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
    </Svg>
  );
}

export function SearchIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <circle cx="9" cy="9" r="5.5" stroke="currentColor" strokeWidth="1.5" />
      <path d="M13.5 13.5 17 17" stroke="currentColor" strokeLinecap="round" strokeWidth="1.5" />
    </Svg>
  );
}

export function MenuIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M3 5h14M3 10h14M3 15h14" stroke="currentColor" strokeLinecap="round" strokeWidth="1.6" />
    </Svg>
  );
}

export function LogoutIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M8 4.5H5.5A1.5 1.5 0 0 0 4 6v8a1.5 1.5 0 0 0 1.5 1.5H8" stroke="currentColor" strokeLinecap="round" strokeWidth="1.5" />
      <path d="M10.5 6.5 14 10l-3.5 3.5M14 10H7.5" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
    </Svg>
  );
}

export function AlertIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <circle cx="10" cy="10" r="6.5" stroke="currentColor" strokeWidth="1.5" />
      <path d="M10 6.8v3.7M10 13.4h.01" stroke="currentColor" strokeLinecap="round" strokeWidth="1.5" />
    </Svg>
  );
}

export function MoneyIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M10 3v14M6.5 6.5h4a2 2 0 1 1 0 4h-1a2 2 0 1 0 0 4h4" stroke="currentColor" strokeLinecap="round" strokeWidth="1.5" />
    </Svg>
  );
}

export function CheckIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M4 10.5 8 14.5 16 5.5" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.6" />
    </Svg>
  );
}

export const navIconComponents = [
  PlusIcon,
  BriefIcon,
  UserIcon,
  CalendarIcon,
  ClockIcon,
  DocumentIcon,
  MonitorIcon,
  NotesIcon,
];
