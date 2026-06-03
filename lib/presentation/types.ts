export type SlideFontSize = "sm" | "md" | "lg" | "xl";

export type SlideTextAlign = "left" | "center" | "right";

export type SlideTextLayer = {
  id: string;
  text: string;
  x: number;
  y: number;
  width: number;
  height: number;
  fontSize: number;
  color: string;
  fontWeight: string;
  align: SlideTextAlign;
};

export type SlideEditorPatch = {
  title?: string | null;
  body?: string | null;
  backgroundImageUrl?: string | null;
  fontSize?: SlideFontSize | null;
  textLayers?: SlideTextLayer[] | null;
  dataOverride?: Record<string, string | null>;
};

export type SlideEntry =
  | { type: "cover"; editor?: SlideEditorPatch }
  | { type: "agenda"; editor?: SlideEditorPatch }
  | { type: "keynote"; id: string; visible: boolean; editor?: SlideEditorPatch }
  | { type: "member"; id: string; visible: boolean; editor?: SlideEditorPatch }
  | { type: "guest"; id: string; visible: boolean; editor?: SlideEditorPatch }
  | { type: "award"; id: string; visible: boolean; editor?: SlideEditorPatch }
  | { type: "vp_report"; id: string; visible: boolean; editor?: SlideEditorPatch }
  | { type: "team"; editor?: SlideEditorPatch }
  | { type: "closing"; editor?: SlideEditorPatch }
  | { type: "custom"; id: string; visible: boolean; editor?: SlideEditorPatch };

export type RuntimeSlideType = SlideEntry["type"];

export type PresentationRuntimeSlide = {
  id: string;
  type: RuntimeSlideType;
  label: string;
  title: string;
  subtitle: string;
  summary: string;
  notes: string;
  editor: {
    title: string;
    body: string;
    backgroundImageUrl: string | null;
    fontSize: SlideFontSize;
    textLayers: SlideTextLayer[];
  };
  payload: Record<string, unknown>;
};

export type PresentationRuntimeDeck = {
  weekDate: string;
  chapterName: string;
  slides: PresentationRuntimeSlide[];
};

export type PresentationMember = {
  id: string;
  chinese_name: string;
  english_name: string | null;
  specialty_title: string | null;
  specialty_description: string | null;
  company_name: string | null;
  photo_url: string | null;
  position: string | null;
  committee: string | null;
  member_number: string | null;
};

export type CoverSlideProps = {
  chapterName: string;
  weekDate: string;
  meetingTime: string;
};

export type MemberSlideProps = {
  member: PresentationMember;
  brief: {
    id: string;
    have_this_week: string | null;
    want_this_week: string | null;
  };
};

export type KeynoteSlideProps = {
  speaker: PresentationMember;
  keynote: {
    id: string;
    topic: string;
    outline: string | null;
    product_images: string[];
  };
};

export type GuestSlideProps = {
  guest: {
    id: string;
    name: string;
    company: string | null;
    specialty: string | null;
  };
  visit: {
    id: string;
    visit_number: number;
    status: string;
    self_intro: string | null;
  };
  referrer: PresentationMember | null;
};

export type AwardSlideProps = {
  award: {
    id: string;
    award_type: string;
    description: string | null;
  };
  recipient: PresentationMember | null;
};

export type VPReportSlideProps = {
  report: {
    id: string;
    total_referrals: number;
    total_one_on_ones: number;
    total_visitors: number;
    member_attendance: number;
    referral_value_twd: number;
    notes: string | null;
  };
};

export type TeamSlideProps = {
  chapterName: string;
  members: PresentationMember[];
};

export type AgendaSlideProps = {
  chapterName: string;
  weekDate: string;
};

export type ClosingSlideProps = {
  chapterName: string;
  weekDate: string;
};
