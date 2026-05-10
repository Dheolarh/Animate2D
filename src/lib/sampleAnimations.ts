import type { AnimationAsset } from '@/types/animation';

export interface SampleAnimation {
  id: string;
  name: string;
  category: 'humanoid' | 'quadruped' | 'bird' | 'effects' | 'environment';
  frames: number;
  fps: number;
  description: string;
}

export const sampleAnimations: SampleAnimation[] = [
  { id: 'walk_cycle', name: 'Walk Cycle', category: 'humanoid', frames: 8, fps: 12, description: 'Basic walking animation' },
  { id: 'run_cycle', name: 'Run Cycle', category: 'humanoid', frames: 6, fps: 18, description: 'Running animation' },
  { id: 'idle', name: 'Idle/Breathing', category: 'humanoid', frames: 4, fps: 8, description: 'Idle breathing animation' },
  { id: 'jump', name: 'Jump + Land', category: 'humanoid', frames: 5, fps: 24, description: 'Jump and land sequence' },
  { id: 'crouch', name: 'Crouch', category: 'humanoid', frames: 3, fps: 12, description: 'Crouching animation' },
  { id: 'punch', name: 'Punch', category: 'humanoid', frames: 4, fps: 24, description: 'Punch attack' },
  { id: 'kick', name: 'Kick', category: 'humanoid', frames: 4, fps: 24, description: 'Kick attack' },
  { id: 'shoot', name: 'Shoot', category: 'humanoid', frames: 5, fps: 24, description: 'Shooting animation' },
  { id: 'fall', name: 'Fall + Hit Ground', category: 'humanoid', frames: 6, fps: 18, description: 'Falling animation' },
  { id: 'wave', name: 'Wave', category: 'humanoid', frames: 4, fps: 12, description: 'Waving gesture' },
  { id: 'death', name: 'Death', category: 'humanoid', frames: 5, fps: 18, description: 'Death animation' },
  { id: 'push', name: 'Push', category: 'humanoid', frames: 4, fps: 12, description: 'Pushing animation' },
  { id: 'climb', name: 'Climb', category: 'humanoid', frames: 6, fps: 12, description: 'Climbing animation' },
  
  { id: 'quad_walk', name: 'Walk Cycle', category: 'quadruped', frames: 8, fps: 12, description: 'Quadruped walk' },
  { id: 'quad_run', name: 'Run Cycle', category: 'quadruped', frames: 6, fps: 18, description: 'Quadruped run' },
  { id: 'quad_idle', name: 'Idle', category: 'quadruped', frames: 3, fps: 8, description: 'Quadruped idle' },
  { id: 'quad_jump', name: 'Jump', category: 'quadruped', frames: 4, fps: 18, description: 'Quadruped jump' },
  { id: 'quad_sit', name: 'Sit Down', category: 'quadruped', frames: 3, fps: 12, description: 'Sitting animation' },
  
  { id: 'bird_flap', name: 'Flap Cycle', category: 'bird', frames: 4, fps: 12, description: 'Wing flapping' },
  { id: 'bird_glide', name: 'Glide', category: 'bird', frames: 2, fps: 8, description: 'Gliding animation' },
  { id: 'bird_land', name: 'Land', category: 'bird', frames: 3, fps: 18, description: 'Landing animation' },
  
  { id: 'explosion', name: 'Explosion Burst', category: 'effects', frames: 8, fps: 24, description: 'Explosion effect' },
  { id: 'smoke', name: 'Smoke Puff', category: 'effects', frames: 6, fps: 18, description: 'Smoke cloud' },
  { id: 'dust', name: 'Dust Cloud', category: 'effects', frames: 5, fps: 18, description: 'Dust particle effect' },
  { id: 'muzzle_flash', name: 'Muzzle Flash', category: 'effects', frames: 3, fps: 24, description: 'Gun muzzle flash' },
  { id: 'hit_spark', name: 'Hit Spark', category: 'effects', frames: 4, fps: 24, description: 'Impact spark' },
  { id: 'speed_lines', name: 'Speed Lines', category: 'effects', frames: 3, fps: 18, description: 'Motion lines' },
  { id: 'water_splash', name: 'Water Splash', category: 'effects', frames: 5, fps: 18, description: 'Water splash' },
  { id: 'fire_loop', name: 'Fire Loop', category: 'effects', frames: 6, fps: 18, description: 'Looping fire' },
  { id: 'electric_zap', name: 'Electric Zap', category: 'effects', frames: 4, fps: 24, description: 'Electric effect' },
  { id: 'star_impact', name: 'Star Impact', category: 'effects', frames: 4, fps: 24, description: 'Star burst' },
  
  { id: 'rain', name: 'Rain Loop', category: 'environment', frames: 3, fps: 12, description: 'Falling rain' },
  { id: 'leaves', name: 'Falling Leaves', category: 'environment', frames: 5, fps: 12, description: 'Leaves falling' },
  { id: 'water_flow', name: 'Water Flow', category: 'environment', frames: 4, fps: 12, description: 'Flowing water' },
  { id: 'lightning', name: 'Lightning Flash', category: 'environment', frames: 3, fps: 24, description: 'Lightning bolt' }
];

const createPlaceholderFrame = (width: number, height: number, text: string): string => {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  
  if (ctx) {
    ctx.fillStyle = '#f0f0f0';
    ctx.fillRect(0, 0, width, height);
    
    ctx.strokeStyle = '#cccccc';
    ctx.strokeRect(0, 0, width, height);
    
    ctx.fillStyle = '#666666';
    ctx.font = '12px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, width / 2, height / 2);
  }
  
  return canvas.toDataURL();
};

export const createSampleAsset = (sample: SampleAnimation): AnimationAsset => {
  const width = 128;
  const height = 128;
  
  const frames = Array.from({ length: sample.frames }, (_, i) => ({
    id: `${sample.id}_frame_${i}`,
    imageData: createPlaceholderFrame(width, height, `${sample.name}\nFrame ${i + 1}`)
  }));

  return {
    id: `sample_${sample.id}`,
    name: sample.name,
    type: 'animation',
    frames,
    fps: sample.fps,
    width,
    height,
    createdAt: Date.now()
  };
};

export const getSamplesByCategory = (category: string) => {
  return sampleAnimations.filter(s => s.category === category);
};

export const getAllSampleAssets = (): AnimationAsset[] => {
  return sampleAnimations.map(createSampleAsset);
};
