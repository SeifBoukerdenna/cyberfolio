import { useRef, useEffect, useState } from 'react';
import './NeuralNetwork.css';
import { Project } from '../../types/Project';

interface NeuralNetworkProps {
    projects: Project[];
    onNodeClick: (project: Project) => void;
}

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
    points: { x: number, y: number }[];
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

// Network event interface
interface NetworkEvent {
    type: 'storm' | 'wave' | 'burst' | 'colorShift' | 'seizure';
    startTime: number;
    duration: number;
    intensity: number;
    origin?: { x: number, y: number };
    affectedNodes?: string[];
    progress: number; // 0-1 for animation progress
}

const NeuralNetwork: React.FC<NeuralNetworkProps> = ({ projects, onNodeClick }) => {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const containerRef = useRef<HTMLDivElement | null>(null);
    const [nodes, setNodes] = useState<Node[]>([]);
    const [connections, setConnections] = useState<Connection[]>([]);
    const [hoveredNode, setHoveredNode] = useState<Node | null>(null);
    const [isInitialized, setIsInitialized] = useState(false);
    const [networkActivity, setNetworkActivity] = useState(0.1); // Overall network activity level
    const [networkEvents, setNetworkEvents] = useState<NetworkEvent[]>([]);
    const mousePositionRef = useRef<{ x: number, y: number } | null>(null);
    const animationRef = useRef<number | null>(null);
    const lastFrameTime = useRef<number>(0);
    const lastEventTime = useRef<number>(Date.now());

    // Generate a gentle curved path with minimal curvature
    const generateCurvedPath = (startX: number, startY: number, endX: number, endY: number) => {
        const points = [];
        const segments = 12;

        // Single control point with very minimal offset
        const dx = endX - startX;
        const dy = endY - startY;
        const dist = Math.sqrt(dx * dx + dy * dy);

        // Perpendicular vectors for control point
        const perpX = -dy / dist;
        const perpY = dx / dist;

        // Very small offset (proportional to distance but capped)
        const maxOffset = Math.min(dist * 0.1, 15);
        const offset = (Math.random() * 2 - 1) * maxOffset;

        // Control point at midpoint with small perpendicular offset
        const controlX = (startX + endX) / 2 + perpX * offset;
        const controlY = (startY + endY) / 2 + perpY * offset;

        // Generate points along quadratic curve
        for (let i = 0; i <= segments; i++) {
            const t = i / segments;
            const u = 1 - t;

            // Quadratic Bezier formula
            const x = u * u * startX + 2 * u * t * controlX + t * t * endX;
            const y = u * u * startY + 2 * u * t * controlY + t * t * endY;

            points.push({ x, y });
        }

        return points;
    };

    // Generate dendrites for neuron
    const generateDendrites = (count: number): Dendrite[] => {
        const dendrites: Dendrite[] = [];
        // Smaller dendrites to avoid visual clutter
        const maxLength = 20;

        for (let i = 0; i < count; i++) {
            const mainDendrite: Dendrite = {
                length: 10 + Math.random() * maxLength,
                angle: Math.random() * Math.PI * 2,
                width: 1 + Math.random() * 1.5,
                curve: Math.random() * 0.2,
                activity: 0
            };

            // Add branches to some dendrites (fewer branches)
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
    const triggerNetworkEvent = (type: NetworkEvent['type'], origin?: { x: number, y: number }, intensity?: number) => {
        const now = Date.now();

        // Don't allow too many events close together
        if (now - lastEventTime.current < 3000) return;

        lastEventTime.current = now;

        const eventIntensity = intensity || 0.5 + Math.random() * 0.5;
        let duration = 0;
        let affectedNodes: string[] = [];

        switch (type) {
            case 'storm':
                duration = 3000 + Math.random() * 5000;
                // All nodes can be affected by a storm
                affectedNodes = nodes.map(node => node.id);
                break;

            case 'wave':
                duration = 2000 + Math.random() * 3000;
                // Nodes are affected in order of distance from origin
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
                // Random subset of nodes
                affectedNodes = nodes
                    .filter(() => Math.random() > 0.5)
                    .map(node => node.id);
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

    // Initialize network
    useEffect(() => {
        if (!projects.length || isInitialized) return;

        const newNodes: Node[] = [];
        // Neutral colors
        const colors = [
            'rgba(200, 180, 160, 0.8)',  // Tan
            'rgba(190, 170, 150, 0.8)',  // Light tan
            'rgba(150, 130, 120, 0.8)',  // Brown
            'rgba(170, 160, 150, 0.8)',  // Gray tan
            'rgba(180, 165, 155, 0.8)'   // Neutral tan
        ];

        // Center position
        const centerX = window.innerWidth * 0.5;
        const centerY = window.innerHeight * 0.5;

        // Create hub node first (positioned exactly at center)
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

        newNodes.push(hubNode);

        // Calculate reasonable layout radius based on screen size and number of projects
        const minDimension = Math.min(window.innerWidth, window.innerHeight);
        const layoutRadius = minDimension * 0.3; // 30% of the smallest dimension

        // Create nodes in a circle around the hub
        projects.forEach((project, index) => {
            // Calculate angle based on index to ensure even distribution
            const angleSlice = (Math.PI * 2) / projects.length;
            const angle = angleSlice * index;

            // Fixed distance from center (no randomness to ensure good distribution)
            const distance = layoutRadius;
            const baseRadius = 20;

            const node: Node = {
                id: project.id,
                x: centerX + Math.cos(angle) * distance,
                y: centerY + Math.sin(angle) * distance,
                radius: baseRadius,
                baseRadius: baseRadius,
                color: colors[index % colors.length],
                // Very tiny velocity for subtle movement
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
            };

            newNodes.push(node);
        });

        // Create connections - every project node connects to hub
        const newConnections: Connection[] = [];

        // Connect all project nodes to AI hub with direct lines
        for (let i = 1; i < newNodes.length; i++) {
            const projectNode = newNodes[i];
            const points = generateCurvedPath(
                projectNode.x,
                projectNode.y,
                hubNode.x,
                hubNode.y
            );

            const baseWidth = 0.5 + Math.random() * 0.3;

            // Most connections are excitatory, but some are inhibitory
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

        // Add connections between adjacent peripheral nodes to form a circular chain
        for (let i = 1; i < newNodes.length; i++) {
            const nextIndex = i < newNodes.length - 1 ? i + 1 : 1; // Loop back to first project node

            const points = generateCurvedPath(
                newNodes[i].x,
                newNodes[i].y,
                newNodes[nextIndex].x,
                newNodes[nextIndex].y
            );

            const baseWidth = 0.3 + Math.random() * 0.2;

            // Most connections are excitatory, but some are inhibitory
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

        // Add a few cross-connections for more complex network
        const crossConnectionCount = Math.min(3, Math.floor(projects.length / 2));
        for (let i = 0; i < crossConnectionCount; i++) {
            // Get two random project nodes
            const sourceIndex = 1 + Math.floor(Math.random() * (newNodes.length - 1));
            let targetIndex;
            do {
                targetIndex = 1 + Math.floor(Math.random() * (newNodes.length - 1));
            } while (targetIndex === sourceIndex ||
            Math.abs(targetIndex - sourceIndex) === 1 ||
                (sourceIndex === newNodes.length - 1 && targetIndex === 1));

            const sourceNode = newNodes[sourceIndex];
            const targetNode = newNodes[targetIndex];

            const points = generateCurvedPath(
                sourceNode.x,
                sourceNode.y,
                targetNode.x,
                targetNode.y
            );

            const baseWidth = 0.2 + Math.random() * 0.2;

            // Higher chance for cross-connections to be inhibitory
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
        setIsInitialized(true);

        // Schedule an initial network event
        setTimeout(() => {
            triggerNetworkEvent('wave', { x: centerX, y: centerY }, 0.7);
        }, 3000);
    }, [projects, isInitialized]);

    // Mouse movement tracking for interactive effects
    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            const canvas = canvasRef.current;
            if (!canvas) return;

            const rect = canvas.getBoundingClientRect();
            mousePositionRef.current = {
                x: e.clientX - rect.left,
                y: e.clientY - rect.top
            };
        };

        window.addEventListener('mousemove', handleMouseMove);

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
        };
    }, []);

    // Randomly trigger network events
    useEffect(() => {
        if (!isInitialized) return;

        const eventTypes: NetworkEvent['type'][] = [
            'wave', 'burst', 'storm', 'colorShift', 'seizure'
        ];

        const randomEventInterval = setInterval(() => {
            // Random event chance based on network activity
            if (Math.random() < 0.05 + networkActivity * 0.2) {
                const eventType = eventTypes[Math.floor(Math.random() * eventTypes.length)];

                // For waves, use a random node as origin
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

    // Draw network
    useEffect(() => {
        if (!nodes.length || !connections.length) return;

        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Set canvas size
        const handleResize = () => {
            if (canvas && containerRef.current) {
                canvas.width = containerRef.current.clientWidth;
                canvas.height = containerRef.current.clientHeight;
            }
        };

        handleResize();
        window.addEventListener('resize', handleResize);

        // Animation function with time-based physics
        const animate = (timestamp: number) => {
            if (!canvas || !ctx) return;

            // Calculate delta time for smooth animation regardless of frame rate
            const deltaTime = timestamp - lastFrameTime.current;
            lastFrameTime.current = timestamp;

            // Normalize delta time (target 60fps)
            const normalizedDelta = deltaTime / 16.67;
            const deltaMult = Math.min(normalizedDelta, 2); // Cap maximum delta to avoid huge jumps

            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Process network events
            const now = Date.now();
            const activeEvents = [...networkEvents];
            const updatedEvents: NetworkEvent[] = [];

            activeEvents.forEach(event => {
                const elapsed = now - event.startTime;
                if (elapsed <= event.duration) {
                    // Update event progress
                    event.progress = elapsed / event.duration;
                    updatedEvents.push(event);
                }
            });

            // Update events state if needed
            if (updatedEvents.length !== networkEvents.length) {
                setNetworkEvents(updatedEvents);
            }

            // Calculate overall network activity level based on node activation
            const totalActivity = nodes.reduce((sum, node) => sum + node.activationLevel, 0) / nodes.length;
            setNetworkActivity(prev => {
                // Smooth transition to new activity level
                return prev * 0.95 + totalActivity * 0.05;
            });

            // Check for mouse interactions
            const mousePos = mousePositionRef.current;

            // Update nodes with more natural behavior and random elements
            const updatedNodes = [...nodes];
            updatedNodes.forEach((node, index) => {
                const now = Date.now();

                // Update node mood - causes changes in behavior
                node.moodTimer -= deltaTime;
                if (node.moodTimer <= 0) {
                    // Change mood randomly
                    const moods: Node['mood'][] = ['calm', 'excited', 'erratic'];
                    node.mood = moods[Math.floor(Math.random() * moods.length)];
                    node.moodTimer = 5000 + Math.random() * 15000;

                    // Reset velocity when mood changes to give a little "jump"
                    if (index > 0) { // Skip hub node
                        const angle = Math.random() * Math.PI * 2;
                        const force = 0.1 + Math.random() * 0.2;
                        node.vx = Math.cos(angle) * force;
                        node.vy = Math.sin(angle) * force;
                    }
                }

                // First node is the hub - keep it centered with minimal movement
                if (index === 0) {
                    // Hub still moves a bit for a more organic feel
                    node.x = canvas.width / 2 + Math.sin(now * 0.0005) * 5;
                    node.y = canvas.height / 2 + Math.cos(now * 0.0004) * 5;
                } else {
                    // Random bursts of movement (more common in excited or erratic mood)
                    const burstChance = node.mood === 'calm' ? 0.002 :
                        node.mood === 'excited' ? 0.01 : 0.03;

                    if (Math.random() < burstChance * deltaMult) {
                        // Start a burst of movement
                        node.burstCounter = 20 + Math.floor(Math.random() * 30);

                        // Random direction with significant force
                        const angle = Math.random() * Math.PI * 2;
                        const force = 0.2 + Math.random() * 0.6;
                        node.vx = Math.cos(angle) * force;
                        node.vy = Math.sin(angle) * force;
                    }

                    // Process active bursts
                    if (node.burstCounter > 0) {
                        node.burstCounter--;

                        // If burst is ending, dampen velocity
                        if (node.burstCounter === 0) {
                            node.vx *= 0.5;
                            node.vy *= 0.5;
                        }
                    }

                    // Apply network events effects to nodes
                    activeEvents.forEach(event => {
                        if (!event.affectedNodes?.includes(node.id)) return;

                        switch (event.type) {
                            case 'storm':
                                if (Math.random() < 0.05 * event.intensity * deltaMult) {
                                    // Random impulses during storm
                                    node.vx += (Math.random() - 0.5) * 0.2 * event.intensity;
                                    node.vy += (Math.random() - 0.5) * 0.2 * event.intensity;
                                }
                                break;

                            case 'wave':
                                if (event.origin && event.affectedNodes) {
                                    // Find node's position in wave sequence
                                    const nodeIndex = event.affectedNodes.indexOf(node.id);
                                    const nodeProgress = nodeIndex / event.affectedNodes.length;

                                    // Activate node if wave is passing through it
                                    const waveFront = event.progress * 1.5; // Wave moves faster than event duration
                                    const waveWidth = 0.3; // Width of wave effect

                                    if (nodeProgress <= waveFront && nodeProgress >= waveFront - waveWidth) {
                                        // Node is in active part of wave
                                        const waveEffect = 1 - Math.abs(waveFront - nodeProgress) / waveWidth;
                                        node.activationLevel = Math.min(1, node.activationLevel + waveEffect * 0.1 * event.intensity);

                                        // Wave pushes nodes
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
                                    // Random activation during burst event
                                    node.activationLevel = Math.min(1, node.activationLevel + 0.1 * event.intensity);
                                }
                                break;

                            case 'colorShift':
                                // Shift color hue
                                node.hue = (Math.sin(now * 0.001 + index) * 0.5 + 0.5) * 30 * event.intensity;
                                break;

                            case 'seizure':
                                // Rapid, chaotic movement
                                node.vx += (Math.random() - 0.5) * 0.8 * event.intensity * deltaMult;
                                node.vy += (Math.random() - 0.5) * 0.8 * event.intensity * deltaMult;

                                // Random activation
                                if (Math.random() < 0.2 * deltaMult) {
                                    node.activationLevel = Math.min(1, node.activationLevel + 0.3 * event.intensity);
                                }
                                break;
                        }
                    });

                    // Mouse interaction - gentle attraction to make nodes more accessible
                    if (mousePos) {
                        const dx = node.x - mousePos.x;
                        const dy = node.y - mousePos.y;
                        const dist = Math.sqrt(dx * dx + dy * dy);

                        if (dist < 200) {
                            // Close to mouse - interactive forces
                            const interactionForce = 0.01 * (1 - dist / 200) * deltaMult;

                            // Gentle attraction that increases as mouse gets closer
                            // This makes nodes easier to click while maintaining overall structure
                            node.vx -= dx * interactionForce;
                            node.vy -= dy * interactionForce;

                            // Nodes get slightly activated by mouse proximity
                            if (dist < 120) {
                                // Higher activation when closer to mouse
                                node.activationLevel = Math.min(0.4, node.activationLevel +
                                    (0.015 * (1 - dist / 120)) * deltaMult);

                                // Slightly increase size when mouse is near to improve clickability
                                if (dist < 80) {
                                    const sizeFactor = 1 + 0.2 * (1 - dist / 80);
                                    node.radius = node.baseRadius * sizeFactor;
                                }
                            }
                        }
                    }

                    // Move nodes with random fluctuations based on mood
                    const movementAmplitude = 1 + node.activationLevel * 2;
                    const jitterAmplitude = node.mood === 'calm' ? 0.01 :
                        node.mood === 'excited' ? 0.03 : 0.08;

                    // Random jitter based on mood
                    if (Math.random() < 0.3 * deltaMult) {
                        node.vx += (Math.random() - 0.5) * jitterAmplitude * deltaMult;
                        node.vy += (Math.random() - 0.5) * jitterAmplitude * deltaMult;
                    }

                    // Apply velocity with various influence factors
                    node.x += node.vx * deltaMult * movementAmplitude;
                    node.y += node.vy * deltaMult * movementAmplitude;

                    // Maximum velocity depends on mood
                    const maxVel = node.mood === 'calm' ? 0.15 :
                        node.mood === 'excited' ? 0.3 : 0.5;
                    const adjustedMaxVel = maxVel * (1 + node.activationLevel);

                    if (Math.abs(node.vx) > adjustedMaxVel) node.vx = Math.sign(node.vx) * adjustedMaxVel;
                    if (Math.abs(node.vy) > adjustedMaxVel) node.vy = Math.sign(node.vy) * adjustedMaxVel;
                }

                // Maintain circular formation around hub with gentle oscillations
                const hubNode = updatedNodes[0];
                const dx = node.x - hubNode.x;
                const dy = node.y - hubNode.y;
                const distFromHub = Math.sqrt(dx * dx + dy * dy);

                // Desired distance from hub with subtle time-based oscillation
                const minDimension = Math.min(canvas.width, canvas.height);
                // Each node oscillates at a slightly different frequency but with reduced amplitude
                const oscillationFactor = 1 + Math.sin(now * 0.0002 + index * 0.5) * 0.08; // Reduced oscillation
                const idealDist = minDimension * 0.3 * oscillationFactor;

                // Strong force to maintain ideal distance from hub - keeps layout organized for recruiters
                const distForceFactor = 0.01 * deltaMult;
                if (distFromHub > idealDist * 1.15) { // Tighter bounds
                    // Too far - pull in (stronger force when too far)
                    node.vx -= dx * distForceFactor * 1.8; // Stronger centering force
                    node.vy -= dy * distForceFactor * 1.8;
                } else if (distFromHub < idealDist * 0.85) { // Tighter bounds
                    // Too close - push out (stronger force when too close)
                    node.vx += dx * distForceFactor * 1.8;
                    node.vy += dy * distForceFactor * 1.8;
                } else if (distFromHub > idealDist * 1.05 || distFromHub < idealDist * 0.95) {
                    // Minor adjustment when slightly off
                    const adjustFactor = distFromHub > idealDist ? -1 : 1;
                    node.vx += dx * distForceFactor * 0.7 * adjustFactor;
                    node.vy += dy * distForceFactor * 0.7 * adjustFactor;
                }

                // Keep nodes well away from screen edges
                const safeMargin = minDimension * 0.1;
                const edgeForceFactor = 0.05 * deltaMult;

                // Left boundary
                if (node.x < safeMargin) {
                    node.vx += edgeForceFactor * (1 - node.x / safeMargin);
                    if (node.x < 10) node.x = 10; // Hard limit
                }
                // Right boundary
                if (node.x > canvas.width - safeMargin) {
                    node.vx -= edgeForceFactor * (1 - (canvas.width - node.x) / safeMargin);
                    if (node.x > canvas.width - 10) node.x = canvas.width - 10; // Hard limit
                }
                // Top boundary
                if (node.y < safeMargin) {
                    node.vy += edgeForceFactor * (1 - node.y / safeMargin);
                    if (node.y < 10) node.y = 10; // Hard limit
                }
                // Bottom boundary
                if (node.y > canvas.height - safeMargin) {
                    node.vy -= edgeForceFactor * (1 - (canvas.height - node.y) / safeMargin);
                    if (node.y > canvas.height - 10) node.y = canvas.height - 10; // Hard limit
                }

                // Damping based on mood - erratic nodes maintain momentum longer
                const dampingFactor = node.mood === 'calm' ? 0.95 :
                    node.mood === 'excited' ? 0.97 : 0.98;
                node.vx *= dampingFactor;
                node.vy *= dampingFactor;

                // Update activation level with natural decay
                if (node.activationLevel > 0) {
                    // Decay rate varies by mood
                    const decayMultiplier = node.mood === 'calm' ? 1 :
                        node.mood === 'excited' ? 0.7 : 0.5;
                    node.activationLevel = Math.max(0, node.activationLevel -
                        node.activationDecay * deltaMult * 0.1 * decayMultiplier);
                }

                // Update dendrite activity based on node activation
                node.dendrites.forEach(dendrite => {
                    // Dendrite activity approaches node activation level
                    dendrite.activity = dendrite.activity * 0.9 + node.activationLevel * 0.1;

                    // Update branch activity too
                    if (dendrite.branches) {
                        dendrite.branches.forEach(branch => {
                            branch.activity = branch.activity * 0.9 + dendrite.activity * 0.1;
                        });
                    }
                });

                // Update radius based on activation (neurons swell slightly when active)
                // Add slight oscillation for more natural look
                const oscillation = Math.sin(now * 0.003 + index * 1.5) * 0.5;
                node.radius = node.baseRadius * (1 + node.activationLevel * 0.2 + oscillation * 0.05);
            });

            // Update connections - simulate signal propagation with more random elements
            const updatedConnections = [...connections];
            updatedConnections.forEach((connection, idx) => {
                // Update path to match current node positions
                connection.points = generateCurvedPath(
                    connection.source.x,
                    connection.source.y,
                    connection.target.x,
                    connection.target.y
                );

                const now = Date.now();

                // Network events affect connections
                activeEvents.forEach(event => {
                    switch (event.type) {
                        case 'storm':
                            // During storms, connections fire more often
                            if (Math.random() < 0.001 * event.intensity * deltaMult) {
                                connection.pulseActive = true;
                                connection.pulsePositions.push(0);
                                connection.pulseSize = 1 + Math.random() * event.intensity;
                            }
                            break;

                        case 'seizure':
                            // Connection width fluctuates during seizures
                            connection.currentWidth = connection.width * (1 + Math.sin(now * 0.01 + idx) * event.intensity);
                            break;

                        case 'colorShift':
                            // Connections temporarily change type during color shifts
                            if (Math.random() < 0.005 * event.intensity * deltaMult) {
                                connection.isInhibitory = !connection.isInhibitory;
                            }
                            break;
                    }
                });

                // Random connection "repair" - occasionally fix or improve connections
                if (connection.health < 1 && Math.random() < 0.001 * deltaMult) {
                    connection.health = Math.min(1, connection.health + 0.1);
                    connection.width = Math.min(1, connection.width * 1.1);
                }

                // Random connection damage - connections occasionally weaken
                if (Math.random() < 0.0002 * deltaMult) {
                    connection.health = Math.max(0.2, connection.health - 0.1);
                    connection.width = Math.max(0.1, connection.width * 0.9);
                }

                // Activate connection when source neuron fires
                const sourceNode = connection.source;
                if (sourceNode.activationLevel > sourceNode.threshold &&
                    now - sourceNode.lastActivationTime > sourceNode.refractoryPeriod) {

                    // Chance for synapse to fire (stochastic behavior like real neurons)
                    if (Math.random() < sourceNode.activationLevel * 0.8) {
                        connection.pulseActive = true;
                        connection.pulsePositions.push(0); // Start new pulse at beginning
                        connection.lastPulseTime = now;

                        // Pulse size varies with activation level
                        connection.pulseSize = 0.8 + sourceNode.activationLevel * 0.5 + Math.random() * 0.2;

                        // Source neuron fired, mark its activation time
                        sourceNode.lastActivationTime = now;
                    }
                }

                // Update connection width based on recent activity
                const timeSinceLastPulse = now - connection.lastPulseTime;
                const activeFactor = timeSinceLastPulse < 1000 ?
                    (1 - timeSinceLastPulse / 1000) * 2 : 0;

                // Connection widens when recently active
                connection.currentWidth = connection.width * (1 + activeFactor) * connection.health;

                // Move existing pulses with variable speed
                if (connection.pulseActive) {
                    for (let i = 0; i < connection.pulsePositions.length; i++) {
                        // Pulse speed increases with network activity and has random variation
                        const speedVariation = 0.8 + Math.random() * 0.4;
                        const speed = connection.pulseSpeed * speedVariation * (1 + networkActivity * 3) * deltaMult;
                        connection.pulsePositions[i] += speed;

                        // When pulse reaches the end, activate target neuron
                        if (connection.pulsePositions[i] >= 1) {
                            const targetNode = updatedNodes.find(n => n.id === connection.target.id);
                            if (targetNode) {
                                // Effect on target neuron depends on whether connection is inhibitory
                                if (connection.isInhibitory) {
                                    // Inhibitory connections decrease activation
                                    targetNode.activationLevel = Math.max(0,
                                        targetNode.activationLevel - connection.strength * 0.2 * connection.health);
                                } else {
                                    // Excitatory connections increase activation
                                    targetNode.activationLevel = Math.min(1,
                                        targetNode.activationLevel + connection.strength * 0.3 * connection.health);
                                }
                            }

                            // Remove the pulse after it's reached the end
                            connection.pulsePositions.splice(i, 1);
                            i--;

                            // If last pulse is gone, no longer active
                            if (connection.pulsePositions.length === 0) {
                                connection.pulseActive = false;
                            }
                        }
                    }
                }

                // Occasionally create spontaneous pulses based on network activity
                const spontChance = 0.0005 * networkActivity * networkActivity * connection.health;
                if (!connection.pulseActive && Math.random() < spontChance * deltaMult) {
                    connection.pulseActive = true;
                    connection.pulsePositions.push(0);
                    connection.lastPulseTime = now;
                    connection.pulseSize = 0.7 + Math.random() * 0.6;
                }
            });

            // First draw all dendrites (behind everything)
            updatedNodes.forEach(node => {
                // Draw dendrites with activity-based appearance
                node.dendrites.forEach(dendrite => {
                    const startX = node.x;
                    const startY = node.y;

                    // Draw primary dendrite
                    ctx.beginPath();
                    ctx.moveTo(startX, startY);

                    const endX = startX + Math.cos(dendrite.angle) * dendrite.length;
                    const endY = startY + Math.sin(dendrite.angle) * dendrite.length;

                    const ctrlX = startX + Math.cos(dendrite.angle + dendrite.curve) * dendrite.length * 0.5;
                    const ctrlY = startY + Math.sin(dendrite.angle + dendrite.curve) * dendrite.length * 0.5;

                    ctx.quadraticCurveTo(ctrlX, ctrlY, endX, endY);

                    // Width and color intensify with activity
                    const activityBoost = 1 + dendrite.activity * 2;
                    ctx.lineWidth = dendrite.width * activityBoost;

                    // Apply hue shift if active
                    let baseColor = node.color;
                    if (node.hue !== 0) {
                        // Extract color components
                        const match = baseColor.match(/rgba\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*,\s*([\d.]+)\s*\)/i);
                        if (match) {
                            const r = parseInt(match[1]);
                            const g = parseInt(match[2]);
                            const b = parseInt(match[3]);
                            const a = parseFloat(match[4]);

                            // Apply HSL shift (simple approximation)
                            // const avg = (r + g + b) / 3;
                            const shift = node.hue / 100;

                            // Shift red toward orange/yellow
                            const nr = Math.min(255, r + shift * 20);
                            // Shift blue in other direction
                            const nb = Math.min(255, b - shift * 10);

                            baseColor = `rgba(${nr}, ${g}, ${nb}, ${a})`;
                        }
                    }

                    // Brighter color when active
                    const activeColor = baseColor.replace('rgba', 'rgba').replace('0.8)', '0.95)');
                    const dendriteColor = dendrite.activity > 0.1 ? activeColor : baseColor;

                    ctx.strokeStyle = dendriteColor;
                    ctx.stroke();

                    // Draw branches if any
                    if (dendrite.branches) {
                        dendrite.branches.forEach(branch => {
                            ctx.beginPath();
                            ctx.moveTo(endX, endY);

                            const branchEndX = endX + Math.cos(branch.angle) * branch.length;
                            const branchEndY = endY + Math.sin(branch.angle) * branch.length;

                            const branchCtrlX = endX + Math.cos(branch.angle + branch.curve) * branch.length * 0.5;
                            const branchCtrlY = endY + Math.sin(branch.angle + branch.curve) * branch.length * 0.5;

                            ctx.quadraticCurveTo(branchCtrlX, branchCtrlY, branchEndX, branchEndY);

                            // Width and color intensify with activity
                            const branchActivityBoost = 1 + branch.activity * 2;
                            ctx.lineWidth = branch.width * branchActivityBoost;

                            const branchColor = branch.activity > 0.1 ? activeColor : baseColor;
                            ctx.strokeStyle = branchColor;
                            ctx.stroke();
                        });
                    }
                });
            });

            // Draw connections (axons)
            updatedConnections.forEach(connection => {
                // Draw axon path
                ctx.beginPath();
                ctx.moveTo(connection.points[0].x, connection.points[0].y);

                for (let i = 1; i < connection.points.length; i++) {
                    ctx.lineTo(connection.points[i].x, connection.points[i].y);
                }

                // Set axon style based on type and activity
                if (connection.isInhibitory) {
                    // Inhibitory connections with different color
                    ctx.strokeStyle = `rgba(150, 140, 160, ${0.3 + connection.health * 0.2})`;
                } else {
                    // Excitatory connections
                    ctx.strokeStyle = `rgba(160, 150, 140, ${0.3 + connection.health * 0.2})`;
                }

                // Width changes with activity and health
                ctx.lineWidth = 1 + connection.currentWidth;
                ctx.stroke();

                // Draw neural pulses moving along axons
                connection.pulsePositions.forEach(position => {
                    if (position >= 0 && position < 1) {
                        // Calculate position along the path
                        const index = Math.floor(position * (connection.points.length - 1));
                        const nextIndex = Math.min(index + 1, connection.points.length - 1);

                        const subPosition = (position * (connection.points.length - 1)) - index;

                        const pulseX = connection.points[index].x +
                            (connection.points[nextIndex].x - connection.points[index].x) * subPosition;
                        const pulseY = connection.points[index].y +
                            (connection.points[nextIndex].y - connection.points[index].y) * subPosition;

                        // Draw pulse with shape and color based on type
                        ctx.beginPath();
                        const pulseSize = (2 + connection.strength * 2) * connection.pulseSize;
                        ctx.arc(pulseX, pulseY, pulseSize, 0, Math.PI * 2);

                        // Pulses with oscillating color variation
                        const pulseVariation = Math.sin(now * 0.01 + pulseX * 0.01) * 20;

                        if (connection.isInhibitory) {
                            ctx.fillStyle = `rgba(${210 + pulseVariation}, 180, ${220 - pulseVariation}, 0.9)`; // Purple-ish for inhibitory
                        } else {
                            ctx.fillStyle = `rgba(${230 + pulseVariation}, ${210 - pulseVariation}, 180, 0.9)`; // Tan for excitatory
                        }
                        ctx.fill();

                        // Add glow
                        ctx.beginPath();
                        ctx.arc(pulseX, pulseY, pulseSize * 2, 0, Math.PI * 2);
                        const gradient = ctx.createRadialGradient(
                            pulseX, pulseY, pulseSize,
                            pulseX, pulseY, pulseSize * 2
                        );

                        if (connection.isInhibitory) {
                            gradient.addColorStop(0, 'rgba(210, 180, 220, 0.5)');
                            gradient.addColorStop(1, 'rgba(210, 180, 220, 0)');
                        } else {
                            gradient.addColorStop(0, 'rgba(230, 210, 180, 0.5)');
                            gradient.addColorStop(1, 'rgba(230, 210, 180, 0)');
                        }

                        ctx.fillStyle = gradient;
                        ctx.fill();
                    }
                });
            });

            // Draw nodes (cell bodies)
            updatedNodes.forEach(node => {
                const now = Date.now();
                const timeSinceLastPulse = now - node.lastPulseTime;
                const isPulsing = timeSinceLastPulse < 500;
                const isHovered = hoveredNode && hoveredNode.id === node.id;
                const isActive = node.activationLevel > 0.1;

                // Draw cell body glow - stronger when active, pulsing or hovered
                const glowSize = (isPulsing || isActive) ?
                    20 + node.activationLevel * 15 :
                    (isHovered ? 25 : 10);

                ctx.beginPath();
                ctx.arc(node.x, node.y, node.radius + glowSize, 0, Math.PI * 2);
                const glowGradient = ctx.createRadialGradient(
                    node.x, node.y, node.radius,
                    node.x, node.y, node.radius + glowSize
                );

                // Color changes with activation and mood
                let glowColor;

                if (isActive) {
                    // Brighter glow for active neurons
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

                // Draw cell body with mood-based appearance
                ctx.beginPath();

                // Nodes can pulsate with varying shapes based on mood
                if (node.mood === 'erratic' && node.activationLevel > 0.3) {
                    // Erratic nodes can deform when active
                    const deformFactor = 0.2 * node.activationLevel;
                    const segmentCount = 8;

                    for (let i = 0; i <= segmentCount; i++) {
                        const angle = (i / segmentCount) * Math.PI * 2;
                        const radiusVariation = node.radius * (1 + deformFactor * Math.sin(angle * 3 + now * 0.01));

                        const x = node.x + Math.cos(angle) * radiusVariation;
                        const y = node.y + Math.sin(angle) * radiusVariation;

                        if (i === 0) {
                            ctx.moveTo(x, y);
                        } else {
                            ctx.lineTo(x, y);
                        }
                    }
                } else {
                    // Normal circular shape for calm and excited nodes
                    ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
                }

                // Cell body gradient - more biological with subtle texture
                const cellGradient = ctx.createRadialGradient(
                    node.x - node.radius * 0.3, node.y - node.radius * 0.3, node.radius * 0.1,
                    node.x, node.y, node.radius
                );

                // Apply color based on node's hue shift (for color events)
                let baseColor = node.color;
                if (node.hue !== 0) {
                    // Extract color components
                    const match = baseColor.match(/rgba\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*,\s*([\d.]+)\s*\)/i);
                    if (match) {
                        const r = parseInt(match[1]);
                        const g = parseInt(match[2]);
                        const b = parseInt(match[3]);
                        const a = parseFloat(match[4]);

                        // Apply hue shift
                        const shift = node.hue / 100;

                        // Simple RGB shift for visual effect
                        const nr = Math.min(255, r + shift * 30);
                        const ng = Math.min(255, g + shift * 10);
                        const nb = Math.min(255, b - shift * 20);

                        baseColor = `rgba(${nr}, ${ng}, ${nb}, ${a})`;
                    }
                }

                // Color varies with activation level and mood
                let activeColor;

                if (node.mood === 'excited') {
                    // Warmer color for excited nodes
                    activeColor = baseColor.replace(/rgba\((\d+),\s*(\d+),\s*(\d+)/, (match, r, g, b) => {
                        return `rgba(${Math.min(255, parseInt(r) + 20)}, ${parseInt(g)}, ${Math.max(0, parseInt(b) - 10)}`;
                    });
                } else if (node.mood === 'erratic') {
                    // More saturated for erratic nodes
                    activeColor = baseColor.replace(/rgba\((\d+),\s*(\d+),\s*(\d+)/, (match, r, g, b) => {
                        return `rgba(${Math.min(255, parseInt(r) + 10)}, ${Math.max(0, parseInt(g) - 10)}, ${Math.min(255, parseInt(b) + 20)}`;
                    });
                } else {
                    // Default active color
                    activeColor = baseColor.replace('rgba', 'rgba').replace('0.8)', '0.95)');
                }

                cellGradient.addColorStop(0, 'rgba(230, 220, 200, 0.9)');
                cellGradient.addColorStop(0.3, node.activationLevel > 0.3 ? activeColor : baseColor);
                cellGradient.addColorStop(1, baseColor.replace(', 0.8)', ', 0.7)'));

                ctx.fillStyle = cellGradient;
                ctx.fill();

                // Add subtle cell membrane
                ctx.strokeStyle = node.activationLevel > 0.3 ?
                    'rgba(180, 160, 140, 0.6)' : 'rgba(140, 130, 120, 0.4)';
                ctx.lineWidth = isHovered ? 2 : 1;
                ctx.stroke();

                // Draw nucleus with mood-specific appearance
                ctx.beginPath();
                const nucleusRadius = node.radius * 0.4;

                if (node.mood === 'erratic' && node.activationLevel > 0.4) {
                    // Erratic nodes can have irregular nuclei when active
                    const segmentCount = 6;
                    const irregularity = 0.3 * node.activationLevel;

                    for (let i = 0; i <= segmentCount; i++) {
                        const angle = (i / segmentCount) * Math.PI * 2;
                        const radiusVariation = nucleusRadius * (1 + irregularity * Math.sin(angle * 2 + now * 0.008));

                        const x = node.x + Math.cos(angle) * radiusVariation;
                        const y = node.y + Math.sin(angle) * radiusVariation;

                        if (i === 0) {
                            ctx.moveTo(x, y);
                        } else {
                            ctx.lineTo(x, y);
                        }
                    }
                } else {
                    // Regular circular nucleus
                    ctx.arc(node.x, node.y, nucleusRadius, 0, Math.PI * 2);
                }

                const nucleusGradient = ctx.createRadialGradient(
                    node.x - nucleusRadius * 0.3, node.y - nucleusRadius * 0.3, nucleusRadius * 0.1,
                    node.x, node.y, nucleusRadius
                );

                // Nucleus brightens with activation
                let nucleusColor1, nucleusColor2;

                if (node.mood === 'excited') {
                    // Brighter nucleus for excited nodes
                    nucleusColor1 = node.activationLevel > 0.3 ?
                        'rgba(220, 205, 190, 0.95)' : 'rgba(205, 195, 180, 0.9)';
                    nucleusColor2 = node.activationLevel > 0.3 ?
                        'rgba(200, 185, 170, 0.8)' : 'rgba(180, 170, 155, 0.7)';
                } else if (node.mood === 'erratic') {
                    // More variable nucleus for erratic nodes
                    const pulseOffset = Math.sin(now * 0.003) * 10;
                    nucleusColor1 = node.activationLevel > 0.3 ?
                        `rgba(${210 + pulseOffset}, ${200 - pulseOffset}, 185, 0.95)` : 'rgba(200, 190, 180, 0.9)';
                    nucleusColor2 = node.activationLevel > 0.3 ?
                        `rgba(${190 + pulseOffset}, ${180 - pulseOffset}, 165, 0.8)` : 'rgba(170, 160, 150, 0.7)';
                } else {
                    // Calm nodes
                    nucleusColor1 = node.activationLevel > 0.3 ?
                        'rgba(210, 200, 190, 0.95)' : 'rgba(200, 190, 180, 0.9)';
                    nucleusColor2 = node.activationLevel > 0.3 ?
                        'rgba(190, 180, 170, 0.8)' : 'rgba(170, 160, 150, 0.7)';
                }

                nucleusGradient.addColorStop(0, nucleusColor1);
                nucleusGradient.addColorStop(1, nucleusColor2);
                ctx.fillStyle = nucleusGradient;
                ctx.fill();

                // Node label for hover or central hub
                if (isHovered || node.id === 'ai-hub') {
                    ctx.font = '14px "Courier New", monospace';
                    ctx.fillStyle = 'rgba(220, 210, 200, 0.9)';
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';

                    // Background for text
                    const textWidth = ctx.measureText(node.project.title).width;
                    ctx.fillStyle = 'rgba(10, 10, 15, 0.7)';
                    ctx.fillRect(
                        node.x - textWidth / 2 - 5,
                        node.y + node.radius + 5,
                        textWidth + 10,
                        20
                    );

                    // Text
                    ctx.fillStyle = 'rgba(220, 210, 200, 0.9)';
                    ctx.fillText(
                        node.project.title,
                        node.x,
                        node.y + node.radius + 15
                    );

                    // Also show mood for debugging - uncomment if needed
                    /*
                    ctx.fillStyle = 'rgba(10, 10, 15, 0.7)';
                    ctx.fillRect(
                        node.x - 40,
                        node.y + node.radius + 30,
                        80,
                        20
                    );
                    ctx.fillStyle = 'rgba(220, 210, 200, 0.9)';
                    ctx.fillText(
                        node.mood,
                        node.x,
                        node.y + node.radius + 40
                    );
                    */
                }
            });

            // Draw network-wide effects
            activeEvents.forEach(event => {
                if (event.type === 'wave' && event.origin) {
                    // Draw expanding wave
                    ctx.beginPath();
                    const radius = Math.min(canvas.width, canvas.height) * event.progress * 0.8;
                    ctx.arc(event.origin.x, event.origin.y, radius, 0, Math.PI * 2);

                    const waveGradient = ctx.createRadialGradient(
                        event.origin.x, event.origin.y, radius * 0.8,
                        event.origin.x, event.origin.y, radius
                    );

                    const alphaFactor = (1 - event.progress) * 0.3 * event.intensity;
                    waveGradient.addColorStop(0, `rgba(200, 180, 160, 0)`);
                    waveGradient.addColorStop(0.7, `rgba(200, 180, 160, ${alphaFactor * 0.1})`);
                    waveGradient.addColorStop(1, `rgba(200, 180, 160, 0)`);

                    ctx.fillStyle = waveGradient;
                    ctx.fill();
                }

                if (event.type === 'seizure') {
                    // Draw screen-wide effect
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
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
            window.removeEventListener('resize', handleResize);
        };
    }, [nodes, connections, hoveredNode, networkActivity, networkEvents]);

    // Handle mouse interaction - with clear visual feedback for usability
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const handleMouseMove = (e: MouseEvent) => {
            const rect = canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            // Check if mouse is over any node
            let found = false;
            for (const node of nodes) {
                const dist = Math.sqrt((node.x - x) ** 2 + (node.y - y) ** 2);
                // More generous hit area to make nodes easier to click
                const hitRadius = node.radius * 1.2 + 15;

                if (dist <= hitRadius) {
                    setHoveredNode(node);
                    canvas.style.cursor = 'pointer';
                    found = true;

                    // Hovering clearly activates the neuron - stronger effect for better feedback
                    if (node.activationLevel < 0.4) {
                        const updatedNodes = [...nodes];
                        const hoveredNode = updatedNodes.find(n => n.id === node.id);
                        if (hoveredNode) {
                            // More aggressive activation for clearer hover state
                            hoveredNode.activationLevel = Math.min(0.6, hoveredNode.activationLevel + 0.03);
                            // Make node slightly larger on hover for better clickability
                            hoveredNode.radius = hoveredNode.baseRadius * 1.15;
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

            const MAX_REACH = 200; // How far the click effect reaches

            if (hoveredNode) {
                onNodeClick(hoveredNode.project);

                // Strongly activate neuron when clicked
                const updatedNodes = [...nodes];
                const clickedNode = updatedNodes.find(n => n.id === hoveredNode.id);
                if (clickedNode) {
                    // Strong activation!
                    clickedNode.activationLevel = 1.0;
                    clickedNode.lastPulseTime = Date.now();
                    clickedNode.lastActivationTime = Date.now();

                    // Other nodes also get activated based on distance
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

                    // Trigger pulses on all outgoing connections
                    const outgoingConnections = connections.filter(c => c.source.id === clickedNode.id);

                    const updatedConnections = [...connections];
                    outgoingConnections.forEach(axon => {
                        const connectionToUpdate = updatedConnections.find(
                            c => c.source.id === axon.source.id && c.target.id === axon.target.id
                        );

                        if (connectionToUpdate) {
                            connectionToUpdate.pulseActive = true;
                            connectionToUpdate.pulsePositions = [0];
                            connectionToUpdate.lastPulseTime = Date.now();
                            connectionToUpdate.pulseSize = 1.5; // Larger pulse for clicked activation
                        }
                    });

                    setConnections(updatedConnections);

                    // Create a wave event from the clicked node
                    triggerNetworkEvent('wave', { x: clickedNode.x, y: clickedNode.y }, 0.8);
                }
            } else {
                // Click in empty space creates a smaller wave effect
                // And affects nearby nodes
                const updatedNodes = [...nodes];
                let anyNodesActivated = false;

                updatedNodes.forEach(node => {
                    const dx = node.x - x;
                    const dy = node.y - y;
                    const dist = Math.sqrt(dx * dx + dy * dy);

                    if (dist < MAX_REACH) {
                        const influence = 0.3 * (1 - dist / MAX_REACH);
                        node.activationLevel = Math.min(1, node.activationLevel + influence);
                        anyNodesActivated = true;
                    }
                });

                if (anyNodesActivated) {
                    setNodes(updatedNodes);
                    triggerNetworkEvent('wave', { x, y }, 0.5);
                }
            }
        };

        // Double click triggers a network-wide burst
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

    // Calculate simulation metrics for display
    const getNetworkMetrics = () => {
        // Count active neurons (above threshold)
        const activeNeurons = nodes.filter(n => n.activationLevel > 0.2).length;

        // Count total active pulses
        const totalPulses = connections.reduce((sum, c) => sum + c.pulsePositions.length, 0);

        // Calculate average connection health
        const avgHealth = connections.length > 0 ?
            Math.round(connections.reduce((sum, c) => sum + c.health, 0) / connections.length * 100) : 0;

        // Count nodes by mood
        const moodCounts = {
            calm: nodes.filter(n => n.mood === 'calm').length,
            excited: nodes.filter(n => n.mood === 'excited').length,
            erratic: nodes.filter(n => n.mood === 'erratic').length
        };

        // Find dominant mood
        let dominantMood = 'calm';
        if (moodCounts.excited > moodCounts.calm && moodCounts.excited > moodCounts.erratic) {
            dominantMood = 'excited';
        } else if (moodCounts.erratic > moodCounts.calm && moodCounts.erratic > moodCounts.excited) {
            dominantMood = 'erratic';
        }

        // Get current event if any
        const currentEvent = networkEvents.length > 0 ?
            networkEvents[0].type.toUpperCase() : "STABLE";

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
            <canvas ref={canvasRef} className="neural-network-canvas" />
            <div className="network-overlay">
                <div className="scanner-line"></div>
                <div className="grid-lines"></div>
            </div>

            {/* Simulation metrics display */}
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
                </div>
            </div>
        </div>
    );
};

export default NeuralNetwork;