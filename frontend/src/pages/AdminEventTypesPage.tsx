import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination'
import { useAdminEventTypes, useCreateEventType, useUpdateEventType, useDeleteEventType } from '@/hooks/useApi'
import type { EventType } from '@/api/client'

const formSchema = z.object({
  title: z.string().min(1, 'Название обязательно'),
  description: z.string().min(1, 'Описание обязательно'),
  duration: z.coerce.number().min(5, 'Минимум 5 минут').max(480, 'Максимум 8 часов'),
})

type FormValues = z.infer<typeof formSchema>

const LIMIT = 10

export default function AdminEventTypesPage() {
  const [page, setPage] = useState(1)
  const { data, isLoading } = useAdminEventTypes(page, LIMIT)

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingEventType, setEditingEventType] = useState<EventType | null>(null)

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { title: '', description: '', duration: 30 },
  })

  const createEventType = useCreateEventType()
  const updateEventType = useUpdateEventType()
  const deleteEventType = useDeleteEventType()

  const openCreate = () => {
    setEditingEventType(null)
    form.reset({ title: '', description: '', duration: 30 })
    setDialogOpen(true)
  }

  const openEdit = (et: EventType) => {
    setEditingEventType(et)
    form.reset({ title: et.title, description: et.description, duration: et.duration })
    setDialogOpen(true)
  }

  const onSubmit = async (values: FormValues) => {
    if (editingEventType) {
      await updateEventType.mutateAsync({ id: editingEventType.id, body: values })
    } else {
      await createEventType.mutateAsync(values)
    }
    setDialogOpen(false)
  }

  const handleDelete = async (id: number) => {
    if (confirm('Удалить этот тип события?')) {
      await deleteEventType.mutateAsync(id)
    }
  }

  const totalPages = data ? Math.ceil(data.total / LIMIT) : 1

  if (isLoading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16 text-center text-muted-foreground">
        Загрузка...
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Типы событий</h1>
        <Button onClick={openCreate}>Добавить</Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-16">ID</TableHead>
            <TableHead>Название</TableHead>
            <TableHead className="hidden sm:table-cell">Описание</TableHead>
            <TableHead className="w-24">Длит.</TableHead>
            <TableHead className="w-32">Действия</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data?.data.map((et) => (
            <TableRow key={et.id}>
              <TableCell className="font-mono text-xs">{et.id}</TableCell>
              <TableCell className="font-medium">{et.title}</TableCell>
              <TableCell className="hidden max-w-xs truncate text-muted-foreground sm:table-cell">
                {et.description}
              </TableCell>
              <TableCell>{et.duration} мин</TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => openEdit(et)}>
                    Изменить
                  </Button>
                  <Button variant="destructive" size="sm" onClick={() => handleDelete(et.id)}>
                    Удалить
                  </Button>
                </div>
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

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingEventType ? 'Изменить' : 'Создать'} тип события</DialogTitle>
            <DialogDescription>
              Заполните поля для {editingEventType ? 'обновления' : 'создания'} типа события
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="title">Название *</Label>
                <Input id="title" {...form.register('title')} />
                {form.formState.errors.title && (
                  <p className="text-sm text-destructive">{form.formState.errors.title.message}</p>
                )}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Описание *</Label>
                <Textarea id="description" {...form.register('description')} />
                {form.formState.errors.description && (
                  <p className="text-sm text-destructive">{form.formState.errors.description.message}</p>
                )}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="duration">Длительность (мин) *</Label>
                <Input id="duration" type="number" {...form.register('duration')} />
                {form.formState.errors.duration && (
                  <p className="text-sm text-destructive">{form.formState.errors.duration.message}</p>
                )}
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Отмена
              </Button>
              <Button type="submit" disabled={createEventType.isPending || updateEventType.isPending}>
                {editingEventType ? 'Сохранить' : 'Создать'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
