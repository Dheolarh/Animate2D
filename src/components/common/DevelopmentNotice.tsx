import React from 'react';
import { createPortal } from 'react-dom';
import { Construction, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface DevelopmentNoticeProps {
  isOpen: boolean;
  onClose: () => void;
}

const DevelopmentNotice: React.FC<DevelopmentNoticeProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 animate-in fade-in duration-200">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-background/60 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Content - Notebook Design */}
      <div className="relative w-full max-w-sm bg-white border border-border shadow-2xl rounded-xl overflow-hidden animate-in zoom-in-95 duration-200"
           style={{ 
             minHeight: '200px',
             backgroundImage: `
               linear-gradient(to right, transparent 39px, #ffb3b3 39px, #ffb3b3 41px, transparent 41px),
               linear-gradient(to bottom, transparent 31px, #e5e7eb 31px, #e5e7eb 32px)
             `,
             backgroundSize: '100% 100%, 100% 32px',
             fontFamily: "'Courier New', Courier, monospace"
           }}>
        
        {/* Header Padding for the notebook lines */}
        <div className="pt-12 pb-8 px-12 flex flex-col items-center text-center space-y-4">
          <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary mb-2">
            <Construction className="w-6 h-6" />
          </div>
          
          <div className="space-y-4">
            <h2 className="text-xl font-bold tracking-tight uppercase">Coming Soon</h2>
            <p className="text-black/70 text-sm leading-relaxed font-bold">
              This feature is currently in development and will be available in version 0.2.
            </p>
          </div>

          <Button 
            onClick={onClose}
            variant="outline"
            className="mt-4 border-2 border-black hover:bg-black hover:text-white transition-all font-bold uppercase tracking-widest text-xs"
          >
            Close
          </Button>
        </div>

        <button 
          onClick={onClose}
          className="absolute top-3 right-3 p-1 text-muted-foreground hover:text-foreground transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>,
    document.body
  );
};

export default DevelopmentNotice;
