import Link from "next/link";
import { Card } from "@/components/ui/card";

interface Category {
  id: string;
  name: string;
  slug: string;
  image: string | null;
}

export function CategoriesGrid({ categories }: { categories: Category[] }) {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {categories.map((category) => (
        <Link key={category.id} href={`/productos?cat=${category.id}`}>
          <Card className="group overflow-hidden transition-all hover:shadow-lg">
            <div className="aspect-square overflow-hidden bg-muted">
              {category.image ? (
                <img
                  src={category.image}
                  alt={category.name}
                  className="h-full w-full object-cover transition-transform group-hover:scale-105"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-4xl">
                  📦
                </div>
              )}
            </div>
            <div className="p-4">
              <h3 className="text-center font-semibold">{category.name}</h3>
            </div>
          </Card>
        </Link>
      ))}
    </div>
  );
}
