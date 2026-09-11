# SEYMEN Shared Web Data Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make product and EK-11 edits durable and immediately visible to all visitors while preserving the public GitHub Pages URL, adding an immutable authorized change log, and simplifying the top brand area.

**Architecture:** Keep the current static GitHub Pages frontend and add a public HTTPS Worker API backed by D1. The frontend loads published data through the API, caches the last successful public snapshot for read-only fallback, and sends protected mutations with a short-lived signed session. SQLite triggers write before/after audit rows atomically for every successful product or EK-11 mutation.

**Tech Stack:** Existing HTML/CSS/JavaScript frontend, Node.js built-in test runner, Cloudflare Worker-compatible ESM, D1/SQLite, Drizzle schema and migrations, OpenAI Sites deployment for the API, GitHub Pages for the existing public URL.

**Spec:** `docs/superpowers/specs/2026-09-11-shared-web-data-design.md`

## Global Constraints

- The public address remains `https://shtseymen-eng.github.io/seymen-hesaplama-merkezi/`.
- Every visitor can use all calculation screens without signing in.
- Only the shared authorized password can create, update, or delete products and EK-11 rows.
- Product density is managed in Products; A/B fire rates are managed in EK-11.
- Every successful mutation records server time, entity, action, old values, new values, and actor `Yetkili`.
- Existing calculation formulas and numeric behavior do not change.
- Browser storage is a read-only fallback cache, never the authoritative published data source.
- The current visual language remains; only the requested header copy/layout and management surfaces change.

---

### Task 1: Add the persistent service foundation

**Files:**
- Create: `package.json`
- Modify: `.gitignore`
- Create: `.openai/hosting.json`
- Create: `drizzle.config.ts`
- Create: `db/schema.ts`
- Create: `server/default-data.mjs`
- Create: `server/store.mjs`
- Create: `server/worker.mjs`
- Create: `scripts/extract-default-data.mjs`
- Create: `scripts/build-service.mjs`
- Create: `tests/service-foundation.test.mjs`

**Interfaces:**
- Produces: `createD1Store(db)` with `getPublishedData()`, `createProduct()`, `updateProduct()`, `deleteProduct()`, `createCorrelation()`, `updateCorrelation()`, `deleteCorrelation()`, and `listAudit()`.
- Produces: `DEFAULT_DATA = { products, correlations }` generated from the existing embedded arrays without changing their values.
- Produces: Worker entrypoint at `dist/server/index.js` with `default.fetch(request, env, ctx)`.

- [ ] **Step 1: Write the failing foundation tests**

```js
import test from 'node:test';
import assert from 'node:assert/strict';
import { DEFAULT_DATA } from '../server/default-data.mjs';
import worker from '../server/worker.mjs';

test('default dataset preserves the live calculator records', () => {
  assert.equal(DEFAULT_DATA.products.length, 62);
  assert.equal(DEFAULT_DATA.products.find(p => p.name === 'METHANOL').density, 0.7949);
  assert.ok(DEFAULT_DATA.correlations.length > 90);
});

test('worker exports a callable fetch handler', () => {
  assert.equal(typeof worker.fetch, 'function');
});
```

- [ ] **Step 2: Run the test and verify it fails because the service files do not exist**

Run: `node --test tests/service-foundation.test.mjs`

Expected: FAIL with module-not-found for `server/default-data.mjs` or `server/worker.mjs`.

- [ ] **Step 3: Add the package, hosting, build, schema, and extraction files**

Use a root package with these scripts and only the schema-generation dependencies:

```json
{
  "private": true,
  "scripts": {
    "extract:data": "node scripts/extract-default-data.mjs",
    "db:generate": "drizzle-kit generate",
    "build": "node scripts/build-service.mjs",
    "test": "node --test tests/*.test.js tests/*.test.mjs"
  },
  "devDependencies": {
    "drizzle-kit": "0.31.4",
    "drizzle-orm": "0.44.5"
  }
}
```

Define `products`, `correlations`, `audit_log`, and `metadata` in `db/schema.ts`. Give products and correlations integer primary keys, integer `version` columns defaulting to `1`, and ISO timestamp text columns. Index audit rows by descending id and entity type/id. Configure one logical D1 binding named `DB`; leave R2 unused.

