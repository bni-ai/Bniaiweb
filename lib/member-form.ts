import { optionalText, requireText } from "./actions/admin-common";

export type MemberRole = "member" | "officer" | "president";

function optionalNumber(value: string): number | null {
  if (!value.trim()) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function requireField(value: string, label: string) {
  if (!value.trim()) {
    throw new Error(`${label} 為必填`);
  }
}

export function parseAdminMemberFormData(formData: FormData, mode: "create" | "update") {
  const email = requireText(formData, "email");
  const memberNumber = requireText(formData, "member_number");
  const chineseName = requireText(formData, "chinese_name");
  const specialtyTitle = requireText(formData, "specialty_title");
  const role = requireText(formData, "role") as MemberRole;

  if (mode === "create") {
    requireField(email, "Email");
    requireField(memberNumber, "會員編號");
    requireField(chineseName, "中文姓名");
    requireField(specialtyTitle, "專業名稱");
    requireField(role, "角色");
  }

  return {
    email: email || undefined,
    member_number: memberNumber || null,
    chinese_name: chineseName,
    english_name: optionalText(formData, "english_name"),
    line_name: optionalText(formData, "line_name"),
    specialty_title: specialtyTitle || null,
    specialty_description: optionalText(formData, "specialty_description"),
    general_referral: optionalText(formData, "general_referral"),
    ideal_referral: optionalText(formData, "ideal_referral"),
    dream_referral: optionalText(formData, "dream_referral"),
    company_name: optionalText(formData, "company_name"),
    company_address: optionalText(formData, "company_address"),
    industry_experience_years: optionalNumber(requireText(formData, "industry_experience_years")),
    previous_career: optionalText(formData, "previous_career"),
    photo_url: optionalText(formData, "photo_url"),
    role: role || "member",
    position: optionalText(formData, "position"),
    committee: optionalText(formData, "committee"),
    is_active: requireText(formData, "is_active") !== "false",
  };
}

export function parseMemberProfileFormData(formData: FormData) {
  const chineseName = requireText(formData, "chinese_name");
  const specialtyTitle = requireText(formData, "specialty_title");
  requireField(chineseName, "中文姓名");
  requireField(specialtyTitle, "專業名稱");

  return {
    chinese_name: chineseName,
    english_name: optionalText(formData, "english_name"),
    line_name: optionalText(formData, "line_name"),
    specialty_title: specialtyTitle,
    specialty_description: optionalText(formData, "specialty_description"),
    general_referral: optionalText(formData, "general_referral"),
    ideal_referral: optionalText(formData, "ideal_referral"),
    dream_referral: optionalText(formData, "dream_referral"),
    company_name: optionalText(formData, "company_name"),
    company_address: optionalText(formData, "company_address"),
    industry_experience_years: optionalNumber(requireText(formData, "industry_experience_years")),
    previous_career: optionalText(formData, "previous_career"),
    photo_url: optionalText(formData, "photo_url"),
  };
}

export function buildTopClientsPayload(formData: FormData) {
  const rows: Array<{
    rank: number;
    industry: string;
    company_type: string | null;
    location: string | null;
    notes: string | null;
  }> = [];

  for (let rank = 1; rank <= 10; rank += 1) {
    const industry = requireText(formData, `rank_${rank}_industry`);
    if (!industry) continue;
    rows.push({
      rank,
      industry,
      company_type: optionalText(formData, `rank_${rank}_company_type`),
      location: optionalText(formData, `rank_${rank}_location`),
      notes: optionalText(formData, `rank_${rank}_notes`),
    });
  }

  return rows;
}

export function buildContactsCirclePayload(formData: FormData) {
  const explicitTotal = Number(formData.get("contacts_total") || 0);
  const inferredTotal = Array.from(formData.keys()).reduce((max, key) => {
    const match = key.match(/^contact_(?:id|name|tier|relationship|industry|notes)_(\d+)$/);
    if (!match) return max;
    return Math.max(max, Number(match[1]) + 1);
  }, 0);
  const totalRows = Math.max(explicitTotal, inferredTotal);

  const rows: Array<{
    id: string | null;
    name: string;
    tier: 1 | 2 | 3;
    relationship: string | null;
    industry: string | null;
    notes: string | null;
  }> = [];

  for (let index = 0; index < totalRows; index += 1) {
    const name = requireText(formData, `contact_name_${index}`);
    const tierValue = requireText(formData, `contact_tier_${index}`);
    if (!name && !tierValue) continue;
    const tier = Number(tierValue);
    if (![1, 2, 3].includes(tier)) {
      throw new Error("Tier 必須是 1、2 或 3");
    }
    if (!name) continue;
    rows.push({
      id: optionalText(formData, `contact_id_${index}`),
      name,
      tier: tier as 1 | 2 | 3,
      relationship: optionalText(formData, `contact_relationship_${index}`),
      industry: optionalText(formData, `contact_industry_${index}`),
      notes: optionalText(formData, `contact_notes_${index}`),
    });
  }

  return rows;
}
