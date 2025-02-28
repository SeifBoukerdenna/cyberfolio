import React, { useState, useEffect } from 'react';
import './ProjectDetail.css';
import { Project } from '../../types/Project';

interface ProjectDetailProps {
    project: Project | null;
    onClose: () => void;
}

const ProjectDetail: React.FC<ProjectDetailProps> = ({ project, onClose }) => {
    const [isLoading, setIsLoading] = useState(true);
    const [showContent, setShowContent] = useState(false);
    const [activeTab, setActiveTab] = useState<'overview' | 'tech' | 'code'>('overview');

    useEffect(() => {
        if (project) {
            setIsLoading(true);
            // Simulate a loading delay for cyberpunk effect
            const timer1 = setTimeout(() => setIsLoading(false), 1500);
            const timer2 = setTimeout(() => setShowContent(true), 1800);
            return () => {
                clearTimeout(timer1);
                clearTimeout(timer2);
            };
        } else {
            setShowContent(false);
            setIsLoading(true);
        }
    }, [project]);

    if (!project) return null;

    return (
        <div className={`project-detail ${showContent ? 'active' : ''}`}>
            <div className="project-detail-background"></div>
            <div className="project-detail-container">
                <header className="project-detail-header">
                    <div className="project-title">
                        <h2>{project.title}</h2>
                        <span className="project-id">ID: {project.id}</span>
                    </div>
                    <button className="close-button" onClick={onClose}>
                        ×
                    </button>
                </header>

                {isLoading ? (
                    <div className="loading-container">
                        <div className="loading-bar">
                            <div className="loading-progress"></div>
                        </div>
                        <div className="loading-text">
                            <span>ACCESSING PROJECT DATA</span>
                            <span className="blink">_</span>
                        </div>
                        <div className="loading-details">
                            <p>INITIALIZING NEURAL INTERFACE...</p>
                            <p>DECRYPTING PROJECT FILES...</p>
                            <p>ESTABLISHING SECURE CONNECTION...</p>
                        </div>
                    </div>
                ) : (
                    <div className="project-content">
                        <nav className="tab-navigation">
                            <button
                                className={activeTab === 'overview' ? 'active' : ''}
                                onClick={() => setActiveTab('overview')}
                            >
                                OVERVIEW
                            </button>
                            <button
                                className={activeTab === 'tech' ? 'active' : ''}
                                onClick={() => setActiveTab('tech')}
                            >
                                TECH STACK
                            </button>
                            <button
                                className={activeTab === 'code' ? 'active' : ''}
                                onClick={() => setActiveTab('code')}
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
                                                <span>[IMAGE DATA UNAVAILABLE]</span>
                                            </div>
                                        )}
                                        <div className="image-overlay"></div>
                                    </div>
                                    <div className="project-description">
                                        <h3>PROJECT DETAILS</h3>
                                        <p>{project.description}</p>
                                        <div className="project-stats">
                                            <div className="stat">
                                                <span className="stat-label">TYPE</span>
                                                <span className="stat-value">{project.type}</span>
                                            </div>
                                            <div className="stat">
                                                <span className="stat-label">STATUS</span>
                                                <span className="stat-value">{project.status || 'COMPLETED'}</span>
                                            </div>
                                        </div>
                                        {project.demoLink && (
                                            <div className="project-links">
                                                <a
                                                    href={project.demoLink}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="neon-button"
                                                >
                                                    LIVE DEMO
                                                </a>
                                                {project.githubLink && (
                                                    <a
                                                        href={project.githubLink}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="neon-button github"
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
                                    <h3>CODE FRAGMENTS</h3>
                                    <div className="terminal">
                                        <div className="terminal-header">
                                            <span>neural-terminal</span>
                                        </div>
                                        <div className="terminal-content">
                                            <p>Accessing code repository for {project.title}…</p>
                                            <p>Authorization granted.</p>
                                            <p>Displaying sample code fragment:</p>
                                            <p className="blink">_</p>
                                            {project.codeSnippet ? (
                                                <pre className="code-snippet">{project.codeSnippet}</pre>
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
                                                    >
                                                        YES, PROCEED TO GITHUB
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
