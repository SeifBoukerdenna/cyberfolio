export interface Project {
  id: string;
  title: string;
  description: string;
  technologies: string[];
  image?: string;
  demoLink?: string;
  githubLink?: string;
  type: "frontend" | "backend" | "fullstack" | "mobile" | "ai" | "core";
  status?: "COMPLETED" | "IN PROGRESS" | "PLANNED";
  codeSnippet?: string;
  architecture?: string;
  completionPercentage?: number;
}
