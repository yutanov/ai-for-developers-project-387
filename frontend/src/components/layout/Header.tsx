import { Link, useLocation } from 'react-router-dom'
import { CalendarDays } from 'lucide-react'

const navLinks = [
  { to: '/book', label: 'Записаться' },
  { to: '/admin/event-types', label: 'Типы событий' },
  { to: '/admin/bookings', label: 'Бронирования' },
]

export function Header() {
  const location = useLocation()
  const isHome = location.pathname === '/'

  return (
    <header className="border-b">
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2 text-xl font-semibold">
          <CalendarDays className="h-6 w-6" />
          Calendar
        </Link>
        {!isHome && (
          <nav className="flex gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  location.pathname.startsWith(link.to)
                    ? 'text-primary'
                    : 'text-muted-foreground'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        )}
      </div>
    </header>
  )
}
