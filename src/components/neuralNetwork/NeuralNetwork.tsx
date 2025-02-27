/* eslint-disable @typescript-eslint/no-unused-vars */
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
}

const NeuralNetwork: React.FC<NeuralNetworkProps> = ({ projects, onNodeClick }) => {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const containerRef = useRef<HTMLDivElement | null>(null);
    const [nodes, setNodes] = useState<Node[]>([]);
    const [connections, setConnections] = useState<Connection[]>([]);
    const [hoveredNode, setHoveredNode] = useState<Node | null>(null);
    const [isInitialized, setIsInitialized] = useState(false);
    const animationRef = useRef<number | null>(null);

    // Generate a reliable straight path that won't go off screen
    const generateStraightPath = (startX: number, startY: number, endX: number, endY: number) => {
        const points = [];
        const segments = 10;

        for (let i = 0; i <= segments; i++) {
            const t = i / segments;
            points.push({
                x: startX + (endX - startX) * t,
                y: startY + (endY - startY) * t
            });
        }

        return points;
    };

    // Generate a very gentle curved path with minimal curvature
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
                curve: Math.random() * 0.2
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
                        curve: Math.random() * 0.2
                    });
                }
            }

            dendrites.push(mainDendrite);
        }

        return dendrites;
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
        const hubNode: Node = {
            id: 'ai-hub',
            x: centerX,
            y: centerY,
            radius: 30,
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
            lastPulseTime: Date.now()
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

            const node: Node = {
                id: project.id,
                x: centerX + Math.cos(angle) * distance,
                y: centerY + Math.sin(angle) * distance,
                radius: 20,
                color: colors[index % colors.length],
                // Very tiny velocity for subtle movement
                vx: (Math.random() - 0.5) * 0.03,
                vy: (Math.random() - 0.5) * 0.03,
                project,
                dendrites: generateDendrites(3 + Math.floor(Math.random() * 2)),
                pulseRate: 2000 + Math.random() * 4000,
                lastPulseTime: Date.now() - Math.random() * 5000
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

            newConnections.push({
                source: projectNode,
                target: hubNode,
                strength: 0.5 + Math.random() * 0.3,
                points,
                pulsePositions: [],
                pulseActive: false,
                lastPulseTime: Date.now() - Math.random() * 5000,
                pulseInterval: 3000 + Math.random() * 5000
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

            newConnections.push({
                source: newNodes[i],
                target: newNodes[nextIndex],
                strength: 0.3 + Math.random() * 0.2,
                points,
                pulsePositions: [],
                pulseActive: false,
                lastPulseTime: Date.now() - Math.random() * 5000,
                pulseInterval: 4000 + Math.random() * 6000
            });
        }

        setNodes(newNodes);
        setConnections(newConnections);
        setIsInitialized(true);
    }, [projects, isInitialized]);

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

        // Animation function
        const animate = () => {
            if (!canvas || !ctx) return;

            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Update nodes position - very gentle movement
            const updatedNodes = [...nodes];
            updatedNodes.forEach((node, index) => {
                // First node is the hub - keep it centered with no movement
                if (index === 0) {
                    node.x = canvas.width / 2;
                    node.y = canvas.height / 2;
                    return;
                }

                // Move nodes slightly for subtle organic movement
                node.x += node.vx;
                node.y += node.vy;

                // Occasional tiny random movement changes (very infrequently)
                if (Math.random() > 0.99) {
                    node.vx += (Math.random() - 0.5) * 0.01;
                    node.vy += (Math.random() - 0.5) * 0.01;
                    // Strong damping
                    node.vx *= 0.95;
                    node.vy *= 0.95;
                }

                // Very low maximum velocity
                const maxVel = 0.1;
                if (Math.abs(node.vx) > maxVel) node.vx = Math.sign(node.vx) * maxVel;
                if (Math.abs(node.vy) > maxVel) node.vy = Math.sign(node.vy) * maxVel;

                // Maintain circular formation around hub
                const hubNode = updatedNodes[0];
                const dx = node.x - hubNode.x;
                const dy = node.y - hubNode.y;
                const distFromHub = Math.sqrt(dx * dx + dy * dy);

                // Desired distance from hub
                const minDimension = Math.min(canvas.width, canvas.height);
                const idealDist = minDimension * 0.3;

                // Strong force to maintain ideal distance from hub
                const distForceFactor = 0.01;
                if (distFromHub > idealDist * 1.1) {
                    // Too far - pull in
                    node.vx -= dx * distForceFactor;
                    node.vy -= dy * distForceFactor;
                } else if (distFromHub < idealDist * 0.9) {
                    // Too close - push out
                    node.vx += dx * distForceFactor;
                    node.vy += dy * distForceFactor;
                }

                // Keep nodes well away from screen edges
                const safeMargin = minDimension * 0.1;
                const edgeForceFactor = 0.05;

                // Left boundary
                if (node.x < safeMargin) {
                    node.vx += edgeForceFactor;
                }
                // Right boundary
                if (node.x > canvas.width - safeMargin) {
                    node.vx -= edgeForceFactor;
                }
                // Top boundary
                if (node.y < safeMargin) {
                    node.vy += edgeForceFactor;
                }
                // Bottom boundary
                if (node.y > canvas.height - safeMargin) {
                    node.vy -= edgeForceFactor;
                }
            });

            // Update connections - regenerate paths to follow node movement
            const updatedConnections = [...connections];
            updatedConnections.forEach(connection => {
                // Always update path to match current node positions
                connection.points = generateCurvedPath(
                    connection.source.x,
                    connection.source.y,
                    connection.target.x,
                    connection.target.y
                );

                // Neural pulse timing
                const now = Date.now();
                if (now - connection.lastPulseTime > connection.pulseInterval) {
                    connection.pulseActive = true;
                    connection.pulsePositions = [0]; // Start new pulse at beginning
                    connection.lastPulseTime = now;
                }

                // Move existing pulses
                if (connection.pulseActive) {
                    for (let i = 0; i < connection.pulsePositions.length; i++) {
                        connection.pulsePositions[i] += 0.005; // Speed of pulse

                        // Remove pulse when it reaches the end
                        if (connection.pulsePositions[i] >= 1) {
                            connection.pulsePositions.splice(i, 1);
                            i--;

                            // If last pulse is gone, no longer active
                            if (connection.pulsePositions.length === 0) {
                                connection.pulseActive = false;
                            }

                            // Trigger target node pulse
                            const targetNode = updatedNodes.find(n => n.id === connection.target.id);
                            if (targetNode) {
                                targetNode.lastPulseTime = now;
                            }
                        }
                    }
                }
            });

            // First draw all dendrites (behind everything)
            updatedNodes.forEach(node => {
                // Draw dendrites
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
                    ctx.lineWidth = dendrite.width;
                    ctx.strokeStyle = node.color;
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
                            ctx.lineWidth = branch.width;
                            ctx.strokeStyle = node.color;
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

                // Set axon style - more biological
                ctx.strokeStyle = 'rgba(160, 150, 140, 0.5)';
                ctx.lineWidth = 1 + connection.strength;
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

                        // Draw pulse
                        ctx.beginPath();
                        const pulseSize = 2 + connection.strength * 2;
                        ctx.arc(pulseX, pulseY, pulseSize, 0, Math.PI * 2);
                        ctx.fillStyle = 'rgba(230, 210, 180, 0.9)';
                        ctx.fill();

                        // Add glow
                        ctx.beginPath();
                        ctx.arc(pulseX, pulseY, pulseSize * 2, 0, Math.PI * 2);
                        const gradient = ctx.createRadialGradient(
                            pulseX, pulseY, pulseSize,
                            pulseX, pulseY, pulseSize * 2
                        );
                        gradient.addColorStop(0, 'rgba(230, 210, 180, 0.5)');
                        gradient.addColorStop(1, 'rgba(230, 210, 180, 0)');
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

                // Draw cell body glow - stronger when pulsing or hovered
                const glowSize = isPulsing ? 20 : (isHovered ? 25 : 10);
                ctx.beginPath();
                ctx.arc(node.x, node.y, node.radius + glowSize, 0, Math.PI * 2);
                const glowGradient = ctx.createRadialGradient(
                    node.x, node.y, node.radius,
                    node.x, node.y, node.radius + glowSize
                );

                const glowColor = isPulsing ? 'rgba(230, 210, 180, ' : 'rgba(180, 170, 150, ';
                glowGradient.addColorStop(0, glowColor + '0.6)');
                glowGradient.addColorStop(1, glowColor + '0)');
                ctx.fillStyle = glowGradient;
                ctx.fill();

                // Draw cell body
                ctx.beginPath();
                ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);

                // Cell body gradient - more biological with subtle texture
                const cellGradient = ctx.createRadialGradient(
                    node.x - node.radius * 0.3, node.y - node.radius * 0.3, node.radius * 0.1,
                    node.x, node.y, node.radius
                );

                // Slightly brighter when pulsing
                const baseColor = isPulsing ?
                    node.color.replace('rgba', 'rgba').replace(', 0.8)', ', 0.9)') :
                    node.color;

                cellGradient.addColorStop(0, 'rgba(230, 220, 200, 0.9)');
                cellGradient.addColorStop(0.3, baseColor);
                cellGradient.addColorStop(1, baseColor.replace(', 0.8)', ', 0.7)'));

                ctx.fillStyle = cellGradient;
                ctx.fill();

                // Add subtle cell membrane
                ctx.strokeStyle = 'rgba(140, 130, 120, 0.4)';
                ctx.lineWidth = isHovered ? 2 : 1;
                ctx.stroke();

                // Draw nucleus
                ctx.beginPath();
                const nucleusRadius = node.radius * 0.4;
                ctx.arc(node.x, node.y, nucleusRadius, 0, Math.PI * 2);
                const nucleusGradient = ctx.createRadialGradient(
                    node.x - nucleusRadius * 0.3, node.y - nucleusRadius * 0.3, nucleusRadius * 0.1,
                    node.x, node.y, nucleusRadius
                );
                nucleusGradient.addColorStop(0, 'rgba(200, 190, 180, 0.9)');
                nucleusGradient.addColorStop(1, 'rgba(170, 160, 150, 0.7)');
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
                }
            });

            setNodes(updatedNodes);
            setConnections(updatedConnections);
            animationRef.current = requestAnimationFrame(animate);
        };

        animate();

        return () => {
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
            window.removeEventListener('resize', handleResize);
        };
    }, [nodes, connections, hoveredNode]);

    // Handle mouse interaction
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
                if (dist <= node.radius + 15) {
                    setHoveredNode(node);
                    canvas.style.cursor = 'pointer';
                    found = true;
                    break;
                }
            }

            if (!found) {
                setHoveredNode(null);
                canvas.style.cursor = 'default';
            }
        };

        const handleClick = (e: MouseEvent) => {
            if (hoveredNode) {
                onNodeClick(hoveredNode.project);

                // Stimulate a pulse when clicked
                const updatedNodes = [...nodes];
                const clickedNode = updatedNodes.find(n => n.id === hoveredNode.id);
                if (clickedNode) {
                    clickedNode.lastPulseTime = Date.now();
                    setNodes(updatedNodes);

                    // Also trigger pulses on all connected axons
                    const connectedAxons = connections.filter(
                        c => c.source.id === clickedNode.id || c.target.id === clickedNode.id
                    );

                    const updatedConnections = [...connections];
                    connectedAxons.forEach(axon => {
                        const connectionToUpdate = updatedConnections.find(
                            c => c.source.id === axon.source.id && c.target.id === axon.target.id
                        );

                        if (connectionToUpdate) {
                            connectionToUpdate.pulseActive = true;
                            connectionToUpdate.pulsePositions = [0];
                            connectionToUpdate.lastPulseTime = Date.now();
                        }
                    });

                    setConnections(updatedConnections);
                }
            }
        };

        canvas.addEventListener('mousemove', handleMouseMove);
        canvas.addEventListener('click', handleClick);

        return () => {
            canvas.removeEventListener('mousemove', handleMouseMove);
            canvas.removeEventListener('click', handleClick);
        };
    }, [nodes, connections, hoveredNode, onNodeClick]);

    return (
        <div ref={containerRef} className="neural-network-container">
            <canvas ref={canvasRef} className="neural-network-canvas" />
            <div className="network-overlay">
                <div className="scanner-line"></div>
                <div className="grid-lines"></div>
            </div>
        </div>
    );
};

export default NeuralNetwork;