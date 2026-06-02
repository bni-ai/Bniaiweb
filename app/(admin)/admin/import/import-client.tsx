"use client";

import { useState, useTransition, type FormEvent } from "react";

import { Card } from "../../../../components/ui/card";
import {
  IMPORTABLE_MEMBER_FIELDS,
  type DuplicatePolicy,
  type ImportableMemberField,
} from "../../../../lib/member-import";
import { initialImportState, type ImportActionState } from "../../../../lib/member-import-state";
import {
  commitMemberImportAction,
  previewMemberImportAction,
} from "../../../../lib/actions/member-import";

const FIELD_LABELS: Record<ImportableMemberField, string> = {
  member_number: "會員編號",
  chinese_name: "中文姓名",
  english_name: "英文姓名",
  email: "Email",
  line_name: "LINE 名稱",
  specialty_title: "專業名稱",
  specialty_description: "專業說明",
  general_referral: "一般引薦",
  ideal_referral: "理想引薦",
  dream_referral: "夢想引薦",
  company_name: "公司名稱",
  company_address: "公司地址",
  industry_experience_years: "產業年資",
  previous_career: "前職",
  role: "角色",
  position: "職掌",
  committee: "委員會",
  is_active: "是否啟用",
};

function SummaryPill({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-border bg-surface-2 px-4 py-3">
      <p className="text-xs text-text-2">{label}</p>
      <p className="mt-1 text-xl font-black text-text-1">{value}</p>
    </div>
  );
}

export function ImportClient() {
  const [state, setState] = useState<ImportActionState>(initialImportState);
  const [isPending, startTransition] = useTransition();

  async function runPreview(formData: FormData) {
    startTransition(async () => {
      const nextState = await previewMemberImportAction(state, formData);
      setState(nextState);
    });
  }

  async function runCommit(formData: FormData) {
    startTransition(async () => {
      const nextState = await commitMemberImportAction(state, formData);
      setState(nextState);
    });
  }

  function handlePreviewSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    void runPreview(formData);
  }

  function handleCommitSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    void runCommit(formData);
  }

  const preview = state.preview;

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-text-2">Import Workflow</p>
        <h1 className="text-3xl font-black">資料匯入</h1>
        <p className="mt-2 text-sm text-text-2">
          上傳會員 CSV 後，系統會先做欄位對應、逐列驗證與重複偵測，確認無誤後才會 atomic commit。
        </p>
      </div>

      {state.message ? (
        <Card className={`rounded-[24px] p-4 text-sm ${state.stage === "committed" ? "border-emerald-300 bg-emerald-50 text-emerald-900" : "border-red-200 bg-red-50 text-red-700"}`}>
          {state.message}
          {state.commitSummary ? (
            <div className="mt-3 flex gap-3 text-xs font-medium">
              <span>新增 {state.commitSummary.created}</span>
              <span>更新 {state.commitSummary.updated}</span>
              <span>跳過 {state.commitSummary.skipped}</span>
            </div>
          ) : null}
        </Card>
      ) : null}

      <form onSubmit={handlePreviewSubmit} className="space-y-4">
        <Card className="rounded-[24px] p-5">
          <div className="grid gap-4 md:grid-cols-[1fr_auto] md:items-end">
            <label className="grid gap-2 text-sm">
              <span className="font-medium text-text-1">CSV 檔案</span>
              <input
                name="csv_file"
                type="file"
                accept=".csv,text/csv,text/tab-separated-values,.tsv"
                className="rounded-2xl border border-border px-3 py-2.5"
              />
            </label>
            <button
              type="submit"
              className="inline-flex h-11 items-center justify-center rounded-2xl bg-primary px-5 text-sm font-semibold text-white disabled:opacity-60"
              disabled={isPending}
            >
              {isPending ? "處理中..." : "解析並預覽"}
            </button>
          </div>
          {state.rawCsv ? <textarea name="raw_csv" defaultValue={state.rawCsv} className="hidden" readOnly /> : null}
        </Card>

        {preview ? (
          <>
            <Card className="rounded-[24px] p-5">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-black text-text-1">欄位對應</h2>
                  <p className="mt-1 text-sm text-text-2">可在匯入前調整 CSV 欄位對應，再重新預覽。</p>
                </div>
                <button
                  type="submit"
                  className="inline-flex h-10 items-center justify-center rounded-2xl border border-border px-4 text-sm font-medium text-text-1 disabled:opacity-60"
                  disabled={isPending}
                >
                  重新預覽
                </button>
              </div>
              <div className="mt-4 grid gap-3 md:grid-cols-2">
                {state.headers.map((header) => (
                  <label key={header} className="grid gap-2 text-sm">
                    <span className="font-medium text-text-1">{header}</span>
                    <select
                      name={`mapping:${header}`}
                      defaultValue={state.mapping[header] || ""}
                      className="rounded-2xl border border-border px-3 py-2.5"
                    >
                      <option value="">忽略這欄</option>
                      {IMPORTABLE_MEMBER_FIELDS.map((field) => (
                        <option key={field} value={field}>
                          {FIELD_LABELS[field]}
                        </option>
                      ))}
                    </select>
                  </label>
                ))}
              </div>
            </Card>

            <div className="grid gap-3 md:grid-cols-6">
              <SummaryPill label="總列數" value={preview.summary.totalRows} />
              <SummaryPill label="可匯入" value={preview.summary.validRows} />
              <SummaryPill label="錯誤列" value={preview.summary.errorRows} />
              <SummaryPill label="重複列" value={preview.summary.duplicates} />
              <SummaryPill label="新增" value={preview.summary.newRecords} />
              <SummaryPill label="更新候選" value={preview.summary.updates} />
            </div>
          </>
        ) : null}
      </form>

      {preview ? (
        <form onSubmit={handleCommitSubmit} className="space-y-4">
          <textarea name="raw_csv" defaultValue={state.rawCsv} className="hidden" readOnly />
          {state.headers.map((header) => (
            <input key={header} type="hidden" name={`mapping:${header}`} value={state.mapping[header] || ""} readOnly />
          ))}

          <Card className="overflow-hidden rounded-[24px]">
            <div className="border-b border-border px-5 py-4">
              <h2 className="text-lg font-black text-text-1">預覽與重複策略</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-surface-2 text-text-2">
                  <tr>
                    <th className="px-4 py-3">列</th>
                    <th className="px-4 py-3">會員編號</th>
                    <th className="px-4 py-3">姓名</th>
                    <th className="px-4 py-3">Email</th>
                    <th className="px-4 py-3">專業</th>
                    <th className="px-4 py-3">狀態</th>
                    <th className="px-4 py-3">重複策略</th>
                  </tr>
                </thead>
                <tbody>
                  {preview.rows.map((row) => {
                    const hasError = row.errors.length > 0;
                    const duplicate = row.duplicate;
                    const defaultPolicy: DuplicatePolicy = duplicate ? "overwrite" : "overwrite";
                    return (
                      <tr key={row.rowNumber} className={`border-t border-border align-top ${hasError ? "bg-red-50/70" : duplicate ? "bg-amber-50/60" : ""}`}>
                        <td className="px-4 py-3 font-medium text-text-1">{row.rowNumber}</td>
                        <td className="px-4 py-3 text-text-1">{row.payload.member_number || "-"}</td>
                        <td className="px-4 py-3 text-text-1">{row.payload.chinese_name || "-"}</td>
                        <td className="px-4 py-3 text-text-2">{row.payload.email || "-"}</td>
                        <td className="px-4 py-3 text-text-2">{row.payload.specialty_title || "-"}</td>
                        <td className="px-4 py-3">
                          {hasError ? (
                            <div className="space-y-1 text-xs text-red-700">
                              {row.errors.map((error) => (
                                <p key={error}>{error}</p>
                              ))}
                            </div>
                          ) : duplicate ? (
                            <div className="space-y-1 text-xs text-amber-800">
                              <p>重複：{duplicate.existingLabel}</p>
                              <p>依據：{duplicate.reasons.join(" + ")}</p>
                            </div>
                          ) : (
                            <span className="text-xs font-medium text-emerald-700">新增</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          {duplicate ? (
                            <select
                              name={`duplicate_policy:${row.rowNumber}`}
                              defaultValue={defaultPolicy}
                              className="rounded-2xl border border-border px-3 py-2"
                            >
                              <option value="overwrite">覆寫既有資料</option>
                              <option value="merge">只補空白欄位</option>
                              <option value="skip">跳過此列</option>
                            </select>
                          ) : (
                            <span className="text-xs text-text-2">不適用</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>

          <div className="flex justify-end">
            <button
              type="submit"
              className="inline-flex h-11 items-center justify-center rounded-2xl bg-primary px-5 text-sm font-semibold text-white disabled:opacity-60"
              disabled={isPending || preview.summary.errorRows > 0}
            >
              {isPending ? "匯入中..." : "確認匯入"}
            </button>
          </div>
        </form>
      ) : null}
    </div>
  );
}
