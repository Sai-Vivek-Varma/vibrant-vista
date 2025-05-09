
import { useEffect, useState } from 'react';
import { motion, useScroll, useSpring } from 'framer-motion';
import { ArrowUp } from 'lucide-react';

const ReadingProgressBar = () => {
  const [isVisible, setIsVisible] = useState(false);
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { 
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  useEffect(() => {
    const checkScrollPosition = () => {
      setIsVisible(window.scrollY > 100);
    };

    // Initial check
    checkScrollPosition();
    
    // Listen for scroll events
    window.addEventListener('scroll', checkScrollPosition);
    
    // Cleanup
    return () => window.removeEventListener('scroll', checkScrollPosition);
  }, []);

  return (
    <>
      <motion.div 
        className="fixed top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-primary via-secondary to-primary origin-[0%] z-50"
        style={{ scaleX }}
      />
      
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.3 }}
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="fixed bottom-8 right-8 bg-primary hover:bg-primary/90 text-white w-12 h-12 rounded-full flex items-center justify-center cursor-pointer shadow-lg transition-all duration-300 hover:scale-110 z-50"
          title="Back to top"
        >
          <ArrowUp className="w-5 h-5" />
        </motion.div>
      )}
    </>
  );
};

export default ReadingProgressBar;
