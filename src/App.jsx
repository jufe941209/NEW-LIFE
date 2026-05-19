import { Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { Layout } from './components/organisms'
import ProtectedAdminRoute from './components/ProtectedAdminRoute'

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
  return (
    <AuthProvider>
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
        <Route path="*" element={<PublicLayout><NotFound /></PublicLayout>} />
      </Routes>
    </AuthProvider>
  )
}

export default App
