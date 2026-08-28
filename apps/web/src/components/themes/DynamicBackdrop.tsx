'use client';

import React, { useEffect, useRef } from 'react';
import { useTheme } from '../../context/ThemeContext';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  color: string;
  rotation?: number;
  rotationSpeed?: number;
  phase?: number;
}

export const DynamicBackdrop: React.FC = () => {
  const { currentTheme } = useTheme();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    let isVisible = !document.hidden;

    const handleVisibilityChange = () => {
      isVisible = !document.hidden;
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      initParticles();
    };
    window.addEventListener('resize', handleResize);

    const animType = currentTheme?.animation || 'spotlight';
    const palette = currentTheme?.palette || ['#D39B3D', '#58111A', '#8F2532'];

    // Initialize Theme Particles
    let particles: Particle[] = [];
    const particleCount = animType === 'festival' ? 70 : animType === 'story_spotlight' ? 25 : 45;

    const initParticles = () => {
      particles = [];
      for (let i = 0; i < particleCount; i++) {
        const color = palette[i % palette.length];
        particles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * (animType === 'festival' ? 1.5 : 0.6),
          vy: animType === 'leaf_float' ? Math.random() * 0.8 + 0.3 : animType === 'lamp_flicker' ? -(Math.random() * 0.7 + 0.2) : (Math.random() - 0.5) * 0.6,
          size: animType === 'leaf_float' ? Math.random() * 5 + 3 : Math.random() * 3.5 + 1.5,
          alpha: Math.random() * 0.5 + 0.2,
          color,
          rotation: Math.random() * Math.PI * 2,
          rotationSpeed: (Math.random() - 0.5) * 0.03,
          phase: Math.random() * Math.PI * 2
        });
      }
    };

    initParticles();
    let time = 0;

    const render = () => {
      if (!isVisible) {
        animationFrameId = requestAnimationFrame(render);
        return;
      }

      ctx.clearRect(0, 0, width, height);

      // 1. Draw Base Theme Ambient Lighting
      if (animType === 'spotlight' || animType === 'lamp_flicker') {
        const spotGrad = ctx.createRadialGradient(
          width * 0.5 + Math.sin(time * 0.01) * (width * 0.15),
          height * 0.35 + Math.cos(time * 0.008) * (height * 0.1),
          20,
          width * 0.5,
          height * 0.4,
          Math.max(width, height) * 0.7
        );
        spotGrad.addColorStop(0, `${palette[0]}26`);
        spotGrad.addColorStop(0.5, `${palette[1]}14`);
        spotGrad.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = spotGrad;
        ctx.fillRect(0, 0, width, height);
      } else if (animType === 'dial_pulse') {
        // Concentric Radio Waves
        const pulse = (time * 0.02) % 1;
        for (let r = 1; r <= 3; r++) {
          const radius = ((pulse + r / 3) % 1) * Math.min(width, height) * 0.8;
          ctx.beginPath();
          ctx.arc(width / 2, height / 2, radius, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(139, 92, 246, ${0.15 * (1 - radius / (Math.min(width, height) * 0.8))})`;
          ctx.lineWidth = 1.5;
          ctx.stroke();
        }
      } else if (animType === 'story_spotlight') {
        // Noir Single Spotlight in heavy darkness
        const spot = ctx.createRadialGradient(
          width * 0.5,
          height * 0.45,
          10,
          width * 0.5,
          height * 0.45,
          Math.min(width, height) * 0.55
        );
        spot.addColorStop(0, 'rgba(168, 85, 247, 0.12)');
        spot.addColorStop(0.4, 'rgba(30, 10, 45, 0.25)');
        spot.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = spot;
        ctx.fillRect(0, 0, width, height);
      }

      // 2. Animate and Render Particles
      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;

        if (p.rotation !== undefined && p.rotationSpeed !== undefined) {
          p.rotation += p.rotationSpeed;
        }

        // Screen wrap
        if (p.x < -20) p.x = width + 20;
        if (p.x > width + 20) p.x = -20;
        if (p.y < -20) p.y = height + 20;
        if (p.y > height + 20) p.y = -20;

        ctx.save();
        ctx.globalAlpha = p.alpha * (0.6 + 0.4 * Math.sin((time * 0.05) + (p.phase || 0)));

        if (animType === 'leaf_float') {
          ctx.translate(p.x, p.y);
          ctx.rotate(p.rotation || 0);
          ctx.fillStyle = p.color;
          ctx.beginPath();
          ctx.ellipse(0, 0, p.size, p.size * 0.5, 0, 0, Math.PI * 2);
          ctx.fill();
        } else if (animType === 'festival') {
          ctx.translate(p.x, p.y);
          ctx.rotate(p.rotation || 0);
          ctx.fillStyle = p.color;
          ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 1.5);
        } else if (animType === 'light_trails') {
          ctx.strokeStyle = p.color;
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p.x - p.vx * 12, p.y - p.vy * 12);
          ctx.stroke();
        } else {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fillStyle = p.color;
          ctx.fill();
        }

        ctx.restore();
      }

      // 3. VHS Scanlines Effect for 'drift' (Roadside Nostalgia)
      if (animType === 'drift') {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.015)';
        for (let y = 0; y < height; y += 4) {
          ctx.fillRect(0, y, width, 1);
        }
      }

      time += 1;
      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      cancelAnimationFrame(animationFrameId);
    };
  }, [currentTheme]);

  const bgColor = currentTheme?.cssVariables?.['--bg-base'] || currentTheme?.palette[1] || '#1A0409';

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {/* Background Dynamic Color Layer */}
      <div
        className="absolute inset-0 transition-colors duration-1000 ease-out"
        style={{
          backgroundColor: bgColor
        }}
      />

      {/* HTML5 Canvas Ambient Particle & Shader Layer */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full block opacity-75"
      />

      {/* Subtle Cinematic Vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(0,0,0,0.65)_100%)] pointer-events-none" />
    </div>
  );
};

export default DynamicBackdrop;
