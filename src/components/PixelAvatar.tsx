"use client";

import React, { useRef, useEffect, useState } from "react";

interface PixelAvatarProps {
  resolutionPct: number; // 0 to 100
  className?: string;
  size?: number; // size in pixels, e.g. 240
}

export default function PixelAvatar({
  resolutionPct,
  className = "",
  size = 240,
}: PixelAvatarProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [imgElement, setImgElement] = useState<HTMLImageElement | null>(null);
  const [imageLoaded, setImageLoaded] = useState(false);

  // Preload image
  useEffect(() => {
    const img = new Image();
    img.src = "/hero.png";
    img.onload = () => {
      setImgElement(img);
      setImageLoaded(true);
    };
    img.onerror = () => {
      console.error("Failed to load /hero.png base image.");
    };
  }, []);

  // Render logic
  useEffect(() => {
    if (!imageLoaded || !imgElement || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Device Pixel Ratio scaling for retina screens
    const dpr = window.devicePixelRatio || 1;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    ctx.scale(dpr, dpr);

    // Turn off smoothing to get crisp blocky pixelation
    ctx.imageSmoothingEnabled = false;

    // Level maps resolutionPct (0..100) to downscale factor (0.02..1.0)
    const level = 0.02 + (resolutionPct / 100) * 0.98;
    
    // Calculate intermediate tiny dimensions
    const w = Math.max(1, Math.floor(size * level));
    const h = Math.max(1, Math.floor(size * level));

    // Two-step drawing: Draw down to small offscreen canvas, then stretch back up
    const offscreen = document.createElement("canvas");
    offscreen.width = w;
    offscreen.height = h;
    const offCtx = offscreen.getContext("2d");

    if (offCtx) {
      offCtx.imageSmoothingEnabled = false;
      offCtx.drawImage(imgElement, 0, 0, w, h);
    }

    // Clear main canvas and draw the blocky representation
    ctx.clearRect(0, 0, size, size);
    ctx.drawImage(offscreen, 0, 0, w, h, 0, 0, size, size);
  }, [resolutionPct, imageLoaded, imgElement, size]);

  // Aesthetic mapping: desaturate + dim at low resolution; restore warmth/light at high
  const saturation = Math.min(100, 25 + (resolutionPct / 100) * 75); // 25% -> 100%
  const brightness = Math.min(100, 45 + (resolutionPct / 100) * 55); // 45% -> 100%

  return (
    <div className={`relative flex items-center justify-center ${className}`} style={{ width: size, height: size }}>
      {/* Dynamic styling for saturation, brightness, and warmth */}
      <canvas
        ref={canvasRef}
        style={{
          width: size,
          height: size,
          filter: `saturate(${saturation}%) brightness(${brightness}%) contrast(105%)`,
          transition: "filter 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
        }}
        className="rounded-xl shadow-md border border-[var(--border-color)] bg-white dark:bg-dark-surface"
      />

      {/* Hidden <img> fallback for SEO and accessibility accessibility */}
      <img src="/hero.png" alt="Avatar Hero" className="sr-only" />

      {/* Loading state indicator */}
      {!imageLoaded && (
        <div className="absolute inset-0 bg-neutral-100 dark:bg-neutral-900 rounded-xl flex items-center justify-center">
          <div className="w-6 h-6 border border-teal/30 rounded-full flex items-center justify-center animate-pulse">
            <div className="w-2 h-2 rounded-full bg-teal" />
          </div>
        </div>
      )}
    </div>
  );
}
