import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { storage } from '@/lib/storage';
import type { Project, EditorMode, SceneObject } from '@/types/animation';
import { toast } from 'sonner';
import TopToolbar from '@/components/editor/TopToolbar';
import SceneHierarchy from '@/components/editor/SceneHierarchy';
import CanvasArea from '@/components/editor/CanvasArea';
import Inspector from '@/components/editor/Inspector';
import AssetLibrary from '@/components/editor/AssetLibrary';
import Timeline from '@/components/editor/Timeline';
import SpriteEditor from '@/components/editor/SpriteEditor';
import PreviewMode from '@/components/editor/PreviewMode';
import ExportMode from '@/components/editor/ExportMode';
import SceneAssistant from '@/components/editor/SceneAssistant';

const SceneEditorPage: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const [project, setProject] = useState<Project | null>(null);
  const [mode, setMode] = useState<EditorMode>('sprite');
  const [selectedObjectId, setSelectedObjectId] = useState<string | null>(null);
  const [playheadTime, setPlayheadTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);

  useEffect(() => {
    if (!projectId) {
      navigate('/projects');
      return;
    }

    const loadProject = async () => {
      const loadedProject = await storage.getProject(projectId);
      if (!loadedProject) {
        toast.error('Project not found');
        navigate('/projects');
        return;
      }

      setProject(loadedProject);
    };

    loadProject();
  }, [projectId, navigate]);

  useEffect(() => {
    if (!project) return;

    const autoSaveInterval = setInterval(() => {
      storage.saveProject(project).catch(err => {
        console.error('Auto-save failed:', err);
      });
    }, 30000);

    return () => clearInterval(autoSaveInterval);
  }, [project]);

  const handleProjectUpdate = (updatedProject: Project) => {
    setProject(updatedProject);
    storage.saveProject(updatedProject).catch(err => {
      console.error('Failed to save project:', err);
      toast.error('Failed to save project');
    });
  };

  const handleAddObject = (object: SceneObject) => {
    if (!project) return;

    const updatedProject = {
      ...project,
      scene: {
        ...project.scene,
        objects: [...project.scene.objects, object]
      }
    };

    handleProjectUpdate(updatedProject);
    setSelectedObjectId(object.id);
  };

  const handleUpdateObject = (objectId: string, updates: Partial<SceneObject>) => {
    if (!project) return;

    const updatedProject = {
      ...project,
      scene: {
        ...project.scene,
        objects: project.scene.objects.map(obj =>
          obj.id === objectId ? { ...obj, ...updates } : obj
        )
      }
    };

    handleProjectUpdate(updatedProject);
  };

  const handleDeleteObject = (objectId: string) => {
    if (!project) return;

    const updatedProject = {
      ...project,
      scene: {
        ...project.scene,
        objects: project.scene.objects.filter(obj => obj.id !== objectId)
      }
    };

    handleProjectUpdate(updatedProject);
    if (selectedObjectId === objectId) {
      setSelectedObjectId(null);
    }
  };

  if (!project) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-muted-foreground">Loading project...</div>
      </div>
    );
  }

  const selectedObject = project.scene.objects.find(obj => obj.id === selectedObjectId);

  if (mode === 'sprite') {
    return (
      <div className="h-screen bg-background flex flex-col overflow-hidden">
        <div className="flex-1 flex overflow-hidden min-h-0">
          <SpriteEditor 
            project={project} 
            onProjectUpdate={handleProjectUpdate} 
            onClose={() => setMode('scene')}
            mode={mode}
            onModeChange={setMode}
            isPlaying={isPlaying}
            onPlayPause={() => setIsPlaying(!isPlaying)}
            onStop={() => {
              setIsPlaying(false);
              setPlayheadTime(0);
            }}
            isAssistantOpen={isAssistantOpen}
            onAssistantToggle={() => setIsAssistantOpen((prev) => !prev)}
          />
          <SceneAssistant
            isOpen={isAssistantOpen}
            onClose={() => setIsAssistantOpen(false)}
          />
        </div>
      </div>
    );
  }

  if (mode === 'preview') {
    return (
      <PreviewMode
        project={project}
        playheadTime={playheadTime}
        onClose={() => setMode('scene')}
      />
    );
  }

  if (mode === 'export') {
    return (
      <div className="h-screen bg-background flex flex-col">
        <TopToolbar
          mode={mode}
          onModeChange={setMode}
          projectName={project.name}
          isPlaying={false}
          onPlayPause={() => {}}
          onStop={() => {}}
          isAssistantOpen={isAssistantOpen}
          onAssistantToggle={() => setIsAssistantOpen((prev) => !prev)}
        />
        <ExportMode project={project} onClose={() => setMode('scene')} />
      </div>
    );
  }

  return (
    <div className="h-screen bg-background flex flex-col overflow-hidden">
      <TopToolbar
        mode={mode}
        onModeChange={setMode}
        projectName={project.name}
        isPlaying={isPlaying}
        onPlayPause={() => setIsPlaying(!isPlaying)}
        onStop={() => {
          setIsPlaying(false);
          setPlayheadTime(0);
        }}
        isAssistantOpen={isAssistantOpen}
        onAssistantToggle={() => setIsAssistantOpen((prev) => !prev)}
      />

      <div className="flex-1 flex overflow-hidden min-h-0">
        <SceneHierarchy
          objects={project.scene.objects}
          layers={project.scene.layers}
          selectedObjectId={selectedObjectId}
          onSelectObject={setSelectedObjectId}
          onDeleteObject={handleDeleteObject}
        />

        <div className="flex-1 flex flex-col overflow-hidden min-h-0 min-w-0">
          <div className="flex-1 overflow-hidden min-h-0">
            <CanvasArea
              scene={project.scene}
              assets={project.assets}
              selectedObjectId={selectedObjectId}
              onSelectObject={setSelectedObjectId}
              onUpdateObject={handleUpdateObject}
              playheadTime={playheadTime}
            />
          </div>

          <div className="h-48 border-t flex-shrink-0">
            <AssetLibrary
              assets={project.assets}
              onAddObject={handleAddObject}
              project={project}
              onProjectUpdate={handleProjectUpdate}
            />
          </div>

          <div className="h-32 border-t flex-shrink-0">
            <Timeline
              timeline={project.scene.timeline}
              objects={project.scene.objects}
              playheadTime={playheadTime}
              onPlayheadChange={setPlayheadTime}
              isPlaying={isPlaying}
              selectedObjectId={selectedObjectId}
            />
          </div>
        </div>

        <Inspector
          selectedObject={selectedObject}
          onUpdateObject={handleUpdateObject}
        />

        {/* AI Scene Assistant panel */}
        <SceneAssistant
          isOpen={isAssistantOpen}
          onClose={() => setIsAssistantOpen(false)}
        />
      </div>
    </div>
  );
};

export default SceneEditorPage;
