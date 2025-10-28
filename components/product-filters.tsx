"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useState } from "react";

interface Category {
  id: string;
  name: string;
  slug: string;
}

export function ProductFilters({ categories }: { categories: Category[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [minPrice, setMinPrice] = useState(searchParams.get("min") || "");
  const [maxPrice, setMaxPrice] = useState(searchParams.get("max") || "");

  const selectedCategory = searchParams.get("cat");
  const sortBy = searchParams.get("sort") || "newest";

  const updateFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.push(`/productos?${params.toString()}`);
  };

  const applyPriceFilter = () => {
    const params = new URLSearchParams(searchParams.toString());
    if (minPrice) params.set("min", minPrice);
    else params.delete("min");
    if (maxPrice) params.set("max", maxPrice);
    else params.delete("max");
    router.push(`/productos?${params.toString()}`);
  };

  const clearFilters = () => {
    router.push("/productos");
    setMinPrice("");
    setMaxPrice("");
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="mb-3 font-semibold">Categorías</h3>
        <div className="space-y-2">
          <Button
            variant={!selectedCategory ? "default" : "ghost"}
            className="w-full justify-start"
            onClick={() => updateFilter("cat", "")}
          >
            Todas
          </Button>
          {categories.map((category) => (
            <Button
              key={category.id}
              variant={selectedCategory === category.id ? "default" : "ghost"}
              className="w-full justify-start"
              onClick={() => updateFilter("cat", category.id)}
            >
              {category.name}
            </Button>
          ))}
        </div>
      </div>

      <Separator />

      <div>
        <h3 className="mb-3 font-semibold">Precio</h3>
        <div className="space-y-3">
          <div>
            <Label htmlFor="min">Mínimo</Label>
            <Input
              id="min"
              type="number"
              placeholder="$ 0"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="max">Máximo</Label>
            <Input
              id="max"
              type="number"
              placeholder="$ 999999"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
            />
          </div>
          <Button onClick={applyPriceFilter} className="w-full">
            Aplicar
          </Button>
        </div>
      </div>

      <Separator />

      <div>
        <h3 className="mb-3 font-semibold">Ordenar por</h3>
        <div className="space-y-2">
          <Button
            variant={sortBy === "newest" ? "default" : "ghost"}
            className="w-full justify-start"
            onClick={() => updateFilter("sort", "newest")}
          >
            Más reciente
          </Button>
          <Button
            variant={sortBy === "price-asc" ? "default" : "ghost"}
            className="w-full justify-start"
            onClick={() => updateFilter("sort", "price-asc")}
          >
            Precio: menor a mayor
          </Button>
          <Button
            variant={sortBy === "price-desc" ? "default" : "ghost"}
            className="w-full justify-start"
            onClick={() => updateFilter("sort", "price-desc")}
          >
            Precio: mayor a menor
          </Button>
          <Button
            variant={sortBy === "name" ? "default" : "ghost"}
            className="w-full justify-start"
            onClick={() => updateFilter("sort", "name")}
          >
            Nombre A-Z
          </Button>
        </div>
      </div>

      <Button variant="outline" className="w-full" onClick={clearFilters}>
        Limpiar filtros
      </Button>
    </div>
  );
}
