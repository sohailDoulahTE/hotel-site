# Aurelia — Hotel Website &amp; Booking Demo

A complete, static hotel website with a working booking engine, front-desk admin
panel and printable invoices. No build step, no framework, no dependencies —
just HTML, CSS and vanilla JavaScript, so it runs on GitHub Pages as-is.

**Aurelia is a fictional hotel.** Everything in here is demo content you can replace.

---

## What's in it

| Page | What it does |
|---|---|
| `index.html` | Home page with a live availability search |
| `rooms.html` | All five room types, full rate card, availability check |
| `booking.html` | Three-step booking flow + "find my booking" lookup |
| `invoice.html` | Printable invoice for any booking reference |
| `dining.html` | Restaurant page with menu |
| `offers.html` | Discount codes and packages |
| `gallery.html` | Image grid with a lightbox |
| `contact.html` | Enquiry form + directions |
| `admin.html` | Front-desk panel: dashboard, bookings, rooms, rates, data |

### Features that actually work

- **Live availability** — real per-night overlap checking across 25 rooms in 5 types
- **Auto room assignment** — the booking engine picks the lowest free room number of the chosen type
- **Overbooking protection** — once every room of a type is taken for a date range, it is marked fully booked
- **Offer codes** — `AURELIA10` (10%), `STAY3` (15%, 3+ nights), `LONGSTAY` (22%, 7+ nights)
- **Invoices** — 10% service charge + 15% VAT, print or save as PDF from the browser
- **Admin panel** — occupancy dashboard, check-in / check-out, cancel, mark paid, walk-in bookings, room inventory CRUD, rate editing, JSON export

Admin passcode: **`aurelia`**

---

## ⚠️ Read this before you call it finished

GitHub Pages serves **static files only** — it cannot run server code or a database.
So in this project, all bookings, rooms and invoices are stored in
`localStorage`, **in the browser of whoever is looking at the site**.

That means:

- A booking made on your laptop does not appear on your phone.
- Clearing browser data wipes everything.
- The admin passcode is cosmetic. Anyone can read it in the source.
- Two real guests could "book" the same room from two different devices.

