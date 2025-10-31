import React, { useState } from 'react'
import { Input, Button } from '../../atoms'
import './ProductFilters.css'

/**
 * ProductFilters - Organismo
 * Panel de filtros para productos
 */
const ProductFilters = ({ 
  onFilterChange,
  onSearch,
  searchTerm = '',
  className = ''
}) => {
  const [filters, setFilters] = useState({
    category: '',
    minPrice: '',
    maxPrice: '',
    sortBy: 'relevance'
  })
  const [showFilters, setShowFilters] = useState(false)

  const handleFilterChange = (name, value) => {
    const newFilters = {
      ...filters,
      [name]: value
    }
    setFilters(newFilters)
    if (onFilterChange) {
      onFilterChange(newFilters)
    }
  }

  const handleSearch = (e) => {
    e.preventDefault()
    if (onSearch) {
      onSearch(searchTerm)
    }
  }

  const clearFilters = () => {
    const clearedFilters = {
      category: '',
      minPrice: '',
      maxPrice: '',
      sortBy: 'relevance'
    }
    setFilters(clearedFilters)
    if (onFilterChange) {
      onFilterChange(clearedFilters)
    }
  }

  return (
    <div className={`product-filters ${className}`}>
      {/* Search Bar */}
      <div className="filters-search mb-4">
        <form onSubmit={handleSearch} className="search-form">
          <Input
            type="text"
            placeholder="Buscar productos..."
            value={searchTerm}
            onChange={(e) => {
              if (onSearch) {
                onSearch(e.target.value)
              }
            }}
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

        {/* Category Filter */}
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
            <option value="platos">Platos</option>
            <option value="vasos">Vasos</option>
            <option value="cubiertos">Cubiertos</option>
            <option value="recipientes">Recipientes</option>
            <option value="germinables">Germinables</option>
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

        {/* Clear Filters */}
        {(filters.category || filters.minPrice || filters.maxPrice || filters.sortBy !== 'relevance') && (
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

