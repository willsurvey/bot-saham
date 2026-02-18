import { Bot } from 'grammy';

// Import library baru untuk fitur bidikan
import { fetchScreeningData } from '../lib/api-fetcher.js';
import { formatBidikanMessage, formatErrorMessage } from '../lib/message-mapper.js';

// Import untuk user/group registration
import { addUser, addGroup } from '../lib/kv-store.js';

// Initialize bot with botInfo for serverless
const bot = new Bot(process.env.BOT_TOKEN, {
  botInfo: {
    id: 0,
    is_bot: true,
    first_name: 'Bot Saham',
    username: 'bcbywill_bot',
    can_join_groups: true,
    can_read_all_group_messages: false,
    supports_inline_queries: false,
  },
});

// ✅ HANDLER COMMAND (DULUAN - sebelum message handler)
bot.command('bidikan', async (ctx) => {
  try {
    await ctx.reply('⏳ Mengambil data screening...');

    const result = await fetchScreeningData();

    if (!result.success) {
      await ctx.reply(formatErrorMessage(), { parse_mode: 'Markdown' });
      return;
    }

    const message = formatBidikanMessage(result.data);
    await ctx.reply(message, { parse_mode: 'Markdown' });
  } catch (error) {
    console.error('/bidikan error:', error);
    await ctx.reply(formatErrorMessage(), { parse_mode: 'Markdown' });
  }
});

// Message handler (untuk auto-save user/group saat chat)
bot.on('message', async (ctx) => {
  const chatId = ctx.chat.id;
  
  try {
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
  } catch (error) {
    console.error('Message handler error:', error);
  }
});

// Vercel Serverless Handler (untuk webhook Telegram)
export async function POST(req) {
  try {
    const body = await req.json();
    await bot.handleUpdate(body);
    return new Response('OK', { status: 200 });
  } catch (error) {
    console.error('Webhook error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

// Test endpoint
export async function GET() {
  return new Response(
    JSON.stringify({ 
      status: 'Bot is running! 🤖',
      tokenSet: !!process.env.BOT_TOKEN 
    }), 
    { 
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    }
  );
}