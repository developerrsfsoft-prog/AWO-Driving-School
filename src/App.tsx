import { Helmet } from 'react-helmet-async'
import { Outlet, Route, Routes } from 'react-router-dom'
import Footer from './components/layout/Footer'
import Header from './components/layout/Header'
import AdminBookings from './pages/admin/AdminBookings'
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminEnquiries from './pages/admin/AdminEnquiries'
import AdminSmtp from './pages/admin/AdminSmtp'
import AdminGallery from './pages/admin/AdminGallery'
import AdminLayout from './pages/admin/AdminLayout'
import BookingPage from './pages/BookingPage'
import ContactPage from './pages/ContactPage'
import ForgotPassword from './pages/ForgotPassword'
import GalleryPage from './pages/GalleryPage'
import ResetPassword from './pages/ResetPassword'
import GenericPage from './pages/GenericPage'
import HomePage from './pages/HomePage'
import NotFoundPage from './pages/NotFoundPage'

function PublicLayout() {
  return (
    <div className="min-h-screen bg-[#f4efe6] text-[#1c1915]">
      <Header />
      <main>
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}

function App() {
  return (
    <>
      <Helmet>
        <title>AWO Driving School | Learn to drive with calm confidence</title>
        <meta
          name="description"
          content="Patient, supportive driving lessons for beginners, nervous learners and confident test preparation in the UK."
        />
        <meta name="theme-color" content="#020617" />
      </Helmet>

      <Routes>
        <Route path="/admin/forgot-password" element={<ForgotPassword />} />
        <Route path="/admin/reset-password" element={<ResetPassword />} />
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="gallery" element={<AdminGallery />} />
          <Route path="enquiries" element={<AdminEnquiries />} />
          <Route path="bookings" element={<AdminBookings />} />
          <Route path="smtp" element={<AdminSmtp />} />
        </Route>

        <Route element={<PublicLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/book" element={<BookingPage />} />
          <Route path="/booking" element={<BookingPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/gallery" element={<GalleryPage />} />
          <Route path="/about" element={<GenericPage slug="about" />} />
          <Route path="/driving-lessons" element={<GenericPage slug="driving-lessons" />} />
          <Route path="/courses" element={<GenericPage slug="driving-lessons" />} />
          <Route path="/courses/beginner-driving-lessons" element={<GenericPage slug="beginner-driving-lessons" />} />
          <Route path="/courses/pay-as-you-go" element={<GenericPage slug="pay-as-you-go" />} />
          <Route path="/courses/intensive-courses" element={<GenericPage slug="intensive-courses" />} />
          <Route path="/courses/fast-track-courses" element={<GenericPage slug="fast-track-courses" />} />
          <Route path="/courses/refresher-lessons" element={<GenericPage slug="refresher-lessons" />} />
          <Route path="/courses/test-preparation" element={<GenericPage slug="test-preparation" />} />
          <Route path="/courses/practical-test-preparation" element={<GenericPage slug="test-preparation" />} />
          <Route path="/beginner-driving-lessons" element={<GenericPage slug="beginner-driving-lessons" />} />
          <Route path="/pay-as-you-go" element={<GenericPage slug="pay-as-you-go" />} />
          <Route path="/intensive-courses" element={<GenericPage slug="intensive-courses" />} />
          <Route path="/fast-track-courses" element={<GenericPage slug="fast-track-courses" />} />
          <Route path="/refresher-lessons" element={<GenericPage slug="refresher-lessons" />} />
          <Route path="/test-preparation" element={<GenericPage slug="test-preparation" />} />
          <Route path="/practical-test-preparation" element={<GenericPage slug="test-preparation" />} />
          <Route path="/areas-we-cover" element={<GenericPage slug="areas-we-cover" />} />
          <Route path="/faqs" element={<GenericPage slug="faqs" />} />
          <Route path="/privacy-policy" element={<GenericPage slug="privacy-policy" />} />
          <Route path="/cookie-policy" element={<GenericPage slug="cookie-policy" />} />
          <Route path="/terms-and-conditions" element={<GenericPage slug="terms-and-conditions" />} />
          <Route path="/404" element={<NotFoundPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </>
  )
}

export default App
