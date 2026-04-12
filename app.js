/* ===== Constants & Storage Keys ===== */
const STORAGE_SEARCHES = 'mcs_searches';
const STORAGE_SETTINGS = 'mcs_settings';
const STORAGE_SEED_VERSION = 'mcs_seed_version';
const CURRENT_SEED_VERSION = 2; // bump to wipe user searches and reseed defaults
const STALE_THRESHOLD_MS = 24 * 60 * 60 * 1000; // 24 hours

/* ===== Default data ===== */
const DEFAULT_SETTINGS = {
  city: 'chicago',
  maxPrice: 9000,
  maxMileage: 130000,
  radius: 2500,
};

const DEFAULT_SEARCHES = [
  { id: genId(), label: 'Honda Fit (2011-13)', urlType: 'slug', slug: 'honda-fit', city: 'chicago', minYear: 2011, maxYear: 2013, maxPrice: 10000, maxMileage: 130000, transmission: 'manual', radius: 2500, sellerType: 'individual', notes: 'Avoid 2009, 2015. Up to 180K with records.', lastChecked: null },
  { id: genId(), label: 'Honda Fit (2017-20)', urlType: 'slug', slug: 'honda-fit', city: 'chicago', minYear: 2017, maxYear: 2020, maxPrice: 10000, maxMileage: 130000, transmission: 'manual', radius: 2500, sellerType: 'individual', notes: 'Up to 180K with records.', lastChecked: null },
  { id: genId(), label: 'Pontiac Vibe 1.8L', urlType: 'slug', slug: 'pontiac-vibe', city: 'chicago', minYear: 2009, maxYear: 2010, maxPrice: 10000, maxMileage: 130000, transmission: 'automatic', radius: 2500, sellerType: 'individual', notes: 'Avoid 2003, 2005-2006. Up to 170K.', lastChecked: null },
  { id: genId(), label: 'Toyota Matrix 1.8L', urlType: 'slug', slug: 'toyota-matrix', city: 'chicago', minYear: 2010, maxYear: 2013, maxPrice: 10000, maxMileage: 130000, transmission: 'automatic', radius: 2500, sellerType: 'individual', notes: 'Avoid 2003, 2009. Up to 180K with records.', lastChecked: null },
  { id: genId(), label: 'Scion xB', urlType: 'slug', slug: 'scion-xb', city: 'chicago', minYear: 2011, maxYear: 2015, maxPrice: 10000, maxMileage: 100000, transmission: '', radius: 2500, sellerType: 'individual', notes: 'Avoid 2008-2009. Risky above 130K.', lastChecked: null },
  { id: genId(), label: 'Subaru Impreza', urlType: 'slug', slug: 'subaru-impreza', city: 'chicago', minYear: 2012, maxYear: 2014, maxPrice: 10000, maxMileage: 100000, transmission: 'manual', radius: 2500, sellerType: 'individual', notes: 'Avoid 2008-2011. Up to 150K with HG done.', lastChecked: null },
  { id: genId(), label: 'Scion xD', urlType: 'slug', slug: 'scion-xd', city: 'chicago', minYear: 2010, maxYear: 2014, maxPrice: 10000, maxMileage: 130000, transmission: '', radius: 2500, sellerType: 'individual', notes: 'Avoid 2008. Up to 180K with records.', lastChecked: null },
  { id: genId(), label: 'Honda CR-V (2005-06)', urlType: 'slug', slug: 'honda-cr-v', city: 'chicago', minYear: 2005, maxYear: 2006, maxPrice: 10000, maxMileage: 150000, transmission: '', radius: 2500, sellerType: 'individual', notes: 'Avoid 2002-2004, 2007-2009, 2015-2016. Up to 200K.', lastChecked: null },
  { id: genId(), label: 'Honda CR-V (2010-11)', urlType: 'slug', slug: 'honda-cr-v', city: 'chicago', minYear: 2010, maxYear: 2011, maxPrice: 10000, maxMileage: 150000, transmission: '', radius: 2500, sellerType: 'individual', notes: 'Up to 200K.', lastChecked: null },
  { id: genId(), label: 'Toyota RAV4', urlType: 'slug', slug: 'toyota-rav4', city: 'chicago', minYear: 2009, maxYear: 2012, maxPrice: 10000, maxMileage: 130000, transmission: '', radius: 2500, sellerType: 'individual', notes: 'Avoid 2006-2008, 2019. Up to 180K.', lastChecked: null },
  { id: genId(), label: 'Ford Focus', urlType: 'slug', slug: 'ford-focus', city: 'chicago', minYear: 2012, maxYear: 2018, maxPrice: 10000, maxMileage: 130000, transmission: 'manual', radius: 2500, sellerType: 'individual', notes: 'Manual only (avoid all automatics). Up to 200K.', lastChecked: null },
  { id: genId(), label: 'Subaru Forester', urlType: 'slug', slug: 'subaru-forester', city: 'chicago', minYear: 2011, maxYear: 2013, maxPrice: 10000, maxMileage: 100000, transmission: 'manual', radius: 2500, sellerType: 'individual', notes: 'Avoid 2014, pre-2011 without HG. Up to 150K with HG done.', lastChecked: null },
  { id: genId(), label: 'Mazda3 Hatch', urlType: 'slug', slug: 'mazda-3', city: 'chicago', minYear: 2015, maxYear: 2018, maxPrice: 10000, maxMileage: 120000, transmission: '', radius: 2500, sellerType: 'individual', sortBy: false, notes: 'Hatchback only. Avoid 2010-2013. Up to 160K, rust-free only.', lastChecked: null },
];

