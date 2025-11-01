"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Plus, Trash2, GripVertical } from "lucide-react";

export interface ProductVariant {
  id?: string;
  size: string;
  sku: string;
  stock: number;
  price: number | null; // null = usa el precio del producto
  sortOrder: number;
  isActive: boolean;
}

interface ProductVariantsFormProps {
  variants: ProductVariant[];
  basePrice: number; // Precio base del producto en pesos
  onVariantsChange: (variants: ProductVariant[]) => void;
  disabled?: boolean;
}

export function ProductVariantsForm({
  variants,
  basePrice,
  onVariantsChange,
  disabled = false
}: ProductVariantsFormProps) {
  const [newSize, setNewSize] = useState("");

  // Talles predefinidos comunes
  const commonSizes = {
    "Ropa Adulto": ["XS", "S", "M", "L", "XL", "XXL"],
    "Ropa Niños": ["2", "4", "6", "8", "10", "12", "14", "16"],
    "Calzado": ["35", "36", "37", "38", "39", "40", "41", "42", "43", "44"],
  };

  const addVariant = (size: string) => {
    if (!size.trim() || variants.some(v => v.size === size)) return;

    const newVariant: ProductVariant = {
      size: size.trim(),
      sku: "",
      stock: 0,
      price: null, // Usa el precio base por defecto
      sortOrder: variants.length,
      isActive: true,
    };

    onVariantsChange([...variants, newVariant]);
    setNewSize("");
  };

  const removeVariant = (index: number) => {
    const updated = variants.filter((_, i) => i !== index);
    onVariantsChange(updated);
  };

  const updateVariant = (index: number, field: keyof ProductVariant, value: any) => {
    const updated = [...variants];
    updated[index] = { ...updated[index], [field]: value };
    onVariantsChange(updated);
  };

  const moveVariant = (index: number, direction: "up" | "down") => {
    if (
      (direction === "up" && index === 0) ||
      (direction === "down" && index === variants.length - 1)
    ) {
      return;
    }

    const updated = [...variants];
    const newIndex = direction === "up" ? index - 1 : index + 1;
    [updated[index], updated[newIndex]] = [updated[newIndex], updated[index]];
    
    // Actualizar sortOrder
    updated.forEach((v, i) => {
      v.sortOrder = i;
    });

    onVariantsChange(updated);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label className="text-lg font-semibold">Talles / Variantes</Label>
        <span className="text-sm text-muted-foreground">
          {variants.length} talle{variants.length !== 1 ? "s" : ""} configurado{variants.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Talles predefinidos */}
      <div className="space-y-2">
        <Label className="text-sm text-muted-foreground">Agregar talles rápidos:</Label>
        <div className="flex flex-wrap gap-2">
          {Object.entries(commonSizes).map(([category, sizes]) => (
            <div key={category} className="flex flex-wrap gap-1">
              <span className="text-xs text-muted-foreground w-full">{category}:</span>
              {sizes.map((size) => (
                <Button
                  key={size}
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => addVariant(size)}
                  disabled={disabled || variants.some(v => v.size === size)}
                  className="h-7 text-xs"
                >
                  {size}
                </Button>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Agregar talle personalizado */}
      <div className="flex gap-2">
        <div className="flex-1">
          <Input
            type="text"
            placeholder="Talle personalizado (ej: M/L, 38-40, etc.)"
            value={newSize}
            onChange={(e) => setNewSize(e.target.value.toUpperCase())}
            onKeyPress={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addVariant(newSize);
              }
            }}
            disabled={disabled}
          />
        </div>
        <Button
          type="button"
          onClick={() => addVariant(newSize)}
          disabled={disabled || !newSize.trim()}
        >
          <Plus className="h-4 w-4 mr-1" />
          Agregar
        </Button>
      </div>

      {/* Lista de variantes */}
      {variants.length > 0 && (
        <div className="space-y-3">
          {variants.map((variant, index) => (
            <Card key={index} className="p-4">
              <div className="space-y-4">
                {/* Header con talle y acciones */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="flex flex-col gap-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => moveVariant(index, "up")}
                        disabled={disabled || index === 0}
                        className="h-4 w-6 p-0"
                      >
                        ▲
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => moveVariant(index, "down")}
                        disabled={disabled || index === variants.length - 1}
                        className="h-4 w-6 p-0"
                      >
                        ▼
                      </Button>
                    </div>
                    <span className="text-lg font-semibold">Talle {variant.size}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-2">
                      <Label htmlFor={`active-${index}`} className="text-sm">
                        Activo
                      </Label>
                      <Switch
                        id={`active-${index}`}
                        checked={variant.isActive}
                        onCheckedChange={(checked) => updateVariant(index, "isActive", checked)}
                        disabled={disabled}
                      />
                    </div>
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={() => removeVariant(index)}
                      disabled={disabled}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Campos de la variante */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor={`sku-${index}`}>SKU (opcional)</Label>
                    <Input
                      id={`sku-${index}`}
                      type="text"
                      value={variant.sku}
                      onChange={(e) => updateVariant(index, "sku", e.target.value)}
                      placeholder="SKU-001-M"
                      disabled={disabled}
                    />
                  </div>

                  <div>
                    <Label htmlFor={`stock-${index}`}>Stock *</Label>
                    <Input
                      id={`stock-${index}`}
                      type="number"
                      min="0"
                      value={variant.stock}
                      onChange={(e) => updateVariant(index, "stock", parseInt(e.target.value) || 0)}
                      disabled={disabled}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor={`price-${index}`}>
                      Precio (dejar vacío para usar ${basePrice.toFixed(2)})
                    </Label>
                    <Input
                      id={`price-${index}`}
                      type="number"
                      min="0"
                      step="0.01"
                      value={variant.price || ""}
                      onChange={(e) => updateVariant(index, "price", e.target.value ? parseFloat(e.target.value) : null)}
                      placeholder={basePrice.toFixed(2)}
                      disabled={disabled}
                    />
                  </div>
                </div>

                {/* Info de precio efectivo */}
                <div className="text-sm text-muted-foreground">
                  Precio final: ${(variant.price || basePrice).toFixed(2)} | Stock: {variant.stock} unidades
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {variants.length === 0 && (
        <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg">
          <p>No hay talles configurados</p>
          <p className="text-sm">Agrega talles usando los botones de arriba</p>
        </div>
      )}

      {/* Información adicional */}
      <div className="bg-muted/50 rounded-lg p-3 space-y-1 text-sm">
        <p className="font-medium">💡 Información sobre talles:</p>
        <ul className="list-disc list-inside space-y-1 text-muted-foreground">
          <li>Cada talle tiene su propio stock independiente</li>
          <li>Podés configurar un precio diferente por talle (opcional)</li>
          <li>Desactiva talles sin eliminarlos para ocultarlos temporalmente</li>
          <li>Usa las flechas para ordenar cómo se muestran los talles</li>
        </ul>
      </div>
    </div>
  );
}
