"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import type { PresentationRuntimeSlide, SlideEditorPatch, SlideEntry, SlideTextAlign, SlideTextLayer, SlideImageLayer } from "../../lib/presentation/types";
import { addBlankSlideAction, deleteSlideAction, duplicateSlideAction, uploadLayerImageAction } from "../../lib/actions/presentations";

const CANVAS_WIDTH = 1920;
const CANVAS_HEIGHT = 1080;
const FIXED_SLIDE_TYPES = new Set<SlideEntry["type"]>(["cover", "agenda", "team", "closing"]);

type EditableSlide = {
  entry: SlideEntry;
  label: string;
  typeLabel: string;
  canToggle: boolean;
  visible: boolean;
  order: number;
  editor: PresentationRuntimeSlide["editor"];
  backgroundPreviewUrl: string | null;
};

type DragState = {
  slideIndex: number;
  layerId: string;
  layerType: "text" | "image";
  mode: "move" | "resize";
  startX: number;
  startY: number;
  initialX: number;
  initialY: number;
  initialWidth: number;
  initialHeight: number;
};

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function toEditorJson(slide: EditableSlide): SlideEditorPatch {
  const title = slide.editor.textLayers[0]?.text ?? slide.editor.title;
  const body = slide.editor.textLayers.slice(1).map((layer) => layer.text).filter(Boolean).join("\n\n") || slide.editor.body;
  return {
    title,
    body,
    fontSize: slide.editor.fontSize,
    backgroundImageUrl: slide.editor.backgroundImageUrl,
    textLayers: slide.editor.textLayers,
    imageLayers: slide.editor.imageLayers,
    timerEnabled: slide.editor.timerEnabled,
    timerSeconds: slide.editor.timerSeconds,
  };
}

function nextLayerId() {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `layer-${Date.now()}`;
}

function fontScaleToken(fontSize: number): PresentationRuntimeSlide["editor"]["fontSize"] {
  if (fontSize <= 32) return "sm";
  if (fontSize <= 52) return "md";
  if (fontSize <= 80) return "lg";
  return "xl";
}

function nextFontToken(layers: SlideTextLayer[], fallback: PresentationRuntimeSlide["editor"]["fontSize"]) {
  const maxFontSize = layers.reduce((max, layer) => Math.max(max, layer.fontSize), 0);
  return maxFontSize > 0 ? fontScaleToken(maxFontSize) : fallback;
}

