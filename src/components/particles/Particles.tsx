import React, { useRef, useEffect } from 'react';
import './Particles.css';

interface ParticlesProps {
    count?: number;
    speed?: number;
    color?: string;
    maxSize?: number;
}

interface Particle {
    x: number;
    y: number;
    size: number;
    speedX: number;
    speedY: number;
    opacity: number;
    color: string;
}

const Particles: React.FC<ParticlesProps> = ({
    count = 80,
    speed = 0.5,
    color = '#00ffaa',
    maxSize = 3
}) => {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const particlesRef = useRef<Particle[]>([]);
    const animationRef = useRef<number | null>(null);

    // Initialize particles
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const handleResize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;

            // Reset particles
            particlesRef.current = Array.from({ length: count }, () => createParticle(canvas));
        };

        handleResize();
        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, [count]);

    // Create a single particle
    const createParticle = (canvas: HTMLCanvasElement): Particle => {
        const size = Math.random() * maxSize + 0.5;
        return {
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            size,
            speedX: (Math.random() - 0.5) * speed,
            speedY: (Math.random() - 0.5) * speed,
            opacity: Math.random() * 0.7 + 0.1,
            color
        };
    };

    // Animate particles
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            particlesRef.current.forEach(particle => {
                // Update particle position
                particle.x += particle.speedX;
                particle.y += particle.speedY;

                // Wrap particles around the edges
                if (particle.x < 0) particle.x = canvas.width;
                if (particle.x > canvas.width) particle.x = 0;
                if (particle.y < 0) particle.y = canvas.height;
                if (particle.y > canvas.height) particle.y = 0;

                // Draw particle
                ctx.beginPath();
                ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
                ctx.fillStyle = particle.color + Math.floor(particle.opacity * 255).toString(16).padStart(2, '0');
                ctx.fill();
            });

            // Draw connections between close particles
            drawConnections(ctx);

            animationRef.current = requestAnimationFrame(animate);
        };

        animate();

        return () => {
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
        };
    }, [color]);

    // Draw connections between close particles
    const drawConnections = (ctx: CanvasRenderingContext2D) => {
        const maxDistance = 100;
        const particles = particlesRef.current;

        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                const dx = particles[i].x - particles[j].x;
                const dy = particles[i].y - particles[j].y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < maxDistance) {
                    const opacity = (1 - distance / maxDistance) * 0.2;

                    ctx.beginPath();
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);

                    // Use particle color with opacity
                    ctx.strokeStyle = color + Math.floor(opacity * 255).toString(16).padStart(2, '0');
                    ctx.lineWidth = 0.5;
                    ctx.stroke();
                }
            }
        }
    };

    return <canvas ref={canvasRef} className="particles-canvas" />;
};

export default Particles;