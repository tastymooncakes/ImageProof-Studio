// src/components/EvidenceThumbnail.tsx
"use client";

import { useState, useEffect } from "react";
import { imageStorage } from "@/lib/imageStorage";

interface EvidenceThumbnailProps {
  evidenceId: string;
}

export default function EvidenceThumbnail({
  evidenceId,
}: EvidenceThumbnailProps) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function loadEvidence() {
      try {
        const url = await imageStorage.getEvidence(evidenceId);
        if (mounted && url) {
          setImageUrl(url);
        }
      } catch (error) {
        console.error("Failed to load evidence:", error);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadEvidence();

    return () => {
      mounted = false;
      if (imageUrl) {
        URL.revokeObjectURL(imageUrl);
      }
    };
  }, [evidenceId]);

  if (loading) {
    return (
      <div className="aspect-square bg-gray-100 rounded flex items-center justify-center">
        <div className="w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (!imageUrl) {
    return (
      <div className="aspect-square bg-gray-100 rounded flex items-center justify-center">
        <p className="text-xs text-gray-400">Failed</p>
      </div>
    );
  }

  return (
    <div className="aspect-square rounded overflow-hidden border border-gray-200 hover:border-gray-400 transition-colors">
      <img
        src={imageUrl}
        alt="Evidence"
        className="w-full h-full object-cover"
      />
    </div>
  );
}
