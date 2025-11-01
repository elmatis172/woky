"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { ProductVariantsForm, type ProductVariant } from "@/components/admin/product-variants-form";

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
  // Campos para Mercado Envíos
  weight: number | null;
  width: number | null;
  height: number | null;
  length: number | null;
  // Variantes (talles)
  hasVariants: boolean;
  variants: ProductVariant[];
}

interface ProductFormProps {
  product?: Partial<ProductFormData> & { id?: string };
  categories: Array<{ id: string; name: string }>;
  isEdit?: boolean;
}

export function ProductForm({ product, categories, isEdit = false }: ProductFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Parsear imágenes si vienen como string
  const parseImages = (images: any): string[] => {
    if (Array.isArray(images)) return images;
    if (typeof images === "string") {
      try {
        const parsed = JSON.parse(images);
        return Array.isArray(parsed) ? parsed : [];
      } catch {
        return [];
      }
    }
    return [];
  };
  
  const [formData, setFormData] = useState<ProductFormData>({
    name: product?.name || "",
    slug: product?.slug || "",
    description: product?.description || "",
    // Convertir de centavos a pesos para mostrar en el formulario
    price: product?.price ? product.price / 100 : 0,
    compareAtPrice: product?.compareAtPrice ? product.compareAtPrice / 100 : null,
    sku: product?.sku || "",
    stock: product?.stock || 0,
    images: parseImages(product?.images),
    categoryId: product?.categoryId || "",
    status: product?.status || "DRAFT",
    featured: product?.featured || false,
    tags: product?.tags || [],
    seoTitle: product?.seoTitle || null,
    seoDescription: product?.seoDescription || null,
    // Campos para Mercado Envíos
    weight: product?.weight || null,
    width: product?.width || null,
    height: product?.height || null,
    length: product?.length || null,
    // Variantes
    hasVariants: product?.hasVariants || false,
    variants: product?.variants || [],
  });

  const [imageUrl, setImageUrl] = useState("");
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const url = isEdit && product?.id 
        ? `/api/admin/products/${product.id}` 
        : '/api/admin/products';
      
      const method = isEdit ? 'PUT' : 'POST';
      
      // Convertir precios de pesos a centavos antes de enviar
      const dataToSend = {
        ...formData,
        price: Math.round(formData.price * 100),
        compareAtPrice: formData.compareAtPrice ? Math.round(formData.compareAtPrice * 100) : null,
        // Asegurar que las dimensiones sean números o null (no 0)
        weight: formData.weight || null,
        width: formData.width || null,
        height: formData.height || null,
        length: formData.length || null,
      };
      
      console.log("📦 Datos a enviar:", dataToSend);
      console.log("📐 Dimensiones:", {
        weight: dataToSend.weight,
        width: dataToSend.width,
        height: dataToSend.height,
        length: dataToSend.length
      });
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataToSend),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Error al guardar el producto');
      }

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

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar tipo de archivo
    if (!file.type.startsWith('image/')) {
      alert('Por favor seleccioná un archivo de imagen válido');
      return;
    }

    // Validar tamaño (máximo 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('La imagen es muy grande. El tamaño máximo es 5MB');
      return;
    }

    setUploadingImage(true);

    try {
      // Convertir a base64
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        if (!formData.images.includes(base64String)) {
          setFormData({ 
            ...formData, 
            images: [...formData.images, base64String] 
          });
        }
        setUploadingImage(false);
        // Resetear el input para poder subir el mismo archivo de nuevo
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      };
      reader.onerror = () => {
        alert('Error al leer el archivo');
        setUploadingImage(false);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      alert('Error al cargar la imagen');
      setUploadingImage(false);
    }
  };

  const addImage = () => {
    if (!imageUrl.trim()) {
      alert("Por favor ingresá una URL de imagen");
      return;
    }
    
    if (formData.images.includes(imageUrl)) {
      alert("Esta imagen ya fue agregada");
      return;
    }
    
    setFormData({ ...formData, images: [...formData.images, imageUrl.trim()] });
    setImageUrl("");
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
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

      {/* Dimensiones y Peso para Mercado Envíos */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-xl font-semibold mb-4">📦 Dimensiones y Peso</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          Necesario para calcular costos de envío con Mercado Envíos. Si no completás estos datos, 
          solo estarán disponibles los métodos de envío locales.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="weight">Peso (gramos)</Label>
            <Input
              id="weight"
              type="number"
              value={formData.weight || ""}
              onChange={(e) => setFormData({ ...formData, weight: e.target.value ? Number(e.target.value) : null })}
              min="0"
              placeholder="Ej: 250"
            />
            <p className="text-xs text-gray-500 mt-1">Peso del producto en gramos</p>
          </div>

          <div>
            <Label htmlFor="width">Ancho (cm)</Label>
            <Input
              id="width"
              type="number"
              value={formData.width || ""}
              onChange={(e) => setFormData({ ...formData, width: e.target.value ? Number(e.target.value) : null })}
              min="0"
              step="0.1"
              placeholder="Ej: 25"
            />
            <p className="text-xs text-gray-500 mt-1">Ancho del paquete</p>
          </div>

          <div>
            <Label htmlFor="height">Alto (cm)</Label>
            <Input
              id="height"
              type="number"
              value={formData.height || ""}
              onChange={(e) => setFormData({ ...formData, height: e.target.value ? Number(e.target.value) : null })}
              min="0"
              step="0.1"
              placeholder="Ej: 5"
            />
            <p className="text-xs text-gray-500 mt-1">Alto del paquete</p>
          </div>

          <div>
            <Label htmlFor="length">Largo (cm)</Label>
            <Input
              id="length"
              type="number"
              value={formData.length || ""}
              onChange={(e) => setFormData({ ...formData, length: e.target.value ? Number(e.target.value) : null })}
              min="0"
              step="0.1"
              placeholder="Ej: 30"
            />
            <p className="text-xs text-gray-500 mt-1">Largo del paquete</p>
          </div>
        </div>

        {formData.weight && formData.width && formData.height && formData.length && (
          <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
            <p className="text-sm text-green-700 dark:text-green-400">
              ✓ Dimensiones completas: Este producto podrá usar Mercado Envíos
            </p>
          </div>
        )}
      </div>


      {/* Variantes (Talles) */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-semibold">👕 Variantes y Talles</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Agregá talles a tu producto para gestionar stock por cada uno
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Label htmlFor="hasVariants" className="text-sm font-medium">
              Tiene talles
            </Label>
            <Switch
              id="hasVariants"
              checked={formData.hasVariants}
              onCheckedChange={(checked) => {
                setFormData({ ...formData, hasVariants: checked });
                if (!checked) {
                  setFormData(prev => ({ ...prev, variants: [] }));
                }
              }}
            />
          </div>
        </div>

        {formData.hasVariants && (
          <ProductVariantsForm
            variants={formData.variants}
            onChange={(variants) => setFormData({ ...formData, variants })}
          />
        )}

        {!formData.hasVariants && (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <p>Activá "Tiene talles" para gestionar variantes de este producto</p>
          </div>
        )}
      </div>
      {/* Imágenes */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-xl font-semibold mb-4">Imágenes del Producto</h2>
        
        <div className="space-y-4">
          {/* Input file oculto */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            className="hidden"
          />

          {/* Botones de carga */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              type="button"
              onClick={openFileDialog}
              disabled={uploadingImage}
              className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 transition-colors font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {uploadingImage ? (
                <>
                  <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Subiendo...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Subir desde Computadora
                </>
              )}
            </button>
            
            <div className="flex-1 flex gap-2">
              <Input
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="O pegá una URL de imagen"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addImage();
                  }
                }}
              />
              <button
                type="button"
                onClick={addImage}
                className="px-6 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 dark:bg-gray-500 dark:hover:bg-gray-600 transition-colors whitespace-nowrap font-medium"
              >
                Agregar URL
              </button>
            </div>
          </div>

          <p className="text-sm text-gray-500 dark:text-gray-400">
            Podés subir imágenes desde tu computadora (máx. 5MB) o pegar URLs de servicios como Unsplash o Imgur
          </p>

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

      {/* Botones de Acción - Sticky al fondo */}
      <div className="sticky bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 pt-6 pb-6 -mx-6 px-6 -mb-6 mt-6 z-10">
        <div className="flex justify-end gap-4">
          <button
            type="button"
            onClick={() => router.push("/admin/productos")}
            disabled={loading}
            className="px-6 py-3 border border-gray-300 rounded-md hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-800 disabled:opacity-50 font-medium transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-8 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Guardando...
              </span>
            ) : (
              isEdit ? "💾 Actualizar Producto" : "✨ Crear Producto"
            )}
          </button>
        </div>
      </div>
    </form>
  );
}
