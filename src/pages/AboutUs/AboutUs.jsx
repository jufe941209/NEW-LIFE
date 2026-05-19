import React from 'react'
import { Link } from 'react-router-dom'
import { Button } from '../../components/atoms'
import { PageHeader } from '../../components/organisms'
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
