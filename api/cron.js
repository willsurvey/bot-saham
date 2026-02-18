import { Bot } from 'grammy';
import { getUsers, getGroups } from '../lib/kv-store.js';
import { fetchScreeningData } from '../lib/api-fetcher.js';
import { formatBidikanMessage, formatErrorMessage } from '../lib/message-mapper.js';

const bot = new Bot(process.env.BOT_TOKEN);

export async function GET() {
  try {
    console.log('Cron job started');

    // Fetch data dari API
    const result = await fetchScreeningData();

    if (!result.success) {
      console.error('API fetch failed:', result.error);
      await sendToAllUsers(formatErrorMessage());
      return new Response(
        JSON.stringify({ success: false, error: result.error }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Format pesan
    const message = formatBidikanMessage(result.data);
    console.log('Message formatted successfully');

    // Kirim ke semua user
    await sendToAllUsers(message);

    console.log('Cron job completed successfully');
    return new Response(
      JSON.stringify({ success: true, message: 'Cron job completed' }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Cron job error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

// Helper: Kirim pesan ke semua user dan grup
async function sendToAllUsers(message) {
  const users = await getUsers();
  const groups = await getGroups();
  const allChats = [...users, ...groups];

  console.log(`Sending to ${allChats.length} chats`);

  let successCount = 0;
  let failCount = 0;

  for (const chatId of allChats) {
    try {
      await bot.api.sendMessage(chatId, message, { parse_mode: 'Markdown' });
      successCount++;
    } catch (err) {
      console.error(`Failed to send to ${chatId}:`, err.message);
      failCount++;
    }
  }

  console.log(`Sent: ${successCount} success, ${failCount} failed`);
}