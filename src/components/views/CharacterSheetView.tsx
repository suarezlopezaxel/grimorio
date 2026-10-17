import React, { useState } from 'react';
import { getDieSize } from '../../lib/hitDice';
import { abilityForSkill } from '../../lib/skillAbilities';
import { getArmorSpeedPenalty, getEffectiveAbilityScore as calculateEffectiveAbilityScore, getEquippedArmorClass, getEquippedItems, getItemEffectTotal, getEquippedResistances } from '../../lib/itemEffects';
import { normalizeBardicInspiration } from '../../lib/bardicInspiration';
import {
  Shield,
  Heart,
  Zap,
  Sparkles,
  RotateCcw,
  Moon,
  Sun,
  Dices,
  Plus,
  Trash2,
  Award,
} from 'lucide-react';
import { InventorySection } from './InventorySection';
import { DefensesSection } from './DefensesSection';
import { SpellSlotsSection } from './SpellSlotsSection';
// removed SpellEditor
import { CLASS_THEMES } from '../../data/classThemes';
import { ClassFeatureDispatcher } from '../classFeatures/ClassFeatureDispatcher';
import { ClassAbilityBox } from '../fx/ClassAbilityBox';
import {
  ClassStyledContainer,
  ClassWidget,
  ClassBox,
  ClassSubBox,
} from '../fx/ClassStyledContainer';
import { CharacterSheet, AbilityKey, ProficiencyLevel, InventoryItem } from '../../types/character';

interface Props {
  character: CharacterSheet;
  onUpdate: (updated: CharacterSheet) => void;
  onOpenDiceTray: (formula?: string, callback?: (result: number) => void) => void;
  onOpenLevelUp: () => void;
  onOpenShortRest: () => void;
  onTriggerShake?: () => void;
  onTriggerAuraPulse?: () => void;
  onEmitRipple?: (x: number, y: number) => void;
  onEmitNote?: (x: number, y: number) => void;
  onToggleStealthMode?: (active: boolean) => void;
  onTriggerWildSurge?: (result: string) => void;
  onUpdateInitiative?: (initiative: number) => void;
}

