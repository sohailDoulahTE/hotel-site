/* =========================================================
   Aurelia Hotel — shared room/offer rendering
   Used by index.html, rooms.html and booking.html
   ========================================================= */

/**
 * A room-type card.
 * opts: { availability: {free,total}|null, checkIn, checkOut, guests, ctaLabel }
 */
function roomCard(type, opts) {
  opts = opts || {};
  const a = opts.availability;

  let statusBadge = '';
  if (a) {
    if (a.free > 2)       statusBadge = `<span class="badge badge--ok">${a.free} of ${a.total} free</span>`;
    else if (a.free > 0)  statusBadge = `<span class="badge badge--warn">Only ${a.free} left</span>`;
    else                  statusBadge = `<span class="badge badge--bad">Fully booked</span>`;
  }

  const params = new URLSearchParams();
  params.set('type', type.code);
  if (opts.checkIn)  params.set('in', opts.checkIn);
  if (opts.checkOut) params.set('out', opts.checkOut);
  if (opts.guests)   params.set('guests', opts.guests);

  const soldOut = a && a.free === 0;
  const cta = soldOut
    ? `<span class="btn btn--ghost btn--sm" aria-disabled="true" style="opacity:.5">Unavailable</span>`
    : `<a class="btn btn--primary btn--sm" href="booking.html?${params.toString()}">${opts.ctaLabel || 'Book'}</a>`;

  const card = document.createElement('article');
  card.className = 'card';
  card.innerHTML = `
    <div class="card__media" style="background-image:url('${type.img}')"></div>
    <div class="card__body">
      <div class="row" style="gap:8px">
        <h3 style="margin-right:auto">${type.name}</h3>
        ${statusBadge}
      </div>
      <div class="meta-row">
        <span>⤢ ${type.size} m²</span>
        <span>☗ ${type.bed}</span>
        <span>☺ up to ${type.capacity}</span>
      </div>
      <p class="small muted" style="margin:0">${type.blurb}</p>
      <ul class="taglist">${type.amenities.slice(0, 4).map(x => `<li>${x}</li>`).join('')}</ul>
      <div class="card__foot">
        <span class="price">${moneyTk(type.rate)} <small>/ night</small></span>
        ${cta}
      </div>
    </div>`;
  return card;
}

/** Offer card used on the home page and the offers page. */
function offerCard(offer) {
  const node = document.createElement('article');
  node.className = 'panel';
  node.innerHTML = `
    <span class="badge badge--info">Save ${offer.percent}%</span>
    <h3 style="margin:12px 0 6px">${offer.label}</h3>
    <p class="small muted">${offer.desc}</p>
    <p class="small" style="margin:0 0 14px">
      Minimum stay: <strong>${offer.minNights} night${offer.minNights > 1 ? 's' : ''}</strong><br>
      Code: <strong style="letter-spacing:.06em">${offer.code}</strong>
    </p>
    <a class="btn btn--ghost btn--sm" href="booking.html?offer=${offer.code}">Use this offer</a>`;
  return node;
}

/**
 * Render an availability result block into `host`.
 * Returns the number of bookable room types found.
 */
function renderAvailability(host, checkIn, checkOut, guests, typeFilter) {
  host.innerHTML = '';
  const nights = nightsBetween(checkIn, checkOut);
  const rows = availability(checkIn, checkOut, guests)
    .filter(r => !typeFilter || r.type.code === typeFilter)
    .filter(r => r.fitsGuests);

  const head = document.createElement('div');
  head.className = 'between';
  head.style.marginBottom = '20px';
  const anyFree = rows.some(r => r.free > 0);
  head.innerHTML = `
    <div>
      <p class="eyebrow" style="margin-bottom:4px">Availability</p>
      <h2 class="display mb-0" style="font-size:1.6rem">
        ${prettyDate(checkIn)} → ${prettyDate(checkOut)}
      </h2>
      <p class="small muted" style="margin:4px 0 0">
        ${nights} night${nights > 1 ? 's' : ''} · ${guests} guest${guests > 1 ? 's' : ''}
        ${typeFilter ? '· filtered by room type' : ''}
      </p>
    </div>`;
  host.appendChild(head);

  if (!rows.length) {
    host.appendChild(el('div', { class: 'empty', html:
      `No room type sleeps ${guests} guests. Our largest rooms take four — for a bigger party, book two rooms or <a href="contact.html">talk to the front desk</a>.` }));
    return 0;
  }

  if (!anyFree) {
    host.appendChild(el('div', { class: 'notice notice--warn', html:
      `<span>⚠</span><span>Everything is taken for those dates. Try shifting by a day, or <a href="contact.html">ask us about a waitlist</a>.</span>` }));
  }

  const grid = el('div', { class: 'grid grid--3' });
  grid.style.marginTop = '18px';
  rows.forEach(r => grid.appendChild(roomCard(r.type, {
    availability: { free: r.free, total: r.total },
    checkIn, checkOut, guests,
    ctaLabel: 'Book this room'
  })));
  host.appendChild(grid);

  return rows.filter(r => r.free > 0).length;
}
