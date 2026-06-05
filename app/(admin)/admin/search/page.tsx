import { redirect } from "next/navigation";

import { resolveAdminSearchHref } from "../../../../lib/topbar-search";

export default async function AdminSearchPage({
  searchParams,
}: {
  searchParams?: Promise<{ q?: string }>;
}) {
  const params = await searchParams;
  redirect(resolveAdminSearchHref(params?.q || ""));
}
