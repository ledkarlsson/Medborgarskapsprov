# Medborgarskapsprov

An installable, bilingual citizenship-test practice app. 100 curated questions, ten sets of ten and randomized mixed quizzes. Immediate feedback includes verbatim Swedish excerpts (PDF layout whitespace collapsed), English translations and page links. Results provide scores and expandable answer reviews. These are practice questions, not official examination questions or an official passing threshold.

## Run

Requires Node.js 22 or later. No npm dependencies or API keys.

```sh
npm test
npm run dev
```

Open http://127.0.0.1:4173. `npm run build` creates `dist/`; `node scripts/serve.mjs --dist` previews the build.

## Source and editing

Source: `documents/sverige-i-fokus.pdf`, UHR and Skolverket, first edition 2026, corrected 2026-08-10. All 13 chapters are represented. Questions reflect this supplied edition, rather than claiming to track changes in law. English translations are learning aids, not official translations.

The authored bank is `data/questions.txt`. Each line contains page, Swedish quote, English translation, Swedish question, English question, and three bilingual answers. The first answer is correct; presentation order is randomized. Edit the bank, then run `python scripts/compile.py` with `pypdf` installed. Compilation requires exactly 100 entries and checks every quote against its cited PDF page, normalizing only whitespace. PDF line-end hyphens are retained where present. The generated `data/questions.json` is committed for dependency-free builds.

## PWA and privacy

The service worker caches app assets and the complete question bank after the first successful visit. Allow that visit to finish before going offline. Use the browser's Install/Add to Home Screen option; supported browsers also display an install button. On iOS use Safari → Share → Add to Home Screen. Service workers require HTTPS or localhost.

The 11 MB PDF is optional offline content: select **Save PDF for offline use** on the home page while online. Cached PDFs support byte-range requests. Browsers can evict offline storage. Progress and language are saved only in localStorage on this device; no accounts, analytics, cookies or external translation services. Clearing site data clears progress and offline files. When storage is unavailable quizzes still work during the visit.

For releases that change cached assets, increment `CACHE` in `sw.js`. A new version waits until old app tabs close, avoiding changes during an active quiz.

## GitHub Pages

The workflow `.github/workflows/pages.yml` tests, builds and deploys `dist/` on pushes to `main`. In GitHub repository Settings → Pages, set the source to **GitHub Actions** if not enabled. The workflow attempts initial enablement; repository settings may require an administrator to enable Pages first. Relative paths, manifest scope and service-worker URLs support the `/Medborgarskapsprov/` project path.

Expected site URL after successful deployment: https://ledkarlsson.github.io/Medborgarskapsprov/
