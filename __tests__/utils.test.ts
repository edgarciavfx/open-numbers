import { calculateLiquidity, getAccountTypeLabel, formatCurrency, isNegativeLiquidity } from '@/lib/utils'

describe('calculateLiquidity', () => {
  it('should calculate liquidity with only debit accounts', () => {
    const accounts = [
      { id: '1', name: 'Bank', type: 'DEBIT' as const, balance: 5000 }
    ]
    const result = calculateLiquidity(accounts)
    expect(result.liquidity).toBe(5000)
    expect(result.debitTotal).toBe(5000)
    expect(result.creditTotal).toBe(0)
    expect(result.voucherTotal).toBe(0)
  })

  it('should calculate liquidity with negative credit balance (debt)', () => {
    const accounts = [
      { id: '1', name: 'Bank', type: 'DEBIT' as const, balance: 5000 },
      { id: '2', name: 'TDC', type: 'CREDIT' as const, balance: -2000 }
    ]
    const result = calculateLiquidity(accounts)
    expect(result.liquidity).toBe(3000) // 5000 - 2000
    expect(result.debitTotal).toBe(5000)
    expect(result.creditTotal).toBe(-2000)
  })

  it('should calculate liquidity with vouchers', () => {
    const accounts = [
      { id: '1', name: 'Bank', type: 'DEBIT' as const, balance: 5000 },
      { id: '2', name: 'Gift Card', type: 'VOUCHER' as const, balance: 500 }
    ]
    const result = calculateLiquidity(accounts)
    expect(result.liquidity).toBe(5500)
    expect(result.voucherTotal).toBe(500)
  })

  it('should return negative liquidity when debt exceeds assets', () => {
    const accounts = [
      { id: '1', name: 'Bank', type: 'DEBIT' as const, balance: 1000 },
      { id: '2', name: 'TDC', type: 'CREDIT' as const, balance: -5000 }
    ]
    const result = calculateLiquidity(accounts)
    expect(result.liquidity).toBe(-4000)
  })

  it('should return zero for empty accounts', () => {
    const result = calculateLiquidity([])
    expect(result.liquidity).toBe(0)
    expect(result.debitTotal).toBe(0)
    expect(result.creditTotal).toBe(0)
    expect(result.voucherTotal).toBe(0)
  })

  it('should handle multiple accounts of each type', () => {
    const accounts = [
      { id: '1', name: 'Bank 1', type: 'DEBIT' as const, balance: 3000 },
      { id: '2', name: 'Bank 2', type: 'DEBIT' as const, balance: 2000 },
      { id: '3', name: 'TDC 1', type: 'CREDIT' as const, balance: -1500 },
      { id: '4', name: 'TDC 2', type: 'CREDIT' as const, balance: -500 },
      { id: '5', name: 'Gift Card', type: 'VOUCHER' as const, balance: 100 }
    ]
    const result = calculateLiquidity(accounts)
    expect(result.debitTotal).toBe(5000)
    expect(result.creditTotal).toBe(-2000)
    expect(result.voucherTotal).toBe(100)
    expect(result.liquidity).toBe(3100)
  })
})

describe('getAccountTypeLabel', () => {
  it('should return correct label for DEBIT', () => {
    expect(getAccountTypeLabel('DEBIT')).toBe('Cash (Debit)')
  })

  it('should return correct label for CREDIT', () => {
    expect(getAccountTypeLabel('CREDIT')).toBe('Credit Card')
  })

  it('should return correct label for VOUCHER', () => {
    expect(getAccountTypeLabel('VOUCHER')).toBe('Voucher (Prepaid)')
  })
})

describe('formatCurrency', () => {
  it('should format positive amount', () => {
    expect(formatCurrency(1234.56)).toBe('$1,234.56')
  })

  it('should format negative amount', () => {
    expect(formatCurrency(-500)).toBe('-$500.00')
  })

  it('should format zero', () => {
    expect(formatCurrency(0)).toBe('$0.00')
  })
})

describe('isNegativeLiquidity', () => {
  it('should return true for negative liquidity', () => {
    expect(isNegativeLiquidity(-100)).toBe(true)
  })

  it('should return false for positive liquidity', () => {
    expect(isNegativeLiquidity(100)).toBe(false)
  })

  it('should return false for zero', () => {
    expect(isNegativeLiquidity(0)).toBe(false)
  })
})