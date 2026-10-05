import React from 'react';
import { ClassId } from '../../types/character';
import { ClassStyledContainer } from './ClassStyledContainer';

interface Props {
  classId: ClassId;
  children: React.ReactNode;
  className?: string;
  glow?: boolean;
}

export const ClassWidgetFrame: React.FC<Props> = ({ classId, children, className = '', glow = false }) => {
  return (
    <ClassStyledContainer
      classId={classId}
      variant="widget"
      withCorners={true}
      className={`p-4 md:p-5 ${glow ? 'shadow-2xl' : ''} ${className}`}
    >
      {children}
    </ClassStyledContainer>
  );
};
