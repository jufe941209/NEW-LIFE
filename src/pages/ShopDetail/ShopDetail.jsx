import React, { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { PageHeader } from '../../components/organisms'
import { useCart } from '../../context/CartContext'
import productoService from '../../services/productoService'
import categoriaService from '../../services/categoriaService'
import tipoProductoService from '../../services/tipoProductoService'
import './ShopDetail.css'

const fmtCOP = (n) => Number(n || 0).toLocaleString('es-CO')
const precioConDescuento = (precio, descuento) => Number(precio) * (1 - Number(descuento || 0) / 100)

const ShopDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { addItem } = useCart()

  const [product, setProduct] = useState(null)
  const [categoria, setCategoria] = useState(null)
  const [tipoProducto, setTipoProducto] = useState(null)
  const [loading, setLoading] = useState(true)
  const [qty, setQty] = useState(1)
  const [addedMsg, setAddedMsg] = useState(false)
  const [relatedProducts, setRelatedProducts] = useState([])

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const [prod, allProds, cats, tipos] = await Promise.all([
          productoService.getById(id).catch(() => null),
          productoService.getAll().catch(() => []),
          categoriaService.getAll().catch(() => []),
          tipoProductoService.getAll().catch(() => []),
        ])
        if (!prod) { setLoading(false); return }
        setProduct(prod)

        const cat = (Array.isArray(cats) ? cats : []).find(c => c.numero_categoria === prod.numero_categoria)
        setCategoria(cat || null)

        const tipo = (Array.isArray(tipos) ? tipos : []).find(t => t.id_tipo_producto === prod.id_tipo_producto)
        setTipoProducto(tipo || null)

        const related = (Array.isArray(allProds) ? allProds : [])
          .filter(p => p.codigo_prod !== prod.codigo_prod && p.estado?.toLowerCase() === 'activo')
          .slice(0, 4)
        setRelatedProducts(related)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id])

  const handleAddToCart = () => {
    if (!product || product.stock_real <= 0) return
    addItem({
      id: product.codigo_prod,
      name: product.nombres,
      price: precioConDescuento(product.precio, product.descuento),
      image: product.img_url || '/img/Imagen1.png',
    }, qty)
    setAddedMsg(true)
    setTimeout(() => setAddedMsg(false), 3000)
  }

  const stockStatus = !product ? null
    : product.stock_real === 0 ? { label: 'Agotado', color: '#ef4444', bg: '#fff5f5', icon: 'fa-times-circle' }
    : product.stock_real <= product.stock_min ? { label: 'Stock bajo', color: '#f59e0b', bg: '#fffbeb', icon: 'fa-exclamation-triangle' }
    : { label: 'Disponible', color: '#16a34a', bg: '#f0fdf4', icon: 'fa-check-circle' }

  if (loading) return (
    <div className="shop-detail-page">
      <PageHeader
        items={[{ label: 'Inicio', path: '/' }, { label: 'Productos', path: '/shop' }, { label: 'Cargando...', path: '#' }]}
        title="Detalle del Producto"
        subtitle="Cargando información del producto..."
      />
      <div className="sd-loading">
        <div className="spinner-border text-success" style={{ width: '3rem', height: '3rem' }}></div>
        <p className="mt-3 text-muted fw-semibold">Cargando producto...</p>
      </div>
    </div>
  )

  if (!product) return (
    <div className="shop-detail-page">
      <PageHeader
        items={[{ label: 'Inicio', path: '/' }, { label: 'Productos', path: '/shop' }, { label: 'No encontrado', path: '#' }]}
        title="Producto no encontrado"
        subtitle="El producto que buscas no está disponible"
      />
      <div className="sd-not-found">
        <i className="fas fa-box-open fa-4x mb-4 d-block" style={{ color: '#d1d5db' }}></i>
        <h3 className="mb-2">Producto no encontrado</h3>
        <p className="text-muted mb-4">El producto con código <strong>{id}</strong> no existe o fue eliminado.</p>
        <Link to="/shop" className="btn btn-success btn-lg">
          <i className="fas fa-store me-2"></i>Volver a la Tienda
        </Link>
      </div>
    </div>
  )

  return (
    <div className="shop-detail-page">
      <PageHeader
        items={[
          { label: 'Inicio', path: '/' },
          { label: 'Productos', path: '/shop' },
          { label: product.nombres, path: `/shop/${id}` }
        ]}
        title={product.nombres}
        subtitle={categoria ? `Categoría: ${categoria.nombre}` : 'Producto biodegradable NEW LIFE'}
      />

      <div className="container py-5">

        {/* ── MAIN PRODUCT SECTION ── */}
        <div className="sd-main-grid">

          {/* Image panel */}
          <div className="sd-image-panel">
            <div className="sd-image-wrap">
              <img
                src={product.img_url || '/img/Imagen1.png'}
                alt={product.nombres}
                className="sd-main-img"
                onError={e => { e.target.src = '/img/Imagen1.png' }}
              />
              {product.stock_real === 0 && (
                <div className="sd-sold-out-ribbon">Agotado</div>
              )}
            </div>
            <div className="sd-img-badges">
              <span className="sd-eco-badge"><i className="fas fa-leaf me-1"></i>100% Biodegradable</span>
              <span className="sd-eco-badge"><i className="fas fa-seedling me-1"></i>Eco-friendly</span>
            </div>
          </div>

          {/* Info panel */}
          <div className="sd-info-panel">
            {/* Breadcrumb code */}
            <div className="sd-product-code">
              <i className="fas fa-barcode me-2"></i>Código: <strong>{product.codigo_prod}</strong>
              {categoria && <span className="sd-category-tag ms-3"><i className="fas fa-tag me-1"></i>{categoria.nombre}</span>}
            </div>

            <h1 className="sd-product-name">{product.nombres}</h1>

            <div className="sd-price-row">
              {product.descuento > 0 ? (
                <>
                  <span className="sd-price-original">${fmtCOP(product.precio)}</span>
                  <span className="sd-price">${fmtCOP(precioConDescuento(product.precio, product.descuento))}</span>
                  <span className="sd-discount-badge">-{product.descuento}%</span>
                </>
              ) : (
                <span className="sd-price">${fmtCOP(product.precio)}</span>
              )}
              <span className="sd-price-label">COP / unidad</span>
            </div>

            {/* Stock badge */}
            <div className="sd-stock-badge" style={{ background: stockStatus.bg, color: stockStatus.color, borderColor: stockStatus.color + '40' }}>
              <i className={`fas ${stockStatus.icon} me-2`}></i>
              <strong>{stockStatus.label}</strong>
              {product.stock_real > 0 && (
                <span className="ms-2" style={{ fontWeight: 400, fontSize: '0.85rem' }}>— {product.stock_real} unidades disponibles</span>
              )}
            </div>

            {product.descripcion && (
              <p className="sd-description">{product.descripcion}</p>
            )}

            {/* Specs */}
            <div className="sd-specs-grid">
              {product.capacidad && (
                <div className="sd-spec-item">
                  <div className="sd-spec-icon"><i className="fas fa-tachometer-alt"></i></div>
                  <div>
                    <div className="sd-spec-label">Capacidad</div>
                    <div className="sd-spec-value">{product.capacidad}</div>
                  </div>
                </div>
              )}
              {product.temperatura_uso && (
                <div className="sd-spec-item">
                  <div className="sd-spec-icon"><i className="fas fa-thermometer-half"></i></div>
                  <div>
                    <div className="sd-spec-label">Temperatura de uso</div>
                    <div className="sd-spec-value">{product.temperatura_uso}</div>
                  </div>
                </div>
              )}
              {categoria && (
                <div className="sd-spec-item">
                  <div className="sd-spec-icon"><i className="fas fa-folder-open"></i></div>
                  <div>
                    <div className="sd-spec-label">Categoría</div>
                    <div className="sd-spec-value">{categoria.nombre}</div>
                  </div>
                </div>
              )}
              {tipoProducto && (
                <div className="sd-spec-item">
                  <div className="sd-spec-icon"><i className="fas fa-tag"></i></div>
                  <div>
                    <div className="sd-spec-label">Tipo de producto</div>
                    <div className="sd-spec-value">{tipoProducto.nombre}</div>
                  </div>
                </div>
              )}
            </div>

            {/* Add to cart */}
            {product.stock_real > 0 ? (
              <div className="sd-cart-section">
                {addedMsg && (
                  <div className="sd-added-msg">
                    <i className="fas fa-check-circle me-2"></i>
                    ¡Producto agregado al carrito exitosamente!
                  </div>
                )}
                <div className="sd-qty-row">
                  <div className="sd-qty-control">
                    <button className="sd-qty-btn" onClick={() => setQty(q => Math.max(1, q - 1))} disabled={qty <= 1}>
                      <i className="fas fa-minus"></i>
                    </button>
                    <span className="sd-qty-display">{qty}</span>
                    <button className="sd-qty-btn" onClick={() => setQty(q => Math.min(product.stock_real, q + 1))} disabled={qty >= product.stock_real}>
                      <i className="fas fa-plus"></i>
                    </button>
                  </div>
                  <div className="sd-qty-total">
                    Total: <strong>${fmtCOP(precioConDescuento(product.precio, product.descuento) * qty)}</strong>
                  </div>
                </div>
                <button className="sd-add-btn" onClick={handleAddToCart}>
                  <i className="fas fa-shopping-cart me-2"></i>
                  Agregar al Carrito — {qty} unid.
                </button>
                <Link to="/cart" className="sd-cart-link">
                  <i className="fas fa-shopping-bag me-2"></i>
                  Ver mi carrito
                </Link>
              </div>
            ) : (
              <div className="sd-out-of-stock">
                <i className="fas fa-clock me-2"></i>
                Producto temporalmente agotado. Vuelve pronto.
              </div>
            )}

            <div className="sd-back-link">
              <button className="btn btn-outline-secondary" onClick={() => navigate(-1)}>
                <i className="fas fa-arrow-left me-2"></i>Volver
              </button>
              <Link to="/shop" className="btn btn-outline-success ms-2">
                <i className="fas fa-store me-2"></i>Ver todos los productos
              </Link>
            </div>
          </div>
        </div>

        {/* ── FEATURES ── */}
        <div className="sd-features-row">
          {[
            { icon: 'fa-leaf', title: '100% Biodegradable', desc: 'Se descompone en 90 días' },
            { icon: 'fa-seedling', title: 'Semillas germinables', desc: 'Plantable después de uso' },
            { icon: 'fa-shield-alt', title: 'Calidad certificada', desc: 'Estándares internacionales' },
            { icon: 'fa-truck', title: 'Envío gratis', desc: 'En pedidos +$100.000' },
          ].map(f => (
            <div key={f.title} className="sd-feature-card">
              <div className="sd-feature-icon"><i className={`fas ${f.icon}`}></i></div>
              <div>
                <div className="sd-feature-title">{f.title}</div>
                <div className="sd-feature-desc">{f.desc}</div>
              </div>
            </div>
          ))}
        </div>

        {/* ── RELATED PRODUCTS ── */}
        {relatedProducts.length > 0 && (
          <section className="sd-related-section">
            <h3 className="sd-related-title">
              <i className="fas fa-th-large me-2 text-success"></i>
              Otros productos que te pueden interesar
            </h3>
            <div className="sd-related-grid">
              {relatedProducts.map(p => (
                <Link key={p.codigo_prod} to={`/shop/${p.codigo_prod}`} className="sd-related-card">
                  <div className="sd-related-img-wrap">
                    <img
                      src={p.img_url || '/img/Imagen1.png'}
                      alt={p.nombres}
                      onError={e => { e.target.src = '/img/Imagen1.png' }}
                    />
                  </div>
                  <div className="sd-related-info">
                    <div className="sd-related-name">{p.nombres}</div>
                    <div className="sd-related-price">${fmtCOP(p.precio)}</div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  )
}

export default ShopDetail
