import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Layout } from '@/components/layout/Layout'
import HomePage from '@/pages/HomePage'
import EventTypesPage from '@/pages/EventTypesPage'
import BookingPage from '@/pages/BookingPage'
import AdminEventTypesPage from '@/pages/AdminEventTypesPage'
import AdminBookingsPage from '@/pages/AdminBookingsPage'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route element={<Layout />}>
          <Route path="/book" element={<EventTypesPage />} />
          <Route path="/book/:eventTypeId" element={<BookingPage />} />
          <Route path="/admin/event-types" element={<AdminEventTypesPage />} />
          <Route path="/admin/bookings" element={<AdminBookingsPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
