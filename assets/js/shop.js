// Tynmas Labs — Shop page logic (filtering, search, quick-view modal, cart, Paystack checkout)
(() => {
  const CATEGORIES = ['All', 'Desk & Office', 'Home Decor', 'Entertainment', 'Personalised Gifts', 'Accessories', 'Business Essentials', 'Custom Prints'];

  let PRODUCTS = [];

  const COLORS = [
    { label: 'Tynmas Blue', hex: '#2563EB' },
    { label: 'Graphite', hex: '#161B22' },
    { label: 'White', hex: '#D9DDE3' },
    { label: 'Black', hex: '#0A0D12' },
  ];
  const MATERIALS = ['PLA', 'PETG', 'ABS'];

  const state = { cat: 'All', query: '', activeId: null, qty: 1, color: 0, mat: 0, drawer: 'cart' };
  const cart = window.TynmasCart;

  const fmtKES = (n) => 'KES ' + Math.round(n).toLocaleString('en-US');

  const chipsEl = document.getElementById('categoryChips');
  const gridEl = document.getElementById('productGrid');
  const noResultsEl = document.getElementById('noResults');
  const searchInput = document.getElementById('searchInput');
  const cartCountEl = document.getElementById('cartCount');
  const toastEl = document.getElementById('toast');

  let toastTimer = null;
  function showToast(msg) {
    toastEl.querySelector('.msg').textContent = msg || 'Added to cart';
    toastEl.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove('show'), 1800);
  }

  function updateCartCount() {
    const n = cart.count();
    cartCountEl.textContent = n;
    cartCountEl.classList.toggle('show', n > 0);
  }

  function addToCart(item) {
    cart.add(item);
    updateCartCount();
    showToast('Added to cart');
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
        const p = PRODUCTS.find((x) => x.id === el.getAttribute('data-quickadd'));
        if (!p) return;
        addToCart({ id: p.id, name: p.name, price: p.price, priceLabel: p.priceLabel || null, qty: 1, color: null, mat: null });
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
    if (!p) return;
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
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    closeModal();
    closeCart();
  });

  document.getElementById('qtyDec').addEventListener('click', () => {
    state.qty = Math.max(1, state.qty - 1);
    qtyValueEl.textContent = state.qty;
  });
  document.getElementById('qtyInc').addEventListener('click', () => {
    state.qty = Math.min(99, state.qty + 1);
    qtyValueEl.textContent = state.qty;
  });
  document.getElementById('addToCartBtn').addEventListener('click', () => {
    const p = PRODUCTS.find((x) => x.id === state.activeId);
    if (!p) return;
    addToCart({
      id: p.id,
      name: p.name,
      price: p.price,
      priceLabel: p.priceLabel || null,
      qty: state.qty,
      color: COLORS[state.color].label,
      mat: MATERIALS[state.mat],
    });
    closeModal();
  });

  // ---------- cart drawer ----------
  const cartOverlay = document.getElementById('cartOverlay');
  const cartBox = document.getElementById('cartBox');

  function openCart() {
    state.drawer = 'cart';
    renderCart();
    cartOverlay.classList.add('open');
  }
  function closeCart() {
    cartOverlay.classList.remove('open');
  }
  document.getElementById('cartBtn').addEventListener('click', openCart);
  cartOverlay.addEventListener('click', (e) => { if (e.target === cartOverlay) closeCart(); });
  cartBox.addEventListener('click', (e) => e.stopPropagation());

  function lineLabel(item) {
    return [item.color, item.mat].filter(Boolean).join(' · ');
  }

  function renderCartList() {
    const items = cart.getItems();
    const rows = items.map((item) => `
      <div class="cart-line" data-line="${item.id}|${item.color}|${item.mat}">
        <div class="cart-line-info">
          <div class="cart-line-name">${item.name}</div>
          ${lineLabel(item) ? `<div class="cart-line-meta">${lineLabel(item)}</div>` : ''}
          <div class="cart-line-price">${item.priceLabel || fmtKES(item.price)} × ${item.qty}</div>
        </div>
        <div class="cart-line-qty">
          <button type="button" data-dec>−</button>
          <div class="qv">${item.qty}</div>
          <button type="button" data-inc>+</button>
        </div>
        <button type="button" class="cart-line-remove" data-remove aria-label="Remove">✕</button>
      </div>
    `).join('');

    cartBox.innerHTML = `
      <div class="modal-top">
        <h2>Your cart</h2>
        <button class="modal-close" id="cartClose" aria-label="Close">✕</button>
      </div>
      ${items.length ? `
        <div class="cart-list">${rows}</div>
        <div class="cart-subtotal-row"><span>Subtotal</span><span>${fmtKES(cart.subtotal())}</span></div>
        <div class="cart-actions">
          <button class="btn btn-primary" id="checkoutBtn">Checkout</button>
          <a href="shop.html" class="btn btn-outline" style="text-decoration:none" id="continueShoppingBtn">Continue Shopping</a>
        </div>
      ` : `<div class="cart-empty">Your cart is empty. Add a product to get started.</div>`}
    `;

    document.getElementById('cartClose').addEventListener('click', closeCart);
    const continueBtn = document.getElementById('continueShoppingBtn');
    if (continueBtn) continueBtn.addEventListener('click', (e) => { e.preventDefault(); closeCart(); });

    cartBox.querySelectorAll('[data-line]').forEach((row) => {
      const [id, color, mat] = row.getAttribute('data-line').split('|');
      const norm = (v) => (v === 'null' ? null : v);
      row.querySelector('[data-inc]').addEventListener('click', () => {
        const item = cart.getItems().find((x) => x.id === id && x.color === norm(color) && x.mat === norm(mat));
        cart.setQty(id, norm(color), norm(mat), item.qty + 1);
        updateCartCount();
        renderCart();
      });
      row.querySelector('[data-dec]').addEventListener('click', () => {
        const item = cart.getItems().find((x) => x.id === id && x.color === norm(color) && x.mat === norm(mat));
        cart.setQty(id, norm(color), norm(mat), item.qty - 1);
        updateCartCount();
        renderCart();
      });
      row.querySelector('[data-remove]').addEventListener('click', () => {
        cart.remove(id, norm(color), norm(mat));
        updateCartCount();
        renderCart();
      });
    });

    const checkoutBtn = document.getElementById('checkoutBtn');
    if (checkoutBtn) checkoutBtn.addEventListener('click', () => { state.drawer = 'checkout'; renderCart(); });
  }

  function renderCheckoutForm() {
    cartBox.innerHTML = `
      <button type="button" class="checkout-back" id="checkoutBack">← Back to cart</button>
      <h2>Checkout</h2>
      <div class="checkout-summary">${cart.count()} item${cart.count() === 1 ? '' : 's'} · <strong>${fmtKES(cart.subtotal())}</strong></div>
      <form class="checkout-form" id="checkoutForm">
        <div class="field">
          <label for="ckName">Name</label>
          <input type="text" id="ckName" placeholder="Your name" required>
        </div>
        <div class="field">
          <label for="ckEmail">Email</label>
          <input type="email" id="ckEmail" placeholder="you@email.com" required>
        </div>
        <div class="field">
          <label for="ckPhone">Phone / WhatsApp</label>
          <input type="text" id="ckPhone" placeholder="+254 7XX XXX XXX">
        </div>
        <div class="field">
          <label>Delivery</label>
          <div class="checkout-delivery">
            <div class="mat-chip active" data-delivery="Pickup at workshop">Pickup</div>
            <div class="mat-chip" data-delivery="Delivery within Nairobi">Delivery</div>
          </div>
        </div>
        <div class="field" id="ckAddressField" style="display:none">
          <label for="ckAddress">Delivery address</label>
          <input type="text" id="ckAddress" placeholder="Street, area, landmark">
        </div>
        <span class="form-error" id="checkoutError" style="display:none">Please add your name and email.</span>
        <button type="submit" class="btn btn-primary">Pay with Paystack</button>
      </form>
    `;

    document.getElementById('checkoutBack').addEventListener('click', () => { state.drawer = 'cart'; renderCart(); });

    let delivery = 'Pickup at workshop';
    const addressField = document.getElementById('ckAddressField');
    cartBox.querySelectorAll('[data-delivery]').forEach((chip) => {
      chip.addEventListener('click', () => {
        cartBox.querySelectorAll('[data-delivery]').forEach((c) => c.classList.remove('active'));
        chip.classList.add('active');
        delivery = chip.getAttribute('data-delivery');
        addressField.style.display = delivery === 'Delivery within Nairobi' ? 'block' : 'none';
      });
    });

    document.getElementById('checkoutForm').addEventListener('submit', async (e) => {
      e.preventDefault();
      const name = document.getElementById('ckName').value.trim();
      const email = document.getElementById('ckEmail').value.trim();
      const phone = document.getElementById('ckPhone').value.trim();
      const address = document.getElementById('ckAddress').value.trim();
      const errorEl = document.getElementById('checkoutError');
      if (!name || !email) {
        errorEl.style.display = 'inline';
        return;
      }
      errorEl.style.display = 'none';

      const submitBtn = e.target.querySelector('button[type="submit"]');
      submitBtn.disabled = true;
      submitBtn.textContent = 'Starting checkout…';

      try {
        const res = await fetch('/api/paystack-initialize', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            items: cart.getItems().map((it) => ({ id: it.id, qty: it.qty, color: it.color, mat: it.mat })),
            customer: { name, email, phone, delivery, address },
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Could not start checkout.');
        window.location.href = data.authorization_url;
      } catch (err) {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Pay with Paystack';
        errorEl.textContent = err.message || 'Something went wrong. Please try again.';
        errorEl.style.display = 'inline';
      }
    });
  }

  function renderCartStatus(kind, title, message) {
    cartBox.innerHTML = `
      <div class="checkout-status ${kind}">
        <div class="icon">${kind === 'success' ? '✓' : '✕'}</div>
        <h3>${title}</h3>
        <p>${message}</p>
        <button class="btn btn-primary" id="statusCloseBtn">Continue Shopping</button>
      </div>
    `;
    document.getElementById('statusCloseBtn').addEventListener('click', () => {
      closeCart();
      history.replaceState(null, '', 'shop.html');
    });
  }

  function renderCart() {
    if (state.drawer === 'checkout') renderCheckoutForm();
    else renderCartList();
  }

  // ---------- Paystack callback verification ----------
  async function checkPaystackReturn() {
    const params = new URLSearchParams(window.location.search);
    const reference = params.get('reference') || params.get('trxref');
    if (!reference) return;

    cartOverlay.classList.add('open');
    cartBox.innerHTML = `<div class="checkout-status"><div class="icon">…</div><h3>Confirming your payment</h3><p>Please wait a moment.</p></div>`;

    try {
      const res = await fetch('/api/paystack-verify?reference=' + encodeURIComponent(reference));
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Could not verify payment.');

      if (data.status === 'success') {
        renderCartStatus('success', 'Order confirmed!', `Thanks — your payment went through and we've got your order. Reference: ${data.reference}.`);
        try {
          await fetch('https://api.web3forms.com/submit', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              access_key: window.TYNMAS_WEB3FORMS_KEY,
              subject: 'New Tynmas Labs order — ' + data.reference,
              email: data.customer_email,
              reference: data.reference,
              amount_kes: data.amount / 100,
              order_details: JSON.stringify(data.metadata, null, 2),
            }),
          });
        } catch (e) { /* order still succeeded even if the notification email fails */ }
        cart.clear();
        updateCartCount();
      } else {
        renderCartStatus('error', 'Payment not completed', `Your transaction was ${data.status}. No charge was made — you can try again from your cart.`);
      }
    } catch (err) {
      renderCartStatus('error', 'Could not confirm payment', err.message || 'Please contact us if you were charged.');
    }
  }

  // ---------- init ----------
  fetch('assets/data/products.json')
    .then((res) => res.json())
    .then((data) => {
      PRODUCTS = data;
      renderChips();
      renderGrid();
      updateCartCount();
      checkPaystackReturn();
    })
    .catch(() => {
      noResultsEl.style.display = 'block';
      noResultsEl.querySelector('.title').textContent = 'Could not load products';
    });
})();
