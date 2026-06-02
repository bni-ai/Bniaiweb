"use server";

import { revalidatePath } from "next/cache";

import { createAdminClient, getChapter } from "./admin-common";
import {
  autoMapImportColumns,
  buildImportPreview,
  IMPORTABLE_MEMBER_FIELDS,
  parseImportCsv,
  type DuplicatePolicy,
  type ExistingImportMember,
  type ImportableMemberField,
} from "../member-import";
import { initialImportState, type ImportActionState } from "../member-import-state";

async function getExistingMembers() {
  const supabase = createAdminClient();
  const chapter = await getChapter();
  const { data, error } = await supabase
    .from("members")
    .select("id, email, member_number, chinese_name")
    .eq("chapter_id", chapter.id as never);
  if (error) throw error;
  return (data || []) as ExistingImportMember[];
}

function readMapping(formData: FormData, headers: string[]) {
  const autoMapping = autoMapImportColumns(headers);
  const mapping: Record<string, ImportableMemberField | ""> = {};
  for (const header of headers) {
    const value = formData.get(`mapping:${header}`);
    const nextValue = typeof value === "string" ? value : autoMapping[header];
    mapping[header] = IMPORTABLE_MEMBER_FIELDS.includes(nextValue as ImportableMemberField)
      ? (nextValue as ImportableMemberField)
      : "";
  }
  return mapping;
}

async function buildStateFromRawCsv(rawCsv: string, formData?: FormData): Promise<ImportActionState> {
  const parsed = parseImportCsv(rawCsv);
  if (!parsed.headers.length) {
    return {
      ...initialImportState,
      message: "找不到可解析的 CSV 標題列。",
      rawCsv,
    };
  }

  const mapping = readMapping(formData || new FormData(), parsed.headers);
  const existingMembers = await getExistingMembers();
  const preview = buildImportPreview(parsed, mapping, existingMembers);

  return {
    stage: "preview",
    message: null,
    rawCsv,
    headers: parsed.headers,
    mapping,
    preview,
    commitSummary: null,
  };
}

export async function previewMemberImportAction(_previousState: ImportActionState, formData: FormData): Promise<ImportActionState> {
  try {
    const rawCsvFromTextarea = String(formData.get("raw_csv") || "").trim();
    const uploadedFile = formData.get("csv_file");
    const rawCsv =
      rawCsvFromTextarea ||
      (uploadedFile instanceof File ? await uploadedFile.text() : "");

    if (!rawCsv.trim()) {
      return {
        ...initialImportState,
        message: "請先選擇 CSV 檔案。",
      };
    }

    return await buildStateFromRawCsv(rawCsv, formData);
  } catch (error) {
    return {
      ...initialImportState,
      message: error instanceof Error ? error.message : "CSV 預覽失敗。",
    };
  }
}

export async function commitMemberImportAction(_previousState: ImportActionState, formData: FormData): Promise<ImportActionState> {
  try {
    const rawCsv = String(formData.get("raw_csv") || "");
    if (!rawCsv.trim()) {
      return { ...initialImportState, message: "缺少預覽資料，請重新上傳 CSV。" };
    }

    const previewState = await buildStateFromRawCsv(rawCsv, formData);
    if (!previewState.preview) {
      return { ...previewState, message: previewState.message || "無法建立匯入預覽。" };
    }

    const blockingRow = previewState.preview.rows.find((row) => row.errors.length > 0);
    if (blockingRow) {
      return { ...previewState, message: `第 ${blockingRow.rowNumber} 列仍有錯誤，請先修正後再匯入。` };
    }

    const duplicatePolicies: Record<string, DuplicatePolicy> = {};
    for (const row of previewState.preview.rows) {
      const policy = String(formData.get(`duplicate_policy:${row.rowNumber}`) || "overwrite");
      duplicatePolicies[String(row.rowNumber)] = policy === "skip" || policy === "merge" ? policy : "overwrite";
    }

    const supabase = createAdminClient();
    const chapter = await getChapter();
    const importRows = previewState.preview.rows.map((row) => ({
      row_number: row.rowNumber,
      existing_id: row.duplicate?.existingId || null,
      duplicate_policy: row.duplicate ? duplicatePolicies[String(row.rowNumber)] || "overwrite" : "create",
      payload: row.payload,
    }));

    const { data, error } = await supabase.rpc("commit_member_import", {
      p_chapter_id: chapter.id,
      import_rows: importRows,
    } as never);

    if (error) throw error;

    revalidatePath("/admin/members");
    revalidatePath("/admin/import");
    return {
      ...previewState,
      stage: "committed",
      message: "匯入完成。",
      commitSummary: (data || {}) as { created: number; updated: number; skipped: number },
    };
  } catch (error) {
    return {
      ...initialImportState,
      message: error instanceof Error ? error.message : "匯入失敗。",
    };
  }
}
