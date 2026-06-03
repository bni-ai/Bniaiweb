import type { Json } from "../supabase/types";
import type { SlideEditorPatch, SlideEntry, SlideFontSize, SlideTextAlign, SlideTextLayer } from "./types";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isBoolean(value: unknown): value is boolean {
  return typeof value === "boolean";
}

function isFontSize(value: unknown): value is SlideFontSize {
  return value === "sm" || value === "md" || value === "lg" || value === "xl";
}

function isTextAlign(value: unknown): value is SlideTextAlign {
  return value === "left" || value === "center" || value === "right";
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function parseTextLayers(value: unknown): SlideTextLayer[] | undefined {
  if (value === undefined) return undefined;
  if (!Array.isArray(value)) {
    throw new Error("slide_order editor.textLayers 格式不正確");
  }

  return value.map((layer, index) => {
    if (!isRecord(layer)) {
      throw new Error(`slide_order editor.textLayers[${index}] 格式不正確`);
    }

    if (
      typeof layer.id !== "string" ||
      typeof layer.text !== "string" ||
      !isFiniteNumber(layer.x) ||
      !isFiniteNumber(layer.y) ||
      !isFiniteNumber(layer.width) ||
      !isFiniteNumber(layer.height) ||
      !isFiniteNumber(layer.fontSize) ||
      typeof layer.color !== "string" ||
      typeof layer.fontWeight !== "string" ||
      !isTextAlign(layer.align)
    ) {
      throw new Error(`slide_order editor.textLayers[${index}] 欄位格式不正確`);
    }

    return {
      id: layer.id,
      text: layer.text,
      x: layer.x,
      y: layer.y,
      width: layer.width,
      height: layer.height,
      fontSize: layer.fontSize,
      color: layer.color,
      fontWeight: layer.fontWeight,
      align: layer.align,
    };
  });
}

function parseEditor(value: unknown): SlideEditorPatch | undefined {
  if (value === undefined) return undefined;
  if (!isRecord(value)) {
    throw new Error("slide_order editor 格式不正確");
  }

  const next: SlideEditorPatch = {};
  if ("title" in value) {
    if (value.title !== null && typeof value.title !== "string") throw new Error("slide_order editor.title 格式不正確");
    next.title = value.title as string | null;
  }
  if ("body" in value) {
    if (value.body !== null && typeof value.body !== "string") throw new Error("slide_order editor.body 格式不正確");
    next.body = value.body as string | null;
  }
  if ("backgroundImageUrl" in value) {
    if (value.backgroundImageUrl !== null && typeof value.backgroundImageUrl !== "string") throw new Error("slide_order editor.backgroundImageUrl 格式不正確");
    next.backgroundImageUrl = value.backgroundImageUrl as string | null;
  }
  if ("fontSize" in value) {
    if (value.fontSize !== null && !isFontSize(value.fontSize)) throw new Error("slide_order editor.fontSize 格式不正確");
    next.fontSize = value.fontSize as SlideFontSize | null;
  }
  if ("textLayers" in value) {
    next.textLayers = value.textLayers === null ? null : parseTextLayers(value.textLayers);
  }
  if ("dataOverride" in value && value.dataOverride !== undefined) {
    if (!isRecord(value.dataOverride)) throw new Error("slide_order editor.dataOverride 格式不正確");
    const overrideEntries = Object.entries(value.dataOverride as Record<string, unknown>);
    for (const [k, v] of overrideEntries) {
      if (v !== null && typeof v !== "string") throw new Error(`slide_order editor.dataOverride.${k} 格式不正確`);
    }
    next.dataOverride = value.dataOverride as Record<string, string | null>;
  }
  return next;
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
        return { type: "cover", editor: parseEditor(entry.editor) };
      case "agenda":
        return { type: "agenda", editor: parseEditor(entry.editor) };
      case "team":
        return { type: "team", editor: parseEditor(entry.editor) };
      case "closing":
        return { type: "closing", editor: parseEditor(entry.editor) };
      case "keynote":
      case "member":
      case "guest":
      case "award":
      case "vp_report":
      case "custom":
        if (typeof entry.id !== "string" || !isBoolean(entry.visible)) {
          throw new Error(`slide_order entry ${entry.type} 缺少 id 或 visible`);
        }
        return { type: entry.type, id: entry.id, visible: entry.visible, editor: parseEditor(entry.editor) } as SlideEntry;
      default:
        throw new Error(`未知 slide type: ${String(entry.type)}`);
    }
  });
}
