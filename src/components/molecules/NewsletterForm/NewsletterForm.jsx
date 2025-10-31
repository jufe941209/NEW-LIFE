import React, { useState } from 'react'
import { Input, Button } from '../../atoms'
import './NewsletterForm.css'

/**
 * NewsletterForm - Molécula
 * Formulario de suscripción al newsletter
 */
const NewsletterForm = ({ 
  onSubscribe,
  className = '' 
}) => {
  const [email, setEmail] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    if (onSubscribe && email.trim()) {
      onSubscribe(email.trim())
      setEmail('')
    }
  }

  return (
    <form 
      className={`footer-newsletter-section ${className}`}
      onSubmit={handleSubmit}
    >
      <div className="newsletter-input-container">
        <div className="newsletter-input-wrapper">
          <i className="fas fa-envelope newsletter-icon" />
          <input
            type="email"
            className="form-control newsletter-input"
            placeholder="Tu email aquí"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
      </div>
      <Button 
        type="submit"
        variant="success"
        className="newsletter-button"
      >
        Suscribirse
      </Button>
    </form>
  )
}

export default NewsletterForm

