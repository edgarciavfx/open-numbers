import { test, expect } from '@playwright/test'

test.describe('Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login')
    await page.fill('input[placeholder="Email"]', 'test@example.com')
    await page.fill('input[placeholder="Password"]', 'password123')
    await page.click('button:has-text("Sign In")')
    await page.waitForURL('/dashboard')
  })

  test('should display liquidity summary', async ({ page }) => {
    await expect(page.locator('text=Liquidity')).toBeVisible()
    await expect(page.locator('text=Cash (Debit)')).toBeVisible()
    await expect(page.locator('text=Vouchers')).toBeVisible()
    await expect(page.locator('text=Debt (Credit)')).toBeVisible()
  })

  test('should add transaction via quick entry', async ({ page }) => {
    await page.click('text=+ Quick Entry')
    await page.select('select >> nth=0', { index: 1 })
    await page.select('select >> nth=1', 'INCOME')
    await page.fill('input[placeholder="0.00"]', '100')
    await page.fill('input[placeholder="Description"]', 'Quick Income')
    await page.click('button:has-text("Save")')
    
    await expect(page.locator('text=Quick Income')).toBeVisible()
  })

  test('should show accounts list', async ({ page }) => {
    await expect(page.locator('text=Accounts')).toBeVisible()
    await expect(page.locator('text=Recent')).toBeVisible()
  })

  test('should show negative liquidity warning', async ({ page }) => {
    await page.click('text=Accounts')
    await page.click('text=New Account')
    await page.fill('input[placeholder="Account Name"]', 'Credit Card')
    await page.selectOption('select', 'CREDIT')
    await page.fill('input[placeholder="Initial Balance"]', '-10000')
    await page.click('button:has-text("Create Account")')
    
    await page.reload()
    await page.click('text=Dashboard')
    
    await expect(page.locator('text=Liquidity')).toBeVisible()
    const liquidity = page.locator('text=Liquidity').locator('..').locator('p >> nth=1')
    await expect(liquidity).toHaveClass(/text-red-400/)
  })

  test('should reset all data', async ({ page }) => {
    await page.click('text=Reset')
    
    const dialog = page.locator('text=Delete all transactions and accounts?')
    await expect(dialog).toBeVisible()
    
    await page.on('dialog', dialog => dialog.accept())
    await page.click('text=Reset')
    
    await expect(page.locator('text=No accounts.')).toBeVisible()
  })
})