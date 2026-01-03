// src/types/index.ts

export interface PreloadedImage {
  id: string;
  url: string;
  title: string;
  description: string;
  category: "political" | "viral" | "ai-art";
}

export interface UploadedImage {
  id: string;
  name: string;
  uploadedAt: string;
}

export interface SupportingEvidence {
  id: string;
  name: string;
  uploadedAt: string;
}

export interface Annotation {
  id: string;
  imageId: string;
  x: number;
  y: number;
  comment?: string;
  proofSnapAssetId?: string;
  proofSnapUrl?: string;
  supportingEvidenceIds?: string[];
  createdAt: string;
}

export interface ProofSnapAsset {
  nid?: string;
  id?: string;
  asset_file: string;
  asset_file_thumbnail: string;
  asset_creator_name?: string;
  created_at: string;
}

export interface AppSettings {
  captureToken?: string;
  displayName?: string;
}
