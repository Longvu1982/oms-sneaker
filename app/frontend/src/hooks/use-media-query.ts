import { useState, useEffect } from "react";

const useMediaQuery = (minWidth: number) => {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia(`(min-width: ${minWidth}px)`);
    const handleChange = () => setMatches(mediaQuery.matches);

    mediaQuery.addEventListener("change", handleChange);
    setMatches(mediaQuery.matches); // Initial check

    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [minWidth]);

  return matches;
};

export default useMediaQuery;
