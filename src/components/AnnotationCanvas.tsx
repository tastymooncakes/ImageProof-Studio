// src/components/AnnotationCanvas.tsx
"use client";

import React, { useRef, useEffect, useState, useCallback } from "react";
import { Stage, Layer, Image as KonvaImage, Circle, Text } from "react-konva";
import { KonvaEventObject } from "konva/lib/Node";
import { Annotation } from "@/types";

interface AnnotationCanvasProps {
  imageUrl: string;
  annotations: Annotation[];
  onAddAnnotation: (x: number, y: number) => void;
  onSelectAnnotation: (annotation: Annotation) => void;
  onDimensionsChange?: (width: number, height: number) => void;
}

export default function AnnotationCanvas({
  imageUrl,
  annotations,
  onAddAnnotation,
  onSelectAnnotation,
  onDimensionsChange,
}: AnnotationCanvasProps) {
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  // Calculate responsive dimensions
  const calculateDimensions = useCallback(
    (img: HTMLImageElement) => {
      if (!containerRef.current) return;

      const containerWidth = containerRef.current.offsetWidth;
      const aspectRatio = img.height / img.width;
      const width = Math.min(containerWidth, img.width);
      const height = width * aspectRatio;

      setDimensions({ width, height });

      // Notify parent of dimensions
      if (onDimensionsChange) {
        onDimensionsChange(width, height);
      }
    },
    [onDimensionsChange]
  );

  // Load image
  useEffect(() => {
    const img = new window.Image();
    img.src = imageUrl;
    img.onload = () => {
      setImage(img);
      calculateDimensions(img);
    };
  }, [imageUrl, calculateDimensions]);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      if (image) calculateDimensions(image);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [image, calculateDimensions]);

  const handleCanvasClick = (e: KonvaEventObject<MouseEvent>) => {
    const stage = e.target.getStage();
    const pointerPosition = stage?.getPointerPosition();

    if (pointerPosition) {
      onAddAnnotation(pointerPosition.x, pointerPosition.y);
    }
  };

  return (
    <div ref={containerRef} className="w-full">
      <Stage
        width={dimensions.width}
        height={dimensions.height}
        onClick={handleCanvasClick}
        className="cursor-crosshair rounded-lg"
      >
        <Layer>
          {image && (
            <KonvaImage
              image={image}
              width={dimensions.width}
              height={dimensions.height}
            />
          )}

          {/* Render annotation markers */}
          {annotations.map((annotation, index) => (
            <React.Fragment key={annotation.id}>
              <Circle
                x={annotation.x}
                y={annotation.y}
                radius={20}
                fill="rgba(239, 68, 68, 0.8)"
                stroke="#fff"
                strokeWidth={2}
                onClick={() => onSelectAnnotation(annotation)}
                onTap={() => onSelectAnnotation(annotation)}
              />
              <Text
                x={annotation.x - 6}
                y={annotation.y - 8}
                text={String(index + 1)}
                fontSize={16}
                fontStyle="bold"
                fill="#fff"
                onClick={() => onSelectAnnotation(annotation)}
                onTap={() => onSelectAnnotation(annotation)}
              />
            </React.Fragment>
          ))}
        </Layer>
      </Stage>
    </div>
  );
}
