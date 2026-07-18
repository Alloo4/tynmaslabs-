// Tynmas Labs — Shop page logic (filtering, search, quick-view modal, in-memory cart)
(() => {
  const CATEGORIES = ['All', 'Desk & Office', 'Home Decor', 'Entertainment', 'Personalised Gifts', 'Accessories', 'Business Essentials', 'Custom Prints'];

  const PRODUCTS = [
    { id: 'sp1', cat: 'Desk & Office', name: 'Modular Desk Organizer', price: 1800, low: false, swatches: ['#2563EB', '#161B22', '#D9DDE3'], desc: 'A snap-together desk organizer for pens, cards and cables. Configure the modules to fit your setup.' },
    { id: 'sp2', cat: 'Desk & Office', name: 'Cable Management Clip Set', price: 600, low: false, swatches: ['#161B22', '#2563EB'], desc: 'A set of adhesive-backed clips that keep charging and desk cables tidy and in place.' },
    { id: 'sp3', cat: 'Home Decor', name: 'Geometric Planter', price: 1200, low: false, swatches: ['#D9DDE3', '#161B22', '#2563EB'], desc: 'A faceted planter with a drainage insert — great for succulents and small indoor plants.' },
    { id: 'sp4', cat: 'Home Decor', name: 'Layered Wall Art Piece', price: 2400, low: true, swatches: ['#2563EB', '#0A0D12'], desc: 'A multi-layer geometric wall panel that adds depth and a modern accent to any room.' },
    { id: 'sp5', cat: 'Entertainment', name: 'Gaming Dice Tray', price: 950, low: false, swatches: ['#161B22', '#2563EB', '#D9DDE3'], desc: 'A felt-free rolling tray with raised edges — keeps your dice on the table, not the floor.' },
    { id: 'sp6', cat: 'Personalised Gifts', name: 'Custom Name Keychain', price: 450, low: false, swatches: ['#2563EB', '#D9DDE3', '#161B22'], desc: 'Personalize with any name, word or small logo. A quick, affordable custom gift.' },
    { id: 'sp7', cat: 'Accessories', name: 'Adjustable Phone Stand', price: 850, low: false, swatches: ['#161B22', '#2563EB'], desc: 'A sturdy multi-angle stand for phones and small tablets — folds flat to travel.' },
    { id: 'sp8', cat: 'Business Essentials', name: 'Business Card Holder', price: 700, low: true, swatches: ['#0A0D12', '#2563EB', '#D9DDE3'], desc: 'A clean desk-top card holder that keeps your business cards presentable and within reach.' },
    { id: 'sp9', cat: 'Custom Prints', name: 'Custom 3D Print (Made to Order)', price: 1000, priceLabel: 'From KES 1,000', low: false, swatches: ['#2563EB', '#161B22', '#D9DDE3'], desc: "Upload your own file and we'll print it to order in your chosen material and color." },
  ];

  const COLORS = [
    { label: 'Tynmas Blue', hex: '#2563EB' },
    { label: 'Graphite', hex: '#161B22' },
    { label: 'White', hex: '#D9DDE3' },
    { label: 'Black', hex: '#0A0D12' },
  ];
  const MATERIALS = ['PLA', 'PETG', 'ABS'];

  const state = { cat: 'All', query: '', cart: 0, activeId: null, qty: 1, color: 0, mat: 0 };

  const fmtKES = (n) => 'KES ' + n.toLocaleString('en-US');

  const chipsEl = document.getElementById('categoryChips');
  const gridEl = document.getElementById('productGrid');
  const noResultsEl = document.getElementById('noResults');
  const searchInput = document.getElementById('searchInput');
  const cartCountEl = document.getElementById('cartCount');
  const toastEl = document.getElementById('toast');

  let toastTimer = null;
  function showToast() {
    toastEl.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove('show'), 1800);
  }

  function bumpCart(n) {
    state.cart += n;
    cartCountEl.textContent = state.cart;
    cartCountEl.classList.toggle('show', state.cart > 0);
    showToast();
  }

  function renderChips() {
    chipsEl.innerHTML = '';
    CATEGORIES.forEach((c) => {
      const chip = document.createElement('button');
      chip.type = 'button';
      chip.className = 'chip' + (c === state.cat ? ' active' : '');
      chip.textContent = c;
      chip.addEventListener('click', () => {
        state.cat = c;
        renderChips();
        renderGrid();
      });
      chipsEl.appendChild(chip);
    });
  }

  function filteredProducts() {
    const q = state.query.trim().toLowerCase();
    return PRODUCTS.filter((p) => {
      const catOk = state.cat === 'All' || p.cat === state.cat;
      const qOk = !q || p.name.toLowerCase().includes(q) || p.cat.toLowerCase().includes(q);
      return catOk && qOk;
    });
  }

  function renderGrid() {
    const items = filteredProducts();
    gridEl.innerHTML = '';
    gridEl.style.display = items.length ? 'grid' : 'none';
    noResultsEl.style.display = items.length ? 'none' : 'block';

    items.forEach((p) => {
      const card = document.createElement('div');
      card.className = 'product-card';
      card.innerHTML = `
        <div class="product-thumb" data-open="${p.id}">
          <div class="img-slot"><span>Product photo</span></div>
          ${p.low ? '<span class="product-tag">Low stock</span>' : ''}
          <span class="wishlist-btn" title="Wishlist — coming soon">♡</span>
        </div>
        <div class="product-body">
          <div class="product-cat">${p.cat}</div>
          <div class="product-name" data-open="${p.id}">${p.name}</div>
          <div class="swatch-row">
            ${p.swatches.map((sw) => `<span class="swatch" style="background:${sw}"></span>`).join('')}
          </div>
          <div class="product-foot">
            <span class="product-price">${p.priceLabel || fmtKES(p.price)}</span>
            <button type="button" class="btn btn-primary btn-xs" data-quickadd="${p.id}">Add</button>
          </div>
        </div>
      `;
      gridEl.appendChild(card);
    });

    gridEl.querySelectorAll('[data-open]').forEach((el) => {
      el.addEventListener('click', () => openModal(el.getAttribute('data-open')));
    });
    gridEl.querySelectorAll('[data-quickadd]').forEach((el) => {
      el.addEventListener('click', (e) => {
        e.stopPropagation();
        bumpCart(1);
      });
    });
  }

  searchInput.addEventListener('input', (e) => {
    state.query = e.target.value;
    renderGrid();
  });

  // ---------- quick-view modal ----------
  const modalOverlay = document.getElementById('modalOverlay');
  const modalBox = document.getElementById('modalBox');
  const modalCat = document.getElementById('modalCat');
  const modalName = document.getElementById('modalName');
  const modalPrice = document.getElementById('modalPrice');
  const modalDesc = document.getElementById('modalDesc');
  const modalColors = document.getElementById('modalColors');
  const modalMaterials = document.getElementById('modalMaterials');
  const qtyValueEl = document.getElementById('qtyValue');

  function openModal(id) {
    state.activeId = id;
    state.qty = 1;
    state.color = 0;
    state.mat = 0;
    renderModal();
    modalOverlay.classList.add('open');
  }
  function closeModal() {
    modalOverlay.classList.remove('open');
  }

  function renderModal() {
    const p = PRODUCTS.find((x) => x.id === state.activeId) || PRODUCTS[0];
    modalCat.textContent = p.cat;
    modalName.textContent = p.name;
    modalPrice.textContent = p.priceLabel || fmtKES(p.price);
    modalDesc.textContent = p.desc;
    qtyValueEl.textContent = state.qty;

    modalColors.innerHTML = COLORS.map((c, i) => `
      <button type="button" class="color-swatch-btn${i === state.color ? ' active' : ''}" data-color="${i}" title="${c.label}">
        <span style="background:${c.hex}"></span>
      </button>
    `).join('');
    modalColors.querySelectorAll('[data-color]').forEach((el) => {
      el.addEventListener('click', () => {
        state.color = +el.getAttribute('data-color');
        renderModal();
      });
    });

    modalMaterials.innerHTML = MATERIALS.map((m, i) => `
      <div class="mat-chip${i === state.mat ? ' active' : ''}" data-mat="${i}">${m}</div>
    `).join('');
    modalMaterials.querySelectorAll('[data-mat]').forEach((el) => {
      el.addEventListener('click', () => {
        state.mat = +el.getAttribute('data-mat');
        renderModal();
      });
    });
  }

  document.getElementById('modalClose').addEventListener('click', closeModal);
  modalOverlay.addEventListener('click', (e) => { if (e.target === modalOverlay) closeModal(); });
  modalBox.addEventListener('click', (e) => e.stopPropagation());
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeModal(); });

  document.getElementById('qtyDec').addEventListener('click', () => {
    state.qty = Math.max(1, state.qty - 1);
    qtyValueEl.textContent = state.qty;
  });
  document.getElementById('qtyInc').addEventListener('click', () => {
    state.qty = Math.min(99, state.qty + 1);
    qtyValueEl.textContent = state.qty;
  });
  document.getElementById('addToCartBtn').addEventListener('click', () => {
    bumpCart(state.qty);
    closeModal();
  });

  document.getElementById('cartBtn').addEventListener('click', () => {
    // Cart is in-memory only for now — no persistence/checkout backend yet.
  });

  renderChips();
  renderGrid();
})();
