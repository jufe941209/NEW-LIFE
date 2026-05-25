import React from 'react'
import { ProductCard } from '../../molecules'
import './ProductGrid.css'

/**
 * ProductGrid - Organismo
 * Grid de productos con diferentes layouts
 */
const ProductGrid = ({ 
  products = [],
  columns = 3,
  onAddToCart,
  emptyMessage = 'No hay productos disponibles',
  className = ''
}) => {
  if (products.length === 0) {
    return (
      <div className={`product-grid-empty ${className}`}>
        <div className="empty-content">
          <i className="fas fa-box-open fa-4x text-muted mb-3"></i>
          <h4 className="text-muted">{emptyMessage}</h4>
          <p className="text-muted">Intenta ajustar tus filtros de búsqueda</p>
        </div>
      </div>
    )
  }

  const isListView = columns === 1

  const gridCols = {
    1: 'col-12',
    2: 'col-lg-6',
    3: 'col-lg-4',
    4: 'col-lg-3'
  }

  const colClass = gridCols[columns] || 'col-lg-4'

  return (
    <div className={`product-grid ${className}`}>
      <div className={`row ${isListView ? 'g-3 list-view' : 'g-4'}`}>
        {products.map((product) => (
          <div key={product.id} className={isListView ? 'col-12' : `${colClass} col-md-6 col-sm-12`}>
            <ProductCard
              id={product.id}
              image={product.image}
              name={product.name}
              description={product.description}
              price={product.price}
              discount={product.discount}
              originalPrice={product.originalPrice}
              badge={product.badge}
              onAddToCart={onAddToCart}
              listView={isListView}
            />
          </div>
        ))}
      </div>
    </div>
  )
}

export default ProductGrid

