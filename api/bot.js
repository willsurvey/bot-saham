import { Bot } from 'grammy';
import { addUser, addGroup } from '../lib/kv-store.js';

const bot = new Bot(process.env.BOT_TOKEN);

bot.on('message', async (ctx) => {
  const chatId = ctx.chat.id;
  
  if (ctx.chat.type === 'private') {
    await addUser(chatId);
    await ctx.reply(
      `✅ Anda terdaftar untuk menerima update trading plan!\n\n` +
      `ID Anda: \`${chatId}\`\n\n` +
      `Anda akan menerima notifikasi saat admin upload setup saham baru.`,
      { parse_mode: 'Markdown' }
    );
  } else if (ctx.chat.type === 'group' || ctx.chat.type === 'supergroup') {
    await addGroup(chatId);
    await ctx.reply(
      `✅ Grup ini terdaftar untuk menerima update trading plan!\n\n` +
      `Grup ID: \`${chatId}\``,
      { parse_mode: 'Markdown' }
    );
  }
});

export async function POST(req) {
  const body = await req.json();
  await bot.handle(body);
  return new Response('OK', { status: 200 });
}

export async function GET() {
  return new Response('Bot is running! 🤖', { status: 200 });
}