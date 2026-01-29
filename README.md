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
- **Observability**: Logs are shipped to Elasticsearch and visualized in Grafana (`http://localhost:3001`).

## 📚 Documentation

- **Component Library**: Run `npm run storybook` to view the UI component docs.
- **Security Policy**: See [SECURITY.md](SECURITY.md).

## 🧪 Testing

- **Unit Tests**: `npm run test`
- **E2E Tests**: `npx playwright test`
- **Security Stress Test**: `npx playwright test tests/security-stress.spec.ts`

---
*Developed with ❤️  for Dr. Manolova.*
