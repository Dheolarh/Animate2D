import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Trash2, Settings, FolderOpen, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { storage } from '@/lib/storage';
import { migrateStorageToIndexedDB } from '@/lib/migrateStorage';
import type { Project } from '@/types/animation';
import { toast } from 'sonner';

const ProjectScreen: React.FC = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [newProjectName, setNewProjectName] = useState('');
  const [canvasWidth, setCanvasWidth] = useState(1280);
  const [canvasHeight, setCanvasHeight] = useState(720);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  useEffect(() => {
    const initializeStorage = async () => {
      // Run migration first
      await migrateStorageToIndexedDB();
      // Then load projects
      await loadProjects();
    };
    
    initializeStorage();
  }, []);

  const loadProjects = async () => {
    const allProjects = await storage.getAllProjects();
    setProjects(allProjects.sort((a, b) => b.updatedAt - a.updatedAt));
  };

  const handleCreateProject = async () => {
    if (!newProjectName.trim()) {
      toast.error('Please enter a project name');
      return;
    }

    if (canvasWidth <= 0 || canvasHeight <= 0) {
      toast.error('Dimensions must be greater than 0');
      return;
    }

    try {
      const project = await storage.createProject(newProjectName.trim(), canvasWidth, canvasHeight);
      storage.setCurrentProjectId(project.id);
      toast.success('Project created successfully');
      navigate(`/editor/${project.id}`);
    } catch (error) {
      toast.error('Failed to create project');
      console.error(error);
    }
  };

  const handleOpenProject = (projectId: string) => {
    storage.setCurrentProjectId(projectId);
    navigate(`/editor/${projectId}`);
  };

  const handleDeleteProject = async (projectId: string, projectName: string) => {
    try {
      await storage.deleteProject(projectId);
      await loadProjects();
      toast.success(`Project "${projectName}" deleted`);
    } catch (error) {
      toast.error('Failed to delete project');
      console.error(error);
    }
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleDownloadCodebase = () => {
    const link = document.createElement('a');
    link.href = '/animate2d-codebase.zip';
    link.download = 'animate2d-codebase.zip';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Downloading codebase...');
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="absolute inset-0 notebook-lines opacity-10" />
      
      <div className="relative z-10 container mx-auto px-4 py-8 max-w-7xl">
        <div className="mb-8 flex items-start justify-between">
          <div>
            <h1 
              className="text-5xl font-bold tracking-tighter flex mb-2"
              style={{ fontFamily: "'Courier New', Courier, monospace" }}
            >
              <span style={{ color: '#FF3B30' }}>A</span>
              <span style={{ color: '#FF9500' }}>n</span>
              <span style={{ color: '#FFCC00' }}>i</span>
              <span style={{ color: '#34C759' }}>m</span>
              <span style={{ color: '#007AFF' }}>a</span>
              <span style={{ color: '#5856D6' }}>t</span>
              <span style={{ color: '#FF2D55' }}>e</span>
              <span style={{ color: '#32ADE6' }}>2</span>
              <span style={{ color: '#AF52DE' }}>D</span>
            </h1>
            <p className="text-muted-foreground font-mono">Your Projects</p>
          </div>
        </div>

        <div className="mb-8">
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button size="lg" className="gap-2">
                <Plus className="w-5 h-5" />
                Create New Project
              </Button>
            </DialogTrigger>
            <DialogContent className="overflow-hidden p-0">
              {/* Notebook design background */}
              <div className="absolute inset-0 pointer-events-none z-0">
                <div className="absolute inset-0 notebook-lines opacity-20" />
                <div className="absolute left-[40px] top-0 bottom-0 w-[2px] bg-red-400 opacity-40" />
              </div>
              
              <div className="relative z-10 pl-16 pr-8 py-8">
                <DialogHeader className="mb-6">
                  <DialogTitle className="font-bold text-2xl tracking-tight" style={{ fontFamily: "'Courier New', Courier, monospace" }}>
                    CREATE NEW PROJECT
                  </DialogTitle>
                </DialogHeader>
                
                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="project-name" className="font-mono text-xs uppercase opacity-70 font-bold">Project Name</Label>
                    <Input
                      id="project-name"
                      placeholder="Untitled Animation"
                      className="font-mono bg-white/80 backdrop-blur-sm border-2 focus-visible:ring-0 focus-visible:border-primary h-11"
                      value={newProjectName}
                      onChange={(e) => setNewProjectName(e.target.value)}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="canvas-width" className="font-mono text-xs uppercase opacity-70 font-bold">Width (px)</Label>
                      <Input
                        id="canvas-width"
                        type="number"
                        min="1"
                        max="4096"
                        className="font-mono bg-white/80 backdrop-blur-sm border-2 h-11"
                        value={canvasWidth}
                        onChange={(e) => setCanvasWidth(parseInt(e.target.value) || 0)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="canvas-height" className="font-mono text-xs uppercase opacity-70 font-bold">Height (px)</Label>
                      <Input
                        id="canvas-height"
                        type="number"
                        min="1"
                        max="4096"
                        className="font-mono bg-white/80 backdrop-blur-sm border-2 h-11"
                        value={canvasHeight}
                        onChange={(e) => setCanvasHeight(parseInt(e.target.value) || 0)}
                      />
                    </div>
                  </div>
                </div>

                <DialogFooter className="mt-8 gap-3">
                  <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)} className="font-mono uppercase text-xs">
                    Cancel
                  </Button>
                  <Button 
                    className="font-mono uppercase text-xs px-6"
                    onClick={() => {
                      handleCreateProject();
                      setIsCreateDialogOpen(false);
                      setNewProjectName('');
                    }}
                  >
                    Create Project
                  </Button>
                </DialogFooter>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {projects.length === 0 ? (
          <Card className="border-2 border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <FolderOpen className="w-16 h-16 text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">No projects yet</h3>
              <Button onClick={() => setIsCreateDialogOpen(true)} className="gap-2">
                <Plus className="w-4 h-4" />
                Create Your First Project
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <Card 
                key={project.id} 
                className="hover:border-primary transition-colors cursor-pointer group"
                onClick={() => handleOpenProject(project.id)}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <CardTitle className="truncate">{project.name}</CardTitle>
                      <CardDescription className="mt-1 font-mono text-[10px] uppercase tracking-wider">
                        Modified: {formatDate(project.updatedAt)}
                      </CardDescription>
                    </div>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent onClick={(e) => e.stopPropagation()}>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Project</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete "{project.name}"? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteProject(project.id, project.name);
                            }}
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </CardHeader>
                <CardContent>
                  <div 
                    className="aspect-video rounded-md mb-2 flex items-center justify-center border overflow-hidden relative"
                    style={{ backgroundColor: project.settings.backgroundColor || '#ffffff' }}
                  >
                    <div className="absolute inset-0 notebook-lines opacity-5 pointer-events-none" />
                    {project.thumbnail ? (
                      <img 
                        src={project.thumbnail} 
                        alt={project.name} 
                        className="w-full h-full object-contain relative z-10"
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center gap-2 opacity-20 relative z-10">
                        <FolderOpen className="w-8 h-8" />
                        <span className="text-[10px] font-mono uppercase font-bold">Empty Canvas</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectScreen;
