import type {
  AgendaSlideProps,
  AwardSlideProps,
  ClosingSlideProps,
  CoverSlideProps,
  GuestSlideProps,
  KeynoteSlideProps,
  MemberSlideProps,
  TeamSlideProps,
  VPReportSlideProps,
} from "../../lib/presentation/types";
import { Avatar, BulletList, InfoCard, Label, SectionTitle, StatCard, TwoColumn, clampParagraph, slideCanvasClass } from "./shared";

const guestVisitStatusLabels: Record<string, string> = {
  confirmed: "已確認",
  completed: "已完成",
  cancelled: "已取消",
  pending: "待確認",
};

function getGuestVisitStatusLabel(status: string) {
  return guestVisitStatusLabels[status] || status;
}

export function CoverSlide({ chapterName, weekDate, meetingTime }: CoverSlideProps) {
  return (
    <section className={slideCanvasClass} data-slide-canvas="true" data-slide-type="cover">
      <div className="flex h-full flex-col justify-between px-10 py-10">
        <div className="space-y-6">
          <Label>BNI 例會簡報</Label>
          <div className="space-y-4">
            <h1 className="max-w-3xl text-5xl font-black tracking-tight text-slate-900">{chapterName}</h1>
            <p className="text-2xl font-semibold text-[#dc2626]">第 {weekDate} 週例會簡報</p>
            <p className="max-w-2xl text-lg leading-8 text-slate-600">以可投影、可分享的 HTML slide deck 取代臨時拼接檔案，讓例會流程與內容都維持同一份真實資料來源。</p>
          </div>
        </div>
        <div className="grid gap-5 md:grid-cols-3">
          <StatCard label="分會" value={chapterName} />
          <StatCard label="週次" value={weekDate} />
          <StatCard label="例會時間" value={meetingTime} />
        </div>
      </div>
    </section>
  );
}

export function AgendaSlide({ chapterName, weekDate }: AgendaSlideProps) {
  return (
    <section className={slideCanvasClass} data-slide-canvas="true" data-slide-type="agenda">
      <SectionTitle eyebrow="例會流程" title="本週例會議程" subtitle={`${chapterName}｜${weekDate}`} />
      <div className="grid flex-1 gap-6 px-10 py-8 md:grid-cols-2">
        <InfoCard title="上半場">
          <BulletList items={["開場與分會公告", "會員每週簡報", "來賓介紹與 15 秒內容", "8 分鐘短講"]} />
        </InfoCard>
        <InfoCard title="下半場">
          <BulletList items={["表揚與成果回顧", "VP 報告與營運指標", "幹部提醒與後續行動", "開放交流與一對一安排"]} />
        </InfoCard>
      </div>
    </section>
  );
}

export function MemberSlide({ member, brief }: MemberSlideProps) {
  return (
    <section className={slideCanvasClass} data-slide-canvas="true" data-slide-type="member">
      <SectionTitle eyebrow="會員簡報" title={member.chinese_name} subtitle={member.specialty_title || member.company_name || "本週商務焦點"} />
      <TwoColumn
        left={
          <div className="space-y-6">
            <div className="flex items-center gap-5 rounded-[28px] border border-[#fecaca] bg-white/90 p-6 shadow-[0_18px_50px_rgba(15,23,42,0.06)]">
              <Avatar name={member.chinese_name} photoUrl={member.photo_url} />
              <div className="min-w-0">
                <p className="text-3xl font-black text-slate-900">{member.chinese_name}</p>
                <p className="mt-2 text-lg font-semibold text-[#dc2626]">{member.specialty_title || "專業待補"}</p>
                <p className="mt-2 text-sm text-slate-500">{member.company_name || "公司資料待補"}</p>
              </div>
            </div>
            <InfoCard title="本週我有">
              {clampParagraph(brief.have_this_week, "本週供給內容待補")}
            </InfoCard>
          </div>
        }
        right={
          <div className="space-y-6">
            <InfoCard title="本週我想要">
              {clampParagraph(brief.want_this_week, "本週需求內容待補")}
            </InfoCard>
            <InfoCard title="引薦線索">
              <BulletList
                items={[
                  member.specialty_description || "用一句話補上你最擅長解的問題。",
                  member.company_name ? `服務品牌：${member.company_name}` : "公司品牌待補。",
                  member.english_name ? `英文名：${member.english_name}` : "英文名待補。",
                ]}
              />
            </InfoCard>
          </div>
        }
      />
    </section>
  );
}

