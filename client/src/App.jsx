import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom"
import { useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"

import Navbar from "./components/Navbar"
import Footer from "./components/Footer"
import BottomNavbar from "./components/MobileBottomNav"
import CartDrawer from "./components/CartDrawer"
import ProtectedRoute from "./components/ProtectedRoute"

import Home from "./pages/Home"
import Menu from "./pages/Menu"
import Cart from "./pages/Cart"
import Checkout from "./pages/Checkout"
import Login from "./pages/Login"
import Register from "./pages/Register"
import Payment from "./pages/Payment"
import OrderSuccess from "./pages/OrderSuccess"
import OrderHistory from "./pages/OrderHistory"
import Profile from "./pages/Profile"
import Tracking from "./pages/Tracking"
import BookTable from "./components/BookTable"

import AdminLogin from "./admin/AdminLogin"
import AdminDashboard from "./admin/AdminDashboard"
import AdminMenu from "./admin/AdminMenu"

/* ── Page transition variants ── */
const pageVariants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
}
const pageTransition = { duration: 0.25, ease: "easeInOut" }

function PageWrap({ children }) {
  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={pageTransition}
    >
      {children}
    </motion.div>
  )
}

/* ── Scroll to top on every route change ── */
function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" })
  }, [pathname])
  return null
}

/* ── Animated Routes ── */
function AnimatedRoutes() {
  const location = useLocation()
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {/* Customer Routes */}
        <Route path="/" element={<PageWrap><Home /></PageWrap>} />
        <Route path="/menu" element={<PageWrap><Menu /></PageWrap>} />
        <Route path="/cart" element={<PageWrap><Cart /></PageWrap>} />
        <Route path="/checkout" element={<PageWrap><Checkout /></PageWrap>} />
        <Route path="/login" element={<PageWrap><Login /></PageWrap>} />
        <Route path="/register" element={<PageWrap><Register /></PageWrap>} />
        <Route path="/payment" element={<PageWrap><Payment /></PageWrap>} />
        <Route path="/success" element={<PageWrap><OrderSuccess /></PageWrap>} />
        <Route path="/orders" element={<PageWrap><OrderHistory /></PageWrap>} />
        <Route path="/profile" element={<PageWrap><Profile /></PageWrap>} />
        <Route path="/tracking" element={<PageWrap><Tracking /></PageWrap>} />
        <Route path="/book-table" element={<PageWrap><BookTable /></PageWrap>} />

        {/* Admin Routes */}
        <Route path="/admin-login" element={<PageWrap><AdminLogin /></PageWrap>} />
        <Route path="/admin" element={
          <ProtectedRoute>
            <PageWrap><AdminDashboard /></PageWrap>
          </ProtectedRoute>
        } />
        <Route path="/admin-menu" element={
          <ProtectedRoute>
            <PageWrap><AdminMenu /></PageWrap>
          </ProtectedRoute>
        } />
      </Routes>
    </AnimatePresence>
  )
}

function AppLayout() {
  const location = useLocation()

  // Hide customer navbar/footer on admin pages
  const isAdminPage = location.pathname.startsWith("/admin")
  const isHomePage = location.pathname === "/"

  return (
    <>
      {/* Scroll to top on navigation */}
      <ScrollToTop />

      {/* Top Navbar - only on customer pages */}
      {!isAdminPage && <Navbar />}

      {/* Page Content — no top padding on homepage (hero goes behind navbar) */}
      <div className={isAdminPage ? "min-h-screen" : isHomePage ? "min-h-screen" : "pt-14 sm:pt-20 min-h-screen"}>
        <AnimatedRoutes />
      </div>

      {/* Footer & Mobile Nav - only on customer pages */}
      {!isAdminPage && <Footer />}
      {!isAdminPage && <BottomNavbar />}

      {/* Cart Drawer - only on customer pages */}
      {!isAdminPage && <CartDrawer />}
    </>
  )
}

export default function App() {
  return (
    <Router>
      <AppLayout />
    </Router>
  )
}
