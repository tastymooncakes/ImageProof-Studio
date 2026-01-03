// src/components/DemoImagesTab.tsx
"use client";

import { preloadedImages } from "@/data/preloadedImages";
import ImageCard from "./ImageCard";

export default function DemoImagesTab() {
  return (
    <div>
      <p className="text-sm text-gray-600 mb-6">
        Try the tool with pre-loaded AI-generated images. Perfect for exploring
        features before uploading your own.
      </p>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {preloadedImages.map((image, index) => (
          <ImageCard
            key={image.id}
            id={image.id}
            url={image.url}
            index={index}
            type="demo"
          />
        ))}
      </div>
    </div>
  );
}
