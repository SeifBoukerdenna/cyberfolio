/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
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
    isAsciiArt?: boolean;
    isGlitch?: boolean;
    isHidden?: boolean;
    delay?: number;
    style?: 'directory' | 'executable' | 'markdown' | 'json' | 'code' | string;
}

// ASCII art catalog
const asciiArt = {
    logo: [
        "    _   __                      __   __  _          __            __ ",
        "   / | / /__  __  ___________  / /  / /_(_)___ _   / /_____  ____/ /_",
        "  /  |/ / _ \\/ / / / ___/ __ \\/ /  / __/ / __ `/  / __/ __ \\/ __  __/",
        " / /|  /  __/ /_/ / /  / /_/ / /  / /_/ / /_/ /  / /_/ /_/ / /_/ /_  ",
        "/_/ |_/\\___/\\__,_/_/   \\____/_/   \\__/_/\\__,_/   \\__/\\____/\\__/\\__/  ",
        "                                                                      "
    ],
    skull: [
        "     .ed\"\"\"\" \"\"\"$$$$be.",
        "   -\"           ^\"\"**$$$e.",
        " .\"                   '$$$c",
        "/                      \"4$$b",
        "d  3                     $$$$",
        "$  *                   .$$$$$$",
        ".$  ^c           $$$$$e$$$$$$$.",
        "d$L  4.         4$$$$$$$$$$$$$$b",
        "$$$$b ^ceeeee.  4$$ECL.F*$$$$$$$",
        "$$$$P d$$$$F $ $$$$$$$$$- $$$$$$",
        "3$$$F \"$$$$b   $\"$$$$$$$  $$$$*\"",
        " $$P\"  \"$$b   .$ $$$$$...e$$",
        "  *c    ..    $$ 3$$$$$$$$$$eF",
        "    %ce\"\"    $$$  $$$$$$$$$$*",
        "     *$e.    *** d$$$$$\"L$$",
        "      $$$      4J$$$$$% $$$",
        "     $\"'$=e....$*$$**$cz$$\"",
        "     $  *=%4.$ L L$ P3$$$F",
        "     $   \"%*ebJLzb$e$$$$$b",
        "      %..      4$$$$$$$$$",
        "       $$$e   z$$$$$$$$$$",
        "        \"*$c  \"$$$$$$$P\"",
        "          \"\"\"*$$$$$$$\""
    ],
    brain: [
        "              .-\"-.",
        "            _/.-.-.\\_",
        "           ( ( o o ) )",
        "            |/  \"  \\|",
        "            \\ .-. /",
        "            /`\"\"\"'\\",
        "           /       \\",
        "        .-'~~\"\"\"\"\"~~'-.",
        "       (               )",
        "    .-'~~\"\"\"\"\"\"\"\"\"\"\"~~'-.",
        "   (                     )",
        "   |                     |",
        "   |                     |",
        "   |                     |",
        "   (                     )",
        "    '-.,_________,.-'",
        "        /  /  \\  \\",
        "       /  :    ;  \\",
        "      /   |    |   \\",
        "     :    |    |    :",
        "     |    |    |    |",
        "     |    |    |    |",
        "     |    |    |    |",
        "     :    |    |    :",
        "      \\   |    |   /",
        "       \\  :    :  /",
        "        \\  \\__/  /"
    ],
    matrix: [
        " 01010 │ █ │ 10101 │ █ │ 01010 │ █ │ 10101 ",
        " 10101 │ █ │ 01010 │ █ │ 10101 │ █ │ 01010 ",
        " 01010 │ █ │ 10101 │ █ │ 01010 │ █ │ 10101 ",
        " 10101 │ █ │ 01010 │ █ │ 10101 │ █ │ 01010 ",
        " 01010 │ █ │ 10101 │ █ │ 01010 │ █ │ 10101 ",
        " 10101 │ █ │ 01010 │ █ │ 10101 │ █ │ 01010 "
    ],
    computer: [
        "       .-------------------.       ",
        "      /-----|-----------|--\\      ",
        "     /-----/|           |\\--\\     ",
        "    /-----/_|___________|_\\--\\    ",
        "   |-----|__________________|--|   ",
        "   |-----|                |--|---|  ",
        "   |-----| [] [] [] [] [] |--|---|  ",
        "   |-----|________________|--|---|  ",
        "   |-----|     _______    |--|---|  ",
        "   |-----|    |       |   |--|---|  ",
        "   |-----|   .|_______|.  |--|---|  ",
        "   '-----'  / |___|___| \\ '-----'  ",
        "    \\----\\ |             | /----/   ",
        "     \\----\\|             |/----/    ",
        "      \\-------------------/----/     ",
        "       \\-----------------/----/      ",
        "        \\_______________/____/       "
    ]
};

// Cyberpunk quotes for the quote command
const quotes = [
    "The sky above the port was the color of television, tuned to a dead channel.",
    "Information wants to be free, but is everywhere in chains.",
    "The future is already here – it's just not evenly distributed.",
    "Cyberspace. A consensual hallucination experienced daily by billions of legitimate operators.",
    "The street finds its own uses for things.",
    "It's not the men in your life that matters, it's the life in your machines.",
    "In the future, it won't be about privacy but knowing who has your data and what they're doing with it.",
    "Behind every screen, a neural network hums with the ghost of consciousness.",
    "We don't see things as they are, we see them as we are programmed to see them.",
    "Your mind is software. Program it. Your body is a shell. Change it. Death is a disease. Cure it."
];

// Hidden directories and files for ls command
const fileSystem = {
    root: {
        name: "/",
        type: "dir",
        children: {
            bin: {
                name: "bin",
                type: "dir",
                children: {
                    neural_scanner: { name: "neural_scanner", type: "executable" },
                    decrypt: { name: "decrypt", type: "executable" },
                    sys_optimize: { name: "sys_optimize", type: "executable" }
                }
            },
            etc: {
                name: "etc",
                type: "dir",
                children: {
                    config: { name: "config", type: "file", content: "SYSTEM CONFIGURATION: CLASSIFIED" },
                    hosts: { name: "hosts", type: "file", content: "127.0.0.1 localhost\n192.168.1.1 neural-hub\n10.0.0.5 central-nexus" }
                }
            },
            home: {
                name: "home",
                type: "dir",
                children: {
                    user: {
                        name: "user",
                        type: "dir",
                        children: {
                            notes: { name: "notes.txt", type: "file", content: "Remember to update portfolio with latest neural enhancement projects." },
                            projects: { name: "projects", type: "dir", children: {} } // Will be populated with actual projects
                        }
                    }
                }
            },
            var: {
                name: "var",
                type: "dir",
                children: {
                    log: {
                        name: "log",
                        type: "dir",
                        children: {
                            system: { name: "system.log", type: "file", content: "Neural interface initialized.\nBiometric authentication successful.\nNeurocortex link established." }
                        }
                    }
                }
            },
            usr: {
                name: "usr",
                type: "dir",
                children: {
                    share: {
                        name: "share",
                        type: "dir",
                        children: {
                            themes: { name: "themes", type: "dir", children: {} },
                            docs: {
                                name: "docs", type: "dir", children: {
                                    readme: { name: "readme.md", type: "file", content: "# Neural Interface Documentation\n\nWelcome to the neural interface system. This documentation provides information on system functionality and available commands." }
                                }
                            }
                        }
                    }
                }
            }
        }
    }
};

// Mini-games
const miniGames = {
    hackSimulator: {
        name: "Hack Simulator",
        description: "Simulate hacking into a target system by matching sequence patterns.",
        status: "available"
    },
    neuralDecrypt: {
        name: "Neural Decrypt",
        description: "Decrypt neural patterns by solving a puzzle.",
        status: "available"
    },
    cyberPong: {
        name: "CyberPong",
        description: "Play a classic game of Pong with a cyberpunk twist.",
        status: "unavailable" // For demo, mark as unavailable
    }
};

