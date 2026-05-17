const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

let accessToken = null;
let refreshInFlight = null;
let onUnauthorized = null;

const setAccessToken = (token) => {
  accessToken = token;
};

const getAccessToken = () => accessToken;

const setUnauthorizedHandler = (handler) => {
  onUnauthorized = handler;
};

const buildUrl = (path, query) => {
  const url = new URL(path.startsWith('http') ? path : `${API_URL}${path}`);
  if (query) {
    Object.entries(query).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') url.searchParams.set(k, v);
    });
  }
  return url.toString();
};

const doRefresh = async () => {
  if (!refreshInFlight) {
    refreshInFlight = fetch(`${API_URL}/api/auth/refresh`, {
      method: 'POST',
      credentials: 'include'
    })
      .then(async (r) => {
        if (!r.ok) throw new Error('refresh_failed');
        const body = await r.json();
        accessToken = body.data.accessToken;
        return accessToken;
      })
      .finally(() => {
        refreshInFlight = null;
      });
  }
  return refreshInFlight;
};

const request = async (path, { method = 'GET', body, query, headers, retry = true, server = false } = {}) => {
  const init = {
    method,
    headers: { 'Content-Type': 'application/json', ...(headers || {}) },
    credentials: 'include'
  };
  if (body !== undefined) init.body = JSON.stringify(body);
  if (accessToken) init.headers.Authorization = `Bearer ${accessToken}`;

  const res = await fetch(buildUrl(path, query), init);

  if (res.status === 204) return null;

  if (res.status === 401 && retry && !server && path !== '/api/auth/refresh' && path !== '/api/auth/login') {
    try {
      await doRefresh();
      return request(path, { method, body, query, headers, retry: false });
    } catch {
      accessToken = null;
      if (typeof onUnauthorized === 'function') onUnauthorized();
      const err = new Error('Unauthorized');
      err.status = 401;
      throw err;
    }
  }

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const err = new Error((data.error && data.error.message) || `Request failed (${res.status})`);
    err.status = res.status;
    err.code = data.error && data.error.code;
    throw err;
  }

  return data.data;
};

const api = {
  get: (path, opts) => request(path, { ...opts, method: 'GET' }),
  post: (path, body, opts) => request(path, { ...opts, method: 'POST', body }),
  patch: (path, body, opts) => request(path, { ...opts, method: 'PATCH', body }),
  delete: (path, opts) => request(path, { ...opts, method: 'DELETE' })
};

const serverFetch = async (path, query) => {
  const res = await fetch(buildUrl(path, query), {
    headers: { Accept: 'application/json' },
    next: { revalidate: 300 }
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    const err = new Error((body.error && body.error.message) || `Upstream failed (${res.status})`);
    err.status = res.status;
    throw err;
  }
  const body = await res.json();
  return body.data;
};

export { api, setAccessToken, getAccessToken, setUnauthorizedHandler, serverFetch, API_URL };