`scripts/extract-default-data.mjs` reads the literal `BASE_PRODUCTS` and `BASE_CORRELATIONS` declarations from `app.js`, evaluates only those JSON-compatible array literals, and writes `server/default-data.mjs`. Assert the 62-product count before writing so extraction cannot silently truncate the source.

`scripts/build-service.mjs` recreates `dist/server`, copies Worker modules there, copies `.openai/hosting.json` to `dist/.openai/hosting.json`, and copies generated Drizzle migrations to `dist/.openai/drizzle`.

- [ ] **Step 4: Generate default data and the initial schema migration**

Run: `npm install`

Run: `npm run extract:data`

Run: `npm run db:generate`

Expected: a generated schema migration defining the four tables and indexes, with no seed rows embedded in the migration.

- [ ] **Step 5: Add audit triggers as a custom Drizzle migration**

Generate a custom migration and fill it with six SQLite triggers: insert/update/delete for `products` and `correlations`. Each trigger inserts `entity_type`, `entity_id`, `entity_name`, `action`, JSON `before_values`, JSON `after_values`, actor `Yetkili`, and `strftime('%Y-%m-%dT%H:%M:%fZ','now')` into `audit_log`.

The update triggers must capture old and new product name/density/version or EK-11 product/GTIP/year/correlation GTIP/A/B/version. The insert trigger leaves `before_values` null; the delete trigger leaves `after_values` null.

- [ ] **Step 6: Implement the minimal store and Worker entrypoint**

`server/store.mjs` uses one prepared SQL statement per `prepare()` call. Updates use `WHERE id = ? AND version = ?` and increment `version` so stale screens return a conflict instead of overwriting current data. On an empty database, `getPublishedData()` inserts `DEFAULT_DATA` with a single `batch`, clears seed-generated audit rows in the same bootstrap operation, and sets metadata key `seeded`.

`server/worker.mjs` initially returns JSON for `GET /health` and delegates later API routes to a `createApp()` function. Export both `createApp` for tests and `default.fetch` for production.

- [ ] **Step 7: Run foundation tests and build**

Run: `npm test`

Run: `npm run build`

Expected: tests PASS; `dist/server/index.js`, `dist/.openai/hosting.json`, and `dist/.openai/drizzle/` exist.

- [ ] **Step 8: Commit the foundation**

```bash
git add package.json package-lock.json .gitignore .openai drizzle.config.ts db server scripts tests drizzle
git commit -m "feat: add durable data service foundation"
```

---

### Task 2: Implement secure login and the mutation API

**Files:**
- Create: `server/auth.mjs`
- Create: `server/validation.mjs`
- Modify: `server/worker.mjs`
- Modify: `server/store.mjs`
- Create: `tests/service-api.test.mjs`

**Interfaces:**
- Produces: `issueSession(secret, now)` and `verifySession(token, secret, now)` using HMAC-SHA-256 and an eight-hour expiry.
- Produces: `validateProduct(input)` and `validateCorrelation(input)` returning normalized values or throwing a typed validation error.
- Produces public routes `GET /api/data`, `GET /health`.
- Produces protected routes `POST /api/products`, `PATCH/DELETE /api/products/:id`, `POST /api/correlations`, `PATCH/DELETE /api/correlations/:id`, `GET /api/audit`.

- [ ] **Step 1: Write failing authentication and API contract tests**

```js
test('login rejects the wrong password and accepts the configured password', async () => {
  const bad = await app.fetch(jsonRequest('/api/auth/login', {password: 'wrong'}), env);
  assert.equal(bad.status, 401);
  const good = await app.fetch(jsonRequest('/api/auth/login', {password: 'test-password'}), env);
  assert.equal(good.status, 200);
  assert.ok((await good.json()).token);
});

test('a product update is global and creates one immutable audit row', async () => {
  const before = await store.getPublishedData();
  const methanol = before.products.find(p => p.name === 'METHANOL');
  const response = await authorizedPatch(`/api/products/${methanol.id}`, {
    name: methanol.name,
    density: 0.7951,
    expectedVersion: methanol.version
  });
  assert.equal(response.status, 200);
  const audit = await store.listAudit();
  assert.equal(audit[0].beforeValues.density, 0.7949);
  assert.equal(audit[0].afterValues.density, 0.7951);
});
```

