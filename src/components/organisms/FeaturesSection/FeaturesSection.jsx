import React from 'react'
import './FeaturesSection.css'

/**
 * FeaturesSection - Organismo
 * Sección de características del negocio
 */
const FeaturesSection = () => {
  const features = [
    {
      icon: 'fas fa-shipping-fast',
      title: 'Envío Gratis',
      description: 'En pedidos superiores a $100.000'
    },
    {
      icon: 'fas fa-shield-alt',
      title: 'Pago Seguro',
      description: '100% garantía de pago seguro'
    },
    {
      icon: 'fas fa-certificate',
      title: '30 Días Garantía',
      description: 'Garantía de 30 días'
    },
    {
      icon: 'fas fa-headset',
      title: 'Soporte 24/7',
      description: 'Soporte rápido siempre'
    }
  ]

  return (
    <div className="features-section">
      <div className="container">
        <div className="row g-4">
          {features.map((feature, index) => (
            <div key={index} className="col-lg-3 col-md-6">
              <div className="feature-card">
                <div className="feature-icon">
                  <i className={feature.icon}></i>
                </div>
                <h5 className="feature-title">{feature.title}</h5>
                <p className="feature-description">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default FeaturesSection

