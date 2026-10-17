import React, { useEffect, useState } from 'react';
import {
  Swords,
  Shield,
  Zap,
  Play,
  RotateCcw,
  Sparkles,
  Heart,
  Plus,
  Trash2,
  Pencil,
  CheckCircle2,
  AlertCircle,
  Dices,
  Save,
  X,
} from 'lucide-react';
import { AbilityKey, CharacterSheet, Combatant, ActiveEffect, GrimoireCard } from '../../types/character';
import { CLASS_THEMES } from '../../data/classThemes';
import { ClassWidgetFrame } from '../fx/ClassWidgetFrame';
import { ClassSubCard } from '../fx/ClassSubCard';
import { SpellSlotModal } from '../modals/SpellSlotModal';
import { ActiveEffectModal } from '../modals/ActiveEffectModal';
import { CombatHitPointsFrame } from './CombatHitPointsFrame';
import { BarbarianRageModule } from '../classFeatures/BarbarianRageModule';

import { getArmorSpeedPenalty, getEffectiveAbilityScore as calculateEffectiveAbilityScore, getEquippedArmorClass, getEquippedItems, getItemEffectTotal } from '../../lib/itemEffects';

interface Props {
  character: CharacterSheet;
  onUpdate: (updated: CharacterSheet) => void;
  onOpenDiceTray: (formula?: string, callback?: (result: number) => void) => void;
  onOpenShortRest: () => void;
  combatants?: Combatant[];
  onUpdateCombatants?: (combatants: Combatant[]) => void;
}

interface StoredCombatTurn {
  round: number;
  concentrationSpell: string | null;
  actionUsed: boolean;
  bonusActionUsed: boolean;
  reactionUsed: boolean;
  actionExtraUses: number;
  bonusActionExtraUses: number;
  reactionExtraUses: number;
  movementLeft: number;
  activeEffects: ActiveEffect[];
}

function readStoredCombatTurn(characterId: string): Partial<StoredCombatTurn> {
  try {
    const stored = window.localStorage.getItem(`grimorio_combat_turn_${characterId}`);
    if (!stored) return {};

    const parsed: unknown = JSON.parse(stored);
    if (!parsed || typeof parsed !== 'object') return {};
    const data = parsed as Record<string, unknown>;
    const validNumber = (value: unknown): value is number => typeof value === 'number' && Number.isFinite(value);

    return {
      ...(validNumber(data.round) && data.round >= 1 ? { round: data.round } : {}),
      ...(typeof data.concentrationSpell === 'string' || data.concentrationSpell === null
        ? { concentrationSpell: data.concentrationSpell }
        : {}),
      ...(typeof data.actionUsed === 'boolean' ? { actionUsed: data.actionUsed } : {}),
      ...(typeof data.bonusActionUsed === 'boolean' ? { bonusActionUsed: data.bonusActionUsed } : {}),
      ...(typeof data.reactionUsed === 'boolean' ? { reactionUsed: data.reactionUsed } : {}),
      ...(validNumber(data.actionExtraUses) ? { actionExtraUses: Math.max(0, Math.floor(data.actionExtraUses)) } : {}),
      ...(validNumber(data.bonusActionExtraUses) ? { bonusActionExtraUses: Math.max(0, Math.floor(data.bonusActionExtraUses)) } : {}),
      ...(validNumber(data.reactionExtraUses) ? { reactionExtraUses: Math.max(0, Math.floor(data.reactionExtraUses)) } : {}),
      ...(validNumber(data.movementLeft) ? { movementLeft: Math.max(0, data.movementLeft) } : {}),
      ...(Array.isArray(data.activeEffects) && data.activeEffects.every((effect) =>
        effect !== null
        && typeof effect === 'object'
        && 'id' in effect
        && typeof effect.id === 'string'
        && 'name' in effect
        && typeof effect.name === 'string'
        && 'durationRounds' in effect
        && typeof effect.durationRounds === 'number'
        && 'concentration' in effect
        && typeof effect.concentration === 'boolean',
      ) ? { activeEffects: data.activeEffects as ActiveEffect[] } : {}),
    };
  } catch (error) {
    console.error('No se pudo restaurar el estado del combate.', error);
    return {};
  }
}

