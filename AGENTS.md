# PennyWise Development Guide

## Project Overview

- **Name**: PennyWise
- **Purpose**: Liquidity control system - know spendable money, never miss payments
- **Stack**: Next.js 14 (App Router), Tailwind, React Query, Neon PostgreSQL, Prisma, NextAuth
- **User**: Single user (email/password auth)

---

## Build Commands

```bash
# Install dependencies
npm install

# Setup database
npx prisma generate
npx prisma db push

# Run dev server
npm run dev
```

---

## Code Style

- Use TypeScript everywhere
- Prisma for DB operations
- React Query for data fetching
- Tailwind for styling
- **Decimal**: Use `Prisma.Decimal` or `number` for money (avoid floating point issues)
- **No manual balance updates**: Always create Transaction to change balance

---

## Key Files

| File | Purpose |
|------|---------|
| `/prisma/schema.prisma` | Database schema |
| `/src/lib/db.ts` | Prisma client singleton |
| `/src/lib/auth.ts` | NextAuth configuration |
| `/src/app/api/*` | API routes |

---

## Critical Rules

1. **Never update balances directly** - always via Transaction
2. **CREDIT accounts use negative balance** (red = debt)
3. **Liquidity = sum of all account balances**
4. **TRANSFER between accounts** for card payments (not manual update)

---

## Development Priority

1. **Week 1**: Setup + Auth + Account CRUD
2. **Week 2**: Transactions + Transfers
3. **Week 3**: Dashboard with liquidity calculation
4. **Week 4**: UX polish (not implemented yet)

---

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

**Test coverage**: 80% threshold on `/src/lib/utils.ts`

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET/POST | `/api/accounts` | List/Create accounts |
| DELETE | `/api/accounts/[id]` | Delete account |
| GET/POST | `/api/transactions` | List/Create transactions |
| POST | `/api/transfer` | Transfer between accounts |
| GET | `/api/dashboard` | Get liquidity summary |
| DELETE | `/api/cleanup` | Delete all data (reset) |

---

## Tech Stack Details

- **Frontend**: Next.js 16 (App Router), Tailwind CSS v4, React Query
- **Backend**: Next.js API Routes
- **Database**: Neon PostgreSQL with pg adapter
- **ORM**: Prisma 7
- **Auth**: NextAuth.js (credentials provider)
- **Testing**: Jest (unit), Playwright (E2E)
- **CI**: GitHub Actions
- **Deploy**: Vercel