import { useEffect, useRef } from 'react';

export function useScrollAnimation() {
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    // Create a new Intersection Observer
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          // Add the active class when the element is in view
          if (entry.isIntersecting) {
            entry.target.classList.add('slide-in-active');
          }
        });
      },
      {
        threshold: 0.1, // Trigger when at least 10% of the element is visible
        rootMargin: '50px', // Start animation slightly before the element comes into view
      }
    );

    // Get all elements with animation classes
    const elements = document.querySelectorAll(
      '.slide-in-left, .slide-in-right, .slide-in-up'
    );

    // Observe each element
    elements.forEach((element) => {
      if (observerRef.current) {
        observerRef.current.observe(element);
      }
    });

    // Cleanup
    return () => {
      if (observerRef.current) {
        elements.forEach((element) => {
          observerRef.current?.unobserve(element);
        });
      }
    };
  }, []); // Empty dependency array means this effect runs once on mount
}