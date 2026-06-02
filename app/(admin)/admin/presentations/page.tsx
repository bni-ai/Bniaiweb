import { redirect } from "next/navigation";

export default function LegacyPresentationsPage() {
  redirect("/admin/presentation");
}
