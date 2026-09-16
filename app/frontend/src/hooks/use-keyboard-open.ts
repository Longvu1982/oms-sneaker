import { useState, useEffect } from 'react';

export function useKeyboardStatus() {
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);

  useEffect(() => {
    // Check if the browser supports VisualViewport API (Safari 13+)
    if (!window.visualViewport) return;

    let initialHeight = window.visualViewport.height;

    const handleViewportChange = () => {
      const currentViewport = window.visualViewport;
      if (!currentViewport) return;

      // 1. Detect orientation change to recalibrate the baseline height
      // (If width changed significantly, the user rotated the screen)
      if (Math.abs(currentViewport.width - window.innerWidth) > 10) {
        initialHeight = currentViewport.height;
      }

      // 2. Compare the baseline height against current visual viewport height
      // If the visible height drops below ~85% of baseline, the keyboard is likely present
      const heightDifference = initialHeight - currentViewport.height;
      const isClosed = heightDifference < initialHeight * 0.15;

      setIsKeyboardOpen(!isClosed);
    };

    // Extra fallback for Safari's "Done" button or dismissal via tap-outside
    const handleFocusOut = () => {
      // Small timeout to see if another input is focusing next
      setTimeout(() => {
        const activeEl = document.activeElement;
        if (!activeEl || (activeEl.tagName !== 'INPUT' && activeEl.tagName !== 'TEXTAREA')) {
          setIsKeyboardOpen(false);
        }
      }, 20);
    };

    // Attach listeners
    window.visualViewport.addEventListener('resize', handleViewportChange);
    window.visualViewport.addEventListener('scroll', handleViewportChange);
    document.addEventListener('focusout', handleFocusOut);

    return () => {
      window.visualViewport?.removeEventListener('resize', handleViewportChange);
      window.visualViewport?.removeEventListener('scroll', handleViewportChange);
      document.removeEventListener('focusout', handleFocusOut);
    };
  }, []);

  return isKeyboardOpen;
}