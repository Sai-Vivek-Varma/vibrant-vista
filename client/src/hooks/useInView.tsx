
import { useState, useEffect, useRef, RefObject } from "react";

interface IntersectionOptions {
  root?: Element | null;
  rootMargin?: string;
  threshold?: number | number[];
  once?: boolean;
  delay?: number;
  triggerOnce?: boolean;
}

export function useIntersectionObserver<T extends HTMLElement = HTMLDivElement>(
  options: IntersectionOptions = {}
): [RefObject<T>, boolean] {
  const {
    root = null,
    rootMargin = "0px",
    threshold = 0,
    once = false,
    delay = 0,
    triggerOnce = false,
  } = options;

  const ref = useRef<T>(null);
  const [isIntersecting, setIsIntersecting] = useState(false);
  const hasTriggered = useRef(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      const observer = new IntersectionObserver(
        ([entry]) => {
          // If triggerOnce is true and we've already triggered, don't update state
          if (triggerOnce && hasTriggered.current) {
            return;
          }
          
          setIsIntersecting(entry.isIntersecting);

          if (entry.isIntersecting) {
            hasTriggered.current = true;
            
            // If once is true, unobserve after intersection
            if (once && ref.current) {
              observer.unobserve(ref.current);
            }
          }
        },
        { root, rootMargin, threshold }
      );

      const currentRef = ref.current;

      if (currentRef) {
        observer.observe(currentRef);
      }

      return () => {
        if (currentRef) {
          observer.unobserve(currentRef);
        }
      };
    }, delay);

    return () => clearTimeout(timer);
  }, [root, rootMargin, threshold, once, delay, triggerOnce]);

  return [ref, isIntersecting];
}

// Enhanced hooks for smoother animation sequence
export function useInView(options: IntersectionOptions = {}) {
  return useIntersectionObserver(options);
}

// New hook for staggered animations
export function useStaggeredInView(count: number, delay = 0.1) {
  const [ref, isInView] = useInView({ 
    once: true,
    threshold: 0.1 
  });
  
  // Create an array of delays for staggered animations
  const staggerDelays = Array.from({ length: count }, (_, i) => i * delay);
  
  return { ref, isInView, staggerDelays };
}
