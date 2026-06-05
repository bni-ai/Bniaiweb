import { requireText } from "../actions/admin-common";
import { parseSlideOrder } from "./slide-order";
import type { SlideEditorPatch, SlideEntry, SlideFontSize, SlideImageLayer, SlideTextLayer } from "./types";

export function isVisibleSlide(entry: SlideEntry): entry is Extract<SlideEntry, { visible: boolean }> {
  return "visible" in entry;
}

export function describeSlideEntry(entry: SlideEntry) {
  switch (entry.type) {
    case "cover":
      return { label: "封面", typeLabel: "固定", canToggle: false };
    case "agenda":
      return { label: "例會議程", typeLabel: "固定", canToggle: false };
    case "keynote":
      return { label: "8 分鐘短講", typeLabel: "短講", canToggle: true };
    case "member":
      return { label: "會員投影片", typeLabel: "會員", canToggle: true };
    case "guest":
      return { label: "來賓介紹", typeLabel: "來賓", canToggle: true };
    case "award":
      return { label: "獎項表揚", typeLabel: "獎項", canToggle: true };
    case "vp_report":
      return { label: "VP 報告", typeLabel: "報告", canToggle: true };
    case "team":
      return { label: "團隊結尾", typeLabel: "固定", canToggle: false };
    case "closing":
      return { label: "結束頁", typeLabel: "固定", canToggle: false };
    case "custom":
      return { label: "自訂投影片", typeLabel: "自訂", canToggle: true };
  }
}

export function describeSlideThumbnail(entry: SlideEntry) {
  switch (entry.type) {
    case "cover":
      return { label: "首頁", typeLabel: "固定" };
    case "agenda":
      return { label: "議程", typeLabel: "固定" };
    case "keynote":
      return { label: "演講", typeLabel: "短講" };
    case "member":
      return { label: "會員", typeLabel: "會員" };
    case "guest":
      return { label: "來賓", typeLabel: "來賓" };
    case "award":
      return { label: "獎項", typeLabel: "獎項" };
    case "vp_report":
      return { label: "報告", typeLabel: "報告" };
    case "team":
      return { label: "團隊", typeLabel: "固定" };
    case "closing":
      return { label: "結束", typeLabel: "固定" };
    case "custom":
      return { label: "自訂", typeLabel: "自訂" };
  }
}

function parseFontSize(value: FormDataEntryValue | null): SlideFontSize {
  return value === "sm" || value === "md" || value === "xl" ? value : "lg";
}

function parseEditorJson(value: FormDataEntryValue | null): SlideEditorPatch | null {
  if (typeof value !== "string" || !value.trim()) return null;
  const parsed = JSON.parse(value) as SlideEditorPatch;
  return parsed;
}

function normalizeTextLayers(value: SlideTextLayer[] | null | undefined): SlideTextLayer[] | undefined {
  if (!Array.isArray(value)) return undefined;
  return value.map((layer, index) => ({
    id: typeof layer.id === "string" && layer.id.length > 0 ? layer.id : `layer-${index + 1}`,
    text: String(layer.text || ""),
    x: Number.isFinite(layer.x) ? layer.x : 128,
    y: Number.isFinite(layer.y) ? layer.y : 160,
    width: Number.isFinite(layer.width) ? layer.width : 920,
    height: Number.isFinite(layer.height) ? layer.height : 160,
    fontSize: Number.isFinite(layer.fontSize) ? layer.fontSize : 48,
    color: typeof layer.color === "string" && layer.color ? layer.color : "#ffffff",
    fontWeight: typeof layer.fontWeight === "string" && layer.fontWeight ? layer.fontWeight : "700",
    align: layer.align === "center" || layer.align === "right" ? layer.align : "left",
  }));
}

function normalizeImageLayers(value: SlideImageLayer[] | null | undefined): SlideImageLayer[] | undefined {
  if (!Array.isArray(value)) return undefined;
  return value.map((layer, index) => ({
    id: typeof layer.id === "string" && layer.id.length > 0 ? layer.id : `image-layer-${index + 1}`,
    imageUrl: String(layer.imageUrl || ""),
    x: Number.isFinite(layer.x) ? layer.x : 720,
    y: Number.isFinite(layer.y) ? layer.y : 360,
    width: Number.isFinite(layer.width) ? layer.width : 480,
    height: Number.isFinite(layer.height) ? layer.height : 360,
    borderRadius: (layer.borderRadius === 0 || layer.borderRadius === 8 || layer.borderRadius === 16 || layer.borderRadius === 999) ? layer.borderRadius : 0,
    shadow: (layer.shadow === "none" || layer.shadow === "sm" || layer.shadow === "md") ? layer.shadow : "none",
    objectFit: (layer.objectFit === "cover" || layer.objectFit === "contain") ? layer.objectFit : "cover",
  }));
}

function buildEditorPatch(
  formData: FormData,
  index: number,
  uploadedBackgroundImageUrl?: string | null,
): SlideEditorPatch {
  const editorJson = parseEditorJson(formData.get(`slide_editor_json_${index}`));
  if (editorJson) {
    return {
      title: editorJson.title ?? "",
      body: editorJson.body ?? "",
      backgroundImageUrl: uploadedBackgroundImageUrl ?? (editorJson.backgroundImageUrl || null),
      fontSize: editorJson.fontSize ?? "lg",
      textLayers: normalizeTextLayers(editorJson.textLayers),
      imageLayers: normalizeImageLayers(editorJson.imageLayers),
      timerEnabled: editorJson.timerEnabled === true,
      timerSeconds: typeof editorJson.timerSeconds === "number" && Number.isFinite(editorJson.timerSeconds)
        ? editorJson.timerSeconds
        : null,
    };
  }

  const existingBackgroundImageUrl = String(formData.get(`slide_background_existing_${index}`) || "");
  return {
    title: String(formData.get(`slide_title_${index}`) || ""),
    body: String(formData.get(`slide_body_${index}`) || ""),
    backgroundImageUrl: uploadedBackgroundImageUrl ?? (existingBackgroundImageUrl || null),
    fontSize: parseFontSize(formData.get(`slide_font_size_${index}`)),
    timerEnabled: false,
    timerSeconds: null,
  };
}

export function buildWorkbenchSlideOrder(
  formData: FormData,
  options?: { backgroundImageUrlsByIndex?: Map<number, string | null> },
): SlideEntry[] {
  const count = Number(requireText(formData, "slide_count"));
  if (!Number.isInteger(count) || count < 0) throw new Error("投影片數量不合法");

  const rows = Array.from({ length: count }, (_, index) => {
    const parsed = parseSlideOrder([JSON.parse(requireText(formData, `slide_payload_${index}`))])[0];
    const editor = buildEditorPatch(formData, index, options?.backgroundImageUrlsByIndex?.get(index));
    const visibleValue = formData.get(`slide_visible_${index}`);
    const nextEntry = isVisibleSlide(parsed)
      ? { ...parsed, visible: visibleValue === null ? false : visibleValue !== "false", editor }
      : { ...parsed, editor };
    const order = Number(requireText(formData, `slide_order_${index}`));
    return {
      entry: nextEntry,
      order: Number.isFinite(order) ? order : index + 1,
      originalIndex: index,
    };
  });

  return rows
    .sort((left, right) => left.order - right.order || left.originalIndex - right.originalIndex)
    .map((row) => row.entry);
}
