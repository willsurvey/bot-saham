import { Bot } from 'grammy';

// Check if BOT_TOKEN exists
if (!process.env.BOT_TOKEN) {
  console.error('BOT_TOKEN is not set!');
}

// Initialize bot
const bot = new Bot(process.env.BOT_TOKEN);

// Message handler
bot.on('message', async (ctx) => {
  const chatId = ctx.chat.id;
  
  try {
    if (ctx.chat.type === 'private') {
      const { addUser } = await import('../lib/kv-store.js');
      await addUser(chatId);
      
      await ctx.reply(
        `✅ Anda terdaftar untuk menerima update trading plan!\n\n` +
        `ID Anda: \`${chatId}\`\n\n` +
        `Anda akan menerima notifikasi saat admin upload setup saham baru.`,
        { parse_mode: 'Markdown' }
      );
    } else if (ctx.chat.type === 'group' || ctx.chat.type === 'supergroup') {
      const { addGroup } = await import('../lib/kv-store.js');
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

// Vercel Serverless Handler
export async function POST(req) {
  try {
    console.log('Webhook received');
    
    const body = await req.json();
    console.log('Request body:', JSON.stringify(body).substring(0, 100));
    
    // Handle the update
    await bot.handleUpdate(body);
    
    console.log('Webhook processed successfully');
    return new Response('OK', { status: 200 });
  } catch (error) {
    console.error('Webhook error:', error);
    console.error('Error stack:', error.stack);
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
      tokenSet: !!process.env.BOT_TOKEN,
      tokenLength: process.env.BOT_TOKEN?.length || 0
    }), 
    { 
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    }
  );
}