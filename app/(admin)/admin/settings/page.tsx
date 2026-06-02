import { Card } from "../../../../components/ui/card";
import { triggerManualSyncAction, getAdminSettings, saveAdminSettingsAction } from "../../../../lib/actions/settings";

const providers = [
  { id: "claude", label: "Claude" },
  { id: "gemini", label: "Gemini" },
  { id: "openai", label: "OpenAI" },
] as const;

export default async function AdminSettingsPage({
  searchParams,
}: {
  searchParams?: Promise<{ saved?: string; sync?: string; week?: string }>;
}) {
  const params = await searchParams;
  const { chapter, settings, aiProviders, syncLogs } = await getAdminSettings();

  return (
    <div className="space-y-5">
      <div>
        <p className="text-sm text-text-2">Operational Settings</p>
        <h1 className="text-3xl font-black">系統設定</h1>
        <p className="mt-2 text-sm text-text-2">這裡已接上 chapter settings、AI provider baseline 與 BNI Connect credential baseline。</p>
      </div>

      {params?.saved ? <Card className="rounded-[20px] border-emerald-300 bg-emerald-50 p-4 text-sm text-emerald-900">設定已儲存。</Card> : null}
      {params?.sync ? <Card className="rounded-[20px] border-emerald-300 bg-emerald-50 p-4 text-sm text-emerald-900">已完成 {params.week || "本週"} 的 manual sync baseline。</Card> : null}

      <form action={saveAdminSettingsAction} className="space-y-4">
        <div className="grid gap-4 lg:grid-cols-[1.05fr_0.95fr]">
          <Card className="rounded-[24px] p-5">
            <h2 className="text-xl font-semibold">分會與例會設定</h2>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <label className="grid gap-2 text-sm"><span className="font-medium">分會名稱</span><input name="chapter_name" defaultValue={chapter.name} className="rounded-2xl border border-border px-3 py-2.5" /></label>
              <label className="grid gap-2 text-sm"><span className="font-medium">地區</span><input name="chapter_region" defaultValue={chapter.region || ""} className="rounded-2xl border border-border px-3 py-2.5" /></label>
              <label className="grid gap-2 text-sm md:col-span-2"><span className="font-medium">例會時間</span><input name="meeting_time" defaultValue={settings.meetingTime || ""} className="rounded-2xl border border-border px-3 py-2.5" /></label>
              <label className="grid gap-2 text-sm"><span className="font-medium">提交截止日</span><select name="submission_deadline_day" defaultValue={String(settings.submissionDeadlineDay)} className="rounded-2xl border border-border px-3 py-2.5">
                <option value="0">週一</option><option value="1">週二</option><option value="2">週三</option><option value="3">週四</option><option value="4">週五</option><option value="5">週六</option><option value="6">週日</option>
              </select></label>
              <label className="grid gap-2 text-sm"><span className="font-medium">提交截止時間</span><input name="submission_deadline_time" type="time" defaultValue={settings.submissionDeadlineTime} className="rounded-2xl border border-border px-3 py-2.5" /></label>
              <label className="grid gap-2 text-sm"><span className="font-medium">提醒日</span><select name="reminder_day" defaultValue={String(settings.reminderDay)} className="rounded-2xl border border-border px-3 py-2.5">
                <option value="0">週一</option><option value="1">週二</option><option value="2">週三</option><option value="3">週四</option><option value="4">週五</option><option value="5">週六</option><option value="6">週日</option>
              </select></label>
              <label className="grid gap-2 text-sm"><span className="font-medium">提醒時間</span><input name="reminder_time" type="time" defaultValue={settings.reminderTime} className="rounded-2xl border border-border px-3 py-2.5" /></label>
            </div>
          </Card>

          <Card className="rounded-[24px] p-5">
            <h2 className="text-xl font-semibold">BNI Connect baseline</h2>
            <div className="mt-4 grid gap-4">
              <label className="grid gap-2 text-sm"><span className="font-medium">登入帳號</span><input name="bni_connect_username" defaultValue={settings.bniConnectUsername} className="rounded-2xl border border-border px-3 py-2.5" /></label>
              <label className="grid gap-2 text-sm"><span className="font-medium">登入密碼</span><input name="bni_connect_password" type="password" defaultValue={settings.bniConnectPassword} className="rounded-2xl border border-border px-3 py-2.5" /></label>
              <p className="text-sm text-text-2">目前 baseline 會先保存憑證，weekly brief 提交時建立 pending sync log；完整 Playwright 自動填表會留在後續 phase。</p>
            </div>
          </Card>
        </div>

        <Card className="rounded-[24px] p-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">AI Provider baseline</h2>
              <p className="mt-1 text-sm text-text-2">可切換 active provider；member AI baseline 會讀這裡的設定。</p>
            </div>
          </div>
          <div className="mt-4 grid gap-4 md:grid-cols-3">
            {providers.map((provider) => {
              const row = aiProviders[provider.id];
              return (
                <div key={provider.id} className="rounded-2xl border border-border p-4">
                  <label className="flex items-center gap-2 text-sm font-semibold">
                    <input type="radio" name="active_provider" value={provider.id} defaultChecked={row.isActive || (!aiProviders.claude.isActive && provider.id === "claude")} />
                    {provider.label}
                  </label>
                  <div className="mt-3 grid gap-3">
                    <input name={`${provider.id}_model_name`} defaultValue={row.modelName} className="rounded-2xl border border-border px-3 py-2.5 text-sm" placeholder="Model name" />
                    <input name={`${provider.id}_api_key`} defaultValue={row.apiKey} className="rounded-2xl border border-border px-3 py-2.5 text-sm" placeholder="API key" />
                  </div>
                </div>
              );
            })}
          </div>
          <div className="mt-5 flex justify-end">
            <button type="submit" className="rounded-full bg-primary px-5 py-3 text-sm font-semibold text-white">儲存系統設定</button>
          </div>
        </Card>
      </form>

      <Card className="rounded-[24px] p-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold">最近同步紀錄</h2>
            <p className="mt-1 text-sm text-text-2">manual sync 目前會走 baseline success flow，完整自動化另開 phase。</p>
          </div>
          <form action={triggerManualSyncAction} className="flex items-center gap-3">
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
