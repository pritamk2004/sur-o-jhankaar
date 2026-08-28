'use client';

import React, { useEffect, useRef } from 'react';

interface StoryVisualizerProps {
  isPlaying: boolean;
}

export const StoryVisualizer: React.FC<StoryVisualizerProps> = ({ isPlaying }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let time = 0;

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };

    resize();
    window.addEventListener('resize', resize);

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      const baseRadius = Math.min(centerX, centerY) * 0.45;

      // Dark Eerie Radial Glow
      const gradient = ctx.createRadialGradient(
        centerX,
        centerY,
        10,
        centerX,
        centerY,
        baseRadius * 1.6
      );
      gradient.addColorStop(0, 'rgba(126, 34, 206, 0.35)');
      gradient.addColorStop(0.5, 'rgba(88, 28, 135, 0.15)');
      gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Circular Waveform
      const bars = 48;
      ctx.beginPath();
      for (let i = 0; i < bars; i++) {
        const angle = (i / bars) * Math.PI * 2;
        const freq = isPlaying
          ? Math.sin(time * 0.05 + i * 0.3) * Math.cos(time * 0.03 + i * 0.2)
          : 0.1;
        const barHeight = 10 + Math.abs(freq) * 35;

        const x1 = centerX + Math.cos(angle) * baseRadius;
        const y1 = centerY + Math.sin(angle) * baseRadius;
        const x2 = centerX + Math.cos(angle) * (baseRadius + barHeight);
        const y2 = centerY + Math.sin(angle) * (baseRadius + barHeight);

        ctx.strokeStyle = `hsla(${270 + i * 2}, 85%, 65%, ${0.4 + Math.abs(freq) * 0.6})`;
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
      }
      ctx.stroke();

      // Atmospheric Mystery Core
      ctx.beginPath();
      ctx.arc(centerX, centerY, baseRadius * 0.85, 0, Math.PI * 2);
      ctx.fillStyle = '#08010B';
      ctx.fill();
      ctx.strokeStyle = 'rgba(168, 85, 247, 0.3)';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Icon Center
      ctx.font = `${Math.floor(baseRadius * 0.55)}px serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('🕯️', centerX, centerY);

      time += 1;
      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [isPlaying]);

  return (
    <div className="relative w-full h-full max-w-[360px] aspect-square rounded-3xl overflow-hidden glass-panel p-2 border-2 border-purple-900/30 flex items-center justify-center bg-black/80">
      <canvas ref={canvasRef} className="w-full h-full block" />
    </div>
  );
};

export default StoryVisualizer;
