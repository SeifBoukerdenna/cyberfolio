import React, { useState, useEffect, useRef } from 'react';
import './NeuralInterface.css';
import { playNeuralSound } from '../neuralAudioManager/NeuralAudioManager';

interface NeuralInterfaceProps {
    neuralActivityLevel: number;
    onActivityChange?: (value: number) => void;
}

// Neural system messages for random display
const NEURAL_MESSAGES = [
    'Synaptic pathways enhanced',
    'Neural cluster optimized',
    'Cerebral interface active',
    'Cognitive analysis in progress',
    'Memory engram stabilized',
    'Dendrite amplification: 85%',
    'Neocortex synchronization complete',
    'Consciousness stream monitoring active',
    'Neural partition established',
    'Limbic resonance detected',
    'Axon pathway reinforced',
    'Cognitive matrix expanded',
    'Neuroplasticity factor: 14.3',
    'Synapse firing threshold adjusted',
    'Memory consolidation in progress'
];

const NeuralInterface: React.FC<NeuralInterfaceProps> = ({
    neuralActivityLevel = 75,
    onActivityChange
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

    // Display a random neural message at cursor position
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const showMessageAtCursor = (x: number, y: number) => {
        if (!interfaceRef.current) return;

        const message = NEURAL_MESSAGES[Math.floor(Math.random() * NEURAL_MESSAGES.length)];
        const messageEl = document.createElement('div');
        messageEl.className = 'neural-cursor-message';
        messageEl.textContent = message;
        messageEl.style.left = `${x}px`;
        messageEl.style.top = `${y}px`;

        interfaceRef.current.appendChild(messageEl);

        // Remove after animation finishes
        setTimeout(() => {
            if (messageEl.parentNode === interfaceRef.current) {
                if (interfaceRef.current) {
                    interfaceRef.current.removeChild(messageEl);
                }
            }
        }, 2000);
    };

    return (
        <div
            className="neural-interface"
            ref={interfaceRef}
            onClick={handleInterfaceClick}
            onMouseMove={handleMouseMove}
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
                        height: `${spike.size}px`
                    }}
                ></div>
            ))}

            {/* Neural grid overlay */}
            <div className="neural-grid"></div>
        </div>
    );
};

export default NeuralInterface;