// Tynmas Labs — Light/dark theme toggle (persisted in localStorage)
(() => {
  const KEY = 'tynmas-theme';

  function apply(theme) {
    document.documentElement.setAttribute('data-theme', theme);
  }

  document.querySelectorAll('.theme-toggle').forEach((btn) => {
    btn.addEventListener('click', () => {
      const current = document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
      const next = current === 'dark' ? 'light' : 'dark';
      localStorage.setItem(KEY, next);
      apply(next);
    });
  });
})();
