// src/components/EvidenceUpload.tsx
"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { Upload, X } from "lucide-react";
import { imageStorage } from "@/lib/imageStorage";

interface EvidenceUploadProps {
  onEvidenceAdded: (evidenceId: string, evidenceName: string) => void;
  existingEvidenceIds?: string[];
}

export default function EvidenceUpload({
  onEvidenceAdded,
  existingEvidenceIds = [],
}: EvidenceUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [evidencePreviews, setEvidencePreviews] = useState<
    Array<{
      id: string;
      name: string;
      url: string;
    }>
  >([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadExistingEvidence = useCallback(async () => {
    const previews = await Promise.all(
      existingEvidenceIds.map(async (id) => {
        const url = await imageStorage.getEvidence(id);
        const metadata = await imageStorage.getEvidenceMetadata(id);
        if (url && metadata) {
          return { id, name: metadata.name, url };
        }
        return null;
      })
    );

    const validPreviews = previews.filter(
      (p): p is { id: string; name: string; url: string } => p !== null
    );
    setEvidencePreviews(validPreviews);
  }, [existingEvidenceIds]);

  useEffect(() => {
    loadExistingEvidence();
  }, [loadExistingEvidence]);

  const handleFile = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      alert("Please upload an image file");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      alert("Evidence image must be smaller than 10MB");
      return;
    }

    setUploading(true);

    try {
      const evidenceId = `evidence-${Date.now()}-${Math.random()}`;
      await imageStorage.saveEvidence(evidenceId, file);

      // Create preview
      const url = URL.createObjectURL(file);
      setEvidencePreviews([
        ...evidencePreviews,
        {
          id: evidenceId,
          name: file.name,
          url,
        },
      ]);

      onEvidenceAdded(evidenceId, file.name);
    } catch (error) {
      console.error("Failed to upload evidence:", error);
      alert("Failed to upload evidence. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFile(file);
    }
    // Reset input
    e.target.value = "";
  };

  const handleRemove = async (evidenceId: string) => {
    try {
      await imageStorage.deleteEvidence(evidenceId);
      setEvidencePreviews(evidencePreviews.filter((e) => e.id !== evidenceId));
      // Note: Parent component should handle removing from annotation
    } catch (error) {
      console.error("Failed to delete evidence:", error);
    }
  };

  return (
    <div className="space-y-3">
      {/* Upload Button */}
      <button
        onClick={() => fileInputRef.current?.click()}
        disabled={uploading}
        className="w-full flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-gray-400 hover:bg-gray-50 transition-colors disabled:opacity-50"
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileInput}
          className="hidden"
        />
        <Upload size={18} className="text-gray-400" />
        <span className="text-sm font-medium text-gray-700">
          {uploading ? "Uploading..." : "Upload Supporting Image"}
        </span>
      </button>

      {/* Evidence Previews */}
      {evidencePreviews.length > 0 && (
        <div className="grid grid-cols-2 gap-2">
          {evidencePreviews.map((evidence) => (
            <div
              key={evidence.id}
              className="relative group border border-gray-200 rounded-lg overflow-hidden aspect-video"
            >
              <img
                src={evidence.url}
                alt={evidence.name}
                className="w-full h-full object-cover"
              />

              {/* Overlay with name */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="absolute bottom-2 left-2 right-2">
                  <p className="text-white text-xs truncate">{evidence.name}</p>
                </div>
              </div>

              {/* Delete button */}
              <button
                onClick={() => handleRemove(evidence.id)}
                className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                title="Remove evidence"
              >
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
      )}

      <p className="text-xs text-gray-500">
        Upload screenshots, crops, or comparison images as supporting evidence
      </p>
    </div>
  );
}
