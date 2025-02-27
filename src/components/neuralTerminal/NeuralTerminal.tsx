/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useRef, useEffect } from 'react';
import './NeuralTerminal.css';
import { Project } from '../../types/Project';

interface NeuralTerminalProps {
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
    style?:
    | 'directory'
    | 'executable'
    | 'markdown'
    | 'json'
    | 'code'
    | string;
}

interface Message {
    sender: 'user' | 'ai';
    text: string;
    timestamp: Date;
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
                    config: {
                        name: "config",
                        type: "file",
                        content: "SYSTEM CONFIGURATION: CLASSIFIED"
                    },
                    hosts: {
                        name: "hosts",
                        type: "file",
                        content:
                            "127.0.0.1 localhost\n192.168.1.1 neural-hub\n10.0.0.5 central-nexus"
                    }
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
                            notes: {
                                name: "notes.txt",
                                type: "file",
                                content:
                                    "Remember to update portfolio with latest neural enhancement projects."
                            },
                            projects: { name: "projects", type: "dir", children: {} }
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
                            system: {
                                name: "system.log",
                                type: "file",
                                content:
                                    "Neural interface initialized.\nBiometric authentication successful.\nNeurocortex link established."
                            }
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
                                name: "docs",
                                type: "dir",
                                children: {
                                    readme: {
                                        name: "readme.md",
                                        type: "file",
                                        content:
                                            "# Neural Interface Documentation\n\nWelcome to the neural interface system. This documentation provides information on system functionality and available commands."
                                    }
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
        status: "unavailable"
    }
};

