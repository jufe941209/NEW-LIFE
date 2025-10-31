import React, { useState, useEffect } from 'react'
import { SearchBar } from '../../molecules'
import './HeroSlider.css'

/**
 * HeroSlider - Organismo
 * Carrusel hero con búsqueda integrada
 */
const HeroSlider = ({ onSearch }) => {
  const [currentSlide, setCurrentSlide] = useState(0)

  const slides = [
    {
      id: 1,
      image: '/img/slide1.jfif',
      title: '100% Productos Biodegradables',
      subtitle: 'Distribuidora y Comercializadora NEW LIFE',
      description: 'Productos biodegradables creados a base de bagazo de caña de azúcar y cáscara de piña. Una alternativa eco-friendly al icopor que ayuda a conservar el medio ambiente.'
    },
    {
      id: 2,
      image: '/img/slide2.jfif',
      title: 'Nuestros productos se descomponen naturalmente',
      subtitle: 'En solo 90 días',
      description: 'Nuestros productos se descomponen naturalmente en 90 días, convirtiéndose en nutrientes para el suelo.'
    }
  ]

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length)
    }, 5000) // Cambia cada 5 segundos

    return () => clearInterval(interval)
  }, [slides.length])

  const goToSlide = (index) => {
    setCurrentSlide(index)
  }

  const goToPrevious = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)
  }

  const goToNext = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length)
  }

  return (
    <div className="hero-slider">
      {slides.map((slide, index) => (
        <div
          key={slide.id}
          className={`hero-slide ${index === currentSlide ? 'active' : ''}`}
          style={{ backgroundImage: `url(${slide.image})` }}
        >
          <div className="hero-overlay"></div>
          <div className="container">
            <div className="row align-items-center min-vh-100">
              <div className="col-lg-6">
                <div className="hero-content">
                  <h1 className="hero-title">{slide.title}</h1>
                  <h2 className="hero-subtitle">{slide.subtitle}</h2>
                  <p className="hero-description">{slide.description}</p>
                  
                  {/* Search Bar en el hero */}
                  {index === 0 && (
                    <div className="hero-search mt-4">
                      <SearchBar 
                        onSearch={onSearch}
                        placeholder="Buscar productos biodegradables..."
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* Navigation Buttons */}
      <button 
        className="hero-nav-btn hero-nav-prev" 
        onClick={goToPrevious}
        aria-label="Anterior"
      >
        <i className="fas fa-chevron-left"></i>
      </button>
      <button 
        className="hero-nav-btn hero-nav-next" 
        onClick={goToNext}
        aria-label="Siguiente"
      >
        <i className="fas fa-chevron-right"></i>
      </button>

      {/* Slide Indicators */}
      <div className="hero-indicators">
        {slides.map((_, index) => (
          <button
            key={index}
            className={`hero-indicator ${index === currentSlide ? 'active' : ''}`}
            onClick={() => goToSlide(index)}
            aria-label={`Ir a slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  )
}

export default HeroSlider

