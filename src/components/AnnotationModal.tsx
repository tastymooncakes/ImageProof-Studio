// src/components/AnnotationModal.tsx
"use client";

import { useState } from "react";
import { X, Check, Paperclip } from "lucide-react";
import { Annotation, ProofSnapAsset } from "@/types";
import { storage } from "@/lib/storage";
import ProofSnapSelector from "./ProofSnapSelector";

interface AnnotationModalProps {
  annotation: Annotation;
  annotationNumber: number;
  onClose: () => void;
  onSave: (
    comment: string,
    proofSnapAssetId?: string,
    proofSnapUrl?: string
  ) => void;
}

export default function AnnotationModal({
  annotation,
  annotationNumber,
  onClose,
  onSave,
}: AnnotationModalProps) {
  const [comment, setComment] = useState(annotation.comment || "");
  const [showProofSnapSelector, setShowProofSnapSelector] = useState(false);

  // Initialize selectedAsset from existing annotation data
  const [selectedAsset, setSelectedAsset] = useState<ProofSnapAsset | null>(
    () => {
      if (annotation.proofSnapAssetId) {
        return {
          nid: annotation.proofSnapAssetId,
          id: annotation.proofSnapAssetId,
          asset_file: annotation.proofSnapUrl || "",
          asset_file_thumbnail: annotation.proofSnapUrl || "",
          created_at: annotation.createdAt,
        };
      }
      return null;
    }
  );

  const settings = storage.getSettings();
  const hasToken = !!settings.captureToken;

  const handleSave = () => {
    const assetId = selectedAsset?.nid || selectedAsset?.id;
    console.log("Saving and closing:", { comment, assetId, selectedAsset });
    onSave(comment, assetId, selectedAsset?.asset_file);
    onClose(); // Close modal after saving
  };

  const handleSelectAsset = (asset: ProofSnapAsset) => {
    console.log("Asset selected:", asset);
    setSelectedAsset(asset);
    setShowProofSnapSelector(false); // Hide selector after selection
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white z-10">
          <h2 className="text-xl font-semibold text-gray-900">
            Annotation #{annotationNumber}
          </h2>
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          {/* Comment Input */}
          <div>
            <label
              htmlFor="comment"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Comment
            </label>
            <textarea
              id="comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Describe what looks suspicious..."
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none transition-all text-gray-900 placeholder:text-gray-400 resize-none"
            />
          </div>

          {/* ProofSnap Section */}
          <div className="pt-4 border-t border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-900">
                ProofSnap Evidence
              </h3>
              {hasToken && !showProofSnapSelector && (
                <button
                  onClick={() => setShowProofSnapSelector(true)}
                  className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-700 hover:text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Paperclip size={14} />
                  Attach Evidence
                </button>
              )}
            </div>

            {!hasToken ? (
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">
                  Add your capture token in Settings to attach ProofSnap
                  evidence.
                </p>
              </div>
            ) : (
              <>
                {selectedAsset && (
                  <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center gap-3">
                      <img
                        src={
                          selectedAsset.asset_file_thumbnail ||
                          selectedAsset.asset_file
                        }
                        alt="Selected evidence"
                        className="w-16 h-16 rounded object-cover"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-green-900 flex items-center gap-2">
                          <Check size={14} />
                          Evidence Attached
                        </p>
                        <p className="text-xs text-green-700">
                          {new Date(
                            selectedAsset.created_at
                          ).toLocaleDateString()}
                        </p>
                      </div>
                      <button
                        onClick={() => setSelectedAsset(null)}
                        className="text-sm text-red-600 hover:text-red-700 transition-colors font-medium"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                )}

                {showProofSnapSelector && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-gray-600">
                        Select a ProofSnap asset:
                      </p>
                      <button
                        onClick={() => setShowProofSnapSelector(false)}
                        className="text-sm text-gray-600 hover:text-gray-900"
                      >
                        Cancel
                      </button>
                    </div>
                    <ProofSnapSelector
                      captureToken={settings.captureToken!}
                      onSelect={handleSelectAsset}
                      selectedAssetId={selectedAsset?.nid || selectedAsset?.id}
                    />
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 sticky bottom-0 bg-white">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 hover:text-gray-900 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
          >
            Save Annotation
          </button>
        </div>
      </div>
    </div>
  );
}
