import { describe, expect, it } from "vitest";

import { buildWorkbenchSlideOrder, describeSlideEntry, describeSlideThumbnail, isVisibleSlide } from "./workbench";

describe("presentation workbench helpers", () => {
  it("reorders slides and applies visibility from form rows", () => {
    const formData = new FormData();
    formData.set("slide_count", "3");
    formData.set("slide_payload_0", JSON.stringify({ type: "cover" }));
    formData.set("slide_order_0", "2");
    formData.set("slide_title_0", "封面");
    formData.set("slide_body_0", "會議資訊");
    formData.set("slide_font_size_0", "md");
    formData.set("slide_background_existing_0", "");
    formData.set("slide_payload_1", JSON.stringify({ type: "keynote", id: "k1", visible: true }));
    formData.set("slide_order_1", "3");
    formData.set("slide_title_1", "短講");
    formData.set("slide_body_1", "短講內文");
    formData.set("slide_font_size_1", "lg");
    formData.set("slide_background_existing_1", "");
    formData.set("slide_payload_2", JSON.stringify({ type: "member", id: "m1", visible: true }));
    formData.set("slide_order_2", "1");
    formData.set("slide_visible_2", "on");
    formData.set("slide_title_2", "會員");
    formData.set("slide_body_2", "會員內容");
    formData.set("slide_font_size_2", "xl");
    formData.set("slide_background_existing_2", "https://example.com/cover.png");

    expect(buildWorkbenchSlideOrder(formData)).toEqual([
      { type: "member", id: "m1", visible: true, editor: { title: "會員", body: "會員內容", fontSize: "xl", backgroundImageUrl: "https://example.com/cover.png" } },
      { type: "cover", editor: { title: "封面", body: "會議資訊", fontSize: "md", backgroundImageUrl: null } },
      { type: "keynote", id: "k1", visible: false, editor: { title: "短講", body: "短講內文", fontSize: "lg", backgroundImageUrl: null } },
    ]);
  });

  it("preserves text layers from canvas editor json payloads", () => {
    const formData = new FormData();
    formData.set("slide_count", "1");
    formData.set("slide_payload_0", JSON.stringify({ type: "cover" }));
    formData.set("slide_order_0", "1");
    formData.set("slide_visible_0", "true");
    formData.set("slide_editor_json_0", JSON.stringify({
      title: "封面",
      body: "封面內文",
      fontSize: "xl",
      backgroundImageUrl: "https://example.com/hero.png",
      textLayers: [
        {
          id: "layer-1",
          text: "封面標題",
          x: 120,
          y: 160,
          width: 920,
          height: 160,
          fontSize: 88,
          color: "#ffffff",
          fontWeight: "800",
          align: "left",
        },
      ],
    }));

    expect(buildWorkbenchSlideOrder(formData)).toEqual([
      {
        type: "cover",
        editor: {
          title: "封面",
          body: "封面內文",
          fontSize: "xl",
          backgroundImageUrl: "https://example.com/hero.png",
          textLayers: [
            {
              id: "layer-1",
              text: "封面標題",
              x: 120,
              y: 160,
              width: 920,
              height: 160,
              fontSize: 88,
              color: "#ffffff",
              fontWeight: "800",
              align: "left",
            },
          ],
        },
      },
    ]);
  });

  it("preserves image layers from canvas editor json payloads", () => {
    const formData = new FormData();
    formData.set("slide_count", "1");
    formData.set("slide_payload_0", JSON.stringify({ type: "cover" }));
    formData.set("slide_order_0", "1");
    formData.set("slide_visible_0", "true");
    formData.set("slide_editor_json_0", JSON.stringify({
      title: "封面",
      body: "封面內文",
      fontSize: "xl",
      backgroundImageUrl: "https://example.com/hero.png",
      textLayers: [],
      imageLayers: [
        {
          id: "img-layer-1",
          imageUrl: "https://example.com/image.png",
          x: 720,
          y: 360,
          width: 480,
          height: 360,
          borderRadius: 8,
          shadow: "md",
          objectFit: "cover",
        },
      ],
    }));

    expect(buildWorkbenchSlideOrder(formData)).toEqual([
      {
        type: "cover",
        editor: {
          title: "封面",
          body: "封面內文",
          fontSize: "xl",
          backgroundImageUrl: "https://example.com/hero.png",
          textLayers: [],
          imageLayers: [
            {
              id: "img-layer-1",
              imageUrl: "https://example.com/image.png",
              x: 720,
              y: 360,
              width: 480,
              height: 360,
              borderRadius: 8,
              shadow: "md",
              objectFit: "cover",
            },
          ],
        },
      },
    ]);
  });

  it("labels slide entries for operator surfaces", () => {
    expect(describeSlideEntry({ type: "cover" })).toEqual({ label: "封面", typeLabel: "固定", canToggle: false });
    expect(describeSlideEntry({ type: "agenda" })).toEqual({ label: "例會議程", typeLabel: "固定", canToggle: false });
    expect(describeSlideEntry({ type: "member", id: "b1", visible: true })).toEqual({ label: "會員投影片", typeLabel: "會員", canToggle: true });
    expect(describeSlideEntry({ type: "closing" })).toEqual({ label: "結束頁", typeLabel: "固定", canToggle: false });
  });

  it("detects toggleable slide entries", () => {
    expect(isVisibleSlide({ type: "team" })).toBe(false);
    expect(isVisibleSlide({ type: "guest", id: "g1", visible: false })).toBe(true);
  });

  it("labels slide thumbnails for admin presentation surface", () => {
    expect(describeSlideThumbnail({ type: "cover" })).toEqual({ label: "首頁", typeLabel: "固定" });
    expect(describeSlideThumbnail({ type: "keynote", id: "k1", visible: true })).toEqual({ label: "演講", typeLabel: "短講" });
    expect(describeSlideThumbnail({ type: "member", id: "b1", visible: true })).toEqual({ label: "會員", typeLabel: "會員" });
  });
});