This is completely fine for a portfolio piece, a class project, or a clickable
prototype — and it is why the site carries a visible demo banner. It is **not**
fine for a hotel that takes real money. See
[Making it real](#making-it-real) below.

---

## Running it locally

Just open `index.html` in a browser — everything works from the filesystem.

For a closer match to how GitHub Pages behaves, serve it over HTTP:

```bash
# Python (already installed on most machines)
python3 -m http.server 8000

# or Node
npx serve .
```

Then visit <http://localhost:8000>.

---

## Publishing it on GitHub Pages

### Option A — through the GitHub website (no commands)

1. Go to <https://github.com> and sign in (create a free account if you need one).
2. Click **+** in the top right → **New repository**.
3. Name it `hotel-website`, keep it **Public**, do **not** tick "Add a README",
   then click **Create repository**.
4. On the empty repository page click **uploading an existing file**.
5. Drag in **the contents** of this folder — `index.html`, the other `.html`
   files, and the whole `assets` folder. Do not drag the outer folder itself,
   or your pages end up one level too deep.
6. Scroll down, click **Commit changes**.
7. Go to **Settings** (top of the repo) → **Pages** in the left sidebar.
8. Under *Build and deployment* → *Source* choose **Deploy from a branch**.
9. Branch: **main**, folder: **/ (root)** → **Save**.
10. Wait about a minute, then reload that page. Your URL appears at the top:

    ```
    https://<your-username>.github.io/hotel-website/
    ```

### Option B — with Git on the command line

```bash
cd hotel-site
git init
git add .
git commit -m "Hotel website with booking engine"
git branch -M main
git remote add origin https://github.com/<your-username>/hotel-website.git
git push -u origin main
```

Then do steps 7–10 above to switch Pages on.

To update the site later: change the files, then

```bash
git add .
git commit -m "Describe what changed"
git push
```

GitHub rebuilds within a minute or so.

### If the page looks unstyled or 404s

- **Blank / unstyled page** — you probably uploaded the folder rather than its
  contents. The repository root must contain `index.html`, not `hotel-site/index.html`.
- **404** — Pages can take 2–3 minutes on the first build. Check
  **Settings → Pages** for the green "Your site is live at…" banner, and the
  **Actions** tab for a failed build.
- **Old version showing** — hard-refresh (Ctrl/Cmd + Shift + R). GitHub caches aggressively.
- A `.nojekyll` file is included so GitHub serves every file as-is. Keep it.

### Using your own domain

Buy a domain, then in **Settings → Pages → Custom domain** enter it and save.
At your domain registrar add a `CNAME` record pointing `www` to
`<your-username>.github.io`. Tick **Enforce HTTPS** once the certificate is issued.

---

## Making it yours

### Hotel name, address, tax rates

Open `assets/js/data.js` — the `HOTEL` object at the top holds the name,
address, phone, VAT rate and service charge. Then search the `.html` files for
`Aurelia` and `Gulshan` to update the visible text, footer and page titles.

### Rooms, rates and inventory

Still in `assets/js/data.js`:

- `SEED_TYPES` — the five room types: name, nightly rate, capacity, size, amenities, image
- `SEED_ROOMS` — the physical rooms and their numbers
- `OFFERS` — discount codes

Changes to these only apply to a browser that has not stored data yet. To pick
them up on a browser that has, open the admin panel → **Data** → **Reset to demo data**.

### Colours and fonts

Everything is a CSS variable at the top of `assets/css/style.css`:

```css
:root {
  --accent:     #0d7a6f;   /* main brand colour */
  --gold:       #b8863b;
  --ink:        #10171d;   /* headings */
  --font:       "Plus Jakarta Sans", …;
  --font-display: "Fraunces", …;
}
```

Change `--accent` and the whole site follows.

### Photographs

`assets/img/` holds generated SVG placeholders. Drop in real photos using the
**same filenames** (`.jpg` works — just update the extension in `data.js` and the
HTML) and the site picks them up. Recommended sizes: hero 1600×900, room
images 1200×800, gallery tiles 900×900. Compress them first —
[Squoosh](https://squoosh.app) is good for this.

`tools/make-art.py` regenerates the placeholders if you want to tweak them.

### Making the contact form send real email

GitHub Pages cannot process form posts, so use a free relay:

1. Sign up at <https://formspree.io>.
2. Create a form — you get an endpoint like `https://formspree.io/f/abcdwxyz`.
3. In `contact.html`, replace `FORMSPREE_ENDPOINT` with it.
4. Delete the `data-demo="true"` attribute on that `<form>`.

Web3Forms, Getform and Basin work the same way.

### Adding a real map

In `contact.html` find the "Map placeholder" block. In Google Maps, search your
address → **Share** → **Embed a map** → copy the `<iframe>` and paste it in place
of that block.

---

## Making it real

When you need bookings that are shared between devices and cannot be faked:

| Need | Easiest route |
|---|---|
| Shared database | **Firebase Firestore** or **Supabase** — both have free tiers and work from static pages |
| Real staff login | Firebase Auth / Supabase Auth — replaces the passcode gate in `admin.js` |
| Card payments | Stripe Checkout or, in Bangladesh, SSLCOMMERZ / bKash merchant APIs (these need a server) |
| Confirmation emails | A serverless function (Netlify, Vercel, Cloudflare Workers) calling Resend or SendGrid |

The front end is already structured for this. Every read and write goes through
the `DB` object in `assets/js/data.js` — swap those few functions for API calls
and nothing else has to change. The availability engine (`availability()`,
`freeRooms()`, `createBooking()`) should then move to the server, because
availability checks that run only in the browser can always be bypassed.

Note that GitHub Pages is fine for the public site but a hotel taking real
bookings typically moves to Netlify, Vercel or Cloudflare Pages, which can run
server functions alongside the static files.

---

## File structure

```
hotel-site/
├── index.html          Home + availability search
├── rooms.html          Rooms, rate card, details
├── booking.html        Booking flow + lookup
├── invoice.html        Printable invoice (?ref=AUR-1001)
├── dining.html         Restaurant & menu
├── offers.html         Offer codes & packages
├── gallery.html        Photo grid + lightbox
├── contact.html        Enquiry form + directions
├── admin.html          Front-desk panel
├── .nojekyll           Tells GitHub Pages to serve files as-is
├── assets/
│   ├── css/style.css   All styling, design tokens at the top
│   ├── js/
│   │   ├── data.js     Hotel config, seed data, availability + pricing engine
│   │   ├── main.js     Nav, helpers, tabs, date handling
│   │   ├── ui.js       Shared room/offer card rendering
│   │   ├── home.js     Home page behaviour
│   │   ├── booking.js  Booking flow
│   │   └── admin.js    Admin panel
│   └── img/            SVG placeholder artwork
└── tools/make-art.py   Regenerates the placeholder artwork
```

---

## Licence

MIT — do whatever you like with it. The hotel, its rooms, its menu and its
guests are invented.
