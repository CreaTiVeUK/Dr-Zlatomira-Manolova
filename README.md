# Zlati Pediatrics - Dr. Zlatomira Manolova

A modern, enterprise-grade appointment booking and management platform for Dr. Zlatomira Manolova's pediatric practice.

## 🚀 Built With

- **Framework**: [Next.js 16 (App Router)](https://nextjs.org) with React 19
- **Database**: [Prisma](https://www.prisma.io) with PostgreSQL
- **Authentication**: [Auth.js v5 (NextAuth)](https://authjs.dev) + Custom Credentials
- **Styling**: Vanilla CSS for bespoke, high-performance design
- **Observability**: Elasticsearch & Grafana (COP Stack)
- **Documentation**: Storybook + Automated GitHub Pages

## ✨ Key Features

### User Experience
- **Smart Booking**: Real-time availability with date-range filtering and secure slot locking.
- **Bilingual Interface**: Full i18n support for English and Bulgarian.
- **My Appointments**: Patients can track history, see upcoming visits, and download iCal files.

### Admin & Security
- **Dynamic Dashboard**: Complete overview of practice metrics and daily schedule.
- **Role-Based Access**: Strict separation between `PATIENT` and `ADMIN` roles.
- **Security Hardening**:
    - IP-based Rate Limiting (20 req/min)
    - Automated CodeQL Security Scanning
    - Audit Logging for all sensitive actions

## 🛠️ Getting Started

### Prerequisites
- Node.js 18+
- Docker & Docker Compose (optional, for full stack)

### ⚡ Quick Start (Docker)
The easiest way to run the entire stack (App + DB + Observability + Backups):
```bash
docker-compose up -d
```
Access the application at `http://localhost:3000`.

### 💻 Local Development
1.  **Clone**:
    ```bash
    git clone https://github.com/CreaTiVeUK/Dr-Zlatomira-Manolova.git
    cd Dr-Zlatomira-Manolova
    ```

2.  **Install**:
    ```bash
    npm install
    ```

3.  **Setup Environment**:
    Copy `.env.example` to `.env` and configure your database credentials.
    If you want AI summaries to run through Vercel AI Gateway, set `VERCEL_AI_GATEWAY_API_KEY` and optionally override `VERCEL_AI_GATEWAY_MODEL`. Audio transcription in the current implementation still requires `OPENAI_API_KEY`.

4.  **Database**:
    ```bash
    npx prisma db push
    npx prisma db seed
    ```

5.  **Run**:
    ```bash
    npm run dev
    ```

## 🔄 DevOps & CI/CD

This project features a fully automated DevOps pipeline using GitHub Actions:

### 1. Continuous Integration (CI)
- **Testing**: Vitest (Unit) and Playwright (E2E) run on every push.
- **Linting**: ESLint and formatting checks.
- **Docs**: Storybook build verification.

### 2. Continuous Deployment (CD)
- **Container Registry**: Successfully built images are pushed to [GHCR](https://github.com/features/packages).
- **Automated Release**: Semantic Release automatically versions the project (v1.0.0 -> v1.0.1) and generates a CHANGELOG based on commit messages.

### 3. Reliability
- **Automated Backups**: A sidecar container dumps the PostgreSQL database daily to `./backups`.

## 📚 Documentation

- **Component Library**: Run `npm run storybook` to view the UI component docs.
- **Security Policy**: See [SECURITY.md](SECURITY.md).

## 🧪 Testing

| Layer | Command | What it covers |
| --- | --- | --- |
| Unit (Vitest, jsdom/node) | `npm run test` | Pure logic: auth callbacks (lockout, TOTP, OAuth-linking guard, inactivity), booking overlap math & clinic hours, encryption round-trips & tamper detection, storage round-trips, rate limiting, sanitisation, session revocation fallback |
| E2E (Playwright) | `npm run test:e2e` | Real browser against the app + Postgres: auth flows, booking, profile, messaging, password reset |
| Security regressions | `npx playwright test tests/security.spec.ts tests/security-stress.spec.ts` | Logout-cookie replay, role escalation, upload content sniffing + encrypted round-trip, cancel→rebook, double-booking race, price tampering, enumeration probes |
| Registration funnel (CI only) | runs in CI as part of E2E | register → unverified login blocked → verify (token from DB) → login. The flow that locks out all new patients if email/verification breaks |

In CI the E2E suite runs against a **production build** (`next build` + `next start`)
with a disposable Postgres — so prod-only failures (CSP, env validation,
standalone output) surface before deploy. Local `npm run test:e2e` reuses your
dev server.

The dev/CI seed (`prisma db seed`) refuses to run against non-local database
hosts: it resets known accounts to a shared password. Set `ALLOW_SEED=1` only
for disposable databases.

---
*Developed with ❤️  for Dr. Manolova.*
