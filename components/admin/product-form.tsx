"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface ProductFormData {
  name: string;
  slug: string;
  description: string;
  price: number;
  compareAtPrice: number | null;
  sku: string;
  stock: number;
  images: string[];
  categoryId: string;
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  featured: boolean;
  tags: string[];
  seoTitle: string | null;
  seoDescription: string | null;
}

interface ProductFormProps {
  product?: Partial<ProductFormData>;
  categories: Array<{ id: string; name: string }>;
  onSubmit: (data: ProductFormData) => Promise<void>;
  isEdit?: boolean;
}

export function ProductForm({ product, categories, onSubmit, isEdit = false }: ProductFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState<ProductFormData>({
    name: product?.name || "",
    slug: product?.slug || "",
    description: product?.description || "",
    price: product?.price || 0,
    compareAtPrice: product?.compareAtPrice || null,
    sku: product?.sku || "",
    stock: product?.stock || 0,
    images: product?.images || [],
    categoryId: product?.categoryId || "",
    status: product?.status || "DRAFT",
    featured: product?.featured || false,
    tags: product?.tags || [],
    seoTitle: product?.seoTitle || null,
    seoDescription: product?.seoDescription || null,
  });

  const [imageUrl, setImageUrl] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await onSubmit(formData);
      router.push("/admin/productos");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al guardar el producto");
    } finally {
      setLoading(false);
    }
  };

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  };

  const handleNameChange = (name: string) => {
    setFormData({ ...formData, name });
    if (!isEdit) {
      setFormData(prev => ({ ...prev, slug: generateSlug(name) }));
    }
  };

  const addImage = () => {
    if (imageUrl && !formData.images.includes(imageUrl)) {
      setFormData({ ...formData, images: [...formData.images, imageUrl] });
      setImageUrl("");
    }
  };

  const removeImage = (index: number) => {
    setFormData({
      ...formData,
      images: formData.images.filter((_, i) => i !== index),
    });
  };

  const calculateDiscount = () => {
    if (formData.compareAtPrice && formData.compareAtPrice > formData.price) {
      return Math.round(((formData.compareAtPrice - formData.price) / formData.compareAtPrice) * 100);
    }
    return 0;
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Información Básica */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-xl font-semibold mb-4">Información Básica</h2>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="name">Nombre del Producto *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleNameChange(e.target.value)}
              required
              placeholder="Ej: Remera Estampada Niños"
            />
          </div>

          <div>
            <Label htmlFor="slug">URL Amigable (Slug) *</Label>
            <Input
              id="slug"
              value={formData.slug}
              onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
              required
              placeholder="remera-estampada-ninos"
            />
            <p className="text-sm text-gray-500 mt-1">
              Vista previa: /productos/{formData.slug || "..."}
            </p>
          </div>

          <div>
            <Label htmlFor="description">Descripción</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={4}
              placeholder="Descripción detallada del producto..."
            />
          </div>

          <div>
            <Label htmlFor="category">Categoría *</Label>
            <select
              id="category"
              value={formData.categoryId}
              onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
              required
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <option value="">Selecciona una categoría</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Precios y Stock */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-xl font-semibold mb-4">Precios y Stock</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="price">Precio *</Label>
            <Input
              id="price"
              type="number"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
              required
              min="0"
              step="0.01"
              placeholder="0.00"
            />
          </div>

          <div>
            <Label htmlFor="compareAtPrice">Precio de Comparación (Descuento)</Label>
            <Input
              id="compareAtPrice"
              type="number"
              value={formData.compareAtPrice || ""}
              onChange={(e) => setFormData({ ...formData, compareAtPrice: e.target.value ? Number(e.target.value) : null })}
              min="0"
              step="0.01"
              placeholder="0.00"
            />
            {calculateDiscount() > 0 && (
              <p className="text-sm text-green-600 dark:text-green-400 mt-1">
                Descuento: {calculateDiscount()}% OFF
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="sku">SKU (Código)</Label>
            <Input
              id="sku"
              value={formData.sku}
              onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
              placeholder="WKY-001"
            />
          </div>

          <div>
            <Label htmlFor="stock">Stock Disponible *</Label>
            <Input
              id="stock"
              type="number"
              value={formData.stock}
              onChange={(e) => setFormData({ ...formData, stock: Number(e.target.value) })}
              required
              min="0"
              placeholder="0"
            />
          </div>
        </div>
      </div>

      {/* Imágenes */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-xl font-semibold mb-4">Imágenes del Producto</h2>
        
        <div className="space-y-4">
          <div className="flex gap-2">
            <Input
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="URL de la imagen (Unsplash, Imgur, etc.)"
            />
            <button
              type="button"
              onClick={addImage}
              className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-800"
            >
              Agregar
            </button>
          </div>

          {formData.images.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {formData.images.map((img, index) => (
                <div key={index} className="relative group">
                  <img
                    src={img}
                    alt={`Imagen ${index + 1}`}
                    className="w-full h-32 object-cover rounded-lg border border-gray-200 dark:border-gray-700"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                  {index === 0 && (
                    <span className="absolute bottom-2 left-2 bg-blue-500 text-white text-xs px-2 py-1 rounded">
                      Principal
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Configuración */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-xl font-semibold mb-4">Configuración</h2>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="status">Estado *</Label>
            <select
              id="status"
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <option value="DRAFT">Borrador</option>
              <option value="PUBLISHED">Publicado</option>
              <option value="ARCHIVED">Archivado</option>
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="featured"
              checked={formData.featured}
              onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
              className="h-4 w-4 rounded border-gray-300"
            />
            <Label htmlFor="featured" className="cursor-pointer">
              ⭐ Marcar como producto destacado
            </Label>
          </div>
        </div>
      </div>

      {/* SEO */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-xl font-semibold mb-4">SEO (Opcional)</h2>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="seoTitle">Título SEO</Label>
            <Input
              id="seoTitle"
              value={formData.seoTitle || ""}
              onChange={(e) => setFormData({ ...formData, seoTitle: e.target.value || null })}
              placeholder={formData.name || "Título para motores de búsqueda"}
              maxLength={60}
            />
            <p className="text-sm text-gray-500 mt-1">
              {(formData.seoTitle || formData.name || "").length}/60 caracteres
            </p>
          </div>

          <div>
            <Label htmlFor="seoDescription">Descripción SEO</Label>
            <Textarea
              id="seoDescription"
              value={formData.seoDescription || ""}
              onChange={(e) => setFormData({ ...formData, seoDescription: e.target.value || null })}
              rows={3}
              placeholder="Descripción para motores de búsqueda..."
              maxLength={160}
            />
            <p className="text-sm text-gray-500 mt-1">
              {(formData.seoDescription || "").length}/160 caracteres
            </p>
          </div>
        </div>
      </div>

      {/* Botones de Acción */}
      <div className="flex justify-end gap-4">
        <button
          type="button"
          onClick={() => router.push("/admin/productos")}
          disabled={loading}
          className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-800 disabled:opacity-50"
        >
          Cancelar
        </button>
        <Button type="submit" disabled={loading}>
          {loading ? "Guardando..." : isEdit ? "Actualizar Producto" : "Crear Producto"}
        </Button>
      </div>
    </form>
  );
}