export const CombatTurnView: React.FC<Props> = ({
  character,
  onUpdate,
  onOpenDiceTray,
  onOpenShortRest,
  combatants: externalCombatants,
  onUpdateCombatants: externalUpdateCombatants,
}) => {
  const theme = CLASS_THEMES[character.classId] || CLASS_THEMES.mago;

  const [isSpellSlotModalOpen, setIsSpellSlotModalOpen] = useState(false);
  const [activeCastingCard, setActiveCastingCard] = useState<GrimoireCard | null>(null);
  const [activeCastingCardType, setActiveCastingCardType] = useState<'action' | 'bonus' | 'reaction' | undefined>(undefined);

  // Turn state
  const [storedCombatTurn] = useState(() => readStoredCombatTurn(character.id));
  const [round, setRound] = useState<number>(storedCombatTurn.round ?? 1);
  const [concentrationSpell, setConcentrationSpell] = useState<string | null>(storedCombatTurn.concentrationSpell ?? null);

  // Derived condition flags
  const isProne = character.activeConditions.includes('Derribado');
  const SPEED_ZERO_CONDITIONS = ['Agarrado', 'Apresado', 'Paralizado', 'Petrificado', 'Inconsciente', 'Aturdido'];
  const isSpeedZero = SPEED_ZERO_CONDITIONS.some((c) => character.activeConditions.includes(c)) || character.exhaustion >= 5;
  const exhaustionHalved = character.exhaustion >= 2 && character.exhaustion <= 4;
  const getEffectiveAbilityScore = (ability: AbilityKey) =>
    calculateEffectiveAbilityScore(character.cards, ability, character.abilities[ability].score);
  const baseSpeed = Math.max(
    0,
    character.speed
      + getItemEffectTotal(character.cards, 'speedBonus')
      - getArmorSpeedPenalty(character.cards, getEffectiveAbilityScore('FUE')),
  );
  const effectiveBaseSpeed = isSpeedZero ? 0 : exhaustionHalved ? Math.floor(baseSpeed / 2) : baseSpeed;
  const standUpCost = Math.floor(baseSpeed / 2);
  const effectiveArmorClass = getEquippedArmorClass(
    character.cards,
    character.armorClass,
    Math.floor((getEffectiveAbilityScore('DES') - 10) / 2),
  );
  const getAbilityModifier = (ability: AbilityKey) => {
    return Math.floor((getEffectiveAbilityScore(ability) - 10) / 2);
  };
  const effectiveMaxHitPoints = Math.max(
    1,
    character.hitPoints.max
      + (getAbilityModifier('CON') - Math.floor((character.abilities.CON.score - 10) / 2)) * character.level,
  );

  // Turn budget
  const [actionUsed, setActionUsed] = useState<boolean>(storedCombatTurn.actionUsed ?? false);
  const [bonusActionUsed, setBonusActionUsed] = useState<boolean>(storedCombatTurn.bonusActionUsed ?? false);
  const [reactionUsed, setReactionUsed] = useState<boolean>(storedCombatTurn.reactionUsed ?? false);

  // Usos extra por turno (para cartas que otorgan/recuperan acciones extra)
  const [actionExtraUses, setActionExtraUses] = useState<number>(storedCombatTurn.actionExtraUses ?? 0);
  const [bonusActionExtraUses, setBonusActionExtraUses] = useState<number>(storedCombatTurn.bonusActionExtraUses ?? 0);
  const [reactionExtraUses, setReactionExtraUses] = useState<number>(storedCombatTurn.reactionExtraUses ?? 0);

  const [movementLeft, setMovementLeft] = useState<number>(storedCombatTurn.movementLeft ?? effectiveBaseSpeed);

  // Initiative Order
  const [localCombatants, setLocalCombatants] = useState<Combatant[]>([
    { id: 'c-player', name: character.name, type: 'player', initiative: 18, hp: character.hitPoints.current, maxHp: effectiveMaxHitPoints, ac: effectiveArmorClass, conditions: [] },
    { id: 'c-enemy1', name: 'Caballero Espectral', type: 'enemy', initiative: 15, hp: 45, maxHp: 45, ac: 16, conditions: ['Asustado'] },
    { id: 'c-ally1', name: 'Lobo Compañero', type: 'ally', initiative: 12, hp: 22, maxHp: 22, ac: 13, conditions: [] },
  ]);

  const rawCombatants = (externalCombatants ?? localCombatants).map((combatant) => combatant.id === 'c-player'
    ? { ...combatant, name: character.name, hp: character.hitPoints.current, maxHp: effectiveMaxHitPoints, ac: effectiveArmorClass }
    : combatant);
  const combatants = [...rawCombatants].sort((a, b) => b.initiative - a.initiative);
  const setCombatants = externalUpdateCombatants ?? setLocalCombatants;

  const [newCombatantName, setNewCombatantName] = useState('');
  const [newCombatantType, setNewCombatantType] = useState<'player' | 'ally' | 'enemy'>('enemy');
  const [newCombatantHp, setNewCombatantHp] = useState(30);
  const [newCombatantAc, setNewCombatantAc] = useState(14);
  const [newCombatantInitiative, setNewCombatantInitiative] = useState(10);

  // Active Effects CRUD state
  const [activeEffects, setActiveEffects] = useState<ActiveEffect[]>(storedCombatTurn.activeEffects ?? []);
  const [isEffectModalOpen, setIsEffectModalOpen] = useState(false);

  const [editingEffectId, setEditingEffectId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editDuration, setEditDuration] = useState<number>(3);
  const [editConcentration, setEditConcentration] = useState(false);
  const [editNotes, setEditNotes] = useState('');

  useEffect(() => {
    try {
      window.localStorage.setItem(
        `grimorio_combat_turn_${character.id}`,
        JSON.stringify({
          round,
          concentrationSpell,
          actionUsed,
          bonusActionUsed,
          reactionUsed,
          actionExtraUses,
          bonusActionExtraUses,
          reactionExtraUses,
          movementLeft,
          activeEffects,
        } satisfies StoredCombatTurn),
      );
    } catch (error) {
      console.error('No se pudo guardar el estado del combate.', error);
    }
  }, [
    character.id,
    round,
    concentrationSpell,
    actionUsed,
    bonusActionUsed,
    reactionUsed,
    actionExtraUses,
    bonusActionExtraUses,
    reactionExtraUses,
    movementLeft,
    activeEffects,
  ]);

  const applyActionUsage = (card: GrimoireCard, forcedType?: 'action' | 'bonus' | 'reaction') => {
    const grant = card.extraTurnUses;

    // Tipo por defecto según el tipo de tarjeta/acción.
    const at = card.actionType?.toLowerCase() || '';
    const inferredTarget: 'action' | 'bonus' | 'reaction' =
      forcedType === 'action'
        ? 'action'
        : forcedType === 'bonus'
          ? 'bonus'
          : forcedType === 'reaction'
            ? 'reaction'
            : at.includes('adicional') || at.includes('bonus')
              ? 'bonus'
              : at.includes('reacción') || at.includes('reaction') || card.category === 'reaction'
                ? 'reaction'
                : 'action';

    const targetKind = grant && grant.type ? grant.type : inferredTarget;
    const extraUses = grant && typeof grant.extraUses === 'number' ? grant.extraUses : 0;

    const consumeFromTarget = (tk: 'action' | 'bonus' | 'reaction', extraVal: number) => {
      const extra = Math.max(0, Math.floor(extraVal));

      if (tk === 'action') {
        if (actionExtraUses > 0) {
          setActionExtraUses((prev) => Math.max(0, Math.floor(prev) - 1));
          return;
        }
        if (!actionUsed) {
          setActionUsed(true);
          return;
        }
        if (extra > 0) {
          setActionUsed(false);
          setActionExtraUses(extra);
        }
        return;
      }

      if (tk === 'bonus') {
        if (bonusActionExtraUses > 0) {
          setBonusActionExtraUses((prev) => Math.max(0, Math.floor(prev) - 1));
          return;
        }
        if (!bonusActionUsed) {
          setBonusActionUsed(true);
          return;
        }
        if (extra > 0) {
          setBonusActionUsed(false);
          setBonusActionExtraUses(extra);
        }
        return;
      }

      // reaction
      if (reactionExtraUses > 0) {
        setReactionExtraUses((prev) => Math.max(0, Math.floor(prev) - 1));
        return;
      }
      if (!reactionUsed) {
        setReactionUsed(true);
        return;
      }
      if (extra > 0) {
        setReactionUsed(false);
        setReactionExtraUses(extra);
      }
    };

    if (grant && extraUses > 0) {
      consumeFromTarget(targetKind, extraUses);
    } else {
      consumeFromTarget(inferredTarget, 0);
    }
  };

  const handleUseCard = (card: GrimoireCard, forcedType?: 'action' | 'bonus' | 'reaction') => {
    if (card.category === 'item') {
      const currentItem = character.cards.find((entry) => entry.id === card.id);
      const usesMax = currentItem?.uses?.max ?? 0;
      const usesCurrent = currentItem?.uses?.current ?? usesMax;
      const quantity = currentItem?.item?.quantity ?? 1;
      if ((usesMax > 0 && usesCurrent <= 0) || (currentItem?.item?.kind === 'consumable' && usesMax === 0 && quantity <= 0)) {
        alert(`${card.name || card.title} no tiene cargas disponibles.`);
        return;
      }
      if (currentItem) {
        const updatedCard: GrimoireCard = usesMax > 0
          ? { ...currentItem, uses: { ...currentItem.uses, current: Math.max(0, usesCurrent - 1) } }
          : currentItem.item?.kind === 'consumable'
            ? { ...currentItem, item: { ...currentItem.item, quantity: Math.max(0, quantity - 1) } }
            : currentItem;
        if (updatedCard !== currentItem) {
          onUpdate({ ...character, cards: character.cards.map((entry) => entry.id === card.id ? updatedCard : entry) });
        }
      }
    }
    const isSpell = card.category === 'spell';
    const spellLevel = card.level ?? 1;
    if (isSpell && spellLevel > 0) {
      const slots = character.spellSlots ?? [];
      const eligible = slots.filter((s: any) => s.tier >= spellLevel && (s.used ?? 0) < (s.max ?? 0));
      if (eligible.length === 0) {
        alert(`No tienes espacios de hechizo disponibles de nivel ${spellLevel} o superior para lanzar ${card.name || card.title}.`);
        return;
      }

      setActiveCastingCard(card);
      setActiveCastingCardType(forcedType);
      setIsSpellSlotModalOpen(true);
      return;
    }

    if (card.concentration) {
      setConcentrationSpell(card.name || card.title);
    }

    const damageFormula = card.damage?.length
      ? card.damage.map((damage) => {
          // En tu sistema actual, `damage.mod` ya representa el modificador final.
          // Para spells/reacciones/objetos no sumamos el mod de ataque (eso ya viene en `damage.mod`).
          const bonus = damage.mod;
          return `${damage.dice} ${bonus < 0 ? '-' : '+'} ${Math.abs(bonus)}`;
        }).join(' + ')
      : card.effectOrDamage;
    onOpenDiceTray(damageFormula);

    // Importante: manejar también el consumo base (action/bonus/reaction) aquí,
    // porque applyActionUsage está calculando el restore/extra según estados.
    if (forcedType === 'reaction') {
      // Reacción solo una vez por turno (el extra se maneja dentro de applyActionUsage)
      if (!reactionUsed) setReactionUsed(true);
    }

    if (forcedType === 'bonus') {
      if (!bonusActionUsed) setBonusActionUsed(true);
    }

    if (forcedType === 'action') {
      if (!actionUsed) setActionUsed(true);
    }

    applyActionUsage(card, forcedType);
  };

  const handleConfirmSlot = (chosenTier: number) => {
    if (!activeCastingCard) return;

    const slots = [...(character.spellSlots ?? [])];
    const targetSlot = slots.find((s) => s.tier === chosenTier);
    if (targetSlot) {
      targetSlot.used = (targetSlot.used ?? 0) + 1;
      targetSlot.current = Math.max(0, (targetSlot.max ?? 0) - targetSlot.used);
    }

    onUpdate({
      ...character,
      spellSlots: slots,
    });

    const cardName = activeCastingCard.name || activeCastingCard.title;
    if (activeCastingCard.concentration) {
      setConcentrationSpell(cardName);
      if (!activeEffects.some((e) => e.name === cardName)) {
        setActiveEffects((prev) => [
          ...prev,
          {
            id: `eff-${Date.now()}`,
            name: cardName,
            durationRounds: 10,
            concentration: true,
            notes: `Concentración (Nivel ${chosenTier})`,
          },
        ]);
      }
    }

    onOpenDiceTray(activeCastingCard.effectOrDamage);
    applyActionUsage(activeCastingCard, activeCastingCardType);

    setActiveCastingCard(null);
    setActiveCastingCardType(undefined);
  };

  const deleteEffect = (id: string) => {
    const target = activeEffects.find((e) => e.id === id);
    if (target && concentrationSpell === target.name) {
      setConcentrationSpell(null);
    }
    setActiveEffects((prev) => prev.filter((e) => e.id !== id));
  };

  const CONDITIONS_LIST = [
    'Incapacitado', 'Paralizado', 'Petrificado', 'Aturdido', 'Inconsciente',
    'Cegado', 'Asustado', 'Agarrado', 'Apresado', 'Derribado', 'Envenenado', 'Invisible',
    'Hechizado', 'Ensordecido',
  ];

  const CONDITION_DESCRIPTIONS: Record<string, string> = {
    'Incapacitado': 'No puedes realizar acciones, acciones adicionales ni reacciones. Pierdes la concentración.',
    'Paralizado': 'Incapacitado (sin acciones, acciones adicionales ni reacciones; pierdes concentración). Velocidad 0, fallas automáticamente salvaciones de Fuerza y Destreza, ataques contra ti con ventaja y los golpes a 5 pies son críticos.',
    'Petrificado': 'Incapacitado (sin acciones, acciones adicionales ni reacciones; pierdes concentración). Velocidad 0, fallas salvaciones de Fuerza/Destreza, ataques contra ti con ventaja, resistencia a todo el daño, inmune a veneno y enfermedad.',
    'Aturdido': 'Incapacitado (sin acciones, acciones adicionales ni reacciones; pierdes concentración). Fallas salvaciones de Fuerza/Destreza y los ataques contra ti tienen ventaja.',
    'Inconsciente': 'Incapacitado (sin acciones, acciones adicionales ni reacciones; pierdes concentración). También estás Derribado, velocidad 0, fallas salvaciones de Fuerza/Destreza, ataques con ventaja y críticos a 5 pies.',
    'Cegado': 'No ves, tus ataques tienen desventaja y los ataques contra ti tienen ventaja.',
    'Hechizado': 'No puedes atacar ni dañar con efectos al que te hechizó.',
    'Ensordecido': 'No oyes y fallas pruebas que dependan del oído.',
    'Asustado': 'Desventaja en pruebas y ataques mientras veas la fuente del miedo, y no puedes acercarte voluntariamente a ella.',
    'Agarrado': 'Velocidad 0 y desventaja al atacar a cualquiera que no sea quien te agarra.',
    'Apresado': 'Velocidad 0, tus ataques tienen desventaja, los ataques contra ti tienen ventaja y tienes desventaja en salvaciones de Destreza.',
    'Derribado': 'Solo puedes arrastrarte, atacas con desventaja y levantarte te cuesta la mitad de tu movimiento.',
    'Envenenado': 'Desventaja en tiradas de ataque y pruebas de característica.',
    'Invisible': 'No afecta tus acciones. Tienes ventaja en la iniciativa y en tus ataques, y los ataques contra ti tienen desventaja.',
  };

  // Advance to next turn
  const handleNextTurn = () => {
    // Keep action locks if incapacitating conditions are still active
    const incapacitating = ['Incapacitado', 'Paralizado', 'Petrificado', 'Aturdido', 'Inconsciente'];
    const stillIncapacitated = incapacitating.some((c) => character.activeConditions.includes(c));
    if (!stillIncapacitated) {
      setActionUsed(false);
      setBonusActionUsed(false);
      setReactionUsed(false);

      setActionExtraUses(0);
      setBonusActionExtraUses(0);
      setReactionExtraUses(0);
    }
    setMovementLeft(effectiveBaseSpeed);

    // Decrement effect durations
    const nextEffects = activeEffects
      .map((e) => ({ ...e, durationRounds: e.durationRounds - 1 }))
      .filter((e) => e.durationRounds > 0);

    setActiveEffects(nextEffects);
    setRound((r) => r + 1);
  };

  const endCombat = () => {
    setRound(1);
    setActiveEffects([]);
    setConcentrationSpell(null);
    setActionUsed(false);
    setBonusActionUsed(false);
    setReactionUsed(false);
    setMovementLeft(effectiveBaseSpeed);

    setActionExtraUses(0);
    setBonusActionExtraUses(0);
    setReactionExtraUses(0);
  };

  const addCombatant = () => {
    if (!newCombatantName.trim()) return;
    const newC: Combatant = {
      id: `c-${Date.now()}`,
      name: newCombatantName.trim(),
      type: newCombatantType,
      initiative: newCombatantInitiative,
      hp: newCombatantHp,
      maxHp: newCombatantHp,
      ac: newCombatantAc,
      conditions: [],
    };
    setCombatants((prev) => [...prev, newC].sort((a, b) => b.initiative - a.initiative));
    setNewCombatantName('');
  };

  const addPresetEffect = (name: string, duration: number, concentration: boolean) => {
    setActiveEffects((prev) => [
      ...prev,
      { id: `eff-${Date.now()}`, name, durationRounds: duration, concentration },
    ]);
    if (concentration) {
      setConcentrationSpell(name);
    }
  };

  const toggleCondition = (cond: string) => {
    const exists = character.activeConditions.includes(cond);
    let updated = exists
      ? character.activeConditions.filter((c) => c !== cond)
      : [...character.activeConditions, cond];

    // Inconsciente also forces Derribado
    if (!exists && cond === 'Inconsciente' && !updated.includes('Derribado')) {
      updated = [...updated, 'Derribado'];
    }
    // Removing Inconsciente does NOT auto-remove Derribado (player must stand up)

    onUpdate({ ...character, activeConditions: updated });

    const incapacitating = ['Incapacitado', 'Paralizado', 'Petrificado', 'Aturdido', 'Inconsciente'];
    if (!exists && incapacitating.includes(cond)) {
      setActionUsed(true);
      setBonusActionUsed(true);
      setReactionUsed(true);
      setConcentrationSpell(null);
    }

    // Speed-zero conditions immediately zero out remaining movement
    const speedZeroConds = ['Agarrado', 'Apresado', 'Paralizado', 'Petrificado', 'Inconsciente', 'Aturdido'];
    if (!exists && speedZeroConds.includes(cond)) {
      setMovementLeft(0);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* 1. Header Bar: Combat Tracker Banner */}
      <ClassWidgetFrame classId={character.classId} className="p-4 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            {/* Round Badge */}
            <div className="flex items-center gap-2 rounded-xl bg-black/40 border border-black/40 px-3.5 py-2 shadow-inner">
              <span className="text-xs font-bold text-zinc-400 font-cinzel">COMBATE</span>
              <span className="text-xs text-zinc-600">•</span>
              <span className="text-base font-extrabold text-emerald-400 font-cinzel">
                ⏳ Turno {round}
              </span>
            </div>

            {/* Initiative */}
            <div className="flex items-center gap-1.5 rounded-xl bg-black/40 border border-black/40 px-3 py-2 text-xs shadow-inner">
              <span className="text-zinc-400 font-cinzel">INICIATIVA:</span>
              <span className="font-extrabold text-purple-300 font-mono text-sm">
                {combatants.find((c) => c.type === 'player' || c.id === 'c-player')?.initiative ?? 18}
              </span>
            </div>

            {/* Prone Toggle */}
            <button
              onClick={() => setIsProne(!isProne)}
              className={`rounded-xl px-3 py-2 text-xs font-bold border transition cursor-pointer ${
                isProne
                  ? 'border-rose-500 bg-rose-950/60 text-rose-300'
                  : 'border-zinc-700 bg-black/40 text-zinc-300'
              }`}
            >
              {isProne ? '🤕 Derribado' : '🧍 En pie'}
            </button>

            {/* Concentration Indicator */}
            {concentrationSpell ? (
              <div className="flex items-center gap-2 rounded-xl border border-purple-500/40 bg-purple-950/40 px-3 py-2 text-xs text-purple-200 shadow-[0_0_10px_rgba(168,85,247,0.25)]">
                <Sparkles className="h-4 w-4 text-purple-400 animate-spin" />
                <span>Concentración: <strong>{concentrationSpell}</strong></span>
                <button
                  onClick={() => setConcentrationSpell(null)}
                  className="rounded bg-purple-900/60 hover:bg-purple-800 px-2 py-0.5 text-[10px] text-purple-300 ml-1 cursor-pointer"
                >
                  Terminar
                </button>
              </div>
            ) : (
              <span className="text-xs text-zinc-500 italic">Sin concentración activa</span>
            )}
          </div>

          {/* Action budget & Next Turn button */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setActionUsed(!actionUsed)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition ${
                actionUsed
                  ? 'bg-zinc-900 border-zinc-700 text-zinc-500 line-through'
                  : 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300'
              }`}
            >
              Acción: {actionUsed ? 'Gastada' : 'Libre'}
            </button>

            <button
              onClick={() => setBonusActionUsed(!bonusActionUsed)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition ${
                bonusActionUsed
                  ? 'bg-zinc-900 border-zinc-700 text-zinc-500 line-through'
                  : 'bg-purple-950/60 border-purple-500/40 text-purple-300'
              }`}
            >
              Adicional: {bonusActionUsed ? 'Gastada' : 'Libre'}
            </button>

            <button
              onClick={() => setReactionUsed(!reactionUsed)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition ${
                reactionUsed
                  ? 'bg-zinc-900 border-zinc-700 text-zinc-500 line-through'
                  : 'bg-amber-950/60 border-amber-500/40 text-amber-300'
              }`}
            >
              Reacción: {reactionUsed ? 'Gastada' : 'Libre'}
            </button>

            {/* Siguiente Turno */}
            <button
              onClick={handleNextTurn}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 px-4 py-2 font-cinzel text-xs font-bold text-stone-950 shadow-lg cursor-pointer transition active:scale-95"
            >
              <Swords className="h-4 w-4" />
              <span>Siguiente Turno</span>
            </button>
            <button
              onClick={() => {
                if (window.confirm('¿Iniciar un combate nuevo? Se reiniciarán el turno, las acciones y los efectos activos.')) {
                  endCombat();
                }
              }}
              className="flex items-center gap-1.5 rounded-xl border border-zinc-700 bg-black/40 px-3 py-2 font-cinzel text-[11px] font-bold text-zinc-300 transition hover:border-rose-500/50 hover:text-rose-300 cursor-pointer"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Nuevo combate</span>
            </button>
          </div>
        </div>
      </ClassWidgetFrame>

      {/* 2. Orden de Iniciativa */}
      <ClassWidgetFrame classId={character.classId} className="p-4 shadow-xl">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <h3 className="font-cinzel text-sm font-bold text-zinc-100">Orden de Iniciativa</h3>
            <span className="text-xs text-zinc-400 font-mono">Turno {round}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() =>
                setCombatants((prev) =>
                  [...prev].map((c) => ({
                    ...c,
                    initiative: Math.floor(Math.random() * 20) + 1,
                  })).sort((a, b) => b.initiative - a.initiative)
                )
              }
              className="rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-1 text-xs text-zinc-300 hover:bg-zinc-700 cursor-pointer"
            >
              🎲 Tirar todos
            </button>
          </div>
        </div>

        {/* Add combatant input row */}
        <div className="flex flex-wrap items-center gap-2 mb-3 bg-black/40 p-2.5 rounded-xl border border-black/40 text-xs shadow-inner">
          <input
            type="text"
            placeholder="Nombre del combatiente..."
            value={newCombatantName}
            onChange={(e) => setNewCombatantName(e.target.value)}
            className="flex-1 rounded border border-zinc-700 bg-zinc-900 px-3 py-1.5 text-white"
          />

          <select
            value={newCombatantType}
            onChange={(e) => setNewCombatantType(e.target.value as any)}
            className="rounded border border-zinc-700 bg-zinc-900 px-2.5 py-1.5 text-white"
          >
            <option value="enemy">Enemigo</option>
            <option value="ally">Aliado</option>
            <option value="player">Jugador</option>
          </select>

          <div className="flex flex-col items-center">
            <span className="text-[10px] text-zinc-400 font-semibold mb-0.5">PG</span>
            <input
              type="number"
              value={newCombatantHp}
              onChange={(e) => setNewCombatantHp(parseInt(e.target.value) || 1)}
              className="w-16 rounded border border-zinc-700 bg-zinc-900 px-2 py-1.5 text-white text-center"
            />
          </div>

          <div className="flex flex-col items-center">
            <span className="text-[10px] text-zinc-400 font-semibold mb-0.5">CA</span>
            <input
              type="number"
              value={newCombatantAc}
              onChange={(e) => setNewCombatantAc(parseInt(e.target.value) || 10)}
              className="w-16 rounded border border-zinc-700 bg-zinc-900 px-2 py-1.5 text-white text-center"
            />
          </div>

          <div className="flex flex-col items-center">
            <span className="text-[10px] text-zinc-400 font-semibold mb-0.5">INI</span>
            <input
              type="number"
              value={newCombatantInitiative}
              onChange={(e) => setNewCombatantInitiative(parseInt(e.target.value) || 0)}
              className="w-16 rounded border border-zinc-700 bg-zinc-900 px-2 py-1.5 text-white text-center"
            />
          </div>

          <button
            onClick={addCombatant}
            className="rounded bg-emerald-600 hover:bg-emerald-500 px-3 py-1.5 font-bold text-stone-950 cursor-pointer"
          >
            Añadir
          </button>
        </div>

        {/* Combatants list */}
        <div className="space-y-1.5">
          {combatants.map((c) => (
            <ClassSubCard
              key={c.id}
              classId={character.classId}
              className="flex items-center justify-between p-2.5 text-xs transition"
            >
              <div className="flex items-center gap-3">
                <span className="font-mono font-bold text-sm opacity-90 w-6 text-center">
                  {c.initiative}
                </span>
                <span className="font-semibold">{c.name}</span>
                <span className="text-[10px] uppercase font-bold opacity-60">({c.type})</span>
              </div>

              <div className="flex items-center gap-3">
                <span className="opacity-75 font-mono">{c.hp} / {c.maxHp} PG</span>
                <span className="opacity-75 font-mono">{c.ac} CA</span>
                <button
                  onClick={() => setCombatants(combatants.filter((item) => item.id !== c.id))}
                  className="p-1 opacity-60 hover:opacity-100 hover:text-rose-400 cursor-pointer"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </ClassSubCard>
          ))}
        </div>
      </ClassWidgetFrame>

      {/* 3. Condiciones Activas & Efectos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Condiciones */}
        <ClassWidgetFrame classId={character.classId} className="p-4">
          <div className="text-xs font-bold font-cinzel mb-3">Condiciones de Combate:</div>
          <div className="flex flex-wrap gap-1.5 mb-3">
            {CONDITIONS_LIST.map((cond) => {
              const isActive = character.activeConditions.includes(cond);
              return (
                <button
                  key={cond}
                  onClick={() => toggleCondition(cond)}
                  title={CONDITION_DESCRIPTIONS[cond]}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium transition cursor-pointer ${
                    isActive
                      ? 'border border-amber-400 bg-amber-400/20 text-amber-200 shadow-sm font-bold'
                      : 'border border-white/10 bg-black/40 opacity-75 hover:opacity-100'
                  }`}
                >
                  {cond}
                </button>
              );
            })}
          </div>

          {character.activeConditions.length > 0 && (
            <div className="space-y-1.5 border-t border-white/10 pt-3">
              <div className="text-[10px] uppercase font-bold text-amber-300 tracking-wider font-cinzel">Efectos de tus condiciones actuales:</div>
              {character.activeConditions.map((cond) => (
                <div key={cond} className="text-[11px] bg-black/40 border border-amber-500/30 p-2 rounded-lg">
                  <span className="font-bold text-amber-200">{cond}:</span>{' '}
                  <span className="opacity-90">{CONDITION_DESCRIPTIONS[cond] || 'Efecto activo.'}</span>
                </div>
              ))}
            </div>
          )}
        </ClassWidgetFrame>

        {/* Efectos Activos con Duración (CRUD & Concentración) */}
        <ClassWidgetFrame classId={character.classId} className="p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="font-cinzel text-xs font-bold flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-amber-400" />
              Efectos Activos (Avanzan al Siguiente Turno):
            </span>
            <button
              onClick={() => setIsEffectModalOpen(true)}
              className="flex items-center gap-1 rounded bg-black/50 border border-white/20 px-2.5 py-1 text-xs font-bold hover:bg-black/70 cursor-pointer text-amber-300"
            >
              <Plus className="h-3.5 w-3.5" /> Añadir efecto
            </button>
          </div>

          <div className="space-y-1.5">
            {activeEffects.map((eff) => {
              const isEditing = editingEffectId === eff.id;
              if (isEditing) {
                return (
                  <ClassSubCard
                    key={eff.id}
                    classId={character.classId}
                    className="flex flex-wrap items-center justify-between p-2.5 text-xs gap-2 bg-black/60"
                  >
                    <div className="flex flex-wrap items-center gap-2 flex-1">
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="rounded border border-zinc-700 bg-zinc-900 px-2 py-1 text-xs text-white flex-1 min-w-[100px]"
                      />
                      <input
                        type="number"
                        value={editDuration}
                        onChange={(e) => setEditDuration(parseInt(e.target.value) || 1)}
                        className="w-14 rounded border border-zinc-700 bg-zinc-900 px-2 py-1 text-xs text-white text-center"
                      />
                      <input
                        type="text"
                        value={editNotes}
                        onChange={(e) => setEditNotes(e.target.value)}
                        className="rounded border border-zinc-700 bg-zinc-900 px-2 py-1 text-xs text-white w-24"
                      />
                      <label className="flex items-center gap-1 text-xs cursor-pointer">
                        <input
                          type="checkbox"
                          checked={editConcentration}
                          onChange={(e) => setEditConcentration(e.target.checked)}
                          className="rounded border-zinc-700 bg-zinc-900 text-amber-500"
                        />
                        <span>Conc.</span>
                      </label>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => saveEditingEffect(eff.id)}
                        className="rounded bg-emerald-600 hover:bg-emerald-500 px-2.5 py-1 text-xs font-bold text-stone-950 cursor-pointer"
                      >
                        Guardar
                      </button>
                      <button
                        onClick={() => setEditingEffectId(null)}
                        className="rounded bg-zinc-700 hover:bg-zinc-600 px-2 py-1 text-xs text-white cursor-pointer"
                      >
                        Cancelar
                      </button>
                    </div>
                  </ClassSubCard>
                );
              }

              return (
                <ClassSubCard
                  key={eff.id}
                  classId={character.classId}
                  className="flex items-center justify-between p-2.5 text-xs"
                >
                  <div className="flex items-center gap-2">
                    <span className="font-bold">{eff.name}</span>
                    {eff.concentration && (
                      <span className="text-[10px] font-mono bg-purple-950/85 text-purple-300 border border-purple-500/40 px-1.5 py-0.5 rounded">
                        Concentración
                      </span>
                    )}
                    {eff.notes && <span className="text-[11px] opacity-75">({eff.notes})</span>}
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-mono">{eff.durationRounds} turnos</span>
                    <button
                      onClick={() => startEditingEffect(eff)}
                      className="opacity-60 hover:opacity-100 hover:text-amber-400 cursor-pointer"
                      title="Editar efecto"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => deleteEffect(eff.id)}
                      className="opacity-60 hover:opacity-100 hover:text-rose-400 cursor-pointer"
                      title="Eliminar efecto"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </ClassSubCard>
              );
            })}
          </div>
        </ClassWidgetFrame>
      </div>

      <CombatHitPointsFrame
        character={character}
        onUpdate={onUpdate}
        onOpenShortRest={onOpenShortRest}
      />

      {character.classId === 'barbaro' && (
        <ClassWidgetFrame classId={character.classId} className="mb-6 p-4 md:p-5">
          <BarbarianRageModule character={character} onUpdate={onUpdate} />
        </ClassWidgetFrame>
      )}

      {/* 4. Action Columns: Acción, Acción Adicional, Reacción, Movimiento */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Col 1: Acción */}
        <ClassWidgetFrame classId={character.classId} className={`p-4 transition ${actionUsed ? 'opacity-40 grayscale pointer-events-none' : ''}`}>
          <div className="flex items-center justify-between pb-2 mb-3 border-b border-white/10 pointer-events-auto">
            <div className="flex items-center gap-2">
              <span className="font-cinzel text-xs font-bold">🔴 Acción</span>
              <span className="text-[10px] font-mono font-bold bg-black/40 px-2 py-0.5 rounded border border-white/10">
                1 POR TURNO
              </span>
            </div>
            <button
              onClick={() => setActionUsed(!actionUsed)}
              className={`text-[10px] px-2 py-0.5 rounded font-bold border transition cursor-pointer ${
                actionUsed
                  ? 'bg-rose-950/80 border-rose-600 text-rose-300'
                  : 'bg-emerald-950/60 border-emerald-600/50 text-emerald-300 hover:bg-emerald-900'
              }`}
            >
              {actionUsed ? 'Gastada (Reset)' : 'Disponible'}
            </button>
          </div>

          <div className="space-y-2">
            {character.cards
              .filter((c) => {
                if (c.showIn?.combat === false) return false;
                const at = (c.actionType || '').toLowerCase();
                if (c.category === 'item' && c.item?.kind === 'weapon') return false;
                return (
                  at === 'acción' ||
                  at === 'action' ||
                  at === '1 acción' ||
                  at === 'especial' ||
                  (!c.actionType && c.category === 'attack')
                );
              })
              .map((card) => (
                <ClassSubCard key={card.id} classId={character.classId} className="p-3 text-xs">
                  <div className="font-cinzel font-bold">{card.name || card.title}</div>
                  <div className="text-[10px] opacity-75 my-1">
                    {(card as any).reach ?? (card as any).range ?? ''}
                    {' '}• {(card as any).targetOrArea ?? (card as any).target}
                  </div>
                  <button
                    onClick={() => handleUseCard(card, 'action')}
                    className="w-full mt-2 py-1.5 rounded bg-black/40 hover:bg-black/60 border border-white/15 font-semibold cursor-pointer"
                  >
                    🎲 {card.category === 'attack' ? 'Tirar daño' : 'Tirar / Desplegar'}
                    {card.category !== 'attack' && typeof (card as any).effectOrDamage === 'string'
                      ? `: ${(card as any).effectOrDamage}`
                      : ''}
                  </button>
                  {card.category === 'attack' && (
                    <button
                      onClick={() => {
                        const ability = card.ability ?? 'FUE';
                        const bonus = getAbilityModifier(ability)
                          + (card.proficient ? character.proficiencyBonus : 0)
                          + (card.magicBonus ?? 0)
                          + (card.attackBonus ?? 0)
                          + (card.attackType === 'spell' ? 0 : getItemEffectTotal(character.cards, 'attackBonus'));
                        onOpenDiceTray(`1d20 ${bonus < 0 ? '-' : '+'} ${Math.abs(bonus)}`);
                      }}
                      className="w-full mt-1 py-1 rounded bg-amber-950/50 hover:bg-amber-900/60 border border-amber-500/20 text-amber-100 font-semibold cursor-pointer"
                    >
                      Ataque {(() => {
                        const ability = card.ability ?? 'FUE';
                        const bonus = getAbilityModifier(ability)
                          + (card.proficient ? character.proficiencyBonus : 0)
                          + (card.magicBonus ?? 0)
                          + (card.attackBonus ?? 0)
                          + (card.attackType === 'spell' ? 0 : getItemEffectTotal(character.cards, 'attackBonus'));
                        return `${bonus < 0 ? '' : '+'}${bonus}`;
                      })()}
                    </button>
                  )}
                </ClassSubCard>
              ))}
            {getEquippedItems(character.cards).filter((card) => card.item?.kind === 'weapon').map((card) => {
              const weapon = card.item!;
              const attackBonus = getAbilityModifier(weapon.weaponAbility ?? 'FUE')
                + (weapon.weaponProficient ? character.proficiencyBonus : 0)
                + getItemEffectTotal(character.cards, 'attackBonus');
              const damageBonus = getAbilityModifier(weapon.weaponAbility ?? 'FUE')
                + getItemEffectTotal(character.cards, 'damageBonus');
              return (
                <ClassSubCard key={card.id} classId={character.classId} className="p-3 text-xs">
                  <div className="font-cinzel font-bold">{card.name} · Arma equipada</div>
                  <div className="text-[10px] opacity-75 my-1">{weapon.weaponRange || ''}{weapon.weaponDamage ? ` · ${weapon.weaponDamage} ${weapon.weaponDamageType || ''}` : ''}</div>
                  <div className="grid grid-cols-2 gap-1">
                    <button onClick={() => { onOpenDiceTray(`1d20 ${attackBonus < 0 ? '-' : '+'} ${Math.abs(attackBonus)}`); applyActionUsage(card, 'action'); }} className="mt-1 py-1.5 rounded bg-amber-950/50 hover:bg-amber-900/60 border border-amber-500/20 text-amber-100 font-semibold cursor-pointer">Ataque {attackBonus >= 0 ? '+' : ''}{attackBonus}</button>
                    {weapon.weaponDamage && <button onClick={() => { onOpenDiceTray(`${weapon.weaponDamage} ${damageBonus < 0 ? '-' : '+'} ${Math.abs(damageBonus)}`); applyActionUsage(card, 'action'); }} className="mt-1 py-1.5 rounded bg-black/40 hover:bg-black/60 border border-white/15 font-semibold cursor-pointer">Daño</button>}
                  </div>
                </ClassSubCard>
              );
            })}
          </div>
        </ClassWidgetFrame>

        {/* Col 2: Acción Adicional */}
        <ClassWidgetFrame classId={character.classId} className={`p-4 transition ${bonusActionUsed ? 'opacity-40 grayscale pointer-events-none' : ''}`}>
          <div className="flex items-center justify-between pb-2 mb-3 border-b border-white/10 pointer-events-auto">
            <div className="flex items-center gap-2">
              <span className="font-cinzel text-xs font-bold">🟣 Acción Adicional</span>
              <span className="text-[10px] font-mono font-bold bg-black/40 px-2 py-0.5 rounded border border-white/10">
                1 POR TURNO
              </span>
            </div>
            <button
              onClick={() => setBonusActionUsed(!bonusActionUsed)}
              className={`text-[10px] px-2 py-0.5 rounded font-bold border transition cursor-pointer ${
                bonusActionUsed
                  ? 'bg-rose-950/80 border-rose-600 text-rose-300'
                  : 'bg-emerald-950/60 border-emerald-600/50 text-emerald-300 hover:bg-emerald-900'
              }`}
            >
              {bonusActionUsed ? 'Gastada (Reset)' : 'Disponible'}
            </button>
          </div>

          <div className="space-y-2">
            {character.cards
              .filter((c) => {
                if (c.showIn?.combat === false) return false;
                const at = (c.actionType || '').toLowerCase();
                return (
                  at === 'acción adicional' ||
                  at === 'bonusaction' ||
                  at === 'bonus'
                );
              })
              .map((card) => (
                <ClassSubCard key={card.id} classId={character.classId} className="p-3 text-xs">
                  <div className="font-cinzel font-bold">{card.name || card.title}</div>
                  <div className="text-[10px] opacity-75 my-1">
                    {(card as any).reach ?? (card as any).range ?? ''}
                    {' '}• {(card as any).targetOrArea ?? (card as any).target}
                  </div>
                  <button
                    onClick={() => handleUseCard(card, 'bonus')}
                    className="w-full mt-2 py-1.5 rounded bg-black/40 hover:bg-black/60 border border-white/15 font-semibold cursor-pointer"
                  >
                    🎲 Tirar: {typeof (card as any).effectOrDamage === 'string' ? (card as any).effectOrDamage : ''}
                  </button>
                </ClassSubCard>
              ))}
          </div>
        </ClassWidgetFrame>

        {/* Col 3: Reacción */}
        <ClassWidgetFrame classId={character.classId} className={`p-4 transition ${reactionUsed ? 'opacity-40 grayscale pointer-events-none' : ''}`}>
          <div className="flex items-center justify-between pb-2 mb-3 border-b border-white/10 pointer-events-auto">
            <div className="flex items-center gap-2">
              <span className="font-cinzel text-xs font-bold">🟡 Reacción</span>
              <span className="text-[10px] font-mono font-bold bg-black/40 px-2 py-0.5 rounded border border-white/10">
                1 POR TURNO
              </span>
            </div>
            <button
              onClick={() => setReactionUsed(!reactionUsed)}
              className={`text-[10px] px-2 py-0.5 rounded font-bold border transition cursor-pointer ${
                reactionUsed
                  ? 'bg-rose-950/80 border-rose-600 text-rose-300'
                  : 'bg-emerald-950/60 border-emerald-600/50 text-emerald-300 hover:bg-emerald-900'
              }`}
            >
              {reactionUsed ? 'Gastada (Reset)' : 'Disponible'}
            </button>
          </div>

          <div className="space-y-2">
            {character.cards
              .filter((c) => {
                if (c.showIn?.combat === false) return false;
                const at = (c.actionType || '').toLowerCase();
                return (
                  at === 'reacción' ||
                  at === 'reaction' ||
                  c.category === 'reaction'
                );
              })
              .map((card) => (
                <ClassSubCard key={card.id} classId={character.classId} className="p-3 text-xs">
                  <div className="font-cinzel font-bold">{card.name || card.title}</div>
                  <div className="text-[10px] opacity-75 my-1">
                    {(card as any).reach ?? (card as any).range ?? ''}
                    {' '}• {(card as any).targetOrArea ?? (card as any).target}
                  </div>
                  <button
                    onClick={() => handleUseCard(card, 'reaction')}
                    className="w-full mt-2 py-1.5 rounded bg-black/40 hover:bg-black/60 border border-white/15 font-semibold cursor-pointer"
                  >
                    🎲 Tirar: {typeof (card as any).effectOrDamage === 'string' ? (card as any).effectOrDamage : ''}
                  </button>
                </ClassSubCard>
              ))}
          </div>
        </ClassWidgetFrame>

        {/* Col 4: Movimiento */}
        <ClassWidgetFrame classId={character.classId} className="p-4">
          <div className="flex items-center justify-between pb-2 mb-3 border-b border-white/10">
            <span className="font-cinzel text-xs font-bold">🟢 Movimiento</span>
            <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${isSpeedZero ? 'bg-red-950/60 border-red-600/50 text-red-300' : 'bg-black/40 border-white/10'}`}>
              {movementLeft} / {effectiveBaseSpeed} FT
              {isSpeedZero && ' — VELOCIDAD 0'}
              {!isSpeedZero && exhaustionHalved && ` (base ${baseSpeed} ft, reducida)`}
            </span>
          </div>

          {isSpeedZero ? (
            <div className="text-[11px] text-red-300 bg-red-950/40 border border-red-600/30 rounded-lg p-3 text-center">
              ⚠️ Tu velocidad es 0. No puedes moverte este turno.
            </div>
          ) : (
            <div className="space-y-3 text-xs">
              {isProne && (
                <div className="text-[11px] text-amber-300 bg-amber-950/40 border border-amber-600/30 rounded-lg p-2 space-y-1.5">
                  <div className="font-bold">⬇️ Estás Derribado</div>
                  <div className="opacity-90">Arrastrarte cuesta el doble de movimiento (5 ft = 10 ft).</div>
                  <button
                    onClick={() => {
                      if (movementLeft >= standUpCost) {
                        setMovementLeft((prev) => prev - standUpCost);
                        const updated = character.activeConditions.filter((c) => c !== 'Derribado');
                        onUpdate({ ...character, activeConditions: updated });
                      }
                    }}
                    disabled={movementLeft < standUpCost}
                    className={`w-full py-1.5 rounded font-bold border transition ${
                      movementLeft >= standUpCost
                        ? 'bg-amber-900/60 border-amber-500/50 text-amber-200 hover:bg-amber-800/60 cursor-pointer'
                        : 'bg-zinc-900/40 border-zinc-700 text-zinc-600 cursor-not-allowed'
                    }`}
                  >
                    🧍 Levantarse ({standUpCost} ft){movementLeft < standUpCost ? ' — sin movimiento suficiente' : ''}
                  </button>
                </div>
              )}

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setMovementLeft(Math.max(0, movementLeft - 5))}
                  className="flex-1 py-1.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-mono"
                >
                  -5 ft
                </button>
                <button
                  onClick={() => setMovementLeft(Math.max(0, movementLeft - 10))}
                  className="flex-1 py-1.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-mono"
                >
                  -10 ft
                </button>
                <button
                  onClick={() => setMovementLeft(Math.max(0, movementLeft - 15))}
                  className="flex-1 py-1.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-mono"
                >
                  -15 ft
                </button>
                <button
                  onClick={() => setMovementLeft(effectiveBaseSpeed)}
                  className="p-1.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-400"
                  title="Restablecer pies"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                </button>
              </div>

              <button
                onClick={() => setMovementLeft((prev) => prev + effectiveBaseSpeed)}
                className="w-full py-2 rounded-lg bg-teal-950 border border-teal-600/40 text-teal-200 font-bold hover:bg-teal-900 transition flex items-center justify-center gap-2"
              >
                🏃 Correr (Dash: +{effectiveBaseSpeed} ft)
              </button>

              <div className="p-2.5 rounded-lg border border-zinc-800 bg-zinc-900/40 space-y-1 text-[11px] text-zinc-400">
                <div><strong>Desplazamiento Base:</strong> Terreno difícil cuesta el doble.</div>
                {isProne && <div><strong>Arrastrarse:</strong> 5 ft de avance cuesta 10 ft de movimiento.</div>}
                <div><strong>Levantarse:</strong> Requiere {standUpCost} ft (mitad de tu velocidad base).</div>
                <div><strong>Destrabarse:</strong> No provocas ataques de oportunidad este turno.</div>
              </div>
            </div>
          )}
        </ClassWidgetFrame>
      </div>

      {/* Spell Slot Selection Modal */}
      <SpellSlotModal
        isOpen={isSpellSlotModalOpen}
        onClose={() => {
          setIsSpellSlotModalOpen(false);
          setActiveCastingCard(null);
          setActiveCastingCardType(undefined);
        }}
        card={activeCastingCard}
        character={character}
        onConfirmSlot={(chosenTier) => {
          setIsSpellSlotModalOpen(false);
          handleConfirmSlot(chosenTier);
        }}
      />

        <ActiveEffectModal
          isOpen={isEffectModalOpen}
          onClose={() => setIsEffectModalOpen(false)}
          character={character}
          onAddEffect={(newEff) => {
            setActiveEffects((prev) => [...prev, newEff]);
            if (newEff.concentration) {
              setConcentrationSpell(newEff.name);
            }
          }}
        />
      </div>
  );
};
