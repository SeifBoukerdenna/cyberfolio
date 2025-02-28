import React, { useState, useEffect, useRef } from 'react';
import './NeuralChrome.css';
import { playNeuralSound } from '../neuralAudioManager/NeuralAudioManager';

interface NeuralChromeProps {
    intensity?: number; // Controls glitch intensity (0-1)
    children: React.ReactNode;
}

// Define interface for glitch coordinates
interface GlitchPoint {
    id: number;
    x: number;
    y: number;
    width: number;
    height: number;
    duration: number;
    startTime: number;
}

const NeuralChrome: React.FC<NeuralChromeProps> = ({
    intensity = 0.3,
    children
}) => {
    const [glitchActive, setGlitchActive] = useState(false);
    const [chromaActive, setChromaActive] = useState(false);
    const [glitchPoints, setGlitchPoints] = useState<GlitchPoint[]>([]);
    const [lastMousePosition, setLastMousePosition] = useState<{ x: number, y: number } | null>(null);
    const [scanlineIntensity, setScanlineIntensity] = useState(0.5);

    const containerRef = useRef<HTMLDivElement>(null);
    const glitchTimeout = useRef<NodeJS.Timeout | null>(null);
    const chromaTimeout = useRef<NodeJS.Timeout | null>(null);

    // Initialize random glitch effect
    useEffect(() => {
        const triggerRandomGlitch = () => {
            if (Math.random() < intensity * 0.2) {
                triggerGlitch();
            }

            if (Math.random() < intensity * 0.1) {
                triggerChromaShift();
            }

            // Adjust scanlines randomly
            if (Math.random() < 0.1) {
                setScanlineIntensity(0.3 + Math.random() * 0.5);
            }

            // Schedule next glitch
            const nextGlitchTime = 5000 + Math.random() * 10000 / (intensity + 0.1);
            setTimeout(triggerRandomGlitch, nextGlitchTime);
        };

        // Initial delay before first glitch
        const initialDelay = 3000 + Math.random() * 5000;
        const initialTimeout = setTimeout(triggerRandomGlitch, initialDelay);

        return () => {
            clearTimeout(initialTimeout);
            if (glitchTimeout.current) clearTimeout(glitchTimeout.current);
            if (chromaTimeout.current) clearTimeout(chromaTimeout.current);
        };
    }, [intensity]);

    // Trigger a glitch effect
    const triggerGlitch = () => {
        setGlitchActive(true);
        playNeuralSound('error');

        // Create random glitch points
        const newPoints: GlitchPoint[] = [];
        const count = 1 + Math.floor(Math.random() * 3 * intensity);

        if (!containerRef.current) return;

        const bounds = containerRef.current.getBoundingClientRect();

        for (let i = 0; i < count; i++) {
            const width = 50 + Math.random() * 150;
            const height = 10 + Math.random() * 30;
            const x = Math.random() * (bounds.width - width);
            const y = Math.random() * (bounds.height - height);

            newPoints.push({
                id: Date.now() + i,
                x,
                y,
                width,
                height,
                duration: 300 + Math.random() * 700,
                startTime: Date.now()
            });
        }

        setGlitchPoints(prevPoints => [...prevPoints, ...newPoints]);

        // Turn off glitch effect after a short duration
        if (glitchTimeout.current) clearTimeout(glitchTimeout.current);

        glitchTimeout.current = setTimeout(() => {
            setGlitchActive(false);
        }, 200 + Math.random() * 400 * intensity);
    };

    // Trigger a chroma shift effect
    const triggerChromaShift = () => {
        setChromaActive(true);

        // Turn off chroma effect after a short duration
        if (chromaTimeout.current) clearTimeout(chromaTimeout.current);

        chromaTimeout.current = setTimeout(() => {
            setChromaActive(false);
        }, 300 + Math.random() * 300 * intensity);
    };

    // Clean up expired glitch points
    useEffect(() => {
        if (glitchPoints.length === 0) return;

        const now = Date.now();
        const activePoints = glitchPoints.filter(
            point => now - point.startTime < point.duration
        );

        if (activePoints.length !== glitchPoints.length) {
            setGlitchPoints(activePoints);
        }

        const checkInterval = setInterval(() => {
            setGlitchPoints(currentPoints =>
                currentPoints.filter(point => Date.now() - point.startTime < point.duration)
            );
        }, 100);

        return () => clearInterval(checkInterval);
    }, [glitchPoints]);

    // Handle mouse movement for interactive effects
    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!containerRef.current) return;

        const bounds = containerRef.current.getBoundingClientRect();
        const x = e.clientX - bounds.left;
        const y = e.clientY - bounds.top;

        // Create glitch points when mouse moves quickly
        if (lastMousePosition && Math.random() < intensity * 0.1) {
            const dx = x - lastMousePosition.x;
            const dy = y - lastMousePosition.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance > 100 * intensity) {
                const newPoint: GlitchPoint = {
                    id: Date.now(),
                    x: x - 25,
                    y: y - 5,
                    width: 50,
                    height: 10,
                    duration: 300,
                    startTime: Date.now()
                };

                setGlitchPoints(prev => [...prev, newPoint]);
                playNeuralSound('click');
            }
        }

        setLastMousePosition({ x, y });
    };

    return (
        <div
            ref={containerRef}
            className={`neural-chrome ${glitchActive ? 'glitch-active' : ''} ${chromaActive ? 'chroma-active' : ''}`}
            onMouseMove={handleMouseMove}
            onClick={() => Math.random() < 0.2 && triggerGlitch()}
        >
            {/* Main content */}
            <div className="chrome-content">
                {children}
            </div>

            {/* Scanlines overlay */}
            <div
                className="scanlines"
                style={{ opacity: scanlineIntensity * 0.15 }}
            ></div>

            {/* Vignette overlay */}
            <div className="vignette"></div>

            {/* Noise overlay */}
            <div className="noise"></div>

            {/* Glitch elements */}
            {glitchPoints.map(point => (
                <div
                    key={point.id}
                    className="glitch-element"
                    style={{
                        left: `${point.x}px`,
                        top: `${point.y}px`,
                        width: `${point.width}px`,
                        height: `${point.height}px`
                    }}
                ></div>
            ))}

            {/* RGB Split effect layers - visible when chroma is active */}
            <div className="chrome-red-shift"></div>
            <div className="chrome-blue-shift"></div>

            {/* Neural interface HUD elements */}
            <div className="neural-hud">
                <div className="hud-corner top-left"></div>
                <div className="hud-corner top-right"></div>
                <div className="hud-corner bottom-left"></div>
                <div className="hud-corner bottom-right"></div>

                <div className="hud-scan-line"></div>
            </div>
        </div>
    );
};

export default NeuralChrome;