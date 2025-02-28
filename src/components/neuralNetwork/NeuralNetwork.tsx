/* eslint-disable react-hooks/exhaustive-deps */
import React, { useRef, useEffect, useState } from 'react';
import './NeuralNetwork.css';
import { Project } from '../../types/Project';

interface Dendrite {
    length: number;
    angle: number;
    width: number;
    curve: number;
    branches?: Dendrite[];
    activity: number; // 0-1 for activation level
}

interface Node {
    id: string;
    x: number;
    y: number;
    radius: number;
    color: string;
    vx: number;
    vy: number;
    project: Project;
    dendrites: Dendrite[];
    pulseRate: number;
    lastPulseTime: number;
    activationLevel: number; // 0-1 for neuron activation
    activationDecay: number; // How quickly activation fades
    threshold: number; // Activation threshold
    refractoryPeriod: number; // Time neuron can't fire again
    lastActivationTime: number; // When last activated
    baseRadius: number; // Original radius for size changes
    mood: 'calm' | 'excited' | 'erratic'; // Behavioral state
    moodTimer: number; // Time until next mood change
    burstCounter: number; // For random bursts of activity
    hue: number; // For color shifting
}

interface Connection {
    source: Node;
    target: Node;
    strength: number;
    points: { x: number; y: number }[];
    pulsePositions: number[];
    pulseActive: boolean;
    lastPulseTime: number;
    pulseInterval: number;
    pulseSpeed: number; // Speed of pulse propagation
    width: number; // Base width for animation
    currentWidth: number; // Current animated width
    isInhibitory: boolean; // Whether this is an inhibitory connection
    health: number; // Connection strength (0-1)
    pulseSize: number; // Size of pulse (can vary)
}

interface NetworkEvent {
    type: 'storm' | 'wave' | 'burst' | 'colorShift' | 'seizure';
    startTime: number;
    duration: number;
    intensity: number;
    origin?: { x: number; y: number };
    affectedNodes?: string[];
    progress: number; // 0-1 for animation progress
}

interface Particle {
    x: number;
    y: number;
    size: number;
    vx: number;
    vy: number;
    opacity: number;
    flickerSpeed: number;
}

interface Spark {
    x: number;
    y: number;
    radius: number;
    life: number;
    maxLife: number;
    angle: number;
    speed: number;
}

interface SimulationParams {
    nodeWeight: number;
    connectionStrength: number;
    activationThreshold: number;
    pulseSpeed: number;
}

// Inline SimulationControls component
const SimulationControls: React.FC<{
    params: SimulationParams;
    setParams: React.Dispatch<React.SetStateAction<SimulationParams>>;
}> = ({ params, setParams }) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setParams(prev => ({ ...prev, [name]: parseFloat(value) }));
    };

    return (
        <div className="simulation-controls-panel">
            <label>
                Node Weight: {params.nodeWeight.toFixed(2)}
                <input
                    type="range"
                    name="nodeWeight"
                    min="0.5"
                    max="2"
                    step="0.1"
                    value={params.nodeWeight}
                    onChange={handleChange}
                />
            </label>
            <label>
                Connection Strength: {params.connectionStrength.toFixed(2)}
                <input
                    type="range"
                    name="connectionStrength"
                    min="0.5"
                    max="2"
                    step="0.1"
                    value={params.connectionStrength}
                    onChange={handleChange}
                />
            </label>
            <label>
                Activation Threshold: {params.activationThreshold.toFixed(2)}
                <input
                    type="range"
                    name="activationThreshold"
                    min="0.1"
                    max="1"
                    step="0.05"
                    value={params.activationThreshold}
                    onChange={handleChange}
                />
            </label>
            <label>
                Pulse Speed: {params.pulseSpeed.toFixed(2)}
                <input
                    type="range"
                    name="pulseSpeed"
                    min="0.5"
                    max="2"
                    step="0.1"
                    value={params.pulseSpeed}
                    onChange={handleChange}
                />
            </label>
        </div>
    );
};

