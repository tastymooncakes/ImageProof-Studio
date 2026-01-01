// src/components/ProofSnapSelector.tsx
"use client";

import { useState, useEffect } from "react";
import { fetchUserAssets } from "@/lib/numbersProtocol";
import { ProofSnapAsset } from "@/types";
import { Loader2 } from "lucide-react";

interface ProofSnapSelectorProps {
  captureToken: string;
  onSelect: (asset: ProofSnapAsset) => void;
  selectedAssetId?: string;
}

export default function ProofSnapSelector({
  captureToken,
  onSelect,
  selectedAssetId,
}: ProofSnapSelectorProps) {
  const [assets, setAssets] = useState<ProofSnapAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadAssets() {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchUserAssets(captureToken);
        setAssets(data);
      } catch (err) {
        setError("Failed to load ProofSnap assets. Check your token.");
      } finally {
        setLoading(false);
      }
    }

    loadAssets();
  }, [captureToken]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="animate-spin text-gray-400" size={24} />
      </div>
    );
  }

  if (error) {
    return <div className="text-sm text-red-600 py-4">{error}</div>;
  }

  if (assets.length === 0) {
    return (
      <div className="text-sm text-gray-500 py-4">
        No ProofSnap assets found. Capture some images with the ProofSnap
        extension first.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-3 gap-3 max-h-64 overflow-y-auto">
      {assets.map((asset) => {
        const assetId = asset.nid || asset.id;
        return (
          <button
            key={assetId}
            onClick={() => onSelect(asset)}
            className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all ${
              selectedAssetId === assetId
                ? "border-gray-900 ring-2 ring-gray-900"
                : "border-gray-200 hover:border-gray-400"
            }`}
          >
            <img
              src={asset.asset_file_thumbnail || asset.asset_file}
              alt="ProofSnap asset"
              className="w-full h-full object-cover"
            />
            {selectedAssetId === assetId && (
              <div className="absolute inset-0 bg-gray-900/20 flex items-center justify-center">
                <div className="w-6 h-6 rounded-full bg-gray-900 flex items-center justify-center">
                  <span className="text-white text-xs">✓</span>
                </div>
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
}
