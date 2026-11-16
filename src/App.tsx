import { Helmet } from 'react-helmet-async'
import { Route, Routes } from 'react-router-dom'
import Footer from './components/layout/Footer'
import Header from './components/layout/Header'
import AdminPage from './pages/AdminPage'
import BookingPage from './pages/BookingPage'
import ContactPage from './pages/ContactPage'
import GenericPage from './pages/GenericPage'
import HomePage from './pages/HomePage'
import NotFoundPage from './pages/NotFoundPage'

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

      <div className="min-h-screen bg-slate-950 text-slate-100">
        <Header />
        <main>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/book" element={<BookingPage />} />
            <Route path="/booking" element={<BookingPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/admin" element={<AdminPage />} />
            <Route path="/about" element={<GenericPage slug="about" />} />
            <Route path="/driving-lessons" element={<GenericPage slug="driving-lessons" />} />
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
          </Routes>
        </main>
        <Footer />
      </div>
    </>
  )
}

export default App
