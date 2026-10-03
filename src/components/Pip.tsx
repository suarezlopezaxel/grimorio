import React from 'react';

type PipState = 'available' | 'used' | 'empty';

export function Pip({
  state,
  onClick,
  disabled,
  title,
}: {
  state: PipState;
  onClick?: () => void;
  disabled?: boolean;
  title?: string;
}) {
  const content = (
    <span className="pip__inner" aria-hidden />
  );

  if (onClick) {
    return (
      <button
        type="button"
        title={title}
        onClick={onClick}
        disabled={disabled}
        className="pip"
        aria-disabled={disabled}
        data-state={state}
      >
        {content}
      </button>
    );
  }

  return (
    <div className="pip" data-state={state} title={title} aria-hidden>
      {content}
    </div>
  );
}
