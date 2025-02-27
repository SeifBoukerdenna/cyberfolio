# Neural Network Cyberpunk Portfolio

A futuristic, cyberpunk-styled portfolio website featuring an interactive neural network visualization. Projects are displayed as nodes in a network that users can explore, with detailed information revealed upon interaction.

## 🧠 Features

- **Neural Network Visualization**: Interactive node-based project showcase
- **AI Assistant**: Cyberpunk-themed chat interface to help navigate the portfolio
- **Project Detail View**: Detailed information about each project with tabbed interface
- **Terminal Mode**: Hidden easter egg console accessible through a special command
- **Cyberpunk Aesthetics**: Glowing elements, particle effects, scanlines, and more
- **System Boot Animation**: Hacker-style boot sequence on first visit

## 🚀 Setup Instructions

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Vite + React + TypeScript project (already set up)

### Installation

1. Clone this repository or copy the files into your existing Vite project

2. Install dependencies:
```bash
npm install react-dom
# or
yarn add react-dom
```

3. Create the directory structure as shown in the file structure diagram

4. Add the component files and styles to their respective directories

5. Add your own project images to `src/assets/projects/` and update the `projectsData.ts` file with your own project information

6. Run the development server:
```bash
npm run dev
# or
yarn dev
```

## 🎮 Interaction Guide

- **Explore Projects**: Click on network nodes to view project details
- **AI Assistant**: Click the assistant button in the bottom right to ask about projects
- **Terminal Mode**: Press `Ctrl + Alt + T` or type `access_hyperspace` anywhere to access the terminal
- **Terminal Commands**: Use `help` in the terminal to see available commands
- **Navigation**: Click the X button to close modals and return to the neural network

## 🔧 Customization

To customize the portfolio for your own use:

1. Update `projectsData.ts` with your own projects
2. Replace project images in `src/assets/projects/`
3. Modify the color scheme in `App.css` (change the CSS variables in `:root`)
4. Update the AI Assistant responses in `AIAssistant.tsx` to match your projects
5. Customize the terminal commands in `Terminal.tsx`

## ✨ Easter Eggs

This portfolio contains several hidden features:

- Terminal Mode: Access with `Ctrl + Alt + T` or by typing `access_hyperspace`
- Hidden Project: Accessible through the terminal with `view cyberdeck` after entering hyperspace
- Secret terminal commands: Try exploring different commands in the terminal

## 📱 Responsive Design

The portfolio is designed to work on both desktop and mobile devices, with optimized layouts for different screen sizes.

## 🧩 Tech Stack

- React
- TypeScript
- Vite
- HTML5 Canvas (for neural network and particles)
- CSS3 (for cyberpunk styling and animations)