Add equivalent tests for EK-11 update, create, delete, missing token, invalid numeric input, stale `expectedVersion`, CORS preflight, and failed mutation producing no audit row.

- [ ] **Step 2: Run the API tests and verify they fail**

Run: `node --test tests/service-api.test.mjs`

Expected: FAIL because authentication, route dispatch, and validation are not implemented.

- [ ] **Step 3: Implement signed sessions and server-side password checking**

Read the password only from `env.ADMIN_PASSWORD` and the signing key only from `env.SESSION_SECRET`. Compare password bytes without an early-return character comparison. Sign this payload and reject expired or malformed tokens:

```js
{ "role": "authorized", "exp": 1799692800000 }
```

Never include the configured password or its digest in frontend files, API responses, logs, or audit rows.

- [ ] **Step 4: Implement validation and route dispatch**

Return consistent JSON errors:

```js
{ "error": "validation_error", "message": "Yoğunluk sıfırdan büyük olmalıdır." }
{ "error": "unauthorized", "message": "Yetkili oturumu gerekli." }
{ "error": "version_conflict", "message": "Kayıt başka bir yetkili tarafından değiştirildi." }
```

Allow CORS only for the production GitHub Pages origin and configured local development origins. Require `Authorization: Bearer <token>` on every write and audit read. On success, return the canonical saved row from D1.

- [ ] **Step 5: Run API tests and the complete suite**

Run: `npm test`

Expected: all service and existing calculator tests PASS.

- [ ] **Step 6: Commit the API**

```bash
git add server tests
git commit -m "feat: add authorized shared data API"
```

---

### Task 3: Load shared data and replace temporary browser authorization

**Files:**
- Create: `site-config.js`
- Create: `data-client.js`
- Modify: `index.html`
- Modify: `app.js`
- Create: `tests/data-client.test.js`
- Modify: `tests/ui.test.js`

**Interfaces:**
- Produces: `window.SEYMEN_CONFIG.apiBaseUrl`.
- Produces: `SeymenDataClient.create({baseUrl, fetch, storage})` with `loadData()`, `login(password)`, `logout()`, `create/update/deleteProduct()`, `create/update/deleteCorrelation()`, and `loadAudit()`.
- `app.js` consumes published `{products, correlations}` and a short-lived session token from the client.

- [ ] **Step 1: Write failing client fallback and authorization tests**

```js
test('loadData caches only successful public snapshots', async () => {
  const client = createClient({fetch: successfulDataFetch, storage});
  const first = await client.loadData();
  assert.equal(first.source, 'network');
  const offline = createClient({fetch: rejectingFetch, storage});
  assert.equal((await offline.loadData()).source, 'cache');
});

test('login stores the returned session token, never the password', async () => {
  const client = createClient({fetch: successfulLoginFetch, storage});
  await client.login('test-password');
  assert.equal(storage.getItem('seymen_admin_token'), 'signed-token');
  assert.doesNotMatch(JSON.stringify(storage.dump()), /test-password/);
});
```

- [ ] **Step 2: Run client tests and verify they fail**

Run: `node --test tests/data-client.test.js`

Expected: FAIL because `data-client.js` does not exist.

- [ ] **Step 3: Implement the API client and fallback cache**

Use `localStorage` key `seymen_published_data_v1` only for the last successful public snapshot. Use `sessionStorage` key `seymen_admin_token` only for the signed session. A failed write must not modify the cached published snapshot.

- [ ] **Step 4: Refactor application startup around shared data**

Load `site-config.js` and `data-client.js` before `app.js`. Replace the frontend SHA-256 password check with `client.login(password)`. Replace `TEMP_PRODUCTS_KEY` and `CORR_SESSION_KEY` reads/writes with shared API data. Wrap current synchronous final initialization in an async `bootstrap()` that:

1. renders embedded values immediately,
2. requests public shared data,
3. replaces `PRODUCTS` and `CORRELATIONS` on success or cached fallback,
4. refreshes every product/fire selector and calculation,
5. displays `Eşitlendi`, `Son kayıt kullanılıyor`, or `Başlangıç verisi kullanılıyor` accurately.

- [ ] **Step 5: Run client and UI tests**

Run: `npm test`

Expected: PASS and no source match for the old frontend authorization hash or temporary product/correlation session keys.

