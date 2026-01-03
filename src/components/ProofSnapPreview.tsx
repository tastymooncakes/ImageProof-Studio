// src/components/ProofSnapPreview.tsx
"use client";

interface ProofSnapPreviewProps {
  url: string;
}

export default function ProofSnapPreview({ url }: ProofSnapPreviewProps) {
  return (
    <div>
      <p className="text-xs font-medium text-gray-500 mb-2">ProofSnap</p>
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="block group"
      >
        <div className="relative aspect-video rounded-lg overflow-hidden border border-green-200 bg-green-50">
          <img
            src={url}
            alt="ProofSnap evidence"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
          />
          <div className="absolute inset-0 bg-green-500/10 group-hover:bg-green-500/20 transition-colors" />
          <div className="absolute top-2 right-2 bg-green-600 text-white text-xs px-2 py-0.5 rounded-full font-medium">
            Verified
          </div>
        </div>
      </a>
    </div>
  );
}
