# SEYMEN Web Application Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Publish the first working SEYMEN web application with public calculators and product lookup, plus a password-protected read-only history surface ready for later desktop/API synchronization.

**Architecture:** Create a Sites-compatible Vinext/React application under `apps/web` and a framework-independent calculation package under `packages/calculations`. The public web routes use the 62 verified Excel products embedded as initial read-only data; web calculations remain browser-local and are never saved. The history route uses a server-verified shared access code and initially displays zero/empty reporting values until the later API/synchronization subsystem supplies real records.

**Tech Stack:** TypeScript, React, Vinext/Vite from `@openai/create-sites@0.2.0`, Decimal.js, Vitest, Testing Library, Lucide React, OpenAI Sites, GitHub Actions-compatible npm scripts.

**Spec:** `docs/superpowers/specs/2026-08-28-desktop-web-calculation-app-design.md`

## Global Constraints

- Keep the exact left-menu order and labels: `Litre - Tonaj`, `Tonaj - Litre`, `Fire Hesaplama`, `Ürünler`, `Geçmiş Hesaplamalar`.
- Show a yellow `#F4C542` brand band with blue `#123A63` `SEYMEN` text and `Ş. Melih KARABAY için özenle hazırlanmıştır.` on every route.
- Preserve the Excel table labels, values, formulas, result/status spelling, and 62-product density list.
- Show fill rate as `%95`; convert it to `0.95` only at the calculation boundary.
- Web visitors may calculate and search products but may not add, edit, delete, or save products, formulas, or history.
- Public routes require no account. `/gecmis` requires a server-verified shared access code and remains read-only.
- Do not commit access codes, session secrets, environment values, or build credentials.
- Package internet-sourced images locally and include photographer, source URL, and license information in `THIRD_PARTY_NOTICES.md`.
- Use Turkish field labels, validation messages, dates, and number formatting.
- Follow red-green-refactor for every behavior change and commit after every independently testable task.

---

## File Structure

```text
package.json                                      # npm workspace and root verification scripts
package-lock.json                                 # single lockfile for web and shared packages
packages/calculations/package.json                # framework-independent calculation package
packages/calculations/src/index.ts                # public package exports
packages/calculations/src/types.ts                # calculation/product contracts
packages/calculations/src/fill-rate.ts            # % display value to Excel ratio conversion
packages/calculations/src/litre-tonaj.ts           # litre-to-tonnage formula
packages/calculations/src/tonaj-litre.ts           # tonnage-to-litre formula
packages/calculations/src/fire.ts                  # Ek-11 fire formulas and date-only arithmetic
packages/calculations/src/products.ts              # exact 62-row initial product list
packages/calculations/test/*.test.ts               # Excel fixtures and boundary tests
apps/web/.openai/hosting.json                      # Sites project id only after create_site
apps/web/.env.example                              # names of required secrets, never values
apps/web/app/layout.tsx                            # metadata and shared application shell
apps/web/app/page.tsx                              # public entry page mirroring /litre-tonaj
apps/web/app/litre-tonaj/page.tsx                  # public litre-to-tonnage route
apps/web/app/tonaj-litre/page.tsx                  # public tonnage-to-litre route
apps/web/app/fire-hesaplama/page.tsx               # public fire route
apps/web/app/urunler/page.tsx                      # public read-only product route
apps/web/app/gecmis/page.tsx                       # protected read-only history route
apps/web/app/api/history-access/route.ts           # server-side access-code verification
apps/web/app/api/history-logout/route.ts           # clears the protected-history cookie
apps/web/app/globals.css                           # responsive SEYMEN design system
apps/web/components/app-shell.tsx                  # brand band, sidebar, mobile navigation
apps/web/components/hero.tsx                       # route-specific local image header
apps/web/components/number-field.tsx               # Turkish number input wrapper
apps/web/components/percent-field.tsx              # visible % prefix and 1–100 input
apps/web/components/result-row.tsx                 # read-only result surface
apps/web/components/history-lock.tsx               # access-code form
apps/web/components/history-empty-report.tsx       # zero-state summary cards and chart
apps/web/features/litre-tonaj/calculator.tsx       # interactive public calculator
apps/web/features/tonaj-litre/calculator.tsx       # interactive public calculator
apps/web/features/fire/calculator.tsx               # interactive public calculator
apps/web/features/products/product-list.tsx        # searchable read-only product table
apps/web/lib/history-auth.ts                       # Web Crypto password/session helpers
apps/web/lib/format.ts                             # Turkish number/date formatting
apps/web/public/images/*.webp                      # five optimized licensed images
apps/web/test/*.test.tsx                           # component/route tests
apps/web/THIRD_PARTY_NOTICES.md                    # photo/icon license records
```

