import type { ReactNode } from "react";
import Link from "next/link";

import {
  LogoutIcon,
  MenuIcon,
  SearchIcon,
  ShieldIcon,
  UserIcon,
  navIconComponents,
} from "./bni-icons";
import type { ShellIdentity } from "../../lib/auth/shell-identity";

type PortalMode = "member" | "admin";

type ShellNavItem = {
  href: string;
  label: string;
  badge?: string;
};

type ShellNavGroup = {
  label: string;
  items: ShellNavItem[];
};

type BniPortalShellProps = {
  mode: PortalMode;
  title: string;
  subtitle: string;
  identity: ShellIdentity;
  currentPath: string;
  navGroups: ShellNavGroup[];
  children: ReactNode;
  contentClassName?: string;
  showTopbarSearch?: boolean;
  showTopbarUser?: boolean;
  topbarSearchAction?: string;
  topbarSearchPlaceholder?: string;
};

function isActivePath(currentPath: string, href: string) {
  if (href === "/admin" || href === "/dashboard") return currentPath === href;
  return currentPath === href || currentPath.startsWith(`${href}/`);
}

function PortalLink({ mode, target }: { mode: PortalMode; target: PortalMode }) {
  const href = target === "admin" ? "/admin" : "/dashboard";
  const active = mode === target;

  return (
    <Link className={`od-segmented-link ${active ? "is-active" : ""}`} href={href}>
      {target === "admin" ? "幹部" : "會員"}
    </Link>
  );
}

function PortalNavItem({ mode, target }: { mode: PortalMode; target: PortalMode }) {
  const href = target === "admin" ? "/admin" : "/dashboard";
  const active = mode === target;
  const Icon = target === "admin" ? ShieldIcon : UserIcon;

  return (
    <Link className={`od-nav-item ${active ? "is-active" : ""}`} href={href}>
      <span className="od-nav-main">
        <span className="od-icon-wrap"><Icon /></span>
        <span>{target === "admin" ? "幹部入口" : "會員入口"}</span>
      </span>
      <span className="od-nav-badge">{target === "admin" ? "會務" : "週任務"}</span>
    </Link>
  );
}

function UserAvatar({ identity }: { identity: ShellIdentity }) {
  return (
    <span className="od-avatar" aria-hidden="true">
      {identity.avatarUrl ? <img src={identity.avatarUrl} alt="" /> : identity.initial}
    </span>
  );
}

export function BniPortalShell({
  mode,
  title,
  subtitle,
  identity,
  currentPath,
  navGroups,
  children,
  contentClassName,
  showTopbarSearch = true,
  showTopbarUser = true,
  topbarSearchAction,
  topbarSearchPlaceholder = "搜尋會員、來賓、簡報",
}: BniPortalShellProps) {
  return (
    <div className="od-app-shell">
      <aside className="od-sidebar" data-testid={mode === "admin" ? "admin-sidebar" : "member-sidebar"}>
        <div className="od-brand-lockup">
          <div className="od-brand-mark">BNI</div>
          <div className="od-brand-copy">
            <strong>Bni華AI 系統</strong>
            <span>分會營運入口與會員工作台</span>
          </div>
        </div>

        <div className="od-chapter-card">
          <div className="od-chapter-row">
            <span className="od-status-pill danger">華 AI 分會</span>
            <span className="od-status-pill ok">本週會議已排程</span>
          </div>
          <div className="od-chapter-row">
            <div>
              <strong className="text-sm text-text-1">週三 06:45 報到 / 07:00 開始</strong>
              <div className="od-subtle text-xs">台北市中山區實體會議 + 線上補件</div>
            </div>
          </div>
        </div>

        <div className="od-identity-card" data-testid="shell-user-card">
          <UserAvatar identity={identity} />
          <div className="od-identity-copy">
            <strong>{identity.displayName}</strong>
            <span>{identity.secondaryLabel}</span>
            <span className="od-status-pill danger">{identity.roleLabel}</span>
          </div>
        </div>

        <div className="od-nav-group">
          <div className="od-section-label">入口切換</div>
          <div className="od-nav-list">
            <PortalNavItem mode={mode} target="member" />
            <PortalNavItem mode={mode} target="admin" />
          </div>
          {mode === "admin" ? (
            <Link className="od-context-link" href="/dashboard">切換到會員視角</Link>
          ) : identity.role === "admin" ? (
            <Link className="od-context-link" href="/admin">返回管理後台</Link>
          ) : null}
        </div>

        {navGroups.map((group, groupIndex) => (
          <div className="od-nav-group" key={group.label}>
            <div className="od-section-label">{group.label}</div>
            <div className="od-nav-list">
              {group.items.map((item, itemIndex) => {
                const active = isActivePath(currentPath, item.href);
                const Icon = navIconComponents[(groupIndex + itemIndex) % navIconComponents.length];

                return (
                  <Link className={`od-nav-item ${active ? "is-active" : ""}`} href={item.href} key={item.href}>
                    <span className="od-nav-main">
                      <span className="od-icon-wrap"><Icon /></span>
                      <span>{item.label}</span>
                    </span>
                    {item.badge ? <span className="od-nav-badge">{item.badge}</span> : null}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}

        <div className="od-sidebar-footer">
          <div className="od-support-row">
            <div>
              <strong className="text-sm text-text-1">AI 支援狀態</strong>
              <div className="od-subtle text-xs">摘要、投稿潤稿、講稿整理</div>
            </div>
            <span className="od-status-pill info">正常</span>
          </div>
          <div className="od-support-row">
            <span className="od-mini-note text-xs">登入身分</span>
            <span className="od-status-pill danger">{identity.roleLabel}</span>
          </div>
        </div>
      </aside>

      <main className="od-main">
        <header className="od-topbar">
          <div className="od-topbar-left">
            <button className="od-menu-button" aria-label="開啟選單" type="button">
              <MenuIcon />
            </button>
            <div className="od-page-title">
              <strong>{title}</strong>
              <span>{subtitle}</span>
            </div>
          </div>
          <div className="od-topbar-right">
            <div className="od-segmented" aria-label="入口切換">
              <PortalLink mode={mode} target="member" />
              <PortalLink mode={mode} target="admin" />
            </div>
            {showTopbarSearch && topbarSearchAction ? (
              <form action={topbarSearchAction} className="od-search-form" method="get" role="search">
                <SearchIcon size={16} />
                <input
                  aria-label="搜尋"
                  className="od-search-input"
                  name="q"
                  placeholder={topbarSearchPlaceholder}
                  type="search"
                />
              </form>
            ) : null}
            <span className="od-role-chip">本週會議週期：2026 W23</span>
            {showTopbarUser ? (
              <div className="od-topbar-user" data-testid="topbar-user-card">
                <UserAvatar identity={identity} />
                <div className="od-user-copy">
                  <strong>{identity.displayName}</strong>
                  <span>{identity.secondaryLabel}</span>
                </div>
                <form action="/auth/logout" method="post">
                  <button className="od-logout-button" aria-label="登出" type="submit">
                    <LogoutIcon size={16} />
                  </button>
                </form>
              </div>
            ) : (
              <form action="/auth/logout" method="post">
                <button className="od-logout-button" aria-label="登出" type="submit">
                  <LogoutIcon size={16} />
                </button>
              </form>
            )}
          </div>
        </header>

        <div className={contentClassName || "od-content"}>{children}</div>
      </main>
    </div>
  );
}
