import type { Project } from '@/types/animation';

const PROJECTS_KEY = 'animate2d_projects';
const CURRENT_PROJECT_KEY = 'animate2d_current_project';

export const storage = {
  getAllProjects: (): Project[] => {
    try {
      const data = localStorage.getItem(PROJECTS_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Failed to load projects:', error);
      return [];
    }
  },

  getProject: (id: string): Project | null => {
    const projects = storage.getAllProjects();
    return projects.find(p => p.id === id) || null;
  },

  saveProject: (project: Project): void => {
    try {
      const projects = storage.getAllProjects();
      const index = projects.findIndex(p => p.id === project.id);
      
      const updatedProject = {
        ...project,
        updatedAt: Date.now()
      };

      if (index >= 0) {
        projects[index] = updatedProject;
      } else {
        projects.push(updatedProject);
      }

      localStorage.setItem(PROJECTS_KEY, JSON.stringify(projects));
    } catch (error) {
      console.error('Failed to save project:', error);
      throw error;
    }
  },

  deleteProject: (id: string): void => {
    try {
      const projects = storage.getAllProjects();
      const filtered = projects.filter(p => p.id !== id);
      localStorage.setItem(PROJECTS_KEY, JSON.stringify(filtered));
      
      const currentId = storage.getCurrentProjectId();
      if (currentId === id) {
        storage.setCurrentProjectId(null);
      }
    } catch (error) {
      console.error('Failed to delete project:', error);
      throw error;
    }
  },

  getCurrentProjectId: (): string | null => {
    return localStorage.getItem(CURRENT_PROJECT_KEY);
  },

  setCurrentProjectId: (id: string | null): void => {
    if (id) {
      localStorage.setItem(CURRENT_PROJECT_KEY, id);
    } else {
      localStorage.removeItem(CURRENT_PROJECT_KEY);
    }
  },

  createProject: (name: string, width = 1280, height = 720): Project => {
    const now = Date.now();
    const project: Project = {
      id: `project_${now}`,
      name,
      settings: {
        name,
        canvasWidth: width,
        canvasHeight: height,
        fps: 24,
        backgroundColor: '#ffffff'
      },
      scene: {
        id: `scene_${now}`,
        name: 'Main Scene',
        width,
        height,
        backgroundColor: '#ffffff',
        layers: [
          { id: 'layer_bg', name: 'Background', visible: true, locked: false, opacity: 1, order: 0 },
          { id: 'layer_mid', name: 'Midground', visible: true, locked: false, opacity: 1, order: 1 },
          { id: 'layer_fg', name: 'Foreground', visible: true, locked: false, opacity: 1, order: 2 },
          { id: 'layer_fx', name: 'Effects', visible: true, locked: false, opacity: 1, order: 3 }
        ],
        objects: [],
        timeline: {
          duration: 10,
          fps: 24,
          tracks: []
        }
      },
      assets: [],
      createdAt: now,
      updatedAt: now
    };

    storage.saveProject(project);
    return project;
  }
};
