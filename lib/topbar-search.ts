export function resolveAdminSearchHref(rawQuery: string) {
  const query = rawQuery.trim();
  if (!query) return "/admin";

  const normalized = query.toLowerCase();

  const keywordRoutes: Array<{ keywords: string[]; href: string }> = [
    { keywords: ["簡報", "投影片", "presentation", "slides"], href: "/admin/presentation" },
    { keywords: ["短講", "keynote", "8 分鐘"], href: "/admin/keynote" },
    { keywords: ["來賓", "guest"], href: "/admin/guests" },
    { keywords: ["提交", "投稿", "submission"], href: "/admin/submission" },
    { keywords: ["vp", "報告"], href: "/admin/vp-report" },
    { keywords: ["獎項", "award"], href: "/admin/awards" },
    { keywords: ["活動", "event"], href: "/admin/events" },
    { keywords: ["培訓", "training"], href: "/admin/training" },
    { keywords: ["匯入", "import"], href: "/admin/import" },
    { keywords: ["設定", "system", "settings"], href: "/admin/settings" },
  ];

  const matchedRoute = keywordRoutes.find(({ keywords }) =>
    keywords.some((keyword) => normalized.includes(keyword.toLowerCase())),
  );

  if (matchedRoute) return matchedRoute.href;

  return `/admin/members?q=${encodeURIComponent(query)}`;
}
