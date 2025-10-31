import React from 'react'
import { useParams } from 'react-router-dom'
import { PageHeader } from '../components/organisms'
import './ShopDetail.css'

/**
 * ShopDetail - Página de Detalle de Producto
 */
const ShopDetail = () => {
  const { id } = useParams()

  return (
    <div className="shop-detail-page">
      <PageHeader
        items={[
          { label: 'Inicio', path: '/' },
          { label: 'Productos', path: '/shop' },
          { label: 'Detalle', path: `/shop/${id}` }
        ]}
        title="Detalle del Producto"
        subtitle="Conoce todos los detalles de nuestro producto biodegradable"
      />

      <div className="container-fluid py-5">
        <div className="container">
          <p className="text-muted">Detalle del producto ID: {id}</p>
        </div>
      </div>
    </div>
  )
}

export default ShopDetail

