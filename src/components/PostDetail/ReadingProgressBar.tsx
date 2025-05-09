
import { useEffect, useState } from 'react';
import { motion, useScroll, useSpring } from 'framer-motion';

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
      // Only show progress bar after scrolling a bit (e.g., 100px)
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
        className="fixed top-0 left-0 right-0 h-1 bg-primary origin-[0%] z-50"
        style={{ scaleX }}
      />
      
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="fixed bottom-8 right-8 bg-primary hover:bg-primary/90 text-white w-10 h-10 rounded-full flex items-center justify-center cursor-pointer shadow-lg transition-transform hover:scale-110"
          title="Back to top"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
          </svg>
        </motion.div>
      )}
    </>
  );
};

export default ReadingProgressBar;
