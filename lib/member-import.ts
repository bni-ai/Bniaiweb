import type { Database } from "./supabase/types";

export const IMPORTABLE_MEMBER_FIELDS = [
  "member_number",
  "chinese_name",
  "english_name",
  "email",
  "line_name",
  "specialty_title",
  "specialty_description",
  "general_referral",
  "ideal_referral",
  "dream_referral",
  "company_name",
  "company_address",
  "industry_experience_years",
  "previous_career",
  "role",
  "position",
  "committee",
  "is_active",
] as const;

export type ImportableMemberField = (typeof IMPORTABLE_MEMBER_FIELDS)[number];

export type ParsedImportCsv = {
  delimiter: "," | "\t";
  headers: string[];
  rows: string[][];
};

export type ExistingImportMember = Pick<
  Database["public"]["Tables"]["members"]["Row"],
  "id" | "email" | "member_number" | "chinese_name"
>;

export type DuplicatePolicy = "skip" | "overwrite" | "merge";

export type MemberImportPreviewRow = {
  rowNumber: number;
  source: Record<string, string>;
  payload: Partial<Database["public"]["Tables"]["members"]["Insert"]>;
  errors: string[];
  duplicate: null | {
    existingId: string;
    existingLabel: string;
    reasons: Array<"email" | "member_number">;
  };
};

export type MemberImportPreview = {
  rows: MemberImportPreviewRow[];
  summary: {
    totalRows: number;
    validRows: number;
    errorRows: number;
    duplicates: number;
    newRecords: number;
    updates: number;
  };
};

const HEADER_ALIASES: Record<string, ImportableMemberField> = {
  "編號": "member_number",
  "會員編號": "member_number",
  "member no": "member_number",
  "member number": "member_number",
  "中文名": "chinese_name",
  "中文姓名": "chinese_name",
  "姓名": "chinese_name",
  "英文名": "english_name",
  "english name": "english_name",
  "email": "email",
  "e-mail": "email",
  "line": "line_name",
  "line id": "line_name",
  "line名稱": "line_name",
  "line名稱id": "line_name",
  "line名稱帳號": "line_name",
  "專業別": "specialty_title",
  "專業": "specialty_title",
  "specialty": "specialty_title",
  "專業說明": "specialty_description",
  "一般引薦": "general_referral",
  "理想引薦": "ideal_referral",
  "夢想引薦": "dream_referral",
  "公司": "company_name",
  "公司名稱": "company_name",
  "公司地址": "company_address",
  "年資": "industry_experience_years",
  "產業年資": "industry_experience_years",
  "前職": "previous_career",
  "角色": "role",
  "職掌": "position",
  "委員會": "committee",
  "啟用": "is_active",
  "是否啟用": "is_active",
};

const VALID_ROLES = new Set(["member", "officer", "president"]);
const VALID_POSITIONS = new Set(["主席", "副主席", "秘書財務", "資訊組長", "成長協調", "活動協調", "導師協調", "教育協調", "來賓接待"]);
const VALID_COMMITTEES = new Set(["導師群", "接待組員", "教育組員", "秘財組員", "資訊組員", "成長組員", "活動組員", "會員委員"]);

function normalizeHeader(value: string) {
  return value.trim().replace(/\ufeff/g, "").toLowerCase().replace(/[\s_\-()/]+/g, "");
}

function splitCsvLine(line: string, delimiter: "," | "\t") {
  const cells: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];
    if (char === "\"") {
      const next = line[index + 1];
      if (inQuotes && next === "\"") {
        current += "\"";
        index += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }
    if (!inQuotes && char === delimiter) {
      cells.push(current.trim());
      current = "";
      continue;
    }
    current += char;
  }

  cells.push(current.trim());
  return cells;
}

export function parseImportCsv(input: string): ParsedImportCsv {
  const normalized = input.replace(/^\ufeff/, "").replace(/\r\n/g, "\n").replace(/\r/g, "\n").trim();
  if (!normalized) {
    return { delimiter: ",", headers: [], rows: [] };
  }

  const lines = normalized.split("\n").filter((line) => line.trim().length > 0);
  const delimiter: "," | "\t" = lines[0].includes("\t") ? "\t" : ",";
  const headers = splitCsvLine(lines[0], delimiter).map((cell) => cell.replace(/^\ufeff/, "").trim());
  const rows = lines.slice(1).map((line) => {
    const cells = splitCsvLine(line, delimiter);
    while (cells.length < headers.length) cells.push("");
    return cells.slice(0, headers.length);
  });

  return { delimiter, headers, rows };
}

export function autoMapImportColumns(headers: string[]): Record<string, ImportableMemberField | ""> {
  const mapping: Record<string, ImportableMemberField | ""> = {};
  for (const header of headers) {
    mapping[header] = HEADER_ALIASES[normalizeHeader(header)] || "";
  }
  return mapping;
}

function normalizeOptional(value: string | undefined) {
  const trimmed = (value || "").trim();
  return trimmed ? trimmed : null;
}

function toBooleanFlag(value: string | undefined) {
  const normalized = (value || "").trim().toLowerCase();
  if (!normalized) return true;
  if (["1", "true", "yes", "y", "是", "啟用"].includes(normalized)) return true;
  if (["0", "false", "no", "n", "否", "停用"].includes(normalized)) return false;
  return null;
}

