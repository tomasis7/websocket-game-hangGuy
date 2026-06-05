import React, { useMemo, useRef, useEffect } from 'react';

// Each body part with its key and SVG element
const BODY_PARTS: { key: string; el: React.ReactElement }[] = [
  { key: 'head',       el: <circle cx="80" cy="50" r="12" /> },
  { key: 'body',       el: <line x1="80" y1="62" x2="80" y2="105" /> },
  { key: 'left-arm',  el: <line x1="80" y1="75" x2="62" y2="92" /> },
  { key: 'right-arm', el: <line x1="80" y1="75" x2="98" y2="92" /> },
  { key: 'left-leg',  el: <line x1="80" y1="105" x2="62" y2="130" /> },
  { key: 'right-leg', el: <line x1="80" y1="105" x2="98" y2="130" /> },
  { key: 'left-foot', el: <line x1="62" y1="130" x2="55" y2="142" /> },
  { key: 'right-foot',el: <line x1="98" y1="130" x2="105" y2="142" /> },
];

// Facial expression paths based on stage
function getFaceExpression(stage: number) {
  if (stage <= 2) {
    // Neutral smile
    return <path d="M74 56 Q80 61 86 56" fill="none" strokeWidth="2" />;
  } else if (stage <= 5) {
    // Worried flat
    return <line x1="74" y1="58" x2="86" y2="58" strokeWidth="2" />;
  } else {
    // Scared frown
    return <path d="M74 60 Q80 55 86 60" fill="none" strokeWidth="2" />;
  }
}

// Eyes
function getEyes(stage: number) {
  if (stage >= 8) {
    // X eyes when out of guesses
    return (
      <g strokeWidth="1.5">
        <line x1="75" y1="46" x2="78" y2="49" />
        <line x1="78" y1="46" x2="75" y2="49" />
        <line x1="82" y1="46" x2="85" y2="49" />
        <line x1="85" y1="46" x2="82" y2="49" />
      </g>
    );
  }
  return (
    <g fill="currentColor">
      <circle cx="76" cy="48" r="1.5" />
      <circle cx="84" cy="48" r="1.5" />
    </g>
  );
}

interface AnimatedPartProps {
  children: React.ReactNode;
  partKey: string;
}

function AnimatedPart({ children, partKey }: AnimatedPartProps) {
  const ref = useRef<SVGGElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) {return;}
    el.style.animation = 'none';
    // Force reflow so the fade re-runs when a new part appears
    void (el as unknown as HTMLElement).offsetHeight;
    el.style.animation = 'part-in 0.25s ease-out both';
  }, [partKey]);

  return (
    <g ref={ref} style={{ animation: 'part-in 0.25s ease-out both' }}>
      {children}
    </g>
  );
}

export const HangmanSVGs: React.FC<{ stage: number; className?: string }> = ({ stage, className }) => {
  const clampedStage = Math.max(0, Math.min(8, stage));

  const parts = useMemo(
    () => BODY_PARTS.slice(0, clampedStage),
    [clampedStage]
  );

  return (
    <div className={`relative flex items-center justify-center ${className ?? ''}`}>
      <svg
        viewBox="0 0 140 165"
        className="w-36 h-48 sm:w-44 sm:h-56 lg:w-52 lg:h-64"
        role="img"
        aria-label={`Hangman: ${clampedStage} of 8 incorrect guesses`}
      >
        {/* Gallows */}
        <g stroke="var(--muted)" strokeWidth="4" fill="none" strokeLinecap="round">
          <line x1="20" y1="155" x2="120" y2="155" />
          <line x1="40" y1="155" x2="40" y2="20" />
          <line x1="40" y1="20" x2="80" y2="20" />
          <line x1="80" y1="20" x2="80" y2="38" />
        </g>

        {/* Body parts — drawn in the lime accent */}
        <g stroke="var(--accent)" strokeWidth="4" fill="none" strokeLinecap="round">
          {parts.map(({ key, el }) => (
            <AnimatedPart key={key} partKey={key}>
              {el}
            </AnimatedPart>
          ))}
          {/* Face details appear with head (stage >= 1) */}
          {clampedStage >= 1 && (
            <g stroke="var(--accent)" fill="none">
              {getEyes(clampedStage)}
              {getFaceExpression(clampedStage)}
            </g>
          )}
        </g>
      </svg>
    </div>
  );
};
