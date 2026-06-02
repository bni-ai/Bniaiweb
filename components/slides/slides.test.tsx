import { renderToStaticMarkup } from "react-dom/server";
import { createElement } from "react";
import { describe, expect, it } from "vitest";

import { AgendaSlide, ClosingSlide, CoverSlide } from ".";

describe("presentation slide components", () => {
  it("renders fixed 1920x1080 slide canvas", () => {
    const markup = renderToStaticMarkup(
      createElement(CoverSlide, { chapterName: "BNI 華 AI 分會", weekDate: "2026 / 06 / 01", meetingTime: "每週四 07:30 - 09:30" }),
    );

    expect(markup).toContain("data-slide-canvas=\"true\"");
    expect(markup).toContain("w-[1920px]");
    expect(markup).toContain("h-[1080px]");
  });

  it("renders agenda and closing meeting-flow slides", () => {
    const agenda = renderToStaticMarkup(createElement(AgendaSlide, { chapterName: "BNI 華 AI 分會", weekDate: "2026-06-01" }));
    const closing = renderToStaticMarkup(createElement(ClosingSlide, { chapterName: "BNI 華 AI 分會", weekDate: "2026-06-01" }));

    expect(agenda).toContain("本週例會議程");
    expect(agenda).toContain("8 分鐘短講");
    expect(closing).toContain("簡報結束");
    expect(closing).toContain("後續行動");
  });
});
