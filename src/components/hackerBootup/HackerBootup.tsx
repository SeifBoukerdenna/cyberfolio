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

    // Boot-up sequence text
    // eslint-disable-next-line react-hooks/exhaustive-deps
    const bootSequence: BootLine[] = [
        { text: '> INITIALIZING NEURAL INTERFACE...', delay: 500, duration: 800 },
        { text: '> LOADING CORE MODULES...', delay: 1500, duration: 1000 },
        { text: '> CONNECTING TO NEURAL NETWORK...', delay: 2700, duration: 1200 },
        { text: '> SCANNING BIOMETRIC SIGNATURES...', delay: 4100, duration: 900 },
        { text: '> CALIBRATING NEURAL PATHWAYS...', delay: 5200, duration: 1500 },
        { text: '> OPTIMIZING SYNAPTIC RESPONSES...', delay: 6900, duration: 1200 },
        { text: '> LOADING PORTFOLIO DATA...', delay: 8300, duration: 1700 },
        { text: '> ESTABLISHING SECURE CONNECTION...', delay: 10200, duration: 1000 },
        { text: '> FINAL SYSTEM CHECKS...', delay: 11400, duration: 1600 },
        { text: '> NEURAL INTERFACE READY.', delay: 13200, duration: 800 },
        { text: '> WELCOME TO CYBERFOLIO v2.5.7', delay: 14100, duration: 500 }
    ];

    // Progress bar animation
    useEffect(() => {
        let timer: any

        if (progress < 100) {
            timer = setTimeout(() => {
                setProgress(prev => {
                    // Progress speeds up towards the end
                    const increment = prev < 70 ? 0.4 : prev < 90 ? 0.8 : 1.2;
                    return Math.min(prev + increment, 100);
                });
            }, 100);
        } else if (!bootComplete) {
            // Delay a bit after reaching 100%
            timer = setTimeout(() => {
                setBootComplete(true);
            }, 800);
        }

        return () => clearTimeout(timer);
    }, [progress, bootComplete]);

    // Animate text lines
    useEffect(() => {
        bootSequence.forEach(line => {
            setTimeout(() => {
                setVisibleLines(prev => [...prev, line.text]);
            }, line.delay);
        });
    }, [bootSequence]);

    // Complete bootup and hide overlay
    useEffect(() => {
        if (bootComplete) {
            const timer = setTimeout(() => {
                onComplete();
            }, 1200);

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
                                animation: `type ${bootSequence[index]?.duration || 1000}ms steps(${line.length}, end)`
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