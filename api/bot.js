import { Bot } from 'grammy';

// Inisialisasi bot dengan token dari environment variable
const bot = new Bot(process.env.BOT_TOKEN);

// Handler untuk pesan (auto-save user & grup)
bot.on('message', async (ctx) => {
  try {
    const chatId = ctx.chat.id;
    
    if (ctx.chat.type === 'private') {
      // Simpan user ID ke database
      const { addUser } = await import('../lib/kv-store.js');
      await addUser(chatId);
      
      await ctx.reply(
        `✅ Anda terdaftar untuk menerima update trading plan!\n\n` +
        `ID Anda: \`${chatId}\`\n\n` +
        `Anda akan menerima notifikasi saat admin upload setup saham baru.`,
        { parse_mode: 'Markdown' }
      );
    } else if (ctx.chat.type === 'group' || ctx.chat.type === 'supergroup') {
      // Simpan grup ID ke database
      const { addGroup } = await import('../lib/kv-store.js');
      await addGroup(chatId);
      
      await ctx.reply(
        `✅ Grup ini terdaftar untuk menerima update trading plan!\n\n` +
        `Grup ID: \`${chatId}\``,
        { parse_mode: 'Markdown' }
      );
    }
  } catch (error) {
    console.error('Error handling message:', error);
  }
});

// Export handler untuk Vercel Serverless
export async function POST(req) {
  try {
    // Cek apakah BOT_TOKEN ada
    if (!process.env.BOT_TOKEN) {
      console.error('BOT_TOKEN tidak ditemukan!');
      return new Response(
        JSON.stringify({ error: 'BOT_TOKEN tidak ditemukan' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Parse body request dari Telegram
    const body = await req.json();
    
    // Process update dari Telegram
    await bot.handle(body);
    
    return new Response('OK', { status: 200 });
  } catch (error) {
    console.error('Error in bot webhook:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

// Handler untuk test GET request
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