import { expect, test } from '@playwright/test'
import type { Page } from '@playwright/test'

const pressWord = async (page: Page, word: string) => {
  const letters = word.split('')
  for (const letter of letters) {
    await page.keyboard.press(letter)
  }
}

test.describe('Error Book - word records saved correctly after switching dict', () => {
  test.beforeEach(async ({ page }) => {
    test.slow()
    // Clear IndexedDB to start fresh
    await page.goto('/')
    await page.evaluate(() => {
      return new Promise<void>((resolve) => {
        const req = indexedDB.deleteDatabase('RecordDB')
        req.onsuccess = () => resolve()
        req.onerror = () => resolve()
        req.onblocked = () => resolve()
      })
    })
    await page.reload()
    await page.getByLabel('关闭提示').click()
  })

  test('Error words are saved to error book after switching dictionary', async ({ page }) => {
    // Step 1: Start typing on default dict (CET-4, chapter 1)
    // First word is "cancel"
    await page.keyboard.press('Enter')
    await page.waitForTimeout(300)

    // Type "cancel" WRONG (type "cancax" - wrong last letter)
    await pressWord(page, 'canca')
    await page.waitForTimeout(400)
    // The word resets after error, retype correctly
    await pressWord(page, 'cancel')
    await page.waitForTimeout(300)

    // Now type the second word "explosive" correctly
    await pressWord(page, 'explosive')
    await page.waitForTimeout(300)

    // Step 2: Switch to a different dictionary via gallery
    await page.getByText('CET-4').click()
    await page.waitForURL('**/gallery')
    await page.waitForTimeout(500)

    // Click on CET-6 dict (or any other dict)
    await page
      .getByRole('button', { name: /六级真题核心词/g })
      .first()
      .click()
    await page.waitForTimeout(300)
    // Select chapter 1
    await page.getByRole('heading', { name: '第 1 章' }).click()
    await page.waitForURL('**/')
    await page.waitForTimeout(500)

    // Step 3: Type a word wrong in the new dict
    await page.keyboard.press('Enter')
    await page.waitForTimeout(300)

    // Get the current word text to know what to type wrong
    const firstLetterEl = page.locator('[class*="font-mono"] span').first()
    await expect(firstLetterEl).toBeVisible()

    // Type a wrong letter then correct the word
    await page.keyboard.press('z')
    await page.waitForTimeout(400)

    // Step 4: Navigate to error book and verify records exist
    await page.goto('/error-book')
    await page.waitForTimeout(1000)

    // The word "cancel" from CET-4 should be in the error book
    await expect(page.locator('li').filter({ hasText: 'cancel' })).toBeVisible()
    // Verify it shows the correct dict name
    await expect(page.locator('li').filter({ hasText: 'cancel' }).locator('text=CET-4')).toBeVisible()
  })

  test('Error words from new dict are saved with correct dict id', async ({ page }) => {
    // Step 1: Switch to a specific dict first
    await page.getByText('CET-4').click()
    await page.waitForURL('**/gallery')
    await page.waitForTimeout(500)

    // Select CET-6 真题核心词
    await page
      .getByRole('button', { name: /六级真题核心词/g })
      .first()
      .click()
    await page.waitForTimeout(300)
    await page.getByRole('heading', { name: '第 1 章' }).click()
    await page.waitForURL('**/')
    await page.waitForTimeout(500)

    // Step 2: Start typing and make a mistake
    await page.keyboard.press('Enter')
    await page.waitForTimeout(300)

    // Get the displayed word
    const wordDisplay = page.locator('[class*="font-mono"]').first()
    const wordText = await wordDisplay.textContent()

    if (wordText && wordText.length > 0) {
      // Type wrong letter first
      await page.keyboard.press('z')
      await page.waitForTimeout(400)
      // Then type the correct word
      await pressWord(page, wordText.trim())
      await page.waitForTimeout(300)
    }

    // Step 3: Check error book
    await page.goto('/error-book')
    await page.waitForTimeout(1000)

    // Should have at least one error record
    const errorRows = page.locator('li').filter({ has: page.locator('text=六级真题核心词') })
    await expect(errorRows.first()).toBeVisible()
  })
})
