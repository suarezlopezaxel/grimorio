import React from 'react';
import { CharacterSheet } from '../../types/character';

interface Props {
  character: CharacterSheet;
  onUpdate: (updated: CharacterSheet) => void;
}

// Este módulo está deshabilitado temporalmente (no renderiza UI).
export const ClericDomainModule: React.FC<Props> = () => {
  // Este módulo está deshabilitado temporalmente.
  // Nota: eliminamos código comentado/parcial que dejaba tokens sueltos y rompía el parser.
  return null;
};

