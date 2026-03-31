import { test, expect } from '@playwright/test'

test.describe('Transactions', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login')
    await page.fill('input[placeholder="Email"]', 'test@example.com')
    await page.fill('input[placeholder="Password"]', 'password123')
    await page.click('button:has-text("Sign In")')
    await page.waitForURL('/dashboard')
  })

  test('should add income transaction', async ({ page }) => {
    await page.click('text=Transactions')
    await page.click('text=New Transaction')
    
    await page.select('select >> nth=0', { index: 1 })
    await page.select('select >> nth=1', 'INCOME')
    await page.fill('input[placeholder="Amount"]', '500')
    await page.fill('input[placeholder="Description"]', 'Salary')
    await page.click('button:has-text("Save Transaction")')
    
    await expect(page.locator('text=Salary')).toBeVisible()
  })

  test('should add expense transaction', async ({ page }) => {
    await page.click('text=Transactions')
    await page.click('text=New Transaction')
    
    await page.select('select >> nth=0', { index: 1 })
    await page.select('select >> nth=1', 'EXPENSE')
    await page.fill('input[placeholder="Amount"]', '50')
    await page.fill('input[placeholder="Description"]', 'Groceries')
    await page.click('button:has-text("Save Transaction")')
    
    await expect(page.locator('text=Groceries')).toBeVisible()
  })

  test('should transfer between accounts', async ({ page }) => {
    await page.click('text=Accounts')
    await page.click('text=New Account')
    await page.fill('input[placeholder="Account Name"]', 'Credit Card')
    await page.selectOption('select', 'CREDIT')
    await page.fill('input[placeholder="Initial Balance"]', '-1000')
    await page.click('button:has-text("Create Account")')
    
    await page.click('text=Transactions')
    await page.click('text=Transfer')
    
    await page.select('select >> nth=0', { index: 1 })
    await page.select('select >> nth=1', { index: 2 })
    await page.fill('input[placeholder="Amount"]', '200')
    await page.fill('input[placeholder="Description (optional)"]', 'Payment')
    await page.click('button:has-text("Transfer")')
    
    await expect(page.locator('text=Payment')).toBeVisible()
  })
})