"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Settings, Sparkles, Upload as UploadIcon } from "lucide-react";
import { imageStorage } from "@/lib/imageStorage";
import { storage } from "@/lib/storage";
import { UploadedImage } from "@/types";
import DemoImagesTab from "@/components/DemoImagesTab";
import UploadsTab from "@/components/UploadsTab";

export default function Home() {
  const [activeTab, setActiveTab] = useState<"demo" | "upload">("demo");
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUploadedImages();
  }, []);

  const loadUploadedImages = async () => {
    try {
      const images = await imageStorage.getAllImages();
      setUploadedImages(images);
    } catch (error) {
      console.error("Failed to load uploaded images:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleImageUploaded = () => {
    loadUploadedImages();
    setActiveTab("upload");
  };

  const handleDeleteImage = async (imageId: string) => {
    if (!confirm("Delete this image? All annotations will be lost.")) return;

    try {
      await imageStorage.deleteImage(imageId);

      // Delete annotations for this image
      const annotations = storage.getAnnotations(imageId);
      annotations.forEach((a) => storage.deleteAnnotation(a.id));

      loadUploadedImages();
    } catch (error) {
      console.error("Failed to delete image:", error);
      alert("Failed to delete image");
    }
  };

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

      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Tabs */}
        <div className="flex gap-4 mb-8 border-b border-gray-200">
          <button
            onClick={() => setActiveTab("demo")}
            className={`pb-3 px-4 font-medium transition-colors relative ${
              activeTab === "demo"
                ? "text-gray-900"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <div className="flex items-center gap-2">
              <Sparkles size={18} />
              <span>Demo Images</span>
            </div>
            {activeTab === "demo" && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-900" />
            )}
          </button>

          <button
            onClick={() => setActiveTab("upload")}
            className={`pb-3 px-4 font-medium transition-colors relative ${
              activeTab === "upload"
                ? "text-gray-900"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <div className="flex items-center gap-2">
              <UploadIcon size={18} />
              <span>Your Uploads</span>
              {uploadedImages.length > 0 && (
                <span className="px-2 py-0.5 bg-gray-900 text-white text-xs rounded-full">
                  {uploadedImages.length}
                </span>
              )}
            </div>
            {activeTab === "upload" && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-900" />
            )}
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === "demo" ? (
          <DemoImagesTab />
        ) : (
          <UploadsTab
            uploadedImages={uploadedImages}
            loading={loading}
            onImageUploaded={handleImageUploaded}
            onDeleteImage={handleDeleteImage}
          />
        )}
      </div>
    </main>
  );
}
