# PennyWise

Liquidity control system - know how much you can spend today, never miss payments.

## What is PennyWise?

PennyWise is **not** an accounting app. It's a liquidity control system focused on:
- Know exactly how much you can spend today
- Never miss critical payment dates
- Visualize real money vs committed money

## Features

- **Dashboard** - See your liquidity at a glance (cash + vouchers - debt)
- **Quick Entry** - Add transactions in 2-3 clicks
- **Account Types** - Debit (cash), Credit (debt), Vouchers (prepaid)
- **Transfers** - Move money between accounts (pay credit cards properly)
- **Reset** - Clear all data to start fresh

## Tech Stack

- **Frontend**: Next.js 14 (App Router), React, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: Neon PostgreSQL
- **ORM**: Prisma
- **Auth**: NextAuth.js (credentials)
- **Testing**: Jest (unit), Playwright (E2E)
- **CI/CD**: GitHub Actions
- **Deploy**: Vercel

## Getting Started

### Prerequisites

- Node.js 20+
- PostgreSQL (Neon) database

### Setup

```bash
# Install dependencies
npm install

# Generate Prisma client
npx prisma generate

# Push schema to database
npx prisma db push

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Environment Variables

Create `.env` file:

```env
DATABASE_URL="postgresql://..."
NEXTAUTH_SECRET="your-secret"
NEXTAUTH_URL="http://localhost:3000"
```

## Testing

```bash
# Run unit tests
npm test

# Run unit tests with coverage
npm run test:coverage

# Run E2E tests
npm run e2e

# Run E2E tests with UI
npm run e2e:ui
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET/POST | `/api/accounts` | List/Create accounts |
| DELETE | `/api/accounts/[id]` | Delete account |
| GET/POST | `/api/transactions` | List/Create transactions |
| POST | `/api/transfer` | Transfer between accounts |
| GET | `/api/dashboard` | Get liquidity summary |
| DELETE | `/api/cleanup` | Delete all data |

## Project Structure

```
├── src/
│   ├── app/              # Next.js App Router pages
│   │   ├── api/          # API routes
│   │   ├── dashboard/    # Dashboard page
│   │   ├── accounts/     # Accounts page
│   │   └── transactions/ # Transactions page
│   ├── lib/              # Utilities
│   │   ├── db.ts         # Prisma client
│   │   ├── auth.ts       # NextAuth config
│   │   └── utils.ts      # Helper functions
│   └── components/       # React components
├── prisma/
│   └── schema.prisma     # Database schema
├── tests/                # E2E tests (Playwright)
├── __tests__/            # Unit tests (Jest)
└── .github/workflows/   # CI/CD
```

## License

MIT License - see [LICENSE](LICENSE) file.