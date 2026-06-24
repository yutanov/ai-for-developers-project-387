import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api, type CreateEventTypeRequest, type UpdateEventTypeRequest, type CreateBookingRequest } from '@/api/client'

export function useEventTypes(page = 1, limit = 20) {
  return useQuery({
    queryKey: ['event-types', page, limit],
    queryFn: () => api.getEventTypes(page, limit),
  })
}

export function useSlots(eventTypeId: number, date?: string) {
  return useQuery({
    queryKey: ['slots', eventTypeId, date],
    queryFn: () => api.getSlots(eventTypeId, date),
    enabled: !!eventTypeId,
  })
}

export function useCreateBooking() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (body: CreateBookingRequest) => api.createBooking(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['slots'] })
    },
  })
}

export function useAdminEventTypes(page = 1, limit = 20) {
  return useQuery({
    queryKey: ['admin-event-types', page, limit],
    queryFn: () => api.getAdminEventTypes(page, limit),
  })
}

export function useCreateEventType() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (body: CreateEventTypeRequest) => api.createEventType(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-event-types'] })
    },
  })
}

export function useUpdateEventType() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, body }: { id: number; body: UpdateEventTypeRequest }) =>
      api.updateEventType(id, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-event-types'] })
    },
  })
}

export function useDeleteEventType() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => api.deleteEventType(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-event-types'] })
    },
  })
}

export function useAdminBookings(page = 1, limit = 20) {
  return useQuery({
    queryKey: ['admin-bookings', page, limit],
    queryFn: () => api.getAdminBookings(page, limit),
  })
}
