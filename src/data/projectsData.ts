import { Project } from "../types/Project";

const projectsData: Project[] = [
  {
    id: "proj-001",
    title: "Neural Marketplace",
    description:
      "A cyberpunk-themed e-commerce platform with real-time product visualization and neural recommendation engine. The platform analyzes user behavior patterns to suggest personalized products through an advanced machine learning algorithm.",
    technologies: ["React", "Node.js", "TensorFlow.js", "GraphQL", "ThreeJS"],
    image: "/assets/projects/neural-marketplace.jpg",
    demoLink: "https://neural-marketplace.example.com",
    githubLink: "https://github.com/yourusername/neural-marketplace",
    type: "fullstack",
    codeSnippet: `// Neural recommendation engine
const recommendProducts = async (userId, viewHistory) => {
  // Load pre-trained model
  const model = await tf.loadLayersModel('/models/recommendation-model/model.json');

  // Process user view history
  const userVector = preprocessUserData(viewHistory);

  // Get recommendations
  const tensorInput = tf.tensor2d([userVector]);
  const prediction = model.predict(tensorInput);
  const recommendationScores = await prediction.data();

  // Map scores to product IDs and return top 5
  return getTopProducts(recommendationScores, 5);
};`,
  },
  {
    id: "proj-002",
    title: "Cyberspace VR",
    description:
      "An immersive virtual reality experience that translates web browsing into a three-dimensional cyberspace. Users can navigate websites as physical spaces, with data visualized as tangible objects that can be manipulated using hand controllers.",
    technologies: ["WebVR", "Three.js", "React", "WebSockets", "WebGL"],
    image: "/assets/projects/cyberspace-vr.jpg",
    demoLink: "https://cyberspace-vr.example.com",
    githubLink: "https://github.com/yourusername/cyberspace-vr",
    type: "frontend",
    codeSnippet: `// Website to 3D space converter
function convertDOMToVRSpace(document) {
  const vrScene = new THREE.Scene();

  // Convert DOM hierarchy to 3D objects
  const elements = document.querySelectorAll('*');
  elements.forEach(element => {
    const boundingBox = element.getBoundingClientRect();
    const object3D = createElement3D(element, boundingBox);

    if (object3D) {
      vrScene.add(object3D);
    }
  });

  // Add lighting and environment
  addEnvironmentToScene(vrScene);

  return vrScene;
}`,
  },
  {
    id: "proj-003",
    title: "NeuroSync API",
    description:
      "A secure backend API system that facilitates real-time data synchronization between multiple devices using encrypted neural network protocols. The system features automatic conflict resolution and bandwidth optimization for seamless user experience.",
    technologies: ["Node.js", "GraphQL", "Redis", "WebSockets", "JWT"],
    type: "backend",
    githubLink: "https://github.com/yourusername/neurosync-api",
    status: "IN PROGRESS",
    completionPercentage: 75,
    architecture: `Client <--> API Gateway <--> Authentication Service
                            |
                            v
                        GraphQL API <--> Database
                            |
                            v
                  Event Stream <--> WebSocket Server`,
    codeSnippet: `// Real-time data synchronization with conflict resolution
class NeuroSync {
  constructor(userId, deviceId) {
    this.userId = userId;
    this.deviceId = deviceId;
    this.connection = new WebSocket(\`wss://api.neurosync.io/sync/\${userId}\`);
    this.pendingChanges = [];
    this.setupEventHandlers();
  }

  pushChange(entity, changes, timestamp) {
    const changePacket = {
      entityId: entity.id,
      entityType: entity.type,
      changes,
      timestamp,
      deviceId: this.deviceId
    };

    this.pendingChanges.push(changePacket);
    this.attemptSync();
  }

  resolveConflicts(localChanges, remoteChanges) {
    // Neural network-based conflict resolution algorithm
    // prioritizes changes based on context and importance
    // ...implementation details...
  }
}`,
  },
  {
    id: "proj-004",
    title: "Quantum Cipher",
    description:
      "A next-generation encryption tool that implements quantum-resistant algorithms for secure communication. The application features a cyberpunk interface with real-time visualization of encryption processes and threat detection.",
    technologies: ["Rust", "WebAssembly", "React", "D3.js", "Web Crypto API"],
    image: "/assets/projects/quantum-cipher.jpg",
    demoLink: "https://quantum-cipher.example.com",
    githubLink: "https://github.com/yourusername/quantum-cipher",
    type: "fullstack",
    codeSnippet: `// Quantum-resistant encryption implementation
async function encryptMessage(publicKey, message) {
  // Convert message to Uint8Array
  const messageBytes = new TextEncoder().encode(message);

  // Generate random salt
  const salt = crypto.getRandomValues(new Uint8Array(16));

  // Derive key using lattice-based algorithm
  const encryptionKey = await deriveLatticeKey(publicKey, salt);

  // Encrypt using AES-GCM
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const algorithm = { name: 'AES-GCM', iv };

  const encryptedData = await crypto.subtle.encrypt(
    algorithm,
    encryptionKey,
    messageBytes
  );

  // Format and return encrypted message with metadata
  return formatEncryptedMessage(salt, iv, new Uint8Array(encryptedData));
}`,
  },
  {
    id: "proj-005",
    title: "BioSync Mobile",
    description:
      'A mobile application that simulates a cyberpunk biometric interface. It uses the device\'s camera and sensors to create fictional augmented reality overlays as if the user has cybernetic implants, displaying "health stats" and environmental data.',
    technologies: [
      "React Native",
      "TensorFlow Lite",
      "ARKit",
      "ARCore",
      "Firebase",
    ],
    image: "/assets/projects/biosync-mobile.jpg",
    demoLink:
      "https://play.google.com/store/apps/details?id=com.yourusername.biosync",
    type: "mobile",
    status: "COMPLETED",
    codeSnippet: `// AR overlay for biometric data visualization
const BiometricOverlay = ({ faceDetectionResult, vitalSigns }) => {
  // Calculate face landmark positions
  const landmarks = processFaceLandmarks(faceDetectionResult);

  // Generate UI elements positioned relative to face
  const heartRatePosition = calculatePosition(landmarks.rightEye, 40, -20);
  const oxygenLevelPosition = calculatePosition(landmarks.leftEye, -40, -20);
  const stressLevelPosition = calculatePosition(landmarks.forehead, 0, -50);

  return (
    <ARView>
      <StatusBox position={heartRatePosition} type="heart-rate" value={vitalSigns.heartRate} />
      <StatusBox position={oxygenLevelPosition} type="oxygen" value={vitalSigns.oxygenLevel} />
      <StatusBox position={stressLevelPosition} type="stress" value={vitalSigns.stressLevel} />
      <FacialScanLines landmarks={landmarks} />
      <DataReadout position="bottom" data={vitalSigns.detailed} />
    </ARView>
  );
}`,
  },
];

export default projectsData;
