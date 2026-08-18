// Church 2.0 — API client for the production backend.
//
// When window.CHURCH2_CONFIG.apiBase is set, this talks to the real API
// (auth + shared Postgres data). When it's empty, isEnabled() returns false and
// the app runs in standalone localStorage demo mode. All calls are gated on
// isEnabled() so the static demo keeps working with no backend.
(function () {
  'use strict';

  const TOKEN_KEY = 'church2_token';

  const base = () => (window.CHURCH2_CONFIG && window.CHURCH2_CONFIG.apiBase) || '';
  const getToken = () => localStorage.getItem(TOKEN_KEY);
  const setToken = (t) => (t ? localStorage.setItem(TOKEN_KEY, t) : localStorage.removeItem(TOKEN_KEY));

  async function request(method, path, body) {
    const headers = { 'Content-Type': 'application/json' };
    const token = getToken();
    if (token) headers.Authorization = `Bearer ${token}`;
    const res = await fetch(base() + '/api' + path, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });
    let data = null;
    try { data = await res.json(); } catch { /* no body */ }
    if (!res.ok) {
      const err = new Error((data && data.error) || `Request failed (${res.status})`);
      err.status = res.status;
      err.code = data && data.code;
      // One session per account: when another sign-in supersedes this one the
      // server rejects the token. Drop it and let the app return to the login
      // screen rather than retrying with a credential that can never work.
      if (res.status === 401) {
        setToken(null);
        if (typeof window.onChurch2SessionLost === 'function') {
          window.onChurch2SessionLost(err.code === 'session_superseded' ? err.message : null);
        }
      }
      throw err;
    }
    return data;
  }

  const scoped = (path, branch) => {
    if (!branch || branch === 'global') return path;
    return path + (path.includes('?') ? '&' : '?') + 'branch=' + encodeURIComponent(branch);
  };

  window.Church2API = {
    isEnabled: () => Boolean(base()),
    getToken,
    logout: () => setToken(null),

    // ---- Auth ----
    async login(email, password) {
      return request('POST', '/auth/login', { email, password }); // -> {mfaRequired,ticket} | {token,user}
    },
    async verifyMfa(ticket, code) {
      const r = await request('POST', '/auth/mfa', { ticket, code });
      if (r.token) setToken(r.token);
      return r; // {token,user}
    },
    async completePasswordLogin(r) {
      if (r && r.token) setToken(r.token);
      return r;
    },
    async me() { return request('GET', '/auth/me'); },

    // ---- Resources (branch = active campus scope, or 'global') ----
    members: (branch, search) => request('GET', scoped('/members' + (search ? `?search=${encodeURIComponent(search)}` : ''), branch)),
    createMember: (m) => request('POST', '/members', m),
    removeMember: (id) => request('DELETE', `/members/${encodeURIComponent(id)}`),
    transactions: (branch) => request('GET', scoped('/transactions', branch)),
    recordTransaction: (t) => request('POST', '/transactions', t),
    attendance: (branch) => request('GET', scoped('/attendance', branch)),
    setAttendance: (a) => request('PUT', '/attendance', a),
    dashboardSummary: (branch) => request('GET', scoped('/dashboard/summary', branch)),
    groups: (branch) => request('GET', scoped('/groups', branch)),
    createGroup: (g) => request('POST', '/groups', g),
    toggleGroupMember: (id, memberId) => request('POST', `/groups/${id}/toggle-member`, { memberId }),
    followups: (branch) => request('GET', scoped('/followups', branch)),
    createFollowup: (f) => request('POST', '/followups', f),
    moveFollowup: (id, stage) => request('PATCH', `/followups/${id}`, { stage }),
    announcements: () => request('GET', '/announcements'),
    sendAnnouncement: (a) => request('POST', '/announcements', a),
    prayerRequests: (branch) => request('GET', scoped('/prayer-requests', branch)),
    submitPrayer: (p) => request('POST', '/prayer-requests', p),
    dismissPrayer: (id) => request('DELETE', `/prayer-requests/${id}`),
    events: (branch) => request('GET', scoped('/events', branch)),
  };
})();
