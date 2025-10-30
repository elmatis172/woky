"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AddressAutocomplete } from "@/components/address-autocomplete"
import { provinces, getLocationsByProvince, getZipCodeForLocation } from "@/lib/argentina-locations"
import type { Street } from "@/lib/streets-data"
import { Check } from "lucide-react"
import { popularStreets } from "@/lib/streets-data"

interface ShippingData {
  fullName: string
  email: string
  phone: string
  street: string
  number: string
  floor: string
  city: string
  province: string
  postalCode: string
  notes: string
}

interface ShippingFormProps {
  shippingData: ShippingData
  setShippingData: (data: ShippingData) => void
  onShippingReset?: () => void
}

export function ShippingForm({ shippingData, setShippingData, onShippingReset }: ShippingFormProps) {
  const [streetVerified, setStreetVerified] = useState(false)

  return (
    <div className="space-y-4">
      {/* Datos Personales */}
      <div className="space-y-2">
        <Label htmlFor="fullName">Nombre Completo *</Label>
        <Input
          id="fullName"
          value={shippingData.fullName}
          onChange={(e) => setShippingData({...shippingData, fullName: e.target.value})}
          placeholder="Juan Pérez"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email *</Label>
        <Input
          id="email"
          type="email"
          value={shippingData.email}
          onChange={(e) => setShippingData({...shippingData, email: e.target.value})}
          placeholder="tu@email.com"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="phone">Teléfono *</Label>
        <Input
          id="phone"
          type="tel"
          value={shippingData.phone}
          onChange={(e) => setShippingData({...shippingData, phone: e.target.value})}
          placeholder="11 1234-5678"
          required
        />
      </div>

      {/* Dirección - Paso 1: Provincia */}
      <div className="space-y-2">
        <Label htmlFor="province">Provincia *</Label>
        <Select
          value={shippingData.province}
          onValueChange={(value: string) => {
            setShippingData({
              ...shippingData,
              province: value,
              city: "",
              postalCode: "",
              street: "",
              number: ""
            })
            setStreetVerified(false)
            onShippingReset?.()
          }}
        >
          <SelectTrigger>
            <SelectValue placeholder="Seleccioná tu provincia" />
          </SelectTrigger>
          <SelectContent className="max-h-[300px]">
            {provinces.map((prov) => (
              <SelectItem key={prov.code} value={prov.name}>
                {prov.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Dirección - Paso 2: Localidad */}
      {shippingData.province && (
        <div className="space-y-2">
          <Label htmlFor="city">Localidad *</Label>
          <Select
            value={shippingData.city}
            onValueChange={(value: string) => {
              const zipCode = getZipCodeForLocation(shippingData.province, value)
              setShippingData({
                ...shippingData,
                city: value,
                postalCode: zipCode || "",
                street: "",
                number: ""
              })
              setStreetVerified(false)
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Seleccioná tu localidad" />
            </SelectTrigger>
            <SelectContent className="max-h-[300px]">
              {getLocationsByProvince(shippingData.province).map((loc) => (
                <SelectItem key={loc.name} value={loc.name}>
                  {loc.name} ({loc.zipCode})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Dirección - Paso 3: Código Postal */}
      {shippingData.city && (
        <div className="space-y-2">
          <Label htmlFor="postalCode">Código Postal *</Label>
          <Input
            id="postalCode"
            value={shippingData.postalCode}
            onChange={(e) => setShippingData({...shippingData, postalCode: e.target.value})}
            placeholder="1234"
            required
          />
          <p className="text-xs text-muted-foreground">
            Si el código postal no es correcto, podés modificarlo manualmente
          </p>
        </div>
      )}

      {/* Dirección - Paso 4: Calle y Número */}
      {shippingData.city && (
        <>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <AddressAutocomplete
                city={shippingData.city}
                value={shippingData.street}
                onChange={(value) => {
                  setShippingData({...shippingData, street: value})
                  // Verificar si la calle está en la base de datos
                  const isVerified = popularStreets[shippingData.city]?.some(
                    s => s.name.toLowerCase() === value.toLowerCase()
                  )
                  setStreetVerified(isVerified)
                }}
                onStreetSelect={(street: Street) => {
                  setShippingData({
                    ...shippingData,
                    street: street.name,
                  })
                  setStreetVerified(true)
                }}
                placeholder="Comienza a escribir el nombre de la calle..."
                label="Calle *"
              />
              {streetVerified && (
                <p className="text-xs text-green-600 flex items-center gap-1 mt-1">
                  <Check className="w-3 h-3" />
                  Calle verificada en base de datos
                </p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="number">Número *</Label>
              <Input
                id="number"
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                value={shippingData.number}
                onChange={(e) => {
                  // Solo permitir números
                  const value = e.target.value.replace(/\D/g, '')
                  setShippingData({...shippingData, number: value})
                }}
                placeholder="1234"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="floor">Piso/Depto (opcional)</Label>
            <Input
              id="floor"
              value={shippingData.floor}
              onChange={(e) => setShippingData({...shippingData, floor: e.target.value})}
              placeholder="5° A"
            />
          </div>
        </>
      )}

      {/* Notas adicionales */}
      <div className="space-y-2">
        <Label htmlFor="notes">Notas para el envío (opcional)</Label>
        <Input
          id="notes"
          value={shippingData.notes}
          onChange={(e) => setShippingData({...shippingData, notes: e.target.value})}
          placeholder="Ej: Tocar timbre 2 veces"
        />
      </div>

      {/* Información visual */}
      {shippingData.street && shippingData.number && shippingData.city && (
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-3 text-sm">
          <p className="font-semibold text-blue-900 mb-1">Dirección de envío:</p>
          <p className="text-blue-800">
            {shippingData.street} {shippingData.number}
            {shippingData.floor && `, ${shippingData.floor}`}
            <br />
            {shippingData.city}, {shippingData.province} (CP: {shippingData.postalCode})
          </p>
        </div>
      )}
    </div>
  )
}
