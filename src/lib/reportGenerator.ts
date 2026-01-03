// src/lib/reportGenerator.ts

import jsPDF from "jspdf";
import { Annotation } from "@/types";
import { storage } from "./storage";
import { imageStorage } from "./imageStorage";

interface ReportData {
  imageUrl: string;
  imageTitle: string;
  annotations: Annotation[];
  imageWidth: number;
  imageHeight: number;
}

export async function generateReport(data: ReportData): Promise<void> {
  const pdf = new jsPDF();
  const settings = storage.getSettings();
  const investigatorName = settings.displayName || "Anonymous Investigator";

  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 20;
  const contentWidth = pageWidth - margin * 2;

  // Calculate tier statistics
  const tier1Count = data.annotations.filter((a) => a.proofSnapAssetId).length;
  const tier2Count = data.annotations.filter(
    (a) => a.supportingEvidenceIds && a.supportingEvidenceIds.length > 0
  ).length;
  const tier3Count = data.annotations.filter(
    (a) =>
      a.comment &&
      !a.proofSnapAssetId &&
      (!a.supportingEvidenceIds || a.supportingEvidenceIds.length === 0)
  ).length;
  const totalSupportingImages = data.annotations.reduce(
    (sum, a) => sum + (a.supportingEvidenceIds?.length || 0),
    0
  );

  // ========== PAGE 1: COVER + SUMMARY ==========
  let yPosition = 60;

  // Title
  pdf.setFillColor(31, 41, 55);
  pdf.rect(0, 40, pageWidth, 30, "F");
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(24);
  pdf.setFont("helvetica", "bold");
  pdf.text("IMAGE VERIFICATION REPORT", pageWidth / 2, 58, { align: "center" });

  yPosition = 100;
  pdf.setTextColor(0, 0, 0);

  // Metadata Box
  pdf.setFillColor(249, 250, 251);
  pdf.roundedRect(margin, yPosition, contentWidth, 50, 3, 3, "F");
  pdf.setDrawColor(229, 231, 235);
  pdf.roundedRect(margin, yPosition, contentWidth, 50, 3, 3, "S");

  pdf.setFontSize(10);
  pdf.setFont("helvetica", "bold");
  pdf.setTextColor(75, 85, 99);

  const metaY = yPosition + 12;
  pdf.text("REPORT METADATA", margin + 10, metaY);

  pdf.setFont("helvetica", "normal");
  pdf.setTextColor(0, 0, 0);
  pdf.text(`Investigator: ${investigatorName}`, margin + 10, metaY + 10);
  pdf.text(
    `Date Generated: ${new Date().toLocaleString()}`,
    margin + 10,
    metaY + 18
  );
  pdf.text(`Subject: ${data.imageTitle}`, margin + 10, metaY + 26);
  pdf.text(
    `Report ID: ${Date.now().toString(36).toUpperCase()}`,
    margin + 10,
    metaY + 34
  );

  yPosition += 65;

  // Summary Statistics Box
  pdf.setFillColor(239, 246, 255);
  pdf.roundedRect(margin, yPosition, contentWidth, 60, 3, 3, "F");
  pdf.setDrawColor(191, 219, 254);
  pdf.roundedRect(margin, yPosition, contentWidth, 60, 3, 3, "S");

  pdf.setFontSize(10);
  pdf.setFont("helvetica", "bold");
  pdf.setTextColor(30, 64, 175);
  pdf.text("SUMMARY STATISTICS", margin + 10, yPosition + 12);

  pdf.setFont("helvetica", "normal");
  pdf.setTextColor(0, 0, 0);

  const statsY = yPosition + 24;
  const col1 = margin + 10;
  const col2 = margin + contentWidth / 2;

  pdf.setFontSize(9);
  pdf.setTextColor(75, 85, 99);
  pdf.text("Total Findings:", col1, statsY);
  pdf.text("Tier 1 (ProofSnap Verified):", col1, statsY + 8);
  pdf.text("Tier 2 (Supporting Evidence):", col1, statsY + 16);
  pdf.text("Tier 3 (Comment Only):", col2, statsY);
  pdf.text("Total Supporting Images:", col2, statsY + 8);
  pdf.text("Verification Status:", col2, statsY + 16);

  pdf.setFont("helvetica", "bold");
  pdf.setTextColor(0, 0, 0);
  pdf.setFontSize(10);
  pdf.text(String(data.annotations.length), col1 + 50, statsY);
  pdf.text(String(tier1Count), col1 + 50, statsY + 8);
  pdf.text(String(tier2Count), col1 + 50, statsY + 16);
  pdf.text(String(tier3Count), col2 + 50, statsY);
  pdf.text(String(totalSupportingImages), col2 + 50, statsY + 8);

  // Status badge
  const statusText =
    tier1Count > 0 ? "VERIFIED" : tier2Count > 0 ? "PARTIAL" : "UNVERIFIED";
  const statusColor =
    tier1Count > 0
      ? [34, 197, 94]
      : tier2Count > 0
      ? [59, 130, 246]
      : [239, 68, 68];
  pdf.setFillColor(statusColor[0], statusColor[1], statusColor[2]);
  pdf.roundedRect(col2 + 50, statsY + 11, 35, 6, 2, 2, "F");
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(8);
  pdf.text(statusText, col2 + 67.5, statsY + 15.5, { align: "center" });

  // ========== PAGE 2: ANNOTATED IMAGE ==========
  pdf.addPage();
  yPosition = 20;

  pdf.setTextColor(0, 0, 0);
  pdf.setFontSize(16);
  pdf.setFont("helvetica", "bold");
  pdf.text("Annotated Image Analysis", margin, yPosition);
  yPosition += 12;

  // Add annotated image
  try {
    const canvas = await createAnnotatedCanvas(
      data.imageUrl,
      data.annotations,
      data.imageWidth,
      data.imageHeight
    );
    const imgData = canvas.toDataURL("image/jpeg", 0.85);

    const maxWidth = contentWidth;
    const maxHeight = 140;
    const imgAspect = canvas.width / canvas.height;

    let imgWidth = maxWidth;
    let imgHeight = imgWidth / imgAspect;

    if (imgHeight > maxHeight) {
      imgHeight = maxHeight;
      imgWidth = imgHeight * imgAspect;
    }

    const xOffset = (pageWidth - imgWidth) / 2;

    pdf.setDrawColor(229, 231, 235);
    pdf.setLineWidth(0.5);
    pdf.rect(xOffset - 2, yPosition - 2, imgWidth + 4, imgHeight + 4);
    pdf.addImage(imgData, "JPEG", xOffset, yPosition, imgWidth, imgHeight);
    yPosition += imgHeight + 15;
  } catch (error) {
    console.error("Error adding image to PDF:", error);
    pdf.setFontSize(10);
    pdf.setTextColor(239, 68, 68);
    pdf.text("⚠ Image could not be loaded", margin, yPosition);
    yPosition += 15;
  }

  // Quick Reference
  pdf.setFontSize(12);
  pdf.setFont("helvetica", "bold");
  pdf.setTextColor(0, 0, 0);
  pdf.text("Quick Reference", margin, yPosition);
  yPosition += 8;

  pdf.setFontSize(9);
  pdf.setFont("helvetica", "normal");

  data.annotations.forEach((annotation, index) => {
    if (yPosition > 250) {
      pdf.addPage();
      yPosition = 20;
    }

    const preview = annotation.comment
      ? annotation.comment.substring(0, 60) +
        (annotation.comment.length > 60 ? "..." : "")
      : "No comment";

    const tier = annotation.proofSnapAssetId
      ? "1"
      : annotation.supportingEvidenceIds &&
        annotation.supportingEvidenceIds.length > 0
      ? "2"
      : "3";

    pdf.setTextColor(75, 85, 99);
    pdf.text(`${index + 1}. [Tier ${tier}] ${preview}`, margin + 5, yPosition);
    yPosition += 5;
  });

  // ========== PAGES 3+: DETAILED FINDINGS ==========
  pdf.addPage();
  yPosition = 20;

  pdf.setTextColor(0, 0, 0);
  pdf.setFontSize(16);
  pdf.setFont("helvetica", "bold");
  pdf.text("Detailed Findings", margin, yPosition);
  yPosition += 15;

  for (let i = 0; i < data.annotations.length; i++) {
    const annotation = data.annotations[i];

    // Calculate required space
    let requiredSpace = 50; // Base
    if (
      annotation.supportingEvidenceIds &&
      annotation.supportingEvidenceIds.length > 0
    ) {
      requiredSpace += 40; // Space for thumbnails
    }
    if (annotation.proofSnapAssetId) {
      requiredSpace += 35;
    }

    if (yPosition + requiredSpace > 250) {
      pdf.addPage();
      yPosition = 20;
    }

    await renderFinding(pdf, annotation, i, margin, yPosition, contentWidth);
    yPosition += requiredSpace + 10;
  }

  // ========== LAST PAGE: CONCLUSION ==========
  if (yPosition > 220) {
    pdf.addPage();
    yPosition = 20;
  } else {
    yPosition += 15;
  }

  pdf.setDrawColor(229, 231, 235);
  pdf.setLineWidth(0.5);
  pdf.line(margin, yPosition, pageWidth - margin, yPosition);
  yPosition += 10;

  pdf.setFontSize(12);
  pdf.setFont("helvetica", "bold");
  pdf.setTextColor(0, 0, 0);
  pdf.text("Conclusion", margin, yPosition);
  yPosition += 8;

  pdf.setFontSize(9);
  pdf.setFont("helvetica", "normal");
  pdf.setTextColor(55, 65, 81);

  const conclusionText =
    `This report documents ${data.annotations.length} finding(s) identified during the analysis of ${data.imageTitle}. ` +
    `Evidence hierarchy: ${tier1Count} finding(s) with cryptographic ProofSnap verification (Tier 1), ` +
    `${tier2Count} with supporting visual evidence totaling ${totalSupportingImages} image(s) (Tier 2), ` +
    `and ${tier3Count} with observational comments only (Tier 3). ` +
    `This report was generated by ImageProof Studio for professional image verification.`;

  const conclusionLines = pdf.splitTextToSize(conclusionText, contentWidth);
  pdf.text(conclusionLines, margin, yPosition);

  // ========== FOOTER ON ALL PAGES ==========
  const pageCount = pdf.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    pdf.setPage(i);

    pdf.setDrawColor(229, 231, 235);
    pdf.setLineWidth(0.3);
    pdf.line(margin, pageHeight - 15, pageWidth - margin, pageHeight - 15);

    pdf.setFontSize(8);
    pdf.setTextColor(156, 163, 175);
    pdf.setFont("helvetica", "normal");
    pdf.text(
      "ImageProof Studio | Professional Image Verification",
      margin,
      pageHeight - 10
    );
    pdf.text(`Page ${i} of ${pageCount}`, pageWidth - margin, pageHeight - 10, {
      align: "right",
    });
  }

  // Download
  const filename = `ImageProof-Report-${data.imageTitle.replace(
    /\s+/g,
    "-"
  )}-${Date.now()}.pdf`;
  pdf.save(filename);
}

