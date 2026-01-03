// src/components/UploadsTab.tsx
"use client";

import { UploadedImage } from "@/types";
import ImageUpload from "./ImageUpload";
import UploadedImageCard from "./UploadedImageCard";

interface UploadsTabProps {
  uploadedImages: UploadedImage[];
  loading: boolean;
  onImageUploaded: (imageId: string, imageName: string) => void;
  onDeleteImage: (imageId: string) => void;
}

export default function UploadsTab({
  uploadedImages,
  loading,
  onImageUploaded,
  onDeleteImage,
}: UploadsTabProps) {
  return (
    <div>
      <p className="text-sm text-gray-600 mb-6">
        Upload your own images to analyze. Images are stored locally in your
        browser for privacy.
      </p>

      {/* Upload Area */}
      <div className="mb-8">
        <ImageUpload onImageUploaded={onImageUploaded} />
      </div>

      {/* Uploaded Images Grid */}
      {loading ? (
        <div className="text-center py-12">
          <div className="w-8 h-8 mx-auto border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin mb-4" />
          <p className="text-gray-500">Loading your images...</p>
        </div>
      ) : uploadedImages.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <p className="text-lg font-medium mb-2">No images uploaded yet</p>
          <p className="text-sm">Upload an image above to get started</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {uploadedImages.map((image) => (
            <UploadedImageCard
              key={image.id}
              id={image.id}
              name={image.name}
              uploadedAt={image.uploadedAt}
              onDelete={onDeleteImage}
            />
          ))}
        </div>
      )}
    </div>
  );
}
