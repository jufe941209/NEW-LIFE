import React, { useState } from 'react'
import { Input, Button } from '../../atoms'
import './ProductFilters.css'

const ProductFilters = ({
  onFilterChange,
  onSearch,
  searchTerm = '',
  categorias = [],
  tipos = [],
  className = ''
}) => {
  const [filters, setFilters] = useState({
    category: '',
    tipoProducto: '',
    minPrice: '',
    maxPrice: '',
    sortBy: 'relevance',
    onlyDiscount: false
  })
  const [showFilters, setShowFilters] = useState(false)

  const handleFilterChange = (name, value) => {
    const newFilters = { ...filters, [name]: value }
    setFilters(newFilters)
    if (onFilterChange) onFilterChange(newFilters)
  }

  const handleSearch = (e) => {
    e.preventDefault()
    if (onSearch) onSearch(searchTerm)
  }

  const clearFilters = () => {
    const cleared = { category: '', tipoProducto: '', minPrice: '', maxPrice: '', sortBy: 'relevance', onlyDiscount: false }
    setFilters(cleared)
    if (onFilterChange) onFilterChange(cleared)
  }

  const hasActiveFilters = filters.category || filters.tipoProducto || filters.minPrice || filters.maxPrice || filters.sortBy !== 'relevance' || filters.onlyDiscount

  return (
    <div className={`product-filters ${className}`}>
      {/* Search Bar */}
      <div className="filters-search mb-4">
        <form onSubmit={handleSearch} className="search-form">
          <Input
            type="text"
            placeholder="Buscar productos..."
            value={searchTerm}
            onChange={(e) => { if (onSearch) onSearch(e.target.value) }}
            icon="fas fa-search"
            iconPosition="left"
            className="search-input"
          />
          <Button type="submit" variant="success" className="search-submit">
            <i className="fas fa-search me-2"></i>
            Buscar
          </Button>
        </form>
      </div>

      {/* Filter Toggle Button (Mobile) */}
      <div className="filter-toggle-mobile mb-3">
        <Button
          variant="outline-success"
          className="w-100"
          onClick={() => setShowFilters(!showFilters)}
        >
          <i className={`fas ${showFilters ? 'fa-times' : 'fa-filter'} me-2`}></i>
          {showFilters ? 'Ocultar Filtros' : 'Mostrar Filtros'}
        </Button>
      </div>

      {/* Filters Panel */}
      <div className={`filters-panel ${showFilters ? 'show' : ''}`}>

        {/* Sort By */}
        <div className="filter-group">
          <label className="filter-label">
            <i className="fas fa-sort me-2"></i>
            Ordenar por
          </label>
          <select
            className="form-select filter-select"
            value={filters.sortBy}
            onChange={(e) => handleFilterChange('sortBy', e.target.value)}
          >
            <option value="relevance">Más relevante</option>
            <option value="price-low">Precio: menor a mayor</option>
            <option value="price-high">Precio: mayor a menor</option>
            <option value="name-asc">Nombre: A-Z</option>
            <option value="name-desc">Nombre: Z-A</option>
          </select>
        </div>

        {/* Category Filter — dinámico desde API */}
        <div className="filter-group">
          <label className="filter-label">
            <i className="fas fa-tags me-2"></i>
            Categoría
          </label>
          <select
            className="form-select filter-select"
            value={filters.category}
            onChange={(e) => handleFilterChange('category', e.target.value)}
          >
            <option value="">Todas las categorías</option>
            {categorias.map(cat => (
              <option key={cat.numero_categoria} value={cat.nombre.toLowerCase()}>
                {cat.nombre}
              </option>
            ))}
          </select>
        </div>

        {/* Tipo de Producto — dinámico desde API */}
        <div className="filter-group">
          <label className="filter-label">
            <i className="fas fa-cubes me-2"></i>
            Tipo de producto
          </label>
          <select
            className="form-select filter-select"
            value={filters.tipoProducto}
            onChange={(e) => handleFilterChange('tipoProducto', e.target.value)}
            disabled={tipos.length === 0}
          >
            <option value="">{tipos.length === 0 ? 'Cargando tipos...' : 'Todos los tipos'}</option>
            {tipos.map(tp => (
              <option key={tp.id_tipo_producto} value={tp.id_tipo_producto}>
                {tp.nombre}
              </option>
            ))}
          </select>
        </div>

        {/* Price Range */}
        <div className="filter-group">
          <label className="filter-label">
            <i className="fas fa-dollar-sign me-2"></i>
            Rango de Precio
          </label>
          <div className="price-range-inputs">
            <Input
              type="number"
              placeholder="Mínimo"
              value={filters.minPrice}
              onChange={(e) => handleFilterChange('minPrice', e.target.value)}
              className="price-input"
            />
            <span className="price-separator">-</span>
            <Input
              type="number"
              placeholder="Máximo"
              value={filters.maxPrice}
              onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
              className="price-input"
            />
          </div>
        </div>

        {/* En Oferta */}
        <div className="filter-group">
          <label className="filter-label">
            <i className="fas fa-percent me-2"></i>
            Ofertas
          </label>
          <div
            className={`filter-toggle-btn ${filters.onlyDiscount ? 'active' : ''}`}
            onClick={() => {
              const val = !filters.onlyDiscount
              const newF = { ...filters, onlyDiscount: val }
              setFilters(newF)
              if (onFilterChange) onFilterChange(newF)
            }}
            style={{
              display: 'flex', alignItems: 'center', gap: '0.5rem',
              padding: '0.5rem 1rem', borderRadius: 8, cursor: 'pointer',
              border: `2px solid ${filters.onlyDiscount ? '#28a745' : '#e2e8f0'}`,
              background: filters.onlyDiscount ? '#f0fdf4' : '#fff',
              color: filters.onlyDiscount ? '#16a34a' : '#64748b',
              fontWeight: 600, fontSize: '0.88rem', transition: 'all 0.2s',
              userSelect: 'none'
            }}
          >
            <i className={`fas ${filters.onlyDiscount ? 'fa-check-circle' : 'fa-circle'}`}></i>
            Solo productos en oferta
          </div>
        </div>

        {/* Clear Filters */}
        {hasActiveFilters && (
          <div className="filter-group">
            <Button
              variant="outline-danger"
              className="w-100"
              onClick={clearFilters}
            >
              <i className="fas fa-times me-2"></i>
              Limpiar Filtros
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

export default ProductFilters
