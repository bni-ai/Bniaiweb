import { beforeEach, describe, expect, it, vi } from "vitest";

// Mock Next.js helpers
vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  redirect: vi.fn((url: string) => {
    throw new Error(`Redirect to ${url}`); // Next.js redirect standard behavior is throwing an error
  }),
}));

// Mock supabase client and other common helpers
const mockSupabase = {
  from: vi.fn().mockReturnThis(),
  select: vi.fn().mockReturnThis(),
  eq: vi.fn().mockReturnThis(),
  single: vi.fn(),
  update: vi.fn().mockReturnThis(),
  delete: vi.fn().mockReturnThis(),
  storage: {
    from: vi.fn().mockReturnValue({
      list: vi.fn().mockResolvedValue({ data: [], error: null }),
      remove: vi.fn().mockResolvedValue({ data: [], error: null }),
    }),
  },
  then: vi.fn((onFulfilled) => {
    if (onFulfilled) {
      onFulfilled({ data: null, error: null });
    }
  }),
};

vi.mock("./admin-common", () => ({
  createAdminClient: () => mockSupabase,
  requireText: (formData: FormData, name: string) => {
    return (formData.get(name) as string) || "";
  },
  asJson: (val: unknown) => val,
  getChapter: () => Promise.resolve({ id: "chapter-123" }),
}));

import {
  addBlankSlideAction,
  deletePresentationAction,
  deleteSlideAction,
  duplicateSlideAction,
  publishPresentationAction,
  uploadLayerImageAction,
} from "./presentations";

