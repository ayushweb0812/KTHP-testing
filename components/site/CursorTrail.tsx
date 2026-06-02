"use client";

import { useEffect, useRef } from "react";

class Particle {
  x: number;
  y: number;
  size: number;
  speedX: number;
  speedY: number;
  life: number;
  maxLife: number;

  constructor(x: number, y: number) {
    // Add a little randomness to spawn position so they don't form a strict line
    this.x = x + (Math.random() * 6 - 3);
    this.y = y + (Math.random() * 6 - 3);
    this.size = Math.random() * 2.5 + 1; // 1 to 3.5 px
    this.speedX = Math.random() * 1.5 - 0.75;
    this.speedY = Math.random() * 1.5 - 0.75;
    this.maxLife = Math.random() * 40 + 20; // Lasts 20 to 60 frames
    this.life = this.maxLife;
  }

  update() {
    this.x += this.speedX;
    this.y += this.speedY;
    this.life -= 1;
    this.size = Math.max(0, this.size * 0.96); // Gradually shrink
  }

  draw(ctx: CanvasRenderingContext2D) {
    const alpha = this.life / this.maxLife;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    // Gold color: #cba052 -> rgb(203, 160, 82)
    ctx.fillStyle = `rgba(203, 160, 82, ${alpha})`;
    // Add a soft glow effect
    ctx.shadowBlur = 6;
    ctx.shadowColor = `rgba(203, 160, 82, ${alpha * 0.8})`;
    ctx.fill();
  }
}

export default function CursorTrail() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let particlesArray: Particle[] = [];
    let animationFrameId: number;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const mouse = {
      x: -100,
      y: -100,
    };

    let isMoving = false;
    let moveTimeout: NodeJS.Timeout;

    const handleMouseMove = (event: MouseEvent) => {
      mouse.x = event.clientX;
      mouse.y = event.clientY;
      isMoving = true;
      
      // Spawn particles only when moving
      for (let i = 0; i < 3; i++) {
        particlesArray.push(new Particle(mouse.x, mouse.y));
      }

      clearTimeout(moveTimeout);
      moveTimeout = setTimeout(() => {
        isMoving = false;
      }, 50);
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      for (let i = 0; i < particlesArray.length; i++) {
        particlesArray[i].update();
        particlesArray[i].draw(ctx);
        
        if (particlesArray[i].life <= 0) {
          particlesArray.splice(i, 1);
          i--;
        }
      }
      
      animationFrameId = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", handleMouseMove);
      clearTimeout(moveTimeout);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed top-0 left-0 w-screen h-screen z-[9999]"
      style={{ mixBlendMode: "screen" }}
      aria-hidden="true"
    />
  );
}
