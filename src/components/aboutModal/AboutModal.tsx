import React, { useState } from 'react';
import './AboutModal.css';

interface AboutModalProps {
    onClose: () => void;
}

const AboutModal: React.FC<AboutModalProps> = ({ onClose }) => {
    const [activeTab, setActiveTab] = useState<'project' | 'about'>('project');

    return (
        <div className="about-modal-overlay">
            <div className="about-modal">
                <button className="close-button" onClick={onClose}>×</button>
                <div className="modal-header">
                    <h1>Neural Interface Overview</h1>
                </div>
                <div className="modal-tabs">
                    <button
                        className={`tab-button ${activeTab === 'project' ? 'active' : ''}`}
                        onClick={() => setActiveTab('project')}
                    >
                        Project
                    </button>
                    <button
                        className={`tab-button ${activeTab === 'about' ? 'active' : ''}`}
                        onClick={() => setActiveTab('about')}
                    >
                        About Me
                    </button>
                </div>
                <div className="modal-content">
                    {activeTab === 'project' ? (
                        <div className="tab-content">
                            <h2>Project Concept</h2>
                            <p>
                                The Neural Interface project is a cutting-edge simulation of brain-computer interaction. Leveraging advanced AI algorithms, dynamic visualizations, and real-time neural feedback, this system creates an immersive digital environment. It integrates a simulated neural network, an interactive terminal, and sophisticated audio-visual cues.
                            </p>
                            <h3>Key Features</h3>
                            <ul>
                                <li>Interactive Neural Network Visualization</li>
                                <li>Real-Time Audio Feedback and Visualization</li>
                                <li>Hidden Easter Eggs and Secret Commands</li>
                                <li>Responsive UI with Dynamic Animations</li>
                                <li>Customizable Neural Interface Settings</li>
                            </ul>
                            <h3>Technical Stack</h3>
                            <p>
                                Built with React, TypeScript, and custom CSS, this project employs advanced state management and event-driven simulations to create a futuristic cyber interface.
                            </p>
                        </div>
                    ) : (
                        <div className="tab-content">
                            <h2>About the Developer</h2>
                            <p>
                                I'm a passionate software engineering student with a strong affinity for programming and innovative design. I blend creative artistry with technical expertise to craft immersive user experiences.
                            </p>
                            <h3>Skills & Interests</h3>
                            <ul>
                                <li>Full-stack web development with React & TypeScript</li>
                                <li>UI/UX design for futuristic, immersive themes</li>
                                <li>Exploring emerging technologies (neural networks, AI)</li>
                                <li>Innovative problem-solving and creative coding</li>
                            </ul>
                            <h3>Connect with Me</h3>
                            <p>
                                I'm always open to new opportunities and collaborations. Feel free to check out my portfolio and connect on social media!
                            </p>
                            <div className="social-links">
                                <a href="https://github.com/yourusername" target="_blank" rel="noopener noreferrer">GitHub</a>
                                <a href="https://linkedin.com/in/yourusername" target="_blank" rel="noopener noreferrer">LinkedIn</a>
                                <a href="mailto:youremail@example.com">Email</a>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AboutModal;
