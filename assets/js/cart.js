// Tynmas Labs — shared cart state (persisted in localStorage, shared across shop.html)
window.TynmasCart = (() => {
  const KEY = 'tynmas_cart';
  const listeners = [];

  function lineKey(id, color, mat) { return id + '|' + color + '|' + mat; }

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
    const key = lineKey(item.id, item.color, item.mat);
    const existing = items.find((x) => lineKey(x.id, x.color, x.mat) === key);
    if (existing) {
      existing.qty += item.qty;
    } else {
      items.push(Object.assign({}, item));
    }
    write(items);
  }

  function setQty(id, color, mat, qty) {
    const items = read();
    const key = lineKey(id, color, mat);
    const line = items.find((x) => lineKey(x.id, x.color, x.mat) === key);
    if (!line) return;
    if (qty <= 0) {
      write(items.filter((x) => lineKey(x.id, x.color, x.mat) !== key));
    } else {
      line.qty = Math.min(99, qty);
      write(items);
    }
  }

  function remove(id, color, mat) {
    const key = lineKey(id, color, mat);
    write(read().filter((x) => lineKey(x.id, x.color, x.mat) !== key));
  }

  function clear() { write([]); }

  function count() { return read().reduce((n, x) => n + x.qty, 0); }
  function subtotal() { return read().reduce((n, x) => n + x.price * x.qty, 0); }

  function onChange(fn) { listeners.push(fn); }

  return { getItems: read, add, setQty, remove, clear, count, subtotal, onChange };
})();
