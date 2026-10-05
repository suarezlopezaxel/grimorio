import React from 'react';
import { ClassId } from '../../types/character';
import { ClassStyledContainer } from './ClassStyledContainer';

interface Props {
  classId: ClassId;
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  hoverable?: boolean;
}

export const ClassSubCard: React.FC<Props> = ({
  classId,
  children,
  className = '',
  onClick,
  hoverable = false,
}) => {
  return (
    <ClassStyledContainer
      classId={classId}
      variant="subbox"
      className={className}
      onClick={onClick}
      hoverable={hoverable}
    >
      {children}
    </ClassStyledContainer>
  );
};
