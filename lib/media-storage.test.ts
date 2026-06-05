import { describe, expect, it } from "vitest";
import { buildLayerImagePath, assertImageFile } from "./media-storage";

describe("media-storage image layers helper", () => {
  it("builds correct path for slide image layers", () => {
    const file = new File([""], "product photo.png", { type: "image/png" });
    const path = buildLayerImagePath("pres-123", "layer-456", file);
    expect(path).toBe("presentations/pres-123/layers/layer-456-product-photo.png");
  });

  it("supports jpg, png, and webp types", () => {
    const jpegFile = new File([""], "test.jpg", { type: "image/jpeg" });
    const pngFile = new File([""], "test.png", { type: "image/png" });
    const webpFile = new File([""], "test.webp", { type: "image/webp" });
    const gifFile = new File([""], "test.gif", { type: "image/gif" });

    // Should not throw
    expect(() => assertImageFile(jpegFile, "image")).not.toThrow();
    expect(() => assertImageFile(pngFile, "image")).not.toThrow();
    expect(() => assertImageFile(webpFile, "image")).not.toThrow();

    // Should throw for unsupported type
    expect(() => assertImageFile(gifFile, "image")).toThrow();
  });
});
