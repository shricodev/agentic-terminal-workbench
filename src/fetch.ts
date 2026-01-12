/// <reference lib="dom" />

const fetch = (() => {
  try {
    return window.fetch.bind(window);
  } catch (err) {
    return globalThis.fetch;
  }
})();

export { fetch };