const NeuralTerminal: React.FC<NeuralTerminalProps> = ({
    projects,
    isVisible,
    onClose,
    onProjectSelect
}) => {
    // Terminal state
    const [commandHistory, setCommandHistory] = useState<string[]>([]);
    const [commandIndex, setCommandIndex] = useState(-1);
    const [currentCommand, setCurrentCommand] = useState('');
    const [outputLines, setOutputLines] = useState<CommandResult[]>([
        { text: '', isError: false },
        { text: asciiArt.logo[0], isAsciiArt: true, isError: false },
        { text: asciiArt.logo[1], isAsciiArt: true, isError: false },
        { text: asciiArt.logo[2], isAsciiArt: true, isError: false },
        { text: asciiArt.logo[3], isAsciiArt: true, isError: false },
        { text: asciiArt.logo[4], isAsciiArt: true, isError: false },
        { text: asciiArt.logo[5], isAsciiArt: true, isError: false },
        {
            text: '====================== NEURAL TERMINAL v3.1.4 =======================',
            isError: false
        },
        { text: '', isError: false },
        {
            text: '> Neural interface initialized. Biometric authentication successful.',
            isError: false
        },
        { text: '> Welcome to the Neural Terminal. Type "tutorial" for a quick guide.', isError: false },
        { text: '> Type "help" for available commands or "chat" to use AI assistant mode.', isError: false },
        { text: '', isError: false },
        { text: '>', isError: false }
    ]);
    const [currentDir, setCurrentDir] = useState("/");
    const [hackingInProgress, setHackingInProgress] = useState(false);
    const [matrixMode, setMatrixMode] = useState(false);
    const [typingSpeed, setTypingSpeed] = useState(50); // ms per character
    const [commandSuggestions, setCommandSuggestions] = useState<string[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [selectedSuggestion, setSelectedSuggestion] = useState(0);

    // AI Assistant state
    const [messages, setMessages] = useState<Message[]>([]);
    const [aiInputValue, setAiInputValue] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [activeMode, setActiveMode] = useState<'terminal' | 'assistant'>('terminal');

    const terminalRef = useRef<HTMLDivElement>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const aiInputRef = useRef<HTMLInputElement>(null);
    const fileSystemRef = useRef(JSON.parse(JSON.stringify(fileSystem))); // deep copy

    // All possible terminal commands (for suggestions)
    const availableCommands = [
        "help", "clear", "list_projects", "view", "info", "filter", "exit",
        "about", "ls", "cd", "cat", "echo", "date", "whoami", "neofetch",
        "matrix", "hack", "decrypt", "analyze", "scan", "ping", "game",
        "quote", "ascii", "color", "speed", "glitch", "chat", "terminal",
        "tutorial", "access_hyperspace"
    ];

    // 1) Initialize projects into file system
    useEffect(() => {
        const projectsDir = fileSystemRef.current.root
            .children.home.children.user.children.projects.children;

        // Add extra tutorials folder
        fileSystemRef.current.root.children.home.children.user.children.tutorials = {
            name: "tutorials",
            type: "dir",
            children: {
                basics: {
                    name: "basics.txt",
                    type: "file",
                    content:
                        "TERMINAL BASICS:\n\n1. ls - List files and directories\n2. cd [dir] - Change directory\n3. cat [file] - Display file contents\n\nTips:\n- Use Tab for auto-completion\n- Use up/down arrows for command history"
                },
                navigation: {
                    name: "navigation.txt",
                    type: "file",
                    content:
                        "NAVIGATION GUIDE:\n\n- cd / - Go to root directory\n- cd .. - Go up one directory\n- cd ~ or cd /home/user - Go to home directory\n- ls -la - Show hidden files\n- cd /home/user/projects - Browse all projects"
                },
                commands: {
                    name: "commands.txt",
                    type: "file",
                    content:
                        "FUN COMMANDS:\n\n- matrix - Toggle Matrix mode visual effect\n- hack - Run hacking simulation\n- game - Show available games\n- decrypt - Run decryption tool\n- neofetch - Show system information\n- color [theme] - Change terminal colors"
                },
                welcome: {
                    name: "welcome.txt",
                    type: "file",
                    content:
                        "WELCOME TO THE NEURAL TERMINAL!\n\nThis terminal provides an interactive way to explore this portfolio.\n\nUse 'ls' and 'cd' to navigate through projects or use the portfolio-specific commands like 'list_projects' and 'view [project_id]' to explore directly.\n\nType 'help' for all available commands or 'tutorial' for a quick guide."
                }
            }
        };

        // Add a quickstart file
        fileSystemRef.current.root.children.home.children.user.children.quickstart = {
            name: "quickstart.txt",
            type: "file",
            content:
                "QUICK START GUIDE\n\nWelcome to the Neural Terminal interface!\n\nTry these commands:\n1. cd /home/user/projects\n2. ls\n3. cd [project_name]\n4. cat readme.md\n\nOr use these shortcuts:\n- list_projects - Show all available projects\n- view [project_id] - View a specific project\n- info [project_id] - Get project information"
        };

        // Populate each project in the /home/user/projects directory
        projects.forEach((project) => {
            projectsDir[project.id] = {
                name: project.id,
                type: "dir",
                children: {
                    readme: {
                        name: "readme.md",
                        type: "file",
                        content: `# ${project.title}\n\n${project.description}\n\nTechnologies: ${project.technologies.join(
                            ", "
                        )}`
                    },
                    config: {
                        name: "config.json",
                        type: "file",
                        content: JSON.stringify(
                            {
                                id: project.id,
                                title: project.title,
                                type: project.type,
                                status: project.status || "COMPLETED"
                            },
                            null,
                            2
                        )
                    }
                }
            };

            if (project.codeSnippet) {
                projectsDir[project.id].children.demo = {
                    name: "demo.js",
                    type: "file",
                    content: project.codeSnippet
                };
            }
        });
    }, [projects]);

    // 2) Show initial AI greeting after mount
    useEffect(() => {
        setTimeout(() => {
            addMessage('ai', 'NEURAL INTERFACE ACTIVATED. HOW CAN I ASSIST YOU TODAY?');
        }, 1000);
    }, []);

    // 3) Scroll to bottom for terminal or AI chat
    useEffect(() => {
        if (activeMode === 'terminal' && terminalRef.current) {
            terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
        } else if (activeMode === 'assistant' && messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [outputLines, messages, activeMode]);

    // 4) Handle global key shortcuts (ESC, Ctrl+L)
    useEffect(() => {
        const handleWindowKeyDown = (e: KeyboardEvent) => {
            if (!isVisible) return;

            // ESC to close
            if (e.key === 'Escape') {
                onClose();
            }

            // Ctrl+L to clear screen in terminal mode
            if (e.ctrlKey && e.key === 'l' && activeMode === 'terminal') {
                e.preventDefault();
                setOutputLines([
                    { text: '> Neural Terminal v3.1.4 [Build 20250226]', isError: false },
                    {
                        text: '> Type "help" for available commands or "tutorial" for a quick guide',
                        isError: false
                    }
                ]);
            }
        };

        window.addEventListener('keydown', handleWindowKeyDown);
        return () => {
            window.removeEventListener('keydown', handleWindowKeyDown);
        };
    }, [isVisible, onClose, activeMode]);

    // 5) Simulated typed lines
    const addTypingOutput = (lines: CommandResult[], callback?: () => void) => {
        if (lines.length === 0) {
            callback?.();
            return;
        }
        // Add first line immediately
        setOutputLines((prev) => [...prev, lines[0]]);

        // Then schedule the rest
        if (lines.length > 1) {
            let currentIndex = 1;
            const addNextLine = () => {
                if (currentIndex >= lines.length) {
                    callback?.();
                    return;
                }
                const line = lines[currentIndex];
                const delay = line.delay || (line.isAsciiArt ? 10 : typingSpeed);
                setTimeout(() => {
                    setOutputLines((prev) => [...prev, line]);
                    currentIndex++;
                    addNextLine();
                }, delay);
            };
            addNextLine();
        } else {
            callback?.();
        }
    };

    // 6) AI chat: add a message
    const addMessage = (sender: 'user' | 'ai', text: string) => {
        setMessages((prev) => [
            ...prev,
            { sender, text, timestamp: new Date() }
        ]);
    };

    // 7) If Matrix mode changes, toggle a CSS class
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

    // 8) Hack simulation
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
            {
                text: "CONGRATULATIONS, NEURAL HACKER! YOU HAVE SUCCESSFULLY BREACHED THE SYSTEM.",
                isError: false,
                delay: 300
            }
        ];
        addTypingOutput(hackingLines, () => setHackingInProgress(false));
    };

    // 9) Decryption simulation
    const getRandomQuote = (): string => {
        return quotes[Math.floor(Math.random() * quotes.length)];
    };

    const simulateDecryption = () => {
        const symbols = ['■', '□', '▲', '△', '●', '○', '◆', '◇', '▼', '▽'];
        const pattern = [];
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

    // 10) Show available mini-games
    const showGames = () => {
        const gameLines: CommandResult[] = [
            { text: "AVAILABLE NEURAL GAMES:", isError: false },
            { text: "", isError: false }
        ];
        Object.values(miniGames).forEach((game) => {
            gameLines.push({
                text: `${game.name} - ${game.description} [${game.status.toUpperCase()}]`,
                isError: false
            });
        });
        gameLines.push({ text: "", isError: false });
        gameLines.push({
            text: 'To play a game, type "game [name]", e.g., "game hack"',
            isError: false
        });

        addTypingOutput(gameLines);
    };

    // 11) Play game by name
    const playGame = (gameName: string) => {
        if (gameName === "hack") {
            simulateHacking();
            return true;
        } else if (gameName === "decrypt") {
            simulateDecryption();
            return true;
        } else if (gameName === "pong") {
            addTypingOutput([
                {
                    text: "CyberPong is currently unavailable. Neural interface upgrade required.",
                    isError: true
                }
            ]);
            return true;
        }
        return false;
    };

    // 12) System info (neofetch)
    const showSystemInfo = () => {
        const randomRAM = Math.floor(Math.random() * 8) + 16; // 16-24 GB
        const randomCPU = Math.floor(Math.random() * 10) + 90; // 90-99%
        const neofetchOutput: CommandResult[] = [
            { text: "         .-\"-.", isAsciiArt: true, isError: false },
            { text: "       _/.-.-.\\_", isAsciiArt: true, isError: false },
            { text: "      ( ( o o ) )", isAsciiArt: true, isError: false },
            { text: "       |/  \"  \\|", isAsciiArt: true, isError: false },
            { text: "       \\ .-. /", isAsciiArt: true, isError: false },
            { text: "       /`\"\"\"'\\", isAsciiArt: true, isError: false },
            { text: "      /       \\", isAsciiArt: true, isError: false },
            { text: "   .-'~~\"\"\"\"\"~~'-.", isAsciiArt: true, isError: false },
            { text: "  (               )", isAsciiArt: true, isError: false },
            { text: " (   NEURAL OS v2.5  )", isAsciiArt: true, isError: false },
            { text: "  '-.,_________,.-'", isAsciiArt: true, isError: false },
            { text: "", isError: false },
            { text: `Neural OS: v2.5.7 "Synapse"`, isError: false },
            { text: "Host: NeuroCortex-MVZ", isError: false },
            { text: "Kernel: v4.19.10-neural", isError: false },
            {
                text: `Uptime: ${Math.floor(Math.random() * 24)} hours, ${Math.floor(
                    Math.random() * 60
                )} mins`,
                isError: false
            },
            { text: `CPU: NeuroCortex i9 (16) @ 4.2GHz [${randomCPU}%]`, isError: false },
            { text: `Memory: ${randomRAM}GB / 32GB`, isError: false },
            { text: "Neural Connections: Operational", isError: false },
            { text: `Terminal: Neural Terminal v3.1.4 [Build 20250226]`, isError: false }
        ];

        addTypingOutput(neofetchOutput);
    };

    // 13) System glitch
    const simulateGlitch = () => {
        const glitchLines: CommandResult[] = [
            {
                text: "S̵Y̷S̶T̶E̸M̴ ̷G̸L̸I̶T̴C̶H̶ ̸D̷E̴T̸E̵C̷T̵E̷D̵",
                isError: true,
                isGlitch: true
            },
            {
                text: "R̸e̶c̷a̵l̶i̸b̵r̷a̸t̷i̸n̵g̴ ̵n̵e̷u̴r̴a̵l̴ ̵i̷n̸t̶e̵r̵f̵a̸c̶e̴...",
                isError: true,
                isGlitch: true,
                delay: 500
            },
            {
                text: "C̷O̷R̵R̴U̷P̷T̸I̴O̷N̴ ̶I̷N̵ ̴S̸E̸C̵T̷O̴R̵ ̶7̷",
                isError: true,
                isGlitch: true,
                delay: 700
            },
            { text: "ATTEMPTING REPAIR...", isError: false, delay: 1000 },
            {
                text: "R̶E̵P̴A̷I̸R̷ ̷F̵A̸I̵L̴E̸D̸",
                isError: true,
                isGlitch: true,
                delay: 800
            },
            { text: "EXECUTING EMERGENCY PROTOCOL", isError: false, delay: 1000 },
            { text: "SYSTEM RESET IN PROGRESS...", isError: false, delay: 1200 },
            { text: "NEURAL PATHWAYS REESTABLISHED", isError: false, delay: 1000 },
            {
                text: "SYSTEM FUNCTIONALITY RESTORED TO 98.2%",
                isError: false,
                delay: 800
            }
        ];

        const terminalContent = document.querySelector('.terminal-content');
        if (terminalContent) {
            terminalContent.classList.add('glitch-effect');
            setTimeout(() => {
                terminalContent.classList.remove('glitch-effect');
            }, 5000);
        }

        addTypingOutput(glitchLines);
    };

    // 14) AI assistant text parsing
    const processUserInput = (input: string) => {
        const normalizedInput = input.toLowerCase();
        // Switch back to terminal
        if (
            normalizedInput === 'terminal' ||
            normalizedInput === 'switch to terminal' ||
            normalizedInput === 'command mode'
        ) {
            setActiveMode('terminal');
            addMessage('ai', 'SWITCHING TO TERMINAL MODE. TYPE "CHAT" TO RETURN TO AI ASSISTANT.');
            // Also inform the terminal
            addTypingOutput([
                {
                    text: "Switching to terminal mode. AI Assistant is accessible via 'chat' command.",
                    isError: false
                }
            ]);
            setTimeout(() => {
                inputRef.current?.focus();
            }, 100);
            return;
        }

        // Example AI commands or small talk
        if (normalizedInput.includes('help')) {
            addMessage('ai', `AVAILABLE COMMANDS:
- SHOW ALL PROJECTS
- SHOW [TYPE] PROJECTS (e.g., "SHOW FRONTEND PROJECTS")
- ABOUT AI GUIDE
- PROJECT DETAILS [PROJECT NAME]
- HELP
- TERMINAL (switch to terminal mode)`);
            return;
        }

        if (normalizedInput.includes('project')) {
            // Show all
            if (normalizedInput.includes('all') || normalizedInput.includes('list')) {
                const list = projects
                    .map((p) => `- ${p.title} (${p.type.toUpperCase()})`)
                    .join('\n');
                addMessage(
                    'ai',
                    `ACCESSING PROJECT DATABASE...\n\nAVAILABLE PROJECTS:\n${list}\n\n(Mention a specific project for details.)`
                );
                return;
            }
            // Filter by type
            const projectTypes = ['frontend', 'backend', 'fullstack', 'mobile', 'ai'];
            for (const type of projectTypes) {
                if (normalizedInput.includes(type)) {
                    const filtered = projects.filter((p) => p.type === type);
                    if (filtered.length === 0) {
                        addMessage('ai', `NO ${type.toUpperCase()} PROJECTS FOUND.`);
                        return;
                    }
                    const flist = filtered.map((p) => `- ${p.title}`).join('\n');
                    addMessage(
                        'ai',
                        `FOUND ${type.toUpperCase()} PROJECTS:\n${flist}\n\n(Mention a specific project for details.)`
                    );
                    return;
                }
            }
            // Check for a single project by matching part of its title
            for (const p of projects) {
                if (normalizedInput.includes(p.title.toLowerCase())) {
                    showProjectDetails(p);
                    return;
                }
            }
            addMessage('ai', 'WHICH PROJECT TYPE OR NAME INTERESTS YOU? (FRONTEND/BACKEND, ETC.)');
            return;
        }

        if (
            normalizedInput.includes('hello') ||
            normalizedInput.includes('hi') ||
            normalizedInput.includes('hey') ||
            normalizedInput.includes('greetings')
        ) {
            addMessage('ai', 'GREETINGS, USER. HOW MAY I ASSIST YOU TODAY?');
            return;
        }

        if (normalizedInput.includes('about')) {
            addMessage('ai', 'I AM AN AI GUIDE FOR THIS NEURAL PORTFOLIO, HERE TO ASSIST YOU.');
            return;
        }

        if (normalizedInput.includes('thank')) {
            addMessage('ai', 'YOU ARE WELCOME. I AM ALWAYS HERE TO HELP.');
            return;
        }

        // Default fallback
        addMessage(
            'ai',
            'COMMAND NOT RECOGNIZED. TYPE "HELP" OR ASK ABOUT "PROJECTS".'
        );
    };

    // 15) AI helper: show project details
    const showProjectDetails = (project: Project) => {
        addMessage(
            'ai',
            `PROJECT DETAILS: ${project.title.toUpperCase()}

DESCRIPTION: ${project.description.substring(0, 80)}...
TYPE: ${project.type.toUpperCase()}
TECHNOLOGIES: ${project.technologies.join(', ')}
STATUS: ${project.status || 'COMPLETED'}

WOULD YOU LIKE TO VIEW THIS PROJECT IN THE NEURAL INTERFACE? (YES/NO)`
        );

        // Minimal example "listen" approach
        const currentLength = messages.length;
        const checker = setInterval(() => {
            if (messages.length > currentLength) {
                const userMsg = messages[messages.length - 1].text.toLowerCase();
                if (userMsg.includes('yes')) {
                    addMessage('ai', 'LOADING PROJECT...');
                    setTimeout(() => {
                        onProjectSelect(project);
                        addMessage('ai', 'PROJECT LOADED IN NEURAL INTERFACE.');
                    }, 1000);
                }
                clearInterval(checker);
            }
        }, 600);

        setTimeout(() => clearInterval(checker), 30000); // fail-safe
    };

    // 16) File system helpers
    const getPathString = (path: string): string => {
        if (path === "/") return "/";
        return path.endsWith("/") ? path : path + "/";
    };

    const getFileSystemItem = (path: string) => {
        if (path === "/" || path === "") return fileSystemRef.current.root;
        const parts = path.split('/').filter(Boolean);
        let current = fileSystemRef.current.root;
        for (const part of parts) {
            if (!current.children || !current.children[part]) {
                return null;
            }
            current = current.children[part];
        }
        return current;
    };

    const resolvePath = (path: string): string => {
        if (path.startsWith('/')) return path;
        if (path === '.') return currentDir;
        if (path === '..') {
            if (currentDir === '/') return '/';
            const parts = currentDir.split('/').filter(Boolean);
            parts.pop();
            return '/' + parts.join('/');
        }
        return currentDir === '/' ? `/${path}` : `${currentDir}/${path}`;
    };

    // 17) The main command processor
    const processCommand = (command: string): CommandResult[] | (() => void) => {
        const cmd = command.trim().toLowerCase();
        const args = command.trim().split(' ').filter(Boolean);
        const mainCommand = args[0];

        switch (mainCommand) {
            case 'help':
                return [
                    { text: 'AVAILABLE COMMANDS:', isError: false },
                    { text: '  help               - Display help info', isError: false },
                    { text: '  tutorial           - Quick usage guide', isError: false },
                    { text: '  clear              - Clear terminal screen', isError: false },
                    { text: '  list_projects      - Display all projects', isError: false },
                    { text: '  view [project_id]  - Open project in portfolio view', isError: false },
                    { text: '  info [project_id]  - Show project info in terminal', isError: false },
                    { text: '  filter [type]      - e.g. filter frontend', isError: false },
                    { text: '  exit               - Close the terminal', isError: false },
                    { text: '  about              - About the neural terminal', isError: false },
                    { text: '  ls, cd, cat        - File system commands', isError: false },
                    { text: '  neofetch           - Show system info', isError: false },
                    { text: '  whoami             - Show current user', isError: false },
                    { text: '  date               - Show date/time', isError: false },
                    { text: '  matrix             - Toggle Matrix mode', isError: false },
                    { text: '  hack               - Hacking simulation', isError: false },
                    { text: '  decrypt            - Decryption simulation', isError: false },
                    { text: '  quote              - Random cyberpunk quote', isError: false },
                    { text: '  ascii              - Random ASCII art', isError: false },
                    { text: '  glitch             - Simulate system glitch', isError: false },
                    { text: '  speed [ms]         - Adjust typing speed', isError: false },
                    { text: '  color [theme]      - Change color theme', isError: false },
                    { text: '  game [name]        - Mini-games', isError: false },
                    { text: '  chat               - Switch to AI assistant', isError: false },
                    { text: '', isError: false },
                    {
                        text: 'TIP: Use Tab for completion, Up/Down for history.',
                        isError: false
                    }
                ];

            case 'tutorial':
                return [
                    { text: "===== NEURAL TERMINAL TUTORIAL =====", isError: false },
                    { text: "", isError: false },
                    {
                        text: "1) Use 'ls', 'cd', 'cat' to navigate and read files.",
                        isError: false
                    },
                    {
                        text: "2) 'list_projects' or 'filter [type]' to see portfolio projects.",
                        isError: false
                    },
                    {
                        text: "3) 'view [id]' to open a specific project interface.",
                        isError: false
                    },
                    {
                        text: "4) 'help' to see more commands. 'chat' to talk to AI assistant.",
                        isError: false
                    },
                    { text: "", isError: false },
                    { text: "Enjoy exploring!", isError: false }
                ];

            case 'clear':
                setOutputLines([
                    { text: '> Neural Terminal v3.1.4 [Build 20250226]', isError: false },
                    {
                        text: '> Type "help" for available commands or "tutorial" for a quick guide',
                        isError: false
                    }
                ]);
                return [];

            case 'list_projects':
                return [
                    { text: 'AVAILABLE PROJECTS:', isError: false },
                    ...projects.map((p) => ({
                        text: `  ${p.id} - ${p.title} (${p.type.toUpperCase()})`,
                        isError: false
                    }))
                ];

            case 'view': {
                if (args.length < 2) {
                    return [{
                        text: 'ERROR: Missing project ID. Usage: view [project_id]',
                        isError: true
                    }];
                }
                const projectToView = projects.find((p) => p.id === args[1]);
                if (!projectToView) {
                    return [{
                        text: `ERROR: Project "${args[1]}" not found.`,
                        isError: true
                    }];
                }
                onProjectSelect(projectToView);
                return [{
                    text: `Launching neural interface for project: ${projectToView.title}`,
                    isError: false
                }];
            }

            case 'info': {
                if (args.length < 2) {
                    return [{ text: 'ERROR: Missing project ID. Usage: info [project_id]', isError: true }];
                }
                const projectInfo = projects.find((p) => p.id === args[1]);
                if (!projectInfo) {
                    return [{
                        text: `ERROR: Project "${args[1]}" not found.`,
                        isError: true
                    }];
                }
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
            }

            case 'filter': {
                if (args.length < 2) {
                    return [{ text: 'ERROR: Missing type. Usage: filter [type]', isError: true }];
                }
                const validTypes = ['frontend', 'backend', 'fullstack', 'mobile', 'ai'];
                const type = args[1].toLowerCase();
                if (!validTypes.includes(type)) {
                    return [{
                        text: `ERROR: Invalid type. Valid: ${validTypes.join(', ')}`,
                        isError: true
                    }];
                }
                const filtered = projects.filter((p) => p.type === type);
                if (filtered.length === 0) {
                    return [{ text: `No projects found with type: ${type}`, isError: false }];
                }
                return [
                    { text: `PROJECTS (TYPE: ${type.toUpperCase()}):`, isError: false },
                    ...filtered.map((p) => ({ text: `  ${p.id} - ${p.title}`, isError: false }))
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
                    { text: 'Purpose: Secure neural portfolio interface', isError: false },
                    { text: 'Status: ACTIVE', isError: false },
                    { text: 'Security Level: EPSILON', isError: false }
                ];

            case 'ls': {
                const path = args.length > 1 ? resolvePath(args[1]) : currentDir;
                const dir = getFileSystemItem(path);
                if (!dir || dir.type !== 'dir') {
                    return [{ text: `ls: ${args[1]}: No such directory`, isError: true }];
                }
                const children = dir.children || {};
                const entries = Object.values(children);
                if (entries.length === 0) {
                    return [{ text: 'Directory is empty', isError: false }];
                }
                entries.sort((a: any, b: any) => {
                    if (a.type === 'dir' && b.type !== 'dir') return -1;
                    if (a.type !== 'dir' && b.type === 'dir') return 1;
                    return a.name.localeCompare(b.name);
                });
                const formatted = entries.map((entry: any) => {
                    if (entry.type === 'dir') {
                        return { text: `${entry.name}/`, isError: false, style: 'directory' };
                    } else if (entry.type === 'executable') {
                        return { text: `${entry.name}*`, isError: false, style: 'executable' };
                    } else if (entry.name.endsWith('.md')) {
                        return { text: entry.name, isError: false, style: 'markdown' };
                    } else if (entry.name.endsWith('.json')) {
                        return { text: entry.name, isError: false, style: 'json' };
                    } else if (entry.name.endsWith('.js') || entry.name.endsWith('.ts')) {
                        return { text: entry.name, isError: false, style: 'code' };
                    }
                    return { text: entry.name, isError: false };
                });
                return [
                    { text: `Contents of ${getPathString(path)}:`, isError: false },
                    ...formatted
                ];
            }

            case 'cd': {
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

            case 'cat': {
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
                return [{ text: new Date().toString(), isError: false }];

            case 'matrix':
                setMatrixMode(!matrixMode);
                return [{ text: `Matrix mode ${!matrixMode ? 'enabled' : 'disabled'}`, isError: false }];

            case 'hack':
                if (hackingInProgress) {
                    return [{ text: 'A hacking operation is already in progress', isError: true }];
                }
                return () => simulateHacking();

            case 'decrypt':
                return () => simulateDecryption();

            case 'game': {
                if (args.length > 1) {
                    const gameName = args[1].toLowerCase();
                    if (playGame(gameName)) {
                        return [];
                    }
                    return [{
                        text: `Game "${args[1]}" not found. Type "game" to list games.`,
                        isError: true
                    }];
                }
                return () => showGames();
            }

            case 'quote':
                return [{ text: `"${getRandomQuote()}"`, isError: false }];

            case 'ascii': {
                const artKeys = Object.keys(asciiArt);
                const randomKey = artKeys[Math.floor(Math.random() * artKeys.length)];
                const art = asciiArt[randomKey as keyof typeof asciiArt];
                return art.map((line) => ({ text: line, isError: false, isAsciiArt: true }));
            }

            case 'glitch':
                return () => simulateGlitch();

            case 'speed': {
                if (args.length < 2 || isNaN(parseInt(args[1]))) {
                    return [{ text: `Current typing speed: ${typingSpeed}ms`, isError: false }];
                }
                const newSpeed = Math.max(0, Math.min(500, parseInt(args[1])));
                setTypingSpeed(newSpeed);
                return [{ text: `Typing speed set to ${newSpeed}ms`, isError: false }];
            }

            case 'color': {
                const themes = {
                    green: { main: '#00ff00', bg: '#000000' },
                    blue: { main: '#0088ff', bg: '#001020' },
                    amber: { main: '#ffaa00', bg: '#100800' },
                    red: { main: '#ff0000', bg: '#100000' },
                    purple: { main: '#aa00ff', bg: '#100020' },
                    cyan: { main: '#00ffff', bg: '#001414' },
                    default: { main: '#00ff00', bg: '#000000' }
                };
                const theme = args.length > 1 ? args[1].toLowerCase() : 'default';
                const terminalContent = document.querySelector('.terminal-content');
                if (!terminalContent) {
                    return [{ text: 'Error: Could not set color scheme', isError: true }];
                }
                // Remove existing theme classes
                Object.keys(themes).forEach((t) => {
                    terminalContent.classList.remove(`theme-${t}`);
                });
                if (!themes[theme as keyof typeof themes]) {
                    return [{
                        text: `Unknown theme: ${theme}. Available: ${Object.keys(themes).join(', ')}`,
                        isError: true
                    }];
                }
                terminalContent.classList.add(`theme-${theme}`);
                return [{ text: `Color scheme set to ${theme}`, isError: false }];
            }

            case 'chat':
            case 'assistant':
                setActiveMode('assistant');
                setTimeout(() => aiInputRef.current?.focus(), 100);
                return [{
                    text: 'Switching to AI assistant mode. Type "terminal" to return.',
                    isError: false
                }];

            // Easter egg
            case 'access_hyperspace':
                return [
                    { text: 'INITIATING HYPERSPACE ACCESS PROTOCOL...', isError: false },
                    { text: 'SCANNING NEURAL PATHWAYS...', isError: false },
                    { text: 'ACCESS GRANTED', isError: false },
                    { text: '', isError: false },
                    {
                        text: '⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿',
                        isError: false
                    },
                    {
                        text: '⣿⣿⣿⣿⣿⣿⣿⠿⠿⠿⢿⣿⣿⣿⣿⣿⣿⣿⣿⡿⠿⠿⠿⣿⣿⣿⣿⣿⣿⣿',
                        isError: false
                    },
                    {
                        text: '⣿⣿⣿⣿⣿⣿⣇⣀⣀⣀⣀⣈⣹⣿⣿⣿⣿⣿⣥⣀⣀⣀⣀⣸⣿⣿⣿⣿⣿⣿',
                        isError: false
                    },
                    {
                        text: '⣿⣿⣿⣿⣿⣿⡿⠿⠿⠿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⠿⠿⠿⢿⣿⣿⣿⣿⣿⣿',
                        isError: false
                    },
                    {
                        text: '⣿⣿⣿⣿⣿⣿⣧⣠⣄⣤⣾⣿⣿⣿⣿⣿⣿⣿⣿⣷⣤⣄⣠⣼⣿⣿⣿⣿⣿⣿',
                        isError: false
                    },
                    {
                        text: '⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿',
                        isError: false
                    },
                    {
                        text: '⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿',
                        isError: false
                    },
                    { text: '', isError: false },
                    { text: 'WELCOME TO HYPERSPACE', isError: false },
                    { text: 'HIDDEN PROJECT UNLOCKED: cyberdeck', isError: false },
                    { text: 'USE "view cyberdeck" TO ACCESS', isError: false }
                ];

            default: {
                // Echo command?
                if (cmd.startsWith('echo ')) {
                    return [{ text: command.substring(5), isError: false }];
                }
                // Sudo joke
                if (cmd === 'sudo') {
                    return [{ text: "Nice try. This incident will be reported.", isError: true }];
                }
                // Ping
                if (cmd === 'ping') {
                    return [{ text: "PING: Neural network latency 42ms", isError: false }];
                }
                // Hello
                if (cmd === 'hello' || cmd === 'hi') {
                    return [{ text: "Hello, neural user. How may I assist you today?", isError: false }];
                }
                // Scan / Analyze
                if (cmd === 'scan' || cmd === 'analyze') {
                    return [{ text: "Neural scan complete. No anomalies detected.", isError: false }];
                }
                return [{ text: `COMMAND NOT FOUND: ${command}`, isError: true }];
            }
        }
    };

    // 18) Submit user’s typed command in Terminal mode
    const handleCommandSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!currentCommand.trim()) return;
        // Add the command to the terminal output
        setOutputLines((prev) => [...prev, { text: `> ${currentCommand}`, isError: false }]);
        // Process
        const result = processCommand(currentCommand);

        // If the result is a function, run it (like neofetch/hack)
        if (typeof result === 'function') {
            result();
            // End prompt with '>'
            addTypingOutput([{ text: '>', isError: false }]);
        }
        else {
            // We have an array of lines
            addTypingOutput([...result, { text: '>', isError: false }]);
        }

        // Add to history
        setCommandHistory((prev) => [...prev, currentCommand]);
        setCurrentCommand('');
        setCommandIndex(-1);
        setShowSuggestions(false);
    };

    // 19) Handle user key presses in the terminal input (up/down/Tab)
    const handleTerminalInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        // Arrow Up/Down: cycle history
        if (e.key === 'ArrowUp') {
            e.preventDefault();
            const newIndex =
                commandIndex === -1 ? commandHistory.length - 1 : commandIndex - 1;
            if (newIndex >= 0) {
                setCurrentCommand(commandHistory[newIndex]);
                setCommandIndex(newIndex);
            }
        } else if (e.key === 'ArrowDown') {
            e.preventDefault();
            if (commandIndex !== -1) {
                const newIndex = commandIndex + 1;
                if (newIndex < commandHistory.length) {
                    setCurrentCommand(commandHistory[newIndex]);
                    setCommandIndex(newIndex);
                } else {
                    setCurrentCommand('');
                    setCommandIndex(-1);
                }
            }
        }
        // Tab: Show or apply suggestions
        else if (e.key === 'Tab') {
            e.preventDefault();

            // If no suggestions yet, filter from available commands
            if (!showSuggestions) {
                if (!currentCommand) {
                    // Show entire command list
                    setCommandSuggestions(availableCommands);
                    setShowSuggestions(true);
                    setSelectedSuggestion(0);
                } else {
                    // Filter commands that start with current text
                    const filtered = availableCommands.filter((cmd) =>
                        cmd.startsWith(currentCommand.toLowerCase())
                    );
                    if (filtered.length === 1) {
                        // Only one match, auto-complete
                        setCurrentCommand(filtered[0]);
                        setShowSuggestions(false);
                    } else if (filtered.length > 1) {
                        // Show the filtered suggestions
                        setCommandSuggestions(filtered);
                        setShowSuggestions(true);
                        setSelectedSuggestion(0);
                    }
                }
            } else {
                // If suggestions are shown, pressing tab cycles through them
                let next = selectedSuggestion + 1;
                if (next >= commandSuggestions.length) {
                    next = 0;
                }
                setSelectedSuggestion(next);
                setCurrentCommand(commandSuggestions[next]);
            }
        }
        // Enter -> handleCommandSubmit covers that in onSubmit
    };

    // 20) Suggestion click
    const applySuggestion = (suggestion: string) => {
        setCurrentCommand(suggestion);
        setShowSuggestions(false);
    };

    // 21) For AI assistant
    const handleAIMessageSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!aiInputValue.trim()) return;
        const userMessage = aiInputValue.trim();
        addMessage('user', userMessage);
        setAiInputValue('');

        setIsTyping(true);
        setTimeout(() => {
            setIsTyping(false);
            processUserInput(userMessage);
        }, 1000 + Math.random() * 1000);
    };

    // 22) A small function to display a prompt for the terminal
    const getPrompt = () => {
        // You can style the prompt however you like
        const dir = currentDir === '/' ? '/' : currentDir;
        return `neural_user@NeuralTerminal:${dir} >`;
    };

    // 23) If not visible, do not render
    if (!isVisible) {
        return null;
    }

    // 24) Render the component
    return (
        <div className="neural-terminal-overlay">
            <div className="neural-terminal-container">
                <div className="neural-terminal-header">
                    <div className="neural-terminal-title">Neural Terminal</div>
                    <div className="neural-terminal-tabs">
                        <button
                            className={activeMode === 'terminal' ? 'active' : ''}
                            onClick={() => setActiveMode('terminal')}
                        >
                            Terminal
                        </button>
                        <button
                            className={activeMode === 'assistant' ? 'active' : ''}
                            onClick={() => setActiveMode('assistant')}
                        >
                            AI Assistant
                        </button>
                    </div>
                    <button className="neural-terminal-close" onClick={onClose}>
                        ×
                    </button>
                </div>

                {activeMode === 'terminal' ? (
                    <div className={`terminal-content${matrixMode ? ' matrix-mode' : ''}`} ref={terminalRef}>
                        {outputLines.map((line, i) => (
                            <div
                                key={i}
                                className={`terminal-line
                  ${line.isError ? 'error' : ''}
                  ${line.isAsciiArt ? 'ascii-art' : ''}
                  ${line.isGlitch ? 'glitch-text' : ''}`}
                            >
                                {line.style ? (
                                    <span data-style={line.style}>{line.text}</span>
                                ) : (
                                    line.text
                                )}
                            </div>
                        ))}

                        <form onSubmit={handleCommandSubmit} className="terminal-input-line">
                            <span className="prompt">{getPrompt()}</span>
                            <input
                                ref={inputRef}
                                type="text"
                                value={currentCommand}
                                onChange={(e) => setCurrentCommand(e.target.value)}
                                onKeyDown={handleTerminalInputKeyDown}
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
                                        className={`suggestion ${index === selectedSuggestion ? 'selected' : ''
                                            }`}
                                        onClick={() => applySuggestion(suggestion)}
                                    >
                                        {suggestion}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="ai-body">
                        <div className="messages-container">
                            {messages.map((msg, i) => (
                                <div
                                    key={i}
                                    className={`message ${msg.sender === 'user' ? 'user-message' : 'ai-message'
                                        }`}
                                >
                                    <div className="message-sender">
                                        {msg.sender === 'user' ? 'YOU' : 'AI'}
                                    </div>
                                    <div className="message-text">{msg.text}</div>
                                    <div className="message-time">
                                        {msg.timestamp.toLocaleTimeString([], {
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })}
                                    </div>
                                </div>
                            ))}

                            {isTyping && (
                                <div className="message ai-message typing">
                                    <div className="message-sender">AI</div>
                                    <div className="message-text">
                                        <div className="typing-indicator">
                                            <span></span>
                                            <span></span>
                                            <span></span>
                                        </div>
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        <form className="ai-input-form" onSubmit={handleAIMessageSubmit}>
                            <input
                                ref={aiInputRef}
                                type="text"
                                value={aiInputValue}
                                onChange={(e) => setAiInputValue(e.target.value)}
                                placeholder="ENTER COMMAND..."
                                className="ai-input"
                            />
                            <button type="submit" className="ai-send-button">
                                SEND
                            </button>
                        </form>
                    </div>
                )}

                <div className="detail-footer">
                    <div className="system-stats">
                        <div className="stat">MEM: 87%</div>
                        <div className="stat">CPU: 42%</div>
                        <div className="stat">NET: 128MB/s</div>
                    </div>
                    <div className="footer-id">NEURAL INTERFACE v2.5.7</div>
                </div>
            </div>
        </div>
    );
};

export default NeuralTerminal;
