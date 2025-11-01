"use client";

import { useState } from "react";
import { SizeSelector, ProductVariant } from "@/components/size-selector";
import { AddToCartButton } from "@/components/add-to-cart-button";
import { formatPrice } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface ProductActionsProps {
  product: {
    id: string;
    name: string;
    slug: string;
    price: number;
    stock: number;
    images: any;
    weight?: number | null;
    width?: number | null;
    height?: number | null;
    length?: number | null;
  };
  variants: ProductVariant[];
}

export function ProductActions({ product, variants }: ProductActionsProps) {
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);

  // Si hay variantes, usar el precio de la variante seleccionada
  const displayPrice = selectedVariant?.price ?? product.price;
  const hasVariants = variants && variants.length > 0;

  return (
    <div className="space-y-6">
      {/* Precio */}
      <div className="flex items-baseline gap-3">
        <p className="text-3xl font-bold">
          {formatPrice(displayPrice)}
        </p>
        {selectedVariant?.price && selectedVariant.price !== product.price && (
          <Badge variant="secondary">
            Precio especial para talle {selectedVariant.size}
          </Badge>
        )}
      </div>

      {/* Selector de talles si hay variantes */}
      {hasVariants && (
        <SizeSelector
          variants={variants}
          basePrice={product.price}
          selectedVariant={selectedVariant}
          onVariantChange={setSelectedVariant}
        />
      )}

      {/* Stock info si NO hay variantes */}
      {!hasVariants && product.stock > 0 ? (
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-green-500" />
          <p className="text-sm text-green-600 dark:text-green-400">
            En stock ({product.stock} disponibles)
          </p>
        </div>
      ) : !hasVariants && product.stock === 0 ? (
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-red-500" />
          <p className="text-sm text-red-600 dark:text-red-400">
            Sin stock
          </p>
        </div>
      ) : null}

      {/* Botón agregar al carrito */}
      <AddToCartButton
        product={product}
        selectedVariant={selectedVariant}
        disabled={hasVariants ? !selectedVariant || selectedVariant.stock === 0 : product.stock === 0}
        requiresVariant={hasVariants}
      />
    </div>
  );
}