describe("presentations server actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSupabase.from.mockReturnValue(mockSupabase);
    mockSupabase.select.mockReturnValue(mockSupabase);
    mockSupabase.update.mockReturnValue(mockSupabase);
    mockSupabase.delete.mockReturnValue(mockSupabase);
    mockSupabase.eq.mockReturnValue(mockSupabase);
    mockSupabase.single.mockReset();
  });

  describe("duplicateSlideAction", () => {
    it("duplicates a member slide and appends it to slide_order", async () => {
      const formData = new FormData();
      formData.set("id", "presentation-123");
      formData.set("slide_index", "1"); // duplicating slide at index 1

      const existingSlideOrder = [
        { type: "cover" },
        { type: "member", id: "member-1", visible: true, editor: { title: "Member 1" } },
        { type: "closing" },
      ];

      mockSupabase.single.mockResolvedValueOnce({
        data: {
          id: "presentation-123",
          week_date: "2026-06-03",
          slide_order: existingSlideOrder,
        },
        error: null,
      });

      await expect(duplicateSlideAction(formData)).rejects.toThrow("Redirect to /admin/presentations/presentation-123");

      expect(mockSupabase.update).toHaveBeenCalled();
      const updateArg = mockSupabase.update.mock.calls[0][0] as { slide_order: unknown[] };
      expect(updateArg.slide_order).toHaveLength(4);
      expect(updateArg.slide_order[3]).toEqual({
        type: "member",
        id: "member-1",
        visible: true,
        editor: { title: "Member 1" },
      });
    });

    it("duplicates a cover slide (fixed slide), transforming it to a custom slide type", async () => {
      const formData = new FormData();
      formData.set("id", "presentation-123");
      formData.set("slide_index", "0"); // duplicating cover slide at index 0

      const existingSlideOrder = [
        { type: "cover", editor: { title: "Original Cover" } },
        { type: "closing" },
      ];

      mockSupabase.single.mockResolvedValueOnce({
        data: {
          id: "presentation-123",
          week_date: "2026-06-03",
          slide_order: existingSlideOrder,
        },
        error: null,
      });

      await expect(duplicateSlideAction(formData)).rejects.toThrow("Redirect to /admin/presentations/presentation-123");

      expect(mockSupabase.update).toHaveBeenCalled();
      const updateArg = mockSupabase.update.mock.calls[0][0] as {
        slide_order: { type: string; visible: boolean; editor: Record<string, unknown>; id?: string }[];
      };
      expect(updateArg.slide_order).toHaveLength(3);
      expect(updateArg.slide_order[2].type).toBe("custom");
      expect(updateArg.slide_order[2].visible).toBe(true);
      expect(updateArg.slide_order[2].editor).toEqual({ title: "Original Cover" });
      expect(updateArg.slide_order[2].id).toBeDefined();
    });
  });

  describe("addBlankSlideAction", () => {
    it("appends a new custom slide with textLayers to slide_order", async () => {
      const formData = new FormData();
      formData.set("id", "presentation-123");

      const existingSlideOrder = [{ type: "cover" }];

      mockSupabase.single.mockResolvedValueOnce({
        data: {
          id: "presentation-123",
          week_date: "2026-06-03",
          slide_order: existingSlideOrder,
        },
        error: null,
      });

      await expect(addBlankSlideAction(formData)).rejects.toThrow("Redirect to /admin/presentations/presentation-123");

      expect(mockSupabase.update).toHaveBeenCalled();
      const updateArg = mockSupabase.update.mock.calls[0][0] as {
        slide_order: { type: string; visible: boolean; editor: { textLayers: { id: string }[] } }[];
      };
      expect(updateArg.slide_order).toHaveLength(2);
      expect(updateArg.slide_order[1].type).toBe("custom");
      expect(updateArg.slide_order[1].visible).toBe(true);
      expect(updateArg.slide_order[1].editor.textLayers).toBeDefined();
      expect(updateArg.slide_order[1].editor.textLayers[0].id).toBe("title");
    });
  });

  describe("deleteSlideAction", () => {
    it("successfully deletes a deletable slide", async () => {
      const formData = new FormData();
      formData.set("id", "presentation-123");
      formData.set("slide_index", "1"); // delete index 1

      const existingSlideOrder = [
        { type: "cover" },
        { type: "member", id: "member-1", visible: true },
        { type: "closing" },
      ];

      mockSupabase.single.mockResolvedValueOnce({
        data: {
          id: "presentation-123",
          week_date: "2026-06-03",
          slide_order: existingSlideOrder,
        },
        error: null,
      });

      await expect(deleteSlideAction(formData)).rejects.toThrow("Redirect to /admin/presentations/presentation-123");

      expect(mockSupabase.update).toHaveBeenCalled();
      const updateArg = mockSupabase.update.mock.calls[0][0] as { slide_order: unknown[] };
      expect(updateArg.slide_order).toHaveLength(2);
      expect(updateArg.slide_order).toEqual([{ type: "cover" }, { type: "closing" }]);
    });

    it("throws error when trying to delete a fixed slide", async () => {
      const formData = new FormData();
      formData.set("id", "presentation-123");
      formData.set("slide_index", "0"); // delete cover at index 0

      const existingSlideOrder = [
        { type: "cover" },
        { type: "member", id: "member-1", visible: true },
      ];

      mockSupabase.single.mockResolvedValueOnce({
        data: {
          id: "presentation-123",
          week_date: "2026-06-03",
          slide_order: existingSlideOrder,
        },
        error: null,
      });

      await expect(deleteSlideAction(formData)).rejects.toThrow(
        "固定頁面（封面、議程、幹部、結束）無法刪除。"
      );
    });

    it("throws error when trying to delete the only slide", async () => {
      const formData = new FormData();
      formData.set("id", "presentation-123");
      formData.set("slide_index", "0");

      const existingSlideOrder = [
        { type: "member", id: "member-1", visible: true },
      ];

      mockSupabase.single.mockResolvedValueOnce({
        data: {
          id: "presentation-123",
          week_date: "2026-06-03",
          slide_order: existingSlideOrder,
        },
        error: null,
      });

      await expect(deleteSlideAction(formData)).rejects.toThrow(
        "簡報至少需要保留一張投影片。"
      );
    });
  });

  describe("deletePresentationAction", () => {
    it("deletes presentation record and storage files", async () => {
      const formData = new FormData();
      formData.set("id", "presentation-123");

      await expect(deletePresentationAction(formData)).rejects.toThrow("Redirect to /admin/presentations");

      expect(mockSupabase.delete).toHaveBeenCalled();
    });
  });

  describe("publishPresentationAction", () => {
    it("successfully publishes a valid presentation", async () => {
      const formData = new FormData();
      formData.set("id", "presentation-123");
      formData.set("return_to", "/admin/presentation");

      mockSupabase.single.mockResolvedValueOnce({
        data: {
          id: "presentation-123",
          week_date: "2026-06-03",
          slide_order: [{ type: "cover", visible: true }],
        },
        error: null,
      });

      await expect(publishPresentationAction(formData)).rejects.toThrow("Redirect to /admin/presentation");
    });

    it("throws error when trying to publish with invalid slide_order format", async () => {
      const formData = new FormData();
      formData.set("id", "presentation-123");

      mockSupabase.single.mockResolvedValueOnce({
        data: {
          id: "presentation-123",
          week_date: "2026-06-03",
          slide_order: [{ type: "unknown" }], // invalid type
        },
        error: null,
      });

      await expect(publishPresentationAction(formData)).rejects.toThrow("未知 slide type");
    });

    it("throws error when trying to publish with empty slide_order", async () => {
      const formData = new FormData();
      formData.set("id", "presentation-123");

      mockSupabase.single.mockResolvedValueOnce({
        data: {
          id: "presentation-123",
          week_date: "2026-06-03",
          slide_order: [], // empty slide order
        },
        error: null,
      });

      await expect(publishPresentationAction(formData)).rejects.toThrow("簡報至少需要包含一張投影片。");
    });
  });

  describe("uploadLayerImageAction", () => {
    it("successfully uploads a layer image and returns image details", async () => {
      mockSupabase.single.mockResolvedValueOnce({
        data: { id: "presentation-123", chapter_id: "chapter-123" },
        error: null,
      });

      const mockStorageBucket = {
        upload: vi.fn().mockResolvedValue({ error: null }),
        getPublicUrl: vi.fn().mockReturnValue({ data: { publicUrl: "https://cdn.example.com/mock-image.png" } }),
      };
      mockSupabase.storage = {
        listBuckets: vi.fn().mockResolvedValue({ data: [{ id: "bniai-media", name: "bniai-media" }], error: null }),
        createBucket: vi.fn().mockResolvedValue({ error: null }),
        from: vi.fn().mockReturnValue(mockStorageBucket),
      } as unknown as typeof mockSupabase.storage;

      const file = new File([""], "photo.png", { type: "image/png" });
      const result = await uploadLayerImageAction("presentation-123", file);

      expect(result.id).toBeDefined();
      expect(result.imageUrl).toBe("https://cdn.example.com/mock-image.png");
      expect(mockStorageBucket.upload).toHaveBeenCalled();
    });

    it("rejects invalid file type", async () => {
      mockSupabase.single.mockResolvedValueOnce({
        data: { id: "presentation-123", chapter_id: "chapter-123" },
        error: null,
      });

      const file = new File([""], "test.gif", { type: "image/gif" });
      await expect(uploadLayerImageAction("presentation-123", file)).rejects.toThrow("只接受 JPG、PNG 或 WebP");
    });

    it("rejects oversized file", async () => {
      mockSupabase.single.mockResolvedValueOnce({
        data: { id: "presentation-123", chapter_id: "chapter-123" },
        error: null,
      });

      const oversizedFile = new File([new ArrayBuffer(6 * 1024 * 1024)], "large.png", { type: "image/png" });
      await expect(uploadLayerImageAction("presentation-123", oversizedFile)).rejects.toThrow("檔案大小不可超過 5MB");
    });
  });
});
