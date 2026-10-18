/* =========================================================
   Aurelia Hotel — shared UI behaviour
   ========================================================= */

/* ---------- Mobile navigation ---------- */
document.addEventListener('click', e => {
  const toggle = e.target.closest('.nav__toggle');
  if (toggle) {
    const links = document.getElementById('navLinks');
    if (links) {
      const open = links.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    }
  }
});

/* ---------- Footer year + current page highlight ---------- */
document.addEventListener('DOMContentLoaded', () => {
  const y = document.getElementById('year');
  if (y) y.textContent = new Date().getFullYear();

  const here = (location.pathname.split('/').pop() || 'index.html').toLowerCase();
  document.querySelectorAll('.nav__links a').forEach(a => {
    const href = (a.getAttribute('href') || '').split('?')[0].toLowerCase();
    if (href === here) a.setAttribute('aria-current', 'page');
  });

  // Make sure the demo always has something on the books.
  if (typeof seedDemoBookingsOnce === 'function') {
    try { seedDemoBookingsOnce(); } catch (e) { console.warn(e); }
  }
});

/* ---------- Small helpers used across pages ---------- */

function qs(sel, root) { return (root || document).querySelector(sel); }
function qsa(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }

function el(tag, attrs, children) {
  const node = document.createElement(tag);
  if (attrs) {
    Object.keys(attrs).forEach(k => {
      if (k === 'class') node.className = attrs[k];
      else if (k === 'html') node.innerHTML = attrs[k];
      else if (k === 'text') node.textContent = attrs[k];
      else if (k.startsWith('on') && typeof attrs[k] === 'function') node.addEventListener(k.slice(2), attrs[k]);
      else if (attrs[k] !== null && attrs[k] !== undefined) node.setAttribute(k, attrs[k]);
    });
  }
  (children || []).forEach(c => node.appendChild(typeof c === 'string' ? document.createTextNode(c) : c));
  return node;
}

/** Read ?key=value from the URL. */
function param(name) {
  return new URLSearchParams(location.search).get(name) || '';
}

/** Minimum selectable date for the date inputs = today. */
function applyDateBounds(inEl, outEl) {
  if (!inEl || !outEl) return;
  const min = todayISO();
  inEl.min = min;
  outEl.min = todayISO(1);

  const sync = () => {
    if (!inEl.value) return;
    const nextDay = new Date(inEl.value + 'T12:00:00');
    nextDay.setDate(nextDay.getDate() + 1);
    const minOut = nextDay.toISOString().slice(0, 10);
    outEl.min = minOut;
    if (!outEl.value || outEl.value <= inEl.value) outEl.value = minOut;
  };
  inEl.addEventListener('change', sync);
  sync();
}

/** Simple tab controller: .tabs button[data-tab] + .tabpanel[id] */
function initTabs(root) {
  const scope = root || document;
  const buttons = qsa('.tabs button[data-tab]', scope);
  if (!buttons.length) return;
  const show = id => {
    buttons.forEach(b => b.setAttribute('aria-selected', b.dataset.tab === id ? 'true' : 'false'));
    qsa('.tabpanel', scope).forEach(p => { p.hidden = (p.id !== id); });
  };
  buttons.forEach(b => b.addEventListener('click', () => show(b.dataset.tab)));
  show(buttons[0].dataset.tab);
  return show;
}

/** Toast-style inline message into a container. */
function showNotice(container, kind, message) {
  if (!container) return;
  container.innerHTML = '';
  container.appendChild(el('div', { class: 'notice notice--' + kind, html: message }));
  container.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}
