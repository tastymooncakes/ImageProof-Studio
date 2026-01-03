// src/app/annotate/[imageId]/page.tsx
"use client";

import { useParams } from "next/navigation";
import { useState, useEffect } from "react";
import { preloadedImages } from "@/data/preloadedImages";
import { storage } from "@/lib/storage";
import { imageStorage } from "@/lib/imageStorage";
import { generateReport } from "@/lib/reportGenerator";
import { Annotation } from "@/types";
import Link from "next/link";
import { ArrowLeft, FileText } from "lucide-react";
import AnnotationCanvas from "@/components/AnnotationCanvas";
import AnnotationModal from "@/components/AnnotationModal";
import AnnotationCard from "@/components/AnnotationCard";

export default function AnnotatePage() {
  const params = useParams();
  const imageId = params.imageId as string;

  // Check if it's a preloaded or uploaded image
  const preloadedImage = preloadedImages.find((img) => img.id === imageId);
  const isUploadedImage = imageId.startsWith("upload-");

  const [imageUrl, setImageUrl] = useState<string | null>(
    preloadedImage ? preloadedImage.url : null
  );
  const [imageTitle, setImageTitle] = useState<string>(
    preloadedImage ? `Image #${preloadedImage.id}` : "Uploaded Image"
  );
  const [imageLoading, setImageLoading] = useState(isUploadedImage);

  const [canvasDimensions, setCanvasDimensions] = useState({
    width: 0,
    height: 0,
  });

  const [annotations, setAnnotations] = useState<Annotation[]>(() => {
    return imageId ? storage.getAnnotations(imageId) : [];
  });

  const [selectedAnnotation, setSelectedAnnotation] =
    useState<Annotation | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);

  // Load uploaded image from IndexedDB
  useEffect(() => {
    if (isUploadedImage) {
      loadUploadedImage();
    }
  }, [imageId, isUploadedImage]);

  const loadUploadedImage = async () => {
    try {
      const url = await imageStorage.getImage(imageId);
      if (url) {
        setImageUrl(url);
        // Try to get image name from IndexedDB
        const images = await imageStorage.getAllImages();
        const imageData = images.find((img) => img.id === imageId);
        if (imageData) {
          setImageTitle(imageData.name);
        }
      }
    } catch (error) {
      console.error("Failed to load uploaded image:", error);
    } finally {
      setImageLoading(false);
    }
  };

  const handleAddAnnotation = (x: number, y: number) => {
    const newAnnotation: Annotation = {
      id: `${Date.now()}-${Math.random()}`,
      imageId,
      x,
      y,
      createdAt: new Date().toISOString(),
    };

    // Don't save to storage yet - only save when user confirms in modal
    setAnnotations([...annotations, newAnnotation]);
    setSelectedAnnotation(newAnnotation);
    setIsModalOpen(true);
  };

  const handleSelectAnnotation = (annotation: Annotation) => {
    setSelectedAnnotation(annotation);
    setIsModalOpen(true);
  };

  const handleDeleteAnnotation = (annotationId: string) => {
    storage.deleteAnnotation(annotationId);
    setAnnotations(annotations.filter((a) => a.id !== annotationId));
    if (selectedAnnotation?.id === annotationId) {
      setSelectedAnnotation(null);
    }
  };

  const handleSaveComment = (
    comment: string,
    proofSnapAssetId?: string,
    proofSnapUrl?: string,
    supportingEvidenceIds?: string[]
  ) => {
    if (!selectedAnnotation) return;

    console.log("Saving annotation with evidence:", supportingEvidenceIds);

    // Check if this is a new annotation (not in storage yet)
    const existingAnnotation = storage
      .getAnnotations(imageId)
      .find((a) => a.id === selectedAnnotation.id);

    if (existingAnnotation) {
      // Existing annotation - delete and update
      storage.deleteAnnotation(selectedAnnotation.id);
    }

    const updatedAnnotation = {
      ...selectedAnnotation,
      comment,
      proofSnapAssetId,
      proofSnapUrl,
      supportingEvidenceIds,
    };

    // Save to storage
    storage.saveAnnotation(updatedAnnotation);

    // Update state
    setAnnotations(
      annotations.map((a) =>
        a.id === selectedAnnotation.id ? updatedAnnotation : a
      )
    );

    // Close modal and clear selection
    setIsModalOpen(false);
    setSelectedAnnotation(null);
  };

  const handleModalClose = () => {
    if (!selectedAnnotation) {
      setIsModalOpen(false);
      return;
    }

    // Check if annotation exists in storage (was saved)
    const savedAnnotation = storage
      .getAnnotations(imageId)
      .find((a) => a.id === selectedAnnotation.id);

    if (!savedAnnotation) {
      // Annotation was never saved, remove it from state
      setAnnotations(annotations.filter((a) => a.id !== selectedAnnotation.id));
    }

    setIsModalOpen(false);
    setSelectedAnnotation(null);
  };

  const handleGenerateReport = async () => {
    if (!imageUrl) return;

    setIsGeneratingReport(true);
    try {
      await generateReport({
        imageUrl,
        imageTitle,
        annotations,
        imageWidth: canvasDimensions.width,
        imageHeight: canvasDimensions.height,
      });
    } catch (error) {
      console.error("Error generating report:", error);
      alert("Failed to generate report");
    } finally {
      setIsGeneratingReport(false);
    }
  };

  if (imageLoading) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-gray-900 mb-4">
            Loading image...
          </h1>
        </div>
      </main>
    );
  }

  if (!imageUrl) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-gray-900 mb-4">
            Image not found
          </h1>
          <Link href="/" className="text-gray-600 hover:text-gray-900">
            ← Back to Gallery
          </Link>
        </div>
      </main>
    );
  }

  const selectedIndex = selectedAnnotation
    ? annotations.findIndex((a) => a.id === selectedAnnotation.id) + 1
    : 0;

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft size={18} />
            <span>Back to Gallery</span>
          </Link>
          <h1 className="text-xl font-semibold text-gray-900 truncate max-w-md">
            {imageTitle}
          </h1>
          <button
            onClick={handleGenerateReport}
            disabled={annotations.length === 0 || isGeneratingReport}
            className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FileText size={18} />
            <span>
              {isGeneratingReport ? "Generating..." : "Generate Report"}
            </span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Canvas Area */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm p-4">
            <AnnotationCanvas
              imageUrl={imageUrl}
              annotations={annotations}
              onAddAnnotation={handleAddAnnotation}
              onSelectAnnotation={handleSelectAnnotation}
              onDimensionsChange={(width, height) =>
                setCanvasDimensions({ width, height })
              }
            />
          </div>
        </div>

        {/* Sidebar - Annotations List */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Annotations ({annotations.length})
            </h2>
            {annotations.length === 0 ? (
              <p className="text-gray-500 text-sm">
                Click on the image to add annotations
              </p>
            ) : (
              <div className="space-y-3">
                {annotations.map((annotation, index) => (
                  <AnnotationCard
                    key={annotation.id}
                    annotation={annotation}
                    index={index}
                    isSelected={selectedAnnotation?.id === annotation.id}
                    onSelect={() => handleSelectAnnotation(annotation)}
                    onDelete={() => handleDeleteAnnotation(annotation.id)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Annotation Modal */}
      {isModalOpen && selectedAnnotation && (
        <AnnotationModal
          annotation={selectedAnnotation}
          annotationNumber={selectedIndex}
          onClose={handleModalClose}
          onSave={handleSaveComment}
        />
      )}
    </main>
  );
}
