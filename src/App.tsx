import { useState, useEffect } from 'react';
import './App.css';

import projectsData from './data/projectsData';
import { Project } from './types/Project';
import HackerBootup from './components/hackerBootup/HackerBootup';
import Particles from './components/particles/Particles';
import NeuralNetwork from './components/neuralNetwork/NeuralNetwork';
import ProjectDetail from './components/projectDetail/ProjectDetail';
import AIAssistant from './components/AIAssistant/AIAssistant';
import Terminal from './components/terminal/Terminal';

// Add hidden project for the easter egg
const hiddenProject: Project = {
  id: 'cyberdeck',
  title: 'Neural Cyberdeck',
  description: 'A hidden experimental project that integrates with neural implants to create a direct brain-computer interface. This advanced cyberdeck allows users to navigate digital environments using only their thoughts, with haptic feedback for a fully immersive experience.',
  technologies: ['Neural Interface', 'Quantum Computing', 'Advanced AI', 'BioFeedback'],
  image: '/assets/projects/cyberdeck.jpg',
  type: 'ai',
  status: 'IN PROGRESS',
  completionPercentage: 42,
  codeSnippet: `// Quantum neural interface middleware
class CyberdeckInterface {
  constructor() {
    this.synapticConnections = new Map();
    this.quantumStateVector = new Float32Array(256);
    this.initialize();
  }

  async initialize() {
    await this.calibrateBrainwavePatterns();
    await this.establishQuantumEntanglement();
    console.log("NEURAL INTERFACE CALIBRATED");

    // Listen for neural impulses
    this.startNeuralLoop();
  }

  // Translate neural impulses to system commands
  parseNeuralSignal(signalPattern) {
    // Quantum decoherence algorithm
    // CLASSIFIED INFORMATION
    return decodedCommand;
  }
}`
};

// All projects including the hidden one
const allProjects = [...projectsData, hiddenProject];

function App() {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isTerminalVisible, setIsTerminalVisible] = useState(false);
  const [showBootup, setShowBootup] = useState(true);
  const [secretCommandEntered, setSecretCommandEntered] = useState(false);
  const [neuralActivityLevel, setNeuralActivityLevel] = useState(0);

  // Check if it's the first visit
  useEffect(() => {
    const hasVisited = localStorage.getItem('hasVisitedCyberfolio');

    if (hasVisited) {
      setShowBootup(false);
    } else {
      localStorage.setItem('hasVisitedCyberfolio', 'true');
    }

    // Start neural activity simulation
    startNeuralActivitySimulation();
  }, []);

  // Simulate changing neural activity levels
  const startNeuralActivitySimulation = () => {
    const simulateActivity = () => {
      // Random fluctuations in neural activity
      setNeuralActivityLevel(prev => {
        const change = (Math.random() - 0.5) * 10;
        return Math.max(40, Math.min(95, prev + change));
      });

      // Schedule next update with variable timing for natural feel
      setTimeout(simulateActivity, 5000 + Math.random() * 10000);
    };

    // Initial activity level
    setNeuralActivityLevel(75);
    simulateActivity();
  };

  // Listen for special key combo to activate terminal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl + Alt + T to open terminal
      if (e.ctrlKey && e.altKey && e.key === 't') {
        e.preventDefault();
        setIsTerminalVisible(true);
      }

      // Also track secret command
      if (!secretCommandEntered) {
        // Check for "access_hyperspace" typed anywhere
        if (e.key === 'a' && !window.accessBuffer) {
          window.accessBuffer = 'a';
        } else if (window.accessBuffer) {
          const expectedSequence = "access_hyperspace";
          const nextChar = expectedSequence.charAt(window.accessBuffer.length);

          if (e.key === nextChar) {
            window.accessBuffer += e.key;

            if (window.accessBuffer === expectedSequence) {
              setIsTerminalVisible(true);
              setSecretCommandEntered(true);
              window.accessBuffer = '';
            }
          } else {
            window.accessBuffer = '';
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [secretCommandEntered]);

  // Handle bootup completion
  const handleBootupComplete = () => {
    setShowBootup(false);
  };

  // Handle project node click
  const handleProjectSelect = (project: Project) => {
    setSelectedProject(project);

    // Increase neural activity when project is selected
    setNeuralActivityLevel(prev => Math.min(98, prev + 15));

    // Return to normal after some time
    setTimeout(() => {
      setNeuralActivityLevel(prev => Math.max(40, prev - 10));
    }, 8000);
  };

  // Close project detail
  const handleCloseProject = () => {
    setSelectedProject(null);
  };

  return (
    <div className="app">
      {/* Background elements */}
      <Particles
        count={60}
        color="rgba(180, 170, 155, 0.6)"
        speed={0.2}
        maxSize={1.5}
      />
      <div className="crt-effect"></div>
      <div className="vignette"></div>

      {/* Boot-up sequence */}
      {showBootup && <HackerBootup onComplete={handleBootupComplete} />}

      {/* Neural network visualization */}
      <div className="network-container">
        <NeuralNetwork
          projects={projectsData}
          onNodeClick={handleProjectSelect}
        />
      </div>

      {/* Project detail modal */}
      {selectedProject && (
        <ProjectDetail
          project={selectedProject}
          onClose={handleCloseProject}
        />
      )}

      {/* AI Assistant */}
      <AIAssistant
        projects={projectsData}
        onProjectSelect={handleProjectSelect}
      />

      {/* Terminal (easter egg) */}
      <Terminal
        projects={allProjects}
        isVisible={isTerminalVisible}
        onClose={() => setIsTerminalVisible(false)}
        onProjectSelect={handleProjectSelect}
      />

      {/* Overlay information */}
      <div className="overlay-info">
        <div className="info-item">
          <span className="label">NEURAL STATUS:</span>
          <span className="value">CONNECTED</span>
        </div>
        <div className="info-item">
          <span className="label">PROJECTS:</span>
          <span className="value">{projectsData.length}</span>
        </div>
        <div className="info-item">
          <span className="label">ACTIVITY:</span>
          <span className="value">{Math.round(neuralActivityLevel)}%</span>
        </div>
      </div>

      {/* Footer information */}
      <div className="neural-footer">
        <div className="footer-content">
          NEURAL INTERFACE v2.5.7
        </div>
      </div>
    </div>
  );
}

// Type definition for window with accessBuffer property
declare global {
  interface Window {
    accessBuffer?: string;
  }
}

export default App;