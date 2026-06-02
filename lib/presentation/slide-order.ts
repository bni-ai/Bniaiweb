import type { Json } from "../supabase/types";
import type { SlideEntry } from "./types";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isBoolean(value: unknown): value is boolean {
  return typeof value === "boolean";
}

export function parseSlideOrder(raw: Json): SlideEntry[] {
  if (!Array.isArray(raw)) {
    throw new Error("slide_order 必須是陣列");
  }

  return raw.map((entry) => {
    if (!isRecord(entry) || typeof entry.type !== "string") {
      throw new Error("slide_order entry 格式不正確");
    }

    switch (entry.type) {
      case "cover":
        return { type: "cover" };
      case "team":
        return { type: "team" };
      case "keynote":
      case "member":
      case "guest":
      case "award":
      case "vp_report":
        if (typeof entry.id !== "string" || !isBoolean(entry.visible)) {
          throw new Error(`slide_order entry ${entry.type} 缺少 id 或 visible`);
        }
        return { type: entry.type, id: entry.id, visible: entry.visible } as SlideEntry;
      default:
        throw new Error(`未知 slide type: ${String(entry.type)}`);
    }
  });
}