### Task 1: Scaffold the Sites-compatible workspace and test harness

**Files:**
- Create: `package.json`
- Create: `apps/web/*` from the pinned Sites scaffold
- Create: `apps/web/vitest.config.ts`
- Create: `apps/web/test/setup.ts`
- Create: `apps/web/app/page.test.tsx`
- Modify: `.gitignore`

**Interfaces:**
- Consumes: existing Git repository and approved design spec.
- Produces: `npm run test:web`, `npm run build:web`, and a Sites-compatible `apps/web` project for every later task.

- [ ] **Step 1: Scaffold the web project without overwriting repository documentation**

Run:

```bash
mkdir -p apps
npm create --yes @openai/sites@0.2.0 apps/web -- --yes
```

Inspect `apps/web/package.json`, `apps/web/app/page.tsx`, `apps/web/app/layout.tsx`, `apps/web/app/globals.css`, and `apps/web/.openai/hosting.json`. Preserve scaffold-selected framework versions and the `sites()` Vite integration. Remove only starter-only page content after the failing smoke test exists.

- [ ] **Step 2: Create the root workspace scripts**

Create `package.json`:

```json
{
  "name": "seymen-hesaplama-merkezi",
  "private": true,
  "workspaces": ["apps/*", "packages/*"],
  "scripts": {
    "dev:web": "npm --workspace apps/web run dev",
    "test": "npm run test:calculations && npm run test:web",
    "test:calculations": "npm --workspace packages/calculations run test",
    "test:web": "npm --workspace apps/web run test",
    "build:web": "npm --workspace apps/web run build"
  }
}
```

Move dependency ownership to the root lockfile with `npm install`; do not keep a second `apps/web/package-lock.json`.

- [ ] **Step 3: Write the failing web smoke test**

Create `apps/web/app/page.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react";
import HomePage from "./page";

test("opens the litre-tonaj route as the web entry point", () => {
  render(<HomePage />);
  expect(screen.getByText("Litre - Tonaj")).toBeInTheDocument();
  expect(screen.getByText("Ş. Melih KARABAY için özenle hazırlanmıştır.")).toBeInTheDocument();
});
```

- [ ] **Step 4: Run the test and verify RED**

Run: `npm run test:web -- --run app/page.test.tsx`

Expected: FAIL because the starter page does not contain the SEYMEN entry surface.

- [ ] **Step 5: Add the minimal page and test configuration**

Configure Vitest with `jsdom`, Testing Library, and `apps/web/test/setup.ts`. Replace the starter page with a minimal SEYMEN heading, note, and `Litre - Tonaj` link; do not build the full shell yet.

- [ ] **Step 6: Verify GREEN and build**

Run:

```bash
npm run test:web -- --run app/page.test.tsx
npm run build:web
```

Expected: one passing smoke test and a successful Sites-compatible build.

- [ ] **Step 7: Commit**

```bash
git add package.json package-lock.json apps/web .gitignore
git commit -m "chore: scaffold SEYMEN web application"
```

### Task 2: Implement the shared Excel calculation engine

**Files:**
- Create: `packages/calculations/package.json`
- Create: `packages/calculations/src/types.ts`
- Create: `packages/calculations/src/fill-rate.ts`
- Create: `packages/calculations/src/litre-tonaj.ts`
- Create: `packages/calculations/src/tonaj-litre.ts`
- Create: `packages/calculations/src/fire.ts`
- Create: `packages/calculations/src/index.ts`
- Create: `packages/calculations/test/litre-tonaj.test.ts`
- Create: `packages/calculations/test/tonaj-litre.test.ts`
- Create: `packages/calculations/test/fire.test.ts`

