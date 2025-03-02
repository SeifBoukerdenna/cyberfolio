import { useState, useEffect } from 'react';
import './App.css';
import projectsData from './data/projectsData';
import { Project } from './types/Project';
import HackerBootup from './components/hackerBootup/HackerBootup';
import Particles from './components/particles/Particles';
import NeuralNetwork from './components/neuralNetwork/NeuralNetwork';
import ProjectDetail from './components/projectDetail/ProjectDetail';
import NeuralTerminal from './components/neuralTerminal/NeuralTerminal';
import NeuralInterface from './components/neuralInterface/NeuralInterface';
import NeuralAudioManager, { playNeuralSound } from './components/neuralAudioManager/NeuralAudioManager';
import NeuralAudioVisualizer from './components/neuralAudioVisualizer/NeuralAudioVisualizer';
import NeuralChrome from './components/neuralChrome/NeuralChrome';
import IntroModal from './components/introModal/IntroModal';
import AboutModal from './components/aboutModal/AboutModal';

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
const allProjects: Project[] = [...projectsData, hiddenProject];

function App() {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isTerminalVisible, setIsTerminalVisible] = useState<boolean>(false);
  const [showBootup, setShowBootup] = useState<boolean>(true);
  const [secretCommandEntered, setSecretCommandEntered] = useState<boolean>(false);
  const [neuralActivityLevel, setNeuralActivityLevel] = useState<number>(0);
  const [glitchIntensity, setGlitchIntensity] = useState<number>(0.2);
  const [neuralInterfaceActive, setNeuralInterfaceActive] = useState<boolean>(false);
  const [showAudioVisualizer, setShowAudioVisualizer] = useState<boolean>(false);
  const [anomalyDetected, setAnomalyDetected] = useState<boolean>(false);
  const [brainwaveMessages, setBrainwaveMessages] = useState<string[]>([]);
  const [neuralEvents, setNeuralEvents] = useState<{ type: string; message: string; timestamp: number }[]>([]);
  const [showAbout, setShowAbout] = useState<boolean>(false);


  useEffect(() => {
    // Start neural activity simulation
    startNeuralActivitySimulation();

    // Initialize neural events
    setTimeout(() => {
      addNeuralEvent('system', 'Neural interface initialized');
    }, 2000);

    // Schedule random anomaly detection
    setTimeout(() => {
      if (Math.random() > 0.7) {
        setAnomalyDetected(true);
        addNeuralEvent('warning', 'Synaptic anomaly detected in sector B-12');
        playNeuralSound('alert');
        setTimeout(() => {
          setAnomalyDetected(false);
          addNeuralEvent('system', 'Anomaly contained. Neural pathway restored');
          playNeuralSound('success');
        }, 8000);
      }
    }, 20000);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const addNeuralEvent = (type: string, message: string) => {
    setNeuralEvents(prev => [
      { type, message, timestamp: Date.now() },
      ...prev.slice(0, 5)
    ]);
  };

  const startNeuralActivitySimulation = () => {
    const simulateActivity = () => {
      setNeuralActivityLevel(prev => {
        const change = (Math.random() - 0.5) * 5;
        return Math.max(40, Math.min(95, prev + change));
      });

      if (Math.random() < 0.15) {
        addBrainwaveMessage();
      }

      setTimeout(simulateActivity, 8000 + Math.random() * 12000);
    };

    setNeuralActivityLevel(75);
    simulateActivity();
  };

  const addBrainwaveMessage = () => {
    const messages = [
      'Neural pattern recognized',
      'Synapse connection established',
      'Cognitive resonance detected',
      'Memory engram processing',
      'Neuroplasticity factor 12.8',
      'Hippocampal indexing complete',
      'Amygdala response normal',
      'Cortical mapping in progress'
    ];
    const newMessage = messages[Math.floor(Math.random() * messages.length)];
    setBrainwaveMessages(prev => [...prev, newMessage]);
    setTimeout(() => {
      setBrainwaveMessages(prev => prev.filter(msg => msg !== newMessage));
    }, 4000);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.altKey && e.key === 't') {
        e.preventDefault();
        setIsTerminalVisible(true);
        playNeuralSound('click');
      }
      if (e.key === 'n' && !isTerminalVisible) {
        setNeuralInterfaceActive(prev => !prev);
        playNeuralSound('pulse');
        addNeuralEvent('system', neuralInterfaceActive ? 'Neural interface deactivated' : 'Neural interface activated');
      }
      if (e.key === 'v' && !isTerminalVisible) {
        setShowAudioVisualizer(prev => !prev);
        playNeuralSound('click');
      }
      if (!secretCommandEntered) {
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
              setGlitchIntensity(0.8);
              setTimeout(() => setGlitchIntensity(0.2), 2000);
              addNeuralEvent('secret', 'Hyperspace access granted');
              playNeuralSound('success');
            }
          } else {
            window.accessBuffer = '';
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [secretCommandEntered, isTerminalVisible, neuralInterfaceActive]);

  const handleBootupComplete = () => {
    setShowBootup(false);
    playNeuralSound('success');
    addNeuralEvent('system', 'Neural bootup sequence complete');
  };

  const handleProjectSelect = (project: Project) => {
    setSelectedProject(project);
    playNeuralSound('synapse');
    addNeuralEvent('project', `Accessing project: ${project.title}`);
    setNeuralActivityLevel(prev => Math.min(98, prev + 15));
    setTimeout(() => {
      setNeuralActivityLevel(prev => Math.max(40, prev - 10));
    }, 8000);
  };

  const handleCloseProject = () => {
    setSelectedProject(null);
    playNeuralSound('click');
  };

  const handleNeuralActivityChange = (value: number) => {
    setNeuralActivityLevel(value);
    if (value > 90) {
      setGlitchIntensity(0.5);
      setTimeout(() => setGlitchIntensity(0.2), 1000);
    }
  };

  return (
    <NeuralChrome intensity={glitchIntensity}>
      <div className="app">
        <Particles count={60} color="rgba(180, 170, 155, 0.5)" speed={0.2} maxSize={1.2} />
        <NeuralAudioManager enabled={true} volume={0.2} />
        {showBootup && <HackerBootup onComplete={handleBootupComplete} />}
        <div className="network-container">
          <NeuralNetwork projects={projectsData} onNodeClick={handleProjectSelect} />
        </div>
        <IntroModal />
        {selectedProject && <ProjectDetail project={selectedProject} onClose={handleCloseProject} />}
        <NeuralTerminal
          projects={allProjects}
          isVisible={isTerminalVisible}
          onClose={() => {
            setIsTerminalVisible(false);
            playNeuralSound('click');
          }}
          onProjectSelect={handleProjectSelect}
        />
        {neuralInterfaceActive && (
          <NeuralInterface neuralActivityLevel={neuralActivityLevel} onActivityChange={handleNeuralActivityChange} />
        )}
        <div className="status-panel">
          <div className="status-item">
            <span className="status-label">NEURAL STATUS:</span>
            <span className="status-value connection-indicator">CONNECTED</span>
          </div>
          <div className="status-item">
            <span className="status-label">PROJECTS:</span>
            <span className="status-value">{projectsData.length}</span>
          </div>
          <div className="status-item">
            <span className="status-label">ACTIVITY:</span>
            <span className="status-value">{Math.round(neuralActivityLevel)}%</span>
          </div>
          <div className="status-item">
            <span className="status-label">NEURAL INTERFACE:</span>
            <span className={`status-value ${neuralInterfaceActive ? 'active' : 'inactive'}`}>
              {neuralInterfaceActive ? 'ACTIVE' : 'STANDBY'}
            </span>
            <button
              className="neural-button"
              onClick={() => {
                setNeuralInterfaceActive(!neuralInterfaceActive);
                playNeuralSound('pulse');
                addNeuralEvent('system', neuralInterfaceActive ? 'Neural interface deactivated' : 'Neural interface activated');
              }}
            >
              {neuralInterfaceActive ? 'DISABLE' : 'ENABLE'}
            </button>
          </div>
        </div>
        <div className="neural-log">
          {neuralEvents.map((event, index) => (
            <div key={index} className={`log-entry ${event.type}`} style={{ animationDelay: `${index * 0.1}s` }}>
              <span className="log-time">
                {new Date(event.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
              <span className="log-message">{event.message}</span>
            </div>
          ))}
        </div>
        <div className="brainwave-messages">
          {brainwaveMessages.map((message, index) => (
            <div key={index} className="brainwave-message" style={{ left: `${10 + Math.random() * 80}%`, top: `${10 + Math.random() * 80}%` }}>
              {message}
            </div>
          ))}
        </div>
        {anomalyDetected && (
          <div className="neural-anomaly-alert">
            <div className="anomaly-text">NEURAL ANOMALY DETECTED</div>
            <div className="anomaly-scan"></div>
          </div>
        )}
        <div className="neural-controls">
          <div className="control-group">
            <div className="control-item">
              <span className="key-command">CTRL+ALT+T</span>
              <span className="key-action">Open Terminal</span>
            </div>
          </div>
          <div className="control-group">
            <div className="control-item">
              <span className="key-command">N</span>
              <span className="key-action">Toggle Neural Interface</span>
            </div>
          </div>
          <div className="control-group">
            <div className="control-item">
              <span className="key-command">V</span>
              <span className="key-action">Toggle Audio</span>
            </div>
          </div>
        </div>
        <button
          className="terminal-toggle"
          onClick={() => {
            setIsTerminalVisible(true);
            playNeuralSound('click');
          }}
        >
          <span className="terminal-icon">AI</span>
          <span className="terminal-text">NEURAL TERMINAL</span>
        </button>
        {showAbout && <AboutModal onClose={() => setShowAbout(false)} />}
        {showAudioVisualizer && (
          <div className="audio-visualizer-panel">
            <NeuralAudioVisualizer visible={showAudioVisualizer} />
          </div>
        )}
        {/* About/Settings Button */}
        <button
          className="about-toggle"
          onClick={() => setShowAbout(true)}
        >
          <span className="terminal-icon">About</span>
          <span className="terminal-text">Settings</span>
        </button>
        <div className="neural-footer">
          NEURAL INTERFACE v2.5.7
        </div>
      </div>
    </NeuralChrome>
  );
}

declare global {
  interface Window {
    accessBuffer?: string;
  }
}

export default App;
