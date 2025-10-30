"use client"

import { useState, useEffect, useRef } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { searchStreets, type Street } from "@/lib/streets-data"

interface AddressAutocompleteProps {
  city: string
  value: string
  onChange: (value: string) => void
  onStreetSelect?: (street: Street) => void
  placeholder?: string
  label?: string
}

export function AddressAutocomplete({
  city,
  value,
  onChange,
  onStreetSelect,
  placeholder = "Comienza a escribir...",
  label = "Calle"
}: AddressAutocompleteProps) {
  const [suggestions, setSuggestions] = useState<Street[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const inputRef = useRef<HTMLInputElement>(null)
  const suggestionsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!city) {
      setSuggestions([])
      return
    }

    if (value.length === 0) {
      // Mostrar calles populares cuando no hay búsqueda
      const popular = searchStreets("", city)
      setSuggestions(popular)
      return
    }

    if (value.length >= 2) {
      const results = searchStreets(value, city)
      setSuggestions(results)
    } else {
      setSuggestions([])
    }
  }, [value, city])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value)
    setShowSuggestions(true)
    setSelectedIndex(-1)
  }

  const handleSuggestionClick = (street: Street) => {
    onChange(street.name)
    setShowSuggestions(false)
    onStreetSelect?.(street)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showSuggestions || suggestions.length === 0) return

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault()
        setSelectedIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : prev
        )
        break
      case "ArrowUp":
        e.preventDefault()
        setSelectedIndex(prev => prev > 0 ? prev - 1 : -1)
        break
      case "Enter":
        e.preventDefault()
        if (selectedIndex >= 0) {
          handleSuggestionClick(suggestions[selectedIndex])
        }
        break
      case "Escape":
        setShowSuggestions(false)
        break
    }
  }

  const handleFocus = () => {
    if (suggestions.length > 0) {
      setShowSuggestions(true)
    }
  }

  const handleBlur = () => {
    // Delay para permitir click en sugerencia
    setTimeout(() => setShowSuggestions(false), 200)
  }

  return (
    <div className="space-y-2 relative">
      <Label htmlFor="street">{label}</Label>
      <Input
        id="street"
        ref={inputRef}
        type="text"
        value={value}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        onFocus={handleFocus}
        onBlur={handleBlur}
        placeholder={city ? placeholder : "Primero selecciona una ciudad"}
        disabled={!city}
        className="w-full"
        autoComplete="off"
      />
      
      {showSuggestions && suggestions.length > 0 && (
        <div
          ref={suggestionsRef}
          className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto"
        >
          {suggestions.map((street, index) => (
            <button
              key={`${street.name}-${index}`}
              type="button"
              onClick={() => handleSuggestionClick(street)}
              className={`w-full text-left px-4 py-2 hover:bg-gray-100 transition-colors ${
                index === selectedIndex ? "bg-gray-100" : ""
              }`}
            >
              <div className="font-medium">{street.name}</div>
              <div className="text-xs text-gray-500">
                {street.city}, CP {street.zipCode}
              </div>
            </button>
          ))}
        </div>
      )}

      {showSuggestions && suggestions.length === 0 && value.length >= 2 && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg p-4 text-sm text-gray-500">
          No se encontraron calles. Escribe el nombre completo.
        </div>
      )}
    </div>
  )
}