**Interfaces:**
- Consumes: numeric strings and ISO `YYYY-MM-DD` calendar dates from web form components.
- Produces: `fillPercentToRatio`, `calculateLitreToTonaj`, `calculateTonajToLitre`, and `calculateFire` with decimal strings safe for presentation.

- [ ] **Step 1: Define the contracts in the failing tests**

Use these exported types:

```ts
export type Status = "UYGUN" | "ASIM VAR" | "AŞIM VAR";

export interface LitreToTonajInput {
  tankLitres: string;
  fillPercent: string;
  densityKgPerLitre: string;
  adrMaxTonnes: string;
}

export interface LitreToTonajResult {
  densityKgPerLitre: string;
  safeLitres: string;
  loadableKg: string;
  loadableTonnes: string;
  status: "UYGUN" | "ASIM VAR";
}

export interface TonajToLitreInput {
  desiredTonnes: string;
  fillPercent: string;
  densityKgPerLitre: string;
  adrMaxTonnes: string;
}

export interface TonajToLitreResult {
  densityKgPerLitre: string;
  requiredNetLitres: string;
  requiredTankLitres: string;
  status: "UYGUN" | "AŞIM VAR";
}

export interface FireInput {
  entryKg: string;
  rateA: string;
  dailyRateB: string;
  arrivalDate: string;
  currentDate: string;
  remainingAfter90Kg: string;
}
```

Write tests asserting:

```ts
expect(fillPercentToRatio("95")).toBe("0.95");

expect(calculateLitreToTonaj({
  tankLitres: "26000",
  fillPercent: "95",
  densityKgPerLitre: "1.0227",
  adrMaxTonnes: "26"
})).toEqual({
  densityKgPerLitre: "1.0227",
  safeLitres: "24700",
  loadableKg: "25260.69",
  loadableTonnes: "25.26069",
  status: "UYGUN"
});

expect(calculateTonajToLitre({
  desiredTonnes: "25000",
  fillPercent: "95",
  densityKgPerLitre: "0.7949",
  adrMaxTonnes: "26"
})).toEqual({
  densityKgPerLitre: "0.7949",
  requiredNetLitres: "31450496.917851301", 
  requiredTankLitres: "33105786.229317159",
  status: "AŞIM VAR"
});
```

For fire, assert the source fixture within Decimal.js precision:

```ts
const result = calculateFire({
  entryKg: "1720206",
  rateA: "0.004",
  dailyRateB: "0.00002",
  arrivalDate: "2024-04-12",
  currentDate: "2026-06-12",
  remainingAfter90Kg: "115000"
});
expect(result.totalDays).toBe(791);
expect(result.first90Days).toBe(90);
expect(result.excessDays).toBe(701);
```

For this exact 791-day fixture, assert `6880.824`, `1601.0663101848431`, `8481.890310184845`, `1612.3`, and `8493.124` within `1e-9`. This preserves the workbook result while making the Excel serial-date conversion explicit.

- [ ] **Step 2: Run calculation tests and verify RED**

Run: `npm run test:calculations`

Expected: FAIL because the calculation package and exports do not exist.

- [ ] **Step 3: Implement minimal formulas with Decimal.js**

Implement these equations without presentation rounding:

```ts
export const fillPercentToRatio = (value: string) =>
  new Decimal(value).div(100).toString();

safeLitres = tankLitres * fillPercentToRatio(fillPercent)
loadableKg = safeLitres * densityKgPerLitre
loadableTonnes = loadableKg / 1000
requiredNetLitres = desiredTonnes * 1000 / densityKgPerLitre
requiredTankLitres = requiredNetLitres / fillPercentToRatio(fillPercent)
first90Days = min(totalDays, 90)
excessDays = max(totalDays - 90, 0)
first90LossKg = entryKg * rateA
post90LossKg = remainingAfter90Kg * (1 - (1 - dailyRateB) ^ excessDays)
totalAllowedLossKg = first90LossKg + post90LossKg
linearPost90LossKg = remainingAfter90Kg * dailyRateB * excessDays
linearTotalLossKg = first90LossKg + linearPost90LossKg
```

Reject fill percentages outside `1..100`, negative masses/volumes/rates, zero density, and future arrival dates with field-specific `CalculationValidationError` entries.

- [ ] **Step 4: Verify GREEN**

Run: `npm run test:calculations`

Expected: all Excel fixtures and validation cases pass with no warnings.

- [ ] **Step 5: Commit**

```bash
git add packages/calculations package.json package-lock.json
git commit -m "feat: add shared Excel calculation engine"
```

### Task 3: Add the exact 62-product read-only seed list

**Files:**
- Create: `packages/calculations/src/products.ts`
- Create: `packages/calculations/test/products.test.ts`
- Modify: `packages/calculations/src/index.ts`

**Interfaces:**
- Consumes: the verified `Urunler!A2:B63` workbook rows.
- Produces: `PRODUCTS: readonly Product[]` and `findProductById(id: string): Product | undefined`.

- [ ] **Step 1: Write the failing product integrity test**

```ts
expect(PRODUCTS).toHaveLength(62);
expect(PRODUCTS[0]).toEqual({ id: "p001", name: "2 E. HEXANOL", densityKgPerLitre: "0.8352" });
expect(PRODUCTS.find((p) => p.name === "POLYOL 0548")?.densityKgPerLitre).toBe("1.0227");
expect(PRODUCTS.find((p) => p.name === "METHANOL")?.densityKgPerLitre).toBe("0.7949");
expect(PRODUCTS.at(-1)).toEqual({ id: "p062", name: "XYLENE", densityKgPerLitre: "0.8645" });
expect(new Set(PRODUCTS.map((p) => p.name.toLocaleUpperCase("tr-TR"))).size).toBe(62);
```

- [ ] **Step 2: Run the product test and verify RED**

Run: `npm run test:calculations -- --run test/products.test.ts`

Expected: FAIL because `PRODUCTS` is not exported.

- [ ] **Step 3: Create `PRODUCTS` with the exact workbook order and density strings**

Use this complete source sequence, assigning IDs `p001` through `p062` in order:

```ts
[
  ["2 E. HEXANOL", "0.8352"],
  ["ACETIC ASID", "1.0544"],
  ["ACETONE", "0.795"],
  ["ARAMCO PRIMA 110", "0.8603"],
  ["ARCOL POLYOL 1107-1108", "1.0212"],
  ["BA - 15 PPM MEHQ/BULK", "0.9027"],
  ["BASE OIL 70N", "0.8318"],
  ["BASE OIL HVI 4", "0.8444"],
  ["BASE OIL SN 150", "0.8755"],
  ["BASE OIL SN 350", "0.883"],
  ["BUTYL ACRYLATE 15 PPM MEHQ BULK", "0.9018"],
  ["BUTYL CELLOSOLVE", "0.9031"],
  ["CARADOL ED56-200", "1.0058"],
  ["CARADOL SC 48-08", "1.0215"],
  ["CARADOL SP 30-47", "1.0475"],
  ["CARADOL SP 42-15", "1.0294"],
  ["DENATÜRE METHANOL", "0.7949"],
  ["DIDP ( Dİ-İZODESİL FTALAT )", "0.9686"],
  ["DIETILEN GLIKOL (2.2", "1.1191"],
  ["DINP ( Dİ-İZONONİL FTALAT )", "0.9745"],
  ["EA - 15 PPM MEHQ/BULK", "0.9264"],
  ["EOA TEA 99% PMLA BULK", "1.1251"],
  ["ETHYL ACETATE", "0.9055"],
  ["ETHYL PROXİTOL", "0.9001"],
  ["FORMIC ACID", "1.2009"],
  ["HEXANE", "0.6784"],
  ["ISO BUTHANOL", "0.8044"],
  ["ISOPROPANOL", "0.7882"],
  ["L.A.B.", "0.8589"],
  ["M.E.K.", "0.8091"],
  ["M.ETHYLENE GLYCOL", "1.1159"],
  ["MDI (DESMODUR 44 V 20 L", "1.2416"],
  ["METHANOL", "0.7949"],
  ["METHYL ACETATE", "0.939"],
  ["Methylene Chloride (MEC)", "1.3336"],
  ["METIL PROXITOL", "0.9245"],
  ["MMA - 20 PPM AO-30/BULK", "0.9481"],
  ["MMA-20 PPM AO-30/BULK", "0.948"],
  ["N-BUTANOL", "0.8124"],
  ["N-BUTYL ACETATE", "0.8854"],
  ["NEODOL 25-7", "0.9852"],
  ["N-PROPANOL", "0.8073"],
  ["OXC BUCS SOLV BULK", "0.9033"],
  ["OXS BUCB SOLV BULK", "0.9552"],
  ["OXS DOWANOL DPNB BULK", "0.9158"],
  ["PG IND BULK ZFIN", "1.0387"],
  ["PGI - PROPILEN GLIKOL", "1.0388"],
  ["PHENOL", "1.0697"],
  ["PM GLYCOL ", "0.9243"],
  ["POLYMERIC MDI", "1.2404"],
  ["POLYOL 0548", "1.0227"],
  ["SABIC TDI 0380", "1.2239"],
  ["SAE10(SN150)", "0.8831"],
  ["SAE30(SN500)", "0.8942"],
  ["SAPEG-400 (Polyethylene Glycol)", "1.1287"],
  ["SOLVENT NAPHTA (Düşük Kümenli SOLGAD 100)", "0.8761"],
  ["STRENE MONOMER", "0.9095"],
  ["SULU H.METHYLENE DI.", "0.8389"],
  ["SUPRASEC 5025 (MDI)", "1.2414"],
  ["TDI (DESMODUR T-80)", "1.224"],
  ["VAM HQ 14-17BK", "0.9367"],
  ["XYLENE", "0.8645"]
]
```

- [ ] **Step 4: Verify GREEN and commit**

Run: `npm run test:calculations`

```bash
git add packages/calculations
git commit -m "data: add verified Excel product densities"
```

### Task 4: Build the shared SEYMEN shell and first meaningful preview

**Files:**
- Create: `apps/web/components/app-shell.tsx`
- Create: `apps/web/components/hero.tsx`
- Create: `apps/web/test/app-shell.test.tsx`
- Modify: `apps/web/app/layout.tsx`
- Modify: `apps/web/app/globals.css`
- Create: `apps/web/public/images/litre-tonaj.webp`
- Create: `apps/web/public/images/tonaj-litre.webp`
- Create: `apps/web/public/images/fire.webp`
- Create: `apps/web/public/images/urunler.webp`
- Create: `apps/web/public/images/gecmis.webp`
- Create: `apps/web/THIRD_PARTY_NOTICES.md`

**Interfaces:**
- Consumes: route pathname and page content.
- Produces: `AppShell({ children })` and `Hero({ title, description, image, alt })` shared by all five routes.

- [ ] **Step 1: Write failing shell tests**

Assert the exact menu order, brand copy, web read-only status, active route state, and five accessible local image alternatives. Verify there is no `Yeni Ürün`, `Düzenle`, `Sil`, or `Hesaplamayı Kaydet` action in the web shell.

- [ ] **Step 2: Run and verify RED**

Run: `npm run test:web -- --run test/app-shell.test.tsx`

Expected: FAIL because `AppShell` and `Hero` do not exist.

- [ ] **Step 3: Implement the shell and route-aware navigation**

Use Lucide icons `Container`, `Scale`, `Percent`, `PackageSearch`, and `History`. Desktop uses a 212–232 px left sidebar; widths below 600 px use a horizontally scrollable, keyboard-accessible navigation strip. Keep all product surfaces opaque and maintain visible browser focus styles.

- [ ] **Step 4: Add optimized local images and notices**

