import React, { useRef, useEffect } from "react";

export default function AnnotatedImage({ imageUrl, predictions }) {
  const canvasRef = useRef(null);
  const imgRef = useRef(null);

  useEffect(() => {
    if (!imageUrl || predictions.length === 0) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const img = imgRef.current;

    img.onload = () => {
      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Calculate scale to fit image inside 400x400
      const scale = Math.min(
        canvas.width / img.naturalWidth,
        canvas.height / img.naturalHeight
      );
      const xOffset = (canvas.width - img.naturalWidth * scale) / 2;
      const yOffset = (canvas.height - img.naturalHeight * scale) / 2;

      // Draw image centered and scaled
      ctx.drawImage(
        img,
        0,
        0,
        img.naturalWidth,
        img.naturalHeight,
        xOffset,
        yOffset,
        img.naturalWidth * scale,
        img.naturalHeight * scale
      );

      // Draw bounding boxes and labels
      predictions.forEach(pred => {
        // Convert center-based to top-left and scale
        const x = xOffset + (pred.x - pred.width / 2) * scale;
        const y = yOffset + (pred.y - pred.height / 2) * scale;
        const w = pred.width * scale;
        const h = pred.height * scale;

        // Draw bounding box
        ctx.strokeStyle = "#00FF00";
        ctx.lineWidth = 2;
        ctx.strokeRect(x, y, w, h);

        // Draw label at bottom-right of box
        const label = `${pred.class} (${(pred.confidence * 100).toFixed(1)}%)`;
        ctx.font = "16px Segoe UI, Arial";
        const textWidth = ctx.measureText(label).width;
        const labelX = x + w - textWidth - 8;
        const labelY = y + h - 8;

        // Draw label background
        ctx.fillStyle = "rgba(0,255,0,0.7)";
        ctx.fillRect(labelX - 4, labelY - 18, textWidth + 8, 22);

        // Draw label text
        ctx.fillStyle = "#000";
        ctx.fillText(label, labelX, labelY);
      });
    };

    // Redraw if image already loaded
    if (img.complete) img.onload();
  }, [imageUrl, predictions]);

  return (
    <div style={{ position: "relative", width: 400, height: 400 }}>
      <img
        ref={imgRef}
        src={imageUrl}
        alt="Analyzed"
        style={{
          width: 400,
          height: 400,
          position: "absolute",
          top: 0,
          left: 0,
          objectFit: "contain",
          zIndex: 1,
          borderRadius: 8,
          visibility: "hidden", // Hide the img, only use for drawing on canvas
        }}
        crossOrigin="anonymous"
      />
      <canvas
        ref={canvasRef}
        width={400}
        height={400}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          zIndex: 2,
          pointerEvents: "none",
          borderRadius: 8,
        }}
      />
    </div>
  );
}
