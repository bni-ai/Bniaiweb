import { redirect } from "next/navigation";

export default function LegacyBriefPage() {
  redirect("/dashboard/report");
}
