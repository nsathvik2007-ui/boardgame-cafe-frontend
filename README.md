# BoardGame Café — Frontend

The customer- and staff-facing web app for a table-service board game café: QR-code table check-in, browsing and checking out games, ordering food, and paying the bill — plus a staff side for running the kitchen queue, verifying returned games, and managing food inventory.

This is the frontend only. It talks to a separate [Frappe/ERPNext backend](https://github.com/nsathvik2007-ui/boardgame-cafe) over a token-authenticated REST API — it holds no business logic of its own.

## Tech stack

- **React 19** + **Vite** — no router library; page selection is done directly off `window.location.pathname` in [`src/App.jsx`](src/App.jsx)
- **Tailwind CSS 4** (via `@tailwindcss/vite`)
- **Razorpay Checkout** (`checkout.js`, loaded via script tag in `index.html`) for bill payment
- Plain `fetch` wrapper in [`src/api.js`](src/api.js) — no state management library; each page manages its own `useState`/`useEffect`

## How auth works

There are no cookies or sessions on this side. Login/signup return a Frappe **API key + secret**, stored in `localStorage`, and sent as `Authorization: token <key>:<secret>` on every subsequent request (see `apiCall` in [`src/api.js`](src/api.js)). A `is_staff` flag is also cached in `localStorage` purely so the UI can route correctly without a flash of the wrong screen — it is **not** a security boundary; every staff endpoint re-checks the `Cafe Staff` role server-side.

## Routes

Routing is hand-rolled (no `react-router`) — each path below is matched in `App.jsx` and rendered as its own page component:

| Path | Page | Purpose |
|---|---|---|
| `/` | `LoginPage` | Login / signup |
| `/checkin?table=<id>` | `CheckinPage` | QR-code landing page; starts a Customer Session for that table |
| `/games` | `GamesPage` | Browse available games, check one out |
| `/food` | `FoodPage` | Browse the menu, place a food order |
| `/summary` | `SessionSummaryPage` | Bill summary + Razorpay payment |
| `/staff` | `StaffDashboardPage` | Staff home — table overview, links to the pages below |
| `/staff/kitchen` | `StaffKitchenPage` | Live food order queue (polls every 15s), advance order status |
| `/staff/inventory` | `StaffInventoryPage` | Checked-out games, mark pieces verified on return |
| `/staff/food-inventory` | `StaffFoodInventoryPage` | Stock levels per menu item, restock |

Because routing is just a `pathname` check with no server-side awareness, **`vercel.json` must rewrite every path to `index.html`** — otherwise a direct visit or refresh on anything but `/` 404s. See [`vercel.json`](vercel.json).

## Getting started

```bash
npm install
npm run dev
```

By default the app talks to `http://cafe.local:8000` (a local Frappe bench). To point it elsewhere, copy the example env file:

```bash
cp .env.example .env.local
```

and set:

```
VITE_API_URL=https://your-backend-domain.example.com
```

## Deployment (Vercel)

This project auto-deploys from `main` via Vercel's GitHub integration.

- Set `VITE_API_URL` as a Production environment variable in the Vercel dashboard, pointing at your live backend.
- The backend must have CORS enabled for whatever domain Vercel assigns this project — this is a config on the **backend** (Frappe's `allow_cors` site setting), not something set here. Vercel sometimes appends a suffix to your project's domain (e.g. `boardgame-cafe-frontend-<username>.vercel.app`) if the plain name is taken — check the actual assigned domain under Deployment Details before assuming what it is.
- If the backend is plain HTTP, browsers will block every request from this HTTPS-hosted frontend (mixed content). The backend needs a real TLS certificate.
- Deployment Protection (a Vercel project setting) must be **off** for Production, or real customers scanning a table's QR code will be redirected to a Vercel login page instead of the app.

## Project structure

```
src/
  api.js                    fetch wrapper + every backend call the app makes
  App.jsx                   pathname-based route switch
  main.jsx                  entry point
  components/
    CafeBackground.jsx      shared decorative background
    GameCard.jsx             game listing card (GamesPage)
    GameIcon.jsx             icon-per-game-type helper
    JourneyPath.jsx          progress indicator across the customer flow
  pages/
    LoginPage.jsx
    CheckinPage.jsx
    GamesPage.jsx
    FoodPage.jsx
    SessionSummaryPage.jsx
    StaffDashboardPage.jsx
    StaffKitchenPage.jsx
    StaffInventoryPage.jsx
    StaffFoodInventoryPage.jsx
```

## Notes on the backend contract

- Creating a **customer** account is self-service (`/` → Sign Up), but **staff** accounts are not — they're created directly in the Frappe admin (desk) by assigning the `Cafe Staff` role, since granting staff access isn't something this frontend exposes.
- Payments go through Razorpay in test mode by default; use [Razorpay's published test card numbers](https://razorpay.com/docs/payments/payments/test-card-details/) to exercise the flow — never real card data.
- A table's check-in URL (used to generate its QR code) is built server-side from the backend's `frontend_url` config — if you change where this app is hosted, that config needs updating too, or QR codes will point at the wrong place.
