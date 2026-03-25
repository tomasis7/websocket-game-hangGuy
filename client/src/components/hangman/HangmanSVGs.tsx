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
    // X eyes when dead
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
    // Force reflow
    void (el as unknown as HTMLElement).offsetHeight;
    el.style.animation = 'fade-scale-in 0.35s ease-out both';
  }, [partKey]);

  return (
    <g ref={ref} style={{ transformOrigin: 'center', animation: 'fade-scale-in 0.35s ease-out both' }}>
      {children}
    </g>
  );
}

export const HangmanSVGs: React.FC<{ stage: number; className?: string }> = ({ stage, className }) => {
  const clampedStage = Math.max(0, Math.min(8, stage));
  const isDanger = clampedStage >= 6;
  const isDead = clampedStage >= 8;

  const parts = useMemo(
    () => BODY_PARTS.slice(0, clampedStage),
    [clampedStage]
  );

  const strokeColor = isDanger ? 'var(--danger)' : 'var(--accent)';
  const gallowsColor = 'var(--text-muted)';

  return (
    <div className={`relative flex items-center justify-center ${className ?? ''}`}>
      {/* Danger glow ring */}
      {isDanger && (
        <div
          className="absolute rounded-full pointer-events-none"
          style={{
            width: '80%',
            height: '80%',
            background: 'radial-gradient(ellipse, rgba(244,63,94,0.15) 0%, transparent 70%)',
            animation: 'glow-pulse 1.2s ease-in-out infinite',
          }}
        />
      )}

      {/* Float animation wrapper */}
      <svg
        viewBox="0 0 140 165"
        className="w-40 h-52 sm:w-48 sm:h-60 lg:w-56 lg:h-72"
        role="img"
        aria-label={`Hangman: ${clampedStage} of 8 incorrect guesses`}
        style={isDead ? { filter: 'drop-shadow(0 0 8px var(--danger))' } : undefined}
      >
        <style>{`
          @keyframes fade-scale-in {
            from { opacity: 0; transform: scale(0.6); }
            to   { opacity: 1; transform: scale(1); }
          }
        `}</style>

        {/* Gallows */}
        <g stroke={gallowsColor} strokeWidth="4" fill="none" strokeLinecap="round">
          <line x1="20" y1="155" x2="120" y2="155" />
          <line x1="40" y1="155" x2="40" y2="20" />
          <line x1="40" y1="20" x2="80" y2="20" />
          <line x1="80" y1="20" x2="80" y2="38" />
        </g>

        {/* Body parts */}
        <g stroke={strokeColor} strokeWidth="4" fill="none" strokeLinecap="round">
          {parts.map(({ key, el }) => (
            <AnimatedPart key={key} partKey={key}>
              {el}
            </AnimatedPart>
          ))}
          {/* Face details appear with head (stage >= 1) */}
          {clampedStage >= 1 && (
            <g stroke={strokeColor} fill="none">
              {getEyes(clampedStage)}
              {getFaceExpression(clampedStage)}
            </g>
          )}
        </g>
      </svg>
    </div>
  );
};
