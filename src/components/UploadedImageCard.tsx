// src/components/UploadedImageCard.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { imageStorage } from "@/lib/imageStorage";
import { useLazyLoad } from "@/hooks/useLazyLoad";

interface UploadedImageCardProps {
  id: string;
  name: string;
  uploadedAt: string;
  onDelete: (id: string) => void;
}

export default function UploadedImageCard({
  id,
  name,
  uploadedAt,
  onDelete,
}: UploadedImageCardProps) {
  const { ref, isVisible } = useLazyLoad();
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Only load image when visible
    if (!isVisible) return;

    let mounted = true;
    let objectUrl: string | null = null;

    async function loadImage() {
      setLoading(true);
      try {
        const url = await imageStorage.getImage(id);
        if (mounted && url) {
          objectUrl = url;
          setImageUrl(url);
        }
      } catch (error) {
        console.error("Failed to load image:", error);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadImage();

    return () => {
      mounted = false;
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [id, isVisible]);

  return (
    <div
      ref={ref}
      className="group relative bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-xl transition-all duration-300 aspect-square"
    >
      {loading || !isVisible ? (
        <div className="w-full h-full flex items-center justify-center bg-gray-100">
          <div className="w-8 h-8 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
        </div>
      ) : !imageUrl ? (
        <div className="w-full h-full flex items-center justify-center bg-gray-100">
          <p className="text-gray-400 text-sm">Failed to load</p>
        </div>
      ) : (
        <>
          <Link href={`/annotate/${id}`} className="block w-full h-full">
            <img
              src={imageUrl}
              alt={name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />

            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <div className="absolute bottom-3 left-3 right-3">
                <p className="text-white text-sm font-medium truncate">
                  {name}
                </p>
                <p className="text-white/80 text-xs">
                  {new Date(uploadedAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          </Link>

          <button
            onClick={(e) => {
              e.preventDefault();
              onDelete(id);
            }}
            className="absolute top-3 right-3 z-10 w-7 h-7 flex items-center justify-center bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
            title="Delete image"
          >
            <span className="text-sm font-bold">×</span>
          </button>
        </>
      )}
    </div>
  );
}
