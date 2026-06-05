export const runtime = 'nodejs';

import { verifyKey } from 'discord-interactions';
import { NextRequest, NextResponse } from 'next/server';

const DISCORD_PUBLIC_KEY = process.env.DISCORD_PUBLIC_KEY!;
const GITHUB_TOKEN = process.env.GITHUB_TOKEN!;

export async function POST(req: NextRequest) {
  const signature = req.headers.get('x-signature-ed25519') ?? '';
  const timestamp = req.headers.get('x-signature-timestamp') ?? '';
  const rawBody = await req.text();

  const isValid = verifyKey(Buffer.from(rawBody), signature, timestamp, DISCORD_PUBLIC_KEY);
  if (!isValid) {
    return new NextResponse('Bad request signature', { status: 401 });
  }

  const body = JSON.parse(rawBody);

  // Type 1: PING
  if (body.type === 1) {
    return NextResponse.json({ type: 1 });
  }

  // Type 2: APPLICATION_COMMAND
  if (body.type === 2 && body.data?.name === 'claude') {
    const task: string = body.data.options?.[0]?.value ?? '';
    const channelId: string = body.channel_id ?? '';

    // Trigger GitHub Actions workflow (non-blocking)
    fetch(
      'https://api.github.com/repos/bni-ai/Bniaiweb/actions/workflows/claude-agent.yml/dispatches',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${GITHUB_TOKEN}`,
          Accept: 'application/vnd.github+json',
          'Content-Type': 'application/json',
          'X-GitHub-Api-Version': '2022-11-28',
        },
        body: JSON.stringify({
          ref: 'main',
          inputs: { task, channel_id: channelId },
        }),
      }
    ).catch((err) => console.error('GitHub dispatch failed:', err));

    return NextResponse.json({
      type: 4,
      data: {
        content: `⏳ Claude Code 啟動中...\n任務：\`${task}\`\n完成後結果會發到此頻道。`,
        flags: 64,
      },
    });
  }

  return new NextResponse('Unknown command', { status: 400 });
}
