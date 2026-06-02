import { Card } from "../../../../components/ui/card";
import { getGuestContentItems } from "../../../../lib/actions/guest-portal";

export default async function GuestContentPage() {
  const items = await getGuestContentItems();

  return (
    <div className="space-y-5">
      <div>
        <p className="text-sm text-text-2">Article / Video</p>
        <h1 className="text-3xl font-black">來賓文章與影片</h1>
        <p className="mt-2 text-sm text-text-2">公開訪客只會看到公開內容；登入來賓可再看到來賓限定內容。</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {items.map((item) => (
          <Card key={item.id} className="p-5">
            <div className="mb-3 flex items-center justify-between gap-3">
              <h2 className="text-xl font-bold">{item.title}</h2>
              <span className="rounded-full bg-surface-2 px-3 py-1 text-xs">{item.video_url ? "影片" : "文章"}</span>
            </div>
            {item.summary ? <p className="text-sm leading-6 text-text-2">{item.summary}</p> : null}
            {item.video_url ? <a className="mt-4 block text-sm font-semibold text-primary" href={item.video_url}>開啟影片</a> : null}
            {item.body ? <p className="mt-4 whitespace-pre-line text-sm leading-6">{item.body}</p> : null}
          </Card>
        ))}
      </div>
      {items.length === 0 ? <Card className="p-6 text-sm text-text-2">目前尚未發布來賓文章或影片。</Card> : null}
    </div>
  );
}
