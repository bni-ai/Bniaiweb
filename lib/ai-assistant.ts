export type AiProvider = "claude" | "gemini" | "openai";

export type MemberSearchRecord = {
  chinese_name: string;
  specialty_title: string | null;
  specialty_description: string | null;
  company_name: string | null;
  committee: string | null;
};

export function extractMemberQueryKeywords(query: string) {
  const normalized = query.trim();
  if (!normalized) return [];
  const patterns = [
    /專業(?:是|做|有)?\s*([\u4e00-\u9fffA-Za-z0-9\- ]{1,30})/,
    /專長(?:是|做|有)?\s*([\u4e00-\u9fffA-Za-z0-9\- ]{1,30})/,
    /找\s*([\u4e00-\u9fffA-Za-z0-9\- ]{1,30})/,
    /認識\s*([\u4e00-\u9fffA-Za-z0-9\- ]{1,30})/,
  ];
  for (const pattern of patterns) {
    const match = normalized.match(pattern);
    if (match?.[1]) return [match[1].trim()];
  }
  return normalized
    .replace(/[？?。！，,]/g, " ")
    .split(/\s+/)
    .map((token) => token.trim())
    .filter((token) => token.length >= 2)
    .slice(0, 3);
}

export function searchMembersByQuery(query: string, members: MemberSearchRecord[]) {
  const keywords = extractMemberQueryKeywords(query);
  if (!keywords.length) return [];
  return members.filter((member) => {
    const haystack = [member.chinese_name, member.specialty_title, member.specialty_description, member.company_name, member.committee]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();
    return keywords.every((keyword) => haystack.includes(keyword.toLowerCase()));
  });
}

export function buildAiMemberResponse(query: string, provider: AiProvider, members: MemberSearchRecord[]) {
  const matches = searchMembersByQuery(query, members);
  if (!matches.length) {
    return {
      intent: "member_lookup",
      answer: `目前找不到符合「${query}」的會員。可以改問專業、公司或委員會關鍵字。`,
      matches,
      provider,
      fallbackUsed: false,
    };
  }
  const lines = matches.slice(0, 5).map((member) => {
    const specialty = member.specialty_title || "未填專業";
    const description = member.specialty_description || member.company_name || "尚未補充說明";
    return `${member.chinese_name}｜${specialty}｜${description}`;
  });
  return {
    intent: "member_lookup",
    answer: `目前由 ${provider.toUpperCase()} baseline 回覆，找到 ${matches.length} 位：\n${lines.join("\n")}`,
    matches,
    provider,
    fallbackUsed: false,
  };
}
