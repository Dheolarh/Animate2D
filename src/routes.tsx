import SplashScreen from './pages/SplashScreen';
import ProjectScreen from './pages/ProjectScreen';
import SceneEditorPage from './pages/SceneEditorPage';
import type { ReactNode } from 'react';

export interface RouteConfig {
  name: string;
  path: string;
  element: ReactNode;
  visible?: boolean;
  /** Accessible without login. Routes without this flag require authentication. Has no effect when RouteGuard is not in use. */
  public?: boolean;
}

export const routes: RouteConfig[] = [
  {
    name: 'Splash',
    path: '/',
    element: <SplashScreen />,
    public: true,
  },
  {
    name: 'Projects',
    path: '/projects',
    element: <ProjectScreen />,
    public: true,
  },
  {
    name: 'Scene Editor',
    path: '/editor/:projectId',
    element: <SceneEditorPage />,
    public: true,
  }
];
