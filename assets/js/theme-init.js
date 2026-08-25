// Runs before CSS paints to avoid a flash of the wrong theme.
// Dark is the default theme — only an explicit saved "light" choice opts out of it.
(function () {
  try {
    if (localStorage.getItem('tynmas-theme') !== 'light') {
      document.documentElement.setAttribute('data-theme', 'dark');
    }
  } catch (e) {
    document.documentElement.setAttribute('data-theme', 'dark');
  }
})();
