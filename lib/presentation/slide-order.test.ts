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

  it("successfully parses imageLayers in editor", () => {
    const raw = [
      {
        type: "cover",
        editor: {
          imageLayers: [
            {
              id: "img-1",
              imageUrl: "https://example.com/img.png",
              x: 100,
              y: 200,
              width: 300,
              height: 400,
              borderRadius: 8,
              shadow: "md",
              objectFit: "cover"
            }
          ]
        }
      }
    ];
    const parsed = parseSlideOrder(raw);
    expect(parsed[0].editor?.imageLayers).toEqual([
      {
        id: "img-1",
        imageUrl: "https://example.com/img.png",
        x: 100,
        y: 200,
        width: 300,
        height: 400,
        borderRadius: 8,
        shadow: "md",
        objectFit: "cover"
      }
    ]);
  });

  it("successfully parses per-slide timer config in editor", () => {
    const raw = [
      {
        type: "custom",
        id: "custom-slide-2",
        visible: true,
        editor: {
          timerEnabled: true,
          timerSeconds: 30,
        },
      },
    ];
    const parsed = parseSlideOrder(raw);
    expect(parsed[0]).toEqual({
      type: "custom",
      id: "custom-slide-2",
      visible: true,
      editor: {
        timerEnabled: true,
        timerSeconds: 30,
      },
    });
  });

  it("throws error for invalid imageLayers format", () => {
    const rawInvalidType = [
      {
        type: "cover",
        editor: {
          imageLayers: "not-an-array"
        }
      }
    ];
    expect(() => parseSlideOrder(rawInvalidType)).toThrow("slide_order editor.imageLayers 格式不正確");

    const rawInvalidField = [
      {
        type: "cover",
        editor: {
          imageLayers: [
            {
              id: "img-1",
              imageUrl: 123,
              x: 100,
              y: 200,
              width: 300,
              height: 400,
              borderRadius: 8,
              shadow: "md",
              objectFit: "cover"
            }
          ]
        }
      }
    ];
    expect(() => parseSlideOrder(rawInvalidField)).toThrow("slide_order editor.imageLayers[0] 欄位格式不正確");
  });

  it("throws error for invalid timer config format", () => {
    const rawInvalidEnabled = [
      {
        type: "cover",
        editor: {
          timerEnabled: "yes",
        },
      },
    ];
    expect(() => parseSlideOrder(rawInvalidEnabled)).toThrow("slide_order editor.timerEnabled 格式不正確");

    const rawInvalidSeconds = [
      {
        type: "cover",
        editor: {
          timerEnabled: true,
          timerSeconds: "30",
        },
      },
    ];
    expect(() => parseSlideOrder(rawInvalidSeconds)).toThrow("slide_order editor.timerSeconds 格式不正確");
  });
});