// Render individual finding with all evidence tiers
async function renderFinding(
  pdf: jsPDF,
  annotation: Annotation,
  index: number,
  margin: number,
  yPosition: number,
  contentWidth: number
): Promise<void> {
  const tier = annotation.proofSnapAssetId
    ? 1
    : annotation.supportingEvidenceIds &&
      annotation.supportingEvidenceIds.length > 0
    ? 2
    : 3;

  // Determine box color based on tier
  const tierColors = {
    1: { bg: [240, 253, 244], border: [134, 239, 172] }, // green
    2: { bg: [239, 246, 255], border: [147, 197, 253] }, // blue
    3: { bg: [249, 250, 251], border: [229, 231, 235] }, // gray
  };

  const colors = tierColors[tier as keyof typeof tierColors];

  // Calculate box height
  let boxHeight = 25;
  if (annotation.comment) {
    const lines = pdf.splitTextToSize(annotation.comment, contentWidth - 25);
    boxHeight = Math.max(30, 20 + lines.length * 5);
  }

  // Finding box
  pdf.setFillColor(colors.bg[0], colors.bg[1], colors.bg[2]);
  pdf.roundedRect(margin, yPosition, contentWidth, boxHeight, 2, 2, "F");
  pdf.setDrawColor(colors.border[0], colors.border[1], colors.border[2]);
  pdf.setLineWidth(1);
  pdf.roundedRect(margin, yPosition, contentWidth, boxHeight, 2, 2, "S");

  const innerY = yPosition + 10;

  // Number badge
  const badgeColor =
    tier === 1 ? [34, 197, 94] : tier === 2 ? [59, 130, 246] : [107, 114, 128];
  pdf.setFillColor(badgeColor[0], badgeColor[1], badgeColor[2]);
  pdf.circle(margin + 8, innerY, 6, "F");
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(10);
  pdf.setFont("helvetica", "bold");

  // Manually center the text
  const numberText = String(index + 1);
  const textWidth = pdf.getTextWidth(numberText);
  const centerX = margin + 8;
  const centerY = innerY;

  // Draw text centered in circle (accounting for font baseline)
  pdf.text(numberText, centerX - textWidth / 2, centerY + 3);

  // Title with tier badge
  pdf.setTextColor(0, 0, 0);
  pdf.setFontSize(11);
  pdf.text(`Finding #${index + 1}`, margin + 18, innerY + 2);

  // Tier badge
  const tierText = `Tier ${tier}`;
  const tierBgColor = badgeColor;
  pdf.setFillColor(tierBgColor[0], tierBgColor[1], tierBgColor[2]);
  pdf.roundedRect(margin + contentWidth - 28, yPosition + 6, 24, 8, 2, 2, "F");
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(8);
  pdf.setFont("helvetica", "bold");
  pdf.text(tierText, margin + contentWidth - 16, yPosition + 11, {
    align: "center",
  });

  // Comment
  let contentY = innerY + 8;
  pdf.setFontSize(9);
  pdf.setFont("helvetica", "normal");

  if (annotation.comment) {
    pdf.setTextColor(55, 65, 81);
    const lines = pdf.splitTextToSize(annotation.comment, contentWidth - 30);
    pdf.text(lines, margin + 18, contentY);
    contentY += lines.length * 5 + 5;
  }

  let currentY = yPosition + boxHeight + 5;

  // Supporting Evidence (Tier 2)
  if (
    annotation.supportingEvidenceIds &&
    annotation.supportingEvidenceIds.length > 0
  ) {
    pdf.setFontSize(9);
    pdf.setFont("helvetica", "bold");
    pdf.setTextColor(59, 130, 246);
    pdf.text(
      `Supporting Evidence (${annotation.supportingEvidenceIds.length} image${
        annotation.supportingEvidenceIds.length !== 1 ? "s" : ""
      })`,
      margin + 5,
      currentY
    );
    currentY += 6;

    // Load and display evidence thumbnails (max 4)
    const evidenceToShow = annotation.supportingEvidenceIds.slice(0, 4);
    const thumbSize = 25;
    const gap = 3;

    for (let i = 0; i < evidenceToShow.length; i++) {
      try {
        const evidenceUrl = await imageStorage.getEvidence(evidenceToShow[i]);
        if (evidenceUrl) {
          const xPos = margin + 5 + i * (thumbSize + gap);
          pdf.setDrawColor(191, 219, 254);
          pdf.rect(xPos, currentY, thumbSize, thumbSize);
          pdf.addImage(
            evidenceUrl,
            "JPEG",
            xPos,
            currentY,
            thumbSize,
            thumbSize
          );
        }
      } catch (error) {
        console.error("Failed to load evidence for PDF:", error);
      }
    }

    currentY += thumbSize + 5;
  }

  // ProofSnap Evidence (Tier 1)
  if (annotation.proofSnapAssetId && annotation.proofSnapUrl) {
    pdf.setFontSize(9);
    pdf.setFont("helvetica", "bold");
    pdf.setTextColor(34, 197, 94);
    pdf.text(
      "ProofSnap Evidence (Cryptographically Verified)",
      margin + 5,
      currentY
    );
    currentY += 6;

    // ProofSnap thumbnail
    try {
      const thumbSize = 25;
      pdf.setDrawColor(134, 239, 172);
      pdf.setLineWidth(1.5);
      pdf.rect(margin + 5, currentY, thumbSize, thumbSize);
      pdf.addImage(
        annotation.proofSnapUrl,
        "JPEG",
        margin + 5,
        currentY,
        thumbSize,
        thumbSize
      );

      // Verified badge
      pdf.setFillColor(34, 197, 94);
      pdf.roundedRect(margin + 7, currentY + 2, 21, 5, 1, 1, "F");
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(6);
      pdf.text("✓ VERIFIED", margin + 17.5, currentY + 5, { align: "center" });

      // Link
      pdf.setFontSize(8);
      pdf.setTextColor(59, 130, 246);
      pdf.textWithLink("View ProofSnap Evidence", margin + 35, currentY + 12, {
        url: annotation.proofSnapUrl,
      });

      currentY += thumbSize + 5;
    } catch (error) {
      console.error("Failed to load ProofSnap for PDF:", error);
    }
  }

  // Timestamp
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(7);
  pdf.setTextColor(107, 114, 128);
  pdf.text(
    `Logged: ${new Date(annotation.createdAt).toLocaleString()}`,
    margin + 5,
    currentY
  );
}

