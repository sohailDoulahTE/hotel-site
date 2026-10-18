/* =========================================================
   Aurelia Hotel — data layer
   ---------------------------------------------------------
   This is a DEMO. GitHub Pages serves static files only, so
   there is no server and no database. All booking, room and
   invoice data lives in the visitor's own browser, in
   localStorage. Clearing browser data resets the demo.
   See README.md for how to move this to a real backend.
   ========================================================= */

const HOTEL = {
  name: 'Aurelia',
  tagline: 'Boutique Hotel & Residence',
  address: 'House 42, Road 11, Gulshan 2, Dhaka 1212, Bangladesh',
  phone: '+880 1700 000000',
  email: 'stay@aurelia-demo.example',
  currency: 'BDT',
  vatRate: 0.15,          // 15% VAT
  serviceRate: 0.10,      // 10% service charge
  checkIn: '14:00',
  checkOut: '12:00'
};

const STORE_KEYS = {
  rooms: 'aurelia.rooms.v1',
  types: 'aurelia.roomTypes.v1',
  bookings: 'aurelia.bookings.v1',
  counter: 'aurelia.counter.v1'
};

/* ---------- Seed data ---------- */

const SEED_TYPES = [
  {
    code: 'DLX',
    name: 'Deluxe King',
    rate: 9500,
    capacity: 2,
    size: 32,
    bed: '1 king bed',
    img: 'assets/img/room-deluxe.svg',
    blurb: 'A calm, light-filled room with a king bed, a deep work desk and a rain shower — our most-booked category.',
    amenities: ['Free Wi-Fi', 'Rain shower', 'Work desk', 'Smart TV', 'Minibar', 'Daily housekeeping']
  },
  {
    code: 'EXT',
    name: 'Executive Twin',
    rate: 11000,
    capacity: 2,
    size: 36,
    bed: '2 single beds',
    img: 'assets/img/room-twin.svg',
    blurb: 'Built for colleagues travelling together: two full singles, twin workstations and lounge access.',
    amenities: ['Free Wi-Fi', 'Lounge access', 'Twin desks', 'Smart TV', 'Espresso machine', 'Laundry credit']
  },
  {
    code: 'JSU',
    name: 'Junior Suite',
    rate: 16500,
    capacity: 3,
    size: 48,
    bed: '1 king + sofa bed',
    img: 'assets/img/room-junior.svg',
    blurb: 'A separate sitting area, a soaking tub and a city-facing bay window. Comfortable for a longer stay.',
    amenities: ['Free Wi-Fi', 'Sitting room', 'Soaking tub', 'Nespresso', 'Lounge access', 'Late checkout']
  },
  {
    code: 'GSU',
    name: 'Garden Suite',
    rate: 21000,
    capacity: 4,
    size: 60,
    bed: '1 king + 2 singles',
    img: 'assets/img/room-garden.svg',
    blurb: 'Ground-floor suite opening onto the private courtyard garden. Our quietest rooms, and the family favourite.',
    amenities: ['Free Wi-Fi', 'Private terrace', 'Garden access', 'Kitchenette', 'Two bathrooms', 'Lounge access']
  },
  {
    code: 'PSU',
    name: 'Presidential Suite',
    rate: 38000,
    capacity: 4,
    size: 95,
    bed: '1 king + 1 queen',
    img: 'assets/img/room-presidential.svg',
    blurb: 'The top floor, end to end: a dining room for eight, a study, a dressing room and a wraparound terrace.',
    amenities: ['Free Wi-Fi', 'Butler service', 'Dining for 8', 'Terrace', 'Airport transfer', 'Daily breakfast']
  }
];

// Physical room inventory: floor-numbered rooms per type.
const SEED_ROOMS = [
  // Deluxe King — 2nd & 3rd floor
  ...[201, 202, 203, 204, 205, 206, 301, 302, 303, 304].map(n => ({ number: String(n), type: 'DLX' })),
  // Executive Twin — 3rd & 4th floor
  ...[305, 306, 401, 402, 403, 404].map(n => ({ number: String(n), type: 'EXT' })),
  // Junior Suite — 5th floor
  ...[501, 502, 503, 504].map(n => ({ number: String(n), type: 'JSU' })),
  // Garden Suite — ground floor
  ...[101, 102, 103].map(n => ({ number: String(n), type: 'GSU' })),
  // Presidential — top floor
  ...[601, 602].map(n => ({ number: String(n), type: 'PSU' }))
].map(r => ({
  id: 'R' + r.number,
  number: r.number,
  type: r.type,
  floor: Number(r.number[0]),
  status: 'available',   // available | maintenance | offline
  note: ''
}));

const OFFERS = [
  { code: 'AURELIA10', label: 'Direct booking saver', percent: 10, minNights: 1,
    desc: 'Book on this site instead of a travel agent and keep 10%.' },
  { code: 'STAY3', label: 'Three nights or more', percent: 15, minNights: 3,
    desc: 'Stay three nights or longer and the third night is effectively on us.' },
  { code: 'LONGSTAY', label: 'Extended stay', percent: 22, minNights: 7,
    desc: 'Seven nights or more, with weekly housekeeping and laundry included.' }
];