export const CharacterSheetView: React.FC<Props> = ({
  character,
  onUpdate,
  onOpenDiceTray,
  onOpenLevelUp,
  onOpenShortRest,
  onTriggerShake,
  onTriggerAuraPulse,
  onEmitRipple,
  onEmitNote,
  onToggleStealthMode,
  onTriggerWildSurge,
  onUpdateInitiative,
}) => {
  // State
  const [selectedDamageType, setSelectedDamageType] = useState('Sin tipo');
  const [newResistance, setNewResistance] = useState('');
  const [resistanceType, setResistanceType] = useState<'Resistencia' | 'Inmunidad' | 'Vulnerabilidad'>('Resistencia');

  const theme = CLASS_THEMES[character.classId] || CLASS_THEMES.mago;

  // Ability modifier calculator
  const getMod = (score: number) => Math.floor((score - 10) / 2);
  const formatMod = (mod: number) => (mod >= 0 ? `+${mod}` : `${mod}`);
  const d20Formula = (modifier: number) =>
    `1d20 ${modifier >= 0 ? '+' : '-'} ${Math.abs(modifier)}`;
  const featCards = character.cards.filter((card) => card.category === 'feat' || card.category === 'skill');
  const getEffectiveAbilityScore = (ability: AbilityKey) =>
    calculateEffectiveAbilityScore(character.cards, ability, character.abilities[ability].score);
  const getEffectiveAbilityMod = (ability: AbilityKey) =>
    getMod(getEffectiveAbilityScore(ability));
  const initiativeBonus = character.initiativeBonus
    + getEffectiveAbilityMod('DES')
    - getMod(character.abilities.DES.score);
  const spellcastingModDelta = getEffectiveAbilityMod(character.spellcastingAbility)
    - getMod(character.abilities[character.spellcastingAbility].score);
  const spellSaveDC = character.spellSaveDC + spellcastingModDelta;
  const spellAttackBonus = character.spellAttackBonus + spellcastingModDelta;
  const effectiveMaxHitPoints = Math.max(
    1,
    character.hitPoints.max
      + (getEffectiveAbilityMod('CON') - getMod(character.abilities.CON.score)) * character.level,
  );
  const effectiveCarryingCapacity = getEffectiveAbilityScore('FUE') * 15;
  const effectiveArmorClass = getEquippedArmorClass(
    character.cards,
    character.armorClass,
    getEffectiveAbilityMod('DES'),
  );
  const effectiveSpeed = Math.max(0, character.speed
    + getItemEffectTotal(character.cards, 'speedBonus')
    - getArmorSpeedPenalty(character.cards, getEffectiveAbilityScore('FUE')));
  const equippedItemResistances = getEquippedResistances(character.cards);
  const equippedArmorNames = getEquippedItems(character.cards)
    .filter((card) => card.item?.kind === 'armor' || card.item?.kind === 'shield')
    .map((card) => card.name);

  const getEffectiveSkillLevel = (skillName: string, proficiency: ProficiencyLevel): ProficiencyLevel => {
    const featGrantsExpertise = skillName && featCards.some((feat) => feat.featExpertiseSkills?.includes(skillName));
    const featGrantsProficiency = skillName && featCards.some((feat) => feat.featSkillProficiencies?.includes(skillName));
    if (proficiency === 'expertise' || featGrantsExpertise) return 'expertise';
    if (proficiency === 'proficient' || featGrantsProficiency) return 'proficient';
    return proficiency;
  };

  // Skill bonus calculator
  const getSkillBonus = (skillName: string, ability: AbilityKey, proficiency: ProficiencyLevel) => {
    const mod = getEffectiveAbilityMod(ability);
    const effectiveLevel = getEffectiveSkillLevel(skillName, proficiency);
    if (effectiveLevel === 'expertise') return mod + character.proficiencyBonus * 2;
    if (effectiveLevel === 'proficient') return mod + character.proficiencyBonus;
    if (effectiveLevel === 'half') return mod + Math.floor(character.proficiencyBonus / 2);
    return mod;
  };

  // Toggle skill proficiency
  const cycleSkillProficiency = (skillName: string) => {
    const order: ProficiencyLevel[] = ['none', 'proficient', 'expertise', 'half'];
    const updatedSkills = character.skills.map((s) => {
      if (s.name === skillName) {
        const nextIdx = (order.indexOf(s.level) + 1) % order.length;
        return { ...s, level: order[nextIdx] };
      }
      return s;
    });
    onUpdate({ ...character, skills: updatedSkills });
  };

  // Toggle saving throw proficiency
  const toggleSaveProficiency = (key: AbilityKey) => {
    const current = character.abilities[key];
    onUpdate({
      ...character,
      abilities: {
        ...character.abilities,
        [key]: { ...current, proficientSave: !current.proficientSave },
      },
    });
  };

  // Hit Points handlers (equivalentes a los de CW for MCU 11.1)
  const adjustHP = (delta: number) => {
    const next = Math.max(
      0,
      Math.min(effectiveMaxHitPoints, character.hitPoints.current + delta),
    );
    onUpdate({
      ...character,
      hitPoints: { ...character.hitPoints, current: next },
    });
  };

  const handleLongRest = () => {
    const druidMaxUses =
      character.level >= 17 ? 4 : character.level >= 6 ? 3 : 2;
    const bardResources = character.classResources.bard;
    const normalizedBardResources = normalizeBardicInspiration(
      bardResources,
      character.level,
      getEffectiveAbilityScore('CAR'),
    );
    onUpdate({
      ...character,
      hitPoints: {
        ...character.hitPoints,
        current: effectiveMaxHitPoints,
        temp: 0,
      },
      hitDice: { ...character.hitDice, current: character.hitDice.max },
      spellSlots: character.spellSlots.map((s) => ({ ...s, used: 0 })),
      cards: character.cards.map((card) => (
        card.uses?.recharge === 'short'
        || card.uses?.recharge === 'long'
        || card.uses?.recharge === 'dawn'
        || card.uses?.recharge === 'dusk'
          ? { ...card, uses: { ...card.uses, current: card.uses.max } }
          : card
      )),
      classResources: {
        ...character.classResources,
        ...(character.classId === 'druida'
          ? {
              druid: {
                ...(character.classResources.druid ?? {
                  wildShapeCurrent: druidMaxUses,
                  wildShapeMax: druidMaxUses,
                  activeForm: null,
                  forms: [],
                }),
                wildShapeMax: druidMaxUses,
                wildShapeCurrent: druidMaxUses,
              },
            }
          : {}),
        ...(character.classId === 'bardo'
          ? {
              bard: {
                ...normalizedBardResources,
                inspirationCurrent: normalizedBardResources.inspirationMax,
              },
            }
          : {}),
      },
      deathSaves: { successes: 0, failures: 0 },
    });
  };

  // Add Item to inventory
  const addItem = () => {
    const newItem: InventoryItem = {
      id: `item-${Date.now()}`,
      name: 'Objeto de Aventurero',
      quantity: 1,
      weight: 1,
      attuned: false,
      value: '1 po',
    };
    onUpdate({
      ...character,
      inventory: [...character.inventory, newItem],
    });
  };

  const removeItem = (id: string) => {
    const inventoryItem = character.inventory.find((item) => item.id === id);
    if (inventoryItem?.cardId) {
      onUpdate({
        ...character,
        cards: character.cards.filter((card) => card.id !== inventoryItem.cardId),
      });
      return;
    }
    onUpdate({
      ...character,
      inventory: character.inventory.filter((i) => i.id !== id),
    });
  };

  const updateItem = (id: string, updates: Partial<InventoryItem>) => {
    const inventoryItem = character.inventory.find((item) => item.id === id);
    if (inventoryItem?.cardId) {
      onUpdate({
        ...character,
        cards: character.cards.map((card) => {
          if (card.id !== inventoryItem.cardId || !card.item) return card;
          const itemUpdates: Partial<NonNullable<typeof card.item>> = {};
          if (updates.quantity != null) itemUpdates.quantity = Math.max(0, updates.quantity);
          if (updates.weight != null) itemUpdates.weight = Math.max(0, updates.weight);
          if (updates.value != null) itemUpdates.value = updates.value;
          if (updates.attuned != null) itemUpdates.attuned = updates.attuned;
          if (updates.requiresAttunement != null) {
            itemUpdates.requiresAttunement = updates.requiresAttunement;
            if (!updates.requiresAttunement) itemUpdates.attuned = false;
          }
          if (updates.equipped != null) return { ...card, equipped: updates.equipped, item: { ...card.item, ...itemUpdates } };
          return { ...card, name: updates.name ?? card.name, title: updates.name ?? card.title, item: { ...card.item, ...itemUpdates } };
        }),
      });
      return;
    }
    onUpdate({
      ...character,
      inventory: character.inventory.map((i) => (i.id === id ? { ...i, ...updates } : i)),
    });
  };

  const removeDefense = (type: 'resistances' | 'immunities' | 'vulnerabilities', index: number) => {
    const def = { ...character.defenses };
    def[type] = def[type].filter((_, i) => i !== index);
    onUpdate({ ...character, defenses: def });
  };

  // Add defense
  const addDefense = () => {
    if (!newResistance.trim()) return;
    const def = { ...character.defenses };
    if (resistanceType === 'Resistencia') {
      def.resistances = [...def.resistances, newResistance.trim()];
    } else if (resistanceType === 'Inmunidad') {
      def.immunities = [...def.immunities, newResistance.trim()];
    } else {
      def.vulnerabilities = [...def.vulnerabilities, newResistance.trim()];
    }
    onUpdate({ ...character, defenses: def });
    setNewResistance('');
  };

  const toggleSpellSlot = (tierIndex: number, slotIndex: number) => {
    const nextUsed = (() => {
      const slot = character.spellSlots[tierIndex];
      if (!slot) return 0;
      if (slotIndex < slot.used) return Math.max(0, slot.used - 1);
      return Math.min(slot.max, slot.used + 1);
    })();

    const updatedSlots = character.spellSlots.map((s, idx) =>
      idx === tierIndex ? { ...s, used: nextUsed } : s
    );

    onUpdate({ ...character, spellSlots: updatedSlots });
  };

  const handleToggleDeathSave = (key: 'successes' | 'failures', index: number) => {
    console.log(`Toggling ${key} at index ${index}`);
    const currentVal = character.deathSaves[key];
    const nextVal = index < currentVal ? index : index + 1;

    onUpdate({
      ...character,
      deathSaves: {
        ...character.deathSaves,
        [key]: nextVal,
      },
    });
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* 1. Hero Identity Card with Class Widget Frame */}
      <ClassWidget classId={character.classId} className="p-4 md:p-5">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            {/* Avatar with Ring */}
            <div className="relative">
              <div
                className="h-20 w-20 md:h-24 md:w-24 rounded-full overflow-hidden border-2 shadow-xl ring-4 ring-black/40"
                style={{ borderColor: theme.palette.primary }}
              >
                <img
                  src={character.portraitUrl}
                  alt={character.name}
                  className="h-full w-full object-cover"
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
              </div>

              {/* Inspiration Badge / Toggle */}
              <button
                onClick={() => onUpdate({ ...character, inspiration: !character.inspiration })}
                className={`absolute -bottom-2 -right-1 px-2.5 py-0.5 rounded-full text-[9px] font-bold tracking-wider uppercase border transition shadow-md cursor-pointer ${
                  character.inspiration
                    ? 'bg-purple-600 text-white border-purple-400 shadow-[0_0_10px_#a855f7]'
                    : 'bg-zinc-800 text-zinc-500 border-zinc-700'
                }`}
              >
                INSPIRACIÓN {character.inspiration ? 'ON' : 'OFF'}
              </button>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-amber-400 tracking-wider uppercase font-cinzel">
                  HÉROE
                </span>
                <span className="text-zinc-600">•</span>
                <span className="text-xs text-zinc-400 font-serif italic">{character.epithet}</span>
              </div>

              <h2 className="font-cinzel text-2xl md:text-3xl font-extrabold text-zinc-100 tracking-wide">
                {character.name}
              </h2>

              <div className="mt-1 flex items-center gap-3">
                <button
                  onClick={onOpenLevelUp}
                  className="flex items-center gap-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 px-3 py-1 text-xs font-bold transition cursor-pointer"
                >
                  <Award className="h-3.5 w-3.5 text-amber-400" />
                  <span>Subir de Nivel</span>
                </button>
              </div>
            </div>
          </div>

          {/* Identity Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full lg:w-auto text-xs">
            <ClassSubBox classId={character.classId} className="p-3">
              <span className="text-[10px] font-bold opacity-75 uppercase tracking-wider block mb-1">
                Clase & Subclase
              </span>
              <div className="font-semibold truncate text-sm font-cinzel">{theme.name}</div>
              <div className="text-[11px] opacity-75 truncate">{character.subclass}</div>
            </ClassSubBox>

            <ClassSubBox classId={character.classId} className="p-3">
              <span className="text-[10px] font-bold opacity-75 uppercase tracking-wider block mb-1">
                Nivel
              </span>
              <div className="font-bold text-base font-cinzel">Nv. {character.level}</div>
              <div className="text-[11px] opacity-75 font-mono">Bono Comp: +{character.proficiencyBonus}</div>
            </ClassSubBox>

            <ClassSubBox classId={character.classId} className="p-3">
              <span className="text-[10px] font-bold opacity-75 uppercase tracking-wider block mb-1">
                Especie / Raza
              </span>
              <div className="font-semibold truncate text-sm">{character.species}</div>
              <div className="text-[11px] opacity-75 font-mono">Velocidad: {character.speed} ft</div>
            </ClassSubBox>

            <ClassSubBox classId={character.classId} className="p-3">
              <span className="text-[10px] font-bold opacity-75 uppercase tracking-wider block mb-1">
                Trasfondo / Alineación
              </span>
              <div className="font-semibold truncate text-sm">{character.background}</div>
              <div className="text-[11px] opacity-75 truncate">{character.alignment}</div>
            </ClassSubBox>
          </div>
        </div>
      </ClassWidget>

      {/* 2. Active Class Special Mechanic Dispatcher */}
      <ClassFeatureDispatcher
        character={character}
        onUpdate={onUpdate}
        onTriggerShake={onTriggerShake}
        onTriggerAuraPulse={onTriggerAuraPulse}
        onEmitRipple={onEmitRipple}
        onEmitNote={onEmitNote}
        onToggleStealthMode={onToggleStealthMode}
        onRollDiceFormula={(formula, cb) => onOpenDiceTray(formula, cb)}
        onTriggerWildSurge={onTriggerWildSurge}
      />

      <ClassWidget classId={character.classId} className="p-4 md:p-5">
        <h3 className="mb-4 flex items-center gap-2 font-cinzel text-base font-bold">
          <Award className="h-4 w-4 text-amber-400" />
          Dotes & Rasgos
        </h3>
        {featCards.length === 0 ? (
          <ClassSubBox classId={character.classId} className="p-3 text-xs italic opacity-75">
            Aún no hay dotes o rasgos registrados.
          </ClassSubBox>
        ) : (
          <div className="grid grid-cols-1 gap-2.5 md:grid-cols-2">
            {featCards.map((feat) => (
              <ClassSubBox key={feat.id} classId={character.classId} className="p-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h4 className="font-cinzel text-sm font-bold">{feat.name}</h4>
                  <span className="text-[10px] opacity-75">{feat.actionType}</span>
                </div>
                <p className="mt-1 text-[10px] opacity-75">
                  {{
                    origin: 'Origen',
                    general: 'General',
                    fighting_style: 'Estilo de combate',
                    epic_boon: 'Don épico',
                  }[feat.featRuleCategory || 'origin']}
                  {feat.featCategory ? ` · ${feat.featCategory}` : ''}
                </p>
                {feat.featPrerequisite && (
                  <p className="mt-1 text-[10px] opacity-75">Requisito: {feat.featPrerequisite}</p>
                )}
                {(feat.featMinimumLevel ?? 1) > 1 && (
                  <p className="mt-1 text-[10px] opacity-75">Nivel mínimo: {feat.featMinimumLevel}</p>
                )}
                {feat.featRequiredClass && (
                  <p className="mt-1 text-[10px] opacity-75">Clase requerida: {feat.featRequiredClass}</p>
                )}
                {feat.featRequiredAbility && (
                  <p className="mt-1 text-[10px] opacity-75">
                    Requiere {feat.featRequiredAbility} {feat.featRequiredAbilityScore ?? 13}+
                  </p>
                )}
                {(feat.featAbilityIncreases || (feat.featAbility ? [{
                  ability: feat.featAbility,
                  amount: feat.featModifier ?? 0,
                  maxScore: feat.featRuleCategory === 'epic_boon' ? 30 : 20,
                }] : [])).map((increase, index) => (
                  <p key={index} className="mt-1 font-mono text-xs text-emerald-300">
                    {increase.ability} {increase.amount > 0 ? '+' : ''}{increase.amount} (máx. {increase.maxScore})
                  </p>
                ))}
                {feat.featAdditionalBenefits && (
                  <p className="mt-2 whitespace-pre-wrap text-xs">{feat.featAdditionalBenefits}</p>
                )}
                {feat.featSkillProficiencies && feat.featSkillProficiencies.length > 0 && (
                  <p className="mt-2 text-[10px] opacity-75">
                    Competencias: {feat.featSkillProficiencies.join(', ')}
                  </p>
                )}
                {feat.featExpertiseSkills && feat.featExpertiseSkills.length > 0 && (
                  <p className="mt-1 text-[10px] opacity-75">
                    Pericia: {feat.featExpertiseSkills.join(', ')}
                  </p>
                )}
                <p className="mt-2 whitespace-pre-wrap text-xs">{feat.description}</p>
                {(feat.uses?.max ?? 0) > 0 && (
                  <p className="mt-2 text-[10px] font-mono opacity-75">
                    Usos: {feat.uses?.current ?? feat.uses?.max}/{feat.uses?.max}
                    {feat.uses?.recharge ? ` · Recupera: ${feat.uses.recharge}` : ''}
                  </p>
                )}
              </ClassSubBox>
            ))}
          </div>
        )}
      </ClassWidget>

      {/* Death Saves removidos */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Condiciones */}
        <ClassWidget classId={character.classId} className="p-4 md:p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="font-cinzel text-xs font-bold">Condiciones Activas:</span>
            <div className="flex items-center gap-1.5 text-xs opacity-75">
              <span>Agotamiento:</span>
              <select
                value={character.exhaustion}
                onChange={(e) => onUpdate({ ...character, exhaustion: parseInt(e.target.value) || 0 })}
                className="rounded border border-white/10 bg-black/40 px-2 py-0.5 text-xs"
              >
                {[0, 1, 2, 3, 4, 5, 6].map((lvl) => (
                  <option key={lvl} value={lvl}>
                    Nivel {lvl}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <ClassSubBox classId={character.classId} className="p-3 text-xs italic">
            {character.activeConditions.length === 0
              ? 'Sin condiciones activas. Velocidad efectiva: ' + effectiveSpeed + ' ft'
              : character.activeConditions.join(', ')}
          </ClassSubBox>
        </ClassWidget>

        {/* Resistencias / Inmunidades */}
        <DefensesSection
          character={{
            ...character,
            defenses: {
              ...character.defenses,
              resistances: [...new Set([...character.defenses.resistances, ...equippedItemResistances])],
            },
          }}
          newResistance={newResistance}
          setNewResistance={setNewResistance}
          resistanceType={resistanceType}
          setResistanceType={setResistanceType}
          addDefense={addDefense}
          removeDefense={removeDefense}
        />
      </div>

      {/* 4. Inventario & Monedas */}
      <InventorySection
        character={{ ...character, carryingCapacityMax: effectiveCarryingCapacity }}
        onUpdate={onUpdate}
        addItem={addItem}
        removeItem={removeItem}
        updateItem={updateItem}
      />

      {/* 5. Características & Modificadores: Visceral Class-Themed Ability Boxes! */}
      <ClassWidget classId={character.classId} className="p-4 md:p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-cinzel text-base font-bold flex items-center gap-2">
            <span>🛡️</span>
            <span>Características & Modificadores</span>
          </h3>
          <span className="text-xs opacity-75 font-serif italic">
            Haz clic en Tirar para lanzar d20 + mod
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {(['FUE', 'DES', 'CON', 'INT', 'SAB', 'CAR'] as AbilityKey[]).map((key) => {
            const ab = character.abilities[key];
            const score = getEffectiveAbilityScore(key);
            const mod = getEffectiveAbilityMod(key);
            const isKeyAbility = character.keyAbility === key;
            const saveBonus = ab.proficientSave ? mod + character.proficiencyBonus : mod;

            return (
              <ClassAbilityBox
                key={key}
                abilityKey={key}
                label={ab.label}
                score={score}
                mod={mod}
                proficientSave={ab.proficientSave}
                saveBonus={saveBonus}
                isKeyAbility={isKeyAbility}
                classId={character.classId}
                onRoll={() => onOpenDiceTray(d20Formula(mod))}
                onToggleSave={() => toggleSaveProficiency(key)}
                onToggleKeyAbility={() => onUpdate({
                  ...character,
                  keyAbility: isKeyAbility ? null : key,
                })}
              />
            );
          })}
        </div>
      </ClassWidget>

      {/* 6. Combat Stats Row: CA, Iniciativa, Velocidad, Competencia, Pasiva, CD Hechizo */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* Armadura (CA) */}
        <ClassBox classId={character.classId} withCorners className="text-center p-3">
          <div className="flex items-center justify-center gap-1.5 text-xs font-bold opacity-75 mb-1">
            <Shield className="h-4 w-4 text-emerald-400" />
            <span className="font-cinzel text-[11px]">ARMADURA (CA)</span>
          </div>
          <div className="font-cinzel text-3xl font-extrabold my-1 drop-shadow">{effectiveArmorClass}</div>
          <div className="text-[10px] opacity-75 truncate">{equippedArmorNames.length ? equippedArmorNames.join(', ') : character.armorTypeDescription}</div>
        </ClassBox>

        {/* Iniciativa */}
        <ClassBox
          classId={character.classId}
          withCorners
          hoverable
          className="text-center p-3 cursor-pointer"
        >
          <div
            onClick={() => {
              const roll = Math.floor(Math.random() * 20) + 1;
              const total = roll + initiativeBonus;
              onUpdateInitiative?.(total);
              onOpenDiceTray(d20Formula(initiativeBonus), (result) => {
                onUpdateInitiative?.(result);
              });
            }}
            className="w-full h-full cursor-pointer"
          >
            <div className="flex items-center justify-center gap-1.5 text-xs font-bold opacity-75 mb-1">
              <Zap className="h-4 w-4 text-purple-400" />
              <span className="font-cinzel text-[11px]">INICIATIVA</span>
            </div>
            <div className="font-cinzel text-3xl font-extrabold my-1 drop-shadow">
              {formatMod(initiativeBonus)}
            </div>
            <div className="text-[10px] opacity-75">Mod. Destreza</div>
          </div>
        </ClassBox>

        {/* Velocidad */}
        <ClassBox classId={character.classId} withCorners className="text-center p-3">
          <div className="text-xs font-bold opacity-75 mb-1 font-cinzel text-[11px]">VELOCIDAD</div>
          <div className="font-cinzel text-3xl font-extrabold my-1 drop-shadow">{effectiveSpeed}</div>
          <div className="text-[10px] opacity-75">{Math.floor(character.speed / 5)} casillas</div>
        </ClassBox>

        {/* Competencia */}
        <ClassBox classId={character.classId} withCorners className="text-center p-3">
          <div className="text-xs font-bold opacity-75 mb-1 font-cinzel text-[11px]">COMPETENCIA</div>
          <div className="font-cinzel text-3xl font-extrabold my-1 drop-shadow">
            +{character.proficiencyBonus}
          </div>
          <div className="text-[10px] opacity-75">Escala con nivel</div>
        </ClassBox>

        {/* CD Salv. Hechizo */}
        <ClassBox classId={character.classId} withCorners className="text-center p-3">
          <div className="text-xs font-bold opacity-75 mb-1 font-cinzel text-[11px]">CD SALV. HECHIZO</div>
          <div className="font-cinzel text-3xl font-extrabold my-1 drop-shadow">
            {spellSaveDC}
          </div>
          <div className="text-[10px] opacity-75">8 + Bono + Mod</div>
        </ClassBox>

        {/* Ataque de Hechizo */}
        <ClassBox
          classId={character.classId}
          withCorners
          hoverable
          className="text-center p-3 cursor-pointer"
        >
          <div
            onClick={() => onOpenDiceTray(d20Formula(spellAttackBonus))}
            className="w-full h-full"
          >
            <div className="text-xs font-bold opacity-75 mb-1 font-cinzel text-[11px]">ATAQUE HECHIZO</div>
            <div className="font-cinzel text-3xl font-extrabold my-1 drop-shadow">
              {formatMod(spellAttackBonus)}
            </div>
            <div className="text-[10px] opacity-75">Bono + Mod</div>
          </div>
        </ClassBox>
      </div>

      {/* 7. Puntos de Golpe (PG), Curación & Descansos */}
      <ClassWidget classId={character.classId} className="p-4 md:p-5">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-3">
            <Heart className="h-6 w-6 text-red-500 animate-pulse" />
            <div>
              <h3 className="font-cinzel text-base font-bold">Puntos de Golpe (PG)</h3>
              <p className="text-xs opacity-75">Control de vida, descanso corto y descanso largo</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onOpenShortRest}
              className="flex items-center gap-1.5 rounded-lg border border-indigo-500/40 bg-indigo-950/40 px-3 py-1.5 text-xs font-semibold text-indigo-300 hover:bg-indigo-900/50 transition cursor-pointer"
            >
              <Moon className="h-3.5 w-3.5" />
              <span>D. Corto</span>
            </button>

            <button
              onClick={handleLongRest}
              className="flex items-center gap-1.5 rounded-lg border border-amber-500/40 bg-amber-950/40 px-3 py-1.5 text-xs font-semibold text-amber-300 hover:bg-amber-900/50 transition cursor-pointer"
            >
              <Sun className="h-3.5 w-3.5" />
              <span>D. Largo</span>
            </button>
          </div>
        </div>

        {/* Current / Max HP display and quick increment buttons */}
        <ClassSubBox classId={character.classId} className="p-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <button
              onClick={() => adjustHP(-5)}
              className="rounded-lg bg-black/40 hover:bg-rose-950/80 text-rose-300 border border-white/10 px-3 py-1.5 text-xs font-bold font-mono transition cursor-pointer"
            >
              -5
            </button>
            <button
              onClick={() => adjustHP(-1)}
              className="rounded-lg bg-black/40 hover:bg-rose-950/80 text-rose-300 border border-white/10 px-3 py-1.5 text-xs font-bold font-mono transition cursor-pointer"
            >
              -1
            </button>

            <select
              value={selectedDamageType}
              onChange={(e) => setSelectedDamageType(e.target.value)}
              className="rounded-lg border border-white/10 bg-black/40 px-2 py-1.5 text-xs"
            >
              <option value="Sin tipo">Sin tipo</option>
              <option value="Fuego">Fuego</option>
              <option value="Frío">Frío</option>
              <option value="Relámpago">Relámpago</option>
              <option value="Veneno">Veneno</option>
            </select>
          </div>

          {/* Big HP Display */}
          <div className="flex items-baseline gap-2">
            <span className="font-cinzel text-4xl font-extrabold drop-shadow">
              {character.hitPoints.current}
            </span>
            <span className="opacity-70 font-cinzel text-xl">/ {effectiveMaxHitPoints} PG</span>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <button
                onClick={() => adjustHP(1)}
                className="rounded-lg bg-black/40 hover:bg-emerald-950/80 text-emerald-300 border border-white/10 px-3 py-1.5 text-xs font-bold font-mono transition cursor-pointer"
              >
                +1
              </button>
              <button
                onClick={() => adjustHP(5)}
                className="rounded-lg bg-black/40 hover:bg-emerald-950/80 text-emerald-300 border border-white/10 px-3 py-1.5 text-xs font-bold font-mono transition cursor-pointer"
              >
                +5
              </button>
            </div>

            <div className="border-l border-white/15 pl-4 text-center">
              <span className="text-[10px] font-mono opacity-75 block">DADOS GOLPE</span>
              <span className="font-bold text-amber-400 text-xs font-mono">
                {character.hitDice.current}d{getDieSize(character.hitDice.die)}
              </span>
            </div>
          </div>
        </ClassSubBox>

        {/* HP Bar */}
        <div className="mt-3 h-2.5 w-full rounded-full bg-zinc-800 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-300"
            style={{
              width: `${Math.min(100, Math.max(0, (character.hitPoints.current / effectiveMaxHitPoints) * 100))}%`,
            }}
          />
        </div>

        {/* Death Saves */}
        <ClassSubBox classId={character.classId} className="mt-4 p-3 flex flex-wrap items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-3">
            <span className="font-cinzel font-bold text-emerald-400">ÉXITOS DE MUERTE:</span>
            <div className="flex items-center gap-1.5">
              {[0, 1, 2].map((i) => (
                <button
                  key={i}
                  onClick={() => handleToggleDeathSave('successes', i)}
                  className={`h-4 w-4 rounded-sm border transform rotate-45 transition cursor-pointer ${
                    i < character.deathSaves.successes
                      ? 'bg-emerald-500 border-emerald-400 shadow-[0_0_8px_#10b981]'
                      : 'border-white/20 bg-black/50'
                  }`}
                />
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="font-cinzel font-bold text-rose-500">FALLOS DE MUERTE:</span>
            <div className="flex items-center gap-1.5">
              {[0, 1, 2].map((i) => (
                <button
                  key={i}
                  onClick={() => handleToggleDeathSave('failures', i)}
                  className={`h-4 w-4 rounded-sm border transform rotate-45 transition cursor-pointer ${
                    i < character.deathSaves.failures
                      ? 'bg-rose-600 border-rose-500 shadow-[0_0_8px_#f43f5e]'
                      : 'border-white/20 bg-black/50'
                  }`}
                />
              ))}
            </div>
          </div>
        </ClassSubBox>
      </ClassWidget>

      {/* 8. Habilidades & Destrezas */}
      <ClassWidget classId={character.classId} className="p-4 md:p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-cinzel text-base font-bold">
            Habilidades & Destrezas ({character.skills.length} Disciplinas)
          </h3>
          <span className="text-xs opacity-75">
            Haz clic en el indicador para alternar: Sin / Competente / Pericia / Mitad
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5">
          {character.skills.map((skill) => {
            const skillAbility = abilityForSkill(skill.name, skill.ability);
            const bonus = getSkillBonus(skill.name, skillAbility, skill.level);
            const effectiveLevel = getEffectiveSkillLevel(skill.name, skill.level);
            return (
              <ClassSubBox
                key={skill.name}
                classId={character.classId}
                className="flex items-center justify-between p-2.5 transition"
              >
                <div className="flex items-center gap-2.5">
                  <button
                    onClick={() => cycleSkillProficiency(skill.name)}
                    className={`h-4 w-4 rounded-full border flex items-center justify-center transition cursor-pointer ${
                      effectiveLevel === 'expertise'
                        ? 'border-purple-300 bg-purple-500 shadow-[0_0_8px_#a855f7]'
                        : effectiveLevel === 'proficient'
                        ? 'border-emerald-300 bg-emerald-500 shadow-[0_0_8px_#10b981]'
                        : effectiveLevel === 'half'
                        ? 'border-amber-300 bg-amber-500/60'
                        : 'border-white/20 bg-black/40'
                    }`}
                    title={`Estado: ${effectiveLevel}${effectiveLevel !== skill.level ? ' (otorgado por dote)' : ''}`}
                  />
                  <div>
                    <span className="text-xs font-semibold">{skill.name}</span>
                    <span className="text-[10px] opacity-70 ml-1.5 font-mono">({skillAbility})</span>
                  </div>
                </div>

                <button
                  onClick={() => onOpenDiceTray(d20Formula(bonus))}
                  className="font-mono font-bold text-xs hover:underline px-2 py-0.5 rounded hover:bg-black/30 cursor-pointer"
                >
                  {formatMod(bonus)}
                </button>
              </ClassSubBox>
            );
          })}
        </div>
      </ClassWidget>

      {/* 9. Espacios de Hechizo & Armas y Ataques */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Espacios de Hechizo */}
        {character.classId !== 'brujo' && (
          <SpellSlotsSection character={character} onUpdate={onUpdate} />
        )}

        {/* Armas & Ataques */}
        <ClassWidget classId={character.classId} className={`p-4 md:p-5 ${character.classId === 'brujo' ? 'lg:col-span-2' : ''}`}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-cinzel text-sm font-bold flex items-center gap-2">
              <span>⚔️</span>
              <span>Armas & Ataques</span>
            </h3>
          </div>

          <div className="space-y-2.5">
            {character.weapons.map((wep) => {
              const attackCard = character.cards.find((card) => card.id === wep.id && card.category === 'attack');
              const ability = attackCard?.ability ?? 'FUE';
              const isSpellAttack = attackCard?.attackType === 'spell';
              const attackBonus = getEffectiveAbilityMod(ability)
                + (attackCard?.proficient ? character.proficiencyBonus : 0)
                + (attackCard?.magicBonus ?? 0)
                + (attackCard?.attackBonus ?? wep.attackBonus)
                + (isSpellAttack ? 0 : getItemEffectTotal(character.cards, 'attackBonus'));
              const damageFormula = attackCard?.damage?.length
                ? attackCard.damage.map((damage) => {
                    const bonus = damage.mod
                      + (isSpellAttack ? 0 : getEffectiveAbilityMod(ability))
                      + (isSpellAttack ? 0 : getItemEffectTotal(character.cards, 'damageBonus'));
                    return `${damage.dice} ${bonus < 0 ? '-' : '+'} ${Math.abs(bonus)}`;
                  }).join(' + ')
                : wep.damage;
              return (
                <ClassSubBox
                  key={wep.id}
                  classId={character.classId}
                  className="flex items-center justify-between p-3"
                >
                  <div>
                    <div className="font-cinzel text-xs font-bold">{wep.name}</div>
                    <div className="text-[10px] opacity-75">
                      {typeof (wep as any).range === 'string'
                        ? (wep as any).range
                        : (wep as any).range?.normal != null && (wep as any).range?.long != null
                          ? `${(wep as any).range.normal}/${(wep as any).range.long}`
                          : ''} • {wep.properties}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onOpenDiceTray(`1d20 ${attackBonus < 0 ? '-' : '+'} ${Math.abs(attackBonus)}`)}
                      className="rounded bg-black/40 hover:bg-black/60 border border-white/15 px-2.5 py-1 text-xs font-bold transition cursor-pointer"
                    >
                      {formatMod(attackBonus)} Atq.
                    </button>

                    <button
                      onClick={() => onOpenDiceTray(damageFormula)}
                      className="rounded bg-black/40 hover:bg-black/60 border border-white/15 px-2.5 py-1 text-xs font-bold transition cursor-pointer"
                    >
                      Daño: {damageFormula}
                    </button>
                  </div>
                </ClassSubBox>
              );
            })}
            {character.cards.filter((card) => card.category === 'item' && card.equipped && card.item?.kind === 'weapon').map((card) => {
              const weapon = card.item!;
              const abilityModifier = getEffectiveAbilityMod(weapon.weaponAbility ?? 'FUE');
              const attackBonus = abilityModifier
                + (weapon.weaponProficient ? character.proficiencyBonus : 0)
                + getItemEffectTotal(character.cards, 'attackBonus');
              const damageModifier = abilityModifier + getItemEffectTotal(character.cards, 'damageBonus');
              return (
                <ClassSubBox key={card.id} classId={character.classId} className="flex items-center justify-between p-3">
                  <div>
                    <div className="font-cinzel text-xs font-bold">{card.name}</div>
                    <div className="text-[10px] opacity-75">
                      {weapon.weaponRange || 'Alcance no especificado'}
                      {weapon.weaponDamage ? ` • ${weapon.weaponDamage} ${weapon.weaponDamageType || ''}` : ''}
                      {card.properties?.length ? ` • ${card.properties.join(', ')}` : ''}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => onOpenDiceTray(`1d20 ${attackBonus < 0 ? '-' : '+'} ${Math.abs(attackBonus)}`)} className="rounded bg-black/40 hover:bg-black/60 border border-white/15 px-2.5 py-1 text-xs font-bold cursor-pointer">
                      {formatMod(attackBonus)} Atq.
                    </button>
                    {weapon.weaponDamage && (
                      <button onClick={() => onOpenDiceTray(`${weapon.weaponDamage} ${damageModifier < 0 ? '-' : '+'} ${Math.abs(damageModifier)}`)} className="rounded bg-black/40 hover:bg-black/60 border border-white/15 px-2.5 py-1 text-xs font-bold cursor-pointer">
                        Daño
                      </button>
                    )}
                  </div>
                </ClassSubBox>
              );
            })}
          </div>
        </ClassWidget>
      </div>
    </div>
  );
};
