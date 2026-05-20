import { get, set, del, keys } from 'idb-keyval';
import type { Project } from '@/types/animation';

const PROJECTS_INDEX_KEY = 'animate2d_projects_index';
const CURRENT_PROJECT_KEY = 'animate2d_current_project';
const PROJECT_KEY_PREFIX = 'animate2d_project_';

// Lightweight project metadata for listing
interface ProjectMetadata {
  id: string;
  name: string;
  thumbnail?: string;
  createdAt: number;
  updatedAt: number;
  settings: {
    canvasWidth: number;
    canvasHeight: number;
    fps: number;
    backgroundColor: string;
  };
}

export const storage = {
  getAllProjects: async (): Promise<Project[]> => {
    try {
      const index = await get<ProjectMetadata[]>(PROJECTS_INDEX_KEY) || [];
      const projects: Project[] = [];
      
      for (const meta of index) {
        const project = await get<Project>(`${PROJECT_KEY_PREFIX}${meta.id}`);
        if (project) {
          projects.push(project);
        }
      }
      
      return projects;
    } catch (error) {
      console.error('Failed to load projects:', error);
      return [];
    }
  },

  getProject: async (id: string): Promise<Project | null> => {
    try {
      const project = await get<Project>(`${PROJECT_KEY_PREFIX}${id}`);
      return project || null;
    } catch (error) {
      console.error('Failed to load project:', error);
      return null;
    }
  },

  saveProject: async (project: Project): Promise<void> => {
    try {
      const updatedProject = {
        ...project,
        updatedAt: Date.now()
      };

      // Save the full project
      await set(`${PROJECT_KEY_PREFIX}${project.id}`, updatedProject);

      // Update the index
      const index = await get<ProjectMetadata[]>(PROJECTS_INDEX_KEY) || [];
      const existingIndex = index.findIndex(p => p.id === project.id);
      
      const metadata: ProjectMetadata = {
        id: updatedProject.id,
        name: updatedProject.name,
        thumbnail: updatedProject.thumbnail,
        createdAt: updatedProject.createdAt,
        updatedAt: updatedProject.updatedAt,
        settings: updatedProject.settings
      };

      if (existingIndex >= 0) {
        index[existingIndex] = metadata;
      } else {
        index.push(metadata);
      }

      await set(PROJECTS_INDEX_KEY, index);
    } catch (error) {
      console.error('Failed to save project:', error);
      throw error;
    }
  },

  deleteProject: async (id: string): Promise<void> => {
    try {
      // Delete the project
      await del(`${PROJECT_KEY_PREFIX}${id}`);
      
      // Update the index
      const index = await get<ProjectMetadata[]>(PROJECTS_INDEX_KEY) || [];
      const filtered = index.filter(p => p.id !== id);
      await set(PROJECTS_INDEX_KEY, filtered);
      
      // Clear current project if it's the deleted one
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

  createProject: async (name: string, width = 1280, height = 720): Promise<Project> => {
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

    await storage.saveProject(project);
    return project;
  }
};
