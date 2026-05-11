# CalcGH — Ghana's Free Calculator Suite

**9+ free tools** for WAEC aggregate, GHS currency conversion, loan repayment, VAT, BMI, and more. Zero-cost build, deployed & tested in under 24 hours.

## Quick Start

```bash
npm install
npm run dev        # serve on localhost:3000
npm test           # run Playwright tests
npm run build      # build dist/ with env injection
```

## Project Structure

```
CalcGH/
├── index.html                  # single-page app (1898 lines)
├── tests/calculators.spec.js   # 35 Playwright tests
├── scripts/build.js            # env substitution build
├── .github/workflows/ci.yml    # CI/CD → GitHub Pages
└── package.json
```

## CI/CD Pipeline

| Stage | What |
|---|---|
| Test | 25+ Playwright tests (all 5 calculators + UI + responsive) |
| Build | Static HTML with `$FLUTTERWAVE_PUBLIC_KEY` and `$GA_ID` injection |
| Deploy | Auto-deploys to GitHub Pages on push to main |

## Tests

```bash
npm test              # headless CI run
npm run test:headed   # watch in browser
```

Test coverage:
- **WAEC**: aggregate sums, all 6 classification bands
- **FX**: GHS→foreign, foreign→GHS, rate note, zero edge case
- **Loan**: reducing balance, flat rate, effective rate
- **VAT**: all 4 categories, add/remove, line-item breakdown
- **BMI**: all 5 BMI classes, ideal weight range
- **UI**: modal, plan selector, nav, footer, responsive breakpoints

## Launch Checklist (24hr)

- [ ] Push to GitHub → CI runs tests automatically
- [ ] Set `FLUTTERWAVE_PUBLIC_KEY` in repo secrets
- [ ] Set `GA_MEASUREMENT_ID` in repo secrets
- [ ] Enable GitHub Pages → `gh-pages` branch
- [ ] Add custom domain in Pages settings
- [ ] Submit AdSense application
- [ ] Replace ad placeholders with real AdSense `<ins>` tags

## Zero-Cost Stack

| Layer | Service |
|---|---|
| Hosting | GitHub Pages (free) |
| CI/CD | GitHub Actions (2000 min/mo free) |
| Domain | yourname.github.io or freenom .tk (free) |
| Payments | Flutterwave (MTN MoMo, Vodafone Cash, AirtelTigo) |
| Testing | Playwright (free, OSS) |
