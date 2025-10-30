"use client";

import { Button } from "@/components/ui/button";
import { ShoppingCart, Plus, Minus } from "lucide-react";
import { useState } from "react";
import { toast } from "@/hooks/use-toast";

interface AddToCartButtonProps {
  product: {
    id: string;
    name: string;
    slug: string;
    price: number;
    stock: number;
    images: any; // Puede ser string o array
    weight?: number | null;
    width?: number | null;
    height?: number | null;
    length?: number | null;
  };
  disabled?: boolean;
}

export function AddToCartButton({ product, disabled }: AddToCartButtonProps) {
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);
  
  // Parsear imágenes
  const parseImages = (images: any): string[] => {
    if (!images) return ["/placeholder.png"];
    if (Array.isArray(images)) return images;
    if (typeof images === "string") {
      try {
        const parsed = JSON.parse(images);
        return Array.isArray(parsed) ? parsed : ["/placeholder.png"];
      } catch {
        return ["/placeholder.png"];
      }
    }
    return ["/placeholder.png"];
  };

  const handleAddToCart = async () => {
    setIsAdding(true);

    // Aquí implementarías la lógica de agregar al carrito
    // Por ahora usamos localStorage
    try {
      const cart = JSON.parse(localStorage.getItem("cart") || "[]");
      const existingItem = cart.find((item: any) => item.id === product.id);

      if (existingItem) {
        // Validar que no exceda el stock
        const newQuantity = existingItem.quantity + quantity;
        if (newQuantity > product.stock) {
          toast({
            title: "Stock insuficiente",
            description: `Solo hay ${product.stock} unidades disponibles`,
            variant: "destructive",
          });
          setIsAdding(false);
          return;
        }
        existingItem.quantity = newQuantity;
      } else {
        const images = parseImages(product.images);
        cart.push({
          id: product.id,
          name: product.name,
          slug: product.slug,
          price: product.price,
          image: images[0] || "/placeholder.png",
          quantity,
          stock: product.stock,
          weight: product.weight,
          width: product.width,
          height: product.height,
          length: product.length,
        });
      }

      localStorage.setItem("cart", JSON.stringify(cart));

      toast({
        title: "Agregado al carrito",
        description: `${quantity}x ${product.name}`,
      });
      
      // Disparar evento para actualizar el contador del carrito
      window.dispatchEvent(new Event('cartUpdated'));
      
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo agregar al carrito",
        variant: "destructive",
      });
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-4">
        <span className="text-sm font-medium">Cantidad:</span>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setQuantity(Math.max(1, quantity - 1))}
            disabled={quantity <= 1}
          >
            <Minus className="h-4 w-4" />
          </Button>
          <span className="w-12 text-center font-semibold">{quantity}</span>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
            disabled={quantity >= product.stock}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <Button
        size="lg"
        onClick={handleAddToCart}
        disabled={disabled || isAdding}
        className="w-full"
      >
        <ShoppingCart className="mr-2 h-5 w-5" />
        {isAdding ? "Agregando..." : "Agregar al carrito"}
      </Button>
    </div>
  );
}
