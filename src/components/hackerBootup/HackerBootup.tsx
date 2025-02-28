/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from 'react';
import './HackerBootup.css';

interface HackerBootupProps {
    onComplete: () => void;
}

interface BootLine {
    text: string;
    delay: number;
    duration: number;
}

const HackerBootup: React.FC<HackerBootupProps> = ({ onComplete }) => {
    const [visibleLines, setVisibleLines] = useState<string[]>([]);
    const [progress, setProgress] = useState(0);
    const [bootComplete, setBootComplete] = useState(false);

    // Boot-up sequence text (delays and durations further reduced by half)
    // eslint-disable-next-line react-hooks/exhaustive-deps
    const bootSequence: BootLine[] = [
        { text: '> INITIALIZING NEURAL INTERFACE...', delay: 25, duration: 40 },
        { text: '> LOADING CORE MODULES...', delay: 75, duration: 50 },
        { text: '> CONNECTING TO NEURAL NETWORK...', delay: 135, duration: 60 },
        { text: '> SCANNING BIOMETRIC SIGNATURES...', delay: 205, duration: 45 },
        { text: '> CALIBRATING NEURAL PATHWAYS...', delay: 260, duration: 75 },
        { text: '> OPTIMIZING SYNAPTIC RESPONSES...', delay: 345, duration: 60 },
        { text: '> LOADING PORTFOLIO DATA...', delay: 415, duration: 85 },
        { text: '> ESTABLISHING SECURE CONNECTION...', delay: 510, duration: 50 },
        { text: '> FINAL SYSTEM CHECKS...', delay: 570, duration: 80 },
        { text: '> NEURAL INTERFACE READY.', delay: 660, duration: 40 },
        { text: '> WELCOME TO CYBERFOLIO v2.5.7', delay: 705, duration: 25 }
    ];

    // Progress bar animation: update interval is now 10ms with larger increments for a faster fill
    useEffect(() => {
        let timer: any;

        if (progress < 100) {
            timer = setTimeout(() => {
                setProgress(prev => {
                    const increment = prev < 70 ? 3 : prev < 90 ? 5 : 8;
                    return Math.min(prev + increment, 100);
                });
            }, 10);
        } else if (!bootComplete) {
            // Shorter delay after reaching 100%
            timer = setTimeout(() => {
                setBootComplete(true);
            }, 100);
        }

        return () => clearTimeout(timer);
    }, [progress, bootComplete]);

    // Animate text lines using the further reduced delays
    useEffect(() => {
        bootSequence.forEach(line => {
            setTimeout(() => {
                setVisibleLines(prev => [...prev, line.text]);
            }, line.delay);
        });
    }, [bootSequence]);

    // Complete bootup and hide overlay with a shorter delay
    useEffect(() => {
        if (bootComplete) {
            const timer = setTimeout(() => {
                onComplete();
            }, 150);

            return () => clearTimeout(timer);
        }
    }, [bootComplete, onComplete]);

    return (
        <div className={`bootup-overlay ${bootComplete ? 'fade-out' : ''}`}>
            <div className="bootup-container">
                <div className="bootup-header">
                    <span>NEURAL</span>
                    <span className="blink">_</span>
                    <span>INTERFACE</span>
                </div>

                <div className="bootup-text">
                    {visibleLines.map((line, index) => (
                        <div
                            key={index}
                            className="bootup-line"
                            style={{
                                animation: `type ${bootSequence[index]?.duration || 100}ms steps(${line.length}, end)`
                            }}
                        >
                            {line}
                        </div>
                    ))}
                </div>

                <div className="bootup-progress-container">
                    <div className="bootup-progress-label">
                        SYSTEM BOOT: {Math.floor(progress)}%
                    </div>
                    <div className="bootup-progress-bar">
                        <div
                            className="bootup-progress-fill"
                            style={{ width: `${progress}%` }}
                        ></div>
                    </div>
                </div>

                <div className="bootup-footer">
                    <div className="bootup-security">
                        SECURITY LEVEL: ALPHA
                    </div>
                    <div className="bootup-version">
                        v2.5.7
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HackerBootup;
