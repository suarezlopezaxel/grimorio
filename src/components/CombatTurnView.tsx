import React, { useEffect, useState } from 'react';
import { Ability, ActiveEffect, AppSettings, CharacterSheet, CombatRoundState, ConditionId, DiceRollOutcome, Encounter, RollKind, TacticalCard, TrackedAction } from '../types';
import { getActiveConcentration } from '../lib/concentration';
import { doubleDice, parseDiceExpression } from '../lib/critical';
import { getSpellAttackModifier, getTacticalCardDamageRoll, parseDiceFormula } from '../utils/characterMechanics';
import { CONDITIONS } from '../data/conditions';
import { effectiveSpeed } from '../lib/conditions';
import { advanceActiveEffects, removeConcentrationEffects } from '../lib/activeEffects';
import { advanceEncounter } from '../lib/initiative';
import { InitiativeTracker } from './InitiativeTracker';
import { combatFlagForAction, trackedActionForActionType, trackedActionForSpell } from '../lib/actionTracking';
import { upcastDamage } from '../lib/upcasting';

import { ClassTheme } from '../types';

interface CombatTurnViewProps {
  combatState: CombatRoundState;
  character: CharacterSheet;
  cards: TacticalCard[];
  settings: AppSettings;
  onSettingsChange: (updater: (previous: AppSettings) => AppSettings) => void;
  onUpdateCombat: (updater: (prev: CombatRoundState) => CombatRoundState) => void;
  onUpdateCharacter: (updater: (prev: CharacterSheet) => CharacterSheet) => void;
  onUpdateCard?: (cardId: string, updates: Partial<TacticalCard>) => void;
  onUseCard: (cardId: string) => boolean;
  onUndoCardUse: (cardId: string) => void;
  onRollDice: (
    label: string,
    modifier: number,
    subtext?: string,
    sides?: number,
    count?: number,
    advantageMode?: 'normal' | 'advantage' | 'disadvantage',
    formula?: string,
    isCriticalDamage?: boolean,
    rollKind?: RollKind,
    ability?: Ability,
  ) => DiceRollOutcome;
  onShortRest: () => void;
  onLongRest: () => void;
  onNotify: (message: string) => void;
  onBeforeUndoableAction: () => void;
  theme?: ClassTheme;
}

export const CombatTurnView: React.FC<CombatTurnViewProps> = ({
  theme, 
  combatState,
  character,
  cards,
  settings,
  onSettingsChange,
  onUpdateCombat,
  onUpdateCharacter,
  onUpdateCard,
  onUseCard,
  onUndoCardUse,
  onRollDice,
  onShortRest,
  onLongRest,
  onNotify,
  onBeforeUndoableAction,
}) => {
  // Track cards expended in the current round
  const [roundExpendedCards, setRoundExpendedCards] = useState<Record<string, boolean>>({});
  const [turnFlash, setTurnFlash] = useState(false);
  const [spellCastingLevels, setSpellCastingLevels] = useState<Record<string, number>>({});
  const [lastCastLevels, setLastCastLevels] = useState<Record<string, number>>({});
  const [lastCriticalAttack, setLastCriticalAttack] = useState<string | null>(null);
  const [criticalDamage, setCriticalDamage] = useState<Record<string, boolean>>({});
  const [newEffectName, setNewEffectName] = useState('');
  const [newEffectDuration, setNewEffectDuration] = useState(3);
  const [newEffectUnlimited, setNewEffectUnlimited] = useState(false);
  const [newEffectRequiresConcentration, setNewEffectRequiresConcentration] = useState(false);
  const [newEffectNote, setNewEffectNote] = useState('');
  const activeConcentration = getActiveConcentration(combatState);
  const storedConditions = combatState.conditions ?? [];
  const activeConditions = !combatState.isStanding && !storedConditions.includes('prone')
    ? [...storedConditions, 'prone' as const]
    : storedConditions;
  const effectiveBaseSpeed = effectiveSpeed(character.speedFeet, character.exhaustionLevel ?? 0, activeConditions);
  const effectiveMovementMax = Math.min(
    combatState.maxMovement,
    effectiveBaseSpeed * (combatState.hasDash ? 2 : 1),
  );
  const effectiveRemainingMovement = Math.min(combatState.remainingMovement, effectiveMovementMax);

  useEffect(() => {
    const cardIds = new Set(cards.map((card) => card.id));
    setRoundExpendedCards((previous) => {
      const next = Object.fromEntries(
        Object.entries(previous).filter(([cardId]) => cardIds.has(cardId))
      );
      return Object.keys(next).length === Object.keys(previous).length ? previous : next;
    });
  }, [cards]);

  // Toggle card expenditure in current turn
  const handleToggleCardExpend = (cardId: string) => {
    const nextExpended = !roundExpendedCards[cardId];
    setRoundExpendedCards((previous) => ({ ...previous, [cardId]: nextExpended }));
    if (nextExpended && settings.autoTrackActions) {
      const card = cards.find((item) => item.id === cardId);
      const trackedAction = card ? trackedActionForActionType(card.actionType) : null;
      if (trackedAction) {
        onBeforeUndoableAction();
        markActionUsed(trackedAction);
      }
    }
  };

  const handleUseCard = (cardId: string): boolean => {
    const card = cards.find((item) => item.id === cardId);
    const resourceWillBeUsed = !!card?.consumesResource && (card.resourceMax ?? 0) > 0;
    const trackedAction = settings.autoTrackActions && card
      ? trackedActionForActionType(card.actionType)
      : null;
    if (!onUseCard(cardId)) return false;
    if (trackedAction && !resourceWillBeUsed) onBeforeUndoableAction();
    setRoundExpendedCards((previous) => ({ ...previous, [cardId]: true }));
    if (trackedAction) markActionUsed(trackedAction);
    return true;
  };

  const markActionUsed = (action: TrackedAction) => {
    const flag = combatFlagForAction(action);
    onUpdateCombat((previous) => previous[flag] ? previous : { ...previous, [flag]: true });
  };

  // Toggle a resource checkbox (e.g. Second Wind ☐ ☐)
  const handleToggleResourceBox = (cardId: string, boxIndex: number, e: React.MouseEvent) => {
    e.stopPropagation();
    const card = cards.find((item) => item.id === cardId);
    if (!card || !onUpdateCard) return;
    const used = card.resourceUsed || 0;
    const nextUsed = boxIndex < used ? used - 1 : used + 1;
    if (nextUsed > used) onBeforeUndoableAction();
    onUpdateCard(cardId, { resourceUsed: Math.max(0, Math.min(card.resourceMax || 0, nextUsed)) });
  };

  // Siguiente Turno: Reinicia las acciones gastadas y avanza asalto
  const handleNextTurn = () => {
    setTurnFlash(true);
    setTimeout(() => setTurnFlash(false), 500);

    const encounter = combatState.encounter;
    const turnTransition = encounter?.combatants.length
      ? advanceEncounter(encounter)
      : null;
    const wrapped = turnTransition?.wrapped ?? true;
    const currentCombatant = turnTransition?.currentCombatant ?? null;
    const startsCharacterTurn = currentCombatant?.isCurrentCharacter ?? !turnTransition;
    const round = turnTransition?.encounter.round ?? combatState.round + 1;
    const { activeEffects, expiredEffects } = wrapped
      ? advanceActiveEffects(combatState.activeEffects ?? [])
      : { activeEffects: combatState.activeEffects ?? [], expiredEffects: [] };

    if (startsCharacterTurn) setRoundExpendedCards({});

    onUpdateCombat((prev) => ({
      ...prev,
      ...(turnTransition ? { encounter: turnTransition.encounter } : {}),
      round,
      activeEffects,
      ...(startsCharacterTurn ? {
        maxMovement: effectiveBaseSpeed,
        remainingMovement: effectiveBaseSpeed,
        hasDash: false,
        actionUsed: false,
        bonusActionUsed: false,
        reactionUsed: false,
      } : {}),
    }));
    expiredEffects.forEach((effect) => onNotify(`${effect.name} terminó.`));
  };

  const handleEncounterChange = (encounter: Encounter) => {
    onBeforeUndoableAction();
    onUpdateCombat((prev) => ({ ...prev, encounter, round: encounter.round }));
  };

  const handleLinkedConditionsChange = (conditions: ConditionId[]) => {
    const movementLimit = effectiveSpeed(character.speedFeet, character.exhaustionLevel ?? 0, conditions)
      * (combatState.hasDash ? 2 : 1);
    onUpdateCombat((prev) => ({
      ...prev,
      conditions,
      isStanding: !conditions.includes('prone'),
      maxMovement: movementLimit,
      remainingMovement: Math.min(prev.remainingMovement, movementLimit),
    }));
  };

  const handleSpendMovement = (feet: number) => {
    onUpdateCombat((prev) => ({
      ...prev,
      remainingMovement: Math.max(0, effectiveRemainingMovement - feet),
    }));
  };

  const handleResetMovement = () => {
    onUpdateCombat((prev) => ({
      ...prev,
      maxMovement: effectiveMovementMax,
      remainingMovement: effectiveMovementMax,
    }));
  };

  const handleToggleSpellSlot = (tierIndex: number, slotIndex: number) => {
    const slot = character.spellSlots[tierIndex];
    if (slot && slotIndex < slot.current) onBeforeUndoableAction();
    onUpdateCharacter((prev) => {
      const spellSlots = prev.spellSlots.map((slot, index) => {
        if (index !== tierIndex) return slot;
        return {
          ...slot,
          current: slotIndex < slot.current
            ? Math.max(0, slot.current - 1)
            : Math.min(slot.max, slot.current + 1),
        };
      });
      return { ...prev, spellSlots };
    });
  };

  const handleCastSpell = (spell: NonNullable<CharacterSheet['spells']>[number], slotTier: number) => {
    const hasAvailableSlot = character.spellSlots.some(
      (slot) => slot.tier === slotTier && slot.current > 0,
    );
    if (!hasAvailableSlot) return;

    if (spell.concentration) {
      if (activeConcentration
        && !window.confirm(`Perderás ${activeConcentration.spellName}. ¿Quieres reemplazarla con ${spell.name}?`)) {
        return;
      }
    }

    onBeforeUndoableAction();
    if (spell.concentration) {
      onUpdateCombat((prev) => ({
        ...prev,
        concentration: {
          spellName: spell.name,
          spellLevel: slotTier,
          startedRound: prev.round,
        },
        concentrationSpell: spell.name,
        activeEffects: removeConcentrationEffects(prev.activeEffects ?? []),
      }));
    }

    if (settings.autoTrackActions) {
      const trackedAction = trackedActionForSpell(spell);
      if (trackedAction) markActionUsed(trackedAction);
    }

    onUpdateCharacter((prev) => {
      const slotIndex = prev.spellSlots.findIndex((slot) => slot.tier === slotTier && slot.current > 0);
      if (slotIndex < 0) return prev;
      return {
        ...prev,
        spellSlots: prev.spellSlots.map((slot, index) => index === slotIndex
          ? { ...slot, current: slot.current - 1 }
          : slot),
      };
    });
    setLastCastLevels((previous) => ({ ...previous, [spell.id]: slotTier }));
  };

  const handleShortRest = () => {
    setRoundExpendedCards({});
    onShortRest();
  };

  const handleLongRest = () => {
    setRoundExpendedCards({});
    onLongRest();
  };

  const handleToggleDash = () => {
    onUpdateCombat((prev) => {
      const nextDash = !prev.hasDash;
      const nextMax = effectiveBaseSpeed * (nextDash ? 2 : 1);
      const nextRem = nextDash
        ? Math.min(nextMax, effectiveRemainingMovement + effectiveBaseSpeed)
        : Math.min(effectiveRemainingMovement, nextMax);
      return {
        ...prev,
        hasDash: nextDash,
        maxMovement: nextMax,
        remainingMovement: nextRem,
      };
    });
  };

  const handleToggleCondition = (condition: ConditionId) => {
    const nextConditions = activeConditions.includes(condition)
      ? activeConditions.filter((active) => active !== condition)
      : [...activeConditions, condition];
    const nextSpeed = effectiveSpeed(character.speedFeet, character.exhaustionLevel ?? 0, nextConditions);
    const movementLimit = nextSpeed * (combatState.hasDash ? 2 : 1);
    onUpdateCombat((prev) => ({
      ...prev,
      conditions: nextConditions,
      isStanding: !nextConditions.includes('prone'),
      maxMovement: movementLimit,
      remainingMovement: Math.min(prev.remainingMovement, movementLimit),
    }));
  };

  const addActiveEffect = (effect: ActiveEffect): boolean => {
    if (effect.requiresConcentration && !activeConcentration) {
      onNotify(`Para añadir ${effect.name}, primero activa un efecto de concentración.`);
      return false;
    }
    onUpdateCombat((prev) => ({
      ...prev,
      activeEffects: [...(prev.activeEffects ?? []), effect],
    }));
    return true;
  };

  const handleAddManualEffect = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const name = newEffectName.trim();
    if (!name) return;
    const added = addActiveEffect({
      id: `effect-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      name,
      roundsRemaining: newEffectUnlimited ? null : Math.max(1, Math.floor(newEffectDuration)),
      requiresConcentration: newEffectRequiresConcentration,
      note: newEffectNote.trim() || undefined,
    });
    if (added) {
      setNewEffectName('');
      setNewEffectNote('');
    }
  };

  const addCommonEffect = (name: string, roundsRemaining: number, requiresConcentration = true) => {
    addActiveEffect({
      id: `effect-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      name,
      source: name,
      roundsRemaining,
      requiresConcentration,
    });
  };

  // Filter cards by the four requested tactical columns:
  // 1. Acción
  // 2. Acción adicional
  // 3. Reacción
  // 4. Movimiento
  const actionCards = cards.filter(
    (c) => c.actionType === 'Acción' || (!c.actionType && c.category === 'attack')
  );
  const bonusActionCards = cards.filter((c) => c.actionType === 'Acción Adicional');
  const reactionCards = cards.filter((c) => c.actionType === 'Reacción');
  const movementCards = cards.filter((c) => c.actionType === 'Movimiento');

  // Fallback cards if some categories don't have user cards
  const standardMovementActions = [
    {
      id: 'move-std-1',
      title: 'Desplazamiento Base',
      actionType: 'Movimiento' as const,
      reach: `${effectiveRemainingMovement} ft disponibles`,
      resourceDesc: 'Recurso: Velocidad de marcha',
      summaryLine: 'Moverte hasta tu velocidad máxima en cualquier dirección.',
      mechanic: 'Puedes dividir tu movimiento antes y después de realizar acciones.',
    },
    {
      id: 'move-std-2',
      title: 'Levantarse (Stand Up)',
      actionType: 'Movimiento' as const,
      reach: 'Uno mismo',
      resourceDesc: 'Cuesta: La mitad de tu velocidad (15 ft)',
      summaryLine: 'Dejar de estar derribado (Prone).',
      mechanic: 'Requiere gastar 15 pies de tu movimiento disponible.',
    },
    {
      id: 'move-std-3',
      title: 'Destrabarse (Disengage)',
      actionType: 'Acción' as const,
      reach: 'Uno mismo',
      resourceDesc: 'A voluntad',
      summaryLine: 'Destrabarse - Acción - A voluntad - No provocas ataques de oportunidad este turno.',
      mechanic: 'Tu movimiento no provoca ataques de oportunidad durante el resto del asalto.',
    },
  ];

  return (
    <div
      className={`character-sheet character-sheet--combat character-sheet--${character.classKey ?? 'mago'} flex flex-col w-full pb-16 transition-opacity ${turnFlash ? 'opacity-75' : 'opacity-100'}`}
      style={
        theme
          ? ({
              ['--class-theme-primary' as any]: theme.colors.primary,
              ['--class-theme-primary-container' as any]: theme.colors.primaryContainer,
              ['--class-theme-secondary' as any]: theme.colors.secondary,
              ['--class-theme-secondary-container' as any]: theme.colors.secondaryContainer,
              ['--class-theme-accent' as any]: theme.colors.accent,
            } as React.CSSProperties)
          : undefined
      }
    >
      {/* Top Combat Header: Asalto, Iniciativa, Movimiento Restante & Botón Siguiente Turno */}
      <div className="relative overflow-hidden rounded-xl bg-[#1c1a24] shadow-xl border border-white/5 p-4 lg:p-5 mb-6">
        <div className="absolute -right-16 -top-16 w-80 h-80 rounded-full bg-[var(--theme-glow,rgba(87,27,193,0.2))] blur-3xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            {/* Contador de Asalto */}
            <div className="flex items-center gap-2.5 bg-[#0f0d16] px-3.5 py-1.5 rounded-lg border border-white/5 shadow-inner">
              <span className="font-runic text-[10px] text-gray-400 uppercase font-bold">
                Combate
              </span>
              <span className="font-garamond text-xl text-[var(--theme-primary,#fbbf24)] font-bold flex items-center gap-1.5">
                <span className="material-symbols-outlined text-base text-[var(--theme-primary,#fbbf24)]">
                  hourglass_top
                </span>
                <span>Asalto {combatState.round}</span>
              </span>
            </div>

            {/* Iniciativa Score */}
            <div className="flex items-center gap-2 bg-[#0f0d16] px-3 py-1.5 rounded-lg border border-white/5 shadow-inner">
              <span className="font-runic text-[10px] text-gray-400 uppercase font-bold">
                Iniciativa:
              </span>
              <span className="font-garamond text-xl text-[var(--theme-secondary,#d0bcff)] font-bold leading-none">
                {combatState.initiativeScore}
              </span>
            </div>

            {/* Postura y Concentración */}
            <button
              onClick={() => handleToggleCondition('prone')}
              className="flex items-center gap-1.5 bg-[#211e28] hover:bg-[#2b2932] px-2.5 py-1.5 rounded text-gray-200 border border-white/5 text-xs transition-colors"
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  combatState.isStanding ? 'bg-emerald-400' : 'bg-red-400 animate-ping'
                }`}
              />
              <span className="font-semibold">
                {combatState.isStanding ? 'En pie' : 'Derribado (Prone)'}
              </span>
            </button>

            {/* Concentración */}
            <div
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded border text-xs ${
                activeConcentration
                  ? 'bg-[var(--theme-secondary-container,#571bc1)]/40 border-[var(--theme-secondary,#d0bcff)]/30 text-[var(--theme-on-secondary-container,#e9ddff)]'
                  : 'bg-[#211e28] border-white/5 text-gray-400'
              }`}
            >
              <span className="material-symbols-outlined text-xs text-[var(--theme-secondary,#d0bcff)]">
                psychology
              </span>
              <span>
                Concentración: <strong>{activeConcentration?.spellName || 'Ninguna'}</strong>
              </span>
              {activeConcentration && (
                <button
                  type="button"
                  onClick={() => onUpdateCombat((prev) => ({
                    ...prev,
                    concentration: null,
                    concentrationSpell: null,
                    activeEffects: removeConcentrationEffects(prev.activeEffects ?? []),
                  }))}
                  className="ml-1 rounded bg-white/10 px-1.5 py-0.5 text-[10px] hover:bg-white/20"
                >
                  Terminar concentración
                </button>
              )}
            </div>
          </div>

          {/* Quick Rests & Botón Siguiente Turno */}
          <div className="flex items-center gap-2">
            <label className="flex items-center gap-1.5 rounded border border-white/10 bg-[#0f0d16] px-2 py-1.5 text-[10px] text-gray-300">
              <input
                type="checkbox"
                checked={settings.autoTrackActions}
                onChange={(event) => onSettingsChange((previous) => ({
                  ...previous,
                  autoTrackActions: event.target.checked,
                }))}
                aria-label="Automatizar seguimiento de acciones"
              />
              Automatizar acciones
            </label>
            {([
              ['actionUsed', 'Acción'],
              ['bonusActionUsed', 'Adicional'],
              ['reactionUsed', 'Reacción'],
            ] as const).map(([stateKey, label]) => (
              <button
                key={stateKey}
                onClick={() => onUpdateCombat((prev) => ({ ...prev, [stateKey]: !prev[stateKey] }))}
                className={`px-2 py-1.5 rounded border text-[10px] font-bold transition-colors ${
                  combatState[stateKey]
                    ? 'bg-red-500/20 border-red-500/40 text-red-300'
                    : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                }`}
                title={`Marcar ${label}`}
              >
                {label}: {combatState[stateKey] ? 'Gastada' : 'Libre'}
              </button>
            ))}
            <button
              onClick={handleShortRest}
              className="px-2.5 py-1.5 rounded bg-[#211e28] hover:bg-[#2b2932] text-gray-300 text-xs border border-white/5"
              title="Descanso Corto"
            >
              D. Corto
            </button>
            <button
              onClick={handleLongRest}
              className="px-2.5 py-1.5 rounded bg-[#211e28] hover:bg-[#2b2932] text-gray-300 text-xs border border-white/5"
              title="Descanso Largo"
            >
              D. Largo
            </button>

            {/* BOTÓN SIGUIENTE TURNO */}
            <button
              onClick={handleNextTurn}
              id="btn-next-turn"
              className="group flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--theme-primary,#fbbf24)] text-[#261a00] font-bold text-xs transition-all hover:brightness-110 shadow-lg cursor-pointer active:scale-95"
              title="Avanza al siguiente asalto y reinicia todas las acciones gastadas"
            >
              <span className="material-symbols-outlined text-base group-hover:rotate-45 transition-transform">
                swords
              </span>
              <span>Siguiente Turno</span>
            </button>
          </div>
        </div>
      </div>

      <InitiativeTracker
        encounter={combatState.encounter ?? { combatants: [], turnIndex: 0, round: combatState.round }}
        character={character}
        currentConditions={activeConditions}
        round={combatState.round}
        onEncounterChange={handleEncounterChange}
        onUpdateCharacter={onUpdateCharacter}
        onLinkedConditionsChange={handleLinkedConditionsChange}
        onRollInitiative={(combatant) => onRollDice(
          `Iniciativa: ${combatant.name}`,
          combatant.initiativeBonus ?? 0,
          `d20 ${combatant.initiativeBonus && combatant.initiativeBonus > 0 ? '+' : ''}${combatant.initiativeBonus ?? 0}`,
        ).total}
      />

      <section className="mb-6 rounded-xl border border-red-400/20 bg-[#1c1a24] p-4" aria-label="Condiciones activas">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <h2 className="font-garamond text-lg font-bold text-white">Condiciones</h2>
          <span className="text-[10px] text-gray-400">
            Agotamiento {character.exhaustionLevel ?? 0}/6
            {character.exhaustionLevel ? ` · Velocidad efectiva ${effectiveBaseSpeed} ft` : ''}
          </span>
        </div>
        <div className="flex flex-wrap gap-2">
          {Object.values(CONDITIONS).map((condition) => {
            const isActive = activeConditions.includes(condition.id);
            return (
              <button
                key={condition.id}
                type="button"
                aria-pressed={isActive}
                title={condition.description}
                onClick={() => handleToggleCondition(condition.id)}
                className={`rounded-full border px-3 py-1 text-xs transition-colors ${
                  isActive
                    ? 'border-red-400/60 bg-red-500/20 text-red-200'
                    : 'border-white/10 bg-[#211e28] text-gray-300 hover:border-white/30'
                }`}
              >
                {condition.name}
              </button>
            );
          })}
          {activeConditions.length === 0 && (
            <span className="text-xs text-gray-500">Sin condiciones activas.</span>
          )}
        </div>
      </section>

      <section className="mb-6 rounded-xl border border-[var(--theme-secondary,#d0bcff)]/20 bg-[#1c1a24] p-4" aria-label="Efectos activos">
        <div className="mb-3 flex items-center justify-between gap-2">
          <h2 className="font-garamond text-lg font-bold text-white">Efectos activos</h2>
          <span className="text-[10px] text-gray-500">La duración avanza al pulsar Siguiente Turno</span>
        </div>
        <div className="mb-3 flex flex-wrap gap-2">
          {[
            { name: 'Bendición', rounds: 10 },
            { name: 'Marca del cazador', rounds: 60 },
            { name: 'Escudo de fe', rounds: 100 },
          ].map((preset) => (
            <button
              key={preset.name}
              type="button"
              onClick={() => addCommonEffect(preset.name, preset.rounds)}
              className="rounded border border-[var(--theme-secondary,#d0bcff)]/20 bg-[#211e28] px-2.5 py-1 text-[11px] text-[var(--theme-secondary,#d0bcff)] hover:bg-white/5"
            >
              + {preset.name} ({preset.rounds} asaltos)
            </button>
          ))}
        </div>
        <form onSubmit={handleAddManualEffect} className="mb-4 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-[minmax(140px,1fr)_110px_auto_auto_auto]">
          <input
            value={newEffectName}
            onChange={(event) => setNewEffectName(event.target.value)}
            placeholder="Nombre del efecto"
            aria-label="Nombre del efecto"
            className="rounded border border-white/10 bg-[#211e28] px-2.5 py-1.5 text-xs text-white"
            required
          />
          <label className="flex items-center gap-1.5 text-[10px] text-gray-300">
            Duración
            <input
              type="number"
              min="1"
              value={newEffectDuration}
              onChange={(event) => setNewEffectDuration(Number(event.target.value))}
              disabled={newEffectUnlimited}
              className="w-14 rounded border border-white/10 bg-[#211e28] px-1.5 py-1 text-xs text-white disabled:opacity-50"
            />
            asaltos
          </label>
          <label className="flex items-center gap-1 text-[10px] text-gray-300">
            <input
              type="checkbox"
              checked={newEffectUnlimited}
              onChange={(event) => setNewEffectUnlimited(event.target.checked)}
            />
            Sin límite
          </label>
          <label className="flex items-center gap-1 text-[10px] text-gray-300">
            <input
              type="checkbox"
              checked={newEffectRequiresConcentration}
              onChange={(event) => setNewEffectRequiresConcentration(event.target.checked)}
            />
            Concentración
          </label>
          <button
            type="submit"
            className="rounded bg-[var(--theme-secondary-container,#571bc1)] px-3 py-1.5 text-xs font-semibold text-white"
          >
            Añadir
          </button>
          <input
            value={newEffectNote}
            onChange={(event) => setNewEffectNote(event.target.value)}
            placeholder="Nota (opcional)"
            aria-label="Nota opcional del efecto"
            className="rounded border border-white/10 bg-[#211e28] px-2.5 py-1.5 text-xs text-white sm:col-span-2 lg:col-span-5"
          />
        </form>
        {(combatState.activeEffects ?? []).length > 0 ? (
          <ul className="space-y-2">
            {(combatState.activeEffects ?? []).map((effect) => (
              <li key={effect.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-white/5 bg-[#211e28] px-3 py-2">
                <div className="min-w-0">
                  <span className="text-xs font-semibold text-white">{effect.name}</span>
                  {effect.source && <span className="ml-2 text-[10px] text-gray-500">({effect.source})</span>}
                  {effect.requiresConcentration && <span className="ml-2 text-[10px] text-[var(--theme-secondary,#d0bcff)]">Concentración</span>}
                  {effect.note && <p className="mt-0.5 text-[10px] text-gray-400">{effect.note}</p>}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-gray-300">
                    {effect.roundsRemaining === null ? 'Sin límite' : `${effect.roundsRemaining} asaltos`}
                  </span>
                  <button
                    type="button"
                    onClick={() => onUpdateCombat((prev) => ({
                      ...prev,
                      activeEffects: (prev.activeEffects ?? []).filter((item) => item.id !== effect.id),
                    }))}
                    className="rounded px-1.5 py-0.5 text-[10px] text-red-300 hover:bg-red-500/10"
                    aria-label={`Quitar efecto ${effect.name}`}
                  >
                    Quitar
                  </button>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-xs text-gray-500">No hay efectos activos.</p>
        )}
      </section>

      <section className="mb-6 grid grid-cols-1 xl:grid-cols-[minmax(0,2fr)_minmax(280px,1fr)] gap-4" aria-label="Conjuros y espacios de conjuro">
        <div className="bg-[#1c1a24] p-4 rounded-xl border border-[var(--theme-secondary,#d0bcff)]/20">
          <h2 className="font-garamond text-lg text-white font-bold mb-3">Conjuros</h2>
          {(character.spells || []).length === 0 ? (
            <p className="text-xs text-gray-400">No hay conjuros registrados en la hoja.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {character.spells?.map((spell) => {
                const damage = parseDiceFormula(spell.damageOrHeal);
                const canCriticallyHit = /ataque|\+/i.test(spell.attackOrDc);
                const eligibleSlots = character.spellSlots.filter((slot) => slot.tier >= spell.level);
                const defaultSlotTier = eligibleSlots.find((slot) => slot.current > 0)?.tier ?? spell.level;
                const castTier = spellCastingLevels[spell.id] ?? defaultSlotTier;
                const usedSlotLevel = lastCastLevels[spell.id] ?? castTier;
                const castDamage = upcastDamage(spell.damageOrHeal, spell.upcast, spell.level, usedSlotLevel);
                const canCast = spell.level === 0 || eligibleSlots.some(
                  (slot) => slot.tier === castTier && slot.current > 0
                );
                return (
                  <article key={spell.id} className="bg-[#211e28] p-3 rounded-lg border border-white/10">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="text-sm text-white font-bold">{spell.name}</h3>
                      <span className="text-[10px] text-[var(--theme-secondary,#d0bcff)] whitespace-nowrap">
                        {spell.level === 0 ? 'Truco' : `Nivel ${spell.level}`}
                      </span>
                    </div>
                    <p className="text-[11px] text-gray-400 mt-1">{spell.castingTime} · {spell.range} · {spell.damageOrHeal}</p>
                    {spell.level > 0 && (
                      <p className="mt-1 text-[10px] text-[var(--theme-secondary,#d0bcff)]">
                        Espacio {lastCastLevels[spell.id] ? 'usado' : 'seleccionado'}: nivel {usedSlotLevel}
                        {spell.upcast && usedSlotLevel > spell.level
                          ? ` · Daño escalado: ${castDamage}`
                          : ''}
                      </p>
                    )}
                    {spell.concentration && (
                      <span className="mt-1 inline-block text-[10px] text-[var(--theme-secondary,#d0bcff)]">
                        Concentración
                      </span>
                    )}
                    <div className="flex flex-wrap gap-2 mt-3">
                      {spell.level > 0 && (
                        <>
                          <select
                            value={castTier}
                            onChange={(event) => setSpellCastingLevels((prev) => ({ ...prev, [spell.id]: Number(event.target.value) }))}
                            aria-label={`Nivel del espacio para ${spell.name}`}
                            className="px-2 py-1 rounded bg-[#2b2932] text-gray-200 text-xs border border-white/10"
                          >
                            {eligibleSlots.map((slot) => <option key={slot.tier} value={slot.tier}>Espacio nivel {slot.tier} ({slot.current})</option>)}
                          </select>
                          <button
                            type="button"
                            disabled={!canCast}
                            onClick={() => handleCastSpell(spell, castTier)}
                            className="px-2.5 py-1 rounded bg-[var(--theme-secondary-container,#571bc1)] text-white text-xs disabled:opacity-40"
                          >
                            Lanzar y gastar espacio
                          </button>
                        </>
                      )}
                      {spell.attackOrDc.match(/ataque|\+/i) && (
                        <button
                          type="button"
                          onClick={() => {
                            const outcome = onRollDice(`Ataque: ${spell.name}`, getSpellAttackModifier(character), spell.attackOrDc, 20, 1, 'normal', undefined, false, 'attack');
                            setLastCriticalAttack(outcome.natural === 20 ? `spell:${spell.id}` : null);
                          }}
                          className="px-2.5 py-1 rounded bg-[#2b2932] text-gray-200 text-xs"
                        >Tirar ataque</button>
                      )}
                      {damage && (
                        <>
                          <button
                            type="button"
                            onClick={() => {
                              const attackId = `spell:${spell.id}`;
                              const isCritical = criticalDamage[attackId] ?? lastCriticalAttack === attackId;
                              const formula = isCritical ? doubleDice(castDamage) : castDamage;
                              if (!parseDiceExpression(formula)) return;
                              onRollDice(`Daño: ${spell.name} (espacio ${usedSlotLevel})`, 0, castDamage, 20, 1, 'normal', formula, isCritical);
                            }}
                            className="px-2.5 py-1 rounded bg-[#2b2932] text-emerald-300 text-xs"
                          >
                            {criticalDamage[`spell:${spell.id}`] || lastCriticalAttack === `spell:${spell.id}` ? '¡CRÍTICO! Daño' : 'Tirar daño'}
                          </button>
                          {canCriticallyHit && (
                            <label className="flex items-center gap-1 text-[10px] text-amber-300">
                              <input
                                type="checkbox"
                                checked={criticalDamage[`spell:${spell.id}`] ?? lastCriticalAttack === `spell:${spell.id}`}
                                onChange={(event) => setCriticalDamage((previous) => ({
                                  ...previous,
                                  [`spell:${spell.id}`]: event.target.checked,
                                }))}
                              />
                              Crítico
                            </label>
                          )}
                        </>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>

        <div className="bg-[#1c1a24] p-4 rounded-xl border border-white/10">
          <h2 className="font-garamond text-lg text-white font-bold mb-3">Espacios de conjuro</h2>
          <div className="flex flex-col gap-2">
            {character.spellSlots.map((slot, tierIndex) => (
              <div key={slot.tier} className="flex items-center justify-between gap-2 bg-[#211e28] px-3 py-2 rounded-lg">
                <span className="text-xs text-gray-200">Nivel {slot.tier} <span className="text-gray-500">({slot.current}/{slot.max})</span></span>
                <div className="flex gap-1">
                  {Array.from({ length: slot.max }).map((_, slotIndex) => (
                    <button
                      key={slotIndex}
                      type="button"
                      onClick={() => handleToggleSpellSlot(tierIndex, slotIndex)}
                      aria-label={`${slotIndex < slot.current ? 'Gastar' : 'Recuperar'} espacio de nivel ${slot.tier}`}
                      className={`w-4 h-4 rounded-full border border-[var(--theme-secondary,#d0bcff)] ${slotIndex < slot.current ? 'bg-[var(--theme-secondary,#d0bcff)]' : 'bg-transparent'}`}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========================================================== */}
      {/* CUATRO COLUMNAS TÁCTICAS:                                 */}
      {/* 1. ACCIÓN | 2. ACCIÓN ADICIONAL | 3. REACCIÓN | 4. MOVIMIENTO */}
      {/* ========================================================== */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {/* ==================================================== */}
        {/* COLUMNA 1: ACCIÓN (Color Carmesí / Rojo Vivo)        */}
        {/* ==================================================== */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between bg-[#1c1a24] px-3.5 py-2 rounded-xl border border-red-500/30 shadow-md">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]"></span>
              <h3 className="font-garamond text-base text-white font-bold tracking-wide">
                Acción
              </h3>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded bg-red-500/20 text-red-300 font-bold border border-red-500/30 uppercase">
              1 por turno
            </span>
          </div>

          <div className="flex flex-col gap-3">
            {actionCards.map((card) => {
              const isExpended = roundExpendedCards[card.id];
              const boxes = card.resourceMax ? Array.from({ length: card.resourceMax }, (_, index) => index < (card.resourceUsed || 0)) : [];

              return (
                <div
                  key={card.id}
                  onClick={() => handleToggleCardExpend(card.id)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer relative group ${
                    isExpended
                      ? 'bg-[#15131b]/60 border-white/5 opacity-50 grayscale'
                      : 'bg-[#1c1a24] border-red-500/20 hover:border-red-500/50 shadow-md hover:-translate-y-0.5'
                  }`}
                >
                  {/* Etiqueta de Tipo de Acción */}
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-red-500/20 text-red-300 border border-red-500/40 uppercase tracking-wider">
                      Acción
                    </span>
                    <span className="text-[11px] text-gray-400 font-medium">
                      {card.reach || '5 ft'}
                    </span>
                  </div>

                  {/* Nombre de la Habilidad / Conjuro */}
                  <div className="flex items-center justify-between mb-1.5">
                    <h4 className="font-garamond text-base font-bold text-white group-hover:text-red-300 transition-colors">
                      {card.title}
                    </h4>
                    {getTacticalCardDamageRoll(card, character) && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          const damageRoll = getTacticalCardDamageRoll(card, character);
                          if (!damageRoll || !handleUseCard(card.id)) return;
                          onRollDice(`Daño: ${card.title}`, damageRoll.modifier, card.primaryDamageOrEffect, damageRoll.sides, damageRoll.count);
                        }}
                        className="p-1 rounded bg-[#2b2932] hover:bg-red-500/30 text-red-300"
                        title="Tirar daño"
                      >
                        <span className="material-symbols-outlined text-xs">casino</span>
                      </button>
                    )}
                  </div>

                  {/* Línea de Efecto Resumido */}
                  <div className="bg-[#211e28] p-2 rounded-lg border border-white/5 mb-2 text-xs font-mono text-gray-200">
                    <span className="text-red-300 font-bold">
                      {card.title}
                    </span>{' '}
                    - Acción - {card.resourceDesc || 'A voluntad'} -{' '}
                    <span className="text-emerald-400 font-bold">{card.primaryDamageOrEffect}</span>
                  </div>

                  {/* Casillas de Usos para marcar (☐ ☐) */}
                  {boxes.length > 0 && (
                    <div className="flex items-center justify-between bg-[#15131b] px-2.5 py-1.5 rounded-lg border border-white/5 mb-2">
                      <span className="text-[10px] text-gray-400 uppercase font-bold">
                        Usos:
                      </span>
                      <div className="flex items-center gap-1.5">
                        {boxes.map((checked, bIdx) => (
                          <button
                            key={`box-${card.id}-${bIdx}`}
                            onClick={(e) => handleToggleResourceBox(card.id, bIdx, e)}
                            className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${
                              checked
                                ? 'bg-red-500 border-red-400 shadow-[0_0_6px_rgba(239,68,68,0.7)]'
                                : 'bg-[#2b2932] border-white/20 hover:border-red-400'
                            }`}
                            title={checked ? 'Usado (clic para restaurar)' : 'Disponible (clic para gastar)'}
                          >
                            {checked && (
                              <span className="material-symbols-outlined text-white text-[10px] font-bold">
                                check
                              </span>
                            )}
                          </button>
                        ))}
                      </div>
                      {card.consumesResource && (card.resourceUsed ?? 0) > 0 && (
                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation();
                            onUndoCardUse(card.id);
                          }}
                          className="text-[10px] text-amber-300 hover:text-amber-200"
                        >
                          Deshacer uso
                        </button>
                      )}
                    </div>
                  )}
                  {card.consumesResource && !getTacticalCardDamageRoll(card, character) && (
                    <button
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        handleUseCard(card.id);
                      }}
                      className="rounded bg-red-500/20 px-2 py-1 text-xs text-red-200 hover:bg-red-500/30"
                    >
                      Usar
                    </button>
                  )}

                  {/* Estado de Gasto en Turno */}
                  <div className="flex items-center justify-between text-[10px] text-gray-400 pt-1 border-t border-white/5">
                    <span>{card.recharge || 'Recarga en descanso'}</span>
                    <span className={isExpended ? 'text-red-400 font-bold' : 'text-emerald-400'}>
                      {isExpended ? 'Gastada este asalto' : 'Disponible'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ==================================================== */}
        {/* COLUMNA 2: ACCIÓN ADICIONAL (Color Violeta / Amatista)*/}
        {/* ==================================================== */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between bg-[#1c1a24] px-3.5 py-2 rounded-xl border border-purple-500/30 shadow-md">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.8)]"></span>
              <h3 className="font-garamond text-base text-white font-bold tracking-wide">
                Acción Adicional
              </h3>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 font-bold border border-purple-500/30 uppercase">
              1 por turno
            </span>
          </div>

          <div className="flex flex-col gap-3">
            {bonusActionCards.map((card) => {
              const isExpended = roundExpendedCards[card.id];
              const boxes = card.resourceMax ? Array.from({ length: card.resourceMax }, (_, index) => index < (card.resourceUsed || 0)) : [];

              return (
                <div
                  key={card.id}
                  onClick={() => handleToggleCardExpend(card.id)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer relative group ${
                    isExpended
                      ? 'bg-[#15131b]/60 border-white/5 opacity-50 grayscale'
                      : 'bg-[#1c1a24] border-purple-500/20 hover:border-purple-500/50 shadow-md hover:-translate-y-0.5'
                  }`}
                >
                  {/* Etiqueta de Tipo de Acción */}
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/40 uppercase tracking-wider">
                      Acción Adicional
                    </span>
                    <span className="text-[11px] text-gray-400 font-medium">
                      {card.reach || 'Uno mismo'}
                    </span>
                  </div>

                  {/* Nombre */}
                  <div className="flex items-center justify-between mb-1.5">
                    <h4 className="font-garamond text-base font-bold text-white group-hover:text-purple-300 transition-colors">
                      {card.title}
                    </h4>
                    {getTacticalCardDamageRoll(card, character) && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          const damageRoll = getTacticalCardDamageRoll(card, character);
                          if (!damageRoll || !handleUseCard(card.id)) return;
                          onRollDice(`Daño: ${card.title}`, damageRoll.modifier, card.primaryDamageOrEffect, damageRoll.sides, damageRoll.count);
                        }}
                        className="p-1 rounded bg-[#2b2932] hover:bg-purple-500/30 text-purple-300"
                        title="Tirar daño"
                      >
                        <span className="material-symbols-outlined text-xs">casino</span>
                      </button>
                    )}
                  </div>

                  {/* Línea de Efecto Resumido (Ej. Second Wind - Acción adicional - 2 usos - Recuperas PG) */}
                  <div className="bg-[#211e28] p-2 rounded-lg border border-white/5 mb-2 text-xs font-mono text-gray-200">
                    <span className="text-purple-300 font-bold">
                      {card.title}
                    </span>{' '}
                    - Acción adicional - {card.resourceDesc || 'Usos limitados'} -{' '}
                    <span className="text-emerald-400 font-bold">{card.primaryDamageOrEffect}</span>
                  </div>

                  {/* Casillas de Usos para marcar (☐ ☐) */}
                  {boxes.length > 0 && (
                    <div className="flex items-center justify-between bg-[#15131b] px-2.5 py-1.5 rounded-lg border border-white/5 mb-2">
                      <span className="text-[10px] text-gray-400 uppercase font-bold">
                        Casillas de Uso:
                      </span>
                      <div className="flex items-center gap-1.5">
                        {boxes.map((checked, bIdx) => (
                          <button
                            key={`box-${card.id}-${bIdx}`}
                            onClick={(e) => handleToggleResourceBox(card.id, bIdx, e)}
                            className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${
                              checked
                                ? 'bg-purple-500 border-purple-400 shadow-[0_0_6px_rgba(168,85,247,0.7)]'
                                : 'bg-[#2b2932] border-white/20 hover:border-purple-400'
                            }`}
                            title={checked ? 'Usado (clic para restaurar)' : 'Disponible (clic para gastar)'}
                          >
                            {checked && (
                              <span className="material-symbols-outlined text-white text-[10px] font-bold">
                                check
                              </span>
                            )}
                          </button>
                        ))}
                      </div>
                      {card.consumesResource && (card.resourceUsed ?? 0) > 0 && (
                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation();
                            onUndoCardUse(card.id);
                          }}
                          className="text-[10px] text-amber-300 hover:text-amber-200"
                        >
                          Deshacer uso
                        </button>
                      )}
                    </div>
                  )}
                  {card.consumesResource && !getTacticalCardDamageRoll(card, character) && (
                    <button
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        handleUseCard(card.id);
                      }}
                      className="rounded bg-purple-500/20 px-2 py-1 text-xs text-purple-200 hover:bg-purple-500/30"
                    >
                      Usar
                    </button>
                  )}

                  {/* Estado de Gasto en Turno */}
                  <div className="flex items-center justify-between text-[10px] text-gray-400 pt-1 border-t border-white/5">
                    <span>{card.recharge || 'Descanso Corto'}</span>
                    <span className={isExpended ? 'text-red-400 font-bold' : 'text-purple-300'}>
                      {isExpended ? 'Gastada este asalto' : 'Lista para usar'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ==================================================== */}
        {/* COLUMNA 3: REACCIÓN (Color Ámbar / Oro / Azul)       */}
        {/* ==================================================== */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between bg-[#1c1a24] px-3.5 py-2 rounded-xl border border-amber-500/30 shadow-md">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.8)]"></span>
              <h3 className="font-garamond text-base text-white font-bold tracking-wide">
                Reacción
              </h3>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30 uppercase">
              1 por asalto
            </span>
          </div>

          <div className="flex flex-col gap-3">
            {reactionCards.map((card) => {
              const isExpended = roundExpendedCards[card.id];
              const boxes = card.resourceMax ? Array.from({ length: card.resourceMax }, (_, index) => index < (card.resourceUsed || 0)) : [];

              return (
                <div
                  key={card.id}
                  onClick={() => handleToggleCardExpend(card.id)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer relative group ${
                    isExpended
                      ? 'bg-[#15131b]/60 border-white/5 opacity-50 grayscale'
                      : 'bg-[#1c1a24] border-amber-500/20 hover:border-amber-500/50 shadow-md hover:-translate-y-0.5'
                  }`}
                >
                  {/* Etiqueta de Reacción */}
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 uppercase tracking-wider">
                      Reacción
                    </span>
                    <span className="text-[11px] text-gray-400 font-medium">
                      {card.reach || 'Interrupción'}
                    </span>
                  </div>

                  {/* Nombre */}
                  <h4 className="font-garamond text-base font-bold text-white group-hover:text-amber-300 transition-colors mb-1">
                    {card.title}
                  </h4>

                  {/* Disparador / Trigger (Crucial en Reacciones) */}
                  {card.trigger && (
                    <div className="text-[11px] text-amber-300/90 italic bg-amber-950/30 p-2 rounded border border-amber-500/20 mb-2">
                      ⚡ Trigger: {card.trigger}
                    </div>
                  )}

                  {/* Línea de Efecto Resumido */}
                  <div className="bg-[#211e28] p-2 rounded-lg border border-white/5 mb-2 text-xs font-mono text-gray-200">
                    <span className="text-amber-300 font-bold">
                      {card.title}
                    </span>{' '}
                    - Reacción - {card.primaryDamageOrEffect}
                  </div>

                  {/* Casillas de Usos para marcar (☐ ☐) */}
                  {boxes.length > 0 && (
                    <div className="flex items-center justify-between bg-[#15131b] px-2.5 py-1.5 rounded-lg border border-white/5 mb-2">
                      <span className="text-[10px] text-gray-400 uppercase font-bold">
                        Casillas:
                      </span>
                      <div className="flex items-center gap-1.5">
                        {boxes.map((checked, bIdx) => (
                          <button
                            key={`box-${card.id}-${bIdx}`}
                            onClick={(e) => handleToggleResourceBox(card.id, bIdx, e)}
                            className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${
                              checked
                                ? 'bg-amber-500 border-amber-400 shadow-[0_0_6px_rgba(245,158,11,0.7)]'
                                : 'bg-[#2b2932] border-white/20 hover:border-amber-400'
                            }`}
                          >
                            {checked && (
                              <span className="material-symbols-outlined text-white text-[10px] font-bold">
                                check
                              </span>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Estado de Gasto en Turno */}
                  <div className="flex items-center justify-between text-[10px] text-gray-400 pt-1 border-t border-white/5">
                    <span>Reacción Inmediata</span>
                    <span className={isExpended ? 'text-red-400 font-bold' : 'text-amber-300'}>
                      {isExpended ? 'Reacción Consumida' : 'Lista'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ==================================================== */}
        {/* COLUMNA 4: MOVIMIENTO (Color Verde Esmeralda / Cian) */}
        {/* ==================================================== */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between bg-[#1c1a24] px-3.5 py-2 rounded-xl border border-emerald-500/30 shadow-md">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]"></span>
              <h3 className="font-garamond text-base text-white font-bold tracking-wide">
                Movimiento
              </h3>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30 uppercase">
              {effectiveRemainingMovement} / {effectiveMovementMax} ft
            </span>
          </div>

          {/* Medidor de Movimiento Táctico Interactivo */}
          <div className="bg-[#1c1a24] p-4 rounded-xl border border-emerald-500/20 shadow-md">
            <div className="flex items-center justify-between mb-2">
              <span className="font-runic text-xs text-gray-300 font-bold uppercase">
                Pies Restantes
              </span>
              <span className="font-garamond text-xl text-emerald-400 font-bold">
                {effectiveRemainingMovement} ft
              </span>
            </div>

            {/* Barra de Movimiento */}
            <div className="w-full bg-[#211e28] rounded-full h-3 p-0.5 border border-white/5 overflow-hidden mb-3">
              <div
                className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-300"
                style={{
                  width: `${Math.max(
                    0,
                    Math.min(100, (effectiveRemainingMovement / (effectiveMovementMax || 30)) * 100)
                  )}%`,
                }}
              />
            </div>

            {/* Botones de Gasto Rápido de Movimiento */}
            <div className="grid grid-cols-3 gap-1.5 mb-3">
              <button
                onClick={() => handleSpendMovement(5)}
                disabled={effectiveRemainingMovement < 5}
                className="py-1 px-2 rounded bg-[#211e28] hover:bg-[#2b2932] disabled:opacity-40 text-xs font-bold text-gray-200 border border-white/5 transition-colors"
              >
                -5 ft
              </button>
              <button
                onClick={() => handleSpendMovement(10)}
                disabled={effectiveRemainingMovement < 10}
                className="py-1 px-2 rounded bg-[#211e28] hover:bg-[#2b2932] disabled:opacity-40 text-xs font-bold text-gray-200 border border-white/5 transition-colors"
              >
                -10 ft
              </button>
              <button
                onClick={() => handleSpendMovement(15)}
                disabled={effectiveRemainingMovement < 15}
                className="py-1 px-2 rounded bg-[#211e28] hover:bg-[#2b2932] disabled:opacity-40 text-xs font-bold text-gray-200 border border-white/5 transition-colors"
              >
                -15 ft
              </button>
            </div>

            <div className="flex items-center justify-between gap-2">
              <button
                onClick={handleToggleDash}
                className={`flex-1 py-1.5 px-2.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 border ${
                  combatState.hasDash
                    ? 'bg-emerald-500 text-black border-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.5)]'
                    : 'bg-[#211e28] text-gray-200 border-white/10 hover:bg-[#2b2932]'
                }`}
                title="Acción de Correr: Duplica tu velocidad"
              >
                <span className="material-symbols-outlined text-sm">directions_run</span>
                <span>{combatState.hasDash ? 'Correr Activo (+30ft)' : 'Correr (Dash)'}</span>
              </button>

              <button
                onClick={handleResetMovement}
                className="p-1.5 rounded-lg bg-[#211e28] hover:bg-[#2b2932] text-gray-300 hover:text-white border border-white/5"
                title="Restablecer movimiento a velocidad máxima"
              >
                <span className="material-symbols-outlined text-sm">restart_alt</span>
              </button>
            </div>
          </div>

          {/* Cartas de Movimiento y Maniobras de Posición */}
          <div className="flex flex-col gap-3">
            {[...movementCards, ...standardMovementActions].map((card) => {
              return (
                <div
                  key={card.id}
                  className="p-4 rounded-xl bg-[#1c1a24] border border-emerald-500/20 hover:border-emerald-500/50 shadow-md transition-all"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 uppercase tracking-wider">
                      Movimiento
                    </span>
                    <span className="text-[11px] text-gray-400 font-medium">
                      {card.reach}
                    </span>
                  </div>

                  <h4 className="font-garamond text-base font-bold text-white mb-1">
                    {card.title}
                  </h4>

                  <div className="bg-[#211e28] p-2 rounded-lg border border-white/5 text-xs font-mono text-gray-200 mb-2">
                    {card.summaryLine}
                  </div>

                  <p className="text-[11px] text-gray-400 leading-relaxed">
                    {'mechanic' in card ? (card as any).mechanic : (card as any).description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
