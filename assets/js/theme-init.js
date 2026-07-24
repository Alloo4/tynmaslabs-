// Runs before CSS paints to avoid a flash of the wrong theme.
(function () {
  try {
    if (localStorage.getItem('tynmas-theme') === 'dark') {
      document.documentElement.setAttribute('data-theme', 'dark');
    }
  } catch (e) {}
})();
