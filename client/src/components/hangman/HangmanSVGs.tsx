import React from 'react';

// 9 SVG stages: 0 (empty gallows) to 8 (full hangman)
export const HangmanSVGs: React.FC<{ stage: number; className?: string }> = ({ stage, className }) => {
  // Each SVG builds on the previous one
  const stages = [
    // 0: Empty gallows
    <svg viewBox="0 0 120 160" className={className} key={0}>
      <g stroke="#222" strokeWidth="4" fill="none">
        <line x1="20" y1="150" x2="100" y2="150" /> {/* base */}
        <line x1="40" y1="150" x2="40" y2="20" />   {/* pole */}
        <line x1="40" y1="20" x2="80" y2="20" />     {/* top bar */}
        <line x1="80" y1="20" x2="80" y2="40" />     {/* rope */}
      </g>
    </svg>,
    // 1: Head
    <svg viewBox="0 0 120 160" className={className} key={1}>
      <g stroke="#222" strokeWidth="4" fill="none">
        <line x1="20" y1="150" x2="100" y2="150" />
        <line x1="40" y1="150" x2="40" y2="20" />
        <line x1="40" y1="20" x2="80" y2="20" />
        <line x1="80" y1="20" x2="80" y2="40" />
        <circle cx="80" cy="50" r="10" /> {/* head */}
      </g>
    </svg>,
    // 2: Body
    <svg viewBox="0 0 120 160" className={className} key={2}>
      <g stroke="#222" strokeWidth="4" fill="none">
        <line x1="20" y1="150" x2="100" y2="150" />
        <line x1="40" y1="150" x2="40" y2="20" />
        <line x1="40" y1="20" x2="80" y2="20" />
        <line x1="80" y1="20" x2="80" y2="40" />
        <circle cx="80" cy="50" r="10" />
        <line x1="80" y1="60" x2="80" y2="100" /> {/* body */}
      </g>
    </svg>,
    // 3: Left arm
    <svg viewBox="0 0 120 160" className={className} key={3}>
      <g stroke="#222" strokeWidth="4" fill="none">
        <line x1="20" y1="150" x2="100" y2="150" />
        <line x1="40" y1="150" x2="40" y2="20" />
        <line x1="40" y1="20" x2="80" y2="20" />
        <line x1="80" y1="20" x2="80" y2="40" />
        <circle cx="80" cy="50" r="10" />
        <line x1="80" y1="60" x2="80" y2="100" />
        <line x1="80" y1="70" x2="65" y2="85" /> {/* left arm */}
      </g>
    </svg>,
    // 4: Right arm
    <svg viewBox="0 0 120 160" className={className} key={4}>
      <g stroke="#222" strokeWidth="4" fill="none">
        <line x1="20" y1="150" x2="100" y2="150" />
        <line x1="40" y1="150" x2="40" y2="20" />
        <line x1="40" y1="20" x2="80" y2="20" />
        <line x1="80" y1="20" x2="80" y2="40" />
        <circle cx="80" cy="50" r="10" />
        <line x1="80" y1="60" x2="80" y2="100" />
        <line x1="80" y1="70" x2="65" y2="85" />
        <line x1="80" y1="70" x2="95" y2="85" /> {/* right arm */}
      </g>
    </svg>,
    // 5: Left leg
    <svg viewBox="0 0 120 160" className={className} key={5}>
      <g stroke="#222" strokeWidth="4" fill="none">
        <line x1="20" y1="150" x2="100" y2="150" />
        <line x1="40" y1="150" x2="40" y2="20" />
        <line x1="40" y1="20" x2="80" y2="20" />
        <line x1="80" y1="20" x2="80" y2="40" />
        <circle cx="80" cy="50" r="10" />
        <line x1="80" y1="60" x2="80" y2="100" />
        <line x1="80" y1="70" x2="65" y2="85" />
        <line x1="80" y1="70" x2="95" y2="85" />
        <line x1="80" y1="100" x2="65" y2="125" /> {/* left leg */}
      </g>
    </svg>,
    // 6: Right leg
    <svg viewBox="0 0 120 160" className={className} key={6}>
      <g stroke="#222" strokeWidth="4" fill="none">
        <line x1="20" y1="150" x2="100" y2="150" />
        <line x1="40" y1="150" x2="40" y2="20" />
        <line x1="40" y1="20" x2="80" y2="20" />
        <line x1="80" y1="20" x2="80" y2="40" />
        <circle cx="80" cy="50" r="10" />
        <line x1="80" y1="60" x2="80" y2="100" />
        <line x1="80" y1="70" x2="65" y2="85" />
        <line x1="80" y1="70" x2="95" y2="85" />
        <line x1="80" y1="100" x2="65" y2="125" />
        <line x1="80" y1="100" x2="95" y2="125" /> {/* right leg */}
      </g>
    </svg>,
    // 7: Left foot
    <svg viewBox="0 0 120 160" className={className} key={7}>
      <g stroke="#222" strokeWidth="4" fill="none">
        <line x1="20" y1="150" x2="100" y2="150" />
        <line x1="40" y1="150" x2="40" y2="20" />
        <line x1="40" y1="20" x2="80" y2="20" />
        <line x1="80" y1="20" x2="80" y2="40" />
        <circle cx="80" cy="50" r="10" />
        <line x1="80" y1="60" x2="80" y2="100" />
        <line x1="80" y1="70" x2="65" y2="85" />
        <line x1="80" y1="70" x2="95" y2="85" />
        <line x1="80" y1="100" x2="65" y2="125" />
        <line x1="80" y1="100" x2="95" y2="125" />
        <line x1="65" y1="125" x2="60" y2="135" /> {/* left foot */}
      </g>
    </svg>,
    // 8: Right foot (full hangman)
    <svg viewBox="0 0 120 160" className={className} key={8}>
      <g stroke="#222" strokeWidth="4" fill="none">
        <line x1="20" y1="150" x2="100" y2="150" />
        <line x1="40" y1="150" x2="40" y2="20" />
        <line x1="40" y1="20" x2="80" y2="20" />
        <line x1="80" y1="20" x2="80" y2="40" />
        <circle cx="80" cy="50" r="10" />
        <line x1="80" y1="60" x2="80" y2="100" />
        <line x1="80" y1="70" x2="65" y2="85" />
        <line x1="80" y1="70" x2="95" y2="85" />
        <line x1="80" y1="100" x2="65" y2="125" />
        <line x1="80" y1="100" x2="95" y2="125" />
        <line x1="65" y1="125" x2="60" y2="135" />
        <line x1="95" y1="125" x2="100" y2="135" /> {/* right foot */}
      </g>
    </svg>,
  ];

  // Clamp stage between 0 and 8
  const idx = Math.max(0, Math.min(8, stage));
  return stages[idx];
};