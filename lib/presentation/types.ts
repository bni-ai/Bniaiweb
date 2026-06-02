export type SlideEntry =
  | { type: "cover" }
  | { type: "keynote"; id: string; visible: boolean }
  | { type: "member"; id: string; visible: boolean }
  | { type: "guest"; id: string; visible: boolean }
  | { type: "award"; id: string; visible: boolean }
  | { type: "vp_report"; id: string; visible: boolean }
  | { type: "team" };

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
