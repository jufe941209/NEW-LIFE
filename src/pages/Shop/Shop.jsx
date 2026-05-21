import React, { useState, useEffect, useMemo } from 'react'
import { useSearchParams, Link, useNavigate } from 'react-router-dom'
import { ProductGrid, ProductFilters, PageHeader } from '../../components/organisms'
import productoService from '../../services/productoService'
import categoriaService from '../../services/categoriaService'
import { useCart } from '../../context/CartContext'
import './Shop.css'

const Shop = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { addItem, itemCount } = useCart()

  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '')
  const [filters, setFilters] = useState({ category: '', minPrice: '', maxPrice: '', sortBy: 'relevance' })
  const [viewMode, setViewMode] = useState('grid')
  const [currentPage, setCurrentPage] = useState(1)
  const productsPerPage = 12

  const [allProducts, setAllProducts] = useState([])
  const [categorias, setCategorias] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [addedId, setAddedId] = useState(null)

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true)
      try {
        const [prods, cats] = await Promise.all([
          productoService.getAll().catch(() => []),
          categoriaService.getAll().catch(() => []),
        ])
        setCategorias(Array.isArray(cats) ? cats : [])
        const activos = (Array.isArray(prods) ? prods : [])
          .filter(p => p.estado === 'Activo' && p.stock_real > 0)
          .map(p => ({
            id: p.codigo_prod,
            codigo_prod: p.codigo_prod,
            name: p.nombres,
            description: p.descripcion || '',
            price: Number(p.precio),
            originalPrice: Number(p.precio),
            discount: 0,
            image: p.img_url || '/img/Imagen1.png',
            category: (cats || []).find(c => c.numero_categoria === p.numero_categoria)?.nombre?.toLowerCase() || '',
            stock: p.stock_real,
            badge: p.stock_real <= p.stock_min ? 'Stock bajo' : undefined,
          }))
        setAllProducts(activos)
      } finally {
        setIsLoading(false)
      }
    }
    loadData()
  }, [])

  const filteredProducts = useMemo(() => {
    let filtered = [...allProducts]
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(p => p.name.toLowerCase().includes(term) || p.description.toLowerCase().includes(term))
    }
    if (filters.category) filtered = filtered.filter(p => p.category === filters.category)
    if (filters.minPrice) filtered = filtered.filter(p => p.price >= Number(filters.minPrice))
    if (filters.maxPrice) filtered = filtered.filter(p => p.price <= Number(filters.maxPrice))
    switch (filters.sortBy) {
      case 'price-low': filtered.sort((a, b) => a.price - b.price); break
      case 'price-high': filtered.sort((a, b) => b.price - a.price); break
      case 'name-asc': filtered.sort((a, b) => a.name.localeCompare(b.name)); break
      case 'name-desc': filtered.sort((a, b) => b.name.localeCompare(a.name)); break
      default: break
    }
    return filtered
  }, [allProducts, searchTerm, filters])

  const totalPages = Math.ceil(filteredProducts.length / productsPerPage)
  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * productsPerPage
    return filteredProducts.slice(start, start + productsPerPage)
  }, [filteredProducts, currentPage, productsPerPage])

  useEffect(() => { setCurrentPage(1) }, [searchTerm, filters])

  const handleAddToCart = (product) => {
    addItem(product, 1)
    setAddedId(product.id)
    setTimeout(() => setAddedId(null), 1800)
  }

  return (
    <div className="shop-page">
      <PageHeader
        items={[{ label: 'Inicio', path: '/' }, { label: 'Productos', path: '/shop' }]}
        title="Nuestros Productos"
        subtitle="Descubre nuestra línea completa de productos biodegradables"
      />

      <div className="container-fluid py-5">
        <div className="container">
          {/* Toast de producto añadido */}
          {addedId && (
            <div style={{
              position: 'fixed', bottom: 24, right: 24, zIndex: 9999,
              background: '#22c55e', color: '#fff', borderRadius: 12,
              padding: '0.75rem 1.25rem', fontWeight: 600, fontSize: '0.9rem',
              boxShadow: '0 6px 20px rgba(0,0,0,0.18)', display: 'flex', alignItems: 'center', gap: 8
            }}>
              <i className="fas fa-check-circle"></i> Producto añadido al carrito
              {itemCount > 0 && (
                <button
                  onClick={() => navigate('/cart')}
                  style={{ background: 'rgba(255,255,255,0.25)', border: 'none', color: '#fff', borderRadius: 8, padding: '0.25rem 0.65rem', cursor: 'pointer', marginLeft: 6, fontWeight: 700, fontSize: '0.82rem' }}
                >
                  Ver carrito ({itemCount})
                </button>
              )}
            </div>
          )}

          <div className="row mb-3">
            <div className="col-12">
              <div className="results-count">
                <span className="text-muted">
                  <i className="fas fa-box me-2"></i>
                  {isLoading ? 'Cargando...' : `${filteredProducts.length} producto${filteredProducts.length !== 1 ? 's' : ''} encontrado${filteredProducts.length !== 1 ? 's' : ''}`}
                </span>
                {itemCount > 0 && (
                  <Link to="/cart" style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.88rem', fontWeight: 600, color: '#16a34a', textDecoration: 'none' }}>
                    <i className="fas fa-shopping-cart"></i> Carrito ({itemCount})
                  </Link>
                )}
              </div>
            </div>
          </div>

          <div className="row">
            <div className="col-lg-3 mb-4 mb-lg-0">
              <ProductFilters onFilterChange={setFilters} onSearch={setSearchTerm} searchTerm={searchTerm} />
            </div>

            <div className="col-lg-9">
              <div className="shop-toolbar mb-4">
                <div className="view-mode-toggle">
                  <button className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`} onClick={() => setViewMode('grid')}>
                    <i className="fas fa-th"></i>
                  </button>
                  <button className={`view-btn ${viewMode === 'list' ? 'active' : ''}`} onClick={() => setViewMode('list')}>
                    <i className="fas fa-list"></i>
                  </button>
                </div>
              </div>

              {isLoading ? (
                <div style={{ textAlign: 'center', padding: '4rem 0', color: '#64748b' }}>
                  <div className="spinner-border text-success me-3"></div>
                  Cargando productos...
                </div>
              ) : (
                <ProductGrid
                  products={paginatedProducts}
                  columns={viewMode === 'grid' ? 3 : 1}
                  onAddToCart={handleAddToCart}
                  emptyMessage="No se encontraron productos"
                />
              )}

              {totalPages > 1 && (
                <div className="pagination-wrapper mt-5">
                  <nav>
                    <ul className="pagination justify-content-center">
                      <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                        <button className="page-link" onClick={() => setCurrentPage(p => Math.max(1, p - 1))}>
                          <i className="fas fa-chevron-left"></i>
                        </button>
                      </li>
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => {
                        if (page === 1 || page === totalPages || (page >= currentPage - 1 && page <= currentPage + 1)) {
                          return (
                            <li key={page} className={`page-item ${currentPage === page ? 'active' : ''}`}>
                              <button className="page-link" onClick={() => setCurrentPage(page)}>{page}</button>
                            </li>
                          )
                        } else if (page === currentPage - 2 || page === currentPage + 2) {
                          return <li key={page} className="page-item disabled"><span className="page-link">...</span></li>
                        }
                        return null
                      })}
                      <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                        <button className="page-link" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}>
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
