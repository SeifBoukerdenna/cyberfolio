// Modifications for NeuralInterface.tsx to ensure it doesn't block node interactions

import React, { useState, useEffect, useRef } from 'react';
import './NeuralInterface.css';
import { playNeuralSound } from '../neuralAudioManager/NeuralAudioManager';

interface NeuralInterfaceProps {
    neuralActivityLevel: number;
    onActivityChange?: (value: number) => void;
    style?: React.CSSProperties; // Add style prop to accept custom styles
}

const NeuralInterface: React.FC<NeuralInterfaceProps> = ({
    neuralActivityLevel = 75,
    onActivityChange,
    style // Accept custom styles from parent
}) => {
    const [neuralSpikes, setNeuralSpikes] = useState<{ id: number, x: number, y: number, size: number }[]>([]);
    const [lastMousePosition, setLastMousePosition] = useState<{ x: number, y: number } | null>(null);
    const [scanPosition, setScanPosition] = useState(0);

    const interfaceRef = useRef<HTMLDivElement>(null);

    // Create a new neural spike animation
    const createNeuralSpike = (x?: number, y?: number) => {
        if (!interfaceRef.current) return;

        const bounds = interfaceRef.current.getBoundingClientRect();
        const spikeX = x ?? Math.random() * bounds.width;
        const spikeY = y ?? Math.random() * bounds.height;

        const newSpike = {
            id: Date.now() + Math.random(),
            x: spikeX,
            y: spikeY,
            size: 10 + Math.random() * 20
        };

        setNeuralSpikes(prev => [...prev, newSpike]);

        // Remove spike after animation
        setTimeout(() => {
            setNeuralSpikes(prev => prev.filter(spike => spike.id !== newSpike.id));
        }, 2000);

        playNeuralSound('synapse');
    };

    // Handle interface click
    const handleInterfaceClick = (e: React.MouseEvent<HTMLDivElement>) => {
        // Only handle the click if it wasn't meant for a node underneath
        // We'll check this in the actual implementation by stopping propagation
        // in the node click handler

        const bounds = interfaceRef.current?.getBoundingClientRect();
        if (!bounds) return;

        const x = e.clientX - bounds.left;
        const y = e.clientY - bounds.top;

        createNeuralSpike(x, y);

        // Bubble up the activity change
        if (onActivityChange) {
            onActivityChange(Math.min(100, neuralActivityLevel + 2));
        }
    };

    // Randomly create neural spikes for ambient effect
    useEffect(() => {
        const interval = setInterval(() => {
            if (Math.random() < 0.3) {
                createNeuralSpike();
            }
        }, 3000);

        return () => clearInterval(interval);
    }, []);

    // Update scan position for the horizontal scan effect
    useEffect(() => {
        const animate = () => {
            setScanPosition(prev => {
                if (prev >= 100) return 0;
                return prev + 0.2;
            });
        };

        const interval = setInterval(animate, 16);
        return () => clearInterval(interval);
    }, []);

    // Handle mouse movement for interactive effects
    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!interfaceRef.current) return;

        const bounds = interfaceRef.current.getBoundingClientRect();
        const x = e.clientX - bounds.left;
        const y = e.clientY - bounds.top;

        // Create glitch points when mouse moves quickly
        if (lastMousePosition) {
            const dx = x - lastMousePosition.x;
            const dy = y - lastMousePosition.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance > 100 && Math.random() < 0.1) {
                createNeuralSpike(x, y);
            }
        }

        setLastMousePosition({ x, y });
    };

    // Combine built-in styles with any passed-in styles
    const combinedStyles: React.CSSProperties = {
        pointerEvents: 'none', // Critical change: always set to none
        ...style
    };

    return (
        <div
            className="neural-interface"
            ref={interfaceRef}
            onClick={handleInterfaceClick}
            onMouseMove={handleMouseMove}
            style={combinedStyles}
        >
            {/* Horizontal scan effect */}
            <div
                className="neural-scan-line"
                style={{ top: `${scanPosition}%` }}
            ></div>

            {/* Neural spikes */}
            {neuralSpikes.map(spike => (
                <div
                    key={spike.id}
                    className="neural-spike"
                    style={{
                        left: `${spike.x}px`,
                        top: `${spike.y}px`,
                        width: `${spike.size}px`,
                        height: `${spike.size}px`,
                        pointerEvents: 'none' // Ensure spikes don't block click events
                    }}
                ></div>
            ))}

            {/* Neural grid overlay */}
            <div className="neural-grid"></div>
        </div>
    );
};

export default NeuralInterface;