import { submitGuestFeedbackAction, getCurrentGuestContext } from "../../../../lib/actions/guest-portal";

type GuestFeedbackPageProps = {
  searchParams?: Promise<{
    saved?: string;
  }>;
};

export default async function GuestFeedbackPage({ searchParams }: GuestFeedbackPageProps) {
  const context = await getCurrentGuestContext();
  const params = await searchParams;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <p className="mb-2 text-sm text-text-2">來賓專區</p>
        <h1 className="text-3xl font-black text-text-1">會後回饋</h1>
        <p className="mt-2 text-sm leading-6 text-text-2">請留下這次參訪的心得、收穫，或您希望後續協助的方向。</p>
      </div>

      {params?.saved === "1" ? (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          會後回饋已送出。
        </div>
      ) : null}

      <form action={submitGuestFeedbackAction} className="space-y-4 rounded-[24px] border border-border bg-white p-6">
        <div className="rounded-2xl bg-surface p-4 text-sm text-text-2">
          <p>目前參訪週次：{context?.visit?.week_date || "尚未排定"}</p>
          <p className="mt-1">邀約窗口：{context?.guest && "members" in context.guest ? context.guest.members?.chinese_name || "尚未指定" : "尚未指定"}</p>
        </div>
        <div className="space-y-2">
          <label htmlFor="feedback" className="block text-sm font-medium text-text-1">
            您的回饋
          </label>
          <textarea
            id="feedback"
            name="feedback"
            defaultValue={context?.visit?.feedback || ""}
            required
            rows={8}
            className="w-full rounded-[var(--radius-input)] border border-border bg-surface px-3 py-3 text-sm text-text-1 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
            placeholder="例如：今天最有收穫的是什麼？後續想再認識哪類型的會員？"
          />
        </div>
        <button type="submit" className="rounded-full bg-primary px-5 py-3 text-sm font-semibold text-white">
          送出回饋
        </button>
      </form>
    </div>
  );
}
