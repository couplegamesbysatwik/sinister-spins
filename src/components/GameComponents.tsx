import React, { useEffect, useRef } from 'react';
import { motion, useAnimation, AnimatePresence, useMotionValue, useSpring, useTransform } from 'motion/react';
import { cn } from '@/src/lib/utils';

interface CylinderProps {
  items: string[];
  selectedIndex: number | null;
  isSpinning: boolean;
  delay?: number;
  className?: string;
}

export const Cylinder: React.FC<CylinderProps> = ({ items, selectedIndex, isSpinning, delay = 0, className }) => {
  const controls = useAnimation();
  const itemHeight = 60; // height of each item in pixels
  
  // Use 10x duplication for absolute safety and seamlessness
  const displayItems = React.useMemo(() => {
    if (!items || items.length === 0) return [];
    return Array(10).fill(items).flat();
  }, [items]);

  const totalHeight = items.length * itemHeight;

  useEffect(() => {
    if (!items || items.length === 0) return;

    if (isSpinning) {
      // Start rapid spinning - loop through the middle sections
      controls.start({
        y: [-totalHeight * 2, -totalHeight * 5],
        transition: {
          duration: 0.8,
          repeat: Infinity,
          ease: "linear",
        }
      });
    } else if (selectedIndex !== null) {
      // Snap to the 5th set of items for a centered, safe landing
      const k = (items.length * 4) + selectedIndex;
      const targetY = 60 - (k * itemHeight);
      
      controls.start({
        y: targetY,
        transition: {
          type: "spring",
          stiffness: 45,
          damping: 12,
          mass: 0.8,
          delay: delay,
        }
      });
    } else {
      // Idle or Reset state - snap back instantly to the 2nd set
      // Using set instead of start to prevent the rolling back animation
      controls.set({ y: -totalHeight });
    }
  }, [isSpinning, selectedIndex, controls, totalHeight, items, delay]);

  if (!items || items.length === 0) return null;

  const getFontSize = (text: string) => {
    if (text.length > 25) return 'text-xs';
    if (text.length > 18) return 'text-sm';
    if (text.length > 12) return 'text-base';
    return 'text-lg';
  };

  return (
    <div className={cn("relative h-[180px] w-full overflow-hidden border-y border-rose/20 bg-midnight/50 backdrop-blur-sm", className)}>
      {/* Selection Overlay */}
      <div className="absolute inset-x-0 top-[60px] h-[60px] border-y border-rose/40 bg-rose/5 pointer-events-none z-10" />
      
      {/* Gradient Fades */}
      <div className="absolute inset-0 bg-gradient-to-b from-midnight via-transparent to-midnight pointer-events-none z-20" />

      <motion.div
        animate={controls}
        initial={{ y: -totalHeight }}
        style={{ scale: isSpinning ? 0.95 : 1 }}
        className="flex flex-col items-center transition-transform duration-500"
      >
        {displayItems.map((item, index) => (
          <div
            key={`${item}-${index}`}
            className={cn(
              "flex h-[60px] items-center justify-center px-4 text-center font-serif transition-all duration-500 leading-tight",
              getFontSize(item),
              !isSpinning && selectedIndex !== null && (index % items.length) === selectedIndex 
                ? "text-rose text-glow-rose scale-110" 
                : "text-cream/40"
            )}
          >
            {item}
          </div>
        ))}
      </motion.div>
    </div>
  );
};

export const Background: React.FC = () => {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { damping: 50, stiffness: 50 };
  const springX = useSpring(mouseX, springConfig);
  const springY = useSpring(mouseY, springConfig);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const { clientX, clientY } = e;
      const { innerWidth, innerHeight } = window;
      mouseX.set((clientX / innerWidth) - 0.5);
      mouseY.set((clientY / innerHeight) - 0.5);
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [mouseX, mouseY]);

  const moveX1 = useTransform(springX, [-0.5, 0.5], [-30, 30]);
  const moveY1 = useTransform(springY, [-0.5, 0.5], [-30, 30]);

  const moveX2 = useTransform(springX, [-0.5, 0.5], [50, -50]);
  const moveY2 = useTransform(springY, [-0.5, 0.5], [50, -50]);

  const moveX3 = useTransform(springX, [-0.5, 0.5], [-20, 20]);
  const moveY3 = useTransform(springY, [-0.5, 0.5], [20, -20]);

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden bg-midnight">
      {/* Silk/Smoke Gradients */}
      <motion.div 
        style={{ x: moveX1, y: moveY1 }}
        className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] rounded-full bg-velvet/20 blur-[120px] animate-smoke" 
      />
      <motion.div 
        style={{ x: moveX2, y: moveY2 }}
        className="absolute bottom-[-10%] right-[-10%] w-[70%] h-[70%] rounded-full bg-velvet-light/10 blur-[150px] animate-smoke" 
      />
      <motion.div 
        style={{ x: moveX3, y: moveY3 }}
        className="absolute top-[30%] right-[10%] w-[40%] h-[40%] rounded-full bg-rose/5 blur-[100px] animate-smoke" 
      />
      
      {/* Subtle Noise Texture */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
    </div>
  );
};
