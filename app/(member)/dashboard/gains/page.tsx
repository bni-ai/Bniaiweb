import { GainsForm } from "../../../../components/member/gains-form";
import { Card } from "../../../../components/ui/card";
import { getCurrentMember } from "../../../../lib/actions/member-portal";

export default async function GainsPage({ searchParams }: { searchParams?: Promise<{ fail?: string }> }) {
  const params = await searchParams;
  const member = await getCurrentMember();

  return (
    <div className="space-y-5">
      <div>
        <p className="text-sm text-text-2">GAINS Profile</p>
        <h1 className="text-3xl font-black">GAINS 收穫工作表</h1>
      </div>
      <Card className="rounded-[24px] p-5">
        <GainsForm
          initialValues={{
            gains_goals: member?.gains_goals || "",
            gains_accomplishments: member?.gains_accomplishments || "",
            gains_interests: member?.gains_interests || "",
            gains_networks: member?.gains_networks || "",
            gains_skills: member?.gains_skills || "",
          }}
          forceError={params?.fail === "1"}
        />
      </Card>
    </div>
  );
}
