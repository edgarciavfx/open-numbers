import { test, expect } from '@playwright/test'

test.describe('Auth', () => {
  test('should register a new user', async ({ page }) => {
    const timestamp = Date.now()
    const email = `test${timestamp}@example.com`
    const password = 'testpassword123'

    await page.goto('/login')
    await page.click('text=Register')
    await page.fill('input[placeholder="Name"]', 'Test User')
    await page.fill('input[placeholder="Email"]', email)
    await page.fill('input[placeholder="Password"]', password)
    await page.click('button:has-text("Register")')
    await page.waitForURL('/dashboard')
  })

  test('should login with existing user', async ({ page }) => {
    await page.goto('/login')
    await page.fill('input[placeholder="Email"]', 'test@example.com')
    await page.fill('input[placeholder="Password"]', 'password123')
    await page.click('button:has-text("Sign In")')
    await page.waitForURL('/dashboard')
  })

  test('should logout', async ({ page }) => {
    await page.goto('/login')
    await page.fill('input[placeholder="Email"]', 'test@example.com')
    await page.fill('input[placeholder="Password"]', 'password123')
    await page.click('button:has-text("Sign In")')
    await page.waitForURL('/dashboard')
    await page.click('text=Sign Out')
    await page.waitForURL('/')
  })
})