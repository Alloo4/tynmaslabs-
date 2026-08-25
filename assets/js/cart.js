// Tynmas Labs — shared cart state (persisted in localStorage, shared across shop.html)
window.TynmasCart = (() => {
  const KEY = 'tynmas_cart';
  const listeners = [];

  function read() {
    try {
      const raw = localStorage.getItem(KEY);
      const items = raw ? JSON.parse(raw) : [];
      return Array.isArray(items) ? items : [];
    } catch (e) {
      return [];
    }
  }

  function write(items) {
    localStorage.setItem(KEY, JSON.stringify(items));
    listeners.forEach((fn) => fn(items));
  }

  function add(item) {
    const items = read();
    const existing = items.find((x) => x.id === item.id);
    if (existing) {
      existing.qty += item.qty;
    } else {
      items.push(Object.assign({}, item));
    }
    write(items);
  }

  function setQty(id, qty) {
    const items = read();
    const line = items.find((x) => x.id === id);
    if (!line) return;
    if (qty <= 0) {
      write(items.filter((x) => x.id !== id));
    } else {
      line.qty = Math.min(99, qty);
      write(items);
    }
  }

  function remove(id) {
    write(read().filter((x) => x.id !== id));
  }

  function clear() { write([]); }

  function count() { return read().reduce((n, x) => n + x.qty, 0); }
  function subtotal() { return read().reduce((n, x) => n + x.price * x.qty, 0); }

  function onChange(fn) { listeners.push(fn); }

  return { getItems: read, add, setQty, remove, clear, count, subtotal, onChange };
})();