- [ ] **Step 6: Commit shared-data loading**

```bash
git add site-config.js data-client.js index.html app.js tests
git commit -m "feat: load published calculator data"
```

---

### Task 4: Restore product editing and simplify the header

**Files:**
- Modify: `index.html`
- Modify: `styles.css`
- Modify: `app.js`
- Modify: `tests/ui.test.js`

**Interfaces:**
- Produces authorized-only product row selection and `dblclick` editor opening.
- Product save calls `client.updateProduct(id, {name, density, expectedVersion})` and applies only the returned canonical row.
- Produces top yellow brand row containing `SEYMEN` and `Fire/Tonaj Hesaplama Sistemi`.

- [ ] **Step 1: Write failing UI structure tests**

```js
test('requested compact brand header replaces the gray window bar', () => {
  assert.doesNotMatch(html, /class="windowbar"/);
  assert.doesNotMatch(html, /Ş\. Melih KARABAY için özenle hazırlanmıştır/);
  assert.match(html, /class="brand-system-name"[^>]*>Fire\/Tonaj Hesaplama Sistemi</);
});

test('authorized product editor is opened by a double click and publishes through the client', () => {
  assert.match(app, /addEventListener\(['"]dblclick['"]/);
  assert.match(app, /updateProduct\(/);
  assert.doesNotMatch(html, /yalnızca bu sekmede geçerlidir|masaüstü uygulamasından yönetilecektir/i);
});
```

- [ ] **Step 2: Run UI tests and verify they fail**

Run: `node --test tests/ui.test.js`

Expected: FAIL on the existing window bar, subtitle, and missing double-click publish behavior.

- [ ] **Step 3: Apply the requested header layout**

Remove the complete gray `windowbar`. Keep the yellow `brandbar` as the first visible section. Replace the subtitle with an inline `span.brand-system-name` beside the existing `SEYMEN` wordmark. Preserve the existing yellow/nav palette and responsive layout; on narrow screens allow the small system name to wrap under the wordmark without restoring the removed subtitle.

- [ ] **Step 4: Implement the product editor interaction**

Keep Products read-only for visitors. After authorization, single click selects a row and double click opens the editor filled with that row. Show only product name and density in the edit fields; fire rates stay under EK-11. Rename the update action to `Kaydet` and publish immediately. Show `Kaydediliyor…`, `Yayınlandı`, and the API error message next to the editor. Preserve add and delete with the same protected API and require confirmation before delete.

- [ ] **Step 5: Run UI and complete tests**

Run: `npm test`

Expected: all tests PASS; existing formulas remain unchanged.

- [ ] **Step 6: Commit header and product editor**

```bash
git add index.html styles.css app.js tests/ui.test.js
git commit -m "feat: publish authorized product edits"
```

---

### Task 5: Publish EK-11 edits and show the immutable change history

**Files:**
- Modify: `index.html`
- Modify: `styles.css`
- Modify: `app.js`
- Modify: `tests/ui.test.js`
- Create: `tests/app-source.test.js`

**Interfaces:**
- EK-11 buttons call the corresponding `SeymenDataClient` mutation and apply the returned row.
- Authorized History view calls `loadAudit()` and renders date/time, data type, action, product, previous values, and new values.

- [ ] **Step 1: Write failing EK-11 and audit-history tests**

```js
test('EK-11 update publishes through the shared client', () => {
  assert.match(app, /updateCorrelation\(/);
  assert.doesNotMatch(app, /sessionStorage\.setItem\(CORR_SESSION_KEY/);
});

test('history contains an authorized data-change section', () => {
  assert.match(html, /id="auditHistory"/);
  assert.match(html, /Önceki Değer/);
  assert.match(html, /Yeni Değer/);
});
```

- [ ] **Step 2: Run tests and verify they fail**

Run: `node --test tests/app-source.test.js tests/ui.test.js`

Expected: FAIL because EK-11 still saves to session storage and no audit table exists.

- [ ] **Step 3: Replace EK-11 temporary writes with API mutations**

For `Yeni`, `Güncelle`, and `Sil`, disable action buttons while saving. On success update `CORRELATIONS`, refresh Fire and 90+ Fire selections/calculations, rerender the table, and show `Yayınlandı`. On conflict reload public data and ask the authorized user to reopen the changed row. On failure keep the last published values.

