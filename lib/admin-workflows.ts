export type VpMetricInput = Record<string, number | null | undefined>;

export type SlideOrderItem = {
  type: "cover" | "keynote" | "member" | "guest" | "award" | "vp_report" | "team";
  id: string | null;
  visible: boolean;
};

export function validateVpMetrics(metrics: VpMetricInput): Record<string, string> {
  return Object.fromEntries(
    Object.entries(metrics)
      .filter(([, value]) => typeof value === "number" && value < 0)
      .map(([key]) => [key, "不可小於 0"]),
  );
}

export function getNextVisitNumber(existingVisitNumbers: number[]): number {
  if (existingVisitNumbers.length === 0) return 1;
  return Math.max(...existingVisitNumbers) + 1;
}

export function buildPresentationSlides(input: {
  weekDate: string;
  briefs: Array<{ id: string }>;
  keynote: { id: string } | null;
  guestVisits: Array<{ guest_id: string }>;
  awards: Array<{ id: string }>;
  vpReport: { id: string } | null;
}): SlideOrderItem[] {
  const slides: SlideOrderItem[] = [{ type: "cover", id: input.weekDate, visible: true }];

  if (input.keynote) slides.push({ type: "keynote", id: input.keynote.id, visible: true });
  for (const brief of input.briefs) slides.push({ type: "member", id: brief.id, visible: true });
  for (const visit of input.guestVisits) slides.push({ type: "guest", id: visit.guest_id, visible: true });
  for (const award of input.awards) slides.push({ type: "award", id: award.id, visible: true });
  if (input.vpReport) slides.push({ type: "vp_report", id: input.vpReport.id, visible: true });

  slides.push({ type: "team", id: input.weekDate, visible: true });
  return slides;
}
