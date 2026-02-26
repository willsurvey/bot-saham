import { Bot } from 'grammy';
import { getUsers, getGroups } from '../lib/kv-store.js';
import { fetchScreeningData } from '../lib/api-fetcher.js';
import { formatBidikanMessages, formatErrorMessage } from '../lib/message-mapper.js';

const bot = new Bot(process.env.BOT_TOKEN);

export async function GET() {
  try {
    console.log('Cron job started');

    const result = await fetchScreeningData();

    if (!result.success) {
      console.error('API fetch failed:', result.error);
      await sendToAllUsers(formatErrorMessage());
      return new Response(
        JSON.stringify({ success: false, error: result.error }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const messages = formatBidikanMessages(result.data);
    console.log(`Formatted into ${messages.length} messages`);

    await sendToAllUsersMultiple(messages);

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

async function sendToAllUsersMultiple(messages) {
  const users = await getUsers();
  const groups = await getGroups();
  const allChats = [...users, ...groups];

  console.log(`Sending to ${allChats.length} chats`);

  for (const chatId of allChats) {
    try {
      for (const message of messages) {
        await bot.api.sendMessage(chatId, message, { parse_mode: 'Markdown' });
        await sleep(300);
      }
      console.log(`✅ Sent to ${chatId}`);
    } catch (err) {
      console.error(`❌ Failed to send to ${chatId}:`, err.message);
    }
  }
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}