/* ===== State ===== */
let searches = loadSearches();
let settings = loadSettings();
let dragSrcIndex = null;

/* ===== DOM Refs ===== */
const grid = document.getElementById('search-grid');
const emptyState = document.getElementById('empty-state');
const modalOverlay = document.getElementById('modal-overlay');
const settingsOverlay = document.getElementById('settings-overlay');
const ieOverlay = document.getElementById('ie-overlay');
const confirmOverlay = document.getElementById('confirm-overlay');
const searchForm = document.getElementById('search-form');
const settingsForm = document.getElementById('settings-form');

/* ===== Helpers ===== */
function genId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

function loadSearches() {
  try {
    const raw = localStorage.getItem(STORAGE_SEARCHES);
    if (raw) return JSON.parse(raw);
  } catch (e) { /* ignore */ }
  return null;
}

function loadSettings() {
  try {
    const raw = localStorage.getItem(STORAGE_SETTINGS);
    if (raw) return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch (e) { /* ignore */ }
  return { ...DEFAULT_SETTINGS };
}

function saveSearches() {
  localStorage.setItem(STORAGE_SEARCHES, JSON.stringify(searches));
}

function saveSettings() {
  localStorage.setItem(STORAGE_SETTINGS, JSON.stringify(settings));
}

function buildUrl(s) {
  const base = 'https://www.facebook.com/marketplace';
  const city = encodeURIComponent(s.city || settings.city || 'chicago');
  const params = new URLSearchParams();

  if (s.maxPrice) params.set('maxPrice', s.maxPrice);
  if (s.maxMileage) params.set('maxMileage', s.maxMileage);
  if (s.minYear) params.set('minYear', s.minYear);
  if (s.maxYear) params.set('maxYear', s.maxYear);
  if (s.sortBy !== false) params.set('sortBy', 'creation_time_descend');
  params.set('exact', 'true');
  if (s.radius) params.set('radius_in_km', s.radius);
  if (s.sellerType) params.set('sellerType', s.sellerType);
  if (s.transmission) params.set('transmission', s.transmission);

  return `${base}/${city}/${encodeURIComponent(s.slug)}?${params.toString()}`;
}

function relativeTime(ts) {
  if (!ts) return 'Never checked';
  const diff = Date.now() - ts;
  const seconds = Math.floor(diff / 1000);
  if (seconds < 60) return 'Just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function isStale(ts) {
  if (!ts) return true;
  return (Date.now() - ts) > STALE_THRESHOLD_MS;
}

/* ===== Rendering ===== */
function render() {
  grid.innerHTML = '';
  emptyState.hidden = searches.length > 0;
  grid.hidden = searches.length === 0;

  searches.forEach((s, index) => {
    const card = document.createElement('div');
    card.className = 'card' + (isStale(s.lastChecked) ? ' stale' : '');
    card.draggable = true;
    card.dataset.index = index;

    const yearText = s.minYear
      ? s.maxYear ? `${s.minYear}\u2013${s.maxYear}` : `${s.minYear}+`
      : s.maxYear ? `\u2264${s.maxYear}` : '';

    const transmissionBadge = s.transmission === 'manual'
      ? '<span class="badge badge-manual">Manual</span>'
      : s.transmission === 'automatic'
        ? '<span class="badge badge-auto">Auto</span>'
        : '';

    const staleBadge = isStale(s.lastChecked)
      ? '<span class="badge badge-stale">Stale</span>'
      : '';

    card.innerHTML = `
      <div class="card-top">
        <span class="card-label">${escapeHtml(s.label)}</span>
        <div class="card-actions">
          <button class="btn btn-icon btn-sm" data-action="duplicate" title="Duplicate" aria-label="Duplicate">
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><rect x="5" y="5" width="9" height="9" rx="1.5" stroke="currentColor" stroke-width="1.5"/><path d="M11 5V3.5A1.5 1.5 0 009.5 2h-6A1.5 1.5 0 002 3.5v6A1.5 1.5 0 003.5 11H5" stroke="currentColor" stroke-width="1.5"/></svg>
          </button>
          <button class="btn btn-icon btn-sm" data-action="edit" title="Edit" aria-label="Edit">
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M11.5 1.5l3 3L5 14H2v-3L11.5 1.5z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/></svg>
          </button>
          <button class="btn btn-icon btn-sm" data-action="delete" title="Delete" aria-label="Delete">
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M2 4h12M5.33 4V2.67a1.33 1.33 0 011.34-1.34h2.66a1.33 1.33 0 011.34 1.34V4M13 4l-.67 9.33a1.33 1.33 0 01-1.33 1.34H5a1.33 1.33 0 01-1.33-1.34L3 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
          </button>
        </div>
      </div>
      <div class="card-meta">
        ${yearText ? `<span class="badge badge-years">${yearText}</span>` : ''}
        ${transmissionBadge}
        ${staleBadge}
      </div>
      <span class="card-timestamp" data-ts="${s.lastChecked || ''}">${relativeTime(s.lastChecked)}</span>
      ${s.notes ? `<span class="card-notes" title="${escapeAttr(s.notes)}">${escapeHtml(s.notes)}</span>` : ''}
    `;

    // Card click -> open search
    card.addEventListener('click', (e) => {
      if (e.target.closest('[data-action]')) return;
      openSearch(index);
    });

    // Action buttons
    card.querySelector('[data-action="edit"]').addEventListener('click', (e) => {
      e.stopPropagation();
      openEditForm(index);
    });
    card.querySelector('[data-action="delete"]').addEventListener('click', (e) => {
      e.stopPropagation();
      confirmDelete(index);
    });
    card.querySelector('[data-action="duplicate"]').addEventListener('click', (e) => {
      e.stopPropagation();
      duplicateSearch(index);
    });

    // Drag & drop
    card.addEventListener('dragstart', onDragStart);
    card.addEventListener('dragover', onDragOver);
    card.addEventListener('dragenter', onDragEnter);
    card.addEventListener('dragleave', onDragLeave);
    card.addEventListener('drop', onDrop);
    card.addEventListener('dragend', onDragEnd);

    grid.appendChild(card);
  });
}

function escapeHtml(str) {
  const d = document.createElement('div');
  d.textContent = str;
  return d.innerHTML;
}

function escapeAttr(str) {
  return str.replace(/"/g, '&quot;').replace(/'/g, '&#39;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

/* ===== Search Actions ===== */
function openSearch(index) {
  const s = searches[index];
  const url = buildUrl(s);
  window.open(url, '_blank', 'noopener');
  s.lastChecked = Date.now();
  saveSearches();
  render();
}

function openAllSearches() {
  searches.forEach((s, i) => {
    window.open(buildUrl(s), '_blank', 'noopener');
    s.lastChecked = Date.now();
  });
  saveSearches();
  render();
}

function duplicateSearch(index) {
  const original = searches[index];
  const clone = { ...original, id: genId(), label: original.label + ' (copy)', lastChecked: null };
  searches.splice(index + 1, 0, clone);
  saveSearches();
  render();
}

/* ===== Drag & Drop ===== */
function onDragStart(e) {
  dragSrcIndex = parseInt(e.currentTarget.dataset.index);
  e.currentTarget.classList.add('dragging');
  e.dataTransfer.effectAllowed = 'move';
  e.dataTransfer.setData('text/plain', dragSrcIndex);
}

function onDragOver(e) {
  e.preventDefault();
  e.dataTransfer.dropEffect = 'move';
}

function onDragEnter(e) {
  e.preventDefault();
  e.currentTarget.classList.add('drag-over');
}

function onDragLeave(e) {
  e.currentTarget.classList.remove('drag-over');
}

function onDrop(e) {
  e.preventDefault();
  e.currentTarget.classList.remove('drag-over');
  const targetIndex = parseInt(e.currentTarget.dataset.index);
  if (dragSrcIndex === null || dragSrcIndex === targetIndex) return;
  const moved = searches.splice(dragSrcIndex, 1)[0];
  searches.splice(targetIndex, 0, moved);
  saveSearches();
  render();
}

function onDragEnd(e) {
  e.currentTarget.classList.remove('dragging');
  document.querySelectorAll('.card').forEach(c => c.classList.remove('drag-over'));
  dragSrcIndex = null;
}

/* ===== Delete Confirmation ===== */
let pendingDeleteIndex = null;

function confirmDelete(index) {
  pendingDeleteIndex = index;
  document.getElementById('confirm-message').textContent =
    `Delete "${searches[index].label}"? This cannot be undone.`;
  confirmOverlay.hidden = false;
}

document.getElementById('confirm-ok').addEventListener('click', () => {
  if (pendingDeleteIndex !== null) {
    searches.splice(pendingDeleteIndex, 1);
    saveSearches();
    render();
    pendingDeleteIndex = null;
  }
  confirmOverlay.hidden = true;
});

document.getElementById('confirm-cancel').addEventListener('click', () => {
  pendingDeleteIndex = null;
  confirmOverlay.hidden = true;
});

/* ===== Add/Edit Form ===== */
function resetForm() {
  searchForm.reset();
  document.getElementById('form-id').value = '';
  document.getElementById('form-city').value = settings.city || '';
  document.getElementById('form-max-price').value = settings.maxPrice || '';
  document.getElementById('form-max-mileage').value = settings.maxMileage || '';
  document.getElementById('form-radius').value = settings.radius || '';
  document.getElementById('form-seller-type').value = 'individual';
  document.getElementById('modal-title').textContent = 'Add Search';
  document.getElementById('form-submit-btn').textContent = 'Add Search';
}

function openEditForm(index) {
  const s = searches[index];
  document.getElementById('form-id').value = s.id;
  document.getElementById('form-label').value = s.label;
  document.getElementById('form-slug').value = s.slug;
  document.getElementById('form-city').value = s.city || settings.city || '';
  document.getElementById('form-min-year').value = s.minYear || '';
  document.getElementById('form-max-year').value = s.maxYear || '';
  document.getElementById('form-max-price').value = s.maxPrice || '';
  document.getElementById('form-max-mileage').value = s.maxMileage || '';
  document.getElementById('form-transmission').value = s.transmission || '';
  document.getElementById('form-radius').value = s.radius || '';
  document.getElementById('form-seller-type').value = s.sellerType || '';
  document.getElementById('form-notes').value = s.notes || '';
  document.getElementById('modal-title').textContent = 'Edit Search';
  document.getElementById('form-submit-btn').textContent = 'Save Changes';
  modalOverlay.hidden = false;
}

// Open add form
document.getElementById('add-search-btn').addEventListener('click', () => {
  resetForm();
  modalOverlay.hidden = false;
  document.getElementById('form-label').focus();
});

// Submit form
searchForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const id = document.getElementById('form-id').value;
  const data = {
    id: id || genId(),
    label: document.getElementById('form-label').value.trim(),
    slug: document.getElementById('form-slug').value.trim(),
    city: document.getElementById('form-city').value.trim() || settings.city || 'chicago',
    minYear: parseInt(document.getElementById('form-min-year').value) || null,
    maxYear: parseInt(document.getElementById('form-max-year').value) || null,
    maxPrice: parseInt(document.getElementById('form-max-price').value) || null,
    maxMileage: parseInt(document.getElementById('form-max-mileage').value) || null,
    transmission: document.getElementById('form-transmission').value,
    radius: parseInt(document.getElementById('form-radius').value) || null,
    sellerType: document.getElementById('form-seller-type').value,
    notes: document.getElementById('form-notes').value.trim(),
    lastChecked: null,
  };

  if (id) {
    const idx = searches.findIndex(s => s.id === id);
    if (idx !== -1) {
      data.lastChecked = searches[idx].lastChecked;
      searches[idx] = data;
    }
  } else {
    searches.push(data);
  }

  saveSearches();
  render();
  modalOverlay.hidden = true;
});

// Open All
document.getElementById('open-all-btn').addEventListener('click', openAllSearches);

/* ===== Settings ===== */
document.getElementById('settings-btn').addEventListener('click', () => {
  document.getElementById('settings-city').value = settings.city || '';
  document.getElementById('settings-max-price').value = settings.maxPrice || '';
  document.getElementById('settings-max-mileage').value = settings.maxMileage || '';
  document.getElementById('settings-radius').value = settings.radius || '';
  settingsOverlay.hidden = false;
});

settingsForm.addEventListener('submit', (e) => {
  e.preventDefault();
  settings.city = document.getElementById('settings-city').value.trim() || 'chicago';
  settings.maxPrice = parseInt(document.getElementById('settings-max-price').value) || null;
  settings.maxMileage = parseInt(document.getElementById('settings-max-mileage').value) || null;
  settings.radius = parseInt(document.getElementById('settings-radius').value) || null;
  saveSettings();
  settingsOverlay.hidden = true;
});

/* ===== Import / Export ===== */
document.getElementById('import-export-btn').addEventListener('click', () => {
  ieOverlay.hidden = false;
});

document.getElementById('export-btn').addEventListener('click', () => {
  const data = { searches, settings };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'car-searches-backup.json';
  a.click();
  URL.revokeObjectURL(url);
});

const importFile = document.getElementById('import-file');
const importBtn = document.getElementById('import-btn');

importFile.addEventListener('change', () => {
  importBtn.disabled = !importFile.files.length;
});

importBtn.addEventListener('click', () => {
  const file = importFile.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const data = JSON.parse(e.target.result);
      if (data.searches && Array.isArray(data.searches)) {
        searches = data.searches;
        saveSearches();
      }
      if (data.settings && typeof data.settings === 'object') {
        settings = { ...DEFAULT_SETTINGS, ...data.settings };
        saveSettings();
      }
      render();
      ieOverlay.hidden = true;
    } catch (err) {
      alert('Invalid JSON file. Please check the file and try again.');
    }
  };
  reader.readAsText(file);
});

