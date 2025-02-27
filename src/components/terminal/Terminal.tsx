import React, { useState, useRef, useEffect } from 'react';
import './Terminal.css';
import { Project } from '../../types/Project';

interface TerminalProps {
    projects: Project[];
    isVisible: boolean;
    onClose: () => void;
    onProjectSelect: (project: Project) => void;
}

interface CommandResult {
    text: string;
    isError: boolean;
}

const Terminal: React.FC<TerminalProps> = ({
    projects,
    isVisible,
    onClose,
    onProjectSelect
}) => {
    const [commandHistory, setCommandHistory] = useState<string[]>([]);
    const [currentCommand, setCurrentCommand] = useState('');
    const [commandIndex, setCommandIndex] = useState(-1);
    const [outputLines, setOutputLines] = useState<CommandResult[]>([
        { text: '> Neural Terminal v3.1.4 [Build 20250226]', isError: false },
        { text: '> Type "help" for available commands', isError: false },
        { text: '>', isError: false }
    ]);

    const terminalRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // Auto focus input when terminal opens
    useEffect(() => {
        if (isVisible && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isVisible]);

    // Auto scroll to bottom
    useEffect(() => {
        if (terminalRef.current) {
            terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
        }
    }, [outputLines]);

    // Handle keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (!isVisible) return;

            // ESC to close
            if (e.key === 'Escape') {
                onClose();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [isVisible, onClose]);

    // Handle command submission
    const handleCommandSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!currentCommand.trim()) return;

        // Add command to output
        setOutputLines(prev => [
            ...prev,
            { text: `> ${currentCommand}`, isError: false }
        ]);

        // Process command
        const result = processCommand(currentCommand);
        setOutputLines(prev => [...prev, ...result, { text: '>', isError: false }]);

        // Add to history and reset
        setCommandHistory(prev => [...prev, currentCommand]);
        setCurrentCommand('');
        setCommandIndex(-1);
    };

    // Process commands
    const processCommand = (command: string): CommandResult[] => {
        const cmd = command.trim().toLowerCase();
        const args = cmd.split(' ').filter(Boolean);
        const mainCommand = args[0];

        switch (mainCommand) {
            case 'help':
                return [
                    { text: 'AVAILABLE COMMANDS:', isError: false },
                    { text: '  help               - Display this help message', isError: false },
                    { text: '  clear              - Clear terminal screen', isError: false },
                    { text: '  list_projects      - Display all projects', isError: false },
                    { text: '  view [project_id]  - Open detailed view of a project', isError: false },
                    { text: '  info [project_id]  - Show information about a project', isError: false },
                    { text: '  filter [type]      - List projects by type (frontend, backend, etc.)', isError: false },
                    { text: '  exit               - Close terminal', isError: false },
                    { text: '  about              - Display information about this system', isError: false }
                ];

            case 'clear':
                // Clear all output except the initial greeting
                setOutputLines([
                    { text: '> Neural Terminal v3.1.4 [Build 20250226]', isError: false },
                    { text: '> Type "help" for available commands', isError: false }
                ]);
                return [];

            case 'list_projects':
                return [
                    { text: 'AVAILABLE PROJECTS:', isError: false },
                    ...projects.map(project => (
                        { text: `  ${project.id} - ${project.title} (${project.type.toUpperCase()})`, isError: false }
                    ))
                ];

            case 'view':
                {
                    if (args.length < 2) {
                        return [{ text: 'ERROR: Missing project ID. Usage: view [project_id]', isError: true }];
                    }

                    const projectToView = projects.find(p => p.id === args[1]);
                    if (projectToView) {
                        onProjectSelect(projectToView);
                        return [{ text: `Launching neural interface for project: ${projectToView.title}`, isError: false }];
                    } else {
                        return [{ text: `ERROR: Project ID "${args[1]}" not found.`, isError: true }];
                    }
                }

            case 'info':
                {
                    if (args.length < 2) {
                        return [{ text: 'ERROR: Missing project ID. Usage: info [project_id]', isError: true }];
                    }

                    const projectInfo = projects.find(p => p.id === args[1]);
                    if (projectInfo) {
                        return [
                            { text: `PROJECT INFORMATION: ${projectInfo.title}`, isError: false },
                            { text: `ID: ${projectInfo.id}`, isError: false },
                            { text: `TYPE: ${projectInfo.type.toUpperCase()}`, isError: false },
                            { text: `STATUS: ${projectInfo.status || 'COMPLETED'}`, isError: false },
                            { text: `TECHNOLOGIES: ${projectInfo.technologies.join(', ')}`, isError: false },
                            { text: `DESCRIPTION: ${projectInfo.description}`, isError: false },
                            projectInfo.githubLink
                                ? { text: `SOURCE: ${projectInfo.githubLink}`, isError: false }
                                : { text: 'SOURCE: Not available', isError: false }
                        ];
                    } else {
                        return [{ text: `ERROR: Project ID "${args[1]}" not found.`, isError: true }];
                    }
                }

            case 'filter':
                {
                    if (args.length < 2) {
                        return [{ text: 'ERROR: Missing type. Usage: filter [type]', isError: true }];
                    }

                    const type = args[1].toLowerCase();
                    const validTypes = ['frontend', 'backend', 'fullstack', 'mobile', 'ai'];

                    if (!validTypes.includes(type)) {
                        return [{
                            text: `ERROR: Invalid type. Valid types are: ${validTypes.join(', ')}`,
                            isError: true
                        }];
                    }

                    const filteredProjects = projects.filter(p => p.type === type);

                    if (filteredProjects.length === 0) {
                        return [{ text: `No projects found with type: ${type}`, isError: false }];
                    }

                    return [
                        { text: `PROJECTS (TYPE: ${type.toUpperCase()}):`, isError: false },
                        ...filteredProjects.map(project => (
                            { text: `  ${project.id} - ${project.title}`, isError: false }
                        ))
                    ];
                }

            case 'exit':
                onClose();
                return [{ text: 'Terminal session terminated.', isError: false }];

            case 'about':
                return [
                    { text: 'NEURAL TERMINAL', isError: false },
                    { text: 'Version: 3.1.4 [Build 20250226]', isError: false },
                    { text: 'Developer: Confidential', isError: false },
                    { text: 'Purpose: Secure access to neural portfolio interface', isError: false },
                    { text: 'Status: ACTIVE', isError: false },
                    { text: 'Security Level: EPSILON', isError: false }
                ];

            // Easter egg command
            case 'access_hyperspace':
                return [
                    { text: 'INITIATING HYPERSPACE ACCESS PROTOCOL...', isError: false },
                    { text: 'SCANNING NEURAL PATHWAYS...', isError: false },
                    { text: 'ACCESS GRANTED', isError: false },
                    { text: '', isError: false },
                    { text: '⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿', isError: false },
                    { text: '⣿⣿⣿⣿⣿⣿⣿⠿⠿⠿⢿⣿⣿⣿⣿⣿⣿⣿⣿⡿⠿⠿⠿⣿⣿⣿⣿⣿⣿⣿', isError: false },
                    { text: '⣿⣿⣿⣿⣿⣿⣇⣀⣀⣀⣀⣈⣹⣿⣿⣿⣿⣿⣥⣀⣀⣀⣀⣸⣿⣿⣿⣿⣿⣿', isError: false },
                    { text: '⣿⣿⣿⣿⣿⣿⡿⠿⠿⠿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⠿⠿⠿⢿⣿⣿⣿⣿⣿⣿', isError: false },
                    { text: '⣿⣿⣿⣿⣿⣿⣧⣠⣄⣤⣾⣿⣿⣿⣿⣿⣿⣿⣿⣷⣤⣄⣠⣼⣿⣿⣿⣿⣿⣿', isError: false },
                    { text: '⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿', isError: false },
                    { text: '⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿', isError: false },
                    { text: '', isError: false },
                    { text: 'WELCOME TO HYPERSPACE', isError: false },
                    { text: 'HIDDEN PROJECT UNLOCKED: cyberdeck', isError: false },
                    { text: 'USE "view cyberdeck" TO ACCESS', isError: false }
                ];

            default:
                return [{ text: `Command not recognized: ${mainCommand}`, isError: true }];
        }
    };

    // Handle arrow keys for command history
    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'ArrowUp') {
            e.preventDefault();

            if (commandHistory.length > 0) {
                const newIndex = commandIndex < commandHistory.length - 1
                    ? commandIndex + 1
                    : commandIndex;

                setCommandIndex(newIndex);
                setCurrentCommand(commandHistory[commandHistory.length - 1 - newIndex]);
            }
        } else if (e.key === 'ArrowDown') {
            e.preventDefault();

            if (commandIndex > 0) {
                const newIndex = commandIndex - 1;
                setCommandIndex(newIndex);
                setCurrentCommand(commandHistory[commandHistory.length - 1 - newIndex]);
            } else if (commandIndex === 0) {
                setCommandIndex(-1);
                setCurrentCommand('');
            }
        }
    };

    if (!isVisible) return null;

    return (
        <div className="terminal-overlay">
            <div className="terminal-container">
                <div className="terminal-header">
                    <div className="terminal-title">Neural Terminal</div>
                    <button className="terminal-close" onClick={onClose}>×</button>
                </div>

                <div className="terminal-content" ref={terminalRef}>
                    {outputLines.map((line, i) => (
                        <div
                            key={i}
                            className={`terminal-line ${line.isError ? 'error' : ''}`}
                        >
                            {line.text}
                        </div>
                    ))}

                    <form onSubmit={handleCommandSubmit} className="terminal-input-line">
                        <span className="prompt"></span>
                        <input
                            ref={inputRef}
                            type="text"
                            value={currentCommand}
                            onChange={(e) => setCurrentCommand(e.target.value)}
                            onKeyDown={handleKeyDown}
                            className="terminal-input"
                            autoFocus
                            spellCheck="false"
                            autoComplete="off"
                        />
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Terminal;