# RENISINFRA — bulk property image uploader

Playwright automation that drives the admin CMS the way a person would: sign in,
open each property's edit drawer, push images through the Media Library, and save.

```bash
cd automation
npm install
npx playwright install chromium   # first run only

npm run upload                    # every folder under IMAGES_ROOT
npm run upload -- one-by-msn      # a single project
npm run upload:dry                # walk everything, discard instead of saving
npm run upload:headed             # watch it work

npm run download -- <folder …>    # fetch images from image-list.txt via a browser
npm run sync -- <folder …>        # download, then upload, in one pass
npm run verify -- <folder …>      # PASS/FAIL table: slots, media, CMS + public pages
npm run repair:urls               # normalise absolute media URLs to relative
npm run migrate                   # download → upload → verify → repair → verify
```

`npm run migrate` is the one-shot entry point. It downloads anything missing,
uploads it, verifies the result, re-runs the uploader on anything still broken
(up to two repair passes), and prints a Completed / Skipped / Failed /
Downloaded / Uploaded report. Nothing about it is interactive.

Both dev servers must be running (`npm run dev` at the repo root and in `backend/`).

## Downloader — why a browser is needed

`meenakshigroup.com` and `prestigehyderabad.com` sit behind a bot filter that
answers **`406 Not Acceptable`** to a `python-requests/*` User-Agent. That is the
whole reason those two projects failed in the Python downloader — nothing is
wrong with the URLs:

```
User-Agent: python-requests/2.31.0   →  406
Chromium's own UA + Accept: image/*  →  200
```

`npm run download` reads `image-list.txt`, opens a Chromium context, loads the
project's landing page once (for cookies and a legitimate `Referer`), then pulls
each image with `context.request.fetch()`, sending:

- the context's **real Chromium User-Agent** (read from `navigator.userAgent`)
- `Accept: image/avif,image/webp,image/apng,image/*,*/*;q=0.8`
- `Referer` = the project landing page
- `sec-ch-ua`, `sec-ch-ua-mobile`, `sec-ch-ua-platform` derived from that UA, plus
  `sec-fetch-dest: image` — a filter cross-checking hints against the UA sees a
  coherent browser
- whatever cookies the landing page set (`context.request` shares the cookie jar)

Every download retries 3× with backoff, and one failure never stops the rest.
Responses are sniffed by **magic bytes** before being written, so an HTML error
page can never land on disk as a `.jpg`; a failed download leaves no zero-byte
stub. Files already present are skipped unless `FORCE_DOWNLOAD=1`.

## Verification

`npm run verify` checks four things per project and prints a PASS/FAIL table:

1. **Slot completeness** — Featured, Hero, Gallery, Floor Plans, Master Plan,
   Developer Logo. A missing slot is reported as `✕ repairable` when the file is
   on disk, or `○ not published by the source website` when it isn't.
2. **Media health** — every URL the property references returns 200 with an
   `image/*` content type.
3. **CMS pages** — each property's edit drawer is opened and its scroll
   container scrolled, then every preview thumbnail is checked for
   `naturalWidth > 0`.
4. **Public pages** — `/projects/<slug>` is loaded and scrolled end to end, then
   every `<img>` is checked for `naturalWidth > 0` and no image response ≥ 400.

The scroll matters in both: `next/image` and the drawer previews both lazy-load,
so without it every off-screen image reports `naturalWidth === 0` and looks
broken when it simply hasn't been requested yet. Note the drawer is the **last**
`<aside>` — the admin sidebar is the first and has its own `.overflow-y-auto`.

### The `Cross-Origin-Resource-Policy` trap

The backend runs `helmet()`, which sets `Cross-Origin-Resource-Policy:
same-origin` on everything it serves, `/uploads/**` included. An
`<img src="http://localhost:4000/uploads/x.jpg">` inside a page served from
:3000 gets a **200 that the browser then discards** — the element ends up
`complete === true` with `naturalWidth === 0`. There is no failed network
response to point at, so this looks like nothing at all is wrong.

The Media Library returns **absolute** URLs, so every image inserted through the
picker previewed blank in the admin. The public site was unaffected because
`src/lib/api/dto.ts` strips the backend origin before rendering.

`npm run repair:urls` rewrites stored media references to root-relative
`/uploads/...` paths, which Next serves same-origin via its `/uploads/:path*`
rewrite — the shape the seeded records already use. `migrate` runs this
automatically whenever a CMS page check fails.

`seo.ogImage` is deliberately excluded: it becomes an `og:image` meta tag rather
than an `<img>`, so CORP never applies, and the admin form validates it with a
strict absolute-URL check. Relativising it would only be undone on the next save.

A durable fix would be either `helmet({ crossOriginResourcePolicy: false })` for
the uploads route, or having `MediaLibrary` hand back relative URLs.

## How the admin actually works

Findings from inspecting the running app — these drive every locator choice.

