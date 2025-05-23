// Droplet is a reusable UI component that displays its children inside a styled, animated circle.
// It animates (wobbles) when its children change (e.g., when the like count increases).
// The component accepts an onClick handler and any ReactNode as children.
import { useEffect, useState, type ReactNode } from "react";

interface Props {
  onClick: () => void; // Function to call when the droplet is clicked
  children: ReactNode; // Content to display inside the droplet (e.g., like count)
}

export default function Droplet({ children, onClick }: Props) {
  // wobble controls whether the wobble animation is active
  const [wobble, setWobble] = useState(false);
  // animationKey is used to force React to re-render the component and restart the animation
  const [animationKey, setAnimationKey] = useState(0);

  // handleAnimationEnd resets the wobble state when the animation finishes
  const handleAnimationEnd = () => {
    setWobble(false);
  };

  // When the children (like count) changes, trigger the wobble animation
  useEffect(() => {
    setAnimationKey((prev) => prev + 1);
    setWobble(true);
  }, [children]);

  return (
    <div
      key={animationKey}
      onClick={onClick}
      onAnimationEnd={handleAnimationEnd}
      className={`
          w-56 h-56                     // Size of the droplet
          flex items-center justify-center
          rounded-full                  // Makes the div circular
          bg-blue-600 text-white
          text-5xl font-extrabold
          cursor-pointer select-none
          shadow-2xl                    // Adds a shadow effect
          ${
            wobble ? "animate-wobble" : ""
          } // Applies wobble animation if active
        `}
    >
      {children}
    </div>
  );
}