/* ===== Modal Close Handlers ===== */
function setupModalClose(overlay) {
  // Close on backdrop click
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) overlay.hidden = true;
  });
  // Close on X button
  overlay.querySelectorAll('.modal-close').forEach(btn => {
    btn.addEventListener('click', () => { overlay.hidden = true; });
  });
}

[modalOverlay, settingsOverlay, ieOverlay, confirmOverlay].forEach(setupModalClose);

// Close on Escape
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    [modalOverlay, settingsOverlay, ieOverlay, confirmOverlay].forEach(o => { o.hidden = true; });
  }
});

/* ===== Live Timestamp Updates ===== */
setInterval(() => {
  document.querySelectorAll('.card-timestamp[data-ts]').forEach(el => {
    const ts = parseInt(el.dataset.ts);
    if (ts) el.textContent = relativeTime(ts);
  });
}, 30000); // update every 30s

/* ===== Init ===== */
const storedSeedVersion = parseInt(localStorage.getItem(STORAGE_SEED_VERSION)) || 0;
if (!searches || storedSeedVersion < CURRENT_SEED_VERSION) {
  searches = DEFAULT_SEARCHES;
  saveSearches();
  localStorage.setItem(STORAGE_SEED_VERSION, CURRENT_SEED_VERSION);
}
render();
