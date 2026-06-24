import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { CalendarDays, Clock, Users } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="flex flex-col">
      <header className="border-b">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4">
          <div className="flex items-center gap-2 text-xl font-semibold">
            <CalendarDays className="h-6 w-6" />
            Calendar
          </div>
          <nav className="flex gap-6">
            <Link
              to="/book"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
            >
              Записаться
            </Link>
            <Link
              to="/admin/event-types"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
            >
              Админка
            </Link>
          </nav>
        </div>
      </header>

      <section className="flex flex-1 flex-col items-center justify-center px-4 py-24 text-center">
        <h1 className="mb-2 text-5xl font-bold tracking-tight sm:text-6xl">
          Calendar
        </h1>
        <p className="mb-8 text-xl text-muted-foreground">
          Быстрая запись на звонок
        </p>
        <Link to="/book">
          <Button size="lg" className="text-base">
            Записаться
          </Button>
        </Link>
      </section>

      <section className="border-t">
        <div className="mx-auto grid max-w-5xl grid-cols-1 gap-8 px-4 py-16 sm:grid-cols-3">
          <div className="flex flex-col items-center text-center">
            <CalendarDays className="mb-4 h-10 w-10 text-primary" />
            <h3 className="mb-2 font-semibold">Выбор даты</h3>
            <p className="text-sm text-muted-foreground">
              Просматривайте свободные слоты в ближайшие 14 дней
            </p>
          </div>
          <div className="flex flex-col items-center text-center">
            <Clock className="mb-4 h-10 w-10 text-primary" />
            <h3 className="mb-2 font-semibold">Удобное время</h3>
            <p className="text-sm text-muted-foreground">
              Выбирайте подходящие 30-минутные интервалы
            </p>
          </div>
          <div className="flex flex-col items-center text-center">
            <Users className="mb-4 h-10 w-10 text-primary" />
            <h3 className="mb-2 font-semibold">Мгновенная запись</h3>
            <p className="text-sm text-muted-foreground">
              Заполните имя и email — бронь подтверждена
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}
