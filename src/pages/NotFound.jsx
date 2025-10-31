import React from 'react'
import { Link } from 'react-router-dom'
import { Button } from '../components/atoms'
import './NotFound.css'

/**
 * NotFound - Página 404
 */
const NotFound = () => {
  return (
    <div className="not-found-page">
      <div className="container-fluid py-5">
        <div className="container text-center">
          <h1 className="display-1 text-success mb-4">404</h1>
          <h2 className="display-4 mb-4">Página no encontrada</h2>
          <p className="lead text-muted mb-5">
            Lo sentimos, la página que buscas no existe.
          </p>
          <Link to="/">
            <Button variant="success" size="lg">
              Volver al Inicio
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}

export default NotFound

