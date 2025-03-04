/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from 'react';
import './ProjectDetail.css';
import { Project } from '../../types/Project';
import { playNeuralSound } from '../neuralAudioManager/NeuralAudioManager';

interface ProjectDetailProps {
    project: Project | null;
    onClose: () => void;
}

const ProjectDetail: React.FC<ProjectDetailProps> = ({ project, onClose }) => {
    const [isLoading, setIsLoading] = useState(true);
    const [showContent, setShowContent] = useState(false);
    const [activeTab, setActiveTab] = useState<'overview' | 'tech' | 'code'>('overview');
    const [loadingProgress, setLoadingProgress] = useState(0);
    const [loadingMessages, setLoadingMessages] = useState<string[]>([]);

    useEffect(() => {
        if (project) {
            setIsLoading(true);
            setShowContent(false);
            setLoadingProgress(0);
            setLoadingMessages([]);

            // Add loading messages with delays for cyberpunk effect
            const messages = [
                'INITIALIZING NEURAL INTERFACE...',
                'DECRYPTING PROJECT FILES...',
                'ESTABLISHING SECURE CONNECTION...'
            ];

            let timer: any;

            // Simulate progress faster - increased speed
            const interval = setInterval(() => {
                setLoadingProgress(prev => {
                    const newProgress = prev + (Math.random() * 25); // Increase by more each step
                    return newProgress > 100 ? 100 : newProgress;
                });
            }, 80); // Reduced from 150ms

            // Add loading messages sequentially but faster
            messages.forEach((message, index) => {
                setTimeout(() => {
                    setLoadingMessages(prev => [...prev, message]);
                    // Play a sound for each message
                    if (index === 0) playNeuralSound('synapse');
                    else playNeuralSound('click');
                }, 300 + index * 300); // Reduced from 500 + index * 700
            });

            // Complete loading much faster
            // eslint-disable-next-line prefer-const
            timer = setTimeout(() => {
                clearInterval(interval);
                setLoadingProgress(100);
                setIsLoading(false);
                playNeuralSound('success');

                // Reduced delay before showing content
                setTimeout(() => {
                    setShowContent(true);
                }, 150); // Reduced from 300ms
            }, 800); // Reduced from 3500ms

            return () => {
                clearTimeout(timer);
                clearInterval(interval);
            };
        } else {
            setShowContent(false);
            setIsLoading(true);
        }
    }, [project]);

    // Handle tab changes
    const handleTabChange = (tab: 'overview' | 'tech' | 'code') => {
        playNeuralSound('click');
        setActiveTab(tab);
    };

    // Handle close with sound effect
    const handleClose = () => {
        playNeuralSound('click');
        onClose();
    };

    // Format code with syntax highlighting
    const formatCodeSnippet = (code: string) => {
        return code; // In a real app, you'd add syntax highlighting here
    };

    if (!project) return null;

    return (
        <div className={`project-detail ${showContent ? 'active' : ''}`}>
            <div className="project-detail-background"></div>
            <div className="project-detail-container">
                <header className="project-detail-header">
                    <div className="project-title">
                        <h2>{project.title}</h2>
                        <span className="project-id">PROJECT ID: {project.id}</span>
                    </div>
                    <button className="close-button" onClick={handleClose}>
                        ×
                    </button>
                </header>

                {isLoading ? (
                    <div className="loading-container">
                        <div className="loading-bar">
                            <div
                                className="loading-progress"
                                style={{ width: `${loadingProgress}%` }}
                            ></div>
                        </div>
                        <div className="loading-text">
                            <span>ACCESSING PROJECT DATA</span>
                            <span className="blink">_</span>
                        </div>
                        <div className="loading-details">
                            {loadingMessages.map((message, index) => (
                                <p key={index}>{message}</p>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="project-content">
                        <nav className="tab-navigation">
                            <button
                                className={activeTab === 'overview' ? 'active' : ''}
                                onClick={() => handleTabChange('overview')}
                            >
                                OVERVIEW
                            </button>
                            <button
                                className={activeTab === 'tech' ? 'active' : ''}
                                onClick={() => handleTabChange('tech')}
                            >
                                TECH STACK
                            </button>
                            <button
                                className={activeTab === 'code' ? 'active' : ''}
                                onClick={() => handleTabChange('code')}
                            >
                                CODE ACCESS
                            </button>
                        </nav>
                        <div className="tab-content">
                            {activeTab === 'overview' && (
                                <div className="overview-tab">
                                    <div className="project-image-container">
                                        {project.image ? (
                                            <img src={project.image} alt={project.title} className="project-image" />
                                        ) : (
                                            <div className="project-image-placeholder">
                                                <span>[VISUAL DATA UNAVAILABLE]</span>
                                            </div>
                                        )}
                                        <div className="image-overlay"></div>
                                    </div>
                                    <div className="project-description">
                                        <h3>PROJECT DETAILS</h3>
                                        <p>{project.description}</p>
                                        <div className="project-stats">
                                            <div className="stat">
                                                <span className="stat-label">CATEGORY</span>
                                                <span className="stat-value">{project.type.toUpperCase()}</span>
                                            </div>
                                            <div className="stat">
                                                <span className="stat-label">STATUS</span>
                                                <span className="stat-value">{project.status || 'COMPLETED'}</span>
                                            </div>
                                            {project.completionPercentage && (
                                                <div className="stat">
                                                    <span className="stat-label">COMPLETION</span>
                                                    <span className="stat-value">{project.completionPercentage}%</span>
                                                </div>
                                            )}
                                        </div>
                                        {(project.demoLink || project.githubLink) && (
                                            <div className="project-links">
                                                {project.demoLink && (
                                                    <a
                                                        href={project.demoLink}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="neon-button"
                                                        onClick={() => playNeuralSound('click')}
                                                    >
                                                        LIVE DEMO
                                                    </a>
                                                )}
                                                {project.githubLink && (
                                                    <a
                                                        href={project.githubLink}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="neon-button github"
                                                        onClick={() => playNeuralSound('click')}
                                                    >
                                                        SOURCE CODE
                                                    </a>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                            {activeTab === 'tech' && (
                                <div className="tech-tab">
                                    <h3>TECHNOLOGY MATRIX</h3>
                                    <div className="tech-grid">
                                        {project.technologies.map((tech, index) => (
                                            <div className="tech-item" key={index}>
                                                <div className="tech-icon">{tech.charAt(0)}</div>
                                                <div className="tech-name">{tech}</div>
                                            </div>
                                        ))}
                                    </div>
                                    {project.architecture && (
                                        <div className="architecture-section">
                                            <h4>SYSTEM ARCHITECTURE</h4>
                                            <pre className="architecture-code">{project.architecture}</pre>
                                        </div>
                                    )}
                                </div>
                            )}
                            {activeTab === 'code' && (
                                <div className="code-tab">
                                    <h3>NEURAL CODE FRAGMENTS</h3>
                                    <div className="terminal">
                                        <div className="terminal-header">
                                            <span>neural-terminal ~ {project.id}</span>
                                        </div>
                                        <div className="terminal-content">
                                            <p>Accessing neural repository for {project.title}…</p>
                                            <p>Authorization granted: Level EPSILON</p>
                                            <p>Displaying neural code fragment:</p>
                                            <p className="blink">_</p>
                                            {project.codeSnippet ? (
                                                <pre className="code-snippet">{formatCodeSnippet(project.codeSnippet)}</pre>
                                            ) : (
                                                <p className="code-placeholder">
                                                    [CODE FRAGMENTS ENCRYPTED OR UNAVAILABLE]
                                                </p>
                                            )}
                                            {project.githubLink && (
                                                <div className="terminal-action">
                                                    <p>Access complete repository?</p>
                                                    <a
                                                        href={project.githubLink}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="terminal-button"
                                                        onClick={() => playNeuralSound('synapse')}
                                                    >
                                                        PROCEED TO GITHUB
                                                    </a>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                <footer className="detail-footer">
                    <div className="system-stats">
                        <div className="stat">MEM: 87%</div>
                        <div className="stat">CPU: 42%</div>
                        <div className="stat">NET: 128MB/s</div>
                    </div>
                    <div className="footer-id">NEURAL INTERFACE v2.5.7</div>
                </footer>
            </div>
        </div>
    );
};

export default ProjectDetail;