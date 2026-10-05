import React from 'react';
import { ClassStyledContainer, ContainerVariant } from './ClassStyledContainer';
import { useThemeClass } from './ThemedParts';
import type { ClassKey } from '../types';

export function Panel({
  className = '',
  children,
  dataState,
  dataElement,
  variant = 'box',
  ...rest
}: React.HTMLAttributes<HTMLDivElement> & {
  dataState?: string;
  dataElement?: string;
  variant?: ContainerVariant;
}) {
  const classId = useThemeClass() as ClassKey;
  return (
    <ClassStyledContainer classId={classId} variant={variant} className={`panel ${className}`}>
      <div
        {...rest}
        data-element={dataElement}
        data-state={dataState}
      >
        {children}
      </div>
    </ClassStyledContainer>
  );
}
