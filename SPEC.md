# PennyWise - Liquidity Control App

## Product Definition

**PennyWise is NOT an accounting app.** It's a liquidity control system focused on:
- Know how much you can spend today
- Never miss critical payments
- Visualize real money vs committed money

## MVP Scope

### Entities (Minimal)
- User (single user for now)
- Household (single household)
- Account
- Transaction

### Excluded (Future)
- Budgets
- Notifications
- RecurringItems (manual for now)

---

## Data Model

### Account
```
id: UUID
householdId: UUID
name: string
type: DEBIT | CREDIT | VOUCHER
balance: Decimal (negative for debt)
cutDay: int? (1-31)
payDay: int? (1-31)
createdAt: DateTime
updatedAt: DateTime
```

### Transaction
```
id: UUID
accountId: UUID
amount: Decimal
type: INCOME | EXPENSE | TRANSFER
date: DateTime
description: string
relatedAccountId: UUID? (for transfers)
createdAt: DateTime
```

---

## Core Logic

### Liquidity Calculation (Key Differentiator)
```
liquidity = DEBIT accounts + VOUCHER accounts + CREDIT accounts
```
Since CREDIT balance is negative (red), this naturally shows:
- Positive = you have money to spend
- Negative = you owe more than you have

### Transaction Types
- **INCOME**: Adds to account balance (positive amount)
- **EXPENSE**: Subtracts from account balance (positive amount, stored negative)
- **TRANSFER**: Move between accounts
  - Debit → Credit: payment reduces debt
  - Debit → Debit: move money
  - Voucher → Debit: spend prepaid

### Account Types
- **DEBIT**: Cash, bank accounts (positive balance = money you have)
- **CREDIT**: Credit cards (negative balance = debt owed)
- **VOUCHER**: Prepaid cards, gift cards (positive = money loaded)

---

## Tech Stack

- **Frontend**: Next.js 14+ (App Router), Tailwind CSS, React Query
- **Backend**: Next.js API Routes
- **Database**: Neon PostgreSQL
- **ORM**: Prisma
- **Auth**: NextAuth.js (credentials provider)

---

## API Endpoints (MVP)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/accounts | List all accounts |
| POST | /api/accounts | Create account |
| GET | /api/transactions | List transactions |
| POST | /api/transactions | Create transaction |
| POST | /api/transfer | Transfer between accounts |
| GET | /api/dashboard | Get liquidity summary |

---

## UI Structure

```
/app
  /dashboard      - Main liquidity view
  /accounts       - Account management
  /transactions   - Transaction history
  /login          - Auth page

/api
  /accounts
  /transactions
  /transfer
  /dashboard
  /auth/[...nextauth]
```

---

## UX Guidelines

1. **Quick Entry**: Any transaction in 2-3 clicks max
2. **Visual Debt**: Credit debt shown in red, negative
3. **Real Numbers**: Dashboard shows actual spendable, not just balance
4. **Validation**: Prevent spending if no liquidity
5. **Audit Trail**: Every change via transaction (no manual balance edits)

---

## Future (Post-MVP)

- RecurringItems (automated transactions)
- Notifications (payment due dates)
- Simple budgets
- CSV import from banks
- Multi-device sync
