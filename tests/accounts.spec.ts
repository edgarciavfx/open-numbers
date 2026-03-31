import { test, expect } from '@playwright/test'

test.describe('Accounts', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login')
    await page.fill('input[placeholder="Email"]', 'test@example.com')
    await page.fill('input[placeholder="Password"]', 'password123')
    await page.click('button:has-text("Sign In")')
    await page.waitForURL('/dashboard')
  })

  test('should create a new debit account', async ({ page }) => {
    await page.click('text=Accounts')
    await page.click('text=New Account')
    await page.fill('input[placeholder="Account Name"]', 'Test Bank')
    await page.selectOption('select', 'DEBIT')
    await page.fill('input[placeholder="Initial Balance"]', '1000')
    await page.click('button:has-text("Create Account")')
    
    await expect(page.locator('text=Test Bank')).toBeVisible()
    await expect(page.locator('text=$1,000.00')).toBeVisible()
  })

  test('should create a credit account (debt)', async ({ page }) => {
    await page.click('text=Accounts')
    await page.click('text=New Account')
    await page.fill('input[placeholder="Account Name"]', 'Test Credit Card')
    await page.selectOption('select', 'CREDIT')
    await page.fill('input[placeholder="Initial Balance"]', '-500')
    await page.click('button:has-text("Create Account")')
    
    await expect(page.locator('text=Test Credit Card')).toBeVisible()
    await expect(page.locator('text=-$500.00')).toBeVisible()
  })

  test('should delete an account', async ({ page }) => {
    await page.click('text=Accounts')
    await page.click('text=New Account')
    await page.fill('input[placeholder="Account Name"]', 'Delete Me')
    await page.selectOption('select', 'DEBIT')
    await page.fill('input[placeholder="Initial Balance"]', '100')
    await page.click('button:has-text("Create Account")')
    
    await expect(page.locator('text=Delete Me')).toBeVisible()
    await page.click('text=Delete')
    await expect(page.locator('text=Delete Me')).not.toBeVisible()
  })
})