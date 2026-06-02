import { describe, expect, it } from "vitest";

import { autoMapImportColumns, buildImportPreview, parseImportCsv, summarizeCommitPlan } from "./member-import";

describe("member import helpers", () => {
  it("parses utf-8 bom csv and detects comma delimiter", () => {
    const parsed = parseImportCsv("\ufeff編號,中文名,專業別\n001,余啟彰,資訊整合\n002,余啟銘,AI落地");

    expect(parsed.delimiter).toBe(",");
    expect(parsed.headers).toEqual(["編號", "中文名", "專業別"]);
    expect(parsed.rows).toEqual([
      ["001", "余啟彰", "資訊整合"],
      ["002", "余啟銘", "AI落地"],
    ]);
  });

  it("auto maps common column names", () => {
    expect(autoMapImportColumns(["編號", "中文名", "專業別", "公司名稱"])).toEqual({
      編號: "member_number",
      中文名: "chinese_name",
      專業別: "specialty_title",
      公司名稱: "company_name",
    });
  });

  it("validates required fields and detects duplicates", () => {
    const parsed = parseImportCsv("編號,中文名,Email,專業別\n001,余啟彰,fish@example.com,資訊整合\nABC,,oops,AI落地");
    const preview = buildImportPreview(parsed, autoMapImportColumns(parsed.headers), [
      { id: "m-1", member_number: "001", chinese_name: "既有會員", email: "fish@example.com" },
    ]);

    expect(preview.rows[0].duplicate).toMatchObject({
      existingId: "m-1",
      reasons: ["email", "member_number"],
    });
    expect(preview.rows[1].errors).toEqual(
      expect.arrayContaining(["中文姓名不可空白", "會員編號必須為數字", "Email 格式不正確"]),
    );
    expect(preview.summary).toEqual({
      totalRows: 2,
      validRows: 1,
      errorRows: 1,
      duplicates: 1,
      newRecords: 0,
      updates: 1,
    });
  });

  it("summarizes duplicate policies for final commit", () => {
    const parsed = parseImportCsv("編號,中文名,Email,專業別\n001,余啟彰,fish@example.com,資訊整合\n002,余啟銘,ming@example.com,AI落地");
    const preview = buildImportPreview(parsed, autoMapImportColumns(parsed.headers), [
      { id: "m-1", member_number: "001", chinese_name: "既有會員", email: "fish@example.com" },
    ]);

    expect(summarizeCommitPlan(preview.rows, { "2": "skip" })).toEqual({
      createCount: 1,
      updateCount: 0,
      skipCount: 1,
    });
  });
});
