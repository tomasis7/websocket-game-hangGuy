import React, { useMemo } from 'react';

// Body parts rendered progressively based on stage
const BODY_PARTS: React.ReactElement[] = [
  <circle cx="80" cy="50" r="10" key="head" />,
  <line x1="80" y1="60" x2="80" y2="100" key="body" />,
  <line x1="80" y1="70" x2="65" y2="85" key="left-arm" />,
  <line x1="80" y1="70" x2="95" y2="85" key="right-arm" />,
  <line x1="80" y1="100" x2="65" y2="125" key="left-leg" />,
  <line x1="80" y1="100" x2="95" y2="125" key="right-leg" />,
  <line x1="65" y1="125" x2="60" y2="135" key="left-foot" />,
  <line x1="95" y1="125" x2="100" y2="135" key="right-foot" />,
];

export const HangmanSVGs: React.FC<{ stage: number; className?: string }> = ({ stage, className }) => {
  const clampedStage = Math.max(0, Math.min(8, stage));

  const parts = useMemo(
    () => BODY_PARTS.slice(0, clampedStage),
    [clampedStage]
  );

  return (
    <svg
      viewBox="0 0 120 160"
      className={className}
      role="img"
      aria-label={`Hangman: ${clampedStage} of 8 incorrect guesses`}
    >
      <g stroke="#222" strokeWidth="4" fill="none">
        {/* Gallows (always shown) */}
        <line x1="20" y1="150" x2="100" y2="150" />
        <line x1="40" y1="150" x2="40" y2="20" />
        <line x1="40" y1="20" x2="80" y2="20" />
        <line x1="80" y1="20" x2="80" y2="40" />
        {/* Body parts based on stage */}
        {parts}
      </g>
    </svg>
  );
};
