import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import IntersectObserver from '@/components/common/IntersectObserver';
import { Toaster } from '@/components/ui/sonner';

import { routes } from './routes';
import DesktopOnlyGuard from '@/components/common/DesktopOnlyGuard';

const App: React.FC = () => {
  return (
    <DesktopOnlyGuard>
      <Router>
        {/*<AuthProvider>*/}
        {/*<RouteGuard>*/}
        <IntersectObserver />
        <div className="flex flex-col min-h-screen">
        {/*<Header />*/}
        <main className="flex-grow">
          <Routes>
          {routes.map((route, index) => (
            <Route
              key={index}
              path={route.path}
              element={route.element}
            />
          ))}
          <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
      <Toaster />
      {/*</RouteGuard>*/}
      {/*</AuthProvider>*/}
      </Router>
    </DesktopOnlyGuard>
  );
};

export default App;
