import { Card } from "../../../../components/ui/card";
import { triggerManualSyncAction, getAdminSettings, saveAdminSettingsAction } from "../../../../lib/actions/settings";

const providers = [
  { id: "claude", label: "Claude", tone: "bg-[#0f172a] text-white" },
  { id: "gemini", label: "Gemini", tone: "bg-[#2563eb] text-white" },
  { id: "openai", label: "GPT", tone: "bg-[#059669] text-white" },
] as const;

const dayOptions = ["週一", "週二", "週三", "週四", "週五", "週六", "週日"];

export default async function AdminSettingsPage({
  searchParams,
}: {
  searchParams?: Promise<{ saved?: string; sync?: string; week?: string }>;
}) {
  const params = await searchParams;
  const { chapter, settings, aiProviders, syncLogs } = await getAdminSettings();

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm text-text-2">Admin Settings</p>
          <h1 className="text-3xl font-black">系統設定</h1>
          <p className="mt-2 text-sm text-text-2">管理分會資訊、AI provider、例會截止與同步基線。</p>
        </div>
      </div>

      {params?.saved ? <Card className="rounded-2xl border-emerald-300 bg-emerald-50 p-4 text-sm text-emerald-900">設定已儲存。</Card> : null}
      {params?.sync ? <Card className="rounded-2xl border-emerald-300 bg-emerald-50 p-4 text-sm text-emerald-900">已完成 {params.week || "本週"} 的 manual sync baseline。</Card> : null}

      <form action={saveAdminSettingsAction} className="space-y-5">
        <Card className="rounded-2xl p-5">
          <div className="mb-5 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-semibold">分會資訊</h2>
              <p className="text-sm text-text-2">這些資料會作為後台與簡報 viewer 的基礎顯示。</p>
            </div>
            <button type="submit" className="rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-white">儲存設定</button>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <label className="grid gap-2 text-sm"><span className="font-medium">分會名稱</span><input name="chapter_name" defaultValue={chapter.name} className="rounded-2xl border border-border px-3 py-2.5" /></label>
            <label className="grid gap-2 text-sm"><span className="font-medium">BNI 地區</span><input name="chapter_region" defaultValue={chapter.region || ""} className="rounded-2xl border border-border px-3 py-2.5" /></label>
            <label className="grid gap-2 text-sm md:col-span-2"><span className="font-medium">例會時間與地點備註</span><input name="meeting_time" defaultValue={settings.meetingTime || ""} className="rounded-2xl border border-border px-3 py-2.5" /></label>
          </div>
        </Card>

        <Card className="rounded-2xl p-5">
          <div className="mb-5">
            <h2 className="text-xl font-semibold">AI 設定</h2>
            <p className="text-sm text-text-2">啟用中的 provider 會被會員 AI 助手讀取，切換後下一次查詢立即生效。</p>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {providers.map((provider) => {
              const row = aiProviders[provider.id];
              return (
                <div key={provider.id} className="rounded-2xl border border-border p-4">
                  <label className="flex items-center gap-3 text-sm font-semibold">
                    <input type="radio" name="active_provider" value={provider.id} defaultChecked={row.isActive || (!aiProviders.claude.isActive && provider.id === "claude")} />
                    <span className={`flex h-8 w-8 items-center justify-center rounded text-xs ${provider.tone}`}>{provider.label.slice(0, 3)}</span>
                    {provider.label}
                  </label>
                  <div className="mt-4 grid gap-3">
                    <input name={`${provider.id}_model_name`} defaultValue={row.modelName} className="rounded-2xl border border-border px-3 py-2.5 text-sm" placeholder="Model name" />
                    <input name={`${provider.id}_api_key`} defaultValue={row.apiKey} className="rounded-2xl border border-border px-3 py-2.5 text-sm" placeholder="API key" />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        <Card className="rounded-2xl p-5">
          <div className="mb-5">
            <h2 className="text-xl font-semibold">例會設定</h2>
            <p className="text-sm text-text-2">控制每週 Brief 截止、提醒時間與 BNI Connect baseline。</p>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <label className="grid gap-2 text-sm"><span className="font-medium">提交截止日</span><select name="submission_deadline_day" defaultValue={String(settings.submissionDeadlineDay)} className="rounded-2xl border border-border px-3 py-2.5">
              {dayOptions.map((label, index) => <option key={label} value={String(index)}>{label}</option>)}
            </select></label>
            <label className="grid gap-2 text-sm"><span className="font-medium">提交截止時間</span><input name="submission_deadline_time" type="time" defaultValue={settings.submissionDeadlineTime} className="rounded-2xl border border-border px-3 py-2.5" /></label>
            <label className="grid gap-2 text-sm"><span className="font-medium">提醒日</span><select name="reminder_day" defaultValue={String(settings.reminderDay)} className="rounded-2xl border border-border px-3 py-2.5">
              {dayOptions.map((label, index) => <option key={label} value={String(index)}>{label}</option>)}
            </select></label>
            <label className="grid gap-2 text-sm"><span className="font-medium">提醒時間</span><input name="reminder_time" type="time" defaultValue={settings.reminderTime} className="rounded-2xl border border-border px-3 py-2.5" /></label>
            <label className="grid gap-2 text-sm"><span className="font-medium">BNI Connect 帳號</span><input name="bni_connect_username" defaultValue={settings.bniConnectUsername} className="rounded-2xl border border-border px-3 py-2.5" /></label>
            <label className="grid gap-2 text-sm"><span className="font-medium">BNI Connect 密碼</span><input name="bni_connect_password" type="password" defaultValue={settings.bniConnectPassword} className="rounded-2xl border border-border px-3 py-2.5" /></label>
          </div>
        </Card>
      </form>

      <Card className="rounded-2xl p-5">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-xl font-semibold">同步紀錄</h2>
            <p className="text-sm text-text-2">manual sync 目前走 baseline success flow，後續自動化可沿用這裡的紀錄。</p>
          </div>
          <form action={triggerManualSyncAction} className="flex flex-wrap items-center gap-3">
            <input name="week_date" type="date" defaultValue={new Date().toISOString().slice(0, 10)} className="rounded-2xl border border-border px-3 py-2.5 text-sm" />
            <button type="submit" className="rounded-full border border-border px-4 py-2.5 text-sm font-medium text-text-1">手動同步本週</button>
          </form>
        </div>
        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-surface-2 text-text-2">
              <tr><th className="px-4 py-3">週次</th><th className="px-4 py-3">狀態</th><th className="px-4 py-3">觸發方式</th><th className="px-4 py-3">完成時間</th><th className="px-4 py-3">錯誤</th></tr>
            </thead>
            <tbody>
              {syncLogs.map((log) => (
                <tr key={log.id} className="border-t border-border">
                  <td className="px-4 py-3">{log.week_date}</td>
                  <td className="px-4 py-3">{log.status}</td>
                  <td className="px-4 py-3">{log.trigger_type}</td>
                  <td className="px-4 py-3">{log.synced_at ? new Date(log.synced_at).toLocaleString("zh-TW", { hour12: false }) : "-"}</td>
                  <td className="px-4 py-3 text-text-2">{log.error_message || "-"}</td>
                </tr>
              ))}
              {syncLogs.length === 0 ? <tr><td colSpan={5} className="px-4 py-5 text-center text-sm text-text-2">尚無同步紀錄</td></tr> : null}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
