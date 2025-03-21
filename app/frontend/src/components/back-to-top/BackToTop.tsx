import { ArrowUp } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "../ui/button";
import { cn } from "@/lib/utils";

interface BackToTopProps {
  scrollContainerSelector?: string;
  threshold?: number;
  className?: string;
}

export const BackToTop = ({
  scrollContainerSelector: scrollContainer,
  threshold = 100,
  className = "",
}: BackToTopProps) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const container = scrollContainer
      ? document.querySelector(scrollContainer)
      : window;

    if (!container) return;

    const handleScroll = () => {
      const scrollTop =
        container instanceof Window
          ? document.documentElement.scrollTop
          : (container as Element).scrollTop;

      setIsVisible(scrollTop > threshold);
    };

    container.addEventListener("scroll", handleScroll);
    return () => container.removeEventListener("scroll", handleScroll);
  }, [scrollContainer, threshold]);

  const scrollToTop = () => {
    const container = scrollContainer
      ? document.querySelector(scrollContainer)
      : window;

    if (!container) return;

    if (container instanceof Window) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      (container as Element).scrollTo({ top: 0 });
    }
  };

  if (!isVisible) return null;

  return (
    <Button
      variant="outline"
      size="icon"
      className={cn("rounded-full shadow-lg", className)}
      onClick={scrollToTop}
    >
      <ArrowUp className="h-4 w-4" />
    </Button>
  );
};
