/**
 * TF Widgets — YouTube: бесплатные данные без API-ключа (Cloudflare Pages Function)
 *
 *   GET /api/yt?channel=UCxxxxxxxxxxxxxxxxxxxxxx   → последние видео канала (официальная RSS-лента YouTube, до 15 шт.)
 *   GET /api/yt?videos=ID1,ID2,...                 → названия и автор для выбранных видео (oEmbed)
 *   GET /api/yt?resolve=https://youtube.com/@name  → находит ID канала по ссылке или @handle (для конфигуратора)
 *
 * Ответы кэшируются на краю Cloudflare (лента 1 час, названия 1 день), так что YouTube дёргается редко,
 * а бесплатного лимита Pages Functions (100 000 запросов в день) хватает с большим запасом.
 */

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Accept',
};
const UA = { 'User-Agent': 'Mozilla/5.0 (compatible; TFWidgets/2.0)', 'Accept-Language': 'en' };
const CHANNEL_RE = /^UC[\w-]{22}$/;
const VIDEO_RE = /^[\w-]{11}$/;

export async function onRequestOptions() {
  return new Response(null, { status: 204, headers: { ...CORS, 'Access-Control-Max-Age': '86400' } });
}

export async function onRequestGet(context) {
  const { request } = context;
  const url = new URL(request.url);

  // одинаковые запросы отдаём из кэша Cloudflare
  const cache = caches.default;
  const cacheKey = new Request(url.origin + url.pathname + '?' + [...url.searchParams].sort().map(([k, v]) => k + '=' + v).join('&'));
  const hit = await cache.match(cacheKey);
  if (hit) return hit;

  let body, ttl, status = 200;
  try {
    if (url.searchParams.has('channel')) {
      const id = url.searchParams.get('channel');
      if (!CHANNEL_RE.test(id)) return json({ error: 'bad channel id' }, 400, 60);
      body = await channelFeed(id);
      ttl = 3600;
    } else if (url.searchParams.has('videos')) {
      const ids = url.searchParams.get('videos').split(',').map(s => s.trim()).filter(s => VIDEO_RE.test(s)).slice(0, 24);
      if (!ids.length) return json({ error: 'no valid video ids' }, 400, 60);
      body = { videos: await Promise.all(ids.map(videoMeta)) };
      ttl = 86400;
    } else if (url.searchParams.has('resolve')) {
      body = await resolveChannel(url.searchParams.get('resolve'));
      ttl = 86400;
    } else {
      return json({ error: 'use ?channel=, ?videos= or ?resolve=' }, 400, 60);
    }
  } catch (e) {
    return json({ error: String(e && e.message || e) }, 502, 120);
  }
  const res = json(body, status, ttl);
  context.waitUntil(cache.put(cacheKey, res.clone()));
  return res;
}

function json(obj, status, ttl) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { ...CORS, 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'public, max-age=' + (ttl || 60) },
  });
}

/* ---------- лента канала (RSS/Atom) ---------- */
async function channelFeed(channelId) {
  const r = await fetch('https://www.youtube.com/feeds/videos.xml?channel_id=' + channelId, { headers: UA, cf: { cacheTtl: 1800 } });
  if (!r.ok) throw new Error('youtube feed HTTP ' + r.status);
  return parseFeed(await r.text());
}

function parseFeed(xml) {
  const channelName = decode(pick(xml.split('<entry>')[0], /<title>([\s\S]*?)<\/title>/));
  const videos = [];
  const entries = xml.split('<entry>').slice(1);
  for (const e of entries) {
    const id = pick(e, /<yt:videoId>([\w-]{11})<\/yt:videoId>/);
    if (!id) continue;
    const link = pick(e, /<link rel="alternate" href="([^"]+)"/) || '';
    videos.push({
      id,
      title: decode(pick(e, /<title>([\s\S]*?)<\/title>/) || ''),
      published: pick(e, /<published>([^<]+)<\/published>/) || '',
      views: Number(pick(e, /<media:statistics views="(\d+)"/)) || 0,
      short: /\/shorts\//.test(link),
    });
  }
  return { channelName, videos };
}

/* ---------- названия выбранных видео (oEmbed) ---------- */
async function videoMeta(id) {
  try {
    const r = await fetch('https://www.youtube.com/oembed?format=json&url=' + encodeURIComponent('https://www.youtube.com/watch?v=' + id), { headers: UA, cf: { cacheTtl: 86400 } });
    if (!r.ok) return { id, title: '', author: '', unavailable: r.status === 404 || r.status === 401 };
    const d = await r.json();
    return { id, title: d.title || '', author: d.author_name || '', authorUrl: d.author_url || '' };
  } catch (e) {
    return { id, title: '', author: '' };
  }
}

/* ---------- ссылка / @handle → ID канала ---------- */
async function resolveChannel(input) {
  let s = String(input || '').trim();
  if (CHANNEL_RE.test(s)) return { channelId: s };
  let m = s.match(/youtube\.com\/channel\/(UC[\w-]{22})/i);
  if (m) return { channelId: m[1] };
  if (/^@[\w.-]{2,100}$/.test(s)) s = 'https://www.youtube.com/' + s;
  if (!/^https?:\/\//i.test(s)) s = 'https://' + s;
  let u;
  try { u = new URL(s); } catch (e) { throw new Error('not a YouTube link'); }
  if (!/(^|\.)youtube\.com$|(^|\.)youtu\.be$/i.test(u.hostname)) throw new Error('not a YouTube link');
  // по ссылке на видео — канал автора
  const vid = u.searchParams.get('v') || (u.hostname.endsWith('youtu.be') ? u.pathname.slice(1, 12) : '') || (u.pathname.match(/\/(?:shorts|embed|live)\/([\w-]{11})/) || [])[1];
  const page = vid && VIDEO_RE.test(vid) ? 'https://www.youtube.com/watch?v=' + vid : 'https://www.youtube.com' + u.pathname.replace(/\/(videos|featured|shorts|streams|about)\/?$/, '');
  const r = await fetch(page, { headers: { ...UA, 'Cookie': 'CONSENT=YES+1' } });
  if (!r.ok) throw new Error('channel not found (HTTP ' + r.status + ')');
  const html = await r.text();
  m = html.match(/<link rel="canonical" href="https:\/\/www\.youtube\.com\/channel\/(UC[\w-]{22})"/) ||
      html.match(/"(?:externalId|channelId)":"(UC[\w-]{22})"/) ||
      html.match(/itemprop="(?:channelId|identifier)" content="(UC[\w-]{22})"/);
  if (!m) throw new Error('channel id not found on the page');
  const name = decode(pick(html, /<meta property="og:title" content="([^"]*)"/) || '');
  return { channelId: m[1], channelName: vid ? '' : name };
}

function pick(s, re) { const m = String(s || '').match(re); return m ? m[1] : ''; }
function decode(s) {
  return String(s || '').replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
    .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;|&apos;/g, "'")
    .replace(/&#(\d+);/g, (m, n) => String.fromCodePoint(+n)).replace(/&#x([0-9a-f]+);/gi, (m, n) => String.fromCodePoint(parseInt(n, 16))).trim();
}
