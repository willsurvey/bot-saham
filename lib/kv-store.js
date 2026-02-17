import { createClient } from '@vercel/kv';

const kv = createClient({
  url: process.env.KV_URL,
  token: process.env.KV_REST_API_TOKEN,
});

export async function addUser(chatId) {
  const users = await getUsers();
  if (!users.includes(String(chatId))) {
    users.push(String(chatId));
    await kv.set('telegram_users', users);
  }
  return users;
}

export async function getUsers() {
  const users = await kv.get('telegram_users');
  return users || [];
}

export async function addGroup(chatId) {
  const groups = await getGroups();
  if (!groups.includes(String(chatId))) {
    groups.push(String(chatId));
    await kv.set('telegram_groups', groups);
  }
  return groups;
}

export async function getGroups() {
  const groups = await kv.get('telegram_groups');
  return groups || [];
}