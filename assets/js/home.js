/* Home page: availability search, room preview, offer preview */

document.addEventListener('DOMContentLoaded', () => {
  const inEl     = qs('#q-in');
  const outEl    = qs('#q-out');
  const guestsEl = qs('#q-guests');
  const typeEl   = qs('#q-type');
  const results  = qs('#searchResults');

  /* Default dates: tonight → tomorrow */
  inEl.value  = todayISO();
  outEl.value = todayISO(1);
  applyDateBounds(inEl, outEl);

  /* Room type dropdown */
  DB.types().forEach(t => {
    typeEl.appendChild(el('option', { value: t.code, text: `${t.name} — ${moneyTk(t.rate)}` }));
  });

  /* Room preview — first three types */
  const preview = qs('#roomPreview');
  DB.types().slice(0, 3).forEach(t => preview.appendChild(roomCard(t, { ctaLabel: 'Check dates' })));

  /* Offers */
  const offers = qs('#offerPreview');
  OFFERS.forEach(o => offers.appendChild(offerCard(o)));

  /* Search */
  qs('#searchForm').addEventListener('submit', e => {
    e.preventDefault();
    if (!inEl.value || !outEl.value || outEl.value <= inEl.value) {
      showNotice(results, 'bad', '<span>⚠</span><span>Please pick a check-out date after your check-in date.</span>');
      return;
    }
    renderAvailability(results, inEl.value, outEl.value, Number(guestsEl.value), typeEl.value);
    results.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });

  /* Show tonight's availability on first load */
  renderAvailability(results, inEl.value, outEl.value, Number(guestsEl.value), '');
});
