/* =========================================================
   Aurelia Hotel — booking engine (front end)
   Live availability → room choice → auto room assignment
   ========================================================= */

document.addEventListener('DOMContentLoaded', () => {

  const inEl     = qs('#b-in');
  const outEl    = qs('#b-out');
  const guestsEl = qs('#b-guests');
  const offerEl  = qs('#b-offer');
  const pickHost = qs('#roomPick');
  const sumHost  = qs('#summaryBody');
  const notice   = qs('#bookNotice');
  const hint     = qs('#nightsHint');

  let selectedType = param('type') || '';

  /* ---------- Prefill from the URL (?in=&out=&guests=&type=&offer=) ---------- */
  inEl.value  = param('in')  || todayISO();
  outEl.value = param('out') || todayISO(1);
  if (param('guests')) guestsEl.value = param('guests');
  if (param('offer'))  offerEl.value  = param('offer').toUpperCase();
  applyDateBounds(inEl, outEl);

  /* ---------- Render the room chooser for the current dates ---------- */
  function renderRooms() {
    const checkIn  = inEl.value;
    const checkOut = outEl.value;
    const guests   = Number(guestsEl.value);

    pickHost.innerHTML = '';

    if (!checkIn || !checkOut || outEl.value <= inEl.value) {
      pickHost.appendChild(el('div', { class: 'empty', text: 'Pick a check-in and check-out date to see what is free.' }));
      hint.textContent = '';
      return;
    }

    const nights = nightsBetween(checkIn, checkOut);
    hint.innerHTML = `<strong>${nights} night${nights > 1 ? 's' : ''}</strong> · ` +
      `${prettyDate(checkIn)} → ${prettyDate(checkOut)} · check-in from ${HOTEL.checkIn}, check-out by ${HOTEL.checkOut}`;

    const rows = availability(checkIn, checkOut, guests);
    let anySelectable = false;

    rows.forEach(r => {
      const t = r.type;
      const tooSmall = !r.fitsGuests;
      const soldOut  = r.free === 0;
      const disabled = tooSmall || soldOut;
      if (!disabled) anySelectable = true;

      let status;
      if (tooSmall)      status = `<span class="badge badge--grey">Sleeps ${t.capacity}</span>`;
      else if (soldOut)  status = `<span class="badge badge--bad">Fully booked</span>`;
      else if (r.free <= 2) status = `<span class="badge badge--warn">Only ${r.free} left</span>`;
      else               status = `<span class="badge badge--ok">${r.free} free</span>`;

      const label = el('label', { class: disabled ? 'is-out' : '' });
      label.innerHTML = `
        <input type="radio" name="roomType" value="${t.code}" ${disabled ? 'disabled' : ''}>
        <span class="pick__body">
          <strong>${t.name}</strong>
          <span class="small muted">${t.size} m² · ${t.bed} · up to ${t.capacity} guests</span>
        </span>
        <span style="text-align:right">
          <span class="price" style="font-size:1.05rem">${moneyTk(t.rate)}</span>
          <span class="small muted" style="display:block">per night</span>
          <span style="display:block;margin-top:6px">${status}</span>
        </span>`;
      pickHost.appendChild(label);
    });

    if (!anySelectable) {
      pickHost.appendChild(el('div', { class: 'notice notice--warn', html:
        '<span>⚠</span><span>Nothing is free for those dates and party size. Try moving your dates by a day or two.</span>' }));
    }

    /* Restore / default the selection */
    const radios = qsa('input[name="roomType"]', pickHost);
    const wanted = radios.find(r => r.value === selectedType && !r.disabled);
    const first  = radios.find(r => !r.disabled);
    const chosen = wanted || first;
    if (chosen) { chosen.checked = true; selectedType = chosen.value; }
    else selectedType = '';

    radios.forEach(r => r.addEventListener('change', () => {
      selectedType = r.value;
      renderSummary();
    }));

    renderSummary();
  }

  /* ---------- Price summary ---------- */
  function renderSummary() {
    const checkIn = inEl.value, checkOut = outEl.value;

    if (!selectedType || !checkIn || !checkOut || checkOut <= checkIn) {
      sumHost.innerHTML = '<p class="small muted">Choose your dates and a room and the price appears here.</p>';
      return;
    }

    const q = quote(selectedType, checkIn, checkOut, offerEl.value);
    const free = freeRooms(selectedType, checkIn, checkOut);

    let offerLine = '';
    if (q.offer) {
      offerLine = `<div class="sum-line" style="color:var(--ok)">
          <span>${q.offer.code} — ${q.offer.percent}% off</span>
          <span>−${moneyTk(q.discount)}</span></div>`;
    } else if (q.offerRejected) {
      offerLine = `<div class="notice notice--warn small" style="margin:10px 0">
          <span>⚠</span><span>${q.offerRejected.code} needs a minimum stay of
          ${q.offerRejected.minNights} nights.</span></div>`;
    } else if (offerEl.value.trim()) {
      offerLine = `<div class="notice notice--warn small" style="margin:10px 0">
          <span>⚠</span><span>We don't recognise that code. See <a href="offers.html">current offers</a>.</span></div>`;
    }

    sumHost.innerHTML = `
      <div class="stack-sm" style="margin-bottom:14px">
        <div><strong>${q.typeName}</strong></div>
        <div class="small muted">${prettyDate(checkIn)} → ${prettyDate(checkOut)}</div>
        <div class="small muted">${q.nights} night${q.nights > 1 ? 's' : ''} · ${guestsEl.value} guest${guestsEl.value > 1 ? 's' : ''}</div>
        <div>${free.length ? `<span class="badge badge--ok">${free.length} room${free.length > 1 ? 's' : ''} free</span>`
                           : '<span class="badge badge--bad">Fully booked</span>'}</div>
      </div>
      <div class="sum-line"><span>${moneyTk(q.rate)} × ${q.nights} night${q.nights > 1 ? 's' : ''}</span><span>${moneyTk(q.roomTotal)}</span></div>
      ${offerLine}
      <div class="sum-line"><span>Service charge (10%)</span><span>${moneyTk(q.service)}</span></div>
      <div class="sum-line"><span>VAT (15%)</span><span>${moneyTk(q.vat)}</span></div>
      <div class="sum-line sum-line--total"><span>Total</span><span>${moneyTk(q.total)}</span></div>
      <p class="hint mt-2" style="margin-bottom:0">Payable at the hotel on check-out.</p>`;
  }

  /* ---------- Wire up inputs ---------- */
  [inEl, outEl, guestsEl].forEach(x => x.addEventListener('change', renderRooms));
  offerEl.addEventListener('input', renderSummary);

  /* ---------- Submit ---------- */
  qs('#bookForm').addEventListener('submit', e => {
    e.preventDefault();

    const name  = qs('#g-name').value.trim();
    const email = qs('#g-email').value.trim();
    const phone = qs('#g-phone').value.trim();

    if (!selectedType) {
      showNotice(notice, 'bad', '<span>⚠</span><span>Please choose a room first.</span>'); return;
    }
    if (!name || !email || !phone) {
      showNotice(notice, 'bad', '<span>⚠</span><span>We need your name, email and phone number to hold the room.</span>'); return;
    }
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      showNotice(notice, 'bad', '<span>⚠</span><span>That email address does not look right.</span>'); return;
    }

    const notes = [
      'Arrival: ' + qs('#g-arrival').value,
      qs('#g-notes').value.trim()
    ].filter(Boolean).join(' · ');

    const res = createBooking({
      typeCode: selectedType,
      checkIn: inEl.value,
      checkOut: outEl.value,
      guests: Number(guestsEl.value),
      guest: { name, email, phone, notes },
      offerCode: offerEl.value,
      source: 'website'
    });

    if (!res.ok) {
      showNotice(notice, 'bad', '<span>⚠</span><span>' + res.error + '</span>');
      renderRooms();
      return;
    }

    showConfirmation(res.booking);
  });

  /* ---------- Confirmation view ---------- */
  function showConfirmation(b) {
    qs('#bookingSection').hidden = true;
    const sec = qs('#confirmSection');
    sec.hidden = false;

    qs('#confirmTitle').textContent = `Thank you, ${b.guest.name.split(' ')[0]} — room ${b.roomNumber} is yours`;
    qs('#confirmBody').innerHTML = `
      <div class="grid grid--2" style="gap:14px;margin-top:14px">
        <div class="stack-sm">
          <div><span class="label">Reference</span><br><strong style="font-size:1.25rem;letter-spacing:.04em">${b.ref}</strong></div>
          <div><span class="label">Room</span><br><strong>${b.typeName} · Room ${b.roomNumber}</strong></div>
          <div><span class="label">Guests</span><br>${b.guests}</div>
        </div>
        <div class="stack-sm">
          <div><span class="label">Check in</span><br><strong>${prettyDate(b.checkIn)}</strong> from ${HOTEL.checkIn}</div>
          <div><span class="label">Check out</span><br><strong>${prettyDate(b.checkOut)}</strong> by ${HOTEL.checkOut}</div>
          <div><span class="label">Total payable</span><br><strong style="font-size:1.25rem">${moneyTk(b.total)}</strong>
            <span class="small muted">incl. service &amp; VAT</span></div>
        </div>
      </div>
      <p class="small muted mt-2" style="margin-bottom:0">
        A confirmation would normally be emailed to <strong>${b.guest.email}</strong>.
        Keep your reference — you can pull the invoice up again from the booking page at any time.
      </p>`;

    qs('#confirmInvoice').href = 'invoice.html?ref=' + encodeURIComponent(b.ref);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  /* ---------- Existing-booking lookup ---------- */
  qs('#lookupForm').addEventListener('submit', e => {
    e.preventDefault();
    const ref = qs('#lk-ref').value.trim().toUpperCase();
    const out = qs('#lookupNotice');
    if (!ref) { showNotice(out, 'warn', '<span>⚠</span><span>Type your booking reference first.</span>'); return; }
    const b = DB.booking(ref);
    if (!b) {
      showNotice(out, 'bad', `<span>⚠</span><span>No booking found for <strong>${ref}</strong> in this browser.
        Bookings in this demo are stored locally, so a reference made on another device will not show up here.</span>`);
      return;
    }
    showNotice(out, 'ok', `<span>✓</span><span><strong>${b.guest.name}</strong> — ${b.typeName}, room ${b.roomNumber},
      ${prettyDate(b.checkIn)} → ${prettyDate(b.checkOut)}.
      <a href="invoice.html?ref=${encodeURIComponent(b.ref)}">Open the invoice</a>.</span>`);
  });

  /* ---------- Go ---------- */
  renderRooms();
});
