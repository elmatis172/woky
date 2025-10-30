"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatPrice } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import { useRouter } from "next/navigation";

interface CartItem {
  id: string;
  name: string;
  slug: string;
  price: number;
  image: string;
  quantity: number;
  stock: number;
  weight?: number | null;
  width?: number | null;
  height?: number | null;
  length?: number | null;
}

interface ShippingOption {
  id: string;
  name: string;
  type: string;
  cost: number;
  estimatedDays: string | null;
  isMercadoEnvios: boolean;
  mercadoEnviosId?: number;
}

export default function CarritoPage() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCheckoutForm, setShowCheckoutForm] = useState(false);
  const [loadingShipping, setLoadingShipping] = useState(false);
  const [shippingOptions, setShippingOptions] = useState<ShippingOption[]>([]);
  const [selectedShipping, setSelectedShipping] = useState<ShippingOption | null>(null);
  const [shippingData, setShippingData] = useState({
    fullName: "",
    email: "",
    phone: "",
    street: "",
    number: "",
    floor: "",
    city: "",
    province: "",
    postalCode: "",
    notes: "",
  });
  const [billingData, setBillingData] = useState({
    invoiceType: "CONSUMIDOR_FINAL", // CONSUMIDOR_FINAL, RESPONSABLE_INSCRIPTO, MONOTRIBUTISTA
    taxId: "", // CUIT/CUIL/DNI
    businessName: "", // Razón Social (solo para empresas)
  });
  const router = useRouter();

  useEffect(() => {
    // Cargar carrito desde localStorage
    const savedCart = localStorage.getItem("cart");
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }
    setLoading(false);
  }, []);

  const updateCart = (newCart: CartItem[]) => {
    setCart(newCart);
    localStorage.setItem("cart", JSON.stringify(newCart));
  };

  const updateQuantity = (id: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    const updatedCart = cart.map((item) =>
      item.id === id ? { ...item, quantity: Math.min(newQuantity, item.stock) } : item
    );
    updateCart(updatedCart);
  };

  const removeItem = (id: string) => {
    const updatedCart = cart.filter((item) => item.id !== id);
    updateCart(updatedCart);
  };

  // Calcular opciones de envío cuando tenemos provincia y código postal
  const calculateShipping = async () => {
    if (!shippingData.province || !shippingData.postalCode) {
      return;
    }

    setLoadingShipping(true);
    try {
      const response = await fetch("/api/shipping/calculate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          zipCode: shippingData.postalCode,
          province: shippingData.province,
          items: cart.map((item) => ({
            productId: item.id,
            quantity: item.quantity,
            price: item.price,
            weight: item.weight,
            width: item.width,
            height: item.height,
            length: item.length,
          })),
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const allOptions = data.all || [];
        setShippingOptions(allOptions);
        
        // Auto-seleccionar el más barato si hay opciones
        if (allOptions.length > 0) {
          const cheapest = allOptions.reduce((min: ShippingOption, opt: ShippingOption) => 
            opt.cost < min.cost ? opt : min
          );
          setSelectedShipping(cheapest);
        }
      }
    } catch (error) {
      console.error("Error calculando envío:", error);
    } finally {
      setLoadingShipping(false);
    }
  };

  // Recalcular envío cuando cambia provincia o código postal
  useEffect(() => {
    if (shippingData.province && shippingData.postalCode && cart.length > 0) {
      calculateShipping();
    }
  }, [shippingData.province, shippingData.postalCode]);

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shipping = selectedShipping ? selectedShipping.cost : 0;
  const total = subtotal + shipping;

  const handleCheckout = async () => {
    // Validar que todos los campos requeridos estén completos
    if (!shippingData.fullName || !shippingData.email || !shippingData.phone || 
        !shippingData.street || !shippingData.city || !shippingData.province || !shippingData.postalCode) {
      alert("Por favor completá todos los campos de envío requeridos");
      return;
    }

    // Validar que se haya seleccionado un método de envío
    if (!selectedShipping) {
      alert("Por favor seleccioná un método de envío");
      return;
    }

    // Validar datos de facturación
    if (!billingData.taxId) {
      alert("Por favor completá el CUIT/CUIL/DNI para la facturación");
      return;
    }

    if (billingData.invoiceType !== "CONSUMIDOR_FINAL" && !billingData.businessName) {
      alert("Por favor completá la Razón Social");
      return;
    }

    // Crear orden y redirigir a Mercado Pago
    try {
      const response = await fetch("/api/mp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: cart.map((item) => ({
            productId: item.id,
            quantity: item.quantity,
          })),
          email: shippingData.email,
          shippingMethodId: selectedShipping.id,
          shippingCost: selectedShipping.cost,
          customerData: {
            fullName: shippingData.fullName,
            email: shippingData.email,
            phone: shippingData.phone,
            shippingAddress: {
              street: shippingData.street,
              number: shippingData.number,
              floor: shippingData.floor,
              city: shippingData.city,
              province: shippingData.province,
              postalCode: shippingData.postalCode,
              country: "Argentina",
            },
            billingData: {
              invoiceType: billingData.invoiceType,
              taxId: billingData.taxId,
              businessName: billingData.businessName || shippingData.fullName,
            },
            notes: shippingData.notes,
          },
        }),
      });

      const data = await response.json();
      console.log("MP Response:", data);
      
      if (data.initPoint) {
        // Limpiar carrito
        localStorage.removeItem("cart");
        // Redirigir a Mercado Pago
        window.location.href = data.initPoint;
      } else {
        console.error("No se recibió initPoint:", data);
        alert("Hubo un error al procesar tu pedido. Por favor intentá de nuevo.");
      }
    } catch (error) {
      console.error("Error al crear orden:", error);
      alert("Hubo un error al procesar tu pedido. Por favor intentá de nuevo.");
    }
  };

  if (loading) {
    return (
      <div className="container py-16">
        <p className="text-center text-muted-foreground">Cargando carrito...</p>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="container py-16">
        <Card className="mx-auto max-w-md text-center">
          <CardContent className="pt-8">
            <ShoppingBag className="mx-auto mb-4 h-16 w-16 text-muted-foreground" />
            <h2 className="mb-2 text-2xl font-bold">Tu carrito está vacío</h2>
            <p className="mb-6 text-muted-foreground">
              ¡Agrega productos para comenzar a comprar!
            </p>
            <Button asChild>
              <Link href="/productos">Ver Productos</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <h1 className="mb-8 text-3xl font-bold">Carrito de Compras</h1>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Lista de productos */}
        <div className="lg:col-span-2 space-y-4">
          {cart.map((item) => (
            <Card key={item.id}>
              <CardContent className="p-4">
                <div className="flex gap-4">
                  <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-lg">
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      className="object-cover"
                    />
                  </div>

                  <div className="flex flex-1 flex-col justify-between">
                    <div>
                      <Link
                        href={`/productos/${item.slug}`}
                        className="font-semibold hover:text-primary"
                      >
                        {item.name}
                      </Link>
                      <p className="text-sm text-muted-foreground">
                        {formatPrice(item.price)} c/u
                      </p>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <span className="w-12 text-center font-semibold">
                          {item.quantity}
                        </span>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          disabled={item.quantity >= item.stock}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>

                      <div className="flex items-center gap-4">
                        <p className="font-bold">
                          {formatPrice(item.price * item.quantity)}
                        </p>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeItem(item.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Resumen y Formulario de Envío */}
        <div className="lg:col-span-1">
          {!showCheckoutForm ? (
            // Resumen del Pedido
            <Card className="sticky top-20">
              <CardHeader>
                <CardTitle>Resumen del Pedido</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Envío</span>
                  <span>
                    {selectedShipping ? (
                      selectedShipping.cost === 0 ? (
                        <span className="text-green-600 font-semibold">¡Gratis!</span>
                      ) : (
                        formatPrice(selectedShipping.cost)
                      )
                    ) : (
                      <span className="text-gray-500">Calculá en el siguiente paso</span>
                    )}
                  </span>
                </div>
                <Separator />
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span>{formatPrice(total)}</span>
                </div>
              </CardContent>
              <CardFooter className="flex flex-col gap-2">
                <Button 
                  className="w-full" 
                  onClick={() => setShowCheckoutForm(true)}
                >
                  Continuar con el Envío
                </Button>
                <Button variant="outline" className="w-full" asChild>
                  <Link href="/productos">Seguir Comprando</Link>
                </Button>
              </CardFooter>
            </Card>
          ) : (
            // Formulario de Datos de Envío
            <Card className="sticky top-20">
              <CardHeader>
                <CardTitle>Datos de Envío</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Nombre y Apellido *</Label>
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

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="street">Calle *</Label>
                    <Input
                      id="street"
                      value={shippingData.street}
                      onChange={(e) => setShippingData({...shippingData, street: e.target.value})}
                      placeholder="Av. Corrientes"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="number">Número *</Label>
                    <Input
                      id="number"
                      value={shippingData.number}
                      onChange={(e) => setShippingData({...shippingData, number: e.target.value})}
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

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city">Ciudad *</Label>
                    <Input
                      id="city"
                      value={shippingData.city}
                      onChange={(e) => setShippingData({...shippingData, city: e.target.value})}
                      placeholder="CABA"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="province">Provincia *</Label>
                    <Input
                      id="province"
                      value={shippingData.province}
                      onChange={(e) => setShippingData({...shippingData, province: e.target.value})}
                      placeholder="Buenos Aires"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="postalCode">Código Postal *</Label>
                  <Input
                    id="postalCode"
                    value={shippingData.postalCode}
                    onChange={(e) => setShippingData({...shippingData, postalCode: e.target.value})}
                    placeholder="C1043"
                    required
                  />
                </div>

                {/* Métodos de Envío */}
                {shippingData.province && shippingData.postalCode && (
                  <div className="space-y-3">
                    <Label>Método de Envío *</Label>
                    
                    {loadingShipping && (
                      <div className="text-sm text-muted-foreground">
                        Calculando opciones de envío...
                      </div>
                    )}

                    {!loadingShipping && shippingOptions.length === 0 && (
                      <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-3 text-sm text-yellow-800">
                        No hay métodos de envío disponibles para tu zona. Por favor contactanos.
                      </div>
                    )}

                    {!loadingShipping && shippingOptions.length > 0 && (
                      <div className="space-y-2">
                        {shippingOptions.map((option) => (
                          <label
                            key={option.id}
                            className={`flex items-center justify-between rounded-lg border p-3 cursor-pointer transition-colors ${
                              selectedShipping?.id === option.id
                                ? "border-primary bg-primary/5"
                                : "border-gray-200 hover:border-gray-300"
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <input
                                type="radio"
                                name="shipping"
                                value={option.id}
                                checked={selectedShipping?.id === option.id}
                                onChange={() => setSelectedShipping(option)}
                                className="h-4 w-4"
                              />
                              <div>
                                <p className="font-medium">{option.name}</p>
                                {option.estimatedDays && (
                                  <p className="text-xs text-muted-foreground">
                                    {option.estimatedDays}
                                  </p>
                                )}
                                {option.isMercadoEnvios && (
                                  <p className="text-xs text-blue-600">
                                    📦 Mercado Envíos
                                  </p>
                                )}
                              </div>
                            </div>
                            <p className="font-semibold">
                              {option.cost === 0 ? "GRATIS" : formatPrice(option.cost)}
                            </p>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="notes">Notas (opcional)</Label>
                  <Input
                    id="notes"
                    value={shippingData.notes}
                    onChange={(e) => setShippingData({...shippingData, notes: e.target.value})}
                    placeholder="Instrucciones de entrega..."
                  />
                </div>

                <Separator />

                {/* Datos de Facturación */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg">Datos de Facturación</h3>
                  
                  <div className="space-y-2">
                    <Label htmlFor="invoiceType">Tipo de Factura *</Label>
                    <select
                      id="invoiceType"
                      value={billingData.invoiceType}
                      onChange={(e) => setBillingData({...billingData, invoiceType: e.target.value})}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                      required
                    >
                      <option value="CONSUMIDOR_FINAL">Consumidor Final</option>
                      <option value="RESPONSABLE_INSCRIPTO">Responsable Inscripto</option>
                      <option value="MONOTRIBUTISTA">Monotributista</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="taxId">
                      {billingData.invoiceType === "CONSUMIDOR_FINAL" ? "DNI *" : "CUIT/CUIL *"}
                    </Label>
                    <Input
                      id="taxId"
                      value={billingData.taxId}
                      onChange={(e) => setBillingData({...billingData, taxId: e.target.value})}
                      placeholder={billingData.invoiceType === "CONSUMIDOR_FINAL" ? "12345678" : "20-12345678-9"}
                      required
                    />
                  </div>

                  {billingData.invoiceType !== "CONSUMIDOR_FINAL" && (
                    <div className="space-y-2">
                      <Label htmlFor="businessName">Razón Social *</Label>
                      <Input
                        id="businessName"
                        value={billingData.businessName}
                        onChange={(e) => setBillingData({...billingData, businessName: e.target.value})}
                        placeholder="Nombre de la empresa"
                        required
                      />
                    </div>
                  )}
                </div>

                <Separator />
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>{formatPrice(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Envío</span>
                    <span>
                      {selectedShipping ? (
                        selectedShipping.cost === 0 ? (
                          <span className="text-green-600 font-semibold">¡Gratis!</span>
                        ) : (
                          formatPrice(selectedShipping.cost)
                        )
                      ) : (
                        <span className="text-gray-500">A calcular</span>
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span>{formatPrice(total)}</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex flex-col gap-2">
                <Button 
                  className="w-full" 
                  onClick={handleCheckout}
                >
                  Finalizar Compra
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full" 
                  onClick={() => setShowCheckoutForm(false)}
                >
                  Volver
                </Button>
              </CardFooter>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
