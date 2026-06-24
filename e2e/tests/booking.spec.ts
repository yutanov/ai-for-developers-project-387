import { test, expect, type Page, type CDPSession } from '@playwright/test'

const BACKEND_URL = 'http://localhost:3000'

function uid(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6)
}

async function setupEventType(request: import('@playwright/test').APIRequestContext) {
  const title = `E2E Call ${uid()}`
  const resp = await request.post(`${BACKEND_URL}/api/admin/event-types`, {
    data: { title, description: 'Quick consultation', duration: 30 },
  })
  expect(resp.ok()).toBeTruthy()
  return resp.json() as Promise<{ id: number; title: string; duration: number }>
}

function getTomorrowDateStr(): string {
  const d = new Date()
  d.setDate(d.getDate() + 1)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

async function selectDateInCalendar(page: Page) {
  const today = new Date()
  const tomorrow = new Date(today)
  tomorrow.setDate(today.getDate() + 1)

  if (tomorrow.getMonth() !== today.getMonth()) {
    await page.locator('[data-slot="calendar"] button:has(svg.lucide-chevron-right)').click()
    await page.waitForTimeout(300)
  }

  const dayNum = tomorrow.getDate()
  await page.locator('[data-slot="calendar"] button:not([aria-disabled="true"])')
    .filter({ hasText: new RegExp(`^${dayNum}$`) })
    .first()
    .click()
}

test.describe('Booking E2E', () => {

  test('full booking flow: create event type → book slot → verify in admin', async ({ page, request }) => {
    const eventType = await setupEventType(request)
    const guestName = `User_${uid()}`

    await page.goto('/book')
    await page.waitForLoadState('networkidle')

    await page.getByText(eventType.title).click()
    await page.waitForURL(`/book/${eventType.id}`)

    await page.waitForSelector('[data-slot="calendar"]')
    await selectDateInCalendar(page)
    await page.waitForTimeout(500)

    const slotItem = page.locator('text=Свободно').first()
    await expect(slotItem).toBeVisible({ timeout: 8000 })
    await slotItem.click()

    await page.getByRole('button', { name: 'Продолжить' }).click()

    await page.waitForSelector('#guestName', { timeout: 5000 })
    await page.fill('#guestName', guestName)
    await page.fill('#guestEmail', 'test@example.com')
    await page.getByRole('button', { name: 'Подтвердить' }).click()

    await page.waitForURL('/book')

    await page.goto('/admin/bookings')
    await page.waitForLoadState('networkidle')

    await expect(page.getByText(guestName)).toBeVisible()
  })

  test('double-booking via CDP returns 409 Conflict', async ({ page, request }) => {
    const eventType = await setupEventType(request)

    const dateStr = getTomorrowDateStr()
    const slotsResp = await request.get(
      `${BACKEND_URL}/api/event-types/${eventType.id}/slots?date=${dateStr}`
    )
    expect(slotsResp.ok()).toBeTruthy()
    const slots = await slotsResp.json() as Array<{ startTime: string }>
    expect(slots.length).toBeGreaterThan(0)
    const slotStartTime = slots[0].startTime

    await page.goto('/')
    const cdpSession: CDPSession = await page.context().newCDPSession(page)
    await cdpSession.send('Network.enable')

    type NetEntry = { url: string; method: string; status: number }
    const networkEntries = new Map<string, NetEntry>()
    cdpSession.on('Network.requestWillBeSent', (params: any) => {
      networkEntries.set(params.requestId, {
        url: params.request.url,
        method: params.request.method,
        status: 0,
      })
    })
    cdpSession.on('Network.responseReceived', (params: any) => {
      const entry = networkEntries.get(params.requestId)
      if (entry) {
        entry.status = params.response.status
      }
    })

    await page.evaluate(async (data) => {
      await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
    }, { eventTypeId: eventType.id, guestName: 'Alice', startTime: slotStartTime })

    await page.waitForTimeout(1000)

    await page.evaluate(async (data) => {
      await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
    }, { eventTypeId: eventType.id, guestName: 'Bob', startTime: slotStartTime })

    await page.waitForTimeout(1000)

    const postEntries = Array.from(networkEntries.values())
      .filter(e => e.method === 'POST' && e.url.includes('/api/bookings'))
    expect(postEntries.length).toBeGreaterThanOrEqual(2)

    const conflict = postEntries.find(e => e.status === 409)
    expect(conflict).toBeTruthy()
  })

  test('booking form validation: empty name shows error', async ({ page, request }) => {
    const eventType = await setupEventType(request)

    await page.goto('/book')
    await page.waitForLoadState('networkidle')
    await page.getByText(eventType.title).click()
    await page.waitForURL(/\/book\/\d+/)

    await page.waitForSelector('[data-slot="calendar"]')
    await selectDateInCalendar(page)
    await page.waitForTimeout(500)

    const slotItem = page.locator('text=Свободно').first()
    await expect(slotItem).toBeVisible({ timeout: 8000 })
    await slotItem.click()

    await page.getByRole('button', { name: 'Продолжить' }).click()

    await page.waitForSelector('#guestName', { timeout: 5000 })
    await page.fill('#guestName', '')

    await page.getByRole('button', { name: 'Подтвердить' }).click()

    await expect(page.getByText('Имя обязательно')).toBeVisible()
  })

})