Download and optimize the five approved Unsplash/Pexels images to WebP, maximum width 1600 px and total payload below 1.2 MB. Record photographer, exact source URL, and license URL in `THIRD_PARTY_NOTICES.md`. Do not hotlink.

- [ ] **Step 5: Verify GREEN and build**

Run:

```bash
npm run test:web -- --run test/app-shell.test.tsx
npm run build:web
```

- [ ] **Step 6: Complete the first meaningful preview gate**

Start `npm run dev:web` in a retained session. Require a successful response from the exact local URL printed by the server, then call `open_in_codex` once to show the SEYMEN shell with the real litre-tonaj hero and representative input/result rows. Make no broad product-source changes until this handoff is complete.

- [ ] **Step 7: Commit**

```bash
git add apps/web
git commit -m "feat: add SEYMEN web shell and branded visuals"
```

### Task 5: Implement both product-based calculators

**Files:**
- Create: `apps/web/components/number-field.tsx`
- Create: `apps/web/components/percent-field.tsx`
- Create: `apps/web/components/result-row.tsx`
- Create: `apps/web/features/litre-tonaj/calculator.tsx`
- Create: `apps/web/features/tonaj-litre/calculator.tsx`
- Modify: `apps/web/app/page.tsx`
- Create: `apps/web/app/litre-tonaj/page.tsx`
- Create: `apps/web/app/tonaj-litre/page.tsx`
- Create: `apps/web/test/product-calculators.test.tsx`
- Create: `apps/web/lib/format.ts`

**Interfaces:**
- Consumes: `PRODUCTS`, `calculateLitreToTonaj`, and `calculateTonajToLitre` from `@seymen/calculations`.
- Produces: public interactive calculator routes with automatic results and no persistence.

- [ ] **Step 1: Write failing interaction tests**

Test these real behaviors:

```tsx
expect(screen.getByLabelText("Dolum Oranı (%)")).toHaveValue(95);
expect(screen.getByText("%")).toBeVisible();
await user.clear(screen.getByLabelText("Tank Hacmi (L)"));
await user.type(screen.getByLabelText("Tank Hacmi (L)"), "26000");
await user.selectOptions(screen.getByLabelText("Ürün Seçimi"), "p051");
expect(screen.getByText("25,26069")).toBeVisible();
expect(screen.getByText("UYGUN")).toBeVisible();
expect(screen.queryByText("Hesaplamayı Kaydet")).not.toBeInTheDocument();
```

Add the source tonnage fixture with `25000`, `METHANOL`, `%95`, and ADR `26`; assert `31.450.496,9178513 L`, `33.105.786,22931716 L`, and `AŞIM VAR`.

- [ ] **Step 2: Run tests and verify RED**

Run: `npm run test:web -- --run test/product-calculators.test.tsx`

- [ ] **Step 3: Implement the minimum calculators**

Keep form state as strings. On each valid change, call the shared package and format only the returned value with `Intl.NumberFormat("tr-TR")`. On invalid input, clear results and show the first field-specific Turkish message with `role="alert"`. The `%` prefix is visual and `aria-hidden`; the label contains `(%)` for screen readers.

- [ ] **Step 4: Verify GREEN, run all calculation tests, and commit**

```bash
npm run test:calculations
npm run test:web -- --run test/product-calculators.test.tsx
git add apps/web
git commit -m "feat: add public litre and tonnage calculators"
```

### Task 6: Implement the Ek-11 fire calculator

**Files:**
- Create: `apps/web/features/fire/calculator.tsx`
- Create: `apps/web/app/fire-hesaplama/page.tsx`
- Create: `apps/web/test/fire-calculator.test.tsx`

**Interfaces:**
- Consumes: `calculateFire` from `@seymen/calculations` and the current local calendar date.
- Produces: public Ek-11 table, alternative linear section, and visible copy/paste formula reference with read-only results.

- [ ] **Step 1: Write the failing fire-route test**

Use a fixed `currentDate="2026-06-12"`. Enter the workbook values and assert the first-90, post-90 compound, total, linear alternative, and reference B7–B12 values. Assert `90 gün sonu kalan miktar (kg)` remains editable while the reference B10 result is calculated as `Giriş miktarı − İlk 90 gün fire`.

