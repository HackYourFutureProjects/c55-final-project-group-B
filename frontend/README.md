# Flint frontend

The web application for Flint, a job search platform for the Netherlands. Built with
[Next.js](https://nextjs.org) 16 (App Router), React 19 and TypeScript, styled with plain CSS Modules
on top of a small set of design tokens, and linted with [Biome](https://biomejs.dev). The
project-wide overview lives in the [root README](../README.md).

## Getting started

Requires Node.js `>=24.19.0` (see `engines` in `package.json`).

Install the dependencies and create your environment file:

```bash
npm install
cp .env.example .env
```

`BACKEND_API_URL` in `.env` points at the backend. The default is a local backend on
`http://localhost:8080` (see [`../backend/README.md`](../backend/README.md)); for frontend-only work
you can point it at the deployed API instead, as the comment in `.env.example` explains.

Then start the development server and open [http://localhost:3000](http://localhost:3000):

```bash
npm run dev
```

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Development server with hot reload |
| `npm run build` / `npm start` | Production build and server (the Dockerfile uses the standalone output) |
| `npm run lint` | Biome check: lint, format and import order |
| `npm run lint:fix` | Apply Biome's safe fixes and formatting |
| `npx tsc --noEmit` | Type check (run `npx next typegen` first if `.next/` was deleted) |

## How the app is put together

```
src/
├── app/           Routes: / , /jobs, /saved-jobs, /about, /login, /signup, /success, /profile
├── components/    Grouped by feature
│   ├── layout/    Header, footer, logo, account menu, nav links
│   ├── search/    Search bar with the role and location comboboxes, popular searches
│   ├── jobs/      Job feed, results list, job card, job details, save button, empty states
│   ├── auth/      Login and signup forms, password input and checklist, field errors
│   ├── home/      Hero, proof strip, feature cards, call-to-action banner
│   ├── about/     About page sections
│   └── ui/        Status page and spinner, shared by several routes
├── context/       React context providers: current user, saved jobs
├── lib/           Backend calls, query building, validation, formatting, types
└── proxy.ts       Forwards browser requests for /api/* to the backend
```

Two rules explain most of the code:

- **Server components fetch, client components interact.** Pages and most components render on the
  server and call the backend directly with `BACKEND_API_URL`. Only the parts that need state or
  browser APIs (search suggestions, the account menu, the save button, forms, infinite scroll) are
  client components.
- **The browser never talks to the backend directly.** Client-side requests go to `/api/...` on the
  same origin, and `src/proxy.ts` forwards them. That keeps the backend's session cookie first-party
  and avoids CORS. State-changing requests fetch a CSRF token first; see `src/lib/auth.ts`.

Styling is vanilla CSS: `src/app/globals.css` defines the Rose Pine palette, the type and spacing
scales, motion tokens and a few shared classes (`.container`, `.button`, `.card`); every component has
its own CSS Module next to it.

## Before opening a pull request

```bash
npm run lint && npx tsc --noEmit && npm run build
```

Pull requests are checked by the workflows described in the root README.