const NeuralNetwork: React.FC<{ projects: Project[]; onNodeClick: (project: Project) => void }> = ({ projects, onNodeClick }) => {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const containerRef = useRef<HTMLDivElement | null>(null);
    const [nodes, setNodes] = useState<Node[]>([]);
    const [connections, setConnections] = useState<Connection[]>([]);
    const [hoveredNode, setHoveredNode] = useState<Node | null>(null);
    const [isInitialized, setIsInitialized] = useState(false);
    const [networkActivity, setNetworkActivity] = useState(0.1);
    const [networkEvents, setNetworkEvents] = useState<NetworkEvent[]>([]);
    const mousePositionRef = useRef<{ x: number; y: number } | null>(null);
    const animationRef = useRef<number | null>(null);
    const lastFrameTime = useRef<number>(0);
    const lastEventTime = useRef<number>(Date.now());
    const [particles, setParticles] = useState<Particle[]>([]);
    const [sparks, setSparks] = useState<Spark[]>([]);
    const [simulationParams, setSimulationParams] = useState<SimulationParams>({
        nodeWeight: 1.0,
        connectionStrength: 1.0,
        activationThreshold: 0.3,
        pulseSpeed: 1.0,
    });

    // NEW: Layout selection state
    const [layout, setLayout] = useState<'circular' | 'grid' | 'random' | 'hierarchical'>('circular');

    /**
     * Handler to reset the simulation's state.
     */
    const handleResetSimulation = () => {
        setNodes([]);
        setConnections([]);
        setNetworkEvents([]);
        setParticles([]);
        setSparks([]);
        setIsInitialized(false);
    };

    // Generate a curved path between two points
    const generateCurvedPath = (startX: number, startY: number, endX: number, endY: number) => {
        const points = [];
        const segments = 12;
        const dx = endX - startX;
        const dy = endY - startY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const perpX = -dy / dist;
        const perpY = dx / dist;
        const maxOffset = Math.min(dist * 0.1, 15);
        const offset = (Math.random() * 2 - 1) * maxOffset;
        const controlX = (startX + endX) / 2 + perpX * offset;
        const controlY = (startY + endY) / 2 + perpY * offset;
        for (let i = 0; i <= segments; i++) {
            const t = i / segments;
            const u = 1 - t;
            const x = u * u * startX + 2 * u * t * controlX + t * t * endX;
            const y = u * u * startY + 2 * u * t * controlY + t * t * endY;
            points.push({ x, y });
        }
        return points;
    };

    // Generate dendrites for a neuron
    const generateDendrites = (count: number): Dendrite[] => {
        const dendrites: Dendrite[] = [];
        const maxLength = 20;
        for (let i = 0; i < count; i++) {
            const mainDendrite: Dendrite = {
                length: 10 + Math.random() * maxLength,
                angle: Math.random() * Math.PI * 2,
                width: 1 + Math.random() * 1.5,
                curve: Math.random() * 0.2,
                activity: 0
            };
            if (Math.random() > 0.5) {
                mainDendrite.branches = [];
                const branchCount = 1 + Math.floor(Math.random());
                for (let j = 0; j < branchCount; j++) {
                    mainDendrite.branches.push({
                        length: 5 + Math.random() * 10,
                        angle: mainDendrite.angle + (Math.random() - 0.5) * Math.PI / 2,
                        width: mainDendrite.width * 0.7,
                        curve: Math.random() * 0.2,
                        activity: 0
                    });
                }
            }
            dendrites.push(mainDendrite);
        }
        return dendrites;
    };

    // Trigger a network event
    const triggerNetworkEvent = (type: NetworkEvent['type'], origin?: { x: number; y: number }, intensity?: number) => {
        const now = Date.now();
        if (now - lastEventTime.current < 3000) return;
        lastEventTime.current = now;
        const eventIntensity = intensity || 0.5 + Math.random() * 0.5;
        let duration = 0;
        let affectedNodes: string[] = [];
        switch (type) {
            case 'storm':
                duration = 3000 + Math.random() * 5000;
                affectedNodes = nodes.map(node => node.id);
                break;
            case 'wave':
                duration = 2000 + Math.random() * 3000;
                if (origin) {
                    affectedNodes = nodes
                        .map(node => ({
                            id: node.id,
                            dist: Math.sqrt(Math.pow(node.x - origin.x, 2) + Math.pow(node.y - origin.y, 2))
                        }))
                        .sort((a, b) => a.dist - b.dist)
                        .map(n => n.id);
                }
                break;
            case 'burst':
                duration = 1000 + Math.random() * 1000;
                affectedNodes = nodes.filter(() => Math.random() > 0.5).map(node => node.id);
                break;
            case 'colorShift':
                duration = 4000 + Math.random() * 3000;
                affectedNodes = nodes.map(node => node.id);
                break;
            case 'seizure':
                duration = 2000 + Math.random() * 1000;
                affectedNodes = nodes.map(node => node.id);
                break;
        }
        setNetworkEvents(prev => [...prev, {
            type,
            startTime: now,
            duration,
            intensity: eventIntensity,
            origin,
            affectedNodes,
            progress: 0
        }]);
    };

    // Create a star/particle field
    const createParticles = (count: number, width: number, height: number) => {
        const newParticles: Particle[] = [];
        for (let i = 0; i < count; i++) {
            newParticles.push({
                x: Math.random() * width,
                y: Math.random() * height,
                size: 0.5 + Math.random() * 1.5,
                vx: (Math.random() - 0.5) * 0.02,
                vy: (Math.random() - 0.5) * 0.02,
                opacity: 0.5 + Math.random() * 0.5,
                flickerSpeed: Math.random() * 0.05
            });
        }
        return newParticles;
    };

    // Create a spark near a node
    const createSpark = (node: Node) => {
        const angle = Math.random() * Math.PI * 2;
        return {
            x: node.x,
            y: node.y,
            radius: 1 + Math.random() * 2,
            life: 0,
            maxLife: 30 + Math.random() * 20,
            angle,
            speed: 0.5 + Math.random()
        };
    };

    // --- Initialize network ---
    useEffect(() => {
        if (!projects.length || isInitialized) return;
        const newNodes: Node[] = [];
        const colors = [
            'rgba(200, 180, 160, 0.8)',
            'rgba(190, 170, 150, 0.8)',
            'rgba(150, 130, 120, 0.8)',
            'rgba(170, 160, 150, 0.8)',
            'rgba(180, 165, 155, 0.8)'
        ];

        const centerX = window.innerWidth * 0.5;
        const centerY = window.innerHeight * 0.5;
        const baseHubRadius = 30;
        const hubNode: Node = {
            id: 'ai-hub',
            x: centerX,
            y: centerY,
            radius: baseHubRadius,
            baseRadius: baseHubRadius,
            color: 'rgba(200, 195, 170, 0.9)',
            vx: 0,
            vy: 0,
            project: {
                id: 'ai-hub',
                title: 'Neural Hub',
                description: 'Central neural interface',
                technologies: ['Biological Neural Network', 'Neural Interface'],
                image: '',
                demoLink: '',
                githubLink: '',
                type: 'core'
            },
            dendrites: generateDendrites(5 + Math.floor(Math.random() * 2)),
            pulseRate: 1500,
            lastPulseTime: Date.now(),
            activationLevel: 0.2,
            activationDecay: 0.01,
            threshold: 0.3,
            refractoryPeriod: 500,
            lastActivationTime: 0,
            mood: 'calm',
            moodTimer: 10000 + Math.random() * 15000,
            burstCounter: 0,
            hue: 0
        };

        if (layout === 'circular' || layout === 'hierarchical') {
            newNodes.push(hubNode);
            const minDimension = Math.min(window.innerWidth, window.innerHeight);
            const layoutRadius = layout === 'circular' ? minDimension * 0.3 : minDimension * 0.2;
            projects.forEach((project, index) => {
                const angleSlice = (Math.PI * 2) / projects.length;
                const angle = angleSlice * index;
                const distance = layoutRadius * (1 + (layout === 'hierarchical' ? Math.floor(index / 5) * 0.3 : 0));
                const baseRadius = 20;
                newNodes.push({
                    id: project.id,
                    x: centerX + Math.cos(angle) * distance,
                    y: centerY + Math.sin(angle) * distance,
                    radius: baseRadius,
                    baseRadius: baseRadius,
                    color: colors[index % colors.length],
                    vx: (Math.random() - 0.5) * 0.03,
                    vy: (Math.random() - 0.5) * 0.03,
                    project,
                    dendrites: generateDendrites(3 + Math.floor(Math.random() * 2)),
                    pulseRate: 2000 + Math.random() * 4000,
                    lastPulseTime: Date.now() - Math.random() * 5000,
                    activationLevel: 0,
                    activationDecay: 0.02 + Math.random() * 0.03,
                    threshold: 0.3 + Math.random() * 0.2,
                    refractoryPeriod: 1000 + Math.random() * 1000,
                    lastActivationTime: 0,
                    mood: Math.random() > 0.7 ? 'excited' : 'calm',
                    moodTimer: 5000 + Math.random() * 10000,
                    burstCounter: 0,
                    hue: 0
                });
            });
        } else if (layout === 'grid') {
            // Grid layout: compute columns and rows
            const cols = Math.ceil(Math.sqrt(projects.length + 1));
            const rows = Math.ceil((projects.length + 1) / cols);
            const gridWidth = window.innerWidth;
            const gridHeight = window.innerHeight;
            // Place hub in the first grid cell
            newNodes.push({
                ...hubNode,
                x: gridWidth * 0.5 / cols,
                y: gridHeight * 0.5 / rows
            });
            projects.forEach((project, index) => {
                const col = (index + 1) % cols;
                const row = Math.floor((index + 1) / cols);
                const baseRadius = 20;
                newNodes.push({
                    id: project.id,
                    x: (col + 0.5) * (gridWidth / cols),
                    y: (row + 0.5) * (gridHeight / rows),
                    radius: baseRadius,
                    baseRadius: baseRadius,
                    color: colors[index % colors.length],
                    vx: (Math.random() - 0.5) * 0.03,
                    vy: (Math.random() - 0.5) * 0.03,
                    project,
                    dendrites: generateDendrites(3 + Math.floor(Math.random() * 2)),
                    pulseRate: 2000 + Math.random() * 4000,
                    lastPulseTime: Date.now() - Math.random() * 5000,
                    activationLevel: 0,
                    activationDecay: 0.02 + Math.random() * 0.03,
                    threshold: 0.3 + Math.random() * 0.2,
                    refractoryPeriod: 1000 + Math.random() * 1000,
                    lastActivationTime: 0,
                    mood: Math.random() > 0.7 ? 'excited' : 'calm',
                    moodTimer: 5000 + Math.random() * 10000,
                    burstCounter: 0,
                    hue: 0
                });
            });
        } else if (layout === 'random') {
            newNodes.push(hubNode);
            projects.forEach((project, index) => {
                const baseRadius = 20;
                newNodes.push({
                    id: project.id,
                    x: Math.random() * window.innerWidth,
                    y: Math.random() * window.innerHeight,
                    radius: baseRadius,
                    baseRadius: baseRadius,
                    color: colors[index % colors.length],
                    vx: (Math.random() - 0.5) * 0.03,
                    vy: (Math.random() - 0.5) * 0.03,
                    project,
                    dendrites: generateDendrites(3 + Math.floor(Math.random() * 2)),
                    pulseRate: 2000 + Math.random() * 4000,
                    lastPulseTime: Date.now() - Math.random() * 5000,
                    activationLevel: 0,
                    activationDecay: 0.02 + Math.random() * 0.03,
                    threshold: 0.3 + Math.random() * 0.2,
                    refractoryPeriod: 1000 + Math.random() * 1000,
                    lastActivationTime: 0,
                    mood: Math.random() > 0.7 ? 'excited' : 'calm',
                    moodTimer: 5000 + Math.random() * 10000,
                    burstCounter: 0,
                    hue: 0
                });
            });
        }

        // Generate connections between nodes
        const newConnections: Connection[] = [];
        // Hub connections
        for (let i = 1; i < newNodes.length; i++) {
            const projectNode = newNodes[i];
            const points = generateCurvedPath(projectNode.x, projectNode.y, hubNode.x, hubNode.y);
            const baseWidth = 0.5 + Math.random() * 0.3;
            const isInhibitory = Math.random() < 0.2;
            newConnections.push({
                source: projectNode,
                target: hubNode,
                strength: 0.5 + Math.random() * 0.3,
                points,
                pulsePositions: [],
                pulseActive: false,
                lastPulseTime: Date.now() - Math.random() * 5000,
                pulseInterval: 3000 + Math.random() * 5000,
                pulseSpeed: 0.004 + Math.random() * 0.003,
                width: baseWidth,
                currentWidth: baseWidth,
                isInhibitory,
                health: 0.8 + Math.random() * 0.2,
                pulseSize: 1.0
            });
        }
        // Inter-node connections (neighboring and cross connections)
        for (let i = 1; i < newNodes.length; i++) {
            const nextIndex = i < newNodes.length - 1 ? i + 1 : 1;
            const points = generateCurvedPath(newNodes[i].x, newNodes[i].y, newNodes[nextIndex].x, newNodes[nextIndex].y);
            const baseWidth = 0.3 + Math.random() * 0.2;
            const isInhibitory = Math.random() < 0.3;
            newConnections.push({
                source: newNodes[i],
                target: newNodes[nextIndex],
                strength: 0.3 + Math.random() * 0.2,
                points,
                pulsePositions: [],
                pulseActive: false,
                lastPulseTime: Date.now() - Math.random() * 5000,
                pulseInterval: 4000 + Math.random() * 6000,
                pulseSpeed: 0.003 + Math.random() * 0.002,
                width: baseWidth,
                currentWidth: baseWidth,
                isInhibitory,
                health: 0.7 + Math.random() * 0.3,
                pulseSize: 1.0
            });
        }
        const crossConnectionCount = Math.min(3, Math.floor(projects.length / 2));
        for (let i = 0; i < crossConnectionCount; i++) {
            const sourceIndex = 1 + Math.floor(Math.random() * (newNodes.length - 1));
            let targetIndex;
            do {
                targetIndex = 1 + Math.floor(Math.random() * (newNodes.length - 1));
            } while (
                targetIndex === sourceIndex ||
                Math.abs(targetIndex - sourceIndex) === 1 ||
                (sourceIndex === newNodes.length - 1 && targetIndex === 1)
            );
            const sourceNode = newNodes[sourceIndex];
            const targetNode = newNodes[targetIndex];
            const points = generateCurvedPath(sourceNode.x, sourceNode.y, targetNode.x, targetNode.y);
            const baseWidth = 0.2 + Math.random() * 0.2;
            const isInhibitory = Math.random() < 0.5;
            newConnections.push({
                source: sourceNode,
                target: targetNode,
                strength: 0.2 + Math.random() * 0.2,
                points,
                pulsePositions: [],
                pulseActive: false,
                lastPulseTime: Date.now() - Math.random() * 5000,
                pulseInterval: 5000 + Math.random() * 7000,
                pulseSpeed: 0.002 + Math.random() * 0.002,
                width: baseWidth,
                currentWidth: baseWidth,
                isInhibitory,
                health: 0.6 + Math.random() * 0.4,
                pulseSize: 1.0
            });
        }

        setNodes(newNodes);
        setConnections(newConnections);
        // Initialize starfield particles
        const particleCount = 120;
        const starfield = createParticles(particleCount, window.innerWidth, window.innerHeight);
        setParticles(starfield);
        setIsInitialized(true);
        setTimeout(() => {
            triggerNetworkEvent('wave', { x: centerX, y: centerY }, 0.7);
        }, 3000);
    }, [projects, isInitialized, layout]);

    // Mouse movement tracking
    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            const canvas = canvasRef.current;
            if (!canvas) return;
            const rect = canvas.getBoundingClientRect();
            mousePositionRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
        };
        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    // Randomly trigger network events
    useEffect(() => {
        if (!isInitialized) return;
        const eventTypes: NetworkEvent['type'][] = ['wave', 'burst', 'storm', 'colorShift', 'seizure'];
        const randomEventInterval = setInterval(() => {
            if (Math.random() < 0.05 + networkActivity * 0.2) {
                const eventType = eventTypes[Math.floor(Math.random() * eventTypes.length)];
                if (eventType === 'wave' && nodes.length > 0) {
                    const originNode = nodes[Math.floor(Math.random() * nodes.length)];
                    triggerNetworkEvent(eventType, { x: originNode.x, y: originNode.y });
                } else {
                    triggerNetworkEvent(eventType);
                }
            }
        }, 5000);
        return () => clearInterval(randomEventInterval);
    }, [isInitialized, networkActivity, nodes]);

    // Draw network and advanced visual effects
    useEffect(() => {
        if (!nodes.length || !connections.length) return;
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const handleResize = () => {
            if (canvas && containerRef.current) {
                canvas.width = containerRef.current.clientWidth;
                canvas.height = containerRef.current.clientHeight;
            }
        };
        handleResize();
        window.addEventListener('resize', handleResize);

        const animate = (timestamp: number) => {
            if (!canvas || !ctx) return;
            const deltaTime = timestamp - lastFrameTime.current;
            lastFrameTime.current = timestamp;
            const normalizedDelta = deltaTime / 16.67;
            const deltaMult = Math.min(normalizedDelta, 2);
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Draw starfield background
            const updatedParticles = [...particles];
            updatedParticles.forEach(p => {
                p.x += p.vx * deltaMult;
                p.y += p.vy * deltaMult;
                p.opacity += p.flickerSpeed * (Math.random() - 0.5) * 0.1;
                p.opacity = Math.max(0.2, Math.min(1, p.opacity));
                if (p.x < 0) p.x = canvas.width;
                if (p.x > canvas.width) p.x = 0;
                if (p.y < 0) p.y = canvas.height;
                if (p.y > canvas.height) p.y = 0;
                ctx.beginPath();
                ctx.fillStyle = `rgba(255, 255, 255, ${p.opacity})`;
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fill();
            });
            setParticles(updatedParticles);

            // Process network events
            const now = Date.now();
            const activeEvents = [...networkEvents];
            const updatedEvents: NetworkEvent[] = [];
            activeEvents.forEach(event => {
                const elapsed = now - event.startTime;
                if (elapsed <= event.duration) {
                    event.progress = elapsed / event.duration;
                    updatedEvents.push(event);
                }
            });
            if (updatedEvents.length !== networkEvents.length) {
                setNetworkEvents(updatedEvents);
            }

            // Node repulsion: ensure nodes do not get too close
            for (let i = 0; i < nodes.length; i++) {
                for (let j = i + 1; j < nodes.length; j++) {
                    const nodeA = nodes[i];
                    const nodeB = nodes[j];
                    const dx = nodeA.x - nodeB.x;
                    const dy = nodeA.y - nodeB.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    const minDistance = nodeA.radius + nodeB.radius + 10;
                    if (dist < minDistance && dist > 0) {
                        const overlap = (minDistance - dist) / 2;
                        const repulsionStrength = 0.05;
                        const forceX = (dx / dist) * overlap * repulsionStrength * deltaMult;
                        const forceY = (dy / dist) * overlap * repulsionStrength * deltaMult;
                        nodeA.vx += forceX;
                        nodeA.vy += forceY;
                        nodeB.vx -= forceX;
                        nodeB.vy -= forceY;
                    }
                }
            }

            // Calculate overall network activity
            const totalActivity = nodes.reduce((sum, node) => sum + node.activationLevel, 0) / nodes.length;
            setNetworkActivity(prev => prev * 0.95 + totalActivity * 0.05);

            // Mouse interaction position
            const mousePos = mousePositionRef.current;

            // Update nodes
            const updatedNodes = [...nodes];
            updatedNodes.forEach((node, index) => {
                const now = Date.now();
                node.moodTimer -= deltaTime;
                if (node.moodTimer <= 0) {
                    const moods: Node['mood'][] = ['calm', 'excited', 'erratic'];
                    node.mood = moods[Math.floor(Math.random() * moods.length)];
                    node.moodTimer = 5000 + Math.random() * 15000;
                    if (index > 0) {
                        const angle = Math.random() * Math.PI * 2;
                        const force = 0.1 + Math.random() * 0.2;
                        node.vx = Math.cos(angle) * force;
                        node.vy = Math.sin(angle) * force;
                    }
                }
                if (index === 0) {
                    node.x = canvas.width / 2 + Math.sin(now * 0.0005) * 5;
                    node.y = canvas.height / 2 + Math.cos(now * 0.0004) * 5;
                } else {
                    const burstChance = node.mood === 'calm' ? 0.002 : node.mood === 'excited' ? 0.01 : 0.03;
                    if (Math.random() < burstChance * deltaMult) {
                        node.burstCounter = 20 + Math.floor(Math.random() * 30);
                        const angle = Math.random() * Math.PI * 2;
                        const force = 0.2 + Math.random() * 0.6;
                        node.vx = Math.cos(angle) * force;
                        node.vy = Math.sin(angle) * force;
                    }
                    if (node.burstCounter > 0) {
                        node.burstCounter--;
                        if (node.burstCounter === 0) {
                            node.vx *= 0.5;
                            node.vy *= 0.5;
                        }
                    }
                    activeEvents.forEach(event => {
                        if (!event.affectedNodes?.includes(node.id)) return;
                        switch (event.type) {
                            case 'storm':
                                if (Math.random() < 0.05 * event.intensity * deltaMult) {
                                    node.vx += (Math.random() - 0.5) * 0.2 * event.intensity;
                                    node.vy += (Math.random() - 0.5) * 0.2 * event.intensity;
                                }
                                break;
                            case 'wave':
                                if (event.origin && event.affectedNodes) {
                                    const nodeIndex = event.affectedNodes.indexOf(node.id);
                                    const nodeProgress = nodeIndex / event.affectedNodes.length;
                                    const waveFront = event.progress * 1.5;
                                    const waveWidth = 0.3;
                                    if (nodeProgress <= waveFront && nodeProgress >= waveFront - waveWidth) {
                                        const waveEffect = 1 - Math.abs(waveFront - nodeProgress) / waveWidth;
                                        node.activationLevel = Math.min(1, node.activationLevel + waveEffect * 0.1 * event.intensity);
                                        const dx = node.x - event.origin.x;
                                        const dy = node.y - event.origin.y;
                                        const dist = Math.sqrt(dx * dx + dy * dy);
                                        if (dist > 0) {
                                            node.vx += (dx / dist) * 0.05 * waveEffect * event.intensity;
                                            node.vy += (dy / dist) * 0.05 * waveEffect * event.intensity;
                                        }
                                    }
                                }
                                break;
                            case 'burst':
                                if (Math.random() < 0.3 * deltaMult) {
                                    node.activationLevel = Math.min(1, node.activationLevel + 0.1 * event.intensity);
                                }
                                break;
                            case 'colorShift':
                                node.hue = (Math.sin(now * 0.001 + index) * 0.5 + 0.5) * 30 * event.intensity;
                                break;
                            case 'seizure':
                                node.vx += (Math.random() - 0.5) * 0.8 * event.intensity * deltaMult;
                                node.vy += (Math.random() - 0.5) * 0.8 * event.intensity * deltaMult;
                                if (Math.random() < 0.2 * deltaMult) {
                                    node.activationLevel = Math.min(1, node.activationLevel + 0.3 * event.intensity);
                                }
                                break;
                        }
                    });
                    if (mousePos) {
                        const dx = node.x - mousePos.x;
                        const dy = node.y - mousePos.y;
                        const dist = Math.sqrt(dx * dx + dy * dy);
                        if (dist < 200) {
                            const interactionForce = 0.01 * (1 - dist / 200) * deltaMult;
                            node.vx -= dx * interactionForce;
                            node.vy -= dy * interactionForce;
                            if (dist < 120) {
                                node.activationLevel = Math.min(0.4, node.activationLevel + 0.015 * (1 - dist / 120) * deltaMult);
                                if (dist < 80) {
                                    const sizeFactor = 1 + 0.2 * (1 - dist / 80);
                                    node.radius = node.baseRadius * sizeFactor;
                                }
                            }
                        }
                    }
                    const movementAmplitude = 1 + node.activationLevel * 2;
                    const jitterAmplitude = node.mood === 'calm' ? 0.01 : node.mood === 'excited' ? 0.03 : 0.08;
                    if (Math.random() < 0.3 * deltaMult) {
                        node.vx += (Math.random() - 0.5) * jitterAmplitude * deltaMult;
                        node.vy += (Math.random() - 0.5) * jitterAmplitude * deltaMult;
                    }
                    node.x += node.vx * deltaMult * movementAmplitude;
                    node.y += node.vy * deltaMult * movementAmplitude;
                    const maxVel = node.mood === 'calm' ? 0.15 : node.mood === 'excited' ? 0.3 : 0.5;
                    const adjustedMaxVel = maxVel * (1 + node.activationLevel);
                    if (Math.abs(node.vx) > adjustedMaxVel) node.vx = Math.sign(node.vx) * adjustedMaxVel;
                    if (Math.abs(node.vy) > adjustedMaxVel) node.vy = Math.sign(node.vy) * adjustedMaxVel;
                }
                // Keep nodes in circular formation around hub
                const hub = updatedNodes[0];
                const dx = node.x - hub.x;
                const dy = node.y - hub.y;
                const distFromHub = Math.sqrt(dx * dx + dy * dy);
                const minDimension = Math.min(canvas.width, canvas.height);
                const oscillationFactor = 1 + Math.sin(now * 0.0002 + index * 0.5) * 0.08;
                const idealDist = minDimension * 0.3 * oscillationFactor;
                const distForceFactor = 0.01 * deltaMult;
                if (distFromHub > idealDist * 1.15) {
                    node.vx -= dx * distForceFactor * 1.8;
                    node.vy -= dy * distForceFactor * 1.8;
                } else if (distFromHub < idealDist * 0.85) {
                    node.vx += dx * distForceFactor * 1.8;
                    node.vy += dy * distForceFactor * 1.8;
                } else if (distFromHub > idealDist * 1.05 || distFromHub < idealDist * 0.95) {
                    const adjustFactor = distFromHub > idealDist ? -1 : 1;
                    node.vx += dx * distForceFactor * 0.7 * adjustFactor;
                    node.vy += dy * distForceFactor * 0.7 * adjustFactor;
                }
                const safeMargin = minDimension * 0.1;
                const edgeForceFactor = 0.05 * deltaMult;
                if (node.x < safeMargin) {
                    node.vx += edgeForceFactor * (1 - node.x / safeMargin);
                    if (node.x < 10) node.x = 10;
                }
                if (node.x > canvas.width - safeMargin) {
                    node.vx -= edgeForceFactor * (1 - (canvas.width - node.x) / safeMargin);
                    if (node.x > canvas.width - 10) node.x = canvas.width - 10;
                }
                if (node.y < safeMargin) {
                    node.vy += edgeForceFactor * (1 - node.y / safeMargin);
                    if (node.y < 10) node.y = 10;
                }
                if (node.y > canvas.height - safeMargin) {
                    node.vy -= edgeForceFactor * (1 - (canvas.height - node.y) / safeMargin);
                    if (node.y > canvas.height - 10) node.y = canvas.height - 10;
                }
                const dampingFactor = node.mood === 'calm' ? 0.95 : node.mood === 'excited' ? 0.97 : 0.98;
                node.vx *= dampingFactor;
                node.vy *= dampingFactor;
                if (node.activationLevel > 0) {
                    const decayMultiplier = node.mood === 'calm' ? 1 : node.mood === 'excited' ? 0.7 : 0.5;
                    node.activationLevel = Math.max(0, node.activationLevel - node.activationDecay * deltaMult * 0.1 * decayMultiplier * simulationParams.nodeWeight);
                }
                node.dendrites.forEach(dendrite => {
                    dendrite.activity = dendrite.activity * 0.9 + node.activationLevel * 0.1;
                    if (dendrite.branches) {
                        dendrite.branches.forEach(branch => {
                            branch.activity = branch.activity * 0.9 + dendrite.activity * 0.1;
                        });
                    }
                });
                const oscillation = Math.sin(now * 0.003 + index * 1.5) * 0.5;
                node.radius = node.baseRadius * (1 + node.activationLevel * 0.2 + oscillation * 0.05);
                if (node.activationLevel > 0.7 && Math.random() < 0.02) {
                    setSparks(prev => [...prev, createSpark(node)]);
                }
            });

            // Update connections
            const updatedConnections = [...connections];
            updatedConnections.forEach((connection, idx) => {
                connection.points = generateCurvedPath(connection.source.x, connection.source.y, connection.target.x, connection.target.y);
                const now = Date.now();
                activeEvents.forEach(event => {
                    switch (event.type) {
                        case 'storm':
                            if (Math.random() < 0.001 * event.intensity * deltaMult) {
                                connection.pulseActive = true;
                                connection.pulsePositions.push(0);
                                connection.pulseSize = 1 + Math.random() * event.intensity;
                            }
                            break;
                        case 'seizure':
                            connection.currentWidth = connection.width * (1 + Math.sin(now * 0.01 + idx) * event.intensity);
                            break;
                        case 'colorShift':
                            if (Math.random() < 0.005 * event.intensity * deltaMult) {
                                connection.isInhibitory = !connection.isInhibitory;
                            }
                            break;
                    }
                });
                if (connection.health < 1 && Math.random() < 0.001 * deltaMult) {
                    connection.health = Math.min(1, connection.health + 0.1);
                    connection.width = Math.min(1, connection.width * 1.1);
                }
                if (Math.random() < 0.0002 * deltaMult) {
                    connection.health = Math.max(0.2, connection.health - 0.1);
                    connection.width = Math.max(0.1, connection.width * 0.9);
                }
                const sourceNode = connection.source;
                if (
                    sourceNode.activationLevel > simulationParams.activationThreshold &&
                    now - sourceNode.lastActivationTime > sourceNode.refractoryPeriod
                ) {
                    if (Math.random() < sourceNode.activationLevel * 0.8) {
                        connection.pulseActive = true;
                        connection.pulsePositions.push(0);
                        connection.lastPulseTime = now;
                        connection.pulseSize = 0.8 + sourceNode.activationLevel * 0.5 + Math.random() * 0.2;
                        sourceNode.lastActivationTime = now;
                    }
                }
                const timeSinceLastPulse = now - connection.lastPulseTime;
                const activeFactor = timeSinceLastPulse < 1000 ? (1 - timeSinceLastPulse / 1000) * 2 : 0;
                connection.currentWidth = connection.width * (1 + activeFactor) * connection.health;
                if (connection.pulseActive) {
                    for (let i = 0; i < connection.pulsePositions.length; i++) {
                        const speedVariation = 0.8 + Math.random() * 0.4;
                        const speed = connection.pulseSpeed * simulationParams.pulseSpeed * speedVariation * (1 + networkActivity * 3) * deltaMult;
                        connection.pulsePositions[i] += speed;
                        if (connection.pulsePositions[i] >= 1) {
                            const targetNode = updatedNodes.find(n => n.id === connection.target.id);
                            if (targetNode) {
                                if (connection.isInhibitory) {
                                    targetNode.activationLevel = Math.max(0, targetNode.activationLevel - connection.strength * 0.2 * connection.health);
                                } else {
                                    targetNode.activationLevel = Math.min(1, targetNode.activationLevel + connection.strength * simulationParams.connectionStrength * 0.3 * connection.health);
                                }
                            }
                            connection.pulsePositions.splice(i, 1);
                            i--;
                            if (connection.pulsePositions.length === 0) {
                                connection.pulseActive = false;
                            }
                        }
                    }
                }
                const spontChance = 0.0005 * networkActivity * networkActivity * connection.health;
                if (!connection.pulseActive && Math.random() < spontChance * deltaMult) {
                    connection.pulseActive = true;
                    connection.pulsePositions.push(0);
                    connection.lastPulseTime = now;
                    connection.pulseSize = 0.7 + Math.random() * 0.6;
                }
            });

            // Update sparks
            const newSparks: Spark[] = [];
            sparks.forEach(spark => {
                spark.life += 1 * deltaMult;
                spark.x += Math.cos(spark.angle) * spark.speed * deltaMult;
                spark.y += Math.sin(spark.angle) * spark.speed * deltaMult;
                spark.radius *= 0.98;
                if (spark.life < spark.maxLife) newSparks.push(spark);
            });
            setSparks(newSparks);

            // --- DRAWING ---

            // Neural storm overlay if high activity
            if (networkActivity > 0.8) {
                ctx.save();
                ctx.globalAlpha = 0.15 + Math.sin(now * 0.005) * 0.05;
                ctx.fillStyle = 'rgba(255, 100, 50, 0.3)';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                ctx.restore();
            }

            // 1) Dendrites
            updatedNodes.forEach(node => {
                node.dendrites.forEach(dendrite => {
                    const startX = node.x;
                    const startY = node.y;
                    ctx.beginPath();
                    ctx.moveTo(startX, startY);
                    const endX = startX + Math.cos(dendrite.angle) * dendrite.length;
                    const endY = startY + Math.sin(dendrite.angle) * dendrite.length;
                    const ctrlX = startX + Math.cos(dendrite.angle + dendrite.curve) * dendrite.length * 0.5;
                    const ctrlY = startY + Math.sin(dendrite.angle + dendrite.curve) * dendrite.length * 0.5;
                    ctx.quadraticCurveTo(ctrlX, ctrlY, endX, endY);
                    const activityBoost = 1 + dendrite.activity * 2;
                    ctx.lineWidth = dendrite.width * activityBoost;
                    let baseColor = node.color;
                    if (node.hue !== 0) {
                        const match = baseColor.match(/rgba\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*,\s*([\d.]+)\)/);
                        if (match) {
                            const r = parseInt(match[1]);
                            const g = parseInt(match[2]);
                            const b = parseInt(match[3]);
                            const a = parseFloat(match[4]);
                            const shift = node.hue / 100;
                            const nr = Math.min(255, r + shift * 20);
                            const nb = Math.min(255, b - shift * 10);
                            baseColor = `rgba(${nr}, ${g}, ${nb}, ${a})`;
                        }
                    }
                    const activeColor = baseColor.replace('0.8)', '0.95)');
                    const dendriteColor = dendrite.activity > 0.1 ? activeColor : baseColor;
                    ctx.strokeStyle = dendriteColor;
                    ctx.stroke();
                    if (dendrite.branches) {
                        dendrite.branches.forEach(branch => {
                            ctx.beginPath();
                            ctx.moveTo(endX, endY);
                            const branchEndX = endX + Math.cos(branch.angle) * branch.length;
                            const branchEndY = endY + Math.sin(branch.angle) * branch.length;
                            const branchCtrlX = endX + Math.cos(branch.angle + branch.curve) * branch.length * 0.5;
                            const branchCtrlY = endY + Math.sin(branch.angle + branch.curve) * branch.length * 0.5;
                            ctx.quadraticCurveTo(branchCtrlX, branchCtrlY, branchEndX, branchEndY);
                            const branchActivityBoost = 1 + branch.activity * 2;
                            ctx.lineWidth = branch.width * branchActivityBoost;
                            const branchColor = branch.activity > 0.1 ? activeColor : baseColor;
                            ctx.strokeStyle = branchColor;
                            ctx.stroke();
                        });
                    }
                });
            });

            // 2) Connections (axons) with light trails
            updatedConnections.forEach(connection => {
                ctx.beginPath();
                ctx.moveTo(connection.points[0].x, connection.points[0].y);
                for (let i = 1; i < connection.points.length; i++) {
                    ctx.lineTo(connection.points[i].x, connection.points[i].y);
                }
                ctx.strokeStyle = connection.isInhibitory
                    ? `rgba(150, 140, 160, ${0.3 + connection.health * 0.2})`
                    : `rgba(160, 150, 140, ${0.3 + connection.health * 0.2})`;
                ctx.lineWidth = 1 + connection.currentWidth;
                ctx.stroke();
                connection.pulsePositions.forEach(position => {
                    if (position >= 0 && position < 1) {
                        const index = Math.floor(position * (connection.points.length - 1));
                        const nextIndex = Math.min(index + 1, connection.points.length - 1);
                        const subPosition = position * (connection.points.length - 1) - index;
                        const pulseX = connection.points[index].x + (connection.points[nextIndex].x - connection.points[index].x) * subPosition;
                        const pulseY = connection.points[index].y + (connection.points[nextIndex].y - connection.points[index].y) * subPosition;
                        ctx.beginPath();
                        const pulseSize = (2 + connection.strength * 2) * connection.pulseSize;
                        ctx.arc(pulseX, pulseY, pulseSize, 0, Math.PI * 2);
                        ctx.fillStyle = connection.isInhibitory
                            ? `rgba(210, 180, 220, 0.9)`
                            : `rgba(230, 210, 180, 0.9)`;
                        ctx.fill();
                        // Light trail effect
                        const trailPos = Math.max(0, position - 0.05);
                        const trailIndex = Math.floor(trailPos * (connection.points.length - 1));
                        const trailNextIndex = Math.min(trailIndex + 1, connection.points.length - 1);
                        const trailSubPos = trailPos * (connection.points.length - 1) - trailIndex;
                        const trailX = connection.points[trailIndex].x + (connection.points[trailNextIndex].x - connection.points[trailIndex].x) * trailSubPos;
                        const trailY = connection.points[trailIndex].y + (connection.points[trailNextIndex].y - connection.points[trailIndex].y) * trailSubPos;
                        ctx.beginPath();
                        ctx.moveTo(trailX, trailY);
                        ctx.lineTo(pulseX, pulseY);
                        ctx.strokeStyle = connection.isInhibitory
                            ? 'rgba(210, 180, 220, 0.3)'
                            : 'rgba(230, 210, 180, 0.3)';
                        ctx.lineWidth = pulseSize * 0.5;
                        ctx.stroke();
                    }
                });
            });

            // 3) Sparks
            newSparks.forEach(spark => {
                ctx.save();
                ctx.beginPath();
                ctx.fillStyle = `rgba(255, 255, 100, ${1 - spark.life / spark.maxLife})`;
                ctx.arc(spark.x, spark.y, spark.radius, 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();
            });

            // 4) Draw neuron cell bodies with visual state indicators
            updatedNodes.forEach(node => {
                const now = Date.now();
                const timeSinceLastPulse = now - node.lastPulseTime;
                const isPulsing = timeSinceLastPulse < 500;
                const isHovered = hoveredNode && hoveredNode.id === node.id;
                const isActive = node.activationLevel > 0.1;
                const glowSize = isPulsing || isActive ? 20 + node.activationLevel * 15 : isHovered ? 25 : 10;
                ctx.beginPath();
                ctx.arc(node.x, node.y, node.radius + glowSize, 0, Math.PI * 2);
                const glowGradient = ctx.createRadialGradient(node.x, node.y, node.radius, node.x, node.y, node.radius + glowSize);
                let glowColor;
                if (isActive) {
                    const r = 240;
                    const g = 220 - (node.mood === 'erratic' ? 40 : 0);
                    const b = 190 + (node.mood === 'excited' ? 20 : 0);
                    glowColor = `rgba(${r}, ${g}, ${b}, `;
                } else if (isPulsing) {
                    glowColor = 'rgba(230, 210, 180, ';
                } else {
                    glowColor = 'rgba(180, 170, 150, ';
                }
                const glowIntensity = Math.min(0.8, 0.5 + node.activationLevel * 0.4);
                glowGradient.addColorStop(0, glowColor + glowIntensity + ')');
                glowGradient.addColorStop(1, glowColor + '0)');
                ctx.fillStyle = glowGradient;
                ctx.fill();
                ctx.beginPath();
                if (node.mood === 'erratic' && node.activationLevel > 0.3) {
                    const deformFactor = 0.2 * node.activationLevel;
                    const segmentCount = 8;
                    for (let i = 0; i <= segmentCount; i++) {
                        const angle = (i / segmentCount) * Math.PI * 2;
                        const radiusVariation = node.radius * (1 + deformFactor * Math.sin(angle * 3 + now * 0.01));
                        const x = node.x + Math.cos(angle) * radiusVariation;
                        const y = node.y + Math.sin(angle) * radiusVariation;
                        if (i === 0) ctx.moveTo(x, y);
                        else ctx.lineTo(x, y);
                    }
                } else {
                    ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
                }
                const cellGradient = ctx.createRadialGradient(
                    node.x - node.radius * 0.3,
                    node.y - node.radius * 0.3,
                    node.radius * 0.1,
                    node.x,
                    node.y,
                    node.radius
                );
                let baseColor = node.color;
                if (node.hue !== 0) {
                    const match = baseColor.match(/rgba\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*,\s*([\d.]+)\)/);
                    if (match) {
                        const r = parseInt(match[1]);
                        const g = parseInt(match[2]);
                        const b = parseInt(match[3]);
                        const a = parseFloat(match[4]);
                        const shift = node.hue / 100;
                        const nr = Math.min(255, r + shift * 30);
                        const ng = Math.min(255, g + shift * 10);
                        const nb = Math.min(255, b - shift * 20);
                        baseColor = `rgba(${nr}, ${ng}, ${nb}, ${a})`;
                    }
                }
                let activeColor;
                if (node.mood === 'excited') {
                    activeColor = baseColor.replace(/rgba\((\d+),\s*(\d+),\s*(\d+)/, (_m, r, g, b) =>
                        `rgba(${Math.min(255, parseInt(r) + 20)}, ${g}, ${Math.max(0, parseInt(b) - 10)}`
                    );
                } else if (node.mood === 'erratic') {
                    activeColor = baseColor.replace(/rgba\((\d+),\s*(\d+),\s*(\d+)/, (_m, r, g, b) =>
                        `rgba(${Math.min(255, parseInt(r) + 10)}, ${Math.max(0, parseInt(g) - 10)}, ${Math.min(255, parseInt(b) + 20)}`
                    );
                } else {
                    activeColor = baseColor.replace('rgba', 'rgba').replace('0.8)', '0.95)');
                }
                cellGradient.addColorStop(0, 'rgba(230, 220, 200, 0.9)');
                cellGradient.addColorStop(0.3, node.activationLevel > 0.3 ? activeColor : baseColor);
                cellGradient.addColorStop(1, baseColor.replace(', 0.8)', ', 0.7)'));
                ctx.fillStyle = cellGradient;
                ctx.fill();
                ctx.strokeStyle = node.activationLevel > 0.3 ? 'rgba(180, 160, 140, 0.6)' : 'rgba(140, 130, 120, 0.4)';
                ctx.lineWidth = isHovered ? 2 : 1;
                ctx.stroke();
                // Nucleus
                ctx.beginPath();
                const nucleusRadius = node.radius * 0.4;
                if (node.mood === 'erratic' && node.activationLevel > 0.4) {
                    const segmentCount = 6;
                    const irregularity = 0.3 * node.activationLevel;
                    for (let i = 0; i <= segmentCount; i++) {
                        const angle = (i / segmentCount) * Math.PI * 2;
                        const radiusVariation = nucleusRadius * (1 + irregularity * Math.sin(angle * 2 + now * 0.008));
                        const x = node.x + Math.cos(angle) * radiusVariation;
                        const y = node.y + Math.sin(angle) * radiusVariation;
                        if (i === 0) ctx.moveTo(x, y);
                        else ctx.lineTo(x, y);
                    }
                } else {
                    ctx.arc(node.x, node.y, nucleusRadius, 0, Math.PI * 2);
                }
                const nucleusGradient = ctx.createRadialGradient(
                    node.x - nucleusRadius * 0.3,
                    node.y - nucleusRadius * 0.3,
                    nucleusRadius * 0.1,
                    node.x,
                    node.y,
                    nucleusRadius
                );
                let nucleusColor1, nucleusColor2;
                if (node.mood === 'excited') {
                    nucleusColor1 = node.activationLevel > 0.3 ? 'rgba(220, 205, 190, 0.95)' : 'rgba(205, 195, 180, 0.9)';
                    nucleusColor2 = node.activationLevel > 0.3 ? 'rgba(200, 185, 170, 0.8)' : 'rgba(180, 170, 155, 0.7)';
                } else if (node.mood === 'erratic') {
                    const pulseOffset = Math.sin(now * 0.003) * 10;
                    nucleusColor1 = node.activationLevel > 0.3 ? `rgba(${210 + pulseOffset}, ${200 - pulseOffset}, 185, 0.95)` : 'rgba(200, 190, 180, 0.9)';
                    nucleusColor2 = node.activationLevel > 0.3 ? `rgba(${190 + pulseOffset}, ${180 - pulseOffset}, 165, 0.8)` : 'rgba(170, 160, 150, 0.7)';
                } else {
                    nucleusColor1 = node.activationLevel > 0.3 ? 'rgba(210, 200, 190, 0.95)' : 'rgba(200, 190, 180, 0.9)';
                    nucleusColor2 = node.activationLevel > 0.3 ? 'rgba(190, 180, 170, 0.8)' : 'rgba(170, 160, 150, 0.7)';
                }
                nucleusGradient.addColorStop(0, nucleusColor1);
                nucleusGradient.addColorStop(1, nucleusColor2);
                ctx.fillStyle = nucleusGradient;
                ctx.fill();
                // Label display for hovered nodes and hub
                if (isHovered || node.id === 'ai-hub') {
                    ctx.font = '14px "Courier New", monospace';
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    const textWidth = ctx.measureText(node.project.title).width;
                    ctx.fillStyle = 'rgba(10, 10, 15, 0.7)';
                    ctx.fillRect(node.x - textWidth / 2 - 5, node.y + node.radius + 5, textWidth + 10, 20);
                    ctx.fillStyle = 'rgba(220, 210, 200, 0.9)';
                    ctx.fillText(node.project.title, node.x, node.y + node.radius + 15);
                }
                // NEW: Extra visual state indicator for highly active neurons
                if (node.activationLevel > 0.8) {
                    ctx.save();
                    ctx.shadowColor = 'rgba(255, 255, 0, 0.8)';
                    ctx.shadowBlur = 30;
                    ctx.beginPath();
                    ctx.arc(node.x, node.y, node.radius + 20, 0, Math.PI * 2);
                    ctx.strokeStyle = 'rgba(255, 255, 0, 0.5)';
                    ctx.lineWidth = 3;
                    ctx.stroke();
                    ctx.restore();
                }
            });

            // 5) Network event overlays
            activeEvents.forEach(event => {
                if (event.type === 'wave' && event.origin) {
                    ctx.beginPath();
                    const radius = Math.min(canvas.width, canvas.height) * event.progress * 0.8;
                    ctx.arc(event.origin.x, event.origin.y, radius, 0, Math.PI * 2);
                    const waveGradient = ctx.createRadialGradient(event.origin.x, event.origin.y, radius * 0.8, event.origin.x, event.origin.y, radius);
                    const alphaFactor = (1 - event.progress) * 0.3 * event.intensity;
                    waveGradient.addColorStop(0, `rgba(200, 180, 160, 0)`);
                    waveGradient.addColorStop(0.7, `rgba(200, 180, 160, ${alphaFactor * 0.1})`);
                    waveGradient.addColorStop(1, `rgba(200, 180, 160, 0)`);
                    ctx.fillStyle = waveGradient;
                    ctx.fill();
                }
                if (event.type === 'seizure') {
                    ctx.fillStyle = `rgba(255, 240, 230, ${0.05 * event.intensity * Math.sin(now * 0.01)})`;
                    ctx.fillRect(0, 0, canvas.width, canvas.height);
                }
            });

            setNodes(updatedNodes);
            setConnections(updatedConnections);
            animationRef.current = requestAnimationFrame(animate);
        };

        animationRef.current = requestAnimationFrame(animate);
        return () => {
            if (animationRef.current) cancelAnimationFrame(animationRef.current);
            window.removeEventListener('resize', handleResize);
        };
    }, [nodes, connections, hoveredNode, networkActivity, networkEvents, particles, sparks, simulationParams]);

    // Mouse interaction handling
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const handleMouseMove = (e: MouseEvent) => {
            const rect = canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            let found = false;
            for (const node of nodes) {
                const dist = Math.sqrt((node.x - x) ** 2 + (node.y - y) ** 2);
                const hitRadius = node.radius * 1.2 + 15;
                if (dist <= hitRadius) {
                    setHoveredNode(node);
                    canvas.style.cursor = 'pointer';
                    found = true;
                    if (node.activationLevel < 0.4) {
                        const updatedNodes = [...nodes];
                        const hovered = updatedNodes.find(n => n.id === node.id);
                        if (hovered) {
                            hovered.activationLevel = Math.min(0.6, hovered.activationLevel + 0.03);
                            hovered.radius = hovered.baseRadius * 1.15;
                            setNodes(updatedNodes);
                        }
                    }
                    break;
                }
            }
            if (!found) {
                setHoveredNode(null);
                canvas.style.cursor = 'default';
            }
        };
        const handleClick = (e: MouseEvent) => {
            const rect = canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const MAX_REACH = 200;
            if (hoveredNode) {
                onNodeClick(hoveredNode.project);
                const updatedNodes = [...nodes];
                const clickedNode = updatedNodes.find(n => n.id === hoveredNode.id);
                if (clickedNode) {
                    clickedNode.activationLevel = 1.0;
                    clickedNode.lastPulseTime = Date.now();
                    clickedNode.lastActivationTime = Date.now();
                    updatedNodes.forEach(node => {
                        if (node.id !== clickedNode.id) {
                            const dx = node.x - clickedNode.x;
                            const dy = node.y - clickedNode.y;
                            const dist = Math.sqrt(dx * dx + dy * dy);
                            if (dist < MAX_REACH) {
                                const influence = 0.5 * (1 - dist / MAX_REACH);
                                node.activationLevel = Math.min(1, node.activationLevel + influence);
                            }
                        }
                    });
                    setNodes(updatedNodes);
                    const outgoingConnections = connections.filter(c => c.source.id === clickedNode.id);
                    const updatedConnections = [...connections];
                    outgoingConnections.forEach(axon => {
                        const connectionToUpdate = updatedConnections.find(c => c.source.id === axon.source.id && c.target.id === axon.target.id);
                        if (connectionToUpdate) {
                            connectionToUpdate.pulseActive = true;
                            connectionToUpdate.pulsePositions = [0];
                            connectionToUpdate.lastPulseTime = Date.now();
                            connectionToUpdate.pulseSize = 1.5;
                        }
                    });
                    setConnections(updatedConnections);
                    triggerNetworkEvent('wave', { x: clickedNode.x, y: clickedNode.y }, 0.8);
                }
            } else {
                const updatedNodes = [...nodes];
                let anyActivated = false;
                updatedNodes.forEach(node => {
                    const dx = node.x - x;
                    const dy = node.y - y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist < MAX_REACH) {
                        const influence = 0.3 * (1 - dist / MAX_REACH);
                        node.activationLevel = Math.min(1, node.activationLevel + influence);
                        anyActivated = true;
                    }
                });
                if (anyActivated) {
                    setNodes(updatedNodes);
                    triggerNetworkEvent('wave', { x, y }, 0.5);
                }
            }
        };
        const handleDoubleClick = () => {
            triggerNetworkEvent('burst', undefined, 1.0);
        };
        canvas.addEventListener('mousemove', handleMouseMove);
        canvas.addEventListener('click', handleClick);
        canvas.addEventListener('dblclick', handleDoubleClick);
        return () => {
            canvas.removeEventListener('mousemove', handleMouseMove);
            canvas.removeEventListener('click', handleClick);
            canvas.removeEventListener('dblclick', handleDoubleClick);
        };
    }, [nodes, connections, hoveredNode, onNodeClick]);

    // Compute simulation metrics
    const getNetworkMetrics = () => {
        const activeNeurons = nodes.filter(n => n.activationLevel > 0.2).length;
        const totalPulses = connections.reduce((sum, c) => sum + c.pulsePositions.length, 0);
        const avgHealth = connections.length > 0 ? Math.round((connections.reduce((sum, c) => sum + c.health, 0) / connections.length) * 100) : 0;
        const moodCounts = {
            calm: nodes.filter(n => n.mood === 'calm').length,
            excited: nodes.filter(n => n.mood === 'excited').length,
            erratic: nodes.filter(n => n.mood === 'erratic').length
        };
        let dominantMood = 'calm';
        if (moodCounts.excited > moodCounts.calm && moodCounts.excited > moodCounts.erratic) dominantMood = 'excited';
        else if (moodCounts.erratic > moodCounts.calm && moodCounts.erratic > moodCounts.excited) dominantMood = 'erratic';
        const currentEvent = networkEvents.length > 0 ? networkEvents[0].type.toUpperCase() : 'STABLE';
        return {
            activity: Math.round(networkActivity * 100),
            activeNeurons,
            totalNodes: nodes.length,
            totalPulses,
            avgHealth,
            dominantMood: dominantMood.toUpperCase(),
            currentEvent
        };
    };

    const metrics = getNetworkMetrics();

    return (
        <div ref={containerRef} className="neural-network-container">
            {/* Layout selector */}
            <div className="layout-selector">
                <label htmlFor="layout">Layout: </label>
                <select
                    id="layout"
                    value={layout}
                    onChange={(e) => {
                        setLayout(e.target.value as 'circular' | 'grid' | 'random' | 'hierarchical');
                        handleResetSimulation();
                    }}
                >
                    <option value="circular">Circular</option>
                    <option value="grid">Grid</option>
                    <option value="random">Random</option>
                    <option value="hierarchical">Hierarchical</option>
                </select>
            </div>
            <canvas ref={canvasRef} className="neural-network-canvas" />
            <div className="network-overlay">
                <div className="scanner-line"></div>
                <div className="grid-lines"></div>
            </div>
            <div className="simulation-metrics">
                <div className="metrics-header">NEURAL NETWORK DIAGNOSTICS</div>
                <div className="metrics-container">
                    <div className="metric-item">
                        <span className="metric-label">NETWORK ACTIVITY:</span>
                        <span className="metric-value">{metrics.activity}%</span>
                    </div>
                    <div className="metric-item">
                        <span className="metric-label">ACTIVE NEURONS:</span>
                        <span className="metric-value">{metrics.activeNeurons}/{metrics.totalNodes}</span>
                    </div>
                    <div className="metric-item">
                        <span className="metric-label">SIGNAL PULSES:</span>
                        <span className="metric-value">{metrics.totalPulses}</span>
                    </div>
                    <div className="metric-item">
                        <span className="metric-label">SYNAPSE HEALTH:</span>
                        <span className="metric-value">{metrics.avgHealth}%</span>
                    </div>
                    <div className="metric-item">
                        <span className="metric-label">NETWORK STATE:</span>
                        <span className={`metric-value state-${metrics.currentEvent.toLowerCase()}`}>
                            {metrics.currentEvent}
                        </span>
                    </div>
                    <div className="metric-item">
                        <span className="metric-label">DOMINANT MOOD:</span>
                        <span className={`metric-value mood-${metrics.dominantMood.toLowerCase()}`}>
                            {metrics.dominantMood}
                        </span>
                    </div>
                    <div className="simulation-controls">
                        <button className="reset-button" onClick={handleResetSimulation}>RESET SIMULATION</button>
                    </div>
                </div>
            </div>
            <SimulationControls params={simulationParams} setParams={setSimulationParams} />
        </div>
    );
};

export default NeuralNetwork;
