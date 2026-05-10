import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';

const SplashScreen: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate('/projects');
    }, 3000);

    return () => clearTimeout(timer);
  }, [navigate]);

  const handleClick = () => {
    navigate('/projects');
  };

  return (
    <div 
      className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center overflow-hidden cursor-pointer relative"
      onClick={handleClick}
    >
      <div className="absolute inset-0 notebook-lines opacity-20" />
      
      <div className="relative z-10 text-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="text-7xl md:text-9xl font-bold text-foreground mb-4 tracking-tight">
            Animate2D
          </h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="text-xl md:text-2xl text-muted-foreground font-mono"
          >
            Browser-Based Animation Studio
          </motion.p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1, duration: 0.6 }}
          className="mt-16 flex justify-center gap-8"
        >
          <motion.div
            animate={{ 
              x: [0, 10, 0],
              rotate: [0, 5, 0]
            }}
            transition={{ 
              duration: 2,
              repeat: Number.POSITIVE_INFINITY,
              ease: "easeInOut"
            }}
            className="w-16 h-16 bg-gradient-to-br from-primary to-primary/70 rounded-sm sketch-border shadow-lg"
          />
          <motion.div
            animate={{ 
              y: [0, -10, 0]
            }}
            transition={{ 
              duration: 1.5,
              repeat: Number.POSITIVE_INFINITY,
              ease: "easeInOut",
              delay: 0.3
            }}
            className="w-16 h-16 bg-gradient-to-br from-accent to-accent/70 rounded-sm sketch-border shadow-lg"
          />
          <motion.div
            animate={{ 
              x: [0, -10, 0],
              rotate: [0, -5, 0]
            }}
            transition={{ 
              duration: 2,
              repeat: Number.POSITIVE_INFINITY,
              ease: "easeInOut",
              delay: 0.6
            }}
            className="w-16 h-16 bg-gradient-to-br from-chart-2 to-chart-2/70 rounded-sm sketch-border shadow-lg"
          />
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2, duration: 0.5 }}
          className="mt-12 text-sm text-muted-foreground"
        >
          Click anywhere to continue
        </motion.p>
      </div>

      <div className="absolute bottom-8 left-0 right-0 text-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5, duration: 0.8 }}
          className="text-xs text-muted-foreground font-mono"
        >
          No login required • Auto-save to browser • Free to use
        </motion.div>
      </div>
    </div>
  );
};

export default SplashScreen;
