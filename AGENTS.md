# Divyam Shree — marketing site

Single-page React + Vite site for the Divyam Shree tea / coffee / masala brand
(Indore, est. 1980s). Three product listings, each linking out to Amazon.in.

## Commands

```bash
npm install        # install dependencies
npm run dev        # dev server on http://localhost:5173
npm run lint       # oxlint — must be clean
npm test           # vitest run — 37 tests, must all pass
npm run build      # production build into dist/
npm run verify     # lint + test + build, in that order. Run this before every commit.
npm run deploy     # build + sync dist/ to the S3 bucket (the real site deploy)
npm run deploy:dry # same, but --dry-run: reports changes without writing
npm run push       # verify, then push the current branch to origin
npm run update-prices   # scrape live Amazon prices (see below)
```

`npm run verify` is the gate. Do not push, commit a release, or report a change
as done until it exits 0.

## Layout

```
src/App.jsx            route-less shell; lazy-loads the below-fold sections
src/HeroScrollStory.jsx  62-frame scroll-driven hero (largest component)
src/HeritageStory.jsx  brand story section
src/Products.jsx       product grid + category tabs; ALL prices live here
src/FAQ.jsx            SEO FAQ accordion
src/Footer.jsx         footer
src/Navbar.jsx         nav
src/use3DPress.js      shared 3D hover/tilt hook
scripts/fetch_amazon_prices.mjs  price scraper -> rewrites src/Products.jsx + index.html
scripts/lib/amazon_parse.mjs     pure parsing helpers used by the scraper (unit-tested)
tests/                 vitest suite
public/images/         product photography, one source + .webp + .avif per product
public/frames/         62 hero scroll frames
```

## Testing conventions

- Vitest + jsdom + @testing-library/react. Tests live in `tests/`, named `*.test.js(x|mjs)`.
- `tests/setup.js` stubs `matchMedia`, `IntersectionObserver`, `ResizeObserver`,
  `requestAnimationFrame`, canvas `getContext`, and pins
  `getBoundingClientRect` to a 300x400 box at the origin. Any tilt/scroll maths in
  a test depends on that fixed box — do not change it without updating the tests.
- Prefer asserting on user-visible behaviour (`getByRole`, `getByText`) over
  implementation details.
- The scraper's regexes are covered in `tests/amazon_parse.test.mjs` with saved
  markup fixtures. When Amazon changes its page shape, add the new markup as a
  fixture there; do not loosen an existing fixture to make a broken regex pass.

## Deployment

Two independent targets. `npm run deploy` is the real site deploy; `npm run push`
is version control.

### S3 (`npm run deploy`)

`scripts/deploy_s3.mjs` builds and syncs `dist/` to the bucket. Run it with
`--dry-run` (`npm run deploy:dry`) to see what would change without writing.

End state: the bucket contains exactly what `dist/` contains, with stale objects
pruned. It uses `s3 sync --delete`, NOT `s3 rm --recursive` + upload — same final
state, but no window where the site is empty, and no half-uploaded site left
behind if a step fails.

Three passes, because `s3 sync` cannot vary `Cache-Control` by pattern and skips
unchanged files (so a later pass would never re-tag them):

1. everything except `assets/` and `index.html` → `max-age=86400`, `--delete` prunes
2. `assets/` → `max-age=31536000, immutable`, `--delete` prunes stale bundles
3. `index.html` → `no-cache, must-revalidate`, written last

Order matters. Vite's `assets/` filenames are content-hashed so they can be cached
forever, but `index.html` must be revalidated on every visit — otherwise a
returning browser keeps a cached `index.html` referencing hashed chunks that pass 2
has already deleted, and the site renders blank.

Config, in a gitignored `.env.deploy` at the repo root:

```
S3_BUCKET=your-bucket
AWS_REGION=ap-south-1
# optional
CLOUDFRONT_DISTRIBUTION_ID=EXXXXXXXXXXXXX
S3_PREFIX=some/prefix
```

Credentials are NEVER stored in this repo. Put them in `~/.aws/credentials`
(or the standard env vars). The script verifies them with
`sts get-caller-identity` before touching the bucket, so a bad key fails fast.

The script resolves the `aws` binary by absolute path (see `resolveAwsCli`) rather
than trusting `PATH`, because the Telegram gateway runs it unattended from a
launchd service whose PATH does not include shell-profile directories. Override
with `AWS_CLI_PATH` if needed.

The deploy reports the branch and commit it built from, and warns if the working
tree is dirty — the build reflects the working tree, not the last commit. Several
agents edit this repo concurrently, so an uncommitted or mid-edit tree can ship
silently. Pass `--require-clean` to make a dirty tree a hard failure instead.

Do not upload to the bucket by hand — that is how the bucket and `dist/` drift
apart. If a deploy half-failed, re-run `npm run deploy`.

### GitHub (`npm run push`)

`npm run verify` then push the current branch. `.github/workflows/ci.yml` re-runs
lint/test/build on every push to `main` and uploads `dist/` as a build artifact.

`dist/` is gitignored and rebuilt by CI, never committed. Never force-push `main`.
Never commit `node_modules/`, `dist/`, or `.env.deploy`.

## Gotchas

- Product prices are duplicated in two places: the `products` array in
  `src/Products.jsx` and the JSON-LD `offers` block in `index.html`. The scraper
  updates both; if you edit a price by hand, change both or SEO data will drift.
- `src/Products.jsx` price strings are `'₹349'` with no space. The scraper's
  regexes require that exact shape.
- New product images need all three formats (`.jpg`, `.webp`, `.avif`) plus a
  matching entry in the `<picture>` sources, or the build still succeeds but the
  page silently falls back.
- The Amazon scraper is best-effort: Amazon rate-limits and serves captchas. A
  captcha page yields `null` prices, and the script then skips that product
  instead of writing bad data. Treat `null` as "retry later", not "price is zero".
