import React from 'react'
import { Link } from 'react-router-dom'
import { Button } from '../../atoms'
import './ProductCard.css'

/**
 * ProductCard - Molécula
 * Tarjeta de producto reutilizable con información completa
 */
const ProductCard = ({ 
  id,
  image,
  name,
  description,
  price,
  discount,
  originalPrice,
  badge,
  onAddToCart,
  className = '' 
}) => {
  const handleAddToCart = (e) => {
    e.preventDefault()
    if (onAddToCart) {
      onAddToCart({ id, name, price, image })
    } else {
      // Lógica por defecto: agregar al carrito
      console.log('Agregar al carrito:', { id, name, price })
    }
  }

  const finalPrice = discount && originalPrice 
    ? originalPrice - (originalPrice * discount / 100)
    : price

  return (
    <div className={`product-card ${className}`}>
      {/* Badge */}
      {badge && (
        <div className="product-badge">
          {badge}
        </div>
      )}

      {/* Discount Badge */}
      {discount && originalPrice && (
        <div className="product-discount-badge">
          -{discount}%
        </div>
      )}

      {/* Product Image */}
      <div 
        className="product-image-wrapper"
        onClick={() => window.location.href = `/shop/${id}`}
        style={{ cursor: 'pointer' }}
      >
        <img 
          src={image || '/img/Imagen1.png'} 
          alt={name}
          className="product-image"
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '90%',
            height: '90%',
            objectFit: 'contain',
            objectPosition: 'center',
            display: 'block',
            margin: 0,
            padding: 0
          }}
          onError={(e) => {
            e.target.src = '/img/Imagen1.png'
          }}
        />
        <div className="product-overlay">
          <div className="overlay-btn-wrapper">
            <Button 
              variant="success" 
              size="sm" 
              className="overlay-btn"
              onClick={(e) => {
                e.stopPropagation()
                window.location.href = `/shop/${id}`
              }}
            >
              <i className="fas fa-eye me-2"></i>
              Ver Detalle
            </Button>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="product-quick-actions">
          <button 
            className="quick-action-btn"
            onClick={handleAddToCart}
            aria-label="Agregar al carrito"
            title="Agregar al carrito"
          >
            <i className="fas fa-shopping-cart"></i>
          </button>
          <button 
            className="quick-action-btn"
            aria-label="Añadir a favoritos"
            title="Añadir a favoritos"
          >
            <i className="far fa-heart"></i>
          </button>
        </div>
      </div>

      {/* Product Info */}
      <div className="product-info">
        <Link to={`/shop/${id}`} className="product-name-link">
          <h5 className="product-name">{name}</h5>
        </Link>
        
        {description && (
          <p className="product-description">{description}</p>
        )}

        {/* Price */}
        <div className="product-price-wrapper">
          <div className="product-price-container">
            {discount && originalPrice && (
              <span className="product-price-original">
              ${originalPrice.toLocaleString()}
              </span>
            )}
            <span className="product-price">
              ${finalPrice.toLocaleString()}
            </span>
          </div>
          {discount && originalPrice && (
            <span className="product-discount">
              {discount}% OFF
            </span>
          )}
        </div>

        {/* Actions */}
        <div className="product-actions">
          <Button 
            variant="success" 
            size="sm" 
            className="add-to-cart-btn w-100"
            onClick={handleAddToCart}
          >
            <i className="fas fa-shopping-cart me-2"></i>
            Agregar al Carrito
          </Button>
        </div>
      </div>
    </div>
  )
}

export default ProductCard
