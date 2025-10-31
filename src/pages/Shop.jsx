import React, { useState, useEffect, useMemo } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { ProductGrid, ProductFilters, PageHeader } from '../components/organisms'
import { Button } from '../components/atoms'
import './Shop.css'

/**
 * Shop - Página de Productos
 * Catálogo completo de productos con filtros y búsqueda
 */
const Shop = () => {
  const [searchParams] = useSearchParams()
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '')
  const [filters, setFilters] = useState({
    category: '',
    minPrice: '',
    maxPrice: '',
    sortBy: 'relevance'
  })
  const [viewMode, setViewMode] = useState('grid') // 'grid' or 'list'
  const [productsPerPage] = useState(12)
  const [currentPage, setCurrentPage] = useState(1)

  // Productos simulados - en producción vendrían de una API
  const [allProducts] = useState([
    {
      id: 1,
      name: 'Cuchara Eco – Cartón',
      description: 'Cuchara ecológica fabricada con cartón biodegradable',
      price: 8200,
      image: '/img/Imagen1.png',
      category: 'cubiertos'
    },
    {
      id: 2,
      name: 'Tenedor Madera',
      description: 'Tenedor de madera 100% natural y compostable',
      price: 7150,
      image: '/img/Imagen2.png',
      category: 'cubiertos'
    },
    {
      id: 3,
      name: 'Cuchara Madera',
      description: 'Cuchara de madera sostenible y reutilizable',
      price: 7150,
      image: '/img/Imagen3.png',
      category: 'cubiertos'
    },
    {
      id: 4,
      name: 'Eco Cuchara Degustación',
      description: 'Cuchara pequeña para degustaciones ecológicas',
      price: 3500,
      image: '/img/Imagen4.png',
      category: 'cubiertos'
    },
    {
      id: 5,
      name: 'Plato Germinable Grande',
      description: 'Plato grande con semillas germinables incluidas',
      price: 19000,
      originalPrice: 24000,
      discount: 20,
      image: '/img/Imagen5.png',
      category: 'platos',
      badge: 'Nuevo'
    },
    {
      id: 6,
      name: 'Plato carton grande',
      description: 'Plato de cartón grande biodegradable',
      price: 11900,
      image: '/img/Imagen6.png',
      category: 'platos'
    },
    {
      id: 7,
      name: 'Plato carton pequeño',
      description: 'Plato de cartón pequeño para porciones individuales',
      price: 4900,
      image: '/img/Imagen7.png',
      category: 'platos'
    },
    {
      id: 8,
      name: 'Vaso Biodegradable Grande',
      description: 'Vaso 100% biodegradable y compostable, tamaño grande',
      price: 3500,
      image: '/img/Imagen8.png',
      category: 'vasos'
    },
    {
      id: 9,
      name: 'Vaso Biodegradable Mediano',
      description: 'Vaso 100% biodegradable y compostable, tamaño mediano',
      price: 2800,
      image: '/img/Imagen9.png',
      category: 'vasos'
    },
    {
      id: 10,
      name: 'Recipiente Ecológico Grande',
      description: 'Recipiente para comidas rápidas, tamaño grande',
      price: 8500,
      image: '/img/Imagen10.png',
      category: 'recipientes'
    },
    {
      id: 11,
      name: 'Plato Germinable Mediano',
      description: 'Plato mediano con semillas germinables incluidas',
      price: 15000,
      originalPrice: 18000,
      discount: 16,
      image: '/img/Imagen11.png',
      category: 'germinables',
      badge: 'Popular'
    },
    {
      id: 12,
      name: 'Set Cubiertos Ecológicos',
      description: 'Set completo de cubiertos biodegradables',
      price: 12500,
      image: '/img/Imagen12.png',
      category: 'cubiertos',
      badge: 'Más Vendido'
    }
  ])

  // Filtrar y ordenar productos
  const filteredProducts = useMemo(() => {
    let filtered = [...allProducts]

    // Búsqueda por texto
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(term) ||
        product.description.toLowerCase().includes(term)
      )
    }

    // Filtro por categoría
    if (filters.category) {
      filtered = filtered.filter(product =>
        product.category === filters.category
      )
    }

    // Filtro por precio
    if (filters.minPrice) {
      filtered = filtered.filter(product =>
        product.price >= Number(filters.minPrice)
      )
    }

    if (filters.maxPrice) {
      filtered = filtered.filter(product =>
        product.price <= Number(filters.maxPrice)
      )
    }

    // Ordenar
    switch (filters.sortBy) {
      case 'price-low':
        filtered.sort((a, b) => a.price - b.price)
        break
      case 'price-high':
        filtered.sort((a, b) => b.price - a.price)
        break
      case 'name-asc':
        filtered.sort((a, b) => a.name.localeCompare(b.name))
        break
      case 'name-desc':
        filtered.sort((a, b) => b.name.localeCompare(a.name))
        break
      default:
        // Mantener orden original
        break
    }

    return filtered
  }, [allProducts, searchTerm, filters])

  // Paginación
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage)
  const paginatedProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * productsPerPage
    return filteredProducts.slice(startIndex, startIndex + productsPerPage)
  }, [filteredProducts, currentPage, productsPerPage])

  useEffect(() => {
    setCurrentPage(1) // Reset a página 1 cuando cambian los filtros
  }, [searchTerm, filters])

  const handleAddToCart = (product) => {
    console.log('Agregar al carrito:', product)
    // Aquí puedes agregar la lógica para agregar al carrito
    // Por ejemplo, usar Context API o Redux
  }

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters)
  }

  const handleSearch = (term) => {
    setSearchTerm(term)
  }

  return (
    <div className="shop-page">
      {/* Page Header */}
      <PageHeader
        items={[
          { label: 'Inicio', path: '/' },
          { label: 'Productos', path: '/shop' }
        ]}
        title="Nuestros Productos"
        subtitle="Descubre nuestra línea completa de productos biodegradables"
      />

      {/* Shop Content */}
      <div className="container-fluid py-5">
        <div className="container">
          {/* Results Count */}
          <div className="row mb-3">
            <div className="col-12">
              <div className="results-count">
                <span className="text-muted">
                  <i className="fas fa-box me-2"></i>
                  {filteredProducts.length} producto{filteredProducts.length !== 1 ? 's' : ''} encontrado{filteredProducts.length !== 1 ? 's' : ''}
                </span>
              </div>
            </div>
          </div>

          <div className="row">
            {/* Sidebar - Filters */}
            <div className="col-lg-3 mb-4 mb-lg-0">
              <ProductFilters
                onFilterChange={handleFilterChange}
                onSearch={handleSearch}
                searchTerm={searchTerm}
              />
            </div>

            {/* Products Grid */}
            <div className="col-lg-9">
              {/* View Mode Toggle */}
              <div className="shop-toolbar mb-4">
                <div className="view-mode-toggle">
                  <button
                    className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
                    onClick={() => setViewMode('grid')}
                    aria-label="Vista de cuadrícula"
                  >
                    <i className="fas fa-th"></i>
                  </button>
                  <button
                    className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
                    onClick={() => setViewMode('list')}
                    aria-label="Vista de lista"
                  >
                    <i className="fas fa-list"></i>
                  </button>
                </div>
              </div>

              {/* Products Grid */}
              <ProductGrid
                products={paginatedProducts}
                columns={viewMode === 'grid' ? 3 : 1}
                onAddToCart={handleAddToCart}
                emptyMessage="No se encontraron productos"
              />

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="pagination-wrapper mt-5">
                  <nav aria-label="Paginación de productos">
                    <ul className="pagination justify-content-center">
                      <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                        <button
                          className="page-link"
                          onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                          disabled={currentPage === 1}
                        >
                          <i className="fas fa-chevron-left"></i>
                        </button>
                      </li>

                      {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => {
                        if (
                          page === 1 ||
                          page === totalPages ||
                          (page >= currentPage - 1 && page <= currentPage + 1)
                        ) {
                          return (
                            <li key={page} className={`page-item ${currentPage === page ? 'active' : ''}`}>
                              <button
                                className="page-link"
                                onClick={() => setCurrentPage(page)}
                              >
                                {page}
                              </button>
                            </li>
                          )
                        } else if (
                          page === currentPage - 2 ||
                          page === currentPage + 2
                        ) {
                          return (
                            <li key={page} className="page-item disabled">
                              <span className="page-link">...</span>
                            </li>
                          )
                        }
                        return null
                      })}

                      <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                        <button
                          className="page-link"
                          onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                          disabled={currentPage === totalPages}
                        >
                          <i className="fas fa-chevron-right"></i>
                        </button>
                      </li>
                    </ul>
                  </nav>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Shop
