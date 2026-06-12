## [1.1.4](https://github.com/CreaTiVeUK/Dr-Zlatomira-Manolova/compare/v1.1.3...v1.1.4) (2026-06-12)


### Bug Fixes

* **proxy:** break the /login self-redirect loop on invalidated sessions (prod 503) ([f0b2f41](https://github.com/CreaTiVeUK/Dr-Zlatomira-Manolova/commit/f0b2f41a6387cf156e5dd1d7da0b4a5f4695da6b))

## [1.1.3](https://github.com/CreaTiVeUK/Dr-Zlatomira-Manolova/compare/v1.1.2...v1.1.3) (2026-06-12)


### Bug Fixes

* **header:** account links move into an avatar dropdown — nav no longer overflows when logged in ([d043947](https://github.com/CreaTiVeUK/Dr-Zlatomira-Manolova/commit/d0439471ca4c095b537e911bce031aeaad24e790))

## [1.1.2](https://github.com/CreaTiVeUK/Dr-Zlatomira-Manolova/compare/v1.1.1...v1.1.2) (2026-06-11)


### Bug Fixes

* **ci:** env.ts non-enforcing path must never throw; build-step AUTH_SECRET ([ed7140a](https://github.com/CreaTiVeUK/Dr-Zlatomira-Manolova/commit/ed7140aa3b008feb11827f153e3365a455e57676))

## [1.1.1](https://github.com/CreaTiVeUK/Dr-Zlatomira-Manolova/compare/v1.1.0...v1.1.1) (2026-06-11)


### Bug Fixes

* **deps:** npm audit fix — Next.js 16.1.6 -> 16.2.9 (middleware bypass CVEs) ([5e0985d](https://github.com/CreaTiVeUK/Dr-Zlatomira-Manolova/commit/5e0985d03fba6f05c0d7076ac46477bcfe884e9e)), closes [hi#severity](https://github.com/hi/issues/severity)

# [1.1.0](https://github.com/CreaTiVeUK/Dr-Zlatomira-Manolova/compare/v1.0.0...v1.1.0) (2026-04-15)


### Bug Fixes

* correct address zip code to 4000 based on google maps details ([93f2a45](https://github.com/CreaTiVeUK/Dr-Zlatomira-Manolova/commit/93f2a45d4042023ab33aa6baba4c81ba4427e183))
* proofread and correct copy in BG and EN dictionaries ([3a525ea](https://github.com/CreaTiVeUK/Dr-Zlatomira-Manolova/commit/3a525ea4960604360ac9c73189c724044f48047f))
* rename remaining medical center entry in BG dictionary ([88d0a0f](https://github.com/CreaTiVeUK/Dr-Zlatomira-Manolova/commit/88d0a0f5529cbb80ca3aab447285f82d4b1f4b43))
* resolve double scrollbar and mobile hero scroll trapping ([96fddab](https://github.com/CreaTiVeUK/Dr-Zlatomira-Manolova/commit/96fddaba50fc8933779c3ce15cef1bac5cb1f9fc))
* resolve next-auth type errors for build ([7eddb48](https://github.com/CreaTiVeUK/Dr-Zlatomira-Manolova/commit/7eddb48a2cb0d3ef48e78a7e6ab2417cf6bf8015))
* revert google map pointer to original coordinates 42.136959,24.790681 ([4f5e0ef](https://github.com/CreaTiVeUK/Dr-Zlatomira-Manolova/commit/4f5e0efe8f5f1ca54ef84f21654b210bc27e3d87))
* **ui:** ensure phone input dropdown visibility and styling ([eda7ab0](https://github.com/CreaTiVeUK/Dr-Zlatomira-Manolova/commit/eda7ab08bfb2e1d7b1bc396c94f8e3cba2be416c))


### Features

* add phone number input with country code support ([a49b379](https://github.com/CreaTiVeUK/Dr-Zlatomira-Manolova/commit/a49b3798ba4444c6b4d08f6cdf481155931b43b1))
* auto-translate new Superdoc reviews via DeepL API ([0f405ff](https://github.com/CreaTiVeUK/Dr-Zlatomira-Manolova/commit/0f405ff068aafd486867530c071bdd9bcb9f453d))
* complete legal compliance (privacy, terms, cookies) and update configs ([0316dfe](https://github.com/CreaTiVeUK/Dr-Zlatomira-Manolova/commit/0316dfe00c28ac174193ffb0e31267805c888fb2))
* implement audio session recording and AI summarization in admin dashboard ([738360d](https://github.com/CreaTiVeUK/Dr-Zlatomira-Manolova/commit/738360de6880e7fb5591ba25d60b2571e9ea196c))
* implement auth session inactivity middleware and dedicated unit test setup ([39f099f](https://github.com/CreaTiVeUK/Dr-Zlatomira-Manolova/commit/39f099f56ce0e1dde88f28e7df8ffd36892a3481))
* implement dashboard interactivity, dark mode, and new avatar ([5286146](https://github.com/CreaTiVeUK/Dr-Zlatomira-Manolova/commit/528614649cddf242e5a61a1988252be75f5bc94e))
* implement profile enhancements and document management ([103821d](https://github.com/CreaTiVeUK/Dr-Zlatomira-Manolova/commit/103821d8f2ed9d951c580d881e560fef89e3f7e1))
* implement real email sending for contact form using Resend ([4430e4f](https://github.com/CreaTiVeUK/Dr-Zlatomira-Manolova/commit/4430e4f0002865c6d9a2cfc6ed4fd8a8a7e7e81a))
* implement user profile and sync content ([6d3e5c4](https://github.com/CreaTiVeUK/Dr-Zlatomira-Manolova/commit/6d3e5c498ddc8b243dec856db7f2901c8b14a762))
* integrate patient sessions into admin sidebar and dashboard ([dc29088](https://github.com/CreaTiVeUK/Dr-Zlatomira-Manolova/commit/dc29088cb8a6c71fcdc05de2bc71ca88ababd6db))
* refine admin dashboard and enhance sessions log with filtering and feedback ([d9648da](https://github.com/CreaTiVeUK/Dr-Zlatomira-Manolova/commit/d9648da5b4c2fcd494c68ef1d28d6bdf16656253))
* unify admin auth and enhance dashboard deep-linking ([d8a4150](https://github.com/CreaTiVeUK/Dr-Zlatomira-Manolova/commit/d8a415021ba918a27647176cf9dfc3b35025e75e))
* update location to Plovdiv, add google map, and sanitize content ([ab87117](https://github.com/CreaTiVeUK/Dr-Zlatomira-Manolova/commit/ab87117660eee9681e3a4dae81d62b1e9415255f))

# 1.0.0 (2026-01-29)


### Bug Fixes

* add database setup to CI workflow to resolve E2E test failures ([a447fab](https://github.com/CreaTiVeUK/Dr-Zlatomira-Manolova/commit/a447fab67632d17d5fb2bbe85c9f1060c9b9cb19))
* **auth:** add explicit redirect callback to enforce booking page navigation ([a12e382](https://github.com/CreaTiVeUK/Dr-Zlatomira-Manolova/commit/a12e38285a2f1d924f58b74c579d1d946195d864))
* **auth:** switch to JWT strategy for better session stability on Safari ([aaf24d3](https://github.com/CreaTiVeUK/Dr-Zlatomira-Manolova/commit/aaf24d32a1ebed8b5caadacface586eeaa0a9a1c))
* **book:** restore missing state and constants to fix build ([e609458](https://github.com/CreaTiVeUK/Dr-Zlatomira-Manolova/commit/e609458ce541f6276cb70a67a37ab4aab1e3256d))
* ensure prisma generate runs before db push/seed in CI ([8598c71](https://github.com/CreaTiVeUK/Dr-Zlatomira-Manolova/commit/8598c719f364db3108ed95ffad66568db879e429))
* **i18n:** add missing dictionary keys for logic changes ([8999e42](https://github.com/CreaTiVeUK/Dr-Zlatomira-Manolova/commit/8999e42d8c9e4732a02c815038fe03036bc59717))
* resolve unit test failures and verify mobile booking redirect ([8417ceb](https://github.com/CreaTiVeUK/Dr-Zlatomira-Manolova/commit/8417cebbb11b9ea6defb38e3bc0a50cec06a3448))
* **ui:** resolve mobile hero scroll trap and add comprehensive tests ([fb672c8](https://github.com/CreaTiVeUK/Dr-Zlatomira-Manolova/commit/fb672c831759b2895b28ea27a367e9a05edf5c84))
* **ux:** replace auto-redirect with explicit login prompt to prevent loop ([bd87300](https://github.com/CreaTiVeUK/Dr-Zlatomira-Manolova/commit/bd873000491ac6e53e33f51666f6e8c013374445))


### Features

* add CodeQL security scanning workflow ([0460e24](https://github.com/CreaTiVeUK/Dr-Zlatomira-Manolova/commit/0460e24a0a8a7b34daa84440bc421356628104c5))
* add continuous deployment workflow for GHCR ([5547a8f](https://github.com/CreaTiVeUK/Dr-Zlatomira-Manolova/commit/5547a8fc1ad55c29ed7e21aac70734d8a19a59ba))
* add observability (elasticsearch + grafana) to docker stack ([09bf0db](https://github.com/CreaTiVeUK/Dr-Zlatomira-Manolova/commit/09bf0db10ec28e24fd1f2468c1ded42f28b6bba0))
* complete social login, mobile polish, and booking redirects ([9026909](https://github.com/CreaTiVeUK/Dr-Zlatomira-Manolova/commit/90269095c61386e362b951e8d9e18f907d899579))
* dockerize application ([93a0d68](https://github.com/CreaTiVeUK/Dr-Zlatomira-Manolova/commit/93a0d6837e35d1cb87205b6386a3ed6a0b38e01b))
* implement automated database backups ([cfd76fa](https://github.com/CreaTiVeUK/Dr-Zlatomira-Manolova/commit/cfd76fafa9034d53ff2494a62986b2249046b52e))
* implement semantic release automation ([d673821](https://github.com/CreaTiVeUK/Dr-Zlatomira-Manolova/commit/d6738218b4ca986fdd1b56bce4b34f798adb574e))
* implement SessionProvider and client-side page protection ([234a3ee](https://github.com/CreaTiVeUK/Dr-Zlatomira-Manolova/commit/234a3ee0d2036545471ee3a599739ad095a96960))
* implement storybook for automated documentation ([32b8a6e](https://github.com/CreaTiVeUK/Dr-Zlatomira-Manolova/commit/32b8a6e50fb7336ced406a3ba840b45b3929c2ac))
