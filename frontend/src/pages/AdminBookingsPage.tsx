import { useState } from 'react'
import { format, parseISO } from 'date-fns'
import { ru } from 'date-fns/locale'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination'
import { useAdminBookings } from '@/hooks/useApi'

const LIMIT = 10

export default function AdminBookingsPage() {
  const [page, setPage] = useState(1)
  const { data, isLoading } = useAdminBookings(page, LIMIT)

  const totalPages = data ? Math.ceil(data.total / LIMIT) : 1

  if (isLoading) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-16 text-center text-muted-foreground">
        Загрузка...
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-semibold">Бронирования</h1>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-16">ID</TableHead>
            <TableHead>Гость</TableHead>
            <TableHead>Email</TableHead>
            <TableHead className="hidden md:table-cell">Тип события</TableHead>
            <TableHead>Начало</TableHead>
            <TableHead>Конец</TableHead>
            <TableHead>Статус</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data?.data.map((booking) => (
            <TableRow key={booking.id}>
              <TableCell className="font-mono text-xs">{booking.id}</TableCell>
              <TableCell className="font-medium">{booking.guestName}</TableCell>
              <TableCell className="text-muted-foreground">
                {booking.guestEmail}
              </TableCell>
              <TableCell className="hidden md:table-cell">{booking.eventTypeId}</TableCell>
              <TableCell className="text-sm">
                {format(parseISO(booking.startTime), 'd MMM HH:mm', { locale: ru })}
              </TableCell>
              <TableCell className="text-sm">
                {format(parseISO(booking.endTime), 'HH:mm')}
              </TableCell>
              <TableCell>
                <Badge variant={booking.status === 'confirmed' ? 'default' : 'secondary'}>
                  {booking.status === 'confirmed' ? 'Подтверждено' : 'Отменено'}
                </Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {totalPages > 1 && (
        <Pagination className="mt-6">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                href="#"
                onClick={(e) => { e.preventDefault(); setPage(Math.max(1, page - 1)) }}
              />
            </PaginationItem>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <PaginationItem key={p}>
                <PaginationLink
                  href="#"
                  isActive={p === page}
                  onClick={(e) => { e.preventDefault(); setPage(p) }}
                >
                  {p}
                </PaginationLink>
              </PaginationItem>
            ))}
            <PaginationItem>
              <PaginationNext
                href="#"
                onClick={(e) => { e.preventDefault(); setPage(Math.min(totalPages, page + 1)) }}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  )
}
