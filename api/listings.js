// Объекты хранятся в Vercel Blob одним файлом listings.json.
// GET — отдаёт список всем (сайт читает его при загрузке).
// POST — сохраняет список, только с правильным паролем (переменная ADMIN_PASSWORD).
import { put, list } from '@vercel/blob';

const FILE = 'listings.json';

function passwordOk(req) {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) return false;
  const given = req.headers['x-admin-password'];
  return typeof given === 'string' && given === expected;
}

// Понятное объяснение вместо английской ошибки библиотеки
export function storageError(e) {
  if (/No token found|BLOB_READ_WRITE_TOKEN/i.test(e.message)) {
    return 'Хранилище не подключено. На Vercel: Storage → Blob → Connect, затем Deployments → Redeploy.';
  }
  return 'Не удалось сохранить: ' + e.message;
}

async function currentUrl() {
  const { blobs } = await list({ prefix: FILE, limit: 1 });
  return blobs.length ? blobs[0].url : null;
}

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');

  if (req.method === 'GET') {
    try {
      const url = await currentUrl();
      if (!url) return res.status(200).json({ listings: [] });
      const data = await fetch(`${url}?t=${Date.now()}`, { cache: 'no-store' }).then(r => r.json());
      return res.status(200).json({ listings: Array.isArray(data.listings) ? data.listings : [] });
    } catch {
      return res.status(200).json({ listings: [] });
    }
  }

  if (req.method === 'POST') {
    if (!passwordOk(req)) return res.status(401).json({ error: 'Неверный пароль' });

    const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
    if (body.verify) return res.status(200).json({ ok: true }); // проверка пароля при входе в админку
    if (!Array.isArray(body.listings)) return res.status(400).json({ error: 'Нужен список объектов' });
    if (body.listings.length > 100) return res.status(400).json({ error: 'Слишком много объектов' });

    const clean = body.listings.map(l => ({
      title: String(l.title || '').slice(0, 120),
      district: String(l.district || '').slice(0, 160),
      rooms: String(l.rooms || '').slice(0, 10),
      area: String(l.area || '').slice(0, 10),
      floor: String(l.floor || '').slice(0, 20),
      price: Number(l.price) || 0,
      tag: String(l.tag || '').slice(0, 30),
      image: String(l.image || '').slice(0, 600),
      url: String(l.url || '').slice(0, 600)
    }));

    try {
      await put(FILE, JSON.stringify({ listings: clean }, null, 2), {
        access: 'public',
        contentType: 'application/json',
        addRandomSuffix: false,
        allowOverwrite: true
      });
      return res.status(200).json({ ok: true, count: clean.length });
    } catch (e) {
      return res.status(500).json({ error: storageError(e) });
    }
  }

  res.setHeader('Allow', 'GET, POST');
  return res.status(405).json({ error: 'Метод не поддерживается' });
}
