const env = require('../config/env');
const LRUCache = require('../utils/lruCache');
const { HttpError } = require('../middleware/error.middleware');

const CACHE_CAPACITY = 200;
const CACHE_TTL_MS = 5 * 60 * 1000;
const NEWSAPI_BASE = 'https://newsapi.org/v2';

const cache = new LRUCache(CACHE_CAPACITY);

const buildKey = (endpoint, params) => {
  const sorted = Object.keys(params)
    .filter((k) => params[k] !== undefined && params[k] !== null && params[k] !== '')
    .sort()
    .map((k) => `${k}=${encodeURIComponent(params[k])}`)
    .join('&');
  return `${endpoint}?${sorted}`;
};

const fetchFromNewsApi = async (endpoint, params) => {
  const key = buildKey(endpoint, params);
  const cached = cache.get(key);
  if (cached && Date.now() - cached.ts < CACHE_TTL_MS) {
    return cached.data;
  }

  const url = new URL(`${NEWSAPI_BASE}${endpoint}`);
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') url.searchParams.set(k, v);
  });

  const response = await fetch(url, {
    headers: { 'X-Api-Key': env.NEWSAPI_KEY, 'User-Agent': 'news-app-fullstack/1.0' }
  });

  const body = await response.json().catch(() => ({}));

  if (!response.ok || body.status === 'error') {
    const message = body.message || `NewsAPI request failed (${response.status})`;
    const status = response.status === 401 ? 502 : response.status >= 500 ? 502 : response.status;
    throw new HttpError(status, 'UPSTREAM_ERROR', message);
  }

  cache.set(key, { ts: Date.now(), data: body });
  return body;
};

const headlines = ({ country, category, page, pageSize }) =>
  fetchFromNewsApi('/top-headlines', { country, category, page, pageSize });

const search = ({ q, from, to, sortBy, page, pageSize }) =>
  fetchFromNewsApi('/everything', { q, from, to, sortBy, page, pageSize, language: 'en' });

const sources = ({ category, country }) =>
  fetchFromNewsApi('/top-headlines/sources', { category, country });

module.exports = { headlines, search, sources };
