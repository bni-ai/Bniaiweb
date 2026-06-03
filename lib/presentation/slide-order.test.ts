import { describe, expect, it } from "vitest";
import { parseSlideOrder } from "./slide-order";

describe("parseSlideOrder", () => {
  it("successfully parses cover with editor and optional dataOverride", () => {
    const raw = [
      {
        type: "cover",
        editor: {
          title: "BNI 封面",
          body: "2026 會議",
          dataOverride: {
            theme: "dark",
          },
        },
      },
    ];
    const parsed = parseSlideOrder(raw);
    expect(parsed[0]).toEqual({
      type: "cover",
      editor: {
        title: "BNI 封面",
        body: "2026 會議",
        dataOverride: {
          theme: "dark",
        },
      },
    });
  });

  it("successfully parses custom slide type with id and visible", () => {
    const raw = [
      {
        type: "custom",
        id: "custom-slide-1",
        visible: true,
        editor: {
          title: "自訂頁面",
          body: "這是自訂的投影片內容",
        },
      },
    ];
    const parsed = parseSlideOrder(raw);
    expect(parsed[0]).toEqual({
      type: "custom",
      id: "custom-slide-1",
      visible: true,
      editor: {
        title: "自訂頁面",
        body: "這是自訂的投影片內容",
      },
    });
  });

  it("throws error for custom slide when id or visible is missing", () => {
    const rawMissingId = [
      {
        type: "custom",
        visible: true,
      },
    ];
    expect(() => parseSlideOrder(rawMissingId)).toThrow("缺少 id 或 visible");

    const rawMissingVisible = [
      {
        type: "custom",
        id: "custom-1",
      },
    ];
    expect(() => parseSlideOrder(rawMissingVisible)).toThrow("缺少 id 或 visible");
  });

  it("throws error for invalid dataOverride format", () => {
    const rawInvalidOverride = [
      {
        type: "cover",
        editor: {
          dataOverride: "not-an-object",
        },
      },
    ];
    expect(() => parseSlideOrder(rawInvalidOverride)).toThrow("slide_order editor.dataOverride 格式不正確");

    const rawInvalidOverrideValue = [
      {
        type: "cover",
        editor: {
          dataOverride: {
            theme: 123,
          },
        },
      },
    ];
    expect(() => parseSlideOrder(rawInvalidOverrideValue)).toThrow("slide_order editor.dataOverride.theme 格式不正確");
  });
});
