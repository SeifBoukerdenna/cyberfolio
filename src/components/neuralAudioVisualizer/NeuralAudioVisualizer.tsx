import React, { useEffect, useRef, useState } from 'react';
import './NeuralAudioVisualizer.css';
import { playNeuralSound, toggleNeuralAmbient } from '../neuralAudioManager/NeuralAudioManager';

interface NeuralAudioVisualizerProps {
    visible: boolean;
}

// Simulate frequency data for visualization
// (In a real implementation, this would come from WebAudio API's AnalyserNode)
const NeuralAudioVisualizer: React.FC<NeuralAudioVisualizerProps> = ({ visible }) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [volume, setVolume] = useState(0.3);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const animationRef = useRef<number>(0);
    const frequencyData = useRef<number[]>([]);

    // Initialize frequency data
    useEffect(() => {
        // Create initial frequency data (32 bands)
        frequencyData.current = Array(32).fill(0).map(() => Math.random() * 50);
    }, []);

    // Draw visualization
    useEffect(() => {
        if (!visible) return;

        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Set canvas dimensions
        canvas.width = canvas.clientWidth * 2;
        canvas.height = canvas.clientHeight * 2;

        const updateFrequencies = () => {
            // In a real implementation, this would get data from an audio analyser
            // Here we're just simulating activity
            frequencyData.current = frequencyData.current.map(val => {
                // If playing, values fluctuate more
                const changeAmount = isPlaying ? 15 : 5;
                const change = (Math.random() - 0.5) * changeAmount;
                return Math.max(0, Math.min(100, val + change));
            });
        };

        const draw = () => {
            updateFrequencies();

            // Clear canvas
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Draw frequency bars
            const barWidth = canvas.width / frequencyData.current.length - 1;

            // Background for the visualization area
            ctx.fillStyle = 'rgba(10, 10, 18, 0.4)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Draw bars
            frequencyData.current.forEach((value, index) => {
                const barHeight = (value / 100) * canvas.height;
                const x = index * (barWidth + 1);
                const y = canvas.height - barHeight;

                // Create gradient
                const gradient = ctx.createLinearGradient(0, y, 0, canvas.height);
                gradient.addColorStop(0, 'rgba(200, 175, 155, 0.8)');
                gradient.addColorStop(1, 'rgba(200, 175, 155, 0.2)');

                ctx.fillStyle = gradient;
                ctx.fillRect(x, y, barWidth, barHeight);
            });

            // Draw neural activity text
            ctx.font = '12px "Courier New", monospace';
            ctx.fillStyle = 'rgba(200, 175, 155, 0.8)';
            ctx.textAlign = 'right';
            ctx.fillText('NEURAL PATTERN', canvas.width - 10, 20);

            // Request next frame
            animationRef.current = requestAnimationFrame(draw);
        };

        // Start animation
        draw();

        // Cleanup
        return () => {
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
        };
    }, [visible, isPlaying]);

    // Toggle ambient sound
    const handleTogglePlay = () => {
        setIsPlaying(!isPlaying);
        toggleNeuralAmbient();
        playNeuralSound('click');
    };

    // Handle volume change
    const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newVolume = parseFloat(e.target.value);
        setVolume(newVolume);
        // In a real implementation, would update audio volume
    };

    if (!visible) return null;

    return (
        <div className="neural-audio-visualizer">
            <canvas ref={canvasRef} className="visualizer-canvas" />
            <div className="visualizer-controls">
                <button
                    className={`play-button ${isPlaying ? 'active' : ''}`}
                    onClick={handleTogglePlay}
                >
                    {isPlaying ? 'PAUSE' : 'PLAY'}
                </button>
                <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={volume}
                    onChange={handleVolumeChange}
                    className="volume-slider"
                />
            </div>
        </div>
    );
};

export default NeuralAudioVisualizer;