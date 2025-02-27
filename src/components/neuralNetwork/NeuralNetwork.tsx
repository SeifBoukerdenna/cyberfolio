/* eslint-disable @typescript-eslint/no-unused-vars */
import { useRef, useEffect, useState } from 'react';
import './NeuralNetwork.css';
import { Project } from '../../types/Project';


interface NeuralNetworkProps {
    projects: Project[];
    onNodeClick: (project: Project) => void;
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
}

interface Connection {
    source: Node;
    target: Node;
    strength: number;
}

const NeuralNetwork: React.FC<NeuralNetworkProps> = ({ projects, onNodeClick }) => {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const containerRef = useRef<HTMLDivElement | null>(null);
    const [nodes, setNodes] = useState<Node[]>([]);
    const [connections, setConnections] = useState<Connection[]>([]);
    const [hoveredNode, setHoveredNode] = useState<Node | null>(null);
    const [isInitialized, setIsInitialized] = useState(false);
    const animationRef = useRef<number | null>(null);

    // Initialize network
    useEffect(() => {
        if (!projects.length || isInitialized) return;

        const newNodes: Node[] = [];
        const colors = ['#00FFFF', '#FF00FF', '#7B68EE', '#00FF7F', '#FF4500'];

        // Calculate center position - positioned more towards bottom center
        const centerX = window.innerWidth * 0.5;
        const centerY = window.innerHeight * 0.6;

        // Create nodes with better positioning
        projects.forEach((project, index) => {
            // Calculate angle for circular arrangement, but focus on bottom half
            const angle = (Math.PI * 0.6) + (Math.PI * 0.8 * index / projects.length);
            const distance = 150 + Math.random() * 100;

            newNodes.push({
                id: project.id,
                x: centerX + Math.cos(angle) * distance,
                y: centerY + Math.sin(angle) * distance,
                radius: 25 + Math.random() * 15,
                color: colors[index % colors.length],
                vx: (Math.random() - 0.5) * 0.3, // Slower movement
                vy: (Math.random() - 0.5) * 0.3,
                project
            });
        });

        // Add central AI hub node
        newNodes.push({
            id: 'ai-hub',
            x: centerX,
            y: centerY,
            radius: 40,
            color: '#7B68EE',
            vx: 0,
            vy: 0,
            project: {
                id: 'ai-hub',
                title: 'AI Hub',
                description: 'Your cyberpunk AI guide',
                technologies: ['AI', 'Neural Interface'],
                image: '',
                demoLink: '',
                githubLink: '',
                type: 'core'
            }
        });

        // Create connections
        const newConnections: Connection[] = [];

        // Connect all nodes to AI hub
        const aiHub = newNodes[newNodes.length - 1];
        newNodes.forEach((node, i) => {
            if (i === newNodes.length - 1) return; // Skip AI hub itself

            newConnections.push({
                source: node,
                target: aiHub,
                strength: 0.5 + Math.random() * 0.5
            });
        });

        // Connect some nodes to each other - more interconnected
        newNodes.forEach((source, i) => {
            if (i === newNodes.length - 1) return; // Skip AI hub

            // Connect to more nodes for denser network
            const numConnections = 2 + Math.floor(Math.random() * 2);
            for (let j = 0; j < numConnections; j++) {
                let targetIndex;
                do {
                    targetIndex = Math.floor(Math.random() * (newNodes.length - 1));
                } while (targetIndex === i);

                newConnections.push({
                    source,
                    target: newNodes[targetIndex],
                    strength: 0.3 + Math.random() * 0.7
                });
            }
        });

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

            // Update nodes position
            const updatedNodes = [...nodes];
            updatedNodes.forEach(node => {
                // Move nodes
                node.x += node.vx;
                node.y += node.vy;

                // Bounce off edges
                if (node.x < node.radius || node.x > canvas.width - node.radius) {
                    node.vx *= -1;
                }
                if (node.y < node.radius || node.y > canvas.height - node.radius) {
                    node.vy *= -1;
                }

                // Keep nodes inside canvas
                node.x = Math.max(node.radius, Math.min(canvas.width - node.radius, node.x));
                node.y = Math.max(node.radius, Math.min(canvas.height - node.radius, node.y));
            });

            // Draw connections - more neural-like
            connections.forEach(connection => {
                const { source, target, strength } = connection;

                // Curve the connections for neural network feel
                const midX = (source.x + target.x) / 2;
                const midY = (source.y + target.y) / 2 - 20 - Math.random() * 40;

                ctx.beginPath();
                ctx.moveTo(source.x, source.y);
                ctx.quadraticCurveTo(midX, midY, target.x, target.y);

                // Gradient for connections
                const gradient = ctx.createLinearGradient(source.x, source.y, target.x, target.y);
                gradient.addColorStop(0, source.color + '80'); // Semi-transparent
                gradient.addColorStop(1, target.color + '80');

                ctx.strokeStyle = gradient;
                ctx.lineWidth = strength * 2;
                ctx.stroke();

                // Neural network synapse effect - multiple data points
                const numPoints = 2 + Math.floor(Math.random() * 3);
                for (let i = 0; i < numPoints; i++) {
                    const t = (Date.now() % 3000) / 3000 + (i / numPoints);
                    const normalizedT = t % 1;

                    // Use the quadratic curve formula to get point along curve
                    const curveT = normalizedT;
                    const pointX = Math.pow(1 - curveT, 2) * source.x +
                        2 * (1 - curveT) * curveT * midX +
                        Math.pow(curveT, 2) * target.x;
                    const pointY = Math.pow(1 - curveT, 2) * source.y +
                        2 * (1 - curveT) * curveT * midY +
                        Math.pow(curveT, 2) * target.y;

                    ctx.beginPath();

                    // Pulse size for more dynamic feel
                    const pulseSize = 1.5 + Math.sin(normalizedT * Math.PI * 2) * 1;
                    const finalSize = 2 + strength * pulseSize;

                    ctx.arc(pointX, pointY, finalSize, 0, Math.PI * 2);
                    ctx.fillStyle = normalizedT < 0.5 ? source.color : target.color;
                    ctx.fill();
                }
            });

            // Draw nodes
            updatedNodes.forEach(node => {
                // Glow effect
                const isHovered = hoveredNode && hoveredNode.id === node.id;
                const glow = isHovered ? 30 : 15;

                ctx.beginPath();
                ctx.arc(node.x, node.y, node.radius + glow, 0, Math.PI * 2);
                const glowGradient = ctx.createRadialGradient(
                    node.x, node.y, node.radius,
                    node.x, node.y, node.radius + glow
                );
                glowGradient.addColorStop(0, node.color + 'FF');
                glowGradient.addColorStop(1, node.color + '00');
                ctx.fillStyle = glowGradient;
                ctx.fill();

                // Node circle
                ctx.beginPath();
                ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);

                // Create gradient fill
                const gradient = ctx.createRadialGradient(
                    node.x - node.radius * 0.3, node.y - node.radius * 0.3, node.radius * 0.1,
                    node.x, node.y, node.radius
                );
                gradient.addColorStop(0, '#FFFFFF');
                gradient.addColorStop(0.1, node.color);
                gradient.addColorStop(1, node.color + '60');

                ctx.fillStyle = gradient;
                ctx.fill();

                ctx.strokeStyle = '#FFFFFF';
                ctx.lineWidth = isHovered ? 3 : 1;
                ctx.stroke();

                // Pulse effect
                const time = Date.now() % 3000 / 3000;
                const pulseSize = Math.sin(time * Math.PI * 2) * 5;

                // Only draw pulse for hovered node or AI Hub
                if (isHovered || node.id === 'ai-hub') {
                    ctx.beginPath();
                    ctx.arc(node.x, node.y, node.radius + pulseSize, 0, Math.PI * 2);
                    ctx.strokeStyle = node.color;
                    ctx.lineWidth = 2;
                    ctx.stroke();
                }

                // Add neural circuit pattern inside nodes
                if (node.radius > 30) {
                    // Circuit lines for larger nodes
                    const numCircuits = Math.floor(node.radius / 10);
                    for (let i = 0; i < numCircuits; i++) {
                        const angle = Math.random() * Math.PI * 2;
                        const length = node.radius * 0.6;
                        const startX = node.x + Math.cos(angle) * node.radius * 0.3;
                        const startY = node.y + Math.sin(angle) * node.radius * 0.3;
                        const endX = startX + Math.cos(angle) * length;
                        const endY = startY + Math.sin(angle) * length;

                        ctx.beginPath();
                        ctx.moveTo(startX, startY);
                        ctx.lineTo(endX, endY);
                        ctx.strokeStyle = '#FFFFFF40';
                        ctx.lineWidth = 1;
                        ctx.stroke();

                        // Small dot at the end of the circuit
                        ctx.beginPath();
                        ctx.arc(endX, endY, 2, 0, Math.PI * 2);
                        ctx.fillStyle = '#FFFFFF80';
                        ctx.fill();
                    }
                }

                // Node label
                if (isHovered || node.id === 'ai-hub') {
                    ctx.font = '16px "Courier New", monospace';
                    ctx.fillStyle = '#FFFFFF';
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    ctx.fillText(node.project.title, node.x, node.y);
                }
            });

            setNodes(updatedNodes);
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
                if (dist <= node.radius + 10) {
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
            }
        };

        canvas.addEventListener('mousemove', handleMouseMove);
        canvas.addEventListener('click', handleClick);

        return () => {
            canvas.removeEventListener('mousemove', handleMouseMove);
            canvas.removeEventListener('click', handleClick);
        };
    }, [nodes, hoveredNode, onNodeClick]);

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