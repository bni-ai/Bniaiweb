import type { ImportableMemberField, MemberImportPreview } from "./member-import";

export type ImportActionState = {
  stage: "idle" | "preview" | "committed";
  message: string | null;
  rawCsv: string;
  headers: string[];
  mapping: Record<string, ImportableMemberField | "">;
  preview: MemberImportPreview | null;
  commitSummary: null | {
    created: number;
    updated: number;
    skipped: number;
  };
};

export const initialImportState: ImportActionState = {
  stage: "idle",
  message: null,
  rawCsv: "",
  headers: [],
  mapping: {},
  preview: null,
  commitSummary: null,
};
