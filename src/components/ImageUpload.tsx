// src/components/ImageUpload.tsx
"use client";

import { useRef, useState } from "react";
import { Upload, X } from "lucide-react";

interface ImageUploadProps {
  onImageUploaded: (imageId: string, imageName: string) => void;
}

export default function ImageUpload({ onImageUploaded }: ImageUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    // Validate file type
    if (!file.type.startsWith("image/")) {
      alert("Please upload an image file (PNG, JPG, WEBP)");
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      alert("Image must be smaller than 10MB");
      return;
    }

    setUploading(true);

    try {
      const { imageStorage } = await import("@/lib/imageStorage");
      const imageId = `upload-${Date.now()}`;

      await imageStorage.saveImage(imageId, file);
      onImageUploaded(imageId, file.name);
    } catch (error) {
      console.error("Failed to upload image:", error);
      alert("Failed to upload image. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file) {
      handleFile(file);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFile(file);
    }
  };

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
      onClick={() => fileInputRef.current?.click()}
      className={`relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
        isDragging
          ? "border-gray-900 bg-gray-50"
          : "border-gray-300 hover:border-gray-400 hover:bg-gray-50"
      } ${uploading ? "opacity-50 pointer-events-none" : ""}`}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileInput}
        className="hidden"
      />

      <Upload
        className={`mx-auto mb-4 ${
          isDragging ? "text-gray-900" : "text-gray-400"
        }`}
        size={48}
      />

      <p className="text-lg font-medium text-gray-900 mb-2">
        {uploading ? "Uploading..." : "Upload Your Image"}
      </p>

      <p className="text-sm text-gray-500">Drag and drop or click to browse</p>

      <p className="text-xs text-gray-400 mt-2">PNG, JPG, WEBP • Max 10MB</p>
    </div>
  );
}