| Concern | Finding |
| --- | --- |
| Form labels | `FieldShell` renders `<label>` with no `htmlFor`, and inputs have no `id`. **`getByLabel` does not work.** Fields are found by label text, then `xpath=..` to the wrapper. |
| Input names | `react-hook-form`'s `register` supplies `name` (`possession`, `seo.ogImage`, `floorPlans.2.area`), so registered inputs are addressable. |
| Media pickers | `MediaPickerField` / `MediaPickerListField` use `useController` and render **no input at all** — just a button plus a modal. |
| Single picker | Button reads "Select image" / "Change image". Clicking a card commits immediately and closes the modal. |
| Multi picker | Button reads "Add from media library". Cards toggle, then "Insert N" commits. Selection order is preserved, so clicking in file order sets slider order. The component de-duplicates on URL. |
| Upload | Hidden `input[type=file][multiple]` inside the modal → `POST /api/media/upload` (max 20 files, 15 MB each) → 201 → react-query invalidates → `GET /api/media` re-renders the grid. |
| Library search | `GET /api/media?search=` matches the **stored original file name**, case-insensitive, `createdAt desc`, 24 per page. |
| Modal | No `role="dialog"`. Located as the innermost element containing both the "Media Library" heading and the "Upload" button. |
| Property list | Client-side pagination, 8 rows/page. The search box filters title/location/city — **not slug** — so the runner pages through to match `/slug`. |
| Save | Drawer footer "Save" → `PATCH /api/properties/:id`. |
| Login | Rate limited to **10 attempts per 15 minutes**. |
| Storage | Files land on disk under `backend/uploads/YYYY/MM/`, served from the API origin. |

## Two things that will bite you

**1. Every seeded property failed the form's own validation.**

The drawer re-validates the whole record on submit, so Save silently never fired
for any of the 11 properties. Two separate causes:

- **`seo.ogImage` is a schema bug.** `src/lib/admin/schemas.ts` validates it with
  `optUrl()` (strict absolute URL), but the media picker and the seed both store
  root-relative `/uploads/...` paths. Every property with an OG image was blocked.
  Every other image field uses `mediaUrl()`, which accepts both. The fix is one line:

  ```diff
  -    ogImage: optUrl(),
  +    ogImage: emptyOptional(mediaUrl()),
  ```

  Until that lands, the runner rewrites the value to an absolute URL — lossless,
  and exactly what the picker itself writes.

- **Required text fields are genuinely empty** in the database: `possession` (10 of 11),
  `area` (8), plus `bedrooms`, `developer`, `reraNumber` and some floor-plan `area`
  values. The runner fills these with `PLACEHOLDER` (default `Not Specified`) so the
  media work can be saved, and logs every field it touched. Set `REPAIR=off` to
  disable this and have those properties reported as failures instead.

**2. Floor-plan rows need `type` and `area`.** Both are required by the schema, so a
new row is seeded with `Floor Plan <n>` and the placeholder. Re-runs match on the
`type` value and update that row in place rather than appending a duplicate.

## Behaviour

- **Idempotent.** Files upload as `<slug>__<filename>` (`one-by-msn__hero-1.jpg`),
  which is both unique across folders and searchable. A re-run finds and reuses the
  existing media row, and the list fields de-duplicate on URL. A second pass over a
  finished project takes ~7 s and changes nothing.
- **Hero and gallery append by default** so existing curation survives. `REPLACE_LISTS=1`
  clears the list first, making the saved order exactly the folder contents.
- **Retries.** Each slot retries `UPLOAD_RETRIES` times (default 3) with linear backoff.
- **Isolation.** A failing project is logged, the drawer is cancelled, and the run
  continues. Exit code is 1 if anything failed.
- **Session caching.** The session is written to `.auth-state.json` at the *end* of a
  run (the refresh cookie rotates during it) and reused next time, so repeat runs
  don't burn the login rate limit.

## Folder → slug

Folder names match slugs except for two, mapped in `src/config.ts`:

```
meenakshi-elan  →  elan-by-meenakshi
anvita-high9    →  high-9
```

Recognised file names, extension-agnostic (`.jpg .jpeg .png .webp .gif .avif .svg`):

```
featured  hero-<n>  gallery-<n>  master-plan  floor-plan-<n>  developer-logo
```

Anything else in the folder is logged and ignored.

## Environment

| Variable | Default |
| --- | --- |
| `ADMIN_URL` | `http://localhost:3000` |
| `API_URL` | `http://localhost:4000/api` |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` | `admin@renisinfra.com` / `ChangeMe123!` |
| `IMAGES_ROOT` | `~/Documents/RENIS-Images/RENIS-Images` |
| `IMAGE_LIST` | `~/Documents/RENIS-Images/image-list.txt` |
| `FORCE_DOWNLOAD` | off — set `1` to re-download files already on disk |
| `STORAGE_STATE` | `./.auth-state.json` |
| `HEADED` / `SLOW_MO` | headless, no slow-mo |
| `UPLOAD_RETRIES` | `3` |
| `REPLACE_LISTS` | off — set `1` to clear hero/gallery first |
| `DRY_RUN` | off — set `1` to skip saving |
| `REPAIR` | `on` — set `off` to fail instead of repairing |
| `PLACEHOLDER` | `Not Specified` |

## Layout

```
src/config.ts          env + folder→slug map
src/files.ts           folder scan, slot classification
src/imageList.ts       image-list.txt parser
src/download.ts        browser-context downloader (bypasses the 406 bot filter)
src/locators.ts        label/section/dialog locator helpers
src/mediaLibrary.ts    upload · search · single & multi select
src/propertyDrawer.ts  row lookup · field setters · repairs · save
src/session.ts         login + storage-state reuse
src/index.ts           upload runner, retries, summary
src/verify.ts          slot audit · media health · CMS + public page render checks
src/repairUrls.ts      normalises absolute media URLs to relative paths
src/sync.ts            download → upload
src/migrate.ts         download → upload → verify → repair → verify
```