/* ---------- Storage helpers ---------- */

function readStore(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch (e) {
    console.warn('Could not read', key, e);
    return fallback;
  }
}

function writeStore(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (e) {
    console.warn('Could not write', key, e);
    return false;
  }
}

const DB = {
  types() { return readStore(STORE_KEYS.types, null) || (writeStore(STORE_KEYS.types, SEED_TYPES), SEED_TYPES); },
  setTypes(v) { return writeStore(STORE_KEYS.types, v); },

  rooms() { return readStore(STORE_KEYS.rooms, null) || (writeStore(STORE_KEYS.rooms, SEED_ROOMS), SEED_ROOMS); },
  setRooms(v) { return writeStore(STORE_KEYS.rooms, v); },

  bookings() { return readStore(STORE_KEYS.bookings, []); },
  setBookings(v) { return writeStore(STORE_KEYS.bookings, v); },

  type(code) { return DB.types().find(t => t.code === code) || null; },
  booking(ref) { return DB.bookings().find(b => b.ref === ref) || null; },

  nextRef() {
    const n = (readStore(STORE_KEYS.counter, 1000) || 1000) + 1;
    writeStore(STORE_KEYS.counter, n);
    return 'AUR-' + n;
  },

  reset() {
    Object.values(STORE_KEYS).forEach(k => localStorage.removeItem(k));
  },

  exportAll() {
    return {
      exportedAt: new Date().toISOString(),
      hotel: HOTEL.name,
      roomTypes: DB.types(),
      rooms: DB.rooms(),
      bookings: DB.bookings()
    };
  }
};

/* ---------- Date helpers (all dates are YYYY-MM-DD strings) ---------- */

function todayISO(offsetDays = 0) {
  const d = new Date();
  d.setHours(12, 0, 0, 0);
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().slice(0, 10);
}

function nightsBetween(checkIn, checkOut) {
  const a = new Date(checkIn + 'T12:00:00');
  const b = new Date(checkOut + 'T12:00:00');
  return Math.round((b - a) / 86400000);
}

