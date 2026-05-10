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
import type { Project } from '@/types/animation';
import { toast } from 'sonner';

const ProjectScreen: React.FC = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [newProjectName, setNewProjectName] = useState('');
  const [canvasSize, setCanvasSize] = useState('1280x720');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = () => {
    const allProjects = storage.getAllProjects();
    setProjects(allProjects.sort((a, b) => b.updatedAt - a.updatedAt));
  };

  const handleCreateProject = () => {
    if (!newProjectName.trim()) {
      toast.error('Please enter a project name');
      return;
    }

    try {
      const [width, height] = canvasSize.split('x').map(Number);
      const project = storage.createProject(newProjectName.trim(), width, height);
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

  const handleDeleteProject = (projectId: string, projectName: string) => {
    try {
      storage.deleteProject(projectId);
      loadProjects();
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
            <h1 className="text-5xl font-bold text-foreground mb-2">Animate2D</h1>
            <p className="text-muted-foreground font-mono">Your Projects</p>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleDownloadCodebase}
            className="gap-2"
          >
            <Download className="w-4 h-4" />
            Download Source Code
          </Button>
        </div>

        <div className="mb-8">
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button size="lg" className="gap-2">
                <Plus className="w-5 h-5" />
                Create New Project
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Project</DialogTitle>
                <DialogDescription>
                  Enter a name for your new animation project
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="project-name">Project Name</Label>
                  <Input
                    id="project-name"
                    placeholder="My Animation"
                    value={newProjectName}
                    onChange={(e) => setNewProjectName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleCreateProject();
                        setIsCreateDialogOpen(false);
                      }
                    }}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="canvas-size">Canvas Size</Label>
                  <select
                    id="canvas-size"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    value={canvasSize}
                    onChange={(e) => setCanvasSize(e.target.value)}
                  >
                    <optgroup label="Landscape">
                      <option value="854x480">480p (854 × 480)</option>
                      <option value="1280x720">720p (1280 × 720)</option>
                      <option value="1920x1080">1080p (1920 × 1080)</option>
                    </optgroup>
                    <optgroup label="Portrait">
                      <option value="480x854">480p Portrait (480 × 854)</option>
                      <option value="720x1280">720p Portrait (720 × 1280)</option>
                      <option value="1080x1920">1080p Portrait (1080 × 1920)</option>
                    </optgroup>
                    <optgroup label="Square">
                      <option value="512x512">Square (512 × 512)</option>
                      <option value="1024x1024">Square Large (1024 × 1024)</option>
                    </optgroup>
                  </select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={() => {
                  handleCreateProject();
                  setIsCreateDialogOpen(false);
                  setNewProjectName('');
                }}>
                  Create Project
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {projects.length === 0 ? (
          <Card className="border-2 border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <FolderOpen className="w-16 h-16 text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">No projects yet</h3>
              <p className="text-muted-foreground mb-6 text-center max-w-md">
                Create your first animation project to get started. All projects are saved automatically to your browser.
              </p>
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
                      <CardDescription className="mt-1">
                        {project.settings.canvasWidth} × {project.settings.canvasHeight} • {project.settings.fps} fps
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
                  <div className="aspect-video bg-muted rounded-md mb-3 flex items-center justify-center border">
                    <Settings className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>{project.assets.length} assets</span>
                    <span>{formatDate(project.updatedAt)}</span>
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