// Helper function to create canvas with annotations scaled to original image
async function createAnnotatedCanvas(
  imageUrl: string,
  annotations: Annotation[],
  canvasWidth: number,
  canvasHeight: number
): Promise<HTMLCanvasElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";

    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("Could not get canvas context"));
        return;
      }

      const scaleX = img.width / canvasWidth;
      const scaleY = img.height / canvasHeight;

      ctx.drawImage(img, 0, 0);

      annotations.forEach((annotation, index) => {
        const scaledX = annotation.x * scaleX;
        const scaledY = annotation.y * scaleY;
        const scaledRadius = 20 * Math.min(scaleX, scaleY);

        ctx.beginPath();
        ctx.arc(scaledX, scaledY, scaledRadius, 0, 2 * Math.PI);
        ctx.fillStyle = "rgba(239, 68, 68, 0.9)";
        ctx.fill();
        ctx.strokeStyle = "#fff";
        ctx.lineWidth = 3 * Math.min(scaleX, scaleY);
        ctx.stroke();

        ctx.fillStyle = "#fff";
        ctx.font = `bold ${Math.round(16 * Math.min(scaleX, scaleY))}px Arial`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(String(index + 1), scaledX, scaledY);
      });

      resolve(canvas);
    };

    img.onerror = () => {
      reject(new Error("Failed to load image"));
    };

    img.src = imageUrl;
  });
}
