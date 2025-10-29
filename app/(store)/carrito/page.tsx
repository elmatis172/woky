"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
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
}

export default function CarritoPage() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
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

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shipping = subtotal > 50000 ? 0 : 5000; // Envío gratis en compras mayores a $500
  const total = subtotal + shipping;

  const handleCheckout = async () => {
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
          email: "cliente@example.com", // Esto debería venir del usuario logueado
        }),
      });

      const data = await response.json();
      console.log("MP Response:", data);
      
      if (data.initPoint) {
        // Redirigir a Mercado Pago
        window.location.href = data.initPoint;
      } else {
        console.error("No se recibió initPoint:", data);
      }
    } catch (error) {
      console.error("Error al crear orden:", error);
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

        {/* Resumen */}
        <div className="lg:col-span-1">
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
                  {shipping === 0 ? (
                    <span className="text-green-600 font-semibold">¡Gratis!</span>
                  ) : (
                    formatPrice(shipping)
                  )}
                </span>
              </div>
              <Separator />
              <div className="flex justify-between text-lg font-bold">
                <span>Total</span>
                <span>{formatPrice(total)}</span>
              </div>

              {subtotal < 50000 && (
                <p className="text-xs text-muted-foreground">
                  Agregá {formatPrice(50000 - subtotal)} más para envío gratis
                </p>
              )}
            </CardContent>
            <CardFooter className="flex flex-col gap-2">
              <Button className="w-full" size="lg" onClick={handleCheckout}>
                Finalizar Compra
              </Button>
              <Button variant="outline" className="w-full" asChild>
                <Link href="/productos">Seguir Comprando</Link>
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
