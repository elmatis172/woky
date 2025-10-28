import Link from "next/link";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatPrice, calculateDiscount } from "@/lib/utils";
import Image from "next/image";

interface ProductCardProps {
  product: {
    id: string;
    name: string;
    slug: string;
    price: number;
    compareAtPrice: number | null;
    images: string;  // JSON string
    stock: number;
    featured?: boolean;
  };
}

export function ProductCard({ product }: ProductCardProps) {
  const hasDiscount =
    product.compareAtPrice && product.compareAtPrice > product.price;
  const discount = hasDiscount
    ? calculateDiscount(product.compareAtPrice!, product.price)
    : 0;

  const images = JSON.parse(product.images || "[]");

  return (
    <Link href={`/productos/${product.slug}`}>
      <Card className="group overflow-hidden transition-all hover:shadow-lg">
        <div className="relative aspect-square overflow-hidden bg-muted">
          {images[0] ? (
            <Image
              src={images[0]}
              alt={product.name}
              fill
              className="object-cover transition-transform group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-4xl">
              📦
            </div>
          )}
          {hasDiscount && (
            <Badge
              variant="destructive"
              className="absolute right-2 top-2"
            >
              -{discount}%
            </Badge>
          )}
          {product.featured && (
            <Badge className="absolute left-2 top-2">
              Destacado
            </Badge>
          )}
          {product.stock === 0 && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50">
              <Badge variant="secondary">Sin stock</Badge>
            </div>
          )}
        </div>
        <CardContent className="p-4">
          <h3 className="line-clamp-2 font-semibold group-hover:text-primary">
            {product.name}
          </h3>
        </CardContent>
        <CardFooter className="flex items-baseline gap-2 p-4 pt-0">
          <p className="text-xl font-bold">{formatPrice(product.price)}</p>
          {hasDiscount && (
            <p className="text-sm text-muted-foreground line-through">
              {formatPrice(product.compareAtPrice!)}
            </p>
          )}
        </CardFooter>
      </Card>
    </Link>
  );
}
