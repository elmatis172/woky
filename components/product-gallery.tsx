"use client";

import { useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface ProductGalleryProps {
  images: string;  // JSON string
  name: string;
}

export function ProductGallery({ images: imagesString, name }: ProductGalleryProps) {
  const [selectedImage, setSelectedImage] = useState(0);
  const images = JSON.parse(imagesString || "[]");

  if (!images || images.length === 0) {
    return (
      <div className="aspect-square rounded-2xl bg-muted flex items-center justify-center">
        <p className="text-6xl">📦</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Imagen principal */}
      <div className="relative aspect-square overflow-hidden rounded-2xl bg-muted">
        <Image
          src={images[selectedImage]}
          alt={`${name} - Imagen ${selectedImage + 1}`}
          fill
          className="object-cover"
          priority
          sizes="(max-width: 768px) 100vw, 50vw"
        />
      </div>

      {/* Miniaturas */}
      {images.length > 1 && (
        <div className="grid grid-cols-4 gap-4">
          {images.map((image: string, index: number) => (
            <button
              key={index}
              onClick={() => setSelectedImage(index)}
              className={cn(
                "relative aspect-square overflow-hidden rounded-lg border-2 transition-all",
                selectedImage === index
                  ? "border-primary"
                  : "border-transparent hover:border-muted-foreground"
              )}
            >
              <Image
                src={image}
                alt={`${name} - Miniatura ${index + 1}`}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 25vw, 12vw"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
