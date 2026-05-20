import { set } from 'idb-keyval';
import type { Project } from '@/types/animation';

const OLD_PROJECTS_KEY = 'animate2d_projects';
const PROJECTS_INDEX_KEY = 'animate2d_projects_index';
const PROJECT_KEY_PREFIX = 'animate2d_project_';
const MIGRATION_FLAG_KEY = 'animate2d_storage_migrated';

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

/**
 * Migrates projects from localStorage to IndexedDB
 * This is a one-time migration that runs automatically
 */
export async function migrateStorageToIndexedDB(): Promise<void> {
  // Check if migration already completed
  const migrated = localStorage.getItem(MIGRATION_FLAG_KEY);
  if (migrated === 'true') {
    return;
  }

  try {
    // Get old projects from localStorage
    const oldData = localStorage.getItem(OLD_PROJECTS_KEY);
    if (!oldData) {
      // No data to migrate
      localStorage.setItem(MIGRATION_FLAG_KEY, 'true');
      return;
    }

    const projects: Project[] = JSON.parse(oldData);
    
    if (projects.length === 0) {
      localStorage.setItem(MIGRATION_FLAG_KEY, 'true');
      return;
    }

    console.log(`Migrating ${projects.length} projects to IndexedDB...`);

    // Migrate each project
    const index: ProjectMetadata[] = [];
    
    for (const project of projects) {
      // Save full project to IndexedDB
      await set(`${PROJECT_KEY_PREFIX}${project.id}`, project);
      
      // Add to index
      index.push({
        id: project.id,
        name: project.name,
        thumbnail: project.thumbnail,
        createdAt: project.createdAt,
        updatedAt: project.updatedAt,
        settings: project.settings
      });
    }

    // Save index
    await set(PROJECTS_INDEX_KEY, index);

    // Remove old localStorage data
    localStorage.removeItem(OLD_PROJECTS_KEY);

    // Mark migration as complete
    localStorage.setItem(MIGRATION_FLAG_KEY, 'true');

    console.log('Migration completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error);
    // Don't mark as migrated so it can retry
  }
}
