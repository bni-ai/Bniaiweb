export type GuestContentVisibility = "public" | "guest_only";
export type GuestContentStatus = "draft" | "published";

export type GuestContentItemLike = {
  title: string;
  status: string;
  visibility: string;
  published_at: string | null;
};

export type GuestVisitLike = {
  week_date: string;
  status: string;
  visit_number: number;
};

export function filterGuestContentItems<T extends GuestContentItemLike>(items: T[], isGuest: boolean): T[] {
  return items.filter((item) => {
    if (item.status !== "published") return false;
    if (item.visibility === "public") return true;
    return isGuest && item.visibility === "guest_only";
  });
}

export function selectCurrentGuestVisit<T extends GuestVisitLike>(visits: T[]): T | null {
  return visits
    .filter((visit) => visit.status !== "no_show")
    .sort((a, b) => b.week_date.localeCompare(a.week_date))[0] || null;
}
