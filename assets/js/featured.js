// Tynmas Labs — homepage "Featured products" grid, pulled live from the shop
// catalog (assets/data/products.json) so it can never drift out of sync with
// what's actually in the shop.
(() => {
  const gridEl = document.getElementById('featuredGrid');
  if (!gridEl) return;

  const fmtKES = (n) => 'KES ' + Math.round(n).toLocaleString('en-US');

  function photoHtml(p) {
    if (p.photo) return `<img class="product-photo" src="${p.photo}" alt="${p.name}" loading="lazy">`;
    return `<div class="img-slot"><span>Product photo</span></div>`;
  }

  fetch('assets/data/products.json')
    .then((res) => res.json())
    .then((data) => {
      const featured = data.filter((p) => p.featured).slice(0, 4);
      gridEl.innerHTML = featured.map((p) => `
        <a href="shop.html" class="product-card" style="color:inherit">
          <div class="product-thumb">${photoHtml(p)}</div>
          <div class="product-body">
            <div class="product-cat">${p.cat}</div>
            <div class="product-name">${p.name}</div>
            <div class="product-price">${p.priceLabel || fmtKES(p.price)}</div>
          </div>
        </a>
      `).join('');
    })
    .catch(() => {});
})();
