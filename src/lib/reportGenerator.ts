// src/lib/reportGenerator.ts

import jsPDF from "jspdf";
import { Annotation } from "@/types";
import { storage } from "./storage";

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

  // ========== COVER PAGE ==========
  let yPosition = 60;

  // Title
  pdf.setFillColor(31, 41, 55); // gray-900
  pdf.rect(0, 40, pageWidth, 30, "F");
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(24);
  pdf.setFont("helvetica", "bold");
  pdf.text("IMAGE VERIFICATION REPORT", pageWidth / 2, 58, { align: "center" });

  yPosition = 100;
  pdf.setTextColor(0, 0, 0);

  // Metadata Box
  pdf.setFillColor(249, 250, 251); // gray-50
  pdf.roundedRect(margin, yPosition, contentWidth, 50, 3, 3, "F");
  pdf.setDrawColor(229, 231, 235); // gray-200
  pdf.roundedRect(margin, yPosition, contentWidth, 50, 3, 3, "S");

  pdf.setFontSize(10);
  pdf.setFont("helvetica", "bold");
  pdf.setTextColor(75, 85, 99); // gray-600

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
  const withEvidence = data.annotations.filter(
    (a) => a.proofSnapAssetId
  ).length;
  const withComments = data.annotations.filter((a) => a.comment).length;

  pdf.setFillColor(239, 246, 255); // blue-50
  pdf.roundedRect(margin, yPosition, contentWidth, 45, 3, 3, "F");
  pdf.setDrawColor(191, 219, 254); // blue-200
  pdf.roundedRect(margin, yPosition, contentWidth, 45, 3, 3, "S");

  pdf.setFontSize(10);
  pdf.setFont("helvetica", "bold");
  pdf.setTextColor(30, 64, 175); // blue-800
  pdf.text("SUMMARY STATISTICS", margin + 10, yPosition + 12);

  pdf.setFont("helvetica", "normal");
  pdf.setTextColor(0, 0, 0);

  const statsY = yPosition + 22;
  const col1 = margin + 10;
  const col2 = margin + contentWidth / 2;

  pdf.setFontSize(9);
  pdf.setTextColor(75, 85, 99);
  pdf.text("Total Findings:", col1, statsY);
  pdf.text("With Evidence:", col1, statsY + 8);
  pdf.text("With Comments:", col2, statsY);
  pdf.text("Verification Status:", col2, statsY + 8);

  pdf.setFont("helvetica", "bold");
  pdf.setTextColor(0, 0, 0);
  pdf.setFontSize(11);
  pdf.text(String(data.annotations.length), col1 + 40, statsY);
  pdf.text(String(withEvidence), col1 + 40, statsY + 8);
  pdf.text(String(withComments), col2 + 42, statsY);

  // Status badge
  const statusText = withEvidence > 0 ? "VERIFIED" : "UNVERIFIED";
  const statusColor = withEvidence > 0 ? [34, 197, 94] : [239, 68, 68]; // green-500 : red-500
  pdf.setFillColor(statusColor[0], statusColor[1], statusColor[2]);
  pdf.roundedRect(col2 + 42, statsY + 3, 28, 6, 2, 2, "F");
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(8);
  pdf.text(statusText, col2 + 56, statsY + 7.5, { align: "center" });

  // ========== NEW PAGE - ANNOTATED IMAGE ==========
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
    const maxHeight = 160;
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

  // ========== FINDINGS SECTION ==========
  pdf.setTextColor(0, 0, 0);
  pdf.setFontSize(16);
  pdf.setFont("helvetica", "bold");
  pdf.text("Detailed Findings", margin, yPosition);
  yPosition += 10;

  data.annotations.forEach((annotation, index) => {
    // Calculate box height based on content
    let boxHeight = 28; // Base height

    if (annotation.comment) {
      const lines = pdf.splitTextToSize(annotation.comment, contentWidth - 30);
      boxHeight = Math.max(35, 20 + lines.length * 5);
    }

    // Check if we need a new page
    if (yPosition + boxHeight > 260) {
      pdf.addPage();
      yPosition = 20;
    }

    // Finding box
    pdf.setFillColor(249, 250, 251);
    pdf.roundedRect(margin, yPosition, contentWidth, boxHeight, 2, 2, "F");
    pdf.setDrawColor(229, 231, 235);
    pdf.roundedRect(margin, yPosition, contentWidth, boxHeight, 2, 2, "S");

    const innerY = yPosition + 10;

    // Number badge
    pdf.setFillColor(239, 68, 68); // red-500
    pdf.circle(margin + 8, innerY, 6, "F");
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(10);
    pdf.setFont("helvetica", "bold");
    pdf.text(String(index + 1), margin + 8, innerY + 3, { align: "center" });

    // Title
    pdf.setTextColor(0, 0, 0);
    pdf.setFontSize(11);
    pdf.text(`Finding #${index + 1}`, margin + 18, innerY + 2);

    // Evidence badge (top right)
    if (annotation.proofSnapAssetId) {
      pdf.setFillColor(34, 197, 94); // green-500
      pdf.roundedRect(
        margin + contentWidth - 52,
        yPosition + 6,
        47,
        8,
        2,
        2,
        "F"
      );
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(8);
      pdf.setFont("helvetica", "bold");
      pdf.text("VERIFIED", margin + contentWidth - 28.5, yPosition + 11, {
        align: "center",
      });
    }

    // Comment
    let contentY = innerY + 8;
    pdf.setFontSize(9);
    pdf.setFont("helvetica", "normal");

    if (annotation.comment) {
      pdf.setTextColor(55, 65, 81); // gray-700
      const lines = pdf.splitTextToSize(annotation.comment, contentWidth - 30);
      pdf.text(lines, margin + 18, contentY);
      contentY += lines.length * 5;
    } else {
      pdf.setTextColor(156, 163, 175); // gray-400
      pdf.setFont("helvetica", "italic");
      pdf.text("No comment provided", margin + 18, contentY);
      contentY += 5;
    }

    // Bottom row: timestamp and evidence link
    const bottomY = yPosition + boxHeight - 6;

    pdf.setTextColor(107, 114, 128);
    pdf.setFontSize(7);
    pdf.setFont("helvetica", "normal");
    pdf.text(
      `Logged: ${new Date(annotation.createdAt).toLocaleString()}`,
      margin + 18,
      bottomY
    );

    // ProofSnap link (right aligned)
    if (annotation.proofSnapUrl) {
      pdf.setTextColor(59, 130, 246); // blue-500
      pdf.setFont("helvetica", "normal");
      pdf.textWithLink("View Evidence →", margin + contentWidth - 32, bottomY, {
        url: annotation.proofSnapUrl,
      });
    }

    yPosition += boxHeight + 6;
  });

  // ========== CONCLUSION ==========
  if (yPosition > 220) {
    pdf.addPage();
    yPosition = 20;
  } else {
    yPosition += 10;
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

  const conclusionText = `This report documents ${
    data.annotations.length
  } finding(s) identified during the analysis of ${data.imageTitle}. ${
    withEvidence > 0
      ? `${withEvidence} finding(s) include cryptographic evidence from ProofSnap, providing verifiable proof of investigation.`
      : "No cryptographic evidence was attached to the findings."
  } This report was generated by ImageProof Studio and should be reviewed by qualified personnel.`;

  const conclusionLines = pdf.splitTextToSize(conclusionText, contentWidth);
  pdf.text(conclusionLines, margin, yPosition);

  // ========== FOOTER ON ALL PAGES ==========
  const pageCount = pdf.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    pdf.setPage(i);

    // Footer line
    pdf.setDrawColor(229, 231, 235);
    pdf.setLineWidth(0.3);
    pdf.line(margin, pageHeight - 15, pageWidth - margin, pageHeight - 15);

    // Footer text
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

      // Calculate scale factors
      const scaleX = img.width / canvasWidth;
      const scaleY = img.height / canvasHeight;

      // Draw image
      ctx.drawImage(img, 0, 0);

      // Draw annotations with scaled coordinates
      annotations.forEach((annotation, index) => {
        const scaledX = annotation.x * scaleX;
        const scaledY = annotation.y * scaleY;
        const scaledRadius = 20 * Math.min(scaleX, scaleY);

        // Draw circle
        ctx.beginPath();
        ctx.arc(scaledX, scaledY, scaledRadius, 0, 2 * Math.PI);
        ctx.fillStyle = "rgba(239, 68, 68, 0.9)";
        ctx.fill();
        ctx.strokeStyle = "#fff";
        ctx.lineWidth = 3 * Math.min(scaleX, scaleY);
        ctx.stroke();

        // Draw number
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
