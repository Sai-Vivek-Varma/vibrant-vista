
import { useEffect } from 'react';

const ReadingProgressBar = () => {
  useEffect(() => {
    const updateReadingProgress = () => {
      const progressBar = document.getElementById('reading-progress-bar');
      if (!progressBar) return;
      
      const totalHeight = document.body.scrollHeight - window.innerHeight;
      const progress = (window.scrollY / totalHeight) * 100;
      progressBar.style.width = `${progress}%`;
    };
    
    window.addEventListener('scroll', updateReadingProgress);
    return () => window.removeEventListener('scroll', updateReadingProgress);
  }, []);

  return (
    <div className="sticky top-0 z-10 w-full h-1 bg-gray-200">
      <div 
        id="reading-progress-bar"
        className="h-full bg-primary transition-all duration-100"
        style={{ width: '0%' }}
      />
    </div>
  );
};

export default ReadingProgressBar;
