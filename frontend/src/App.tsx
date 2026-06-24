import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Layout } from '@/components/layout/Layout'

const HomePage = lazy(() => import('@/pages/HomePage'))
const EventTypesPage = lazy(() => import('@/pages/EventTypesPage'))
const BookingPage = lazy(() => import('@/pages/BookingPage'))
const AdminEventTypesPage = lazy(() => import('@/pages/AdminEventTypesPage'))
const AdminBookingsPage = lazy(() => import('@/pages/AdminBookingsPage'))

function PageLoader() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center text-muted-foreground">
      Загрузка...
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route element={<Layout />}>
            <Route path="/book" element={<EventTypesPage />} />
            <Route path="/book/:eventTypeId" element={<BookingPage />} />
            <Route path="/admin/event-types" element={<AdminEventTypesPage />} />
            <Route path="/admin/bookings" element={<AdminBookingsPage />} />
          </Route>
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}