export function KeynoteSlide({ speaker, keynote }: KeynoteSlideProps) {
  const outlineItems = (keynote.outline || "").split(/\n+/).map((item) => item.trim()).filter(Boolean);
  return (
    <section className={slideCanvasClass} data-slide-canvas="true" data-slide-type="keynote">
      <SectionTitle eyebrow="8 分鐘短講" title={keynote.topic} subtitle={speaker.chinese_name} />
      <TwoColumn
        left={
          <div className="space-y-6">
            <div className="flex items-center gap-5 rounded-[28px] border border-[#fecaca] bg-white/90 p-6 shadow-[0_18px_50px_rgba(15,23,42,0.06)]">
              <Avatar name={speaker.chinese_name} photoUrl={speaker.photo_url} />
              <div className="min-w-0">
                <p className="text-3xl font-black text-slate-900">{speaker.chinese_name}</p>
                <p className="mt-2 text-lg font-semibold text-[#dc2626]">{speaker.specialty_title || "短講講者"}</p>
                <p className="mt-2 text-sm text-slate-500">{speaker.company_name || "公司資料待補"}</p>
              </div>
            </div>
            <InfoCard title="講題大綱">
              {outlineItems.length ? <BulletList items={outlineItems} /> : clampParagraph(keynote.outline, "尚未提供大綱，請至少整理三個重點。")}
            </InfoCard>
          </div>
        }
        right={
          <div className="space-y-6">
            <InfoCard title="素材清單">
              {keynote.product_images.length ? (
                <div className="grid grid-cols-2 gap-3">
                  {keynote.product_images.slice(0, 4).map((image) => (
                    <div key={image} className="overflow-hidden rounded-2xl border border-[#fecaca] bg-[#fff7f1]">
                      <img src={image} alt={keynote.topic} className="h-36 w-full object-cover" />
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-base leading-7 text-slate-700">尚未提供素材圖，請補上產品圖或案例圖連結。</p>
              )}
            </InfoCard>
          </div>
        }
      />
    </section>
  );
}

export function GuestSlide({ guest, visit, referrer }: GuestSlideProps) {
  return (
    <section className={slideCanvasClass} data-slide-canvas="true" data-slide-type="guest">
      <SectionTitle eyebrow="來賓介紹" title={guest.name} subtitle={guest.specialty || guest.company || "本週來賓"} />
      <TwoColumn
        left={
          <div className="space-y-6">
            <InfoCard title="來賓資訊">
              <div className="space-y-2 text-base text-slate-700">
                <p>公司：{guest.company || "待補"}</p>
                <p>專業：{guest.specialty || "待補"}</p>
                <p>第 {visit.visit_number} 次參訪</p>
                <p>狀態：{getGuestVisitStatusLabel(visit.status)}</p>
              </div>
            </InfoCard>
            <InfoCard title="15 秒自我介紹">
              {clampParagraph(visit.self_intro, "尚未提供 15 秒介紹。")}
            </InfoCard>
          </div>
        }
        right={
          <div className="space-y-6">
            <InfoCard title="邀約人">
              {referrer ? (
                <div className="flex items-center gap-4">
                  <Avatar name={referrer.chinese_name} photoUrl={referrer.photo_url} />
                  <div>
                    <p className="text-2xl font-black text-slate-900">{referrer.chinese_name}</p>
                    <p className="mt-2 text-sm text-[#dc2626]">{referrer.specialty_title || "會員"}</p>
                  </div>
                </div>
              ) : (
                <p className="text-base leading-7 text-slate-700">尚未指定邀約人。</p>
              )}
            </InfoCard>
          </div>
        }
      />
    </section>
  );
}

export function AwardSlide({ award, recipient }: AwardSlideProps) {
  return (
    <section className={slideCanvasClass} data-slide-canvas="true" data-slide-type="award">
      <SectionTitle eyebrow="本週獎項" title={award.award_type} subtitle={recipient?.chinese_name || "待指定得獎者"} />
      <TwoColumn
        left={
          <div className="flex items-center justify-center rounded-[28px] border border-[#fecaca] bg-white/90 p-8 shadow-[0_18px_50px_rgba(15,23,42,0.06)]">
            <div className="text-center">
              <div className="mx-auto flex h-28 w-28 items-center justify-center rounded-full bg-[#dc2626] text-4xl font-black text-white">BNI</div>
              <p className="mt-5 text-3xl font-black text-slate-900">{recipient?.chinese_name || "待補"}</p>
              <p className="mt-2 text-lg text-slate-500">{recipient?.specialty_title || "專業待補"}</p>
            </div>
          </div>
        }
        right={
          <InfoCard title="頒獎說明">
            {clampParagraph(award.description, "尚未填寫獎項說明。")}
          </InfoCard>
        }
      />
    </section>
  );
}

export function VPReportSlide({ report }: VPReportSlideProps) {
  return (
    <section className={slideCanvasClass} data-slide-canvas="true" data-slide-type="vp_report">
      <SectionTitle eyebrow="VP 報告" title="本週績效摘要" subtitle="例會營運指標" />
      <div className="grid flex-1 gap-5 px-10 py-8 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="總引薦數" value={String(report.total_referrals)} />
        <StatCard label="一對一" value={String(report.total_one_on_ones)} />
        <StatCard label="訪客數" value={String(report.total_visitors)} />
        <StatCard label="出席數" value={String(report.member_attendance)} />
        <StatCard label="引薦金額" value={`NT$ ${report.referral_value_twd.toLocaleString("zh-TW")}`} helper="以台幣顯示" />
        <div className="md:col-span-2 xl:col-span-3">
          <InfoCard title="備註">
            {clampParagraph(report.notes, "本週沒有額外備註。")}
          </InfoCard>
        </div>
      </div>
    </section>
  );
}

export function TeamSlide({ chapterName, members }: TeamSlideProps) {
  return (
    <section className={slideCanvasClass} data-slide-canvas="true" data-slide-type="team">
      <SectionTitle eyebrow="幹部團隊" title={`${chapterName} 幹部`} subtitle="例會運作與會員支持窗口" />
      <div className="grid flex-1 gap-5 overflow-auto px-10 py-8 md:grid-cols-2 xl:grid-cols-3">
        {members.map((member) => (
          <div key={member.id} className="flex items-center gap-4 rounded-[24px] border border-[#fecaca] bg-white/90 p-5 shadow-[0_18px_50px_rgba(15,23,42,0.06)]">
            <Avatar name={member.chinese_name} photoUrl={member.photo_url} />
            <div className="min-w-0">
              <p className="truncate text-2xl font-black text-slate-900">{member.chinese_name}</p>
              <p className="mt-1 text-sm font-semibold text-[#dc2626]">{member.position || member.committee || "幹部"}</p>
              <p className="mt-2 text-sm text-slate-500">{member.specialty_title || member.company_name || "會員資訊待補"}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export function ClosingSlide({ chapterName, weekDate }: ClosingSlideProps) {
  return (
    <section className={slideCanvasClass} data-slide-canvas="true" data-slide-type="closing">
      <div className="flex h-full flex-col justify-between px-10 py-10">
        <div className="space-y-6">
          <Label>BNI 華 AI</Label>
          <div className="space-y-5">
            <h2 className="text-6xl font-black tracking-tight text-slate-900">簡報結束</h2>
            <p className="max-w-4xl text-2xl font-semibold leading-10 text-[#dc2626]">{chapterName}｜{weekDate}</p>
            <p className="max-w-4xl text-xl leading-9 text-slate-600">感謝本週參與。請把今天的引薦、來賓追蹤與一對一後續行動完成，讓例會資料真正轉成商務成果。</p>
          </div>
        </div>
        <div className="grid gap-5 md:grid-cols-3">
          <StatCard label="下一步" value="一對一" helper="約定後續會談" />
          <StatCard label="後續追蹤" value="引薦" helper="確認轉介對象" />
          <StatCard label="來賓" value="追蹤" helper="協助來賓加入流程" />
        </div>
      </div>
    </section>
  );
}
