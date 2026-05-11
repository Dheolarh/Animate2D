import React, { useState, useEffect } from 'react';
import { Monitor, Laptop, Tablet } from 'lucide-react';

const DesktopOnlyGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      // Block only true small screens (phones and small tablets in portrait)
      const isSmallScreen = window.innerWidth < 768;
      setIsMobile(isSmallScreen);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  if (isMobile) {
    return (
      <div className="fixed inset-0 z-[9999] bg-background text-foreground flex flex-col items-center justify-center p-8 text-center font-sans overflow-hidden">
        {/* Notebook Background Elements */}
        <div className="absolute inset-0 notebook-lines opacity-20" />
        <div className="absolute inset-y-0 left-12 w-px bg-[hsl(var(--notebook-margin))] opacity-30" />
        
        <div className="relative z-10 space-y-6 max-w-md">
          <div className="relative inline-block">
            <div className="absolute inset-0 bg-primary/5 blur-2xl rounded-full" />
            <Monitor className="w-12 h-12 text-primary relative z-10 mx-auto" />
          </div>

          <h1 
            className="text-2xl font-bold tracking-tight text-foreground leading-tight"
            style={{ fontFamily: "'Courier New', Courier, monospace" }}
          >
            Animate2D is only available on desktop
          </h1>
        </div>

        {/* Brand Watermark */}
        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex items-center gap-2 select-none">
          <span 
            className="font-bold tracking-tighter text-3xl flex drop-shadow-sm"
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
          </span>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default DesktopOnlyGuard;
