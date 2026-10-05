import React from 'react';
import { ClassKey } from '../types';

export type ContainerVariant = 'widget' | 'box' | 'subbox' | 'mod';

export interface ClassStyledContainerProps {
  classId: ClassKey;
  variant?: ContainerVariant;
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  hoverable?: boolean;
  withCorners?: boolean;
}

export const ClassStyledContainer: React.FC<ClassStyledContainerProps> = ({
  classId,
  variant = 'box',
  children,
  className = '',
  onClick,
  hoverable = false,
  withCorners = false,
}) => {
  // Resolve base CSS class based on variant and classId
  const getVariantClass = () => {
    switch (variant) {
      case 'widget':
        return `theme-widget-${classId} rounded-2xl`;
      case 'box':
        return `theme-box-${classId} rounded-xl`;
      case 'subbox':
        return `theme-subbox-${classId} rounded-xl`;
      case 'mod':
        return `theme-mod-${classId} rounded-full`;
      default:
        return `theme-box-${classId} rounded-xl`;
    }
  };

  const renderCorners = () => {
    if (!withCorners && variant !== 'widget') return null;

    switch (classId) {
      case 'barbaro':
        return (
          <>
            <span className="pointer-events-none absolute top-1 left-2 text-sm select-none drop-shadow">🦴</span>
            <span className="pointer-events-none absolute top-1 right-2 text-sm select-none scale-x-[-1] drop-shadow">🦴</span>
            <span className="pointer-events-none absolute bottom-1 left-2 text-xs select-none rotate-45">🦴</span>
            <span className="pointer-events-none absolute bottom-1 right-2 text-xs select-none -rotate-45">🦴</span>
            <div className="pointer-events-none absolute top-1 inset-x-12 flex justify-between text-[10px] text-red-500/30 font-mono select-none">
              <span>ᚠ</span>
              <span>ᚱ</span>
              <span>ᛟ</span>
              <span>ᚦ</span>
            </div>
          </>
        );

      case 'druida':
        return (
          <>
            <span className="pointer-events-none absolute top-1 left-2 text-sm text-emerald-400 select-none">🍃</span>
            <span className="pointer-events-none absolute top-1 right-2 text-sm text-emerald-400 select-none scale-x-[-1]">🍃</span>
            <span className="pointer-events-none absolute bottom-1 left-2 text-sm text-amber-500/80 select-none">🌿</span>
            <span className="pointer-events-none absolute bottom-1 right-2 text-sm text-amber-500/80 select-none scale-x-[-1]">🌿</span>
            <div className="pointer-events-none absolute top-2 right-8 w-2 h-2 rounded-full bg-amber-400/70 shadow-[0_0_8px_#f59e0b]" />
          </>
        );

      case 'bardo':
        return (
          <>
            <span className="pointer-events-none absolute top-1 left-2 text-base text-amber-300 select-none">𝄞</span>
            <span className="pointer-events-none absolute top-1 right-2 text-base text-amber-300 select-none scale-x-[-1]">𝄞</span>
            <span className="pointer-events-none absolute bottom-1 left-3 text-xs text-amber-400/70 select-none">📯</span>
            <span className="pointer-events-none absolute bottom-1 right-3 text-xs text-amber-400/70 select-none">♫</span>
            <div className="pointer-events-none absolute top-1.5 inset-x-12 h-2 flex flex-col justify-between opacity-35">
              <div className="border-t border-amber-300" />
              <div className="border-t border-amber-300" />
            </div>
          </>
        );

      case 'clerigo':
        return (
          <>
            <span className="pointer-events-none absolute top-1 left-2 text-sm text-amber-300 select-none">✠</span>
            <span className="pointer-events-none absolute top-1 right-2 text-sm text-amber-300 select-none">✠</span>
            <span className="pointer-events-none absolute bottom-1 left-3 text-xs text-amber-400/70 select-none">✦</span>
            <span className="pointer-events-none absolute bottom-1 right-3 text-xs text-amber-400/70 select-none">✦</span>
            <div className="pointer-events-none absolute top-0 inset-x-8 h-3 border-b border-amber-400/30 rounded-b-full" />
          </>
        );

      case 'guerrero':
        return (
          <>
            <div className="pointer-events-none absolute top-1.5 left-2 w-2.5 h-2.5 rounded-full bg-gradient-to-br from-slate-200 via-slate-400 to-slate-700 shadow-sm border border-slate-600" />
            <div className="pointer-events-none absolute top-1.5 right-2 w-2.5 h-2.5 rounded-full bg-gradient-to-br from-slate-200 via-slate-400 to-slate-700 shadow-sm border border-slate-600" />
            <div className="pointer-events-none absolute bottom-1.5 left-2 w-2.5 h-2.5 rounded-full bg-gradient-to-br from-slate-200 via-slate-400 to-slate-700 shadow-sm border border-slate-600" />
            <div className="pointer-events-none absolute bottom-1.5 right-2 w-2.5 h-2.5 rounded-full bg-gradient-to-br from-slate-200 via-slate-400 to-slate-700 shadow-sm border border-slate-600" />
            <div className="pointer-events-none absolute top-1 inset-x-0 flex justify-center text-[10px] text-slate-400/40 select-none">
              ⚔️
            </div>
          </>
        );

      case 'monje':
        return (
          <>
            <span className="pointer-events-none absolute top-1.5 right-2 text-[9px] font-bold text-rose-200 bg-rose-950 border border-rose-500/70 px-1 py-0.5 rounded shadow-sm select-none">
              氣
            </span>
            <span className="pointer-events-none absolute bottom-1 left-2 text-xs text-rose-400/60 select-none">☯</span>
          </>
        );

      case 'picaro':
        return (
          <>
            <span className="pointer-events-none absolute top-1 left-2 text-xs text-amber-400 select-none">♠</span>
            <span className="pointer-events-none absolute top-1 right-2 text-xs text-amber-400/80 select-none">🗝️</span>
            <span className="pointer-events-none absolute bottom-1 left-2 text-[10px] text-purple-300 select-none">🗡️</span>
            <span className="pointer-events-none absolute bottom-1 right-2 text-[10px] text-amber-400/80 select-none">♦</span>
            <div className="pointer-events-none absolute top-1 inset-x-8 text-[8px] text-amber-500/40 font-mono tracking-widest text-center select-none">
              ×--×--×--×
            </div>
          </>
        );

      case 'hechicero':
        return (
          <>
            <span className="pointer-events-none absolute top-1 left-2 text-sm text-pink-400 select-none animate-pulse">⚡</span>
            <span className="pointer-events-none absolute top-1 right-2 text-sm text-cyan-300 select-none animate-pulse">✵</span>
          </>
        );

      case 'brujo':
        return (
          <>
            <span className="pointer-events-none absolute top-1 left-2 text-sm text-emerald-400 select-none">👁️</span>
            <span className="pointer-events-none absolute bottom-1 right-2 text-sm text-emerald-500/80 select-none">🜏</span>
          </>
        );

      case 'mago':
        return (
          <>
            <span className="pointer-events-none absolute top-1 left-2 text-sm text-indigo-300 select-none">🜛</span>
            <span className="pointer-events-none absolute top-1 right-2 text-sm text-indigo-300 select-none">✧</span>
          </>
        );

      case 'artifice':
        return (
          <>
            <span className="pointer-events-none absolute top-1 left-2 text-sm text-orange-400 spin-slow select-none">⚙️</span>
            <div className="pointer-events-none absolute top-2 right-2.5 w-2.5 h-2.5 rounded-full bg-amber-400 border border-orange-700 shadow-sm" />
          </>
        );

      default:
        return null;
    }
  };

  return (
    <div
      onClick={onClick}
      className={`relative overflow-hidden transition-all duration-300 ${getVariantClass()} ${
        hoverable ? 'hover:scale-[1.01] hover:brightness-110 cursor-pointer' : ''
      } ${className}`}
    >
      {renderCorners()}
      <div className="relative z-10">{children}</div>
    </div>
  );
};

// Convenience specialized wrappers
export const ClassWidget: React.FC<Omit<ClassStyledContainerProps, 'variant'>> = (props) => (
  <ClassStyledContainer {...props} variant="widget" withCorners={props.withCorners ?? true} />
);

export const ClassBox: React.FC<Omit<ClassStyledContainerProps, 'variant'>> = (props) => (
  <ClassStyledContainer {...props} variant="box" />
);

export const ClassSubBox: React.FC<Omit<ClassStyledContainerProps, 'variant'>> = (props) => (
  <ClassStyledContainer {...props} variant="subbox" />
);
