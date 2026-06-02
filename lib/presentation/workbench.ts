import { requireText } from "../actions/admin-common";
import { parseSlideOrder } from "./slide-order";
import type { SlideEntry } from "./types";

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
  }
}

export function buildWorkbenchSlideOrder(formData: FormData): SlideEntry[] {
  const count = Number(requireText(formData, "slide_count"));
  if (!Number.isInteger(count) || count < 0) throw new Error("投影片數量不合法");

  const rows = Array.from({ length: count }, (_, index) => {
    const parsed = parseSlideOrder([JSON.parse(requireText(formData, `slide_payload_${index}`))])[0];
    const nextEntry = isVisibleSlide(parsed)
      ? { ...parsed, visible: formData.get(`slide_visible_${index}`) === "on" }
      : parsed;
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
