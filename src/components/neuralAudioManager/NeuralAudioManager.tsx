/* eslint-disable react-refresh/only-export-components */
/* eslint-disable react-hooks/exhaustive-deps */

import React, { useEffect, useRef, useState } from 'react';
import './NeuralAudioManager.css';

interface NeuralAudioManagerProps {
    enabled?: boolean;
    volume?: number;
}

// Audio file paths - replace with actual files when available
const AUDIO_SOURCES = {
    ambientLoop: '/audio/neural.mp3',
    click: '/audio/neural.mp3',
    pulse: '/audio/neural.mp3',
    alert: '/audio/neural.mp3',
    synapse: '/audio/neural.mp3',
    dataTransfer: '/audio/neural.mp3',
    success: '/audio/neural.mp3',
    error: '/audio/neural.mp3'
};

// Define interface for the audio context
export interface NeuralAudioAPI {
    play: (soundName: keyof typeof AUDIO_SOURCES) => void;
    setVolume: (volume: number) => void;
    toggleAmbient: () => void;
    isAmbientPlaying: boolean;
}

// Create a global instance to be accessed throughout the app
export let neuralAudio: NeuralAudioAPI | null = null;

const NeuralAudioManager: React.FC<NeuralAudioManagerProps> = ({
    enabled = true,
    volume = 0.3
}) => {
    const [isAmbientPlaying, setIsAmbientPlaying] = useState(false);
    const [masterVolume, setMasterVolume] = useState(volume);
    const [visualize, setVisualize] = useState(false);
    const [, setFrequencies] = useState<number[]>([]);

    const audioElements = useRef<{ [key: string]: HTMLAudioElement | null }>({});
    const audioContext = useRef<AudioContext | null>(null);
    const analyser = useRef<AnalyserNode | null>(null);
    const ambientSource = useRef<MediaElementAudioSourceNode | null>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    // Initialize audio on component mount
    useEffect(() => {
        if (!enabled) return;

        // Create audio elements
        try {
            Object.entries(AUDIO_SOURCES).forEach(([key, src]) => {
                const audio = new Audio(src);
                audio.volume = key === 'ambientLoop' ? volume * 0.4 : volume;
                audio.preload = 'auto';

                if (key === 'ambientLoop') {
                    audio.loop = true;
                }

                audioElements.current[key] = audio;
            });

            // Initialize Web Audio API
            const ctx = new (window.AudioContext)();
            audioContext.current = ctx;

            // Setup analyzer for visualization
            const analyzerNode = ctx.createAnalyser();
            analyzerNode.fftSize = 64;
            analyzerNode.smoothingTimeConstant = 0.8;
            analyser.current = analyzerNode;

            // Connect ambient loop to analyzer
            const ambientEl = audioElements.current['ambientLoop'];
            if (ambientEl) {
                const source = ctx.createMediaElementSource(ambientEl);
                source.connect(analyzerNode);
                analyzerNode.connect(ctx.destination);
                ambientSource.current = source;
            }

            // Expose the audio API globally
            neuralAudio = {
                play: (soundName) => playSoundEffect(soundName),
                setVolume: (vol) => setMasterVolume(vol),
                toggleAmbient: () => toggleAmbientSound(),
                isAmbientPlaying
            };

            return () => {
                // Cleanup audio on unmount
                Object.values(audioElements.current).forEach(audio => {
                    if (audio && !audio.paused) {
                        audio.pause();
                    }
                });

                if (audioContext.current?.state !== 'closed') {
                    audioContext.current?.close();
                }

                neuralAudio = null;
            };
        } catch (error) {
            console.error('Failed to initialize audio:', error);
        }
    }, [enabled]);

    // Update volume when master volume changes
    useEffect(() => {
        Object.entries(audioElements.current).forEach(([key, audio]) => {
            if (audio) {
                audio.volume = key === 'ambientLoop' ? masterVolume * 0.4 : masterVolume;
            }
        });
    }, [masterVolume]);

    // Handle audio visualization
    useEffect(() => {
        if (!visualize || !analyser.current || !canvasRef.current) return;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Resize canvas
        canvas.width = canvas.clientWidth * 2;
        canvas.height = canvas.clientHeight * 2;

        const dataArray = new Uint8Array(analyser.current.frequencyBinCount);

        const draw = () => {
            if (!analyser.current) return;

            requestAnimationFrame(draw);
            analyser.current.getByteFrequencyData(dataArray);

            // Update state with new frequencies (sampled to reduce updates)
            if (Math.random() < 0.1) { // Only update 10% of the time for performance
                const sampledData = Array.from(dataArray).filter((_, i) => i % 2 === 0);
                setFrequencies(sampledData);
            }

            // Clear canvas
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Draw frequency bars
            const barWidth = (canvas.width / dataArray.length) * 2.5;
            let x = 0;

            for (let i = 0; i < dataArray.length; i++) {
                const barHeight = (dataArray[i] / 255) * canvas.height / 2;

                // Use gradient colors
                const gradient = ctx.createLinearGradient(0, canvas.height - barHeight, 0, canvas.height);
                gradient.addColorStop(0, 'rgba(200, 175, 155, 0.8)');
                gradient.addColorStop(1, 'rgba(200, 175, 155, 0.2)');

                ctx.fillStyle = gradient;
                ctx.fillRect(x, canvas.height - barHeight, barWidth - 1, barHeight);

                x += barWidth;
            }
        };

        draw();
    }, [visualize]);

    // Play sound effect
    const playSoundEffect = (soundName: keyof typeof AUDIO_SOURCES) => {
        try {
            const audio = audioElements.current[soundName];
            if (!audio) return;

            // Reset playback position and play
            audio.currentTime = 0;
            const playPromise = audio.play();

            // Handle autoplay restrictions
            if (playPromise !== undefined) {
                playPromise.catch(error => {
                    console.debug('Audio play failed:', error);
                });
            }
        } catch (error) {
            console.debug('Error playing sound:', error);
        }
    };

    // Toggle ambient sound
    const toggleAmbientSound = () => {
        try {
            const ambient = audioElements.current['ambientLoop'];
            if (!ambient) return;

            if (isAmbientPlaying) {
                ambient.pause();
            } else {
                // Resume audio context if suspended
                if (audioContext.current?.state === 'suspended') {
                    audioContext.current.resume();
                }
                ambient.play()
                    .catch(err => console.debug('Ambient play failed:', err));
            }

            setIsAmbientPlaying(!isAmbientPlaying);
            playSoundEffect('click');
        } catch (error) {
            console.debug('Error toggling ambient sound:', error);
        }
    };

    return (
        <div className="neural-audio-manager">
            {visualize && (
                <div className="audio-visualizer-container">
                    <canvas
                        ref={canvasRef}
                        className="audio-visualizer"
                    />
                    <div className="visualizer-controls">
                        <button
                            className={`visualizer-button ${isAmbientPlaying ? 'active' : ''}`}
                            onClick={toggleAmbientSound}
                        >
                            {isAmbientPlaying ? 'PAUSE' : 'PLAY'}
                        </button>
                        <input
                            type="range"
                            min="0"
                            max="1"
                            step="0.01"
                            value={masterVolume}
                            onChange={(e) => setMasterVolume(parseFloat(e.target.value))}
                            className="volume-slider"
                        />
                    </div>
                </div>
            )}

            <div className="neural-audio-controls">
                <button
                    className="neural-audio-toggle"
                    onClick={() => setVisualize(!visualize)}
                >
                    {visualize ? 'HIDE AUDIO PATTERN' : 'SHOW AUDIO PATTERN'}
                </button>
            </div>
        </div>
    );
};

// Helper functions for using the audio API elsewhere in the app
export const playNeuralSound = (soundName: keyof typeof AUDIO_SOURCES) => {
    neuralAudio?.play(soundName);
};

export const toggleNeuralAmbient = () => {
    neuralAudio?.toggleAmbient();
};

export default NeuralAudioManager;