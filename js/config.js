// Church 2.0 — runtime configuration.
//
// apiBase: base URL of the Contabo API (e.g. "https://api.yourchurch.org").
//   - Leave EMPTY ("") to run fully standalone in the browser (localStorage
//     demo mode) — this is how the Vercel static deploy works out of the box.
//   - Set it to your API origin to connect the real backend (auth + shared
//     data). You can also override at runtime without editing this file by
//     setting localStorage 'church2_api_base'.
window.CHURCH2_CONFIG = {
  apiBase: (typeof localStorage !== 'undefined' && localStorage.getItem('church2_api_base')) || '',
};