function prettyDate(iso) {
  if (!iso) return '—';
  const d = new Date(iso + 'T12:00:00');
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

function prettyDateTime(isoStamp) {
  if (!isoStamp) return '—';
  return new Date(isoStamp).toLocaleString('en-GB', {
    day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
  });
}

/* ---------- Money ---------- */

function money(n) {
  return new Intl.NumberFormat('en-BD', { maximumFractionDigits: 0 }).format(Math.round(n || 0));
}
function moneyTk(n) { return '৳' + money(n); }

/* ---------- Availability engine ---------- */

const ACTIVE_STATUSES = ['confirmed', 'checked-in'];

/** Do [aIn,aOut) and [bIn,bOut) overlap? */
function rangesOverlap(aIn, aOut, bIn, bOut) {
  return aIn < bOut && bIn < aOut;
}

/** Rooms of a type that are physically sellable (not under maintenance). */
function sellableRooms(typeCode) {
  return DB.rooms().filter(r => r.type === typeCode && r.status === 'available');
}

/** Room numbers of a type already taken for the given range. */
function occupiedRoomNumbers(typeCode, checkIn, checkOut) {
  return DB.bookings()
    .filter(b => ACTIVE_STATUSES.includes(b.status))
    .filter(b => b.typeCode === typeCode)
    .filter(b => rangesOverlap(checkIn, checkOut, b.checkIn, b.checkOut))
    .map(b => b.roomNumber);
}

/** Free rooms of a type for the range, cheapest/lowest number first. */
function freeRooms(typeCode, checkIn, checkOut) {
  const taken = new Set(occupiedRoomNumbers(typeCode, checkIn, checkOut));
  return sellableRooms(typeCode)
    .filter(r => !taken.has(r.number))
    .sort((a, b) => Number(a.number) - Number(b.number));
}

/**
 * Availability for every room type over a date range.
 * Returns [{ type, total, free, rooms }]
 */
function availability(checkIn, checkOut, guests = 1) {
  return DB.types().map(t => {
    const rooms = freeRooms(t.code, checkIn, checkOut);
    return {
      type: t,
      total: sellableRooms(t.code).length,
      free: rooms.length,
      rooms,
      fitsGuests: t.capacity >= guests
    };
  });
}

/* ---------- Pricing ---------- */

function findOffer(code) {
  if (!code) return null;
  return OFFERS.find(o => o.code.toUpperCase() === String(code).trim().toUpperCase()) || null;
}

/**
 * Quote a stay. Returns a full price breakdown.
 */
function quote(typeCode, checkIn, checkOut, offerCode) {
  const t = DB.type(typeCode);
  const nights = nightsBetween(checkIn, checkOut);
  const rate = t ? t.rate : 0;
  const roomTotal = rate * nights;

  const offer = findOffer(offerCode);
  const offerValid = !!offer && nights >= offer.minNights;
  const discount = offerValid ? roomTotal * (offer.percent / 100) : 0;

  const net = roomTotal - discount;
  const service = net * HOTEL.serviceRate;
  const vat = (net + service) * HOTEL.vatRate;
  const total = net + service + vat;

  return {
    typeCode, typeName: t ? t.name : typeCode,
    nights, rate, roomTotal,
    offer: offerValid ? offer : null,
    offerRejected: !!offer && !offerValid ? offer : null,
    discount, net, service, vat, total
  };
}

/* ---------- Booking creation ---------- */

/**
 * Create a booking and auto-assign the first free room of the type.
 * Returns { ok: true, booking } or { ok: false, error }.
 */
function createBooking({ typeCode, checkIn, checkOut, guests, guest, offerCode, source }) {
  if (!typeCode) return { ok: false, error: 'Please choose a room type.' };
  if (!checkIn || !checkOut) return { ok: false, error: 'Please choose your dates.' };

  const nights = nightsBetween(checkIn, checkOut);
  if (nights < 1) return { ok: false, error: 'Check-out must be at least one night after check-in.' };
  if (checkIn < todayISO()) return { ok: false, error: 'Check-in cannot be in the past.' };

  const t = DB.type(typeCode);
  if (!t) return { ok: false, error: 'That room type no longer exists.' };
  if (guests > t.capacity) {
    return { ok: false, error: `${t.name} sleeps up to ${t.capacity} guests.` };
  }

  const open = freeRooms(typeCode, checkIn, checkOut);
  if (!open.length) {
    return { ok: false, error: `All ${t.name} rooms are taken for those dates. Try another room type or shift your dates.` };
  }

  const room = open[0];                 // auto-assignment: lowest free room number
  const q = quote(typeCode, checkIn, checkOut, offerCode);

  const booking = {
    id: 'B' + Date.now().toString(36).toUpperCase(),
    ref: DB.nextRef(),
    status: 'confirmed',
    source: source || 'website',
    createdAt: new Date().toISOString(),
    guest: {
      name: (guest && guest.name || '').trim(),
      email: (guest && guest.email || '').trim(),
      phone: (guest && guest.phone || '').trim(),
      notes: (guest && guest.notes || '').trim()
    },
    typeCode,
    typeName: t.name,
    roomNumber: room.number,
    checkIn, checkOut, nights,
    guests: Number(guests) || 1,
    rate: q.rate,
    roomTotal: q.roomTotal,
    offerCode: q.offer ? q.offer.code : '',
    discount: q.discount,
    service: q.service,
    vat: q.vat,
    total: q.total,
    paid: false
  };

  const all = DB.bookings();
  all.push(booking);
  DB.setBookings(all);
  return { ok: true, booking };
}

function updateBooking(ref, changes) {
  const all = DB.bookings();
  const i = all.findIndex(b => b.ref === ref);
  if (i === -1) return false;
  all[i] = Object.assign({}, all[i], changes);
  DB.setBookings(all);
  return true;
}

/* ---------- Demo seeding ---------- */

/** Put a few bookings on the books so availability and the admin panel are not empty. */
function seedDemoBookingsOnce() {
  if (DB.bookings().length) return;
  const samples = [
    { typeCode: 'DLX', inOff: 0, nights: 3, name: 'Nadia Rahman',  email: 'nadia@example.com',  phone: '+880 1711 111111', guests: 2 },
    { typeCode: 'DLX', inOff: 1, nights: 2, name: 'Tanvir Hasan',  email: 'tanvir@example.com', phone: '+880 1711 222222', guests: 1 },
    { typeCode: 'JSU', inOff: 2, nights: 4, name: 'Laura Mertens', email: 'laura@example.com',  phone: '+31 6 1234 5678',  guests: 2 },
    { typeCode: 'EXT', inOff: 5, nights: 2, name: 'Imran Chowdhury', email: 'imran@example.com', phone: '+880 1711 333333', guests: 2 },
    { typeCode: 'PSU', inOff: 9, nights: 3, name: 'Kenji Watanabe', email: 'kenji@example.com', phone: '+81 90 1234 5678', guests: 2 }
  ];
  samples.forEach(s => {
    createBooking({
      typeCode: s.typeCode,
      checkIn: todayISO(s.inOff),
      checkOut: todayISO(s.inOff + s.nights),
      guests: s.guests,
      guest: { name: s.name, email: s.email, phone: s.phone, notes: '' },
      offerCode: s.nights >= 3 ? 'STAY3' : '',
      source: 'demo seed'
    });
  });
  // One guest already in house
  const first = DB.bookings()[0];
  if (first) updateBooking(first.ref, { status: 'checked-in' });
}
