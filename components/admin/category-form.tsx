"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface CategoryFormData {
  name: string;
  slug: string;
  description: string | null;
  image: string | null;
}

interface CategoryFormProps {
  category?: Partial<CategoryFormData> & { id?: string };
  isEdit?: boolean;
}

export function CategoryForm({ category, isEdit = false }: CategoryFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState<CategoryFormData>({
    name: category?.name || "",
    slug: category?.slug || "",
    description: category?.description || null,
    image: category?.image || null,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const url = isEdit && category?.id 
        ? `/api/admin/categories/${category.id}` 
        : '/api/admin/categories';
      
      const method = isEdit ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Error al guardar la categoría');
      }

      router.push("/admin/categorias");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al guardar la categoría");
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
        setFormData({ ...formData, image: base64String });
        setUploadingImage(false);
        // Resetear el input
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

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  const removeImage = () => {
    setFormData({ ...formData, image: null });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-xl font-semibold mb-4">Información de la Categoría</h2>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="name">Nombre *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleNameChange(e.target.value)}
              required
              placeholder="Ej: Ropa de Niños"
            />
          </div>

          <div>
            <Label htmlFor="slug">URL Amigable (Slug) *</Label>
            <Input
              id="slug"
              value={formData.slug}
              onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
              required
              placeholder="ropa-de-ninos"
            />
            <p className="text-sm text-gray-500 mt-1">
              Vista previa: /productos?categoria={formData.slug || "..."}
            </p>
          </div>

          <div>
            <Label htmlFor="description">Descripción</Label>
            <Textarea
              id="description"
              value={formData.description || ""}
              onChange={(e) => setFormData({ ...formData, description: e.target.value || null })}
              rows={3}
              placeholder="Descripción de la categoría..."
            />
          </div>
        </div>
      </div>

      {/* Imagen de Categoría */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-xl font-semibold mb-4">Imagen de Categoría</h2>
        
        <div className="space-y-4">
          {/* Input file oculto */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            className="hidden"
          />

          {/* Preview de imagen o botón de carga */}
          {formData.image ? (
            <div className="space-y-3">
              <div className="relative w-full max-w-md">
                <img
                  src={formData.image}
                  alt="Preview"
                  className="w-full h-48 object-cover rounded-lg border border-gray-200 dark:border-gray-700"
                />
                <button
                  type="button"
                  onClick={removeImage}
                  className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-2 hover:bg-red-600 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <button
                type="button"
                onClick={openFileDialog}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-sm"
              >
                Cambiar Imagen
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={openFileDialog}
              disabled={uploadingImage}
              className="w-full max-w-md px-6 py-8 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-blue-500 dark:hover:border-blue-400 transition-colors flex flex-col items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {uploadingImage ? (
                <>
                  <svg className="animate-spin h-8 w-8 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span className="text-sm text-gray-600 dark:text-gray-400">Subiendo imagen...</span>
                </>
              ) : (
                <>
                  <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <div className="text-center">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Click para subir imagen
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      JPG, PNG, GIF hasta 5MB
                    </p>
                  </div>
                </>
              )}
            </button>
          )}

          <p className="text-sm text-gray-500 dark:text-gray-400">
            Esta imagen se mostrará en la página de categorías y filtros
          </p>
        </div>
      </div>

      {/* Botones de Acción - Sticky al fondo */}
      <div className="sticky bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 pt-6 pb-6 -mx-6 px-6 -mb-6 mt-6 z-10">
        <div className="flex justify-end gap-4">
          <button
            type="button"
            onClick={() => router.push("/admin/categorias")}
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
              isEdit ? "💾 Actualizar Categoría" : "✨ Crear Categoría"
            )}
          </button>
        </div>
      </div>
    </form>
  );
}
