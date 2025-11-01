"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

export interface ProductVariant {
  id: string;
  size: string;
  stock: number;
  price: number | null;
  sku: string | null;
}

interface SizeSelectorProps {
  variants: ProductVariant[];
  basePrice: number;
  selectedVariant: ProductVariant | null;
  onVariantChange: (variant: ProductVariant) => void;
}

export function SizeSelector({
  variants,
  basePrice,
  selectedVariant,
  onVariantChange,
}: SizeSelectorProps) {
  if (!variants || variants.length === 0) {
    return null;
  }

  const getVariantPrice = (variant: ProductVariant) => {
    return variant.price !== null ? variant.price : basePrice;
  };

  return (
    <div className="space-y-4">
      <div>
        <Label className="text-base font-semibold">Selecciona tu talle</Label>
        {selectedVariant && (
          <p className="text-sm text-muted-foreground mt-1">
            Talle seleccionado: <span className="font-semibold">{selectedVariant.size}</span>
          </p>
        )}
      </div>

      <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
        {variants.map((variant) => {
          const isSelected = selectedVariant?.id === variant.id;
          const isOutOfStock = variant.stock === 0;
          const hasCustomPrice = variant.price !== null && variant.price !== basePrice;

          return (
            <div key={variant.id} className="relative">
              <Button
                type="button"
                variant={isSelected ? "default" : "outline"}
                className={cn(
                  "w-full h-14 flex flex-col items-center justify-center p-2",
                  isOutOfStock && "opacity-50 cursor-not-allowed",
                  !isOutOfStock && !isSelected && "hover:border-primary"
                )}
                onClick={() => !isOutOfStock && onVariantChange(variant)}
                disabled={isOutOfStock}
              >
                <span className="text-base font-semibold">{variant.size}</span>
                {hasCustomPrice && !isOutOfStock && (
                  <span className="text-xs text-muted-foreground mt-0.5">
                    +${((getVariantPrice(variant) - basePrice) / 100).toFixed(0)}
                  </span>
                )}
              </Button>
              
              {isOutOfStock && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="h-0.5 w-full bg-destructive rotate-[-45deg]" />
                </div>
              )}
              
              {!isOutOfStock && variant.stock <= 5 && (
                <Badge 
                  variant="destructive" 
                  className="absolute -top-2 -right-2 text-xs px-1.5 py-0"
                >
                  {variant.stock}
                </Badge>
              )}
            </div>
          );
        })}
      </div>

      {/* Información de stock del talle seleccionado */}
      {selectedVariant && (
        <div className="flex items-center gap-2 text-sm">
          {selectedVariant.stock > 10 ? (
            <>
              <div className="h-2 w-2 rounded-full bg-green-500" />
              <p className="text-green-600 dark:text-green-400">
                Stock disponible ({selectedVariant.stock} unidades)
              </p>
            </>
          ) : selectedVariant.stock > 0 ? (
            <>
              <div className="h-2 w-2 rounded-full bg-yellow-500" />
              <p className="text-yellow-600 dark:text-yellow-400">
                ¡Últimas {selectedVariant.stock} unidades!
              </p>
            </>
          ) : (
            <>
              <div className="h-2 w-2 rounded-full bg-red-500" />
              <p className="text-red-600 dark:text-red-400">
                Sin stock
              </p>
            </>
          )}
        </div>
      )}

      {/* Advertencia si no hay talle seleccionado */}
      {!selectedVariant && (
        <p className="text-sm text-muted-foreground border-l-4 border-primary pl-3">
          Por favor selecciona un talle para continuar
        </p>
      )}
    </div>
  );
}
