import type { PresentationMember } from "../../lib/presentation/types";

type ProfileCardProps = {
  member: PresentationMember & {
    line_name?: string | null;
    general_referral?: string | null;
    ideal_referral?: string | null;
    dream_referral?: string | null;
    gains_goals?: string | null;
    gains_accomplishments?: string | null;
    gains_interests?: string | null;
    gains_networks?: string | null;
    gains_skills?: string | null;
  };
  brief?: {
    have_this_week: string | null;
    want_this_week: string | null;
  } | null;
};

export function MemberProfileCard({ member, brief }: ProfileCardProps) {
  const referralTiers = [
    { tier: "第一層 — 初識 (冷接觸)", content: member.general_referral || "尚未填寫初識引薦素材" },
    { tier: "第二層 — 信任 (深引薦)", content: member.ideal_referral || "尚未填寫信任引薦素材" },
    { tier: "第三層 — 夢想 (終極引薦)", content: member.dream_referral || "尚未填寫夢想引薦素材" },
  ];

  const gainsFields = [
    { label: "Goals (目標)", value: member.gains_goals || "尚未填寫目標" },
    { label: "Accomplishments (成就)", value: member.gains_accomplishments || "尚未填寫成就" },
    { label: "Interests (興趣)", value: member.gains_interests || "尚未填寫興趣" },
    { label: "Networks (人脈)", value: member.gains_networks || "尚未填寫人脈" },
    { label: "Skills (技能)", value: member.gains_skills || "尚未填寫技能" },
  ];

  return (
    <div className="space-y-6">
      {/* 頂部：本週簡報 (Weekly Brief) Highlight 卡片 */}
      {brief && (brief.have_this_week || brief.want_this_week) ? (
        <div className="rounded-[24px] border border-[#fecaca] bg-white/95 p-5 shadow-[0_12px_40px_rgba(220,38,38,0.03)]">
          <div className="flex items-center justify-between">
            <span className="rounded-full bg-[#fef2f2] px-3 py-1 text-xs font-semibold text-[#dc2626]">
              本週簡報預覽
            </span>
            <span className="text-xs text-text-3">例會簡報投影片即時同步中</span>
          </div>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl bg-surface-1 p-4 border border-[#eaeaea]">
              <p className="text-xs font-semibold text-text-3 uppercase tracking-wider">本週我有 (Have)</p>
              <p className="mt-2 text-sm text-slate-700 whitespace-pre-line leading-relaxed font-medium">
                {brief.have_this_week || "本週供給內容待補"}
              </p>
            </div>
            <div className="rounded-2xl bg-surface-1 p-4 border border-[#eaeaea]">
              <p className="text-xs font-semibold text-text-3 uppercase tracking-wider">本週我想要 (Want)</p>
              <p className="mt-2 text-sm text-slate-700 whitespace-pre-line leading-relaxed font-medium">
                {brief.want_this_week || "本週需求內容待補"}
              </p>
            </div>
          </div>
        </div>
      ) : null}

      {/* 公開名片 Card-based Layout */}
      <div className="rounded-[28px] border border-[#fecaca] bg-white/90 p-6 shadow-[0_18px_50px_rgba(15,23,42,0.06)]">
        <div className="flex flex-col gap-5 md:flex-row md:items-start">
          {/* 左側大頭照 */}
          <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-3xl border border-[#fecaca] bg-[#fff7f1]">
            {member.photo_url ? (
              <img src={member.photo_url} alt={member.chinese_name} className="h-full w-full object-cover" />
            ) : (
              <span className="text-2xl font-black text-[#dc2626]">{member.chinese_name.slice(-1)}</span>
            )}
          </div>
          {/* 右側基本資訊 */}
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-baseline gap-2">
              <h2 className="text-3xl font-black text-slate-900">{member.chinese_name}</h2>
              {member.english_name ? (
                <span className="text-lg font-medium text-slate-500">({member.english_name})</span>
              ) : null}
              {member.member_number ? (
                <span className="ml-2 rounded-full bg-[#f5f5f5] px-2.5 py-0.5 text-xs text-text-2">
                  #{member.member_number}
                </span>
              ) : null}
            </div>
            <p className="mt-2 text-lg font-semibold text-[#dc2626]">
              {member.specialty_title || "專業名稱待補"}
            </p>
            <p className="mt-1 text-sm text-slate-500">
              {member.company_name || "公司名稱待補"}
            </p>
            {member.specialty_description ? (
              <p className="mt-3 text-sm text-text-2 leading-relaxed border-t border-[#eaeaea] pt-3 whitespace-pre-line">
                {member.specialty_description}
              </p>
            ) : null}
          </div>
        </div>
      </div>

      {/* 專業別與引薦來源 (三層引薦) */}
      <div className="rounded-[24px] border border-border bg-white p-5 shadow-sm">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-text-3">引薦素材</h3>
        <div className="mt-4 grid gap-3">
          {referralTiers.map((tier) => (
            <div key={tier.tier} className="rounded-2xl border border-border p-4 bg-surface-1 hover:border-gray-300 transition-colors">
              <p className="text-xs font-semibold text-text-3">{tier.tier}</p>
              <p className="mt-2 text-sm text-slate-700 whitespace-pre-line leading-relaxed">
                {tier.content}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* GAINS Profile 區塊 */}
      <div className="rounded-[24px] border border-border bg-white p-5 shadow-sm">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-text-3">GAINS Profile (收穫表)</h3>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {gainsFields.map((field) => (
            <div key={field.label} className="rounded-2xl border border-border p-4 bg-surface-1">
              <p className="text-xs font-semibold text-[#dc2626]">{field.label}</p>
              <p className="mt-2 text-sm text-slate-700 whitespace-pre-line leading-relaxed">
                {field.value}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
