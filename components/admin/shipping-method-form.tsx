"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

type ShippingMethodType = "STANDARD" | "EXPRESS" | "PICKUP" | "FREE";

interface ShippingMethod {
  id: string;
  name: string;
  description: string | null;
  type: ShippingMethodType;
  cost: number;
  estimatedDays: string | null;
  isActive: boolean;
  provinces: string | null;
  minAmount: number | null;
  maxAmount: number | null;
}

interface ShippingMethodFormProps {
  shippingMethod?: ShippingMethod;
}

const PROVINCES = [
  "Buenos Aires",
  "CABA",
  "Catamarca",
  "Chaco",
  "Chubut",
  "Córdoba",
  "Corrientes",
  "Entre Ríos",
  "Formosa",
  "Jujuy",
  "La Pampa",
  "La Rioja",
  "Mendoza",
  "Misiones",
  "Neuquén",
  "Río Negro",
  "Salta",
  "San Juan",
  "San Luis",
  "Santa Cruz",
  "Santa Fe",
  "Santiago del Estero",
  "Tierra del Fuego",
  "Tucumán",
];

export function ShippingMethodForm({ shippingMethod }: ShippingMethodFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    name: shippingMethod?.name || "",
    description: shippingMethod?.description || "",
    type: shippingMethod?.type || ("STANDARD" as ShippingMethodType),
    cost: shippingMethod?.cost ? shippingMethod.cost / 100 : 0,
    estimatedDays: shippingMethod?.estimatedDays || "",
    isActive: shippingMethod?.isActive ?? true,
    provinces: shippingMethod?.provinces
      ? (JSON.parse(shippingMethod.provinces) as string[])
      : ([] as string[]),
    minAmount: shippingMethod?.minAmount ? shippingMethod.minAmount / 100 : 0,
    maxAmount: shippingMethod?.maxAmount ? shippingMethod.maxAmount / 100 : 0,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      const payload = {
        name: formData.name,
        description: formData.description || null,
        type: formData.type,
        cost: Math.round(formData.cost * 100), // Convertir a centavos
        estimatedDays: formData.estimatedDays || null,
        isActive: formData.isActive,
        provinces:
          formData.provinces.length > 0
            ? JSON.stringify(formData.provinces)
            : null,
        minAmount: formData.minAmount > 0 ? Math.round(formData.minAmount * 100) : null,
        maxAmount: formData.maxAmount > 0 ? Math.round(formData.maxAmount * 100) : null,
      };

      const url = shippingMethod
        ? `/api/admin/shipping-methods/${shippingMethod.id}`
        : "/api/admin/shipping-methods";

      const method = shippingMethod ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Error al guardar el método de envío");
      }

      alert(
        shippingMethod
          ? "Método de envío actualizado correctamente"
          : "Método de envío creado correctamente"
      );
      router.push("/admin/envios");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleProvince = (province: string) => {
    setFormData((prev) => ({
      ...prev,
      provinces: prev.provinces.includes(province)
        ? prev.provinces.filter((p: string) => p !== province)
        : [...prev.provinces, province],
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Información Básica</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="name">Nombre *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              placeholder="Ej: Envío Express CABA"
              required
            />
          </div>

          <div>
            <Label htmlFor="description">Descripción</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="Descripción del método de envío"
              rows={3}
            />
          </div>

          <div>
            <Label htmlFor="type">Tipo *</Label>
            <Select
              value={formData.type}
              onValueChange={(value: ShippingMethodType) =>
                setFormData({ ...formData, type: value })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="STANDARD">Estándar</SelectItem>
                <SelectItem value="EXPRESS">Express</SelectItem>
                <SelectItem value="PICKUP">Retiro en Sucursal</SelectItem>
                <SelectItem value="FREE">Envío Gratis</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="cost">Costo (ARS) *</Label>
              <Input
                id="cost"
                type="number"
                min="0"
                step="0.01"
                value={formData.cost}
                onChange={(e) =>
                  setFormData({ ...formData, cost: parseFloat(e.target.value) || 0 })
                }
                required
              />
            </div>

            <div>
              <Label htmlFor="estimatedDays">Tiempo Estimado</Label>
              <Input
                id="estimatedDays"
                value={formData.estimatedDays}
                onChange={(e) =>
                  setFormData({ ...formData, estimatedDays: e.target.value })
                }
                placeholder="Ej: 24-48 horas"
              />
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="isActive"
              checked={formData.isActive}
              onCheckedChange={(checked: boolean) =>
                setFormData({ ...formData, isActive: checked })
              }
            />
            <Label htmlFor="isActive">Método activo</Label>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Restricciones</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="minAmount">Monto Mínimo (ARS)</Label>
              <Input
                id="minAmount"
                type="number"
                min="0"
                step="0.01"
                value={formData.minAmount}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    minAmount: parseFloat(e.target.value) || 0,
                  })
                }
                placeholder="0 = sin mínimo"
              />
            </div>

            <div>
              <Label htmlFor="maxAmount">Monto Máximo (ARS)</Label>
              <Input
                id="maxAmount"
                type="number"
                min="0"
                step="0.01"
                value={formData.maxAmount}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    maxAmount: parseFloat(e.target.value) || 0,
                  })
                }
                placeholder="0 = sin máximo"
              />
            </div>
          </div>

          <div>
            <Label>Provincias Disponibles</Label>
            <p className="text-sm text-muted-foreground mb-2">
              Dejá vacío para aplicar a todas las provincias
            </p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-60 overflow-y-auto p-2 border rounded-md">
              {PROVINCES.map((province) => (
                <div key={province} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id={province}
                    checked={formData.provinces.includes(province)}
                    onChange={() => toggleProvince(province)}
                    className="rounded"
                  />
                  <label
                    htmlFor={province}
                    className="text-sm cursor-pointer"
                  >
                    {province}
                  </label>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {error && (
        <div className="p-4 bg-destructive/10 text-destructive rounded-md">
          {error}
        </div>
      )}

      <div className="flex gap-4">
        <Button
          type="submit"
          disabled={isSubmitting}
          className="flex-1"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Guardando...
            </>
          ) : (
            <>{shippingMethod ? "Actualizar" : "Crear"} Método</>
          )}
        </Button>

        <Button
          type="button"
          onClick={() => router.push("/admin/envios")}
          disabled={isSubmitting}
          className="border"
        >
          Cancelar
        </Button>
      </div>
    </form>
  );
}
