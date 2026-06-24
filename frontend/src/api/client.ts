import type { components } from './types'

const BASE_URL = '/api'

async function request<T>(
  url: string,
  options?: RequestInit & { params?: Record<string, string | number | undefined> }
): Promise<T> {
  const { params, ...init } = options || {}
  let fullUrl = `${BASE_URL}${url}`
  if (params) {
    const searchParams = new URLSearchParams()
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined) {
        searchParams.set(key, String(value))
      }
    }
    const qs = searchParams.toString()
    if (qs) fullUrl += `?${qs}`
  }
  const res = await fetch(fullUrl, {
    headers: { 'Content-Type': 'application/json', ...init.headers },
    ...init,
  })
  if (res.status === 204) return undefined as T
  const data = await res.json()
  if (!res.ok) {
    throw data
  }
  return data
}

export type EventType = components['schemas']['EventType']
export type Booking = components['schemas']['Booking']
export type Slot = components['schemas']['Slot']
export type CreateEventTypeRequest = components['schemas']['CreateEventTypeRequest']
export type UpdateEventTypeRequest = components['schemas']['UpdateEventTypeRequest']
export type CreateBookingRequest = components['schemas']['CreateBookingRequest']
export type PaginatedResponse<T> = { data: T[]; total: number; page: number; limit: number }

export const api = {
  getEventTypes(page = 1, limit = 20) {
    return request<PaginatedResponse<EventType>>('/event-types', { params: { page, limit } })
  },

  getSlots(eventTypeId: number, date?: string) {
    return request<Slot[]>(`/event-types/${eventTypeId}/slots`, { params: { date } })
  },

  createBooking(body: CreateBookingRequest) {
    return request<Booking>('/bookings', {
      method: 'POST',
      body: JSON.stringify(body),
    })
  },

  getAdminEventTypes(page = 1, limit = 20) {
    return request<PaginatedResponse<EventType>>('/admin/event-types', { params: { page, limit } })
  },

  createEventType(body: CreateEventTypeRequest) {
    return request<EventType>('/admin/event-types', {
      method: 'POST',
      body: JSON.stringify(body),
    })
  },

  updateEventType(id: number, body: UpdateEventTypeRequest) {
    return request<EventType>(`/admin/event-types/${id}`, {
      method: 'PUT',
      body: JSON.stringify(body),
    })
  },

  deleteEventType(id: number) {
    return request<void>(`/admin/event-types/${id}`, { method: 'DELETE' })
  },

  getAdminBookings(page = 1, limit = 20) {
    return request<PaginatedResponse<Booking>>('/admin/bookings', { params: { page, limit } })
  },
}
