# Conduit — RealWorld Frontend

A simplified Medium.com clone implemented against the [Conduit / RealWorld](https://github.com/gothinkster/realworld) API specification. Built on the provided Create React App + TypeScript skeleton.

> The original assignment brief (business requirements, login credentials, Docker instructions, evaluation criteria) is preserved in **[`docs/ASSIGNMENT.md`](docs/ASSIGNMENT.md)**.

---

## Tech stack

| Concern | Choice | Version |
| --- | --- | --- |
| UI library | React | 17 |
| Language | TypeScript | 4.4 |
| Tooling | Create React App (react-scripts) | 4 |
| Routing | react-router-dom | 5 |
| HTTP client | **axios** | 1.x |
| Global state | **Zustand** | 5 |
| Markdown rendering | **react-markdown** | 6 |
| Dates | dayjs | 1.x |
| Testing | Jest + React Testing Library | — |

---

## Architecture

The skeleton intentionally shipped with no structure (every page duplicated its own navbar/footer with hardcoded markup). The code was reorganised into clear, single-responsibility layers:

```
src/
├── api/
│   └── client.ts          # Single axios instance + JWT request interceptor
├── context/
│   └── authStore.ts       # Zustand auth store (user, isAuthenticated, login, logout)
├── types/
│   └── api.ts             # Strong types hand-derived from docs/schema/swagger.json
├── components/            # Reusable, presentational + behavioural pieces
│   ├── Navbar.tsx         #   auth-aware navigation (guest vs. logged-in)
│   ├── Footer.tsx
│   ├── ArticlePreview.tsx #   article card shared by Home & Profile
│   ├── AuthorImage.tsx    #   avatar with placeholder + onError fallback
│   ├── AuthorImage.test.tsx
│   ├── FavoriteButton.tsx #   optimistic favorite/unfavorite
│   └── FollowButton.tsx   #   optimistic follow/unfollow
├── pages/                 # Route-level screens
│   ├── Home.tsx           #   GET /articles
│   ├── Article.tsx        #   GET /articles/:slug (+ react-markdown body)
│   ├── Profile.tsx        #   GET /profiles/:username (+ ?author= articles)
│   └── Login.tsx          #   POST /users/login
└── App.tsx                # Routing + shared layout (Navbar/Footer outside <Switch>)
```

### Key design decisions

- **Single source of truth for layout.** `Navbar`/`Footer` render once in `App.tsx` (outside `<Switch>`), so the navigation reacts to auth state in one place instead of being duplicated across pages.
- **Strong typing from the spec.** Entities (`User`, `Profile`, `Article`, …) and response envelopes (`{ user }`, `{ article }`, `{ articles, articlesCount }`) are typed directly from `swagger.json`. No `any`.
- **Centralised auth.** The JWT is injected by an axios request interceptor, so no call site needs to remember to attach the token.
- **Optimistic UI** for Favorite/Follow: the interface updates instantly, then reconciles with the server response and rolls back on error.
- **Inline `// TODO:` notes** mark deliberate, time-boxed shortcuts and point to the production-grade alternative.

---

## Library choices & rationale

### axios — HTTP client
Chosen over the native `fetch` primarily for **interceptors**. A single request interceptor reads the JWT from `localStorage` and attaches the `Authorization: Token <jwt>` header to every outgoing request — cross-cutting auth logic lives in exactly one place (`src/api/client.ts`). axios also gives a configured instance (shared `baseURL`), automatic JSON (de)serialisation, and ergonomic typed error handling via `isAxiosError`.

### Zustand — global state
Auth state (current user, `isAuthenticated`, `login`/`logout`) must be readable from many unrelated places: the navbar, the login page, the favorite/follow buttons. Zustand provides this with **minimal boilerplate** (no Provider, no reducers/actions ceremony), **selector-based subscriptions** (components re-render only when the slice they read changes), and a tiny bundle footprint. Its store can also be accessed outside the React tree, which keeps auth logic decoupled from the component lifecycle.

### react-markdown — Markdown rendering
The article `body` arrives as Markdown and must be rendered as HTML. react-markdown **parses Markdown into React elements** rather than injecting a raw HTML string, so it is **XSS-safe by default** (no `dangerouslySetInnerHTML`, embedded `<script>` is not executed). Pinned to **v6**, the last CommonJS line compatible with CRA 4 / webpack 4 (v7+ is ESM-only and breaks the build).

---

## Getting started

### 1. Backend (Docker)
```bash
docker-compose up -d                          # start API (:3000) + MySQL (:3306)
docker-compose run --rm api npm run db:reset  # seed/reset the database (first run)
```
> On Apple Silicon the compose file pins `platform: linux/amd64` (the `mysql:8.0.25` image has no arm64 build; it runs via emulation).

### 2. Frontend (dev server)
```bash
NODE_OPTIONS=--openssl-legacy-provider yarn start
```
Runs on **http://localhost:8080**. The `NODE_OPTIONS` flag is required when running CRA 4 on Node 17+ (legacy OpenSSL provider); alternatively use the pinned Node via `nvm use`.

### 3. Tests
```bash
CI=true yarn test
```

### Sample credentials
| Email | Password |
| --- | --- |
| `alice@example.com` | `I_<3-R0ber7` |
| `bob@example.com` | `4L1ce-I5 mY_li3f` |

### Production image (as per assignment)
```bash
docker build -t job-assignment-frontend-engineer .
docker run --rm -p 8080:80 job-assignment-frontend-engineer
```

---

## Scope

**Implemented:** Homepage (article feed), Article view (Markdown body), Profile (bio + author's articles), Login/Logout, auth-aware navbar, Favorite & Follow buttons with optimistic UI, one unit test.

**Intentionally out of scope** (per the time-boxed brief): registration, settings, the article editor, comments, tags, pagination, and the "Your Feed" / "Favorited Articles" toggles. These are marked with `// TODO:` where relevant.

---

## Production Enhancements / Future TODO

The following are deliberately omitted to respect the 4–8h budget, but are what I would implement in a real production system:

- **Form validation with Zod + react-hook-form.** Declarative, type-inferred schemas validating inputs at the boundary, with per-field error messages and no manual wiring.
- **Server state with TanStack Query (React Query).** Replace the hand-rolled `useEffect` + `loading`/`error` pattern with caching, request deduplication, background refetching, and a normalised cache. This would also make optimistic updates consistent across components (today each button owns local state seeded from props).
- **End-to-end tests with Playwright** for critical flows (login → favorite → logout), plus broader unit/integration coverage with React Testing Library.
- **Auth hardening.** Store the JWT in an `httpOnly` cookie instead of `localStorage` (mitigates XSS token theft), add refresh-token rotation, handle token expiry, and rehydrate the user via `GET /user` on app start.
- **Configuration via environment.** Drive `baseURL` from `REACT_APP_API_URL` per environment instead of a hardcoded value.
- **Resilience & UX.** React error boundaries, toast notifications for API failures, loading skeletons, and retry/back-off on transient network errors.
- **Routing & performance.** Migrate to react-router v6, `BrowserRouter` with server-side fallback, and route-based code-splitting (`React.lazy`).
- **Toolchain modernisation.** Move from CRA 4 to Vite to eliminate the OpenSSL/Babel version workarounds and dramatically speed up builds.
- **Delivery.** CI pipeline running `lint` + `tsc` + tests on every push, and accessibility (a11y) and i18n passes.
