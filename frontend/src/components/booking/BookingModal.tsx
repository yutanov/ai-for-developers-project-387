import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const formSchema = z.object({
  guestName: z.string().min(1, 'Имя обязательно'),
  guestEmail: z.string().email('Некорректный email'),
})

type FormValues = z.infer<typeof formSchema>

interface BookingModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: (guestName: string, guestEmail: string) => void
  isPending: boolean
}

export function BookingModal({ open, onOpenChange, onConfirm, isPending }: BookingModalProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { guestName: '', guestEmail: '' },
  })

  const onSubmit = (values: FormValues) => {
    onConfirm(values.guestName, values.guestEmail)
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(open) => {
        if (!open) reset()
        onOpenChange(open)
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Запись на звонок</DialogTitle>
          <DialogDescription>
            Введите ваши данные для подтверждения бронирования
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="guestName">Имя *</Label>
              <Input id="guestName" placeholder="Ваше имя" {...register('guestName')} />
              {errors.guestName && (
                <p className="text-sm text-destructive">{errors.guestName.message}</p>
              )}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="guestEmail">Email *</Label>
              <Input id="guestEmail" type="email" placeholder="your@email.com" {...register('guestEmail')} />
              {errors.guestEmail && (
                <p className="text-sm text-destructive">{errors.guestEmail.message}</p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Отмена
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? 'Бронирование...' : 'Подтвердить'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
