import React, { useState } from 'react'
import { Input, Button } from '../../atoms'
import './SearchBar.css'

/**
 * SearchBar - Molécula
 * Barra de búsqueda con input y botón
 */
const SearchBar = ({ 
  onSearch, 
  placeholder = 'Buscar productos biodegradables...',
  className = '' 
}) => {
  const [searchTerm, setSearchTerm] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    if (onSearch && searchTerm.trim()) {
      onSearch(searchTerm.trim())
    }
  }

  return (
    <form 
      className={`search-section ${className}`}
      onSubmit={handleSubmit}
    >
      <div className="search-input-container">
        <div className="input-wrapper">
          <i className="fas fa-search search-icon" />
          <input
            type="text"
            className="form-control search-input"
            placeholder={placeholder}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>
      <div className="search-button-container">
        <Button 
          type="submit"
          variant="success"
          className="search-button"
        >
          Buscar
        </Button>
      </div>
    </form>
  )
}

export default SearchBar