function toMemberInsertPayload(source: Record<string, string>, mapping: Record<string, ImportableMemberField | "">) {
  const payload: Partial<Database["public"]["Tables"]["members"]["Insert"]> = {};

  for (const [header, field] of Object.entries(mapping)) {
    if (!field) continue;
    const raw = source[header] || "";
    switch (field) {
      case "industry_experience_years":
        payload.industry_experience_years = raw.trim() ? Number(raw.trim()) : null;
        break;
      case "is_active":
        payload.is_active = toBooleanFlag(raw) ?? true;
        break;
      case "email":
        payload.email = raw.trim().toLowerCase();
        break;
      case "member_number":
        payload.member_number = normalizeOptional(raw);
        break;
      case "role":
        payload.role = (raw.trim().toLowerCase() || "member") as Database["public"]["Tables"]["members"]["Insert"]["role"];
        break;
      default:
        payload[field] = normalizeOptional(raw) as never;
    }
  }

  if (!payload.role) payload.role = "member";
  if (typeof payload.is_active !== "boolean") payload.is_active = true;
  return payload;
}

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export function buildImportPreview(
  parsed: ParsedImportCsv,
  mapping: Record<string, ImportableMemberField | "">,
  existingMembers: ExistingImportMember[],
): MemberImportPreview {
  const existingByEmail = new Map<string, ExistingImportMember>();
  const existingByNumber = new Map<string, ExistingImportMember>();

  for (const member of existingMembers) {
    if (member.email) existingByEmail.set(member.email.trim().toLowerCase(), member);
    if (member.member_number) existingByNumber.set(member.member_number.trim(), member);
  }

  const rows = parsed.rows.map<MemberImportPreviewRow>((cells, rowIndex) => {
    const source = Object.fromEntries(parsed.headers.map((header, headerIndex) => [header, cells[headerIndex] || ""]));
    const payload = toMemberInsertPayload(source, mapping);
    const errors: string[] = [];

    if (!payload.member_number) errors.push("會員編號不可空白");
    if (!payload.chinese_name) errors.push("中文姓名不可空白");
    if (payload.member_number && !/^\d+$/.test(payload.member_number)) errors.push("會員編號必須為數字");
    if (payload.email && !isValidEmail(payload.email)) errors.push("Email 格式不正確");
    if (payload.industry_experience_years !== null && payload.industry_experience_years !== undefined && !Number.isFinite(payload.industry_experience_years)) {
      errors.push("產業年資必須為數字");
    }
    if (payload.role && !VALID_ROLES.has(payload.role)) errors.push("角色必須是 member / officer / president");
    if (payload.position && !VALID_POSITIONS.has(payload.position)) errors.push("職掌不在允許列表中");
    if (payload.committee && !VALID_COMMITTEES.has(payload.committee)) errors.push("委員會不在允許列表中");
    if (mapping.email && !payload.email) errors.push("Email 欄位不可空白");

    const duplicateReasons: Array<"email" | "member_number"> = [];
    const byEmail = payload.email ? existingByEmail.get(payload.email) : undefined;
    const byNumber = payload.member_number ? existingByNumber.get(payload.member_number) : undefined;
    const duplicateMember = byEmail || byNumber || null;
    if (byEmail) duplicateReasons.push("email");
    if (byNumber) duplicateReasons.push("member_number");
    if (byEmail && byNumber && byEmail.id !== byNumber.id) {
      errors.push("Email 與會員編號對應到不同既有會員，請先整理來源資料");
    }
    if (!duplicateMember && !payload.email) {
      errors.push("新增會員必須提供 Email");
    }

    return {
      rowNumber: rowIndex + 2,
      source,
      payload,
      errors,
      duplicate: duplicateMember
        ? {
            existingId: duplicateMember.id,
            existingLabel: `${duplicateMember.chinese_name} (${duplicateMember.member_number || "無編號"})`,
            reasons: duplicateReasons,
          }
        : null,
    };
  });

  return {
    rows,
    summary: {
      totalRows: rows.length,
      validRows: rows.filter((row) => row.errors.length === 0).length,
      errorRows: rows.filter((row) => row.errors.length > 0).length,
      duplicates: rows.filter((row) => row.duplicate).length,
      newRecords: rows.filter((row) => row.errors.length === 0 && !row.duplicate).length,
      updates: rows.filter((row) => row.errors.length === 0 && row.duplicate).length,
    },
  };
}

export function summarizeCommitPlan(
  previewRows: MemberImportPreviewRow[],
  duplicatePolicies: Record<string, DuplicatePolicy>,
) {
  let createCount = 0;
  let updateCount = 0;
  let skipCount = 0;

  for (const row of previewRows) {
    if (row.errors.length > 0) continue;
    if (!row.duplicate) {
      createCount += 1;
      continue;
    }
    const policy = duplicatePolicies[String(row.rowNumber)] || "overwrite";
    if (policy === "skip") skipCount += 1;
    else updateCount += 1;
  }

  return { createCount, updateCount, skipCount };
}
