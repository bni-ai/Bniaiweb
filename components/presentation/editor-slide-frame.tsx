import { useState } from "react";
import type { PresentationRuntimeSlide, SlideImageLayer } from "../../lib/presentation/types";
import { parseTextWithImages } from "../../lib/presentation/runtime";

const fontSizeClasses: Record<PresentationRuntimeSlide["editor"]["fontSize"], { title: string; body: string }> = {
  sm: { title: "text-5xl", body: "text-2xl leading-10" },
  md: { title: "text-6xl", body: "text-[32px] leading-[48px]" },
  lg: { title: "text-7xl", body: "text-[38px] leading-[58px]" },
  xl: { title: "text-8xl", body: "text-[46px] leading-[68px]" },
};

function renderLegacyBody(slide: PresentationRuntimeSlide, size: { title: string; body: string }) {
  return (
    <div className={`relative max-w-[1280px] ${slide.editor.backgroundImageUrl ? "text-white" : "text-slate-950"}`}>
      <h1 className={`font-black tracking-tight ${size.title}`}>{slide.editor.title}</h1>
      {slide.editor.body ? (
        <div className={`mt-10 whitespace-pre-wrap ${size.body} ${slide.editor.backgroundImageUrl ? "text-white/92" : "text-slate-700"}`}>
          {slide.editor.body}
        </div>
      ) : null}
    </div>
  );
}

function ViewerImage({ layer }: { layer: SlideImageLayer }) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div
        className="flex items-center justify-center bg-slate-200 text-slate-500 border border-slate-300 select-none"
        style={{
          width: "100%",
          height: "100%",
          borderRadius: layer.borderRadius === 999 ? "999px" : `${layer.borderRadius}px`,
        }}
      >
        <span className="text-xs font-semibold">圖片無法載入</span>
      </div>
    );
  }

  return (
    <img
      alt="圖片元素"
      src={layer.imageUrl}
      onError={() => setFailed(true)}
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
  );
}

function ViewerInlineImage({ url }: { url: string }) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <span className="block my-2 w-full h-32 flex items-center justify-center bg-slate-200 text-slate-500 border border-slate-300 rounded-xl select-none">
        圖片無法載入
      </span>
    );
  }

  return (
    <img
      alt="行內圖片"
      src={url}
      onError={() => setFailed(true)}
      className="block my-2 max-w-full rounded-xl"
      style={{ display: "block", width: "100%", height: "auto" }}
    />
  );
}

export function EditorSlideFrame({ slide }: { slide: PresentationRuntimeSlide }) {
  const size = fontSizeClasses[slide.editor.fontSize];
  const hasCustomLayers = slide.editor.textLayers.length > 0;

  return (
    <section
      className="relative flex h-full w-full flex-col overflow-hidden rounded-[28px] bg-[#fffdf9] text-slate-950"
      style={{
        backgroundImage: slide.editor.backgroundImageUrl ? `linear-gradient(rgba(15, 7, 7, 0.45), rgba(15, 7, 7, 0.28)), url(${slide.editor.backgroundImageUrl})` : undefined,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className={`absolute inset-0 ${slide.editor.backgroundImageUrl ? "bg-black/5" : "bg-[radial-gradient(circle_at_top,_rgba(220,38,38,0.08),_transparent_42%),linear-gradient(180deg,#fffdf9_0%,#f8f1eb_100%)]"}`} />
      <div className="relative h-full w-full">
        {/* Render Image Layers */}
        {(slide.editor.imageLayers || []).map((layer) => (
          <div
            key={layer.id}
            className="absolute overflow-hidden"
            data-testid={`presentation-viewer-image-${layer.id}`}
            style={{
              left: `${layer.x}px`,
              top: `${layer.y}px`,
              width: `${layer.width}px`,
              height: `${layer.height}px`,
            }}
          >
            <ViewerImage layer={layer} />
          </div>
        ))}

        {hasCustomLayers ? (
          slide.editor.textLayers.map((layer, index) => {
            const Tag = index === 0 ? "h1" : "div";
            return (
              <Tag
                key={layer.id}
                className="absolute whitespace-pre-wrap break-words leading-[1.18]"
                data-testid={`presentation-viewer-layer-${layer.id}`}
                style={{
                  left: `${layer.x}px`,
                  top: `${layer.y}px`,
                  width: `${layer.width}px`,
                  minHeight: `${layer.height}px`,
                  fontSize: `${layer.fontSize}px`,
                  color: layer.color,
                  fontWeight: layer.fontWeight,
                  textAlign: layer.align,
                }}
              >
                {parseTextWithImages(layer.text).map((chunk, chunkIdx) => {
                  if (chunk.type === "image") {
                    return <ViewerInlineImage key={chunkIdx} url={chunk.content} />;
                  }
                  return <span key={chunkIdx}>{chunk.content}</span>;
                })}
              </Tag>
            );
          })
        ) : (
          <div className="relative flex h-full flex-col justify-between p-20">
            {renderLegacyBody(slide, size)}
          </div>
        )}
      </div>
    </section>
  );
}