export function PresentationCanvasEditor({ initialSlides, presentationId }: { initialSlides: EditableSlide[]; presentationId: string }) {
  const [slides, setSlides] = useState<EditableSlide[]>(initialSlides);
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);
  const [selectedLayerId, setSelectedLayerId] = useState<string | null>(initialSlides[0]?.editor.textLayers[0]?.id || null);
  const [selectedLayerType, setSelectedLayerType] = useState<"text" | "image" | null>(initialSlides[0]?.editor.textLayers[0]?.id ? "text" : null);
  const [scale, setScale] = useState(1);
  const [dragState, setDragState] = useState<DragState | null>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const previewUrlsRef = useRef<Map<number, string>>(new Map());
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const activeSlide = slides[activeSlideIndex];
  const selectedLayer = activeSlide?.editor.textLayers.find((layer) => layer.id === selectedLayerId) || null;
  const selectedImageLayer = (activeSlide?.editor.imageLayers || []).find((layer) => layer.id === selectedLayerId) || null;

  useEffect(() => {
    if (!viewportRef.current) return;
    const updateScale = () => {
      const rect = viewportRef.current?.getBoundingClientRect();
      if (!rect) return;
      setScale(Math.max(0.1, Math.min(rect.width / CANVAS_WIDTH, rect.height / CANVAS_HEIGHT)));
    };

    updateScale();
    const observer = new ResizeObserver(updateScale);
    observer.observe(viewportRef.current);
    window.addEventListener("resize", updateScale);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", updateScale);
    };
  }, []);

  useEffect(() => {
    const previewUrls = previewUrlsRef.current;
    return () => {
      for (const url of previewUrls.values()) {
        URL.revokeObjectURL(url);
      }
    };
  }, []);

  useEffect(() => {
    if (!dragState) return;

    const onPointerMove = (event: PointerEvent) => {
      setSlides((current) => current.map((slide, slideIndex) => {
        if (slideIndex !== dragState.slideIndex) return slide;
        const dx = (event.clientX - dragState.startX) / scale;
        const dy = (event.clientY - dragState.startY) / scale;

        if (dragState.layerType === "text") {
          const nextLayers = slide.editor.textLayers.map((layer) => {
            if (layer.id !== dragState.layerId) return layer;
            if (dragState.mode === "move") {
              return {
                ...layer,
                x: clamp(dragState.initialX + dx, 0, CANVAS_WIDTH - layer.width),
                y: clamp(dragState.initialY + dy, 0, CANVAS_HEIGHT - layer.height),
              };
            }
            return {
              ...layer,
              width: clamp(dragState.initialWidth + dx, 140, CANVAS_WIDTH - dragState.initialX),
              height: clamp(dragState.initialHeight + dy, 80, CANVAS_HEIGHT - dragState.initialY),
            };
          });
          return {
            ...slide,
            editor: {
              ...slide.editor,
              textLayers: nextLayers,
            },
          };
        } else {
          const nextLayers = (slide.editor.imageLayers || []).map((layer) => {
            if (layer.id !== dragState.layerId) return layer;
            if (dragState.mode === "move") {
              return {
                ...layer,
                x: clamp(dragState.initialX + dx, 0, CANVAS_WIDTH - layer.width),
                y: clamp(dragState.initialY + dy, 0, CANVAS_HEIGHT - layer.height),
              };
            }
            return {
              ...layer,
              width: clamp(dragState.initialWidth + dx, 140, CANVAS_WIDTH - dragState.initialX),
              height: clamp(dragState.initialHeight + dy, 80, CANVAS_HEIGHT - dragState.initialY),
            };
          });
          return {
            ...slide,
            editor: {
              ...slide.editor,
              imageLayers: nextLayers,
            },
          };
        }
      }));
    };

    const onPointerUp = () => setDragState(null);

    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
    };
  }, [dragState, scale]);

  useEffect(() => {
    const currentSlide = slides[activeSlideIndex];
    if (!currentSlide) return;
    const hasTextLayer = currentSlide.editor.textLayers.some((layer) => layer.id === selectedLayerId);
    const hasImageLayer = (currentSlide.editor.imageLayers || []).some((layer) => layer.id === selectedLayerId);
    if (!hasTextLayer && !hasImageLayer) {
      setSelectedLayerId(currentSlide.editor.textLayers[0]?.id || null);
    }
  }, [slides, activeSlideIndex, selectedLayerId]);

  const slideLayers = activeSlide?.editor.textLayers || [];
  const orderedSlides = useMemo(
    () => slides.map((slide, index) => ({ ...slide, orderValue: Number.isFinite(slide.order) ? slide.order : index + 1 })),
    [slides],
  );
  const reusableAssets = useMemo(() => {
    const seen = new Set<string>();
    return slides.flatMap((slide, index) => {
      const url = slide.editor.backgroundImageUrl;
      if (!url || seen.has(url)) return [];
      seen.add(url);
      return [{
        url,
        sourceIndex: index,
        label: slide.label,
      }];
    });
  }, [slides]);

  function updateSlide(index: number, updater: (slide: EditableSlide) => EditableSlide) {
    setSlides((current) => current.map((slide, slideIndex) => (slideIndex === index ? updater(slide) : slide)));
  }

  function updateSelectedLayer(updater: (layer: SlideTextLayer) => SlideTextLayer) {
    if (!selectedLayerId) return;
    updateSlide(activeSlideIndex, (slide) => ({
      ...slide,
      editor: (() => {
        const nextLayers = slide.editor.textLayers.map((layer) => (layer.id === selectedLayerId ? updater(layer) : layer));
        return {
          ...slide.editor,
          fontSize: nextFontToken(nextLayers, slide.editor.fontSize),
          textLayers: nextLayers,
        };
      })(),
    }));
  }

  function addTextLayer() {
    const layer: SlideTextLayer = {
      id: nextLayerId(),
      text: "輸入文字",
      x: 180,
      y: 180 + slideLayers.length * 60,
      width: 720,
      height: 140,
      fontSize: 56,
      color: activeSlide?.editor.backgroundImageUrl ? "#ffffff" : "#111827",
      fontWeight: "700",
      align: "left",
    };
    updateSlide(activeSlideIndex, (slide) => ({
      ...slide,
      editor: {
        ...slide.editor,
        fontSize: nextFontToken([...slide.editor.textLayers, layer], slide.editor.fontSize),
        textLayers: [...slide.editor.textLayers, layer],
      },
    }));
    setSelectedLayerId(layer.id);
    setSelectedLayerType("text");
  }

  function handleImageInsertClick() {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/png,image/jpeg,image/webp";
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      try {
        const result = await uploadLayerImageAction(presentationId, file);
        const newLayer: SlideImageLayer = {
          id: result.id,
          imageUrl: result.imageUrl,
          x: 720,
          y: 360,
          width: 480,
          height: 360,
          borderRadius: 8,
          shadow: "md",
          objectFit: "cover",
        };

        updateSlide(activeSlideIndex, (slide) => ({
          ...slide,
          editor: {
            ...slide.editor,
            imageLayers: [...(slide.editor.imageLayers || []), newLayer],
          },
        }));
        setSelectedLayerId(newLayer.id);
        setSelectedLayerType("image");
      } catch (err: unknown) {
        alert(err instanceof Error ? err.message : "上傳失敗，請稍後再試");
      }
    };
    input.click();
  }

  function deleteSelectedElement() {
    if (!selectedLayerId) return;
    updateSlide(activeSlideIndex, (slide) => {
      const textLayers = slide.editor.textLayers.filter((layer) => layer.id !== selectedLayerId);
      const imageLayers = (slide.editor.imageLayers || []).filter((layer) => layer.id !== selectedLayerId);
      return {
        ...slide,
        editor: {
          ...slide.editor,
          fontSize: nextFontToken(textLayers, slide.editor.fontSize),
          textLayers,
          imageLayers,
        },
      };
    });
    setSelectedLayerId(null);
    setSelectedLayerType(null);
  }

  function handleInsertInlineImage() {
    if (!selectedLayer) return;
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/png,image/jpeg,image/webp";
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      try {
        const result = await uploadLayerImageAction(presentationId, file);
        const mdTag = `\n![圖片](${result.imageUrl})\n`;

        const textarea = textareaRef.current;
        let nextText = selectedLayer.text;
        if (textarea) {
          const start = textarea.selectionStart;
          const end = textarea.selectionEnd;
          nextText = selectedLayer.text.substring(0, start) + mdTag + selectedLayer.text.substring(end);
        } else {
          nextText = selectedLayer.text + mdTag;
        }

        updateSelectedLayer((layer) => ({
          ...layer,
          text: nextText,
        }));
      } catch (err: unknown) {
        alert(err instanceof Error ? err.message : "上傳失敗，請稍後再試");
      }
    };
    input.click();
  }

  function updateBackgroundPreview(index: number, file: File | null) {
    if (previewUrlsRef.current.has(index)) {
      URL.revokeObjectURL(previewUrlsRef.current.get(index)!);
      previewUrlsRef.current.delete(index);
    }

    const previewUrl = file ? URL.createObjectURL(file) : null;
    if (previewUrl) {
      previewUrlsRef.current.set(index, previewUrl);
    }

    updateSlide(index, (slide) => ({
      ...slide,
      backgroundPreviewUrl: previewUrl,
    }));
  }

  function applyExistingBackground(url: string) {
    updateSlide(activeSlideIndex, (slide) => ({
      ...slide,
      backgroundPreviewUrl: null,
      editor: {
        ...slide.editor,
        backgroundImageUrl: url,
      },
    }));
  }

  function clearActiveBackground() {
    updateSlide(activeSlideIndex, (slide) => ({
      ...slide,
      backgroundPreviewUrl: null,
      editor: {
        ...slide.editor,
        backgroundImageUrl: null,
      },
    }));
  }

  function updateLayerNumber(field: keyof Pick<SlideTextLayer, "x" | "y" | "width" | "height" | "fontSize">, value: number) {
    updateSelectedLayer((layer) => {
      const next = { ...layer, [field]: value };
      if (field === "x") next.x = clamp(value, 0, CANVAS_WIDTH - layer.width);
      if (field === "y") next.y = clamp(value, 0, CANVAS_HEIGHT - layer.height);
      if (field === "width") next.width = clamp(value, 140, CANVAS_WIDTH - layer.x);
      if (field === "height") next.height = clamp(value, 80, CANVAS_HEIGHT - layer.y);
      if (field === "fontSize") next.fontSize = clamp(value, 18, 180);
      return next;
    });
  }

  function updateSelectedImageLayer(updater: (layer: SlideImageLayer) => SlideImageLayer) {
    if (!selectedLayerId) return;
    updateSlide(activeSlideIndex, (slide) => ({
      ...slide,
      editor: {
        ...slide.editor,
        imageLayers: (slide.editor.imageLayers || []).map((layer) => (layer.id === selectedLayerId ? updater(layer) : layer)),
      },
    }));
  }

  function updateImageLayerNumber(field: keyof Pick<SlideImageLayer, "x" | "y" | "width" | "height">, value: number) {
    updateSelectedImageLayer((layer) => {
      const next = { ...layer, [field]: value };
      if (field === "x") next.x = clamp(value, 0, CANVAS_WIDTH - layer.width);
      if (field === "y") next.y = clamp(value, 0, CANVAS_HEIGHT - layer.height);
      if (field === "width") next.width = clamp(value, 140, CANVAS_WIDTH - layer.x);
      if (field === "height") next.height = clamp(value, 80, CANVAS_HEIGHT - layer.y);
      return next;
    });
  }

  function layerButtonClass(active: boolean) {
    return active
      ? "rounded-full bg-[#b91c1c] px-3 py-1 text-xs font-semibold text-white"
      : "rounded-full border border-border bg-white px-3 py-1 text-xs font-medium text-text-2";
  }

  return (
    <div className="od-editor-workspace">
      <aside className="od-editor-sidebar space-y-3 rounded-2xl border border-border bg-white p-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-text-3">投影片</p>
          <h3 className="mt-2 text-lg font-semibold text-text-1">多頁編輯</h3>
        </div>
        <div className="space-y-2">
          {orderedSlides.map((slide, index) => (
            <div
              key={`${slide.entry.type}-${"id" in slide.entry ? slide.entry.id : index}`}
              className={`group relative w-full rounded-2xl border p-3 text-left cursor-pointer transition-all ${
                index === activeSlideIndex
                  ? "border-[#b91c1c] bg-[#fff5f5] ring-1 ring-[#b91c1c]"
                  : "border-border bg-white hover:border-gray-400"
              }`}
              onClick={() => setActiveSlideIndex(index)}
            >
              <div className="flex items-center justify-between gap-3">
                <span className="text-sm font-semibold text-text-1">{slide.label}</span>
                <span className="text-xs text-text-3">{slide.typeLabel}</span>
              </div>
              <div className="mt-2 flex items-center justify-between text-xs text-text-3">
                <span>{slide.orderValue} / {slides.length}</span>
                <span>{slide.visible ? "顯示" : "隱藏"}</span>
              </div>
              
              <div
                className="mt-2 flex gap-1 justify-end opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  className="rounded bg-gray-100 hover:bg-gray-200 px-2 py-0.5 text-[11px] font-medium text-gray-700"
                  onClick={async () => {
                    const formData = new FormData();
                    formData.set("id", presentationId);
                    formData.set("slide_index", String(index));
                    await duplicateSlideAction(formData);
                  }}
                  type="button"
                >
                  複製
                </button>
                <button
                  className="rounded bg-red-50 disabled:bg-gray-50 disabled:text-gray-300 hover:bg-red-100 px-2 py-0.5 text-[11px] font-medium text-red-700 disabled:cursor-not-allowed"
                  disabled={FIXED_SLIDE_TYPES.has(slide.entry.type)}
                  title={FIXED_SLIDE_TYPES.has(slide.entry.type) ? "固定頁面無法刪除" : "刪除投影片"}
                  onClick={async () => {
                    if (slides.length <= 1) {
                      alert("簡報至少需要保留一張投影片。");
                      return;
                    }
                    if (confirm("確定要刪除這張投影片嗎？")) {
                      const formData = new FormData();
                      formData.set("id", presentationId);
                      formData.set("slide_index", String(index));
                      await deleteSlideAction(formData);
                    }
                  }}
                  type="button"
                >
                  刪除
                </button>
              </div>
            </div>
          ))}
        </div>
        <button
          className="w-full mt-3 rounded-2xl border border-dashed border-gray-300 hover:border-gray-400 bg-gray-50 hover:bg-gray-100 py-2.5 text-center text-xs font-semibold text-gray-600 transition-colors"
          onClick={async () => {
            const formData = new FormData();
            formData.set("id", presentationId);
            await addBlankSlideAction(formData);
          }}
          type="button"
        >
          + 新增空白頁
        </button>
      </aside>

      <section className="od-editor-stage min-w-0 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-white px-4 py-3">
          <div>
            <h3 className="text-lg font-semibold text-text-1">{activeSlide?.label}</h3>
            <p className="text-sm text-text-2">底圖上方可直接放文字框，拖拉到指定位置。</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button className="rounded-full border border-border bg-white px-4 py-2 text-sm font-medium" onClick={addTextLayer} type="button">
              新增文字框
            </button>
            <button className="rounded-full border border-border bg-white px-4 py-2 text-sm font-medium" onClick={handleImageInsertClick} type="button">
              插入圖片
            </button>
            <button
              className="rounded-full border border-border bg-white px-4 py-2 text-sm font-medium disabled:opacity-40"
              disabled={!selectedLayerId}
              onClick={deleteSelectedElement}
              type="button"
            >
              刪除選取元素
            </button>
          </div>
        </div>

        <div ref={viewportRef} className="w-full flex aspect-video items-center justify-center overflow-hidden rounded-[28px] border border-border bg-[#0f172a]">
          <div
            data-testid="presentation-editor-canvas"
            className="relative overflow-hidden rounded-[28px] bg-[#fffdf9] shadow-[0_30px_120px_rgba(15,23,42,0.28)]"
            style={{
              width: `${CANVAS_WIDTH * scale}px`,
              height: `${CANVAS_HEIGHT * scale}px`,
            }}
            onClick={() => setSelectedLayerId(null)}
          >
            <div
              className="absolute left-0 top-0 overflow-hidden rounded-[28px] bg-[#fffdf9]"
              style={{
                width: `${CANVAS_WIDTH}px`,
                height: `${CANVAS_HEIGHT}px`,
                transform: `scale(${scale})`,
                transformOrigin: "top left",
                backgroundImage: activeSlide?.backgroundPreviewUrl
                  ? `linear-gradient(rgba(15,23,42,0.08), rgba(15,23,42,0.08)), url(${activeSlide.backgroundPreviewUrl})`
                  : activeSlide?.editor.backgroundImageUrl
                    ? `linear-gradient(rgba(15,23,42,0.08), rgba(15,23,42,0.08)), url(${activeSlide.editor.backgroundImageUrl})`
                    : undefined,
                backgroundPosition: "center",
                backgroundSize: "cover",
              }}
            >
              {!activeSlide?.backgroundPreviewUrl && !activeSlide?.editor.backgroundImageUrl ? (
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(220,38,38,0.12),_transparent_42%),linear-gradient(180deg,#fffdf9_0%,#f8f1eb_100%)]" />
              ) : null}
              {(activeSlide?.editor.imageLayers || []).map((layer) => {
                const selected = layer.id === selectedLayerId && selectedLayerType === "image";
                return (
                  <div
                    key={layer.id}
                    className={`absolute ${selected ? "ring-2 ring-[#2563eb]" : "ring-1 ring-transparent hover:ring-[#93c5fd]"}`}
                    data-testid={`presentation-editor-image-${layer.id}`}
                    style={{
                      left: `${layer.x}px`,
                      top: `${layer.y}px`,
                      width: `${layer.width}px`,
                      height: `${layer.height}px`,
                      cursor: dragState?.layerId === layer.id && dragState.mode === "move" ? "grabbing" : "grab",
                    }}
                    onClick={(event) => {
                      event.stopPropagation();
                      setSelectedLayerId(layer.id);
                      setSelectedLayerType("image");
                    }}
                    onPointerDown={(event) => {
                      event.stopPropagation();
                      setSelectedLayerId(layer.id);
                      setSelectedLayerType("image");
                      setDragState({
                        slideIndex: activeSlideIndex,
                        layerId: layer.id,
                        layerType: "image",
                        mode: "move",
                        startX: event.clientX,
                        startY: event.clientY,
                        initialX: layer.x,
                        initialY: layer.y,
                        initialWidth: layer.width,
                        initialHeight: layer.height,
                      });
                    }}
                  >
                    <img
                      alt="圖片元素"
                      src={layer.imageUrl}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: layer.objectFit,
                        borderRadius: layer.borderRadius === 999 ? "999px" : `${layer.borderRadius}px`,
                        boxShadow:
                          layer.shadow === "sm"
                            ? "0 1px 2px 0 rgba(0, 0, 0, 0.05)"
                            : layer.shadow === "md"
                              ? "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)"
                              : "none",
                      }}
                      draggable={false}
                    />
                    <button
                      className="absolute -bottom-4 -right-4 h-7 w-7 rounded-full border border-white bg-[#2563eb] text-white shadow shadow-blue-500/50 flex items-center justify-center text-xs font-bold"
                      data-testid={`presentation-editor-image-resize-${layer.id}`}
                      onPointerDown={(event) => {
                        event.stopPropagation();
                        setSelectedLayerId(layer.id);
                        setSelectedLayerType("image");
                        setDragState({
                          slideIndex: activeSlideIndex,
                          layerId: layer.id,
                          layerType: "image",
                          mode: "resize",
                          startX: event.clientX,
                          startY: event.clientY,
                          initialX: layer.x,
                          initialY: layer.y,
                          initialWidth: layer.width,
                          initialHeight: layer.height,
                        });
                      }}
                      type="button"
                    >
                      ↘
                    </button>
                  </div>
                );
              })}
              {slideLayers.map((layer) => {
                const selected = layer.id === selectedLayerId && selectedLayerType === "text";
                return (
                  <div
                    key={layer.id}
                    className={`absolute whitespace-pre-wrap break-words leading-[1.18] ${selected ? "ring-2 ring-[#2563eb]" : "ring-1 ring-transparent hover:ring-[#93c5fd]"}`}
                    data-testid={`presentation-editor-layer-${layer.id}`}
                    style={{
                      left: `${layer.x}px`,
                      top: `${layer.y}px`,
                      width: `${layer.width}px`,
                      minHeight: `${layer.height}px`,
                      fontSize: `${layer.fontSize}px`,
                      color: layer.color,
                      fontWeight: layer.fontWeight,
                      textAlign: layer.align,
                      cursor: dragState?.layerId === layer.id && dragState.mode === "move" ? "grabbing" : "grab",
                    }}
                    onClick={(event) => {
                      event.stopPropagation();
                      setSelectedLayerId(layer.id);
                      setSelectedLayerType("text");
                    }}
                    onPointerDown={(event) => {
                      event.stopPropagation();
                      setSelectedLayerId(layer.id);
                      setSelectedLayerType("text");
                      setDragState({
                        slideIndex: activeSlideIndex,
                        layerId: layer.id,
                        layerType: "text",
                        mode: "move",
                        startX: event.clientX,
                        startY: event.clientY,
                        initialX: layer.x,
                        initialY: layer.y,
                        initialWidth: layer.width,
                        initialHeight: layer.height,
                      });
                    }}
                  >
                    {layer.text}
                    <button
                      className="absolute -bottom-4 -right-4 h-7 w-7 rounded-full border border-white bg-[#2563eb] text-white shadow"
                      data-testid={`presentation-editor-resize-${layer.id}`}
                      onPointerDown={(event) => {
                        event.stopPropagation();
                        setSelectedLayerId(layer.id);
                        setSelectedLayerType("text");
                        setDragState({
                          slideIndex: activeSlideIndex,
                          layerId: layer.id,
                          layerType: "text",
                          mode: "resize",
                          startX: event.clientX,
                          startY: event.clientY,
                          initialX: layer.x,
                          initialY: layer.y,
                          initialWidth: layer.width,
                          initialHeight: layer.height,
                        });
                      }}
                      type="button"
                    >
                      ↘
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {slides.map((slide, index) => (
          <div key={`form-${index}`} className="hidden">
            <input name={`slide_payload_${index}`} type="hidden" value={JSON.stringify(slide.entry)} />
            <input name={`slide_order_${index}`} type="hidden" value={String(slide.order)} />
            <input name={`slide_visible_${index}`} type="hidden" value={String(slide.visible)} />
            <input name={`slide_editor_json_${index}`} type="hidden" value={JSON.stringify(toEditorJson(slide))} />
            <input name={`slide_background_existing_${index}`} type="hidden" value={slide.editor.backgroundImageUrl || ""} />
          </div>
        ))}
      </section>

      <aside className="od-editor-inspector space-y-4 rounded-2xl border border-border bg-white p-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-text-3">屬性</p>
          <h3 className="mt-2 text-lg font-semibold text-text-1">背景與文字</h3>
        </div>

        <div className="grid gap-2">
          <label className="text-sm font-medium text-text-1">
            投影片順序
            <input
              className="mt-2 w-full rounded-2xl border border-border px-3 py-2"
              min={1}
              onChange={(event) => {
                const value = Number(event.target.value);
                updateSlide(activeSlideIndex, (slide) => ({ ...slide, order: Number.isFinite(value) ? value : slide.order }));
              }}
              type="number"
              value={activeSlide?.order ?? 1}
            />
          </label>
          <label className="flex items-center gap-2 text-sm text-text-1">
            <input
              checked={activeSlide?.visible ?? true}
              disabled={!activeSlide?.canToggle}
              onChange={(event) => updateSlide(activeSlideIndex, (slide) => ({ ...slide, visible: event.target.checked }))}
              type="checkbox"
            />
            這頁顯示在簡報中
          </label>
          <label className="flex items-center gap-2 text-sm text-text-1">
            <input
              checked={activeSlide?.editor.timerEnabled ?? false}
              data-testid="presentation-timer-enabled"
              onChange={(event) => updateSlide(activeSlideIndex, (slide) => ({
                ...slide,
                editor: {
                  ...slide.editor,
                  timerEnabled: event.target.checked,
                  timerSeconds: event.target.checked
                    ? (typeof slide.editor.timerSeconds === "number" && slide.editor.timerSeconds > 0 ? slide.editor.timerSeconds : 30)
                    : null,
                },
              }))}
              type="checkbox"
            />
            這頁顯示 timer
          </label>
          <label className="text-sm font-medium text-text-1">
            Timer 秒數
            <input
              className="mt-2 w-full rounded-2xl border border-border px-3 py-2 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-text-3"
              data-testid="presentation-timer-seconds"
              disabled={!(activeSlide?.editor.timerEnabled ?? false)}
              min={1}
              onChange={(event) => {
                const value = Number(event.target.value);
                updateSlide(activeSlideIndex, (slide) => ({
                  ...slide,
                  editor: {
                    ...slide.editor,
                    timerSeconds: Number.isFinite(value) && value > 0 ? Math.round(value) : null,
                  },
                }));
              }}
              type="number"
              value={activeSlide?.editor.timerSeconds ?? ""}
            />
          </label>
        </div>

        <div className="grid gap-2 text-sm">
          <div className="flex items-center justify-between gap-2">
            <span className="font-medium text-text-1">更換底圖</span>
            <button
              className="rounded-full border border-border bg-white px-3 py-1 text-xs font-medium text-text-2"
              onClick={clearActiveBackground}
              type="button"
            >
              清除底圖
            </button>
          </div>
          {slides.map((slide, index) => (
            <input
              key={`background-${index}`}
              accept="image/png,image/jpeg,image/webp"
              className={index === activeSlideIndex ? "block w-full rounded-xl border border-border px-2 py-1.5 text-xs" : "hidden"}
              name={`slide_background_file_${index}`}
              onChange={(event) => updateBackgroundPreview(index, event.target.files?.[0] || null)}
              type="file"
            />
          ))}
        </div>

        <div className="space-y-2" data-testid="presentation-asset-library">
          <div className="flex items-center justify-between gap-2">
            <div>
              <p className="text-sm font-medium text-text-1">已上傳底圖</p>
              <p className="text-xs text-text-2">同一份簡報已經存過的底圖可以直接重用。</p>
            </div>
            <span className="text-xs text-text-2 font-semibold">({reusableAssets.length} 張)</span>
          </div>
          <div className="grid gap-3">
            {reusableAssets.length ? reusableAssets.map((asset) => (
              <div key={asset.url} className="rounded-2xl border border-border bg-white p-3">
                <img alt={asset.label} className="h-24 w-full rounded-xl object-cover" src={asset.url} />
                <div className="mt-3 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-text-1">{asset.label}</p>
                    <p className="text-xs text-text-2">來源頁 {asset.sourceIndex + 1}</p>
                  </div>
                  <button
                    className="rounded-full border border-border bg-white px-3 py-2 text-xs font-medium"
                    onClick={() => applyExistingBackground(asset.url)}
                    type="button"
                  >
                    套用到底圖
                  </button>
                </div>
              </div>
            )) : (
              <div className="rounded-2xl border border-dashed border-border p-4 text-sm text-text-2">
                先為任一頁上傳並儲存底圖，這裡就會出現可重用素材。
              </div>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-sm font-medium text-text-1">圖層元素</p>
          <div className="flex flex-wrap gap-2">
            {slideLayers.map((layer) => (
              <button
                key={layer.id}
                className={layerButtonClass(layer.id === selectedLayerId && selectedLayerType === "text")}
                onClick={() => {
                  setSelectedLayerId(layer.id);
                  setSelectedLayerType("text");
                }}
                type="button"
              >
                T: {layer.text.slice(0, 10) || "未命名"}
              </button>
            ))}
            {(activeSlide?.editor.imageLayers || []).map((layer, index) => (
              <button
                key={layer.id}
                className={layerButtonClass(layer.id === selectedLayerId && selectedLayerType === "image")}
                onClick={() => {
                  setSelectedLayerId(layer.id);
                  setSelectedLayerType("image");
                }}
                type="button"
              >
                圖: {index + 1}
              </button>
            ))}
          </div>
        </div>

        {selectedLayerType === "text" && selectedLayer ? (
          <div className="space-y-3">
            <div>
              <div className="flex items-center justify-between gap-2 text-sm">
                <span className="font-medium text-text-1">文字內容</span>
                <button
                  className="rounded-full border border-border bg-white px-3 py-1 text-xs font-medium text-text-2 hover:bg-gray-50"
                  onClick={handleInsertInlineImage}
                  type="button"
                >
                  插入圖片
                </button>
              </div>
              <textarea
                ref={textareaRef}
                className="min-h-32 rounded-2xl border border-border px-3 py-2 w-full mt-1"
                onChange={(event) => updateSelectedLayer((layer) => ({ ...layer, text: event.target.value }))}
                value={selectedLayer.text}
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              {([
                ["x", "X"],
                ["y", "Y"],
                ["width", "寬"],
                ["height", "高"],
              ] as Array<[keyof Pick<SlideTextLayer, "x" | "y" | "width" | "height">, string]>).map(([field, label]) => (
                <label key={field} className="grid gap-1 text-sm">
                  <span className="font-medium text-text-1">{label}</span>
                  <input
                    className="rounded-xl border border-border px-2 py-1.5 text-sm"
                    onChange={(event) => updateLayerNumber(field, Number(event.target.value))}
                    type="number"
                    value={Math.round(selectedLayer[field])}
                  />
                </label>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-2">
              <label className="grid gap-1 text-sm">
                <span className="font-medium text-text-1">字體大小</span>
                <input
                  className="rounded-xl border border-border px-2 py-1.5 text-sm"
                  onChange={(event) => updateLayerNumber("fontSize", Number(event.target.value))}
                  type="number"
                  value={Math.round(selectedLayer.fontSize)}
                />
              </label>
              <label className="grid gap-1 text-sm">
                <span className="font-medium text-text-1">字色</span>
                <input
                  className="h-9 w-full rounded-xl border border-border px-1 py-1"
                  onChange={(event) => updateSelectedLayer((layer) => ({ ...layer, color: event.target.value }))}
                  type="color"
                  value={selectedLayer.color}
                />
              </label>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <label className="grid gap-1 text-sm">
                <span className="font-medium text-text-1">粗細</span>
                <select
                  className="rounded-xl border border-border px-2 py-1.5 text-sm"
                  onChange={(event) => updateSelectedLayer((layer) => ({ ...layer, fontWeight: event.target.value }))}
                  value={selectedLayer.fontWeight}
                >
                  <option value="400">一般</option>
                  <option value="500">中</option>
                  <option value="600">半粗</option>
                  <option value="700">粗體</option>
                  <option value="800">特粗</option>
                </select>
              </label>
              <label className="grid gap-1 text-sm">
                <span className="font-medium text-text-1">對齊</span>
                <select
                  className="rounded-xl border border-border px-2 py-1.5 text-sm"
                  onChange={(event) => updateSelectedLayer((layer) => ({ ...layer, align: event.target.value as SlideTextAlign }))}
                  value={selectedLayer.align}
                >
                  <option value="left">靠左</option>
                  <option value="center">置中</option>
                  <option value="right">靠右</option>
                </select>
              </label>
            </div>
          </div>
        ) : selectedLayerType === "image" && selectedImageLayer ? (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              {([
                ["x", "X"],
                ["y", "Y"],
                ["width", "寬"],
                ["height", "高"],
              ] as Array<[keyof Pick<SlideImageLayer, "x" | "y" | "width" | "height">, string]>).map(([field, label]) => (
                <label key={field} className="grid gap-1 text-sm">
                  <span className="font-medium text-text-1">{label}</span>
                  <input
                    className="rounded-xl border border-border px-2 py-1.5 text-sm"
                    onChange={(event) => updateImageLayerNumber(field, Number(event.target.value))}
                    type="number"
                    value={Math.round(selectedImageLayer[field])}
                  />
                </label>
              ))}
            </div>

            <label className="grid gap-1 text-sm">
              <span className="font-medium text-text-1">圓角</span>
              <select
                className="rounded-xl border border-border px-2 py-1.5 text-sm"
                onChange={(event) => updateSelectedImageLayer((layer) => ({ ...layer, borderRadius: Number(event.target.value) as 0 | 8 | 16 | 999 }))}
                value={selectedImageLayer.borderRadius}
              >
                <option value="0">直角 (0px)</option>
                <option value="8">小圓角 (8px)</option>
                <option value="16">中圓角 (16px)</option>
                <option value="999">全圓角 (圓形)</option>
              </select>
            </label>

            <label className="grid gap-1 text-sm">
              <span className="font-medium text-text-1">陰影</span>
              <select
                className="rounded-xl border border-border px-2 py-1.5 text-sm"
                onChange={(event) => updateSelectedImageLayer((layer) => ({ ...layer, shadow: event.target.value as "none" | "sm" | "md" }))}
                value={selectedImageLayer.shadow}
              >
                <option value="none">無陰影</option>
                <option value="sm">小陰影</option>
                <option value="md">中陰影</option>
              </select>
            </label>

            <label className="grid gap-1 text-sm">
              <span className="font-medium text-text-1">縮放填充 (Object Fit)</span>
              <select
                className="rounded-xl border border-border px-2 py-1.5 text-sm"
                onChange={(event) => updateSelectedImageLayer((layer) => ({ ...layer, objectFit: event.target.value as "cover" | "contain" }))}
                value={selectedImageLayer.objectFit}
              >
                <option value="cover">裁切填充 (Cover)</option>
                <option value="contain">完整縮放 (Contain)</option>
              </select>
            </label>

            <div className="pt-2 grid grid-cols-2 gap-2">
              <button
                className="w-full rounded-xl border border-border bg-white py-2 text-center text-xs font-semibold text-text-2 hover:bg-gray-50"
                onClick={() => {
                  const input = document.createElement("input");
                  input.type = "file";
                  input.accept = "image/png,image/jpeg,image/webp";
                  input.onchange = async (e) => {
                    const file = (e.target as HTMLInputElement).files?.[0];
                    if (!file) return;
                    try {
                      const result = await uploadLayerImageAction(presentationId, file);
                      updateSelectedImageLayer((layer) => ({ ...layer, imageUrl: result.imageUrl }));
                    } catch (err: unknown) {
                      alert(err instanceof Error ? err.message : "上傳失敗，請稍後再試");
                    }
                  };
                  input.click();
                }}
                type="button"
              >
                替換圖片
              </button>
              <button
                className="w-full rounded-xl bg-red-50 py-2 text-center text-xs font-semibold text-red-600 hover:bg-red-100"
                onClick={deleteSelectedElement}
                type="button"
              >
                刪除圖片
              </button>
            </div>
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-border bg-surface-1 p-4 text-sm text-text-2">
            先選取一個文字框或圖片元素，或新增新的元素再開始排版。
          </div>
        )}
      </aside>
    </div>
  );
}
