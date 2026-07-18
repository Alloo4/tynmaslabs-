// Tynmas Labs — Contact / Request-a-Quote page logic (file drop estimator, form, FAQ accordion)
(() => {
  const VALID_EXT = ['stl', 'obj', '3mf', 'step', 'stp'];
  const RATE = { 'PLA': 6.5, 'PETG': 8, 'ABS': 8.5, 'Nylon-CF': 22, 'TPU (flexible)': 12, 'Not sure — advise me': 8 };

  const state = { fileKB: 0, hasFile: false };

  const dropzone = document.getElementById('dropzone');
  const dropIcon = document.getElementById('dropIcon');
  const dropName = document.getElementById('dropName');
  const dropHint = document.getElementById('dropHint');
  const fileInput = document.getElementById('fileInput');
  const estimateRow = document.getElementById('estimateRow');
  const estWeight = document.getElementById('estWeight');
  const estPrice = document.getElementById('estPrice');
  const estLead = document.getElementById('estLead');
  const materialSelect = document.getElementById('materialSelect');
  const qtyInput = document.getElementById('qtyInput');
  const timelineSelect = document.getElementById('timelineSelect');

  const fmt = (n) => Math.round(n).toLocaleString('en-US');

  function updateEstimate() {
    if (!state.hasFile) { estimateRow.style.display = 'none'; return; }
    const grams = Math.max(6, Math.min(2000, state.fileKB * 0.55));
    const qty = Math.max(1, +qtyInput.value || 1);
    const rate = RATE[materialSelect.value] || 8;
    const price = (grams * rate + 350) * qty;
    const lead = timelineSelect.value === 'Rush — as soon as possible' ? '2 days' : (qty > 12 ? '3–4 days' : '48 hours');

    estWeight.textContent = fmt(grams) + ' g';
    estPrice.textContent = 'KSh ' + fmt(price);
    estLead.textContent = lead;
    estimateRow.style.display = 'flex';
  }

  function acceptFile(file) {
    if (!file) return;
    const ext = (file.name.split('.').pop() || '').toLowerCase();
    if (!VALID_EXT.includes(ext)) {
      dropName.textContent = 'Unsupported file — use STL, OBJ, 3MF or STEP';
      dropHint.textContent = 'STL · OBJ · 3MF · STEP — up to 256 MB';
      state.hasFile = false;
      state.fileKB = 0;
      dropzone.classList.remove('filled');
      dropIcon.textContent = '⬆';
      updateEstimate();
      return;
    }
    const kb = file.size / 1024;
    const sizeLabel = kb >= 1024 ? (kb / 1024).toFixed(1) + ' MB' : Math.round(kb) + ' KB';
    dropName.textContent = file.name + ' · ' + sizeLabel;
    dropHint.textContent = 'File ready — estimate below · click to replace';
    state.fileKB = kb;
    state.hasFile = true;
    dropzone.classList.add('filled');
    dropIcon.textContent = '✓';
    updateEstimate();
  }

  dropzone.addEventListener('click', () => fileInput.click());
  fileInput.addEventListener('change', (e) => acceptFile(e.target.files && e.target.files[0]));
  dropzone.addEventListener('dragover', (e) => { e.preventDefault(); dropzone.classList.add('drag'); });
  dropzone.addEventListener('dragleave', (e) => { e.preventDefault(); dropzone.classList.remove('drag'); });
  dropzone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropzone.classList.remove('drag');
    acceptFile(e.dataTransfer.files && e.dataTransfer.files[0]);
  });

  materialSelect.addEventListener('change', updateEstimate);
  qtyInput.addEventListener('input', updateEstimate);
  timelineSelect.addEventListener('change', updateEstimate);

  // ---------- form submit ----------
  const form = document.getElementById('quoteForm');
  const successState = document.getElementById('successState');
  const formError = document.getElementById('formError');
  const nameInput = document.getElementById('nameInput');
  const phoneInput = document.getElementById('phoneInput');
  const emailInput = document.getElementById('emailInput');

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const hasContact = phoneInput.value.trim() || emailInput.value.trim();
    if (!nameInput.value.trim() || !hasContact) {
      formError.style.display = 'inline';
      return;
    }
    formError.style.display = 'none';
    form.classList.add('hide');
    successState.classList.add('show');
  });

  [nameInput, phoneInput, emailInput].forEach((el) => {
    el.addEventListener('input', () => { formError.style.display = 'none'; });
  });

  document.getElementById('sendAnotherBtn').addEventListener('click', () => {
    form.reset();
    state.hasFile = false;
    state.fileKB = 0;
    dropzone.classList.remove('filled');
    dropIcon.textContent = '⬆';
    dropName.textContent = 'Drop your 3D file or click to browse';
    dropHint.textContent = 'STL · OBJ · 3MF · STEP — up to 256 MB';
    estimateRow.style.display = 'none';
    formError.style.display = 'none';
    successState.classList.remove('show');
    form.classList.remove('hide');
  });

  // ---------- FAQ accordion ----------
  const FAQS = [
    { q: 'What file formats do you accept?', a: 'STL, OBJ, 3MF and STEP files up to 256 MB. No file yet? Our design team can build a print-ready model from a sketch, photo or sample.' },
    { q: 'How fast can I get my parts?', a: 'Standard jobs on stock materials are ready in about 48 hours. Larger batches typically take 3–4 days, and rush options are available on request.' },
    { q: 'How much does a print cost?', a: 'Most jobs are priced from material weight plus print time, with a small setup fee. Upload a file above for an instant estimate — the final quote is confirmed after we review it.' },
    { q: 'Do you deliver, or is it pickup only?', a: 'Both. You can collect from our Nairobi workshop, or we can arrange delivery within Nairobi and beyond.' },
    { q: 'Can you help if I only have an idea?', a: "Absolutely. Describe what you need and we'll advise on material, design and cost — turning your concept into a print-ready part." },
  ];

  const faqList = document.getElementById('faqList');
  FAQS.forEach((f, i) => {
    const item = document.createElement('div');
    item.className = 'faq-item' + (i === 0 ? ' open' : '');
    item.innerHTML = `
      <div class="faq-q">
        <span>${f.q}</span>
        <span class="faq-sign">${i === 0 ? '−' : '+'}</span>
      </div>
      <p class="faq-a">${f.a}</p>
    `;
    item.addEventListener('click', () => {
      const wasOpen = item.classList.contains('open');
      faqList.querySelectorAll('.faq-item').forEach((el) => {
        el.classList.remove('open');
        el.querySelector('.faq-sign').textContent = '+';
      });
      if (!wasOpen) {
        item.classList.add('open');
        item.querySelector('.faq-sign').textContent = '−';
      }
    });
    faqList.appendChild(item);
  });
})();
