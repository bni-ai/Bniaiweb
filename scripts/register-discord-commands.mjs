// 一次性腳本：把 slash command 註冊到 Discord Global
// 用法：node scripts/register-discord-commands.mjs

const BOT_TOKEN = process.env.DISCORD_BOT_TOKEN;
const APPLICATION_ID = process.env.DISCORD_APPLICATION_ID;

if (!BOT_TOKEN || !APPLICATION_ID) {
  console.error('缺少環境變數：DISCORD_BOT_TOKEN 或 DISCORD_APPLICATION_ID');
  process.exit(1);
}

const commands = [
  {
    name: 'claude',
    description: '讓 Claude Code Agent 執行任務',
    options: [
      {
        name: 'task',
        description: '任務描述',
        type: 3, // STRING
        required: true,
      },
    ],
  },
];

const url = `https://discord.com/api/v10/applications/${APPLICATION_ID}/commands`;

const response = await fetch(url, {
  method: 'PUT',
  headers: {
    Authorization: `Bot ${BOT_TOKEN}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(commands),
});

if (!response.ok) {
  const error = await response.text();
  console.error('註冊失敗：', response.status, error);
  process.exit(1);
}

const data = await response.json();
console.log('✅ 已註冊指令：', data.map((c) => c.name).join(', '));
