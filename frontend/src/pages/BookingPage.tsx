import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { format, parseISO } from 'date-fns'
import { ru } from 'date-fns/locale'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Calendar } from '@/components/ui/calendar'
import { useEventTypes, useSlots, useCreateBooking } from '@/hooks/useApi'
import { BookingModal } from '@/components/booking/BookingModal'
import type { Slot } from '@/api/client'

export default function BookingPage() {
  const { eventTypeId } = useParams<{ eventTypeId: string }>()
  const navigate = useNavigate()
  const id = Number(eventTypeId)

  const { data: eventTypesData } = useEventTypes()
  const eventType = eventTypesData?.data.find((et) => et.id === id)

  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined)
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null)
  const [modalOpen, setModalOpen] = useState(false)

  const dateStr = selectedDate ? format(selectedDate, 'yyyy-MM-dd') : undefined
  const { data: slotsData, isLoading: slotsLoading } = useSlots(id, dateStr)

  const createBooking = useCreateBooking()

  const handleConfirmBooking = async (guestName: string, guestEmail: string) => {
    if (!selectedSlot) return
    await createBooking.mutateAsync({
      eventTypeId: id,
      guestName,
      guestEmail,
      startTime: selectedSlot.startTime,
    })
    setModalOpen(false)
    setSelectedSlot(null)
    navigate('/book')
  }

  if (!eventType) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-16 text-center text-muted-foreground">
        Загрузка...
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
        <div className="md:col-span-1">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12">
                  <AvatarImage src="https://api.dicebear.com/9.x/avataaars/svg?seed=Tota" />
                  <AvatarFallback>TH</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold">Tota</p>
                  <p className="text-sm text-muted-foreground">Host</p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <CardTitle className="mb-1">{eventType.title}</CardTitle>
              <CardDescription className="mb-4">{eventType.description}</CardDescription>
              <Badge variant="secondary">{eventType.duration} мин</Badge>

              {selectedDate && (
                <div className="mt-6">
                  <p className="text-sm font-medium">Дата</p>
                  <p className="text-sm text-muted-foreground">
                    {format(selectedDate, 'd MMMM yyyy', { locale: ru })}
                  </p>
                </div>
              )}

              {selectedSlot && (
                <div className="mt-2">
                  <p className="text-sm font-medium">Время</p>
                  <p className="text-sm text-muted-foreground">
                    {format(parseISO(selectedSlot.startTime), 'HH:mm')} —{' '}
                    {format(parseISO(selectedSlot.endTime), 'HH:mm')}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="min-w-[380px] md:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Календарь</CardTitle>
            </CardHeader>
            <CardContent>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => {
                  setSelectedDate(date)
                  setSelectedSlot(null)
                }}
                disabled={(date: Date) => {
                  const today = new Date()
                  today.setHours(0, 0, 0, 0)
                  const maxDate = new Date(today)
                  maxDate.setDate(maxDate.getDate() + 14)
                  return date < today || date > maxDate
                }}
                locale={ru}
                className="mx-auto"
              />
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Статус слотов</CardTitle>
            </CardHeader>
            <CardContent>
              {!selectedDate && (
                <p className="text-sm text-muted-foreground">Выберите дату</p>
              )}
              {selectedDate && slotsLoading && (
                <p className="text-sm text-muted-foreground">Загрузка...</p>
              )}
              {selectedDate && !slotsLoading && slotsData && slotsData.length === 0 && (
                <p className="text-sm text-muted-foreground">Нет доступных слотов</p>
              )}
              {selectedDate && slotsData && slotsData.length > 0 && (
                <div className="space-y-2">
                  {slotsData.map((slot) => (
                    <div
                      key={slot.startTime}
                      className={`flex cursor-pointer items-center justify-between rounded-md border p-3 text-sm transition-colors ${
                        selectedSlot?.startTime === slot.startTime
                          ? 'border-primary bg-primary/5'
                          : 'hover:bg-muted'
                      }`}
                      onClick={() => setSelectedSlot(slot)}
                    >
                      <span>
                        {format(parseISO(slot.startTime), 'HH:mm')} —{' '}
                        {format(parseISO(slot.endTime), 'HH:mm')}
                      </span>
                      <Badge variant="outline" className="text-xs">
                        Свободно
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="mt-6 flex justify-between">
        <Button variant="outline" onClick={() => navigate('/book')}>
          Назад
        </Button>
        <Button disabled={!selectedSlot} onClick={() => setModalOpen(true)}>
          Продолжить
        </Button>
      </div>

      <BookingModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        onConfirm={handleConfirmBooking}
        isPending={createBooking.isPending}
      />
    </div>
  )
}
