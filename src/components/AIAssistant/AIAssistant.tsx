/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useRef, useEffect } from 'react';
import './AIAssistant.css';
import { Project } from '../../types/Project';


interface AIAssistantProps {
    projects: Project[];
    onProjectSelect: (project: Project) => void;
}

interface Message {
    sender: 'user' | 'ai';
    text: string;
    timestamp: Date;
}

const AIAssistant: React.FC<AIAssistantProps> = ({ projects, onProjectSelect }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputValue, setInputValue] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // Initial greeting message
    useEffect(() => {
        setTimeout(() => {
            addMessage('ai', 'NEURAL INTERFACE ACTIVATED. HOW CAN I ASSIST YOU TODAY?');
        }, 1000);
    }, []);

    // Auto scroll to bottom of messages
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Add a new message to the chat
    const addMessage = (sender: 'user' | 'ai', text: string) => {
        setMessages(prev => [...prev, {
            sender,
            text,
            timestamp: new Date()
        }]);
    };

    // Handle message submit
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!inputValue.trim()) return;

        const userMessage = inputValue.trim();
        addMessage('user', userMessage);
        setInputValue('');

        // Simulate AI thinking
        setIsTyping(true);
        setTimeout(() => {
            setIsTyping(false);
            processUserInput(userMessage);
        }, 1000 + Math.random() * 1000);
    };

    // Process user input and generate response
    const processUserInput = (input: string) => {
        const normalizedInput = input.toLowerCase();

        // Check for commands
        if (normalizedInput.includes('help') || normalizedInput.includes('command')) {
            showHelpCommands();
            return;
        }

        // Check for project requests
        if (normalizedInput.includes('project') || normalizedInput.includes('work') || normalizedInput.includes('portfolio')) {
            if (normalizedInput.includes('all') || normalizedInput.includes('list')) {
                listAllProjects();
                return;
            }

            // Check for specific project types
            const projectTypes = ['frontend', 'backend', 'fullstack', 'mobile', 'ai'];
            for (const type of projectTypes) {
                if (normalizedInput.includes(type)) {
                    listProjectsByType(type as any);
                    return;
                }
            }

            // Check for specific projects by keywords
            for (const project of projects) {
                const projectKeywords = project.title.toLowerCase().split(' ');
                for (const keyword of projectKeywords) {
                    if (normalizedInput.includes(keyword.toLowerCase())) {
                        showProjectDetails(project);
                        return;
                    }
                }
            }

            // Default project response
            addMessage('ai', 'WHAT KIND OF PROJECTS ARE YOU INTERESTED IN? I CAN SHOW YOU FRONTEND, BACKEND, FULLSTACK, OR MOBILE PROJECTS.');
            return;
        }

        // Check for greetings
        if (
            normalizedInput.includes('hello') ||
            normalizedInput.includes('hi') ||
            normalizedInput.includes('hey') ||
            normalizedInput.includes('greetings')
        ) {
            addMessage('ai', 'GREETINGS, USER. I AM YOUR NEURAL INTERFACE GUIDE. HOW MAY I ASSIST YOU TODAY?');
            return;
        }

        // Check for requests about the developer
        if (normalizedInput.includes('about') || normalizedInput.includes('who')) {
            addMessage('ai', 'I AM AN AI GUIDE TO THIS NEURAL PORTFOLIO. MY PURPOSE IS TO HELP YOU NAVIGATE THE PROJECTS DEVELOPED BY THE OWNER OF THIS INTERFACE.');
            return;
        }

        // Check for thanks
        if (normalizedInput.includes('thank') || normalizedInput.includes('thanks')) {
            addMessage('ai', 'YOU ARE WELCOME. YOUR SATISFACTION IS MY PRIMARY DIRECTIVE.');
            return;
        }

        // Default response for unrecognized input
        addMessage('ai', 'INPUT PROCESSED. TO VIEW AVAILABLE COMMANDS, TYPE "HELP" OR ASK ABOUT "PROJECTS".');
    };

    // Show list of available commands
    const showHelpCommands = () => {
        addMessage('ai', `AVAILABLE COMMANDS:
- SHOW ALL PROJECTS
- SHOW [TYPE] PROJECTS (e.g., "SHOW FRONTEND PROJECTS")
- ABOUT AI GUIDE
- PROJECT DETAILS [PROJECT NAME]
- HELP

NOTE: EASTER EGG COMMAND AVAILABLE. ACCESS RESTRICTED.`);
    };

    // List all projects
    const listAllProjects = () => {
        const projectsList = projects.map(project => `- ${project.title} (${project.type.toUpperCase()})`).join('\n');
        addMessage('ai', `ACCESSING PROJECT DATABASE...\nLOADING COMPLETE.\n\nAVAILABLE PROJECTS:\n${projectsList}\n\nFOR MORE DETAILS, MENTION A SPECIFIC PROJECT.`);
    };

    // List projects by type
    const listProjectsByType = (type: Project['type']) => {
        const filteredProjects = projects.filter(project => project.type === type);

        if (filteredProjects.length === 0) {
            addMessage('ai', `NO ${type.toUpperCase()} PROJECTS FOUND IN DATABASE.`);
            return;
        }

        const projectsList = filteredProjects.map(project => `- ${project.title}`).join('\n');
        addMessage('ai', `ACCESSING ${type.toUpperCase()} PROJECTS...\nLOADING COMPLETE.\n\n${type.toUpperCase()} PROJECTS:\n${projectsList}\n\nFOR MORE DETAILS, MENTION A SPECIFIC PROJECT.`);
    };

    // Show details for a specific project
    const showProjectDetails = (project: Project) => {
        addMessage('ai', `PROJECT DETAILS: ${project.title.toUpperCase()}

DESCRIPTION: ${project.description.substring(0, 100)}...

TYPE: ${project.type.toUpperCase()}
TECHNOLOGIES: ${project.technologies.join(', ')}
STATUS: ${project.status || 'COMPLETED'}

WOULD YOU LIKE TO VIEW THIS PROJECT IN THE NEURAL INTERFACE? (YES/NO)`);

        // Set up listener for next message
        const handleNextMessage = (nextUserMessage: string) => {
            if (nextUserMessage.toLowerCase().includes('yes')) {
                addMessage('ai', 'INITIALIZING NEURAL INTERFACE PROJECTION...');
                setTimeout(() => {
                    onProjectSelect(project);
                    addMessage('ai', 'PROJECT LOADED IN NEURAL INTERFACE.');
                }, 1000);
            }
        };

        // This is a simplified way to handle the next message
        // In a real app, you'd want a more robust approach
        const currentLength = messages.length;
        const checkForResponse = setInterval(() => {
            if (messages.length > currentLength) {
                handleNextMessage(messages[messages.length - 1].text);
                clearInterval(checkForResponse);
            }
        }, 500);

        // Clear the interval after some time to prevent memory leaks
        setTimeout(() => clearInterval(checkForResponse), 30000);
    };

    // Toggle assistant open/closed
    const toggleAssistant = () => {
        setIsOpen(!isOpen);
        if (!isOpen && inputRef.current) {
            setTimeout(() => {
                inputRef.current?.focus();
            }, 300);
        }
    };

    return (
        <>
            <div className={`ai-assistant ${isOpen ? 'open' : ''}`}>
                <div className="ai-header">
                    <div className="ai-title">NEURAL INTERFACE v2.5.7</div>
                    <button className="ai-minimize" onClick={toggleAssistant}>
                        {isOpen ? '—' : '+'}
                    </button>
                </div>

                <div className="ai-body">
                    <div className="messages-container">
                        {messages.map((message, index) => (
                            <div
                                key={index}
                                className={`message ${message.sender === 'user' ? 'user-message' : 'ai-message'}`}
                            >
                                <div className="message-sender">
                                    {message.sender === 'user' ? 'YOU' : 'AI'}
                                </div>
                                <div className="message-text">{message.text}</div>
                                <div className="message-time">
                                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
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

                    <form className="ai-input-form" onSubmit={handleSubmit}>
                        <input
                            ref={inputRef}
                            type="text"
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            placeholder="ENTER COMMAND..."
                            className="ai-input"
                        />
                        <button type="submit" className="ai-send-button">
                            SEND
                        </button>
                    </form>
                </div>
            </div>

            <button
                className={`ai-assistant-toggle ${isOpen ? 'hidden' : ''}`}
                onClick={toggleAssistant}
            >
                <span className="toggle-icon">AI</span>
                <span className="toggle-text">NEURAL ASSISTANT</span>
            </button>
        </>
    );
};

export default AIAssistant;