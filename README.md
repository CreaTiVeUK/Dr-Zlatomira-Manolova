# Zlati Pediatrics - Dr. Zlatomira Manolova

A modern, full-stack appointment booking and management platform for Dr. Zlatomira Manolova's pediatric practice.

## 🚀 Built With

- **Framework**: [Next.js 16 (App Router)](https://nextjs.org)
- **Database**: [Prisma](https://www.prisma.io) with PostgreSQL
- **Authentication**: [Auth.js v5 (NextAuth)](https://authjs.dev) & Custom Legacy Login
- **Styling**: Vanilla CSS with modern rich aesthetics
- **Testing**: [Playwright](https://playwright.dev) (E2E) & [Vitest](https://vitest.dev) (Unit)

## ✨ Key Features

- **Online Booking**: Seamless patient-facing booking flow with real-time availability.
- **Appointment Management**: Patients can view, download (iCal), and cancel their appointments.
- **Admin Dashboard**: Comprehensive management of appointments and logs.
- **Internationalization**: Full support for English and Bulgarian.
- **Security**: Hardened login flows with rate limiting, audit logging, and security policy.

## 🛠️ Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database

### Installation

1.  **Clone the repository**:
    ```bash
    git clone https://github.com/CreaTiVeUK/Dr-Zlatomira-Manolova.git
    cd Dr-Zlatomira-Manolova
    ```

2.  **Install dependencies**:
    ```bash
    npm install
    ```

3.  **Environment Setup**:
    Create a `.env` file based on `.env.example` and provide your database and Auth secrets.

4.  **Database Initialisation**:
    ```bash
    npx prisma db push
    npm run build # Generates Prisma client
    npx prisma db seed # Creates demo admin and patient
    ```

5.  **Run Development Server**:
    ```bash
    npm run dev
    ```

## 🧪 Testing

The project includes a robust CI/CD suite verified in GitHub Actions.

- **Unit Tests**: `npm run test`
- **E2E Tests**: `npx playwright test`

## 🛡️ Security

For vulnerability reporting, see our [Security Policy](SECURITY.md).

## 📄 Deployment

Deployable to [Vercel](https://vercel.com) or any Next.js compatible hosting provider.
```bash
npm run build
npm run start
```

