export interface Account {
  id: string
  name: string
  type: 'DEBIT' | 'CREDIT' | 'VOUCHER'
  balance: number
}

export interface DashboardData {
  debitTotal: number
  creditTotal: number
  voucherTotal: number
  liquidity: number
  accounts: Account[]
}

export function calculateLiquidity(accounts: Account[]): DashboardData {
  const debitTotal = accounts
    .filter(a => a.type === 'DEBIT')
    .reduce((sum, a) => sum + a.balance, 0)

  const creditTotal = accounts
    .filter(a => a.type === 'CREDIT')
    .reduce((sum, a) => sum + a.balance, 0)

  const voucherTotal = accounts
    .filter(a => a.type === 'VOUCHER')
    .reduce((sum, a) => sum + a.balance, 0)

  const liquidity = debitTotal + voucherTotal + creditTotal

  return {
    debitTotal,
    creditTotal,
    voucherTotal,
    liquidity,
    accounts
  }
}

export function getAccountTypeLabel(type: 'DEBIT' | 'CREDIT' | 'VOUCHER'): string {
  const labels = {
    DEBIT: 'Cash (Debit)',
    CREDIT: 'Credit Card',
    VOUCHER: 'Voucher (Prepaid)'
  }
  return labels[type]
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount)
}

export function isNegativeLiquidity(liquidity: number): boolean {
  return liquidity < 0
}