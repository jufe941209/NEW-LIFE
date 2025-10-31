import React from 'react'
import Navbar from '../Navbar/Navbar'
import Footer from '../Footer/Footer'
import './Layout.css'

/**
 * Layout - Organismo
 * Layout principal que envuelve todas las páginas
 * Incluye Navbar y Footer
 */
const Layout = ({ children }) => {
  return (
    <div className="layout">
      <Navbar />
      <main className="main-content">
        {children}
      </main>
      <Footer />
      
      {/* Back to Top Button */}
      <a href="#" className="btn btn-primary border-3 border-primary rounded-circle back-to-top">
        <i className="fa fa-arrow-up"></i>
      </a>
    </div>
  )
}

export default Layout

