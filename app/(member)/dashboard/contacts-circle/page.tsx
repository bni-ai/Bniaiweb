import { Button } from "../../../../components/ui/button";
import { Card } from "../../../../components/ui/card";
import { deleteMyContactAction, getMyContactsCircle, saveMyContactsCircleAction } from "../../../../lib/actions/members";

const tierLabels = {
  1: "Tier 1 核心圈",
  2: "Tier 2 中層圈",
  3: "Tier 3 外圍圈",
} as const;

export default async function ContactsCirclePage() {
  const contacts = await getMyContactsCircle();
  const rows = [...contacts, { id: "", tier: 1, name: "", relationship: "", industry: "", notes: "" }, { id: "", tier: 2, name: "", relationship: "", industry: "", notes: "" }, { id: "", tier: 3, name: "", relationship: "", industry: "", notes: "" }];

  return (
    <div className="space-y-5">
      <div>
        <p className="text-sm text-text-2">Contacts Circle</p>
        <h1 className="text-3xl font-black">業務人脈圈</h1>
      </div>
      <form action={saveMyContactsCircleAction} className="space-y-4">
        <input type="hidden" name="contacts_total" value={String(rows.length)} />
        {([1, 2, 3] as const).map((tier) => (
          <Card key={tier} className="rounded-[24px] p-5">
            <h2 className="text-lg font-semibold">{tierLabels[tier]}</h2>
            <div className="mt-4 grid gap-4">
              {rows.filter((row) => row.tier === tier).map((contact) => {
                const sourceIndex = rows.indexOf(contact);
                const deleteContact = contact.id ? deleteMyContactAction.bind(null, contact.id) : null;
                return (
                  <div className="grid gap-3 rounded-2xl border border-border p-4 md:grid-cols-2" key={`${tier}-${sourceIndex}-${contact.id || "new"}`}>
                    <input type="hidden" name={`contact_id_${sourceIndex}`} value={contact.id || ""} />
                    <input type="hidden" name={`contact_tier_${sourceIndex}`} value={String(tier)} />
                    <input name={`contact_name_${sourceIndex}`} defaultValue={contact.name || ""} placeholder="姓名" className="rounded-2xl border border-border px-3 py-2.5" />
                    <input name={`contact_relationship_${sourceIndex}`} defaultValue={contact.relationship || ""} placeholder="關係" className="rounded-2xl border border-border px-3 py-2.5" />
                    <input name={`contact_industry_${sourceIndex}`} defaultValue={contact.industry || ""} placeholder="產業" className="rounded-2xl border border-border px-3 py-2.5" />
                    <textarea name={`contact_notes_${sourceIndex}`} defaultValue={contact.notes || ""} placeholder="備註" className="min-h-24 rounded-2xl border border-border px-3 py-2.5" />
                    {contact.id ? (
                      <div className="md:col-span-2">
                        <button
                          type="submit"
                          formAction={deleteContact!}
                          formNoValidate
                          className="rounded-full border border-border px-4 py-2 text-sm"
                        >
                          刪除此聯絡人
                        </button>
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </div>
          </Card>
        ))}
        <div><Button type="submit" className="rounded-full px-5">儲存人脈圈</Button></div>
      </form>
    </div>
  );
}
