import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import Image from "next/image";
import { formatPrice } from "@/lib/utils";
import { AddToCartButton } from "@/components/add-to-cart-button";
import { ProductGallery } from "@/components/product-gallery";
import { Badge } from "@/components/ui/badge";

interface ProductPageProps {
  params: {
    slug: string;
  };
}

export async function generateMetadata({ params }: ProductPageProps) {
  const product = await db.product.findUnique({
    where: { slug: params.slug },
  });

  if (!product) {
    return {
      title: "Producto no encontrado",
    };
  }

  return {
    title: product.name,
    description: product.description,
    openGraph: {
      title: product.name,
      description: product.description,
      images: product.images[0] ? [product.images[0]] : [],
    },
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const product = await db.product.findUnique({
    where: {
      slug: params.slug,
      status: "PUBLISHED",
    },
    include: {
      category: true,
    },
  });

  if (!product) {
    notFound();
  }

  const hasDiscount = product.compareAtPrice && product.compareAtPrice > product.price;
  const discountPercentage = hasDiscount
    ? Math.round(((product.compareAtPrice! - product.price) / product.compareAtPrice!) * 100)
    : 0;

  return (
    <div className="container py-8">
      <div className="grid gap-8 lg:grid-cols-2">
        {/* Galería de imágenes */}
        <div>
          <ProductGallery images={product.images} name={product.name} />
        </div>

        {/* Información del producto */}
        <div className="flex flex-col gap-6">
          {product.category && (
            <p className="text-sm text-muted-foreground">
              {product.category.name}
            </p>
          )}

          <h1 className="text-4xl font-bold">{product.name}</h1>

          {product.sku && (
            <p className="text-sm text-muted-foreground">SKU: {product.sku}</p>
          )}

          <div className="flex items-baseline gap-3">
            <p className="text-3xl font-bold">
              {formatPrice(product.price)}
            </p>
            {hasDiscount && (
              <>
                <p className="text-xl text-muted-foreground line-through">
                  {formatPrice(product.compareAtPrice!)}
                </p>
                <Badge variant="destructive">-{discountPercentage}%</Badge>
              </>
            )}
          </div>

          {product.stock > 0 ? (
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-green-500" />
              <p className="text-sm text-green-600 dark:text-green-400">
                En stock ({product.stock} disponibles)
              </p>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-red-500" />
              <p className="text-sm text-red-600 dark:text-red-400">
                Sin stock
              </p>
            </div>
          )}

          {product.description && (
            <div className="prose prose-sm dark:prose-invert">
              <p>{product.description}</p>
            </div>
          )}

          {product.attributes && typeof product.attributes === 'object' && (
            <div className="rounded-2xl border p-6">
              <h3 className="mb-4 font-semibold">Características</h3>
              <dl className="grid gap-2 text-sm">
                {Object.entries(product.attributes as Record<string, any>).map(
                  ([key, value]) => (
                    <div key={key} className="flex justify-between">
                      <dt className="text-muted-foreground capitalize">
                        {key}:
                      </dt>
                      <dd className="font-medium">
                        {Array.isArray(value) ? value.join(", ") : String(value)}
                      </dd>
                    </div>
                  )
                )}
              </dl>
            </div>
          )}

          <AddToCartButton product={product} disabled={product.stock === 0} />
        </div>
      </div>
    </div>
  );
}