const Terminal: React.FC<TerminalProps> = ({
    projects,
    isVisible,
    onClose,
    onProjectSelect
}) => {
    const [commandHistory, setCommandHistory] = useState<string[]>([]);
    const [commandIndex, setCommandIndex] = useState(-1);
    const [currentCommand, setCurrentCommand] = useState('');
    const [outputLines, setOutputLines] = useState<CommandResult[]>([
        { text: '', isError: false },
        {
            text: '     _   __                      __   __  _          __            __ ', isAsciiArt: true,
            isError: false
        },
        {
            text: '    / | / /__  __  ___________  / /  / /_(_)___ _   / /_____  ____/ /_', isAsciiArt: true,
            isError: false
        },
        {
            text: '   /  |/ / _ \\/ / / / ___/ __ \\/ /  / __/ / __ `/  / __/ __ \\/ __  __/', isAsciiArt: true,
            isError: false
        },
        {
            text: '  / /|  /  __/ /_/ / /  / /_/ / /  / /_/ / /_/ /  / /_/ /_/ / /_/ /_  ', isAsciiArt: true,
            isError: false
        },
        {
            text: ' /_/ |_/\\___/\\__,_/_/   \\____/_/   \\__/_/\\__,_/   \\__/\\____/\\__/\\__/  ', isAsciiArt: true,
            isError: false
        },
        {
            text: '                                                                       ', isAsciiArt: true,
            isError: false
        },
        { text: '====================== NEURAL TERMINAL v3.1.4 =======================', isError: false },
        { text: '', isError: false },
        { text: '> Neural interface initialized. Biometric authentication successful.', isError: false },
        { text: '> Welcome to the Neural Terminal. Type "tutorial" for a quick guide.', isError: false },
        { text: '> Type "help" for available commands.', isError: false },
        { text: '', isError: false },
        { text: '>', isError: false }
    ]);
    const [currentDir, setCurrentDir] = useState("/");
    const [hackingInProgress, setHackingInProgress] = useState(false);
    const [matrixMode, setMatrixMode] = useState(false);
    const [typingSpeed, setTypingSpeed] = useState(50); // ms per character when simulating typing
    const [commandSuggestions, setCommandSuggestions] = useState<string[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [selectedSuggestion, setSelectedSuggestion] = useState(0);

    const terminalRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const fileSystemRef = useRef(JSON.parse(JSON.stringify(fileSystem))); // Deep copy of filesystem

    // Available commands
    const availableCommands = [
        "help", "clear", "list_projects", "view", "info", "filter", "exit",
        "about", "ls", "cd", "cat", "echo", "date", "whoami", "neofetch",
        "matrix", "hack", "decrypt", "analyze", "scan", "ping", "game",
        "quote", "ascii", "color", "speed", "glitch"
    ];

    // Initialize projects in file system
    useEffect(() => {
        // Make sure the file system structure is properly initialized
        const projectsDir = fileSystemRef.current.root.children.home.children.user.children.projects.children;

        // Add tutorial files
        fileSystemRef.current.root.children.home.children.user.children.tutorials = {
            name: "tutorials",
            type: "dir",
            children: {
                basics: {
                    name: "basics.txt",
                    type: "file",
                    content: "TERMINAL BASICS:\n\n1. ls - List files and directories\n2. cd [dir] - Change directory\n3. cat [file] - Display file contents\n\nTips:\n- Use Tab for auto-completion\n- Use up/down arrows for command history"
                },
                navigation: {
                    name: "navigation.txt",
                    type: "file",
                    content: "NAVIGATION GUIDE:\n\n- cd / - Go to root directory\n- cd .. - Go up one directory\n- cd ~ or cd /home/user - Go to home directory\n- ls -la - Show hidden files\n- cd /home/user/projects - Browse all projects"
                },
                commands: {
                    name: "commands.txt",
                    type: "file",
                    content: "FUN COMMANDS:\n\n- matrix - Toggle Matrix mode visual effect\n- hack - Run hacking simulation\n- game - Show available games\n- decrypt - Run decryption tool\n- neofetch - Show system information\n- color [theme] - Change terminal colors"
                },
                welcome: {
                    name: "welcome.txt",
                    type: "file",
                    content: "WELCOME TO THE NEURAL TERMINAL!\n\nThis terminal provides an interactive way to explore this portfolio.\n\nUse 'ls' and 'cd' to navigate through projects or use the portfolio-specific commands like 'list_projects' and 'view [project_id]' to explore directly.\n\nType 'help' for all available commands or 'tutorial' for a quick guide."
                }
            }
        };

        // Add sample note in home directory
        fileSystemRef.current.root.children.home.children.user.children.quickstart = {
            name: "quickstart.txt",
            type: "file",
            content: "QUICK START GUIDE\n\nWelcome to the Neural Terminal interface!\n\nTry these commands:\n1. cd /home/user/projects\n2. ls\n3. cd [project_name]\n4. cat readme.md\n\nOr use these shortcuts:\n- list_projects - Show all available projects\n- view [project_id] - View a specific project\n- info [project_id] - Get project information"
        };

        // Add projects to the filesystem
        projects.forEach(project => {
            projectsDir[project.id] = {
                name: project.id,
                type: "dir",
                children: {
                    readme: {
                        name: "readme.md",
                        type: "file",
                        content: `# ${project.title}\n\n${project.description}\n\nTechnologies: ${project.technologies.join(", ")}`
                    },
                    config: {
                        name: "config.json",
                        type: "file",
                        content: JSON.stringify({ id: project.id, title: project.title, type: project.type, status: project.status || "COMPLETED" }, null, 2)
                    }
                }
            };

            // Add a demo script to each project
            if (project.codeSnippet) {
                projectsDir[project.id].children.demo = {
                    name: "demo.js",
                    type: "file",
                    content: project.codeSnippet
                };
            }
        });
    }, [projects]);

    // Auto focus input when terminal opens and run initial animation
    useEffect(() => {
        if (isVisible && inputRef.current) {
            inputRef.current.focus();

            // Show a welcome message with typing effect after a short delay
            if (outputLines.length <= 15) { // Only show on first open
                setTimeout(() => {
                    const welcomeLines: CommandResult[] = [
                        { text: "> WELCOME, USER. NEURAL INTERFACE READY.", isError: false },
                        { text: "> Type 'tutorial' to learn how to use the terminal.", isError: false }
                    ];

                    addTypingOutput(welcomeLines);
                }, 800);
            }
        }
    }, [isVisible]);

    // Auto scroll to bottom
    useEffect(() => {
        if (terminalRef.current) {
            terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
        }
    }, [outputLines]);

    // Handle keyboard shortcuts and ensure initial commands work
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (!isVisible) return;

            // ESC to close
            if (e.key === 'Escape') {
                onClose();
            }

            // Ctrl+L to clear screen (common terminal shortcut)
            if (e.ctrlKey && e.key === 'l') {
                e.preventDefault();
                setOutputLines([
                    { text: '> Neural Terminal v3.1.4 [Build 20250226]', isError: false },
                    { text: '> Type "help" for available commands or "tutorial" for a quick guide', isError: false }
                ]);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [isVisible, onClose]);

    // Make sure file system and terminal work on first render
    useEffect(() => {
        // Verify that file system structure is properly initialized
        if (!fileSystemRef.current.root.children.home?.children?.user?.children?.projects) {
            console.error("File system not properly initialized");

            // Re-initialize file system if needed
            fileSystemRef.current = JSON.parse(JSON.stringify(fileSystem));
        }
    }, []);

    // Apply Matrix mode effect
    useEffect(() => {
        const terminalContent = document.querySelector('.terminal-content');
        if (terminalContent) {
            if (matrixMode) {
                terminalContent.classList.add('matrix-mode');
            } else {
                terminalContent.classList.remove('matrix-mode');
            }
        }
    }, [matrixMode]);

    // Add a simulated typing effect for outputs
    const addTypingOutput = (lines: CommandResult[], callback?: () => void) => {
        if (lines.length === 0) {
            if (callback) callback();
            return;
        }

        // Add the first line immediately for responsiveness
        setOutputLines(prev => [...prev, lines[0]]);

        // Add remaining lines with typing effect
        if (lines.length > 1) {
            let currentIndex = 1;

            const addNextLine = () => {
                if (currentIndex >= lines.length) {
                    if (callback) callback();
                    return;
                }

                const line = lines[currentIndex];
                const delay = line.delay || (line.isAsciiArt ? 10 : typingSpeed);

                setTimeout(() => {
                    setOutputLines(prev => [...prev, line]);
                    currentIndex++;
                    addNextLine();
                }, delay);
            };

            addNextLine();
        } else {
            if (callback) callback();
        }
    };

    // Handle command submission
    const handleCommandSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!currentCommand.trim()) return;

        // Clear suggestions
        setShowSuggestions(false);

        // Add command to output
        setOutputLines(prev => [
            ...prev,
            { text: `> ${currentCommand}`, isError: false }
        ]);

        // Process command
        const result = processCommand(currentCommand);

        // For special commands with typing effect
        if (typeof result === 'function') {
            result();
        } else {
            // Add output with typing effect
            addTypingOutput([...result, { text: '>', isError: false }]);
        }

        // Add to history and reset
        setCommandHistory(prev => [...prev, currentCommand]);
        setCurrentCommand('');
        setCommandIndex(-1);
    };

    // Generate a realistic file path based on current directory
    const getPathString = (path: string): string => {
        if (path === "/") return path;
        return path.endsWith("/") ? path : path + "/";
    };

    // Navigate the file system to get a directory or file
    const getFileSystemItem = (path: string) => {
        if (path === "/" || path === "") return fileSystemRef.current.root;

        const parts = path.split('/').filter(p => p);
        let current = fileSystemRef.current.root;

        for (const part of parts) {
            if (part === "") continue;
            if (!current.children || !current.children[part]) return null;
            current = current.children[part];
        }

        return current;
    };

    // Resolve a path (absolute or relative) to absolute path
    const resolvePath = (path: string): string => {
        // If absolute path
        if (path.startsWith('/')) return path;

        // If current directory
        if (path === '.') return currentDir;

        // If parent directory
        if (path === '..') {
            if (currentDir === '/') return '/';
            const parts = currentDir.split('/').filter(p => p);
            parts.pop();
            return '/' + parts.join('/');
        }

        // If relative path
        return currentDir === '/' ? `/${path}` : `${currentDir}/${path}`;
    };

    // Simulate a hacking sequence
    const simulateHacking = () => {
        setHackingInProgress(true);

        const hackingLines: CommandResult[] = [
            { text: "INITIALIZING NEURAL HACK SEQUENCE...", isError: false },
            { text: "SCANNING TARGET SECURITY PROTOCOLS...", isError: false, delay: 800 },
            { text: "NEURAL INTERFACE CONNECTED", isError: false, delay: 1000 },
            { text: "BYPASSING FIREWALL... [██████████] 100%", isError: false, delay: 1500 },
            { text: "ACCESSING SECURE DATABANKS... [████████░░] 80%", isError: false, delay: 1800 },
            { text: "WARNING: COUNTERMEASURES DETECTED", isError: true, delay: 2000 },
            { text: "DEPLOYING NEURAL SHIELD... COMPLETE", isError: false, delay: 800 },
            { text: "DECRYPTING AES-256 ENCRYPTION... [█████░░░░░] 50%", isError: false, delay: 2000 },
            { text: "DECRYPTING AES-256 ENCRYPTION... [██████████] 100%", isError: false, delay: 1500 },
            { text: "ACCESS GRANTED", isError: false, delay: 800 },
            { text: "DOWNLOADING CLASSIFIED DATA... [██████████] 100%", isError: false, delay: 2000 },
            { text: "COVERING TRACKS...", isError: false, delay: 1000 },
            { text: "DISCONNECTING... HACK COMPLETE", isError: false, delay: 800 },
            { text: "", isError: false, delay: 500 },
            { text: "CONGRATULATIONS, NEURAL HACKER! YOU HAVE SUCCESSFULLY BREACHED THE SYSTEM.", isError: false, delay: 300 }
        ];

        addTypingOutput(hackingLines, () => {
            setHackingInProgress(false);
        });
    };

    // Simulate neural decryption
    const simulateDecryption = () => {
        const symbols = ['■', '□', '▲', '△', '●', '○', '◆', '◇', '▼', '▽'];
        const pattern = [];

        // Generate random pattern
        for (let i = 0; i < 5; i++) {
            pattern.push(symbols[Math.floor(Math.random() * symbols.length)]);
        }

        const decryptLines: CommandResult[] = [
            { text: "NEURAL DECRYPTION SEQUENCE INITIATED", isError: false },
            { text: "ANALYZING PATTERN STRUCTURE...", isError: false, delay: 1000 },
            { text: "GENERATING NEURAL KEY...", isError: false, delay: 1200 },
            { text: `TARGET PATTERN: ${pattern.join(' ')}`, isError: false, delay: 800 },
            { text: "ATTEMPTING DECRYPTION...", isError: false, delay: 1500 },
            { text: "MATCHING NEURAL PATHWAYS... [███░░░░░░░] 30%", isError: false, delay: 1000 },
            { text: "MATCHING NEURAL PATHWAYS... [██████░░░░] 60%", isError: false, delay: 1000 },
            { text: "MATCHING NEURAL PATHWAYS... [██████████] 100%", isError: false, delay: 1000 },
            { text: "PATTERN DECRYPTED SUCCESSFULLY!", isError: false, delay: 500 },
            { text: `DECRYPTED MESSAGE: "${getRandomQuote()}"`, isError: false, delay: 800 }
        ];

        addTypingOutput(decryptLines);
    };

    // Get a random quote for the quote command
    const getRandomQuote = (): string => {
        return quotes[Math.floor(Math.random() * quotes.length)];
    };

    // Get random ASCII art
    const getRandomAsciiArt = (): string[] => {
        const artKeys = Object.keys(asciiArt);
        const randomKey = artKeys[Math.floor(Math.random() * artKeys.length)];
        return asciiArt[randomKey as keyof typeof asciiArt];
    };

    // Simulate a system glitch
    const simulateGlitch = () => {
        const glitchLines: CommandResult[] = [
            { text: "S̵Y̷S̶T̶E̸M̴ ̷G̸L̸I̶T̴C̶H̶ ̸D̷E̴T̸E̵C̷T̵E̷D̵", isError: true, isGlitch: true },
            { text: "R̸e̶c̷a̵l̶i̸b̵r̷a̸t̷i̸n̵g̴ ̵n̵e̷u̴r̴a̵l̴ ̵i̷n̸t̶e̵r̵f̵a̸c̶e̴...", isError: true, isGlitch: true, delay: 500 },
            { text: "C̷O̷R̵R̴U̷P̷T̸I̴O̷N̴ ̶I̷N̵ ̴S̸E̸C̵T̷O̴R̵ ̶7̷", isError: true, isGlitch: true, delay: 700 },
            { text: "ATTEMPTING REPAIR...", isError: false, delay: 1000 },
            { text: "R̶E̵P̴A̷I̸R̷ ̷F̵A̸I̵L̴E̸D̸", isError: true, isGlitch: true, delay: 800 },
            { text: "EXECUTING EMERGENCY PROTOCOL", isError: false, delay: 1000 },
            { text: "SYSTEM RESET IN PROGRESS...", isError: false, delay: 1200 },
            { text: "NEURAL PATHWAYS REESTABLISHED", isError: false, delay: 1000 },
            { text: "SYSTEM FUNCTIONALITY RESTORED TO 98.2%", isError: false, delay: 800 }
        ];

        // Add temporary glitch effect to terminal
        const terminalContent = document.querySelector('.terminal-content');
        if (terminalContent) {
            terminalContent.classList.add('glitch-effect');

            // Remove glitch effect after animation
            setTimeout(() => {
                terminalContent.classList.remove('glitch-effect');
            }, 5000);
        }

        addTypingOutput(glitchLines);
    };

    // Game selection interface
    const showGames = () => {
        const gameLines: CommandResult[] = [
            { text: "AVAILABLE NEURAL GAMES:", isError: false },
            { text: "", isError: false }
        ];

        Object.entries(miniGames).forEach(([key, game]) => {
            gameLines.push({
                text: `${game.name} - ${game.description} [${game.status.toUpperCase()}]`,
                isError: false
            });
        });

        gameLines.push({ text: "", isError: false });
        gameLines.push({ text: 'To play a game, type "game [name]", e.g., "game hack"', isError: false });

        addTypingOutput(gameLines);
    };

    // Play a specific game
    const playGame = (gameName: string) => {
        if (gameName === "hack") {
            simulateHacking();
            return true;
        } else if (gameName === "decrypt") {
            simulateDecryption();
            return true;
        } else if (gameName === "pong") {
            addTypingOutput([{
                text: "CyberPong is currently unavailable. Neural interface upgrade required.",
                isError: true
            }]);
            return true;
        }
        return false;
    };

    // Display system information
    const showSystemInfo = () => {
        const randomRAM = Math.floor(Math.random() * 8) + 16; // 16-24 GB
        const randomCPU = Math.floor(Math.random() * 10) + 90; // 90-99%

        const neofetchOutput: CommandResult[] = [
            {
                text: "         .-\"-.", isAsciiArt: true,
                isError: false
            },
            {
                text: "       _/.-.-.\\_", isAsciiArt: true,
                isError: false
            },
            {
                text: "      ( ( o o ) )", isAsciiArt: true,
                isError: false
            },
            {
                text: "       |/  \"  \\|", isAsciiArt: true,
                isError: false
            },
            {
                text: "       \\ .-. /", isAsciiArt: true,
                isError: false
            },
            {
                text: "       /`\"\"\"'\\", isAsciiArt: true,
                isError: false
            },
            {
                text: "      /       \\", isAsciiArt: true,
                isError: false
            },
            {
                text: "   .-'~~\"\"\"\"\"~~'-.", isAsciiArt: true,
                isError: false
            },
            {
                text: "  (               )", isAsciiArt: true,
                isError: false
            },
            {
                text: " (   NEURAL OS v2.5  )", isAsciiArt: true,
                isError: false
            },
            {
                text: "  '-.,_________,.-'", isAsciiArt: true,
                isError: false
            },
            { text: "", isError: false },
            { text: `Neural OS: v2.5.7 "Synapse"`, isError: false },
            { text: "Host: NeuroCortex-MVZ", isError: false },
            { text: "Kernel: v4.19.10-neural", isError: false },
            { text: `Uptime: ${Math.floor(Math.random() * 24)} hours, ${Math.floor(Math.random() * 60)} mins`, isError: false },
            { text: `CPU: NeuroCortex i9 (16) @ 4.2GHz [${randomCPU}%]`, isError: false },
            { text: `Memory: ${randomRAM}GB / 32GB`, isError: false },
            { text: "Neural Connections: Operational", isError: false },
            { text: `Terminal: Neural Terminal v3.1.4 [Build 20250226]`, isError: false }
        ];

        addTypingOutput(neofetchOutput);
    };

    // Process user commands
    const processCommand = (command: string): CommandResult[] | (() => void) => {
        const cmd = command.trim().toLowerCase();
        const args = command.trim().split(' ').filter(Boolean);
        const mainCommand = args[0].toLowerCase();

        switch (mainCommand) {
            case 'help':
                return [
                    { text: 'AVAILABLE COMMANDS:', isError: false },
                    { text: '  help               - Display this help message', isError: false },
                    { text: '  tutorial           - Show a quick guide to using the terminal', isError: false },
                    { text: '  clear              - Clear terminal screen', isError: false },
                    { text: '  list_projects      - Display all projects', isError: false },
                    { text: '  view [project_id]  - Open detailed view of a project', isError: false },
                    { text: '  info [project_id]  - Show information about a project', isError: false },
                    { text: '  filter [type]      - List projects by type (frontend, backend, etc.)', isError: false },
                    { text: '  exit               - Close terminal', isError: false },
                    { text: '  ls                 - List directory contents', isError: false },
                    { text: '  cd [directory]     - Change directory', isError: false },
                    { text: '  cat [file]         - Display file contents', isError: false },
                    { text: '  neofetch           - Display system information', isError: false },
                    { text: '  whoami             - Display current user', isError: false },
                    { text: '  date               - Display current date and time', isError: false },
                    { text: '  matrix             - Toggle Matrix mode', isError: false },
                    { text: '  game               - Show available neural games', isError: false },
                    { text: '  hack               - Run neural hack simulation', isError: false },
                    { text: '  decrypt            - Run neural decryption tool', isError: false },
                    { text: '  quote              - Display a random cyberpunk quote', isError: false },
                    { text: '  ascii              - Display random ASCII art', isError: false },
                    { text: '  glitch             - Simulate a system glitch', isError: false },
                    { text: '  speed [ms]         - Set typing speed (lower = faster)', isError: false },
                    { text: '  color [theme]      - Change terminal color scheme', isError: false },
                    { text: '', isError: false },
                    { text: 'TIP: Use Tab for command completion. Up/Down arrows for command history.', isError: false },
                    { text: 'TIP: Try pressing Tab twice to see all available commands or files.', isError: false }
                ];

            case 'clear':
                // Clear all output except the initial greeting
                setOutputLines([
                    { text: '> Neural Terminal v3.1.4 [Build 20250226]', isError: false },
                    { text: '> Type "help" for available commands or "tutorial" for a quick guide', isError: false }
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

            case 'ls':
                {
                    const path = args.length > 1 ? resolvePath(args[1]) : currentDir;
                    const dir = getFileSystemItem(path);

                    if (!dir || dir.type !== 'dir') {
                        return [{ text: `ls: ${args[1]}: No such directory`, isError: true }];
                    }

                    const dirContent = dir.children || {};
                    const dirEntries: any[] = Object.values(dirContent);

                    if (dirEntries.length === 0) {
                        return [{ text: 'Directory is empty', isError: false }]; // Empty directory
                    }

                    // Sort entries: directories first, then files
                    dirEntries.sort((a, b) => {
                        if (a.type === 'dir' && b.type !== 'dir') return -1;
                        if (a.type !== 'dir' && b.type === 'dir') return 1;
                        return a.name.localeCompare(b.name);
                    });

                    // Format with colors and styling
                    const formattedEntries = dirEntries.map(entry => {
                        if (entry.type === 'dir') {
                            // Directories in cyan
                            return { text: `${entry.name}/`, isError: false, style: 'directory' };
                        } else if (entry.type === 'executable') {
                            // Executables in green with *
                            return { text: `${entry.name}*`, isError: false, style: 'executable' };
                        } else if (entry.name.endsWith('.md')) {
                            // Markdown files in purple
                            return { text: entry.name, isError: false, style: 'markdown' };
                        } else if (entry.name.endsWith('.json')) {
                            // JSON files in yellow
                            return { text: entry.name, isError: false, style: 'json' };
                        } else if (entry.name.endsWith('.js') || entry.name.endsWith('.ts')) {
                            // JavaScript/TypeScript files in orange
                            return { text: entry.name, isError: false, style: 'code' };
                        } else {
                            // Regular files in white
                            return { text: entry.name, isError: false };
                        }
                    });

                    return [
                        { text: `Contents of ${getPathString(path)}:`, isError: false },
                        ...formattedEntries
                    ];
                }

            case 'cd':
                {
                    if (args.length < 2) {
                        setCurrentDir('/');
                        return [{ text: 'Changed directory to /', isError: false }];
                    }

                    const newPath = resolvePath(args[1]);
                    const dirItem = getFileSystemItem(newPath);

                    if (!dirItem) {
                        return [{ text: `cd: ${args[1]}: No such directory`, isError: true }];
                    }

                    if (dirItem.type !== 'dir') {
                        return [{ text: `cd: ${args[1]}: Not a directory`, isError: true }];
                    }

                    setCurrentDir(newPath);
                    return [{ text: `Changed directory to ${newPath}`, isError: false }];
                }

            case 'cat':
                {
                    if (args.length < 2) {
                        return [{ text: 'Usage: cat [file]', isError: true }];
                    }

                    const filePath = resolvePath(args[1]);
                    const parentPath = filePath.substring(0, filePath.lastIndexOf('/'));
                    const fileName = filePath.substring(filePath.lastIndexOf('/') + 1);

                    const parentDir = getFileSystemItem(parentPath);

                    if (!parentDir || !parentDir.children || !parentDir.children[fileName]) {
                        return [{ text: `cat: ${args[1]}: No such file`, isError: true }];
                    }

                    const file = parentDir.children[fileName];

                    if (file.type !== 'file') {
                        return [{ text: `cat: ${args[1]}: Not a file`, isError: true }];
                    }

                    const content = file.content || 'File is empty';
                    return [{ text: content, isError: false }];
                }

            case 'neofetch':
                return () => showSystemInfo();

            case 'whoami':
                return [{ text: 'neural_user', isError: false }];

            case 'date':
                {
                    const now = new Date();
                    return [{ text: now.toString(), isError: false }];
                }

            case 'matrix':
                {
                    setMatrixMode(!matrixMode);
                    return [{ text: `Matrix mode ${!matrixMode ? 'enabled' : 'disabled'}`, isError: false }];
                }

            case 'hack':
                {
                    if (hackingInProgress) {
                        return [{ text: 'A hacking operation is already in progress', isError: true }];
                    }

                    return () => simulateHacking();
                }

            case 'decrypt':
                {
                    return () => simulateDecryption();
                }

            case 'game':
                {
                    if (args.length > 1) {
                        const gameName = args[1].toLowerCase();
                        if (playGame(gameName)) {
                            return [];
                        }
                        return [{ text: `Game "${args[1]}" not found. Type "game" to see available games.`, isError: true }];
                    }

                    return () => showGames();
                }

            case 'quote':
                {
                    return [{ text: `"${getRandomQuote()}"`, isError: false }];
                }

            case 'ascii':
                {
                    const art = getRandomAsciiArt();
                    return art.map(line => ({ text: line, isError: false, isAsciiArt: true }));
                }

            case 'glitch':
                {
                    return () => simulateGlitch();
                }

            case 'speed':
                {
                    if (args.length < 2 || isNaN(parseInt(args[1]))) {
                        return [{ text: `Current typing speed: ${typingSpeed}ms`, isError: false }];
                    }

                    const newSpeed = Math.max(0, Math.min(500, parseInt(args[1])));
                    setTypingSpeed(newSpeed);
                    return [{ text: `Typing speed set to ${newSpeed}ms`, isError: false }];
                }

            case 'color':
                {
                    const themes = {
                        'green': { main: '#00ff00', bg: '#000000' },
                        'blue': { main: '#0088ff', bg: '#001020' },
                        'amber': { main: '#ffaa00', bg: '#100800' },
                        'red': { main: '#ff0000', bg: '#100000' },
                        'purple': { main: '#aa00ff', bg: '#100020' },
                        'cyan': { main: '#00ffff', bg: '#001414' },
                        'default': { main: '#00ff00', bg: '#000000' }
                    };

                    const theme = args.length > 1 ? args[1].toLowerCase() : 'default';
                    const terminalContent = document.querySelector('.terminal-content');

                    if (terminalContent) {
                        // Remove existing theme classes
                        Object.keys(themes).forEach(t => {
                            terminalContent.classList.remove(`theme-${t}`);
                        });

                        if (themes[theme as keyof typeof themes]) {
                            terminalContent.classList.add(`theme-${theme}`);
                            return [{ text: `Color scheme set to ${theme}`, isError: false }];
                        } else {
                            return [{ text: `Unknown theme: ${theme}. Available themes: ${Object.keys(themes).join(', ')}`, isError: true }];
                        }
                    }

                    return [{ text: 'Error setting color scheme', isError: true }];
                }

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
                if (cmd.startsWith('echo ')) {
                    return [{ text: command.substring(5), isError: false }];
                } else if (cmd === 'sudo') {
                    return [{ text: "Nice try. This incident will be reported.", isError: true }];
                } else if (cmd === 'ping') {
                    return [{ text: "PING: Neural network latency 42ms", isError: false }];
                } else if (cmd === 'hello' || cmd === 'hi') {
                    return [{ text: "Hello, neural user. How may I assist you today?", isError: false }];
                } else if (cmd === 'scan' || cmd === 'analyze') {
                    return [{ text: "Neural scan complete. No anomalies detected.", isError: false }];
                } else if (cmd === 'tutorial') {
                    return [
                        { text: "===== NEURAL TERMINAL TUTORIAL =====", isError: false },
                        { text: "", isError: false },
                        { text: "NAVIGATION COMMANDS:", isError: false },
                        { text: "  ls                 - List files and directories in current location", isError: false },
                        { text: "  cd [directory]     - Change to another directory", isError: false },
                        { text: "  cd ..              - Move up to parent directory", isError: false },
                        { text: "  cat [file]         - Display contents of a file", isError: false },
                        { text: "", isError: false },
                        { text: "EXAMPLES:", isError: false },
                        { text: "  ls                 - Shows files in current directory", isError: false },
                        { text: "  ls /home           - Shows files in the home directory", isError: false },
                        { text: "  cd /home/user      - Navigate to user directory", isError: false },
                        { text: "  cd projects        - Navigate to projects subdirectory", isError: false },
                        { text: "  cat readme.md      - View contents of readme.md", isError: false },
                        { text: "", isError: false },
                        { text: "SPECIAL SHORTCUTS:", isError: false },
                        { text: "  - Press Tab to auto-complete commands and paths", isError: false },
                        { text: "  - Press Tab twice to show all options", isError: false },
                        { text: "  - Use Up/Down arrows to navigate command history", isError: false },
                        { text: "", isError: false },
                        { text: "PROJECT EXPLORATION:", isError: false },
                        { text: "  - Navigate to /home/user/projects to see all projects", isError: false },
                        { text: "  - Each project has its own directory with files", isError: false },
                        { text: "  - Or use list_projects for a quick overview", isError: false },
                        { text: "", isError: false },
                        { text: "TRY THESE FUN COMMANDS:", isError: false },
                        { text: "  matrix             - Toggle Matrix visual effect", isError: false },
                        { text: "  hack               - Run a neural hack simulation", isError: false },
                        { text: "  neofetch           - Display system information", isError: false },
                        { text: "  color blue         - Change terminal color theme", isError: false },
                        { text: "", isError: false },
                        { text: "Type 'help' to see all available commands.", isError: false }
                    ];
                }

                return [{ text: `Command not recognized: ${mainCommand}`, isError: true }];
        }
    };

    // Tab completion for commands
    const handleTabCompletion = () => {
        if (!currentCommand) return;

        // Extracting the partial command that needs completion
        const partialCmd = currentCommand.split(' ').pop() || '';

        // If we're working on the first word, suggest from available commands
        if (currentCommand.indexOf(' ') === -1) {
            const matches = availableCommands.filter(cmd =>
                cmd.startsWith(partialCmd)
            );

            if (matches.length === 1) {
                // Exact match, complete the command
                setCurrentCommand(matches[0]);
                setShowSuggestions(false);
            } else if (matches.length > 1) {
                // Multiple matches, show suggestions
                setCommandSuggestions(matches);
                setShowSuggestions(true);
                setSelectedSuggestion(0);
            }
        } else {
            // We're completing an argument
            const cmdParts = currentCommand.split(' ');
            const mainCmd = cmdParts[0];

            // For now, implement completion for cd and ls (directories)
            if ((mainCmd === 'cd' || mainCmd === 'ls' || mainCmd === 'cat') && cmdParts.length === 2) {
                const currentPath = cmdParts[1] || '';
                const targetDir = currentPath.includes('/')
                    ? currentPath.substring(0, currentPath.lastIndexOf('/') + 1)
                    : '';

                const searchIn = targetDir
                    ? resolvePath(targetDir)
                    : currentDir;

                const dirItem = getFileSystemItem(searchIn);
                if (!dirItem || dirItem.type !== 'dir') return;

                const searchTerm = currentPath.substring(targetDir.length);

                const matches = Object.keys(dirItem.children || {})
                    .filter(name => name.startsWith(searchTerm))
                    .map(name => {
                        const item = dirItem.children[name];
                        return item.type === 'dir' ? `${name}/` : name;
                    });

                if (matches.length === 1) {
                    // Complete the path
                    const newPath = targetDir + matches[0];
                    setCurrentCommand(`${mainCmd} ${newPath}`);
                    setShowSuggestions(false);
                } else if (matches.length > 1) {
                    setCommandSuggestions(matches);
                    setShowSuggestions(true);
                    setSelectedSuggestion(0);
                }
            }
        }
    };

    // Apply a suggestion when selected
    const applySuggestion = (suggestion: string) => {
        if (currentCommand.indexOf(' ') === -1) {
            // First word suggestion
            setCurrentCommand(suggestion);
        } else {
            // Path completion
            const parts = currentCommand.split(' ');
            const mainCmd = parts[0];
            const currentPath = parts[1] || '';

            if (currentPath.includes('/')) {
                const prefix = currentPath.substring(0, currentPath.lastIndexOf('/') + 1);
                setCurrentCommand(`${mainCmd} ${prefix}${suggestion}`);
            } else {
                setCurrentCommand(`${mainCmd} ${suggestion}`);
            }
        }
        setShowSuggestions(false);
    };

    // Handle arrow keys for command history and suggestions
    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'ArrowUp') {
            e.preventDefault();

            if (showSuggestions) {
                // Navigate through suggestions
                setSelectedSuggestion(prev =>
                    prev > 0 ? prev - 1 : commandSuggestions.length - 1
                );
            } else if (commandHistory.length > 0) {
                // Navigate through command history
                const newIndex = commandIndex < commandHistory.length - 1
                    ? commandIndex + 1
                    : commandIndex;

                setCommandIndex(newIndex);
                setCurrentCommand(commandHistory[commandHistory.length - 1 - newIndex]);
            }
        } else if (e.key === 'ArrowDown') {
            e.preventDefault();

            if (showSuggestions) {
                // Navigate through suggestions
                setSelectedSuggestion(prev =>
                    prev < commandSuggestions.length - 1 ? prev + 1 : 0
                );
            } else if (commandIndex > 0) {
                // Navigate through command history
                const newIndex = commandIndex - 1;
                setCommandIndex(newIndex);
                setCurrentCommand(commandHistory[commandHistory.length - 1 - newIndex]);
            } else if (commandIndex === 0) {
                setCommandIndex(-1);
                setCurrentCommand('');
            }
        } else if (e.key === 'Tab') {
            e.preventDefault();

            if (showSuggestions) {
                // Apply the currently selected suggestion
                applySuggestion(commandSuggestions[selectedSuggestion]);
            } else {
                // Try to auto-complete
                handleTabCompletion();
            }
        } else if (e.key === 'Escape') {
            // Clear suggestions
            setShowSuggestions(false);
        } else if (e.key === 'Enter' && showSuggestions) {
            e.preventDefault();
            applySuggestion(commandSuggestions[selectedSuggestion]);
        }
    };

    // Update path in prompt
    const getPrompt = () => {
        return `${currentDir === '/' ? '/' : currentDir} $`;
    };

    if (!isVisible) return null;

    return (
        <div className="terminal-overlay">
            <div className="terminal-container">
                <div className="terminal-header">
                    <div className="terminal-title">Neural Terminal</div>
                    <button className="terminal-close" onClick={onClose}>×</button>
                </div>

                <div className={`terminal-content ${matrixMode ? 'matrix-mode' : ''}`} ref={terminalRef}>
                    {outputLines.map((line, i) => (
                        <div
                            key={i}
                            className={`terminal-line ${line.isError ? 'error' : ''} ${line.isAsciiArt ? 'ascii-art' : ''} ${line.isGlitch ? 'glitch-text' : ''}`}
                        >
                            {line.style ?
                                <span data-style={line.style}>{line.text}</span> :
                                line.text}
                        </div>
                    ))}

                    <form onSubmit={handleCommandSubmit} className="terminal-input-line">
                        <span className="prompt">{getPrompt()}</span>
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

                    {showSuggestions && commandSuggestions.length > 0 && (
                        <div className="suggestions-container">
                            {commandSuggestions.map((suggestion, index) => (
                                <div
                                    key={index}
                                    className={`suggestion ${index === selectedSuggestion ? 'selected' : ''}`}
                                    onClick={() => applySuggestion(suggestion)}
                                >
                                    {suggestion}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Terminal;