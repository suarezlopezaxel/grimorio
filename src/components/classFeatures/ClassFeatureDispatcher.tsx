import React from 'react';
import { CharacterSheet, ClassId } from '../../types/character';
import { BardicInspirationModule } from './BardicInspirationModule';
import { DruidWildShapeModule } from './DruidWildShapeModule';
import { BarbarianRageModule } from './BarbarianRageModule';
import { ClericDomainModule } from './ClericDomainModule';
import { FighterActionSurgeModule } from './FighterActionSurgeModule';
import { MonkKiModule } from './MonkKiModule';
import { PaladinOathModule } from './PaladinOathModule';
import { RogueStealthModule } from './RogueStealthModule';
import { RangerTrackerModule } from './RangerTrackerModule';
import { SorcererMetamagicModule } from './SorcererMetamagicModule';
import { WarlockPactModule } from './WarlockPactModule';
import { WizardSpellbookModule } from './WizardSpellbookModule';
import { ArtificerInfusionModule } from './ArtificerInfusionModule';

interface Props {
  character: CharacterSheet;
  onUpdate: (updated: CharacterSheet) => void;
  onTriggerShake?: () => void;
  onTriggerAuraPulse?: () => void;
  onEmitRipple?: (x: number, y: number) => void;
  onEmitNote?: (x: number, y: number) => void;
  onToggleStealthMode?: (active: boolean) => void;
  onRollDiceFormula?: (formula: string) => void;
  onTriggerWildSurge?: (result: string) => void;
}

export const ClassFeatureDispatcher: React.FC<Props> = ({
  character,
  onUpdate,
  onTriggerShake,
  onTriggerAuraPulse,
  onEmitRipple,
  onEmitNote,
  onToggleStealthMode,
  onRollDiceFormula,
  onTriggerWildSurge,
}) => {
  switch (character.classId) {
    case 'bardo':
      return (
        <BardicInspirationModule
          character={character}
          onUpdate={onUpdate}
          onEmitNote={onEmitNote}
        />
      );
    case 'druida':
      return <DruidWildShapeModule character={character} onUpdate={onUpdate} />;
    case 'barbaro':
      return (
        <BarbarianRageModule
          character={character}
          onUpdate={onUpdate}
          onTriggerShake={onTriggerShake}
        />
      );
    case 'clerigo':
      return <ClericDomainModule character={character} onUpdate={onUpdate} />;
    case 'guerrero':
      return (
        <FighterActionSurgeModule
          character={character}
          onUpdate={onUpdate}
          onRollHeal={onRollDiceFormula}
        />
      );
    case 'monje':
      return (
        <MonkKiModule
          character={character}
          onUpdate={onUpdate}
          onEmitRipple={onEmitRipple}
        />
      );
    case 'paladin':
      return (
        <PaladinOathModule
          character={character}
          onUpdate={onUpdate}
          onTriggerAuraPulse={onTriggerAuraPulse}
        />
      );
    case 'picaro':
      return (
        <RogueStealthModule
          character={character}
          onUpdate={onUpdate}
          onToggleStealthMode={onToggleStealthMode}
        />
      );
    case 'explorador':
      return <RangerTrackerModule character={character} onUpdate={onUpdate} />;
    case 'hechicero':
      return (
        <SorcererMetamagicModule
          character={character}
          onUpdate={onUpdate}
          onTriggerWildSurge={onTriggerWildSurge}
        />
      );
    case 'brujo':
      return <WarlockPactModule character={character} onUpdate={onUpdate} />;
    case 'mago':
      return <WizardSpellbookModule character={character} onUpdate={onUpdate} />;
    case 'artifice':
      return <ArtificerInfusionModule character={character} onUpdate={onUpdate} />;
    default:
      return <WizardSpellbookModule character={character} onUpdate={onUpdate} />;
  }
};