- [ ] **Step 2: Verify RED**

Run: `npm run test:web -- --run test/fire-calculator.test.tsx`

- [ ] **Step 3: Implement the source table behavior**

Use date-only ISO strings; never subtract local-midnight `Date` objects. Show the device date as `GG.AA.YYYY`, and reject a future arrival date. Keep A and B rate inputs in the source workbook ratio format (`0,004` and `0,00002`), because the requested `%95` simplification applies only to fields named **Dolum Oranı**.

- [ ] **Step 4: Verify GREEN and commit**

```bash
npm run test:calculations
npm run test:web -- --run test/fire-calculator.test.tsx
git add apps/web
git commit -m "feat: add public Ek-11 fire calculator"
```

### Task 7: Implement the public read-only products route

**Files:**
- Create: `apps/web/features/products/product-list.tsx`
- Create: `apps/web/app/urunler/page.tsx`
- Create: `apps/web/test/products-page.test.tsx`

**Interfaces:**
- Consumes: `PRODUCTS` from `@seymen/calculations`.
- Produces: searchable read-only table with 62 products and density values.

- [ ] **Step 1: Write failing tests**

Assert 62 rows, Turkish locale-insensitive search, a no-results state, and absence of add/edit/save/delete controls.

- [ ] **Step 2: Verify RED**

Run: `npm run test:web -- --run test/products-page.test.tsx`

- [ ] **Step 3: Implement search and table**

Use `toLocaleUpperCase("tr-TR")` on both query and product name. Preserve source order; do not silently rename, trim, merge, or deduplicate source entries.

- [ ] **Step 4: Verify GREEN and commit**

```bash
npm run test:web -- --run test/products-page.test.tsx
git add apps/web
git commit -m "feat: add read-only product directory"
```

### Task 8: Protect the read-only history route with a shared access code

**Files:**
- Create: `apps/web/lib/history-auth.ts`
- Create: `apps/web/app/api/history-access/route.ts`
- Create: `apps/web/app/api/history-logout/route.ts`
- Create: `apps/web/components/history-lock.tsx`
- Create: `apps/web/components/history-empty-report.tsx`
- Create: `apps/web/app/gecmis/page.tsx`
- Create: `apps/web/test/history-auth.test.ts`
- Create: `apps/web/test/history-page.test.tsx`
- Create: `apps/web/.env.example`

**Interfaces:**
- Consumes: `HISTORY_ACCESS_PASSWORD_HASH` and `HISTORY_SESSION_SECRET` server environment values.
- Produces: `verifyAccessCode(code)`, `createHistorySession(expiry)`, `verifyHistorySession(cookie)`, a secure `seymen_history` cookie, and a protected zero-state history page.

- [ ] **Step 1: Write failing auth tests**

Assert that a valid access code passes PBKDF2 comparison, an invalid code fails, a modified/expired HMAC cookie fails, and a valid cookie passes. Assert the response cookie is `HttpOnly`, `Secure`, `SameSite=Strict`, `Path=/gecmis`, and has an eight-hour maximum age.

- [ ] **Step 2: Verify RED**

Run: `npm run test:web -- --run test/history-auth.test.ts test/history-page.test.tsx`

- [ ] **Step 3: Implement worker-compatible Web Crypto helpers**

Use `crypto.subtle` PBKDF2-SHA-256 for the stored password hash and HMAC-SHA-256 for the session. Compare fixed-length byte arrays without early exit. Return a generic `Parola doğrulanamadı.` message; never reveal whether configuration or the submitted code failed.

- [ ] **Step 4: Implement the protected zero-state route**

Unauthenticated visitors see the access-code form. Authenticated visitors see zero-valued summary cards, a `Henüz masaüstünden eşitlenmiş hesaplama bulunmuyor.` message, disabled filters, and a logout action. Do not invent sample company history records.

- [ ] **Step 5: Verify GREEN and commit**

```bash
npm run test:web -- --run test/history-auth.test.ts test/history-page.test.tsx
git add apps/web
git commit -m "feat: protect read-only calculation history"
```

### Task 9: Complete accessibility, responsive behavior, and production verification

**Files:**
- Create: `apps/web/test/navigation.test.tsx`
- Create: `apps/web/test/accessibility.test.tsx`
- Modify: `apps/web/app/globals.css`
- Modify: `apps/web/app/layout.tsx`

**Interfaces:**
- Consumes: all public/protected routes from Tasks 4–8.
- Produces: final responsive, keyboard-accessible, production-buildable web application.

- [ ] **Step 1: Write failing cross-route tests**

Assert exact menu order on all routes, one `h1`, linked labels for every form control, visible focus outlines, Turkish alt text for all five hero images, no horizontal page overflow at 360 px, and no web mutation/save controls.

- [ ] **Step 2: Verify RED**

Run: `npm run test:web -- --run test/navigation.test.tsx test/accessibility.test.tsx`

- [ ] **Step 3: Apply only the responsive/accessibility fixes required by tests**

At 600 px and below, make the navigation strip horizontally scrollable inside its own width while the page itself remains overflow-free. Stack calculator columns and reporting panels; keep input text at least 16 px for touch devices and action targets approximately 44 px.

- [ ] **Step 4: Run the full verification suite**

```bash
npm test
npm run build:web
git diff --check
```

Expected: zero test failures, no warnings that affect runtime, and a successful production build.

- [ ] **Step 5: Commit and push the private source repository**

```bash
git add apps/web packages/calculations package.json package-lock.json
git commit -m "feat: complete first SEYMEN web release"
git push
```

### Task 10: Publish the public web link while keeping GitHub private

**Files:**
- Modify: `apps/web/.openai/hosting.json` with the Sites `project_id` only
- Create temporarily outside the repository: deployment archive and Sites source checkout

**Interfaces:**
- Consumes: successful `npm run build:web`, Sites project metadata, and generated high-entropy history access code.
- Produces: a public Sites URL; `/gecmis` remains access-code protected.

- [ ] **Step 1: Create secure deployment values without committing them**

Generate a 20-character human-shareable access code with at least 96 bits of randomness, a 32-byte random session secret, and a PBKDF2-SHA-256 password hash with a random 16-byte salt and 210,000 iterations. Store only the hash and session secret as hosted runtime secrets. Return the access code to the user once after successful deployment; never write it to Git or local project files.

- [ ] **Step 2: Create or reuse the Sites project**

If `apps/web/.openai/hosting.json` has no `project_id`, call `create_site` once and persist only the returned `project_id`. Reuse the source write credential without placing it in a remote URL or Git configuration.

- [ ] **Step 3: Commit hosting metadata to the private GitHub repository**

Run the full build again only if the hosting metadata changes source behavior, then commit `.openai/hosting.json` and push `main`.

- [ ] **Step 4: Package and save the validated version**

Use the Sites plugin root-level `scripts/package-site.sh`, passing `apps/web` and a temporary archive path. Verify the archive contains `dist/server/index.js`, emitted static assets, and `dist/.openai/hosting.json`. Push the exact validated source through the temporary Sites source checkout and use its branch-head SHA for `commit_sha`; save exactly one version.

- [ ] **Step 5: Confirm and publish with public access**

Immediately before the public deployment, state that anyone with the web URL will be able to open the four public screens while `/gecmis` still requires the access code. Obtain the required public-publish confirmation, call `deploy_site_version`, and poll `get_deployment_status` until it reports `succeeded` or a terminal failure.

- [ ] **Step 6: Handoff the deployed site**

Use the same preview tab to open the exact deployed URL. Verify only the deployment status at this phase; do not add a new polish pass. Return the public URL, the one-time history access code, and the clear statement that the private GitHub repository remains visible only to explicitly invited collaborators.

---

## Deferred to Later Plans

- Desktop Electron application and Windows EXE packaging
- SQLite product/history management and desktop CRUD
- PostgreSQL/API data store
- One-way desktop-to-web synchronization
- Real web history records and reporting derived from synchronized data
- Private EXE release/download authorization