- [ ] **Step 4: Add authorized data-change history**

Keep the existing browser-local calculation history unchanged. Add `Veri Değişiklikleri` under the same page but hidden until authorized. Render audit rows newest first using `Intl.DateTimeFormat('tr-TR', {timeZone:'Europe/Istanbul', dateStyle:'short', timeStyle:'medium'})`. Format before/after JSON into short field/value text and show `—` for the missing side of create/delete actions. Do not expose a delete/edit audit control.

- [ ] **Step 5: Remove desktop/temporary wording and stale source simulation**

Remove the old `Ana Masaüstü`, `Masaüstü -> web`, `Geçici Yetkili Modu`, `yalnız bu sekmede`, and `kalıcı ana veri masaüstü` wording and logic. Keep the real shared-data status badge driven by API/cache state.

- [ ] **Step 6: Run all tests**

Run: `npm test`

Expected: all tests PASS, with no temporary correlation/product persistence and no desktop source simulation.

- [ ] **Step 7: Commit EK-11 and history**

```bash
git add index.html styles.css app.js tests
git commit -m "feat: publish EK-11 edits with audit history"
```

---

### Task 6: Configure, publish, and verify both services

**Files:**
- Modify: `.openai/hosting.json` with the exact Sites `project_id`
- Modify: `site-config.js` with the exact expected/live API origin
- Modify: `README.md`

**Interfaces:**
- GitHub Pages remains the visitor-facing site.
- The Sites Worker URL is used only as `apiBaseUrl` by the frontend.
- Hosted environment provides secret `ADMIN_PASSWORD` and secret `SESSION_SECRET`.

- [ ] **Step 1: Run final local verification before any deployment**

Run: `npm test`

Run: `npm run build`

Run: `git diff --check`

Expected: all tests and build PASS; no whitespace errors; the built Worker exports `default.fetch`.

- [ ] **Step 2: Create the API Site once and persist its project id**

Read `.openai/hosting.json`. If `project_id` is null, create one Site named `SEYMEN Hesaplama Veri Hizmeti`, immediately write the returned opaque id into the file, and place the returned `expected_url` in `site-config.js`. Never create a second Site for this checkout.

- [ ] **Step 3: Request action-time confirmation for the shared password**

Immediately before transmitting the user-provided shared password to hosted environment storage or a live login check, ask for confirmation. After confirmation, set `ADMIN_PASSWORD` as a secret and set a newly generated high-entropy `SESSION_SECRET` as a secret. Do not print either value.

- [ ] **Step 4: Commit and push the exact source state to the Sites source repository**

Commit `.openai/hosting.json`, `site-config.js`, and README deployment notes. Push the exact HEAD to the Sites source remote with the short-lived credential, then copy the full `git rev-parse --verify HEAD` value for version creation.

- [ ] **Step 5: Package, save, publicly deploy, and inspect the API**

Package the validated `dist` output using the Sites packaging helper. Save a Site version from the exact pushed commit, set Site access to public because anonymous GitHub Pages visitors must read `/api/data`, deploy the saved version, and wait for terminal success. Verify `GET /health` and `GET /api/data` without credentials.

- [ ] **Step 6: Verify protected writes without changing production values**

After the action-time confirmation in Step 3, perform a live login and a read-only `GET /api/audit` using the returned session token. Do not perform a test product or EK-11 mutation against production data.

- [ ] **Step 7: Push the frontend to GitHub Pages**

Push the same final source to `origin/main`. Wait for the GitHub Pages deployment associated with that commit to succeed.

- [ ] **Step 8: Verify the public release**

Check the public HTML/CSS/JS and public API responses to confirm:

- the gray window bar and old personal subtitle are absent,
- `SEYMEN` and `Fire/Tonaj Hesaplama Sistemi` are present in the yellow header,
- public data returns 62 products and EK-11 rows,
- the frontend contains no password or password hash,
- calculation tests still pass,
- the deployed API and GitHub Pages commit match the final source.

- [ ] **Step 9: Commit any deployment metadata changes and report the release**

If publishing updates tracked metadata, commit and push only those exact files, rerun `npm test`, and wait for the final GitHub Pages deployment. Report the unchanged public URL and summarize the authorized editing/audit behavior.
