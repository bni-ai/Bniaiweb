import { Button } from "../../../../components/ui/button";
import { Card } from "../../../../components/ui/card";
import { MemberProfileCard } from "../../../../components/member/profile-card";
import { deleteMyProductImageAction, getMyProductImages, updateMyProfileAction, uploadMyProductImagesAction, uploadMyProfilePhotoAction } from "../../../../lib/actions/members";
import { getMemberDashboardData } from "../../../../lib/actions/member-portal";

export default async function MemberProfilePage({
  searchParams,
}: {
  searchParams?: Promise<{ photo?: string; products?: string }>;
}) {
  const params = await searchParams;
  const { member, brief } = await getMemberDashboardData();
  const productImages = await getMyProductImages();

  return (
    <div className="space-y-5">
      <div>
        <p className="text-sm text-text-2">公開個人資料</p>
        <h1 className="text-3xl font-black">個人資料</h1>
        <p className="mt-2 text-sm text-text-2">管理你的公開名片與引薦素材，這裡只開放會員本人可編輯的欄位。</p>
      </div>
      {params?.photo ? <Card className="rounded-[20px] border-emerald-300 bg-emerald-50 p-4 text-sm text-emerald-900">頭像已更新。</Card> : null}
      {params?.products ? <Card className="rounded-[20px] border-emerald-300 bg-emerald-50 p-4 text-sm text-emerald-900">產品圖庫已更新。</Card> : null}
      
      {member && (
        <Card className="rounded-[28px] p-6 border border-border bg-surface-1 shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
          <h2 className="text-xl font-black text-slate-800 mb-4">公開名片與簡報預覽</h2>
          <MemberProfileCard member={member as unknown as Parameters<typeof MemberProfileCard>[0]["member"]} brief={brief} />
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-[1fr_0.95fr]">
        <Card className="rounded-[24px] p-5">
          <h2 className="text-xl font-semibold">公開名片</h2>
          <form action={updateMyProfileAction} className="mt-5 grid gap-4 md:grid-cols-2">
            <label className="grid gap-2 text-sm"><span className="font-medium">中文姓名</span><input name="chinese_name" defaultValue={member?.chinese_name || ""} className="rounded-2xl border border-border px-3 py-2.5" /></label>
            <label className="grid gap-2 text-sm"><span className="font-medium">登入 Email</span><input disabled defaultValue={member?.email || ""} className="rounded-2xl border border-border bg-surface px-3 py-2.5 text-text-2" /></label>
            <label className="grid gap-2 text-sm"><span className="font-medium">英文姓名</span><input name="english_name" defaultValue={member?.english_name || ""} className="rounded-2xl border border-border px-3 py-2.5" /></label>
            <label className="grid gap-2 text-sm"><span className="font-medium">LINE 名稱</span><input name="line_name" defaultValue={member?.line_name || ""} className="rounded-2xl border border-border px-3 py-2.5" /></label>
            <label className="grid gap-2 text-sm"><span className="font-medium">專業名稱</span><input name="specialty_title" defaultValue={member?.specialty_title || ""} className="rounded-2xl border border-border px-3 py-2.5" /></label>
            <label className="grid gap-2 text-sm"><span className="font-medium">公司名稱</span><input name="company_name" defaultValue={member?.company_name || ""} className="rounded-2xl border border-border px-3 py-2.5" /></label>
            <label className="grid gap-2 text-sm md:col-span-2"><span className="font-medium">專業描述</span><textarea name="specialty_description" defaultValue={member?.specialty_description || ""} className="min-h-28 rounded-2xl border border-border px-3 py-2.5" /></label>
            <label className="grid gap-2 text-sm"><span className="font-medium">一般引薦</span><textarea name="general_referral" defaultValue={member?.general_referral || ""} className="min-h-24 rounded-2xl border border-border px-3 py-2.5" /></label>
            <label className="grid gap-2 text-sm"><span className="font-medium">理想引薦</span><textarea name="ideal_referral" defaultValue={member?.ideal_referral || ""} className="min-h-24 rounded-2xl border border-border px-3 py-2.5" /></label>
            <label className="grid gap-2 text-sm md:col-span-2"><span className="font-medium">夢想引薦</span><textarea name="dream_referral" defaultValue={member?.dream_referral || ""} className="min-h-24 rounded-2xl border border-border px-3 py-2.5" /></label>
            <label className="grid gap-2 text-sm"><span className="font-medium">公司地址</span><input name="company_address" defaultValue={member?.company_address || ""} className="rounded-2xl border border-border px-3 py-2.5" /></label>
            <label className="grid gap-2 text-sm"><span className="font-medium">產業年資</span><input name="industry_experience_years" type="number" defaultValue={member?.industry_experience_years ?? ""} className="rounded-2xl border border-border px-3 py-2.5" /></label>
            <label className="grid gap-2 text-sm md:col-span-2"><span className="font-medium">過往經歷</span><textarea name="previous_career" defaultValue={member?.previous_career || ""} className="min-h-24 rounded-2xl border border-border px-3 py-2.5" /></label>
            <label className="grid gap-2 text-sm md:col-span-2"><span className="font-medium">照片 URL</span><input name="photo_url" defaultValue={member?.photo_url || ""} className="rounded-2xl border border-border px-3 py-2.5" /></label>
            <div className="md:col-span-2"><Button type="submit" className="rounded-full px-5">儲存個人資料</Button></div>
          </form>
        </Card>
        <div className="space-y-4">
          <Card className="rounded-[24px] p-5">
            <h2 className="text-xl font-semibold">頭像上傳</h2>
            <div className="mt-4 flex items-start gap-4">
              {member?.photo_url ? <img src={member.photo_url} alt={member.chinese_name} className="h-24 w-24 rounded-3xl object-cover" /> : <div className="flex h-24 w-24 items-center justify-center rounded-3xl border border-dashed border-border text-xs text-text-2">尚未上傳</div>}
              <form action={uploadMyProfilePhotoAction} className="flex-1 space-y-3">
                <input name="photo_file" type="file" accept="image/jpeg,image/png" className="block w-full text-sm" required />
                <p className="text-xs text-text-2">JPG / PNG，5MB 內。上傳後會同步更新名片與簡報頭像。</p>
                <Button type="submit" className="rounded-full px-5">上傳頭像</Button>
              </form>
            </div>
          </Card>
          <Card className="rounded-[24px] p-5">
            <h2 className="text-xl font-semibold">產品圖庫</h2>
            <form action={uploadMyProductImagesAction} className="mt-4 space-y-3">
              <input name="product_files" type="file" accept="image/jpeg,image/png" multiple className="block w-full text-sm" />
              <p className="text-xs text-text-2">一次可上傳多張，總數最多 10 張。這批素材後續可供簡報與短講使用。</p>
              <Button type="submit" variant="secondary" className="rounded-full px-5">上傳產品圖</Button>
            </form>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {productImages.map((image) => (
                <div key={image.id} className="rounded-2xl border border-border p-3">
                  <img src={image.public_url} alt="產品圖" className="h-32 w-full rounded-2xl object-cover" />
                  <form action={deleteMyProductImageAction.bind(null, image.id)} className="mt-3">
                    <Button type="submit" variant="ghost" className="rounded-full border border-border px-4">刪除此圖</Button>
                  </form>
                </div>
              ))}
              {productImages.length === 0 ? <div className="rounded-2xl border border-dashed border-border p-4 text-sm text-text-2">目前還沒有產品圖。</div> : null}
            </div>
          </Card>
          <Card className="rounded-[24px] p-5">
            <h2 className="text-xl font-semibold">模組入口</h2>
            <div className="mt-4 space-y-3 text-sm">
              <a href="/dashboard/gains" className="block rounded-2xl border border-border p-4">GAINS 收穫工作表</a>
              <a href="/dashboard/top-clients" className="block rounded-2xl border border-border p-4">前十名客戶</a>
              <a href="/dashboard/contacts-circle" className="block rounded-2xl border border-border p-4">業務人脈圈規劃</a>
              <a href="/dashboard/one-on-one" className="block rounded-2xl border border-dashed border-border p-4">一對一可用時段與預約紀錄</a>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
