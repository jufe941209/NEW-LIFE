import { Routes, Route } from 'react-router-dom'
import { useEffect } from 'react'
import { AuthProvider } from './context/AuthContext'
import { Layout } from './components/organisms'
import ProtectedAdminRoute from './components/ProtectedAdminRoute'
import { CartProvider } from './context/CartContext'
import ProtectedResponsableRoute from './components/ProtectedResponsableRoute'
import ProtectedDomiciliarioRoute from './components/ProtectedDomiciliarioRoute'
import { ResponsableLogin, ResponsableDashboard } from './pages/Responsable'
import { DomiciliarioLogin, DomiciliarioDashboard } from './pages/Domiciliario'
import ScrollToTop from './components/ScrollToTop'
import ConnectionStatus from './components/ConnectionStatus'
import { startKeepAlive, stopKeepAlive } from './services/api'

// Pages - from new subfolder structure
import Home from './pages/Home'
import AboutUs from './pages/AboutUs'
import Shop from './pages/Shop'
import ShopDetail from './pages/ShopDetail'
import Cart from './pages/Cart'
import Checkout from './pages/Checkout'
import Contact from './pages/Contact'
import Testimonial from './pages/Testimonial'
import Login from './pages/Login'
import Register from './pages/Register'
import NotFound from './pages/NotFound'
import Admin from './pages/Admin'
import MiPerfil from './pages/MiPerfil'
import MisCompras from './pages/MisCompras'
import CambiarPassword from './pages/CambiarPassword'
import ForgotPassword from './pages/ForgotPassword/ForgotPassword'
import TermsAndConditions from './pages/TermsAndConditions/TermsAndConditions'

/**
 * PublicLayout - Envuelve rutas públicas con Navbar y Footer
 */
const PublicLayout = ({ children }) => {
  return (
    <Layout>
      {children}
    </Layout>
  )
}

function App() {
  useEffect(() => {
    startKeepAlive()
    return () => stopKeepAlive()
  }, [])

  return (
    <AuthProvider>
      <CartProvider>
      <ConnectionStatus />
      <ScrollToTop />
      <Routes>
        {/* Admin route - SIN el Layout público (no Navbar/Footer) */}
        <Route
          path="/admin/*"
          element={
            <ProtectedAdminRoute>
              <Admin />
            </ProtectedAdminRoute>
          }
        />

        {/* Responsable routes - SIN Layout público */}
        <Route path="/login-responsable" element={<ResponsableLogin />} />
        <Route
          path="/responsable"
          element={
            <ProtectedResponsableRoute>
              <ResponsableDashboard />
            </ProtectedResponsableRoute>
          }
        />

        {/* Domiciliario routes - SIN Layout público */}
        <Route path="/login-domiciliario" element={<DomiciliarioLogin />} />
        <Route
          path="/domiciliario"
          element={
            <ProtectedDomiciliarioRoute>
              <DomiciliarioDashboard />
            </ProtectedDomiciliarioRoute>
          }
        />

        {/* Rutas públicas CON Layout (Navbar + Footer) */}
        <Route path="/" element={<PublicLayout><Home /></PublicLayout>} />
        <Route path="/about" element={<PublicLayout><AboutUs /></PublicLayout>} />
        <Route path="/shop" element={<PublicLayout><Shop /></PublicLayout>} />
        <Route path="/shop/:id" element={<PublicLayout><ShopDetail /></PublicLayout>} />
        <Route path="/cart" element={<PublicLayout><Cart /></PublicLayout>} />
        <Route path="/checkout" element={<PublicLayout><Checkout /></PublicLayout>} />
        <Route path="/contact" element={<PublicLayout><Contact /></PublicLayout>} />
        <Route path="/testimonials" element={<PublicLayout><Testimonial /></PublicLayout>} />
        <Route path="/login" element={<PublicLayout><Login /></PublicLayout>} />
        <Route path="/register" element={<PublicLayout><Register /></PublicLayout>} />
        <Route path="/mi-perfil" element={<PublicLayout><MiPerfil /></PublicLayout>} />
        <Route path="/mis-compras" element={<PublicLayout><MisCompras /></PublicLayout>} />
        <Route path="/cambiar-password" element={<PublicLayout><CambiarPassword /></PublicLayout>} />
        <Route path="/forgot-password" element={<PublicLayout><ForgotPassword /></PublicLayout>} />
        <Route path="/terminos" element={<PublicLayout><TermsAndConditions /></PublicLayout>} />
        <Route path="*" element={<PublicLayout><NotFound /></PublicLayout>} />
      </Routes>
      </CartProvider>
    </AuthProvider>
  )
}

export default App
