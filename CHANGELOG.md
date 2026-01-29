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
