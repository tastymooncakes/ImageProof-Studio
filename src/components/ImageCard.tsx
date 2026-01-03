// src/components/ImageCard.tsx
"use client";

import Link from "next/link";

interface ImageCardProps {
  id: string;
  url: string;
  index: number;
  type: "demo";
}

export default function ImageCard({ id, url, index, type }: ImageCardProps) {
  return (
    <Link
      href={`/annotate/${id}`}
      className="group relative bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-xl transition-all duration-300 aspect-square"
    >
      <div className="absolute top-3 left-3 z-10 bg-black/70 text-white text-xs font-medium px-2.5 py-1 rounded-full backdrop-blur-sm">
        #{index + 1}
      </div>

      <img
        src={url}
        alt={`Image ${id}`}
        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
      />

      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
    </Link>
  );
}
