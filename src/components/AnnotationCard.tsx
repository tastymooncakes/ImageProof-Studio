// src/components/AnnotationCard.tsx
"use client";

import { Trash2 } from "lucide-react";
import { Annotation } from "@/types";
import EvidenceThumbnail from "./EvidenceThumbnail";
import ProofSnapPreview from "./ProofSnapPreview";

interface AnnotationCardProps {
  annotation: Annotation;
  index: number;
  isSelected: boolean;
  onSelect: () => void;
  onDelete: () => void;
}

export default function AnnotationCard({
  annotation,
  index,
  isSelected,
  onSelect,
  onDelete,
}: AnnotationCardProps) {
  return (
    <div
      className={`rounded-lg border transition-colors ${
        isSelected
          ? "border-gray-900 bg-gray-50"
          : "border-gray-200 hover:border-gray-300"
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-gray-100">
        <div
          onClick={onSelect}
          className="flex items-center gap-2 cursor-pointer flex-1"
        >
          <span className="flex items-center justify-center w-6 h-6 rounded-full bg-red-500 text-white text-xs font-bold">
            {index + 1}
          </span>
          <span className="text-sm font-medium text-gray-900">
            Annotation {index + 1}
          </span>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="p-1 text-gray-400 hover:text-red-600 transition-colors"
          title="Delete annotation"
        >
          <Trash2 size={16} />
        </button>
      </div>

      {/* Content */}
      <div className="p-3 space-y-3">
        {/* Comment */}
        {annotation.comment && (
          <div>
            <p className="text-xs font-medium text-gray-500 mb-1">Comment</p>
            <p className="text-sm text-gray-700">{annotation.comment}</p>
          </div>
        )}

        {/* Supporting Evidence Thumbnails */}
        {annotation.supportingEvidenceIds &&
          annotation.supportingEvidenceIds.length > 0 && (
            <div>
              <p className="text-xs font-medium text-gray-500 mb-2">
                Supporting Evidence ({annotation.supportingEvidenceIds.length})
              </p>
              <div className="grid grid-cols-3 gap-1">
                {annotation.supportingEvidenceIds.map((evidenceId) => (
                  <EvidenceThumbnail key={evidenceId} evidenceId={evidenceId} />
                ))}
              </div>
            </div>
          )}

        {/* ProofSnap Evidence */}
        {annotation.proofSnapAssetId && annotation.proofSnapUrl && (
          <ProofSnapPreview url={annotation.proofSnapUrl} />
        )}
      </div>
    </div>
  );
}
