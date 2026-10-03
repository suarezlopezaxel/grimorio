import React from 'react';

export function Panel({
  className = '',
  children,
  dataState,
  dataElement,
  ...rest
}: React.HTMLAttributes<HTMLDivElement> & {
  dataState?: string;
  dataElement?: string;
}) {
  return (
    <div
      {...rest}
      data-element={dataElement}
      data-state={dataState}
      className={`panel ${className}`}
    >
      {children}
    </div>
  );
}
