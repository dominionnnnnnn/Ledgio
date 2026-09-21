# Ledgio

The modern record book for small businesses. React (JSX) + Tailwind + Firebase, installable as a PWA.

## Run it

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # production build in dist/
npm run preview    # serve the build (use this to test install/offline)
```

`.env` holds the Firebase and Cloudinary settings (see `.env.example`). It is git-ignored.

## How the first screen is chosen (`/`)

| Situation | Goes to |
| --- | --- |
| Signed in, no business yet | `/setup` |
| Signed in, business but no record fields | `/setup/fields` |
| Signed in, setup finished | `/app` |
| Installed app, first launch | `/welcome` (onboarding) |
| Installed app, later launches | `/login` |
| Browser | Landing page |

Onboarding is remembered in `localStorage` (`ledgio:onboarded`).

**Testing the installed-app flow:** run `npm run build && npm run preview`, open it in Chrome, install it
(address-bar install icon), and open it from the installed window. To see onboarding again, clear the
site's storage in DevTools → Application.

## Password reset link

Firebase's reset email opens Firebase's own page by default. To use Ledgio's `/reset` screen instead:
Firebase console → Authentication → Templates → Password reset → edit (pencil) → **Customize action URL** →
`https://ledgio-nine.vercel.app/reset`. Both work; the custom one keeps the user inside Ledgio.

## Record fields

Defined in `src/lib/fields.js`. Worker, Date, Revenue and Expense are always on (profit and per-worker
results depend on them); Worker, Date and Revenue are always required. Profit = Revenue − Expense.
Amount and Balance are stored for reference only.

## Data model (Firestore)

```
users/{uid}                          email, businessId
businesses/{id}                      name, type, currency, logoUrl, ownerId, plan, workerCount, fields, required
businesses/{id}/workers/{wid}        name, phone, role, truck, photoUrl, active
businesses/{id}/records/{rid}        workerId, workerName, truck, date (YYYY-MM-DD), month (YYYY-MM),
                                     revenue, expense, values{Destination, Notes, ...}, createdBy
businesses/{id}/usage/{YYYY-MM}      count, lastRecordId   (records created that month; the plan limit)
```

Profit is always `revenue - expense`. A record copies the worker's name and truck when saved, so old records
keep them if the worker is renamed, reassigned a truck, or deleted.

**Plan limits** are enforced in `firestore.rules`: a new worker must be written together with a
`workerCount` increase, and a new record together with that month's `usage` increase, in one batch
(see `src/lib/data.js`). The rules refuse the batch past 3 workers / 50 records a month.

**Offline:** writes save to the phone immediately and sync when back online (`src/lib/settle.js`).

## Phone notifications (push)

1. Firebase console → **Cloud Messaging → Web configuration → Generate key pair**. Copy the key into
   `.env` as `VITE_FIREBASE_VAPID_KEY` (and into Vercel's environment variables).
2. `public/firebase-messaging-sw.js` shows notifications while Ledgio is closed. It holds the Firebase
   config directly, because a service worker can't read `.env`.
3. People are asked after their first record (a card on the home screen) and can switch it on or off
   any time at the top of the notifications screen. The browser only asks once, so a refusal sticks.
4. Each device that agrees is saved under `businesses/{id}/pushTokens/{token}`. Sending happens from the
   admin app's `/api/send-push` function.
5. iPhones only allow push once Ledgio is added to the home screen (iOS 16.4+).

## Notifications

Generated in the app (`src/lib/alerts.js`) when it opens, each with a fixed id so they never repeat:
nothing recorded yesterday, last week's top worker (from Monday), 80% and 100% of the monthly record
limit. Support-reply notifications will be written by the admin app.

## Desktop layout

At 1024px and wider (`lg`), the app switches to the desktop design: a left sidebar instead of the menu,
a top bar with page title, record search, notifications and account, tables for records and worker
performance, and Add Record / Add Worker open as modals. Phones keep the single-column app.

## Support tickets

`businesses/{id}/tickets/{tid}` with a `messages` subcollection. Users open tickets, reply, and close/reopen.
Until the admin app exists, answer from the Firebase console: add a message with `from: "support"`,
set the ticket's `status` to `"answered"`, and (optionally) add a `notifications` doc with `kind: "reply"`
and `link: "/app/support/<tid>"` so the user sees the red dot.

## Deploying (Vercel)

1. Push to GitHub and import the repo in Vercel (framework: Vite).
2. Add every `VITE_…` variable from `.env` under Project → Settings → Environment Variables.
3. `vercel.json` sends every app route to `index.html` so deep links like `/app/records` work.
4. Firebase console → Authentication → Settings → **Authorized domains** → add your Vercel domain.
5. Optional: Authentication → Templates → Password reset → Customize action URL → `https://ledgio-nine.vercel.app/reset`.

Live at **https://ledgio-nine.vercel.app** (set in `src/lib/config.js` → `SITE_URL`, and in `index.html` meta tags).

## Structure

```
src/
  lib/          firebase, cloudinary upload, platform detection, theme, plan limits
  context/      AuthContext — user → users/{uid} → businesses/{id}
  routes/       route guards and the "/" decision
  components/   Button, BrandMark, LoadingScreen, ErrorScreen, OfflineBanner
  pages/        Landing (temporary), Onboarding, placeholders for later phases
firestore.rules the security rules published in the Firebase console
```

## Build phases

1. **Foundation**: Vite, Tailwind tokens from v2, PWA, Firebase, routing (done)
2. **Auth and setup**: sign up, log in, forgot/reset, 3-step business setup, record fields (done)
3. **Core**: home, workers (add/edit/disable/delete, 3-worker cap), records (add/edit/list/detail, 50-a-month cap) (done)
4. **Insights**: reports (today/week/month/custom), worker detail with 6-week profit trend, in-app notifications (done)
5. **Support and polish**: support tickets, business profile, Light/Dark/Auto switch, desktop layout (sidebar, tables, Add Record / Add Worker modals) (done)
6. **Landing v2**: marketing page for browser visitors, desktop + mobile, with a real “Install Ledgio” button where the browser supports it (done)
