import React from 'react'
import { Link } from 'react-router-dom'
import { Button } from '../components/atoms'
import { PageHeader } from '../components/organisms'
import './AboutUs.css'

/**
 * AboutUs - Página Quienes Somos
 * Información completa sobre la empresa NEW LIFE
 */
const AboutUs = () => {
  return (
    <div className="about-us-page">
      {/* Page Header */}
      <PageHeader
        items={[
          { label: 'Inicio', path: '/' },
          { label: 'Quienes Somos', path: '/about' }
        ]}
        title="¿Quienes Somos?"
        subtitle="Conoce más sobre NEW LIFE y nuestro compromiso con el medio ambiente"
      />

      {/* Main About Section */}
      <div className="container-fluid py-5">
        <div className="container">
          <div className="row g-5 align-items-center mb-5">
            <div className="col-lg-6">
              <div className="py-4">
                <h1 className="display-4 text-success mb-4">¿Quienes Somos?</h1>
                <p className="mb-4 fs-5">
                  La empresa <strong>NEW LIFE</strong> es una Distribuidora dedicada en la 
                  comercialización de productos Biodegradables creados a base de bagazo de 
                  caña de azúcar y cáscara de piña los cuales fueron creados para el reemplazo 
                  total del icopor conocido como Poliestireno expandido.
                </p>
                <p className="mb-4 fs-5">
                  Todos nuestros productos son 100% innovación y a diferencia de nuestros 
                  competidores tenemos una identidad propia porque nuestros productos son únicos, 
                  fabricados con maquinaria nacional así como la materia prima, recurso humano 
                  y desarrollo tecnológico.
                </p>
              </div>
            </div>
            <div className="col-lg-6">
              <div className="position-relative">
                <img 
                  src="/img/baner-2.jfif" 
                  className="img-fluid rounded shadow-lg" 
                  style={{ maxHeight: '400px', objectFit: 'cover', width: '100%' }}
                  alt="NEW LIFE Productos Biodegradables" 
                />
              </div>
            </div>
          </div>

          {/* Company Information Section */}
          <div className="row g-5 mb-5">
            <div className="col-lg-12">
              <div className="info-card bg-light p-5 rounded shadow-sm">
                <h2 className="text-success mb-4">
                  <i className="fas fa-building me-2"></i>
                  Información de la Empresa
                </h2>
                <div className="row g-4">
                  <div className="col-md-6">
                    <div className="d-flex align-items-center mb-3">
                      <div className="info-icon-wrapper me-3">
                        <i className="fas fa-building fa-2x text-success"></i>
                      </div>
                      <div>
                        <h5 className="mb-1">Nombre de la Empresa</h5>
                        <p className="mb-0 text-muted">Distribuidora y Comercializadora NEW LIFE</p>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="d-flex align-items-center mb-3">
                      <div className="info-icon-wrapper me-3">
                        <i className="fas fa-leaf fa-2x text-success"></i>
                      </div>
                      <div>
                        <h5 className="mb-1">Actividad de la Empresa</h5>
                        <p className="mb-0 text-muted">Distribuir y comercializar productos Biodegradables</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* History Section */}
          <div className="row g-5 mb-5">
            <div className="col-lg-12">
              <div className="info-card bg-success text-white p-5 rounded shadow-sm">
                <h2 className="mb-4 text-white">
                  <i className="fas fa-history me-2"></i>
                  Historia de la Compañía
                </h2>
                <p className="mb-4 fs-5 text-white">
                  La empresa NEW LIFE es una Distribuidora Comercializadora que se dedica en la 
                  comercialización de productos Biodegradables creados a base de bagazo de caña de 
                  azúcar y cáscara de piña los cuales fueron creados para el reemplazo total del 
                  icopor conocido como Poliestireno expandido material que ha causado mayor 
                  contaminación al medio ambiente por no ser reciclable ni reutilizable.
                </p>
                <p className="mb-4 fs-5 text-white">
                  Bajo las estadísticas colombianas, dan a conocer que cada año se generan 
                  aproximadamente <strong>1.215.000 toneladas</strong> de desperdicios, de los cuales 
                  el <strong>11% son Icopor</strong>, los cuales terminan en un bote de basura ocupando 
                  mucho espacio por su gran volumen, además este material tarda muchos años en 
                  desintegrarse, causando mucho daño al medio ambiente.
                </p>
                <p className="mb-4 fs-5 text-white">
                  Debido a esta problemática surge la idea de comercializar estos productos 
                  biodegradables, los cuales tienen múltiples beneficios tanto en satisfacción al 
                  cliente, como al medio ambiente.
                </p>
              </div>
            </div>
          </div>

          {/* Marketing Strategy Section */}
          <div className="row g-5 mb-5">
            <div className="col-lg-12">
              <div className="info-card bg-light p-5 rounded shadow-sm">
                <h2 className="text-success mb-4">
                  <i className="fas fa-bullhorn me-2"></i>
                  Estrategia de Mercadeo
                </h2>
                <p className="mb-4 fs-5">
                  La empresa para su comercialización ha utilizado diferentes métodos de publicidad 
                  para poder dar a conocer este producto, porque dentro de nuestra investigación nos 
                  pudimos dar cuenta que hay mucho desconocimiento acerca de la existencia de estos 
                  productos tanto por los establecimientos de comercialización de productos 
                  desechables como el consumidor final.
                </p>
                <p className="mb-4 fs-5">
                  Todas las estrategias que se han tomado para la comercialización varían 
                  constantemente de acuerdo a las necesidades de nuestros clientes y futuros clientes 
                  que se van generando día a día. Por esta razón la empresa tomará diferentes 
                  decisiones cada vez que se requieran para la innovación constante en nuestras 
                  estrategias publicitarias para así poder lograr un buen posicionamiento del producto 
                  en el mercado y la fidelización de nuestros clientes y futuros clientes.
                </p>
              </div>
            </div>
          </div>

          {/* Product Information Section */}
          <div className="row g-5 mb-5">
            <div className="col-lg-6">
              <div className="info-card bg-light p-5 rounded shadow-sm h-100">
                <h2 className="text-success mb-4">
                  <i className="fas fa-seedling me-2"></i>
                  Producto Biodegradable
                </h2>
                <p className="mb-4">
                  Estos productos son creados con fibras naturales como la corona de la piña y la 
                  cáscara de maíz, y bagazo de caña de azúcar, esta es la materia prima que utilizan 
                  para la fabricación de los siguientes productos:
                </p>
                <ul className="product-list list-unstyled">
                  <li className="mb-2">
                    <i className="fas fa-check text-success me-2"></i>
                    <strong>Platos</strong>
                  </li>
                  <li className="mb-2">
                    <i className="fas fa-check text-success me-2"></i>
                    <strong>Vasos</strong>
                  </li>
                  <li className="mb-2">
                    <i className="fas fa-check text-success me-2"></i>
                    <strong>Cubiertos</strong> (tenedores, cucharas, cuchillos)
                  </li>
                  <li className="mb-2">
                    <i className="fas fa-check text-success me-2"></i>
                    <strong>Recipientes</strong> para comidas rápidas
                  </li>
                </ul>
                <p className="mb-4">
                  Todos estos productos son resistentes al agua y al calor, haciéndolos competitivos 
                  reemplazables al icopor, por manejar todas las referencias utilizadas en diferentes 
                  establecimientos.
                </p>
              </div>
            </div>
            <div className="col-lg-6">
              <div className="info-card bg-success text-white p-5 rounded shadow-sm h-100">
                <h2 className="mb-4 text-white">
                  <i className="fas fa-seedling me-2"></i>
                  Semillas Germinables
                </h2>
                <p className="mb-4 text-white">
                  La fabricación de estos productos, se colocan semillas dentro de la celulosa 
                  vegetal para que en el momento de la terminación de su vida útil, este producto pasa 
                  a convertirse en semilla germinable, la cual puede ser sembrada en el lugar que se 
                  elija ya sea una matera o jardín, obteniendo una hermosa planta.
                </p>
                <p className="mb-4 text-white">
                  De esta manera concientizamos a nuestros clientes a reciclar y a darle una nueva 
                  vida a nuestro planeta y la conservación del medio ambiente.
                </p>
                <div className="text-center mt-4">
                  <i className="fas fa-seedling fa-4x mb-3 text-white"></i>
                  <h4 className="text-white fw-bold">¡Convierte tu plato en vida!</h4>
                </div>
              </div>
            </div>
          </div>

          {/* Product Characteristics Section */}
          <div className="row g-5 mb-5">
            <div className="col-lg-12">
              <div className="info-card bg-light p-5 rounded shadow-sm">
                <h2 className="text-success mb-4">
                  <i className="fas fa-list-check me-2"></i>
                  Características del Producto
                </h2>
                <div className="row g-4">
                  <div className="col-md-6">
                    <div className="d-flex align-items-start mb-3">
                      <div className="characteristic-icon me-3">
                        <i className="fas fa-leaf fa-2x text-success"></i>
                      </div>
                      <div>
                        <h5 className="mb-1">Fabricados con materia prima orgánica</h5>
                        <p className="mb-0 text-muted">Productos 100% naturales y biodegradables</p>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="d-flex align-items-start mb-3">
                      <div className="characteristic-icon me-3">
                        <i className="fas fa-seedling fa-2x text-success"></i>
                      </div>
                      <div>
                        <h5 className="mb-1">Se convierten en semillas germinables</h5>
                        <p className="mb-0 text-muted">Después de su uso se pueden plantar</p>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="d-flex align-items-start mb-3">
                      <div className="characteristic-icon me-3">
                        <i className="fas fa-globe-americas fa-2x text-success"></i>
                      </div>
                      <div>
                        <h5 className="mb-1">Ayudan en la conservación del medio ambiente</h5>
                        <p className="mb-0 text-muted">Reducen la contaminación ambiental</p>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="d-flex align-items-start mb-3">
                      <div className="characteristic-icon me-3">
                        <i className="fas fa-recycle fa-2x text-success"></i>
                      </div>
                      <div>
                        <h5 className="mb-1">Alternativa al icopor</h5>
                        <p className="mb-0 text-muted">Reemplazo total del poliestireno expandido</p>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="d-flex align-items-start mb-3">
                      <div className="characteristic-icon me-3">
                        <i className="fas fa-lightbulb fa-2x text-success"></i>
                      </div>
                      <div>
                        <h5 className="mb-1">Nueva opción para empresas</h5>
                        <p className="mb-0 text-muted">Ideal para empresas comprometidas con el medio ambiente</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Packaging Section */}
          <div className="row g-5 mb-5">
            <div className="col-lg-12">
              <div className="info-card bg-success text-white p-5 rounded shadow-sm">
                <h2 className="mb-4 text-white">
                  <i className="fas fa-box me-2"></i>
                  Empaque
                </h2>
                <p className="mb-4 fs-5 text-white">
                  Empaques fabricados en cartones y cartulinas elaboradas en papel ecológico, apta 
                  para alimentos.
                </p>
                <p className="mb-4 fs-5 text-white">
                  El tiempo de degradación es aproximadamente un año, al ser celulosa, su tiempo de 
                  descomposición es escaso. Además, si el ambiente es lluvioso y se encuentra en la 
                  superficie, su biodegradación se acelera.
                </p>
              </div>
            </div>
          </div>

          {/* Technical Specifications Section */}
          <div className="row g-5 mb-5">
            <div className="col-lg-12">
              <div className="info-card bg-light p-5 rounded shadow-sm">
                <h2 className="text-success mb-4">
                  <i className="fas fa-file-alt me-2"></i>
                  Ficha Técnica de Platos Germinables
                </h2>
                <div className="table-responsive">
                  <table className="table table-bordered table-hover">
                    <tbody>
                      <tr>
                        <td className="fw-bold bg-light">Categoría</td>
                        <td>GERMINABLES</td>
                      </tr>
                      <tr>
                        <td className="fw-bold bg-light">Subcategoría</td>
                        <td>PLATOS</td>
                      </tr>
                      <tr>
                        <td className="fw-bold bg-light">Color</td>
                        <td>Colores crudos y naturales conforme al tipo de fibra utilizada</td>
                      </tr>
                      <tr>
                        <td className="fw-bold bg-light">Material Composición</td>
                        <td>Fibras naturales (piña y maíz principalmente); lámina de Biopolímero de maíz; celulosa; semillas frutales u hortalizas</td>
                      </tr>
                      <tr>
                        <td className="fw-bold bg-light">Gramaje</td>
                        <td>Entre 250 y 350 gm/m²</td>
                      </tr>
                      <tr>
                        <td className="fw-bold bg-light">Tamaño</td>
                        <td>
                          <ul className="mb-0">
                            <li>Pequeño: 14 x 14 cm</li>
                            <li>Mediano: 14 x 20 cm</li>
                            <li>Grande: 20 x 20 cm</li>
                          </ul>
                        </td>
                      </tr>
                      <tr>
                        <td className="fw-bold bg-light">Presentación</td>
                        <td>Paquetes x 12 unidades</td>
                      </tr>
                      <tr>
                        <td className="fw-bold bg-light">Embalaje</td>
                        <td>
                          <ul className="mb-0">
                            <li>Pequeño: caja x 1.200 unidades</li>
                            <li>Mediano: caja x 1.200 unidades</li>
                            <li>Grande: caja x 600 unidades</li>
                          </ul>
                        </td>
                      </tr>
                      <tr>
                        <td className="fw-bold bg-light">Peso</td>
                        <td>
                          <ul className="mb-0">
                            <li>Pequeño: caja x 15 Kg</li>
                            <li>Mediano: caja x 21 Kg</li>
                            <li>Grande: caja x 22 Kg</li>
                          </ul>
                        </td>
                      </tr>
                      <tr>
                        <td className="fw-bold bg-light">Reciclable</td>
                        <td className="text-success fw-bold">SÍ</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                
                <div className="mt-4 p-4 bg-white rounded">
                  <h4 className="text-success mb-3">Descripción del Producto</h4>
                  <p className="mb-3">
                    Plato germinable apto para el manejo de alimentos hecho con corona de piña, 
                    cáscara de maíz, fibras naturales, celulosa vegetal y semillas.
                  </p>
                  
                  <div className="row g-3 mt-3">
                    <div className="col-md-4">
                      <div className="spec-box p-3 bg-light rounded">
                        <h6 className="text-success mb-2">
                          <i className="fas fa-recycle me-2"></i>
                          Compostable 100%
                        </h6>
                        <p className="mb-0 small">Entre 6 y 18 semanas, dependiendo de las condiciones de humedad, temperatura y luz solar.</p>
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="spec-box p-3 bg-light rounded">
                        <h6 className="text-success mb-2">
                          <i className="fas fa-seedling me-2"></i>
                          Germinables
                        </h6>
                        <p className="mb-0 small">Entre 1 y 3 semanas bajo condiciones apropiadas de humedad, temperatura y nutrientes.</p>
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="spec-box p-3 bg-light rounded">
                        <h6 className="text-success mb-2">
                          <i className="fas fa-leaf me-2"></i>
                          Alternativas de Disposición
                        </h6>
                        <p className="mb-0 small">Luego de utilizar el plato se puede sembrar en una matera o jardín. El plato desaparece y la vida germina.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Storage Section */}
          <div className="row g-5 mb-5">
            <div className="col-lg-12">
              <div className="info-card bg-light p-5 rounded shadow-sm">
                <h2 className="text-success mb-4">
                  <i className="fas fa-warehouse me-2"></i>
                  Manejo y Almacenamiento
                </h2>
                <p className="mb-4 fs-5">
                  Las cajas con el producto deben almacenarse en bodegas o almacenes techados, 
                  cerrados y bien ventilados, evitando la humedad, el sol directo y el exceso de calor.
                </p>
                <div className="row g-4">
                  <div className="col-md-4">
                    <div className="storage-card bg-success p-4 rounded shadow-sm h-100 text-white text-center">
                      <i className="fas fa-warehouse fa-3x mb-3 text-white"></i>
                      <h5 className="text-white mb-2">Almacenamiento</h5>
                      <p className="text-white mb-0">Bodegas techadas y cerradas</p>
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div className="storage-card bg-success p-4 rounded shadow-sm h-100 text-white text-center">
                      <i className="fas fa-wind fa-3x mb-3 text-white"></i>
                      <h5 className="text-white mb-2">Ventilación</h5>
                      <p className="text-white mb-0">Bien ventilados</p>
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div className="storage-card bg-success p-4 rounded shadow-sm h-100 text-white text-center">
                      <i className="fas fa-shield-alt fa-3x mb-3 text-white"></i>
                      <h5 className="text-white mb-2">Protección</h5>
                      <p className="text-white mb-0">Evitar humedad y sol directo</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* CTA Section */}
          <div className="row g-5">
            <div className="col-lg-12 text-center">
              <div className="info-card bg-success text-white p-5 rounded shadow-sm">
                <h2 className="mb-4 text-white">¿Listo para contribuir al medio ambiente?</h2>
                <p className="lead text-white mb-4">
                  Únete a nuestra misión de crear un mundo más sostenible
                </p>
                <div className="d-flex gap-3 justify-content-center flex-wrap">
                  <Link to="/shop">
                    <Button variant="light" size="lg">
                      Ver Productos
                    </Button>
                  </Link>
                  <Link to="/contact">
                    <Button variant="outline-light" size="lg">
                      Contáctanos
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AboutUs
