// Shared mobile nav toggle used on every page.
document.addEventListener('DOMContentLoaded', () => {
  const toggle = document.querySelector('.nav-toggle');
  const mobileNav = document.querySelector('.mobile-nav');
  if (toggle && mobileNav) {
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-controls', mobileNav.id || '');
    toggle.addEventListener('click', () => {
      const isOpen = mobileNav.classList.toggle('open');
      toggle.textContent = isOpen ? '✕' : '☰';
      toggle.setAttribute('aria-expanded', String(isOpen));
    });
  }
});
