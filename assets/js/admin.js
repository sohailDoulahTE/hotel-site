/* =========================================================
   Aurelia Hotel — front desk / admin panel
   Demo only: the passcode gate is cosmetic, see README.
   ========================================================= */

const DEMO_PASSCODE = 'aurelia';
const GATE_KEY = 'aurelia.staff.v1';

document.addEventListener('DOMContentLoaded', () => {

  /* ---------------- Gate ---------------- */
  const gate = qs('#gate'), app = qs('#app'), logout = qs('#logoutBtn');

  function unlock() {
    gate.hidden = true;
    app.hidden = false;
    logout.hidden = false;
    initTabs();
    refreshAll();
  }

  if (sessionStorage.getItem(GATE_KEY) === 'ok') unlock();

  qs('#gateForm').addEventListener('submit', e => {
    e.preventDefault();
    if (qs('#pin').value.trim().toLowerCase() === DEMO_PASSCODE) {
      sessionStorage.setItem(GATE_KEY, 'ok');
      unlock();
    } else {
      showNotice(qs('#gateNotice'), 'bad', '<span>⚠</span><span>Wrong passcode. It is <strong>aurelia</strong>.</span>');
    }
  });

  logout.addEventListener('click', () => {
    sessionStorage.removeItem(GATE_KEY);
    location.reload();
  });

  /* ---------------- Shared helpers ---------------- */

  const STATUS_BADGE = {
    'confirmed':  'badge--info',
    'checked-in': 'badge--ok',
    'checked-out':'badge--grey',
    'cancelled':  'badge--bad'
  };

  function statusBadge(s) {
    return `<span class="badge ${STATUS_BADGE[s] || 'badge--grey'}">${s.replace('-', ' ')}</span>`;
  }

  /** Bookings that cover tonight (checked in today or earlier, out tomorrow or later). */
  function inHouseTonight() {
    const t = todayISO();
    return DB.bookings().filter(b =>
      ACTIVE_STATUSES.includes(b.status) && b.checkIn <= t && b.checkOut > t);
  }

  function refreshAll() {
    renderDashboard();
    renderBookings();
    renderRooms();
    renderRates();
    renderDump();
  }

  /* ---------------- Dashboard ---------------- */

  function renderDashboard() {
    const today = todayISO();
    const all = DB.bookings();
    const rooms = DB.rooms();
    const tonight = inHouseTonight();
    const sellable = rooms.filter(r => r.status === 'available').length;
    const occupancy = sellable ? Math.round(tonight.length / sellable * 100) : 0;

    const thisMonth = all
      .filter(b => b.status !== 'cancelled')
      .filter(b => b.checkIn.slice(0, 7) === today.slice(0, 7))
      .reduce((sum, b) => sum + b.total, 0);

    const arrivals = all.filter(b => b.checkIn === today && b.status === 'confirmed');
    const departures = all.filter(b => b.checkOut === today && ACTIVE_STATUSES.includes(b.status));

    qs('#dashStats').innerHTML = `
      <div class="stat">
        <span class="stat__label">Occupancy tonight</span>
        <span class="stat__value">${occupancy}%</span>
        <span class="stat__note">${tonight.length} of ${sellable} sellable rooms</span>
      </div>
      <div class="stat">
        <span class="stat__label">Arrivals today</span>
        <span class="stat__value">${arrivals.length}</span>
        <span class="stat__note">${departures.length} departure${departures.length === 1 ? '' : 's'}</span>
      </div>
      <div class="stat">
        <span class="stat__label">Revenue this month</span>
        <span class="stat__value">${moneyTk(thisMonth)}</span>
        <span class="stat__note">booked value, incl. VAT</span>
      </div>
      <div class="stat">
        <span class="stat__label">Bookings on file</span>
        <span class="stat__value">${all.length}</span>
        <span class="stat__note">${all.filter(b => b.status === 'cancelled').length} cancelled</span>
      </div>`;

    const list = (host, rows, emptyText, action) => {
      host.innerHTML = '';
      if (!rows.length) { host.appendChild(el('div', { class: 'empty small', text: emptyText })); return; }
      const table = el('div', { class: 'stack-sm' });
      rows.forEach(b => {
        const row = el('div', { class: 'between', style: 'border-bottom:1px solid var(--line);padding:9px 0' });
        row.innerHTML = `
          <div>
            <strong>${b.guest.name || '—'}</strong>
            <div class="small muted">${b.typeName} · room ${b.roomNumber} · ${b.ref}</div>
          </div>
          <div class="actions">
            <button class="btn btn--ghost" data-act="${action.key}" data-ref="${b.ref}">${action.label}</button>
          </div>`;
        table.appendChild(row);
      });
      host.appendChild(table);
    };

    list(qs('#arrivals'), arrivals, 'No arrivals today.', { key: 'checkin', label: 'Check in' });
    list(qs('#departures'), departures, 'No departures today.', { key: 'checkout', label: 'Check out' });

    /* Occupancy per type */
    const occ = qs('#occByType');
    occ.innerHTML = '';
    DB.types().forEach(t => {
      const total = sellableRooms(t.code).length;
      const used = tonight.filter(b => b.typeCode === t.code).length;
      const pct = total ? Math.round(used / total * 100) : 0;
      const row = el('div');
      row.innerHTML = `
        <div class="between" style="margin-bottom:5px">
          <strong class="small">${t.name}</strong>
          <span class="small muted">${used} / ${total} · ${pct}%</span>
        </div>
        <div class="occ-bar"><span style="width:${pct}%"></span></div>`;
      occ.appendChild(row);
    });
  }

  /* ---------------- Bookings ---------------- */

  function filteredBookings() {
    const today = todayISO();
    const mode = qs('#f-status').value;
    const term = qs('#f-search').value.trim().toLowerCase();

    return DB.bookings()
      .filter(b => {
        if (mode === 'all') return true;
        if (mode === 'cancelled') return b.status === 'cancelled';
        if (mode === 'upcoming')  return b.status === 'confirmed' && b.checkIn > today;
        if (mode === 'in-house')  return ACTIVE_STATUSES.includes(b.status) && b.checkIn <= today && b.checkOut > today;
        if (mode === 'past')      return b.status === 'checked-out' || b.checkOut <= today;
        return true;
      })
      .filter(b => {
        if (!term) return true;
        return [b.ref, b.guest.name, b.guest.email, b.guest.phone, b.roomNumber, b.typeName]
          .join(' ').toLowerCase().includes(term);
      })
      .sort((a, b) => a.checkIn.localeCompare(b.checkIn) || a.ref.localeCompare(b.ref));
  }

  function renderBookings() {
    const rows = filteredBookings();
    const host = qs('#bookingRows');
    const empty = qs('#bookingEmpty');
    host.innerHTML = '';
    empty.innerHTML = '';

    if (!rows.length) {
      empty.appendChild(el('div', { class: 'empty', text: 'No bookings match that filter.' }));
      return;
    }

    rows.forEach(b => {
      const tr = el('tr');
      const canCheckIn  = b.status === 'confirmed';
      const canCheckOut = b.status === 'checked-in';
      const canCancel   = b.status === 'confirmed' || b.status === 'checked-in';

      tr.innerHTML = `
        <td><strong>${b.ref}</strong><div class="small muted">${prettyDateTime(b.createdAt).split(',')[0]}</div></td>
        <td>${b.guest.name || '—'}<div class="small muted">${b.guest.email || ''}</div></td>
        <td>${b.typeName}<div class="small muted">Room ${b.roomNumber}</div></td>
        <td class="nowrap">${prettyDate(b.checkIn)}<div class="small muted">→ ${prettyDate(b.checkOut)} (${b.nights}n)</div></td>
        <td class="num">${moneyTk(b.total)}<div class="small muted">${b.paid ? 'paid' : 'due'}</div></td>
        <td>${statusBadge(b.status)}</td>
        <td>
          <div class="actions">
            ${canCheckIn  ? `<button class="btn btn--ghost" data-act="checkin"  data-ref="${b.ref}">Check in</button>` : ''}
            ${canCheckOut ? `<button class="btn btn--ghost" data-act="checkout" data-ref="${b.ref}">Check out</button>` : ''}
            ${!b.paid && b.status !== 'cancelled' ? `<button class="btn btn--ghost" data-act="paid" data-ref="${b.ref}">Mark paid</button>` : ''}
            <a class="btn btn--ghost" href="invoice.html?ref=${encodeURIComponent(b.ref)}">Invoice</a>
            ${canCancel ? `<button class="btn btn--ghost" data-act="cancel" data-ref="${b.ref}" style="color:var(--bad)">Cancel</button>` : ''}
          </div>
        </td>`;
      host.appendChild(tr);
    });
  }

  qs('#f-status').addEventListener('change', renderBookings);
  qs('#f-search').addEventListener('input', renderBookings);

  /* Action delegation (dashboard + bookings table) */
  document.addEventListener('click', e => {
    const btn = e.target.closest('button[data-act]');
    if (!btn) return;
    const ref = btn.dataset.ref;
    const act = btn.dataset.act;

    if (act === 'checkin')  updateBooking(ref, { status: 'checked-in' });
    if (act === 'checkout') updateBooking(ref, { status: 'checked-out', paid: true });
    if (act === 'paid')     updateBooking(ref, { paid: true });
    if (act === 'cancel') {
      if (!confirm('Cancel booking ' + ref + '? The room goes back into availability.')) return;
      updateBooking(ref, { status: 'cancelled' });
    }
    if (act === 'room-status') {
      const rooms = DB.rooms();
      const r = rooms.find(x => x.id === btn.dataset.room);
      if (r) {
        const order = ['available', 'maintenance', 'offline'];
        r.status = order[(order.indexOf(r.status) + 1) % order.length];
        DB.setRooms(rooms);
      }
    }
    if (act === 'room-delete') {
      const rooms = DB.rooms();
      const r = rooms.find(x => x.id === btn.dataset.room);
      if (!r) return;
      const future = DB.bookings().filter(b =>
        ACTIVE_STATUSES.includes(b.status) && b.roomNumber === r.number && b.checkOut > todayISO());
      if (future.length) {
        alert(`Room ${r.number} has ${future.length} live booking(s). Cancel or move them first.`);
        return;
      }
      if (!confirm('Remove room ' + r.number + ' from inventory?')) return;
      DB.setRooms(rooms.filter(x => x.id !== r.id));
    }

    refreshAll();
  });

  /* ---------------- Walk-in booking ---------------- */

  const panel = qs('#newBookingPanel');
  qs('#newBookingBtn').addEventListener('click', () => {
    panel.hidden = !panel.hidden;
    if (!panel.hidden) panel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  });
  qs('#walkinCancel').addEventListener('click', () => { panel.hidden = true; });

  qs('#w-in').value = todayISO();
  qs('#w-out').value = todayISO(1);
  applyDateBounds(qs('#w-in'), qs('#w-out'));

  qs('#walkinForm').addEventListener('submit', e => {
    e.preventDefault();
    const out = qs('#walkinNotice');
    const res = createBooking({
      typeCode: qs('#w-type').value,
      checkIn: qs('#w-in').value,
      checkOut: qs('#w-out').value,
      guests: Number(qs('#w-guests').value),
      guest: {
        name: qs('#w-name').value.trim(),
        email: qs('#w-email').value.trim(),
        phone: qs('#w-phone').value.trim(),
        notes: 'Walk-in, created at the front desk'
      },
      offerCode: qs('#w-offer').value,
      source: 'front desk'
    });

    if (!res.ok) { showNotice(out, 'bad', '<span>⚠</span><span>' + res.error + '</span>'); return; }

    showNotice(out, 'ok', `<span>✓</span><span>Booked <strong>${res.booking.ref}</strong> into room
      ${res.booking.roomNumber}. <a href="invoice.html?ref=${res.booking.ref}">Open invoice</a>.</span>`);
    qs('#walkinForm').reset();
    qs('#w-in').value = todayISO();
    qs('#w-out').value = todayISO(1);
    refreshAll();
  });

  /* ---------------- Rooms ---------------- */

  function renderRooms() {
    const rooms = DB.rooms().slice().sort((a, b) => Number(a.number) - Number(b.number));
    const today = todayISO();
    const occupiedTonight = new Set(inHouseTonight().map(b => b.roomNumber));

    qs('#roomCount').textContent =
      `${rooms.length} rooms · ${rooms.filter(r => r.status === 'available').length} sellable`;

    const host = qs('#roomRows');
    host.innerHTML = '';
    rooms.forEach(r => {
      const t = DB.type(r.type);
      const busy = occupiedTonight.has(r.number);
      const badge = r.status === 'available' ? '<span class="badge badge--ok">available</span>'
                  : r.status === 'maintenance' ? '<span class="badge badge--warn">maintenance</span>'
                  : '<span class="badge badge--bad">out of service</span>';
      const tr = el('tr');
      tr.innerHTML = `
        <td><strong>${r.number}</strong></td>
        <td>${t ? t.name : r.type}</td>
        <td class="num">${r.floor}</td>
        <td>${badge}</td>
        <td>${busy ? '<span class="badge badge--info">occupied</span>' : '<span class="badge badge--grey">vacant</span>'}</td>
        <td class="small muted">${r.note || ''}</td>
        <td>
          <div class="actions">
            <button class="btn btn--ghost" data-act="room-status" data-room="${r.id}">Next status</button>
            <button class="btn btn--ghost" data-act="room-delete" data-room="${r.id}" style="color:var(--bad)">Remove</button>
          </div>
        </td>`;
      host.appendChild(tr);
    });
  }

  qs('#addRoomForm').addEventListener('submit', e => {
    e.preventDefault();
    const out = qs('#roomNotice');
    const number = qs('#r-number').value.trim();
    const type = qs('#r-type').value;

    if (!/^\d{2,4}$/.test(number)) {
      showNotice(out, 'bad', '<span>⚠</span><span>Room numbers are 2–4 digits, e.g. 207.</span>'); return;
    }
    const rooms = DB.rooms();
    if (rooms.some(r => r.number === number)) {
      showNotice(out, 'bad', `<span>⚠</span><span>Room ${number} already exists.</span>`); return;
    }

    rooms.push({
      id: 'R' + number,
      number,
      type,
      floor: Number(number[0]),
      status: qs('#r-status').value,
      note: qs('#r-note').value.trim()
    });
    DB.setRooms(rooms);
    showNotice(out, 'ok', `<span>✓</span><span>Room ${number} added.</span>`);
    qs('#addRoomForm').reset();
    refreshAll();
  });

  /* ---------------- Rates ---------------- */

  function renderRates() {
    const types = DB.types();
    const host = qs('#rateRows');
    host.innerHTML = '';
    types.forEach(t => {
      const tr = el('tr');
      tr.innerHTML = `
        <td><strong>${t.code}</strong></td>
        <td>${t.name}</td>
        <td class="num"><input class="input" style="width:120px;text-align:right" type="number" min="0" step="100" value="${t.rate}" data-rate="${t.code}"></td>
        <td class="num"><input class="input" style="width:72px;text-align:right" type="number" min="1" max="8" value="${t.capacity}" data-cap="${t.code}"></td>
        <td class="num">${t.size}</td>
        <td class="num">${sellableRooms(t.code).length}</td>
        <td class="num"><button class="btn btn--primary btn--sm" type="button" data-save="${t.code}">Save</button></td>`;
      host.appendChild(tr);
    });

    qsa('button[data-save]', host).forEach(btn => {
      btn.addEventListener('click', () => {
        const code = btn.dataset.save;
        const types2 = DB.types();
        const t = types2.find(x => x.code === code);
        if (!t) return;
        t.rate = Number(qs(`input[data-rate="${code}"]`).value) || t.rate;
        t.capacity = Number(qs(`input[data-cap="${code}"]`).value) || t.capacity;
        DB.setTypes(types2);
        showNotice(qs('#rateNotice'), 'ok', `<span>✓</span><span>${t.name} updated — ${moneyTk(t.rate)} per night, sleeps ${t.capacity}.</span>`);
        refreshAll();
      });
    });
  }

  /* ---------------- Data tab ---------------- */

  function renderDump() {
    const d = DB.exportAll();
    qs('#dump').textContent = JSON.stringify(
      { roomTypes: d.roomTypes.length + ' types', rooms: d.rooms.length + ' rooms', bookings: d.bookings },
      null, 2);
  }

  qs('#exportBtn').addEventListener('click', () => {
    const blob = new Blob([JSON.stringify(DB.exportAll(), null, 2)], { type: 'application/json' });
    const a = el('a', { href: URL.createObjectURL(blob), download: 'aurelia-data-' + todayISO() + '.json' });
    document.body.appendChild(a); a.click(); a.remove();
    showNotice(qs('#dataNotice'), 'ok', '<span>✓</span><span>Exported. Check your downloads folder.</span>');
  });

  qs('#reseedBtn').addEventListener('click', () => {
    if (!confirm('This wipes every booking and room change in this browser and restores the demo data. Continue?')) return;
    DB.reset();
    seedDemoBookingsOnce();
    populateTypeSelects();
    refreshAll();
    showNotice(qs('#dataNotice'), 'ok', '<span>✓</span><span>Demo data restored.</span>');
  });

  /* ---------------- Type dropdowns ---------------- */

  function populateTypeSelects() {
    [qs('#w-type'), qs('#r-type')].forEach(sel => {
      if (!sel) return;
      sel.innerHTML = '';
      DB.types().forEach(t => sel.appendChild(el('option', { value: t.code, text: `${t.name} (${moneyTk(t.rate)})` })));
    });
  }

  populateTypeSelects();
});
