import { Routes, Route } from 'react-router-dom'
import { Layout } from './components/organisms'

// Pages
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

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<AboutUs />} />
        <Route path="/shop" element={<Shop />} />
        <Route path="/shop/:id" element={<ShopDetail />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/testimonials" element={<Testimonial />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Layout>
  )
}

export default App

