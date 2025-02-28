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
import NeuralDashboard from './components/neuralDashboard/NeuralDashboard';
import IntroModal from './components/introModal/IntroModal';

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
  const [glitchIntensity, setGlitchIntensity] = useState(0.2);
  const [neuralInterfaceActive, setNeuralInterfaceActive] = useState(false);
  const [showAudioVisualizer, setShowAudioVisualizer] = useState(false);
  const [anomalyDetected, setAnomalyDetected] = useState(false);

  // Floating brain wave messages
  const [brainwaveMessages, setBrainwaveMessages] = useState<string[]>([]);

  // Neural events system
  const [neuralEvents, setNeuralEvents] = useState<{
    type: string;
    message: string;
    timestamp: number;
  }[]>([]);

  // Network diagnostic values
  const [, setNetworkDiagnostics] = useState({
    activity: 16,
    neurons: '1/6',
    pulses: 0,
    health: 93,
    state: 'STABLE'
  });

  // Check if it's the first visit
  useEffect(() => {
    // Start neural activity simulation
    startNeuralActivitySimulation();

    // Initialize neural events
    setTimeout(() => {
      addNeuralEvent('system', 'Neural interface initialized');
    }, 2000);

    // Schedule random anomaly detection for interactivity (but with less frequency)
    setTimeout(() => {
      if (Math.random() > 0.7) {
        setAnomalyDetected(true);
        addNeuralEvent('warning', 'Synaptic anomaly detected in sector B-12');
        playNeuralSound('alert');

        // Auto-resolve after some time
        setTimeout(() => {
          setAnomalyDetected(false);
          addNeuralEvent('system', 'Anomaly contained. Neural pathway restored');
          playNeuralSound('success');
        }, 8000);
      }
    }, 20000);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Add a neural event to the log
  const addNeuralEvent = (type: string, message: string) => {
    setNeuralEvents(prev => [
      { type, message, timestamp: Date.now() },
      ...prev.slice(0, 5) // Keep last 6 events - reduced to avoid clutter
    ]);
  };

  // Simulate changing neural activity levels
  const startNeuralActivitySimulation = () => {
    const simulateActivity = () => {
      // Random fluctuations in neural activity - less frequent and more subtle
      setNeuralActivityLevel(prev => {
        const change = (Math.random() - 0.5) * 5; // Reduced amplitude
        return Math.max(40, Math.min(95, prev + change));
      });

      // Update network diagnostics - less frequent updates
      if (Math.random() < 0.5) {
        setNetworkDiagnostics(prev => {
          const newActivity = prev.activity + Math.floor((Math.random() - 0.5) * 3);
          const newPulses = Math.max(0, prev.pulses + Math.floor((Math.random() - 0.5) * 2));

          return {
            activity: Math.max(5, Math.min(60, newActivity)),
            neurons: Math.random() < 0.1 ? `${1 + Math.floor(Math.random() * 2)}/6` : prev.neurons,
            pulses: newPulses,
            health: prev.health,
            state: prev.state
          };
        });
      }

      // Occasionally add a brainwave message - reduced frequency
      if (Math.random() < 0.15) {
        addBrainwaveMessage();
      }

      // Schedule next update with longer timing
      setTimeout(simulateActivity, 8000 + Math.random() * 12000);
    };

    // Initial activity level
    setNeuralActivityLevel(75);
    simulateActivity();
  };

  // Add a floating brainwave message
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

    // Remove message after animation time
    setTimeout(() => {
      setBrainwaveMessages(prev => prev.filter(msg => msg !== newMessage));
    }, 4000);
  };

  // Listen for special key combo to activate terminal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl + Alt + T to open terminal
      if (e.ctrlKey && e.altKey && e.key === 't') {
        e.preventDefault();
        setIsTerminalVisible(true);
        playNeuralSound('click');
      }

      // N key to toggle neural interface
      if (e.key === 'n' && !isTerminalVisible) {
        setNeuralInterfaceActive(prev => !prev);
        playNeuralSound('pulse');
        addNeuralEvent('system', neuralInterfaceActive ? 'Neural interface deactivated' : 'Neural interface activated');
      }

      // V key to toggle audio visualizer
      if (e.key === 'v' && !isTerminalVisible) {
        setShowAudioVisualizer(prev => !prev);
        playNeuralSound('click');
      }

      // Track secret command for easter egg
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

              // Trigger glitch effect
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
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [secretCommandEntered, isTerminalVisible, neuralInterfaceActive]);

  // Handle bootup completion
  const handleBootupComplete = () => {
    setShowBootup(false);
    playNeuralSound('success');
    addNeuralEvent('system', 'Neural bootup sequence complete');
  };

  // Handle project node click
  const handleProjectSelect = (project: Project) => {
    setSelectedProject(project);
    playNeuralSound('synapse');
    addNeuralEvent('project', `Accessing project: ${project.title}`);

    // Increase neural activity when project is selected
    setNeuralActivityLevel(prev => Math.min(98, prev + 15));

    // Update network diagnostics
    setNetworkDiagnostics(prev => ({
      ...prev,
      activity: Math.min(60, prev.activity + 15),
      pulses: prev.pulses + 3,
      state: 'WAVE'
    }));

    // Return to normal after some time
    setTimeout(() => {
      setNeuralActivityLevel(prev => Math.max(40, prev - 10));
    }, 8000);
  };

  // Close project detail
  const handleCloseProject = () => {
    setSelectedProject(null);
    playNeuralSound('click');
  };

  // Handle neural activity change from interface
  const handleNeuralActivityChange = (value: number) => {
    setNeuralActivityLevel(value);

    // Increase glitch chance with high activity
    if (value > 90) {
      setGlitchIntensity(0.5);
      setTimeout(() => setGlitchIntensity(0.2), 1000);
    }
  };

  return (
    <NeuralChrome intensity={glitchIntensity}>
      <div className="app">
        {/* Background elements */}
        <Particles
          count={60} // Reduced particle count to be less distracting
          color="rgba(180, 170, 155, 0.5)"
          speed={0.2}
          maxSize={1.2}
        />

        {/* Audio system */}
        <NeuralAudioManager enabled={true} volume={0.2} />

        {/* Boot-up sequence */}
        {showBootup && <HackerBootup onComplete={handleBootupComplete} />}

        {/* Neural network visualization */}
        <div className="network-container">
          <NeuralNetwork
            projects={projectsData}
            onNodeClick={handleProjectSelect}
          />
        </div>

        {/* New Intro Modal Component */}
        <IntroModal />

        {/* Project detail modal */}
        {selectedProject && (
          <ProjectDetail
            project={selectedProject}
            onClose={handleCloseProject}
          />
        )}

        {/* Neural Terminal */}
        <NeuralTerminal
          projects={allProjects}
          isVisible={isTerminalVisible}
          onClose={() => {
            setIsTerminalVisible(false);
            playNeuralSound('click');
          }}
          onProjectSelect={handleProjectSelect}
        />

        {/* Neural Interface layer */}
        {neuralInterfaceActive && (
          <NeuralInterface
            neuralActivityLevel={neuralActivityLevel}
            onActivityChange={handleNeuralActivityChange}
          />
        )}

        {/* Streamlined Status Panel */}
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

        {/* Neural Log - Right side, positioned below terminal button */}
        <div className="neural-log">
          {neuralEvents.map((event, index) => (
            <div
              key={index}
              className={`log-entry ${event.type}`}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <span className="log-time">
                {new Date(event.timestamp).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </span>
              <span className="log-message">{event.message}</span>
            </div>
          ))}
        </div>

        {/* Floating brainwave messages - more subtle */}
        <div className="brainwave-messages">
          {brainwaveMessages.map((message, index) => (
            <div
              key={index}
              className="brainwave-message"
              style={{
                left: `${10 + Math.random() * 80}%`,
                top: `${10 + Math.random() * 80}%`
              }}
            >
              {message}
            </div>
          ))}
        </div>

        {/* Anomaly alert overlay - only shown during anomalies */}
        {anomalyDetected && (
          <div className="neural-anomaly-alert">
            <div className="anomaly-text">NEURAL ANOMALY DETECTED</div>
            <div className="anomaly-scan"></div>
          </div>
        )}

        {/* Neural Controls moved to bottom right with better spacing */}
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

        {/* Terminal toggle moved to top right */}
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

        {/* Audio visualizer panel - only visible when toggled, moved to left side */}
        {showAudioVisualizer && (
          <div className="audio-visualizer-panel">
            <NeuralAudioVisualizer visible={showAudioVisualizer} />
          </div>
        )}

        {/* Version footer - centered at bottom */}
        <div className="neural-footer">
          NEURAL INTERFACE v2.5.7
        </div>

        {/* Neural Dashboard Component */}
        <NeuralDashboard />
      </div>
    </NeuralChrome>
  );
}

// Type definition for window with accessBuffer property
declare global {
  interface Window {
    accessBuffer?: string;
  }
}

export default App;