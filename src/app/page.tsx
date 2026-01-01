// src/app/page.tsx

import Link from "next/link";
import { Settings } from "lucide-react";
import { preloadedImages } from "@/data/preloadedImages";

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">
              ImageProof Studio
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              Professional image verification and annotation
            </p>
          </div>
          <Link
            href="/settings"
            className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
          >
            <Settings size={18} />
            <span>Settings</span>
          </Link>
        </div>
      </header>

      {/* Image Grid */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {preloadedImages.map((image, index) => (
            <Link
              key={image.id}
              href={`/annotate/${image.id}`}
              className="group relative bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-xl transition-all duration-300 aspect-square"
            >
              {/* Image Number Badge */}
              <div className="absolute top-3 left-3 z-10 bg-black/70 text-white text-xs font-medium px-2.5 py-1 rounded-full backdrop-blur-sm">
                #{index + 1}
              </div>

              {/* Image */}
              <img
                src={image.url}
                alt={`Image ${image.id}`}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />

              {/* Hover Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
