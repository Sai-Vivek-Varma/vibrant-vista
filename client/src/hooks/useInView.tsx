import { useState, useEffect, useRef, RefObject } from "react";

interface IntersectionOptions {
  root?: Element | null;
  rootMargin?: string;
  threshold?: number | number[];
  once?: boolean;
  delay?: number;
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
  } = options;

  const ref = useRef<T>(null);
  const [isIntersecting, setIsIntersecting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      const observer = new IntersectionObserver(
        ([entry]) => {
          setIsIntersecting(entry.isIntersecting);

          if (entry.isIntersecting && once && ref.current) {
            observer.unobserve(ref.current);
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
  }, [root, rootMargin, threshold, once, delay]);

  return [ref, isIntersecting];
}

// Custom hook for Instagram-style scrolling
export function useInView(options: IntersectionOptions = {}) {
  return useIntersectionObserver(options);
}
