import Link from "next/link";

import { Card } from "../../../components/ui/card";
import { getCurrentGuestContext } from "../../../lib/actions/guest-portal";

const visitStatusLabels: Record<string, string> = {
  confirmed: "已確認",
  completed: "已完成",
  cancelled: "已取消",
  pending: "待確認",
};

function VisitBadge({ visitNumber }: { visitNumber?: number }) {
  if (!visitNumber) return <span className="rounded-full bg-surface-2 px-3 py-1 text-xs">尚未排定</span>;
  return <span className="rounded-full bg-primary px-3 py-1 text-xs text-white">{visitNumber > 1 ? "回訪來賓" : "新來賓"}</span>;
}

export default async function GuestHomePage() {
  const context = await getCurrentGuestContext();
  const isPending = context?.isPending === true;
  const inviter = context?.guest && 'members' in context.guest ? context.guest.members?.chinese_name || "邀約會員尚未指定" : "邀約會員尚未指定";
  const visit = context?.visit;

  return (
    <div className="space-y-8">
      <section className="grid gap-6 rounded-[32px] bg-[#231f20] p-8 text-white md:grid-cols-[1.3fr_0.7fr] md:p-12">
        {isPending ? (
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.32em] text-[#ffcf99]">帳號審核中</p>
            <h1 className="mt-4 text-4xl font-black leading-tight md:text-6xl">您的帳號已建立，正等待管理員審核。</h1>
            <p className="mt-5 max-w-2xl text-lg text-white/75">
              歡迎來到 BNI 華 AI 分會。為了維護系統安全與分會運作，所有自助註冊的帳號皆需經過後台管理員核准升權。在此期間，您可以先瀏覽分會的基礎介紹。
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/guest/content" className="rounded-full bg-primary px-5 py-3 text-sm font-semibold text-white">看文章與影片</Link>
            </div>
          </div>
        ) : (
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.32em] text-[#ffcf99]">來賓導覽</p>
            <h1 className="mt-4 text-4xl font-black leading-tight md:text-6xl">第一次來 BNI，也能知道怎麼準備。</h1>
            <p className="mt-5 max-w-2xl text-lg text-white/75">
              這裡是 BNI 華 AI 分會的來賓專區。你可以先了解 BNI 的推薦文化、分會節奏、來賓注意事項，以及登入後查看邀約資訊。
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/guest/prepare" className="rounded-full bg-primary px-5 py-3 text-sm font-semibold text-white">準備 15 秒介紹</Link>
              <Link href="/guest/content" className="rounded-full border border-white/25 px-5 py-3 text-sm font-semibold">看文章與影片</Link>
              {!context ? (
                <>
                  <Link href="/guest/register" className="rounded-full border border-white/25 px-5 py-3 text-sm font-semibold">註冊來賓帳號</Link>
                  <Link href="/login" className="rounded-full border border-white/25 px-5 py-3 text-sm font-semibold">來賓登入</Link>
                </>
              ) : null}
            </div>
          </div>
        )}

        {isPending ? (
          <Card className="border-white/15 bg-white/10 p-6 text-white">
            <p className="text-sm text-white/65">帳號目前狀態</p>
            <h2 className="mt-2 text-2xl font-bold">{context?.guest?.name}</h2>
            <div className="mt-5 space-y-3 text-sm text-white/80">
              <p>申請角色：正式會員</p>
              <p>狀態：待審核 (Pending)</p>
              <p className="text-xs text-white/60 leading-5">管理員將比對您的申請資料，審核完成後即可取得正式權限。</p>
            </div>
          </Card>
        ) : (
          <Card className="border-white/15 bg-white/10 p-6 text-white">
            <p className="text-sm text-white/65">登入後個人化資訊</p>
            <h2 className="mt-2 text-2xl font-bold">{context?.guest?.name || "尚未登入來賓身份"}</h2>
            <div className="mt-5 space-y-3 text-sm text-white/80">
              <p>邀約人：{inviter}</p>
              <p>拜訪週次：{visit?.week_date || "登入後依邀約資料顯示"}</p>
              <p>狀態：{visit?.status ? visitStatusLabels[visit.status] || visit.status : "未登入或尚未排定"}</p>
              <VisitBadge visitNumber={visit?.visit_number} />
            </div>
          </Card>
        )}
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {[
          ["BNI 是什麼", "以施者受惠為核心的商業引薦組織，透過固定例會建立信任、交換商機。"],
          ["華 AI 分會", "聚焦 AI 應用、專業服務與跨產業合作，讓會員用系統化方式創造可追蹤的推薦價值。"],
          ["來賓須知", "請準備 15 秒自我介紹、名片或聯絡方式，並想清楚你希望被引薦給誰。"],
        ].map(([title, text]) => (
          <Card key={title} className="p-6">
            <h2 className="text-xl font-bold">{title}</h2>
            <p className="mt-3 text-sm leading-6 text-text-2">{text}</p>
          </Card>
        ))}
      </section>

      {context && !isPending ? (
        <section className="grid gap-4 md:grid-cols-2">
          <Card className="p-6">
            <h2 className="text-xl font-bold">會後回饋</h2>
            <p className="mt-3 text-sm leading-6 text-text-2">例會結束後，您可以在這裡留下參訪心得與下一步需求。</p>
            <Link href="/guest/feedback" className="mt-4 inline-flex rounded-full bg-primary px-4 py-2 text-sm font-semibold text-white">
              前往會後回饋
            </Link>
          </Card>
          <Card className="p-6">
            <h2 className="text-xl font-bold">聯繫窗口</h2>
            <p className="mt-3 text-sm leading-6 text-text-2">若您想認識其他會員，請先透過邀約人或指定聯繫窗口協助引介。</p>
            <Link href="/guest/connections" className="mt-4 inline-flex rounded-full border border-border px-4 py-2 text-sm font-semibold text-text-1">
              請聯繫人協助引介
            </Link>
          </Card>
        </section>
      ) : null}
    </div>
  );
}
