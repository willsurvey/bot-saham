import { Bot } from 'grammy';
import { addUser, addGroup } from '../lib/kv-store.js';

// Inisialisasi bot
const bot = new Bot(process.env.BOT_TOKEN);

// Handler untuk semua pesan
bot.on('message', async (ctx) => {
  const chatId = ctx.chat.id;
  
  try {
    if (ctx.chat.type === 'private') {
      // Simpan user ID
      await addUser(chatId);
      
      await ctx.reply(
        `✅ Anda terdaftar untuk menerima update trading plan!\n\n` +
        `ID Anda: \`${chatId}\`\n\n` +
        `Anda akan menerima notifikasi saat admin upload setup saham baru.`,
        { parse_mode: 'Markdown' }
      );
    } else if (ctx.chat.type === 'group' || ctx.chat.type === 'supergroup') {
      // Simpan grup ID
      await addGroup(chatId);
      
      await ctx.reply(
        `✅ Grup ini terdaftar untuk menerima update trading plan!\n\n` +
        `Grup ID: \`${chatId}\``,
        { parse_mode: 'Markdown' }
      );
    }
  } catch (error) {
    console.error('Error in message handler:', error);
    // Jangan throw error, biar tidak crash
  }
});

// Webhook handler untuk Vercel
export async function POST(req) {
  try {
    const body = await req.json();
    await bot.handle(body);
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