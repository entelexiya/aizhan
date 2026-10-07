// Загрузка фото объекта. Админка уменьшает снимок в браузере и шлёт его сюда,
// поэтому в запрос всегда помещается даже фото с телефона.
import { put } from '@vercel/blob';
import { blobToken } from './listings.js';

export const config = { api: { bodyParser: { sizeLimit: '6mb' } } };

const TYPES = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp' };

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Метод не поддерживается' });
  }

  const expected = process.env.ADMIN_PASSWORD;
  if (!expected || req.headers['x-admin-password'] !== expected) {
    return res.status(401).json({ error: 'Неверный пароль' });
  }

  const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
  const match = /^data:(image\/(?:jpeg|png|webp));base64,([A-Za-z0-9+/=]+)$/.exec(body.file || '');
  if (!match) return res.status(400).json({ error: 'Нужен файл JPG, PNG или WEBP' });

  const buffer = Buffer.from(match[2], 'base64');
  if (buffer.length > 5 * 1024 * 1024) return res.status(400).json({ error: 'Фото слишком большое' });

  try {
    const blob = await put(`photos/${Date.now()}.${TYPES[match[1]]}`, buffer, {
      token: blobToken(),
      access: 'public',
      contentType: match[1],
      addRandomSuffix: true
    });
    return res.status(200).json({ url: blob.url });
  } catch (e) {
    if (/No token found|BLOB_READ_WRITE_TOKEN/i.test(e.message)) {
      return res.status(500).json({ error: 'Хранилище не подключено. На Vercel: Storage → Blob → Connect, затем Deployments → Redeploy.' });
    }
    return res.status(500).json({ error: 'Не удалось загрузить фото: ' + e.message });
  }
}
