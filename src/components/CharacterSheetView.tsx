import React, { useRef, useState } from 'react';
import { ClassTheme } from '../types';
import { CharacterSheet, AbilityCode, Ability, AbilityScore, Skill, WeaponItem, SpellDefinition, FeatDefinition, ConcentrationState, ConditionId, DiceRollOutcome, RollKind, InventoryItem } from '../types';
import { getAbilityModifier, getSavingThrowModifier, getSkillModifier, getSpellAttackModifier } from '../utils/characterMechanics';
import { getHitDicePool, updateHitDiceDieSize, updateHitDicePoolForLevel } from '../lib/hitDice';
import { concentrationDC } from '../lib/concentration';
import { doubleDice, parseDiceExpression } from '../lib/critical';
import { applyDamage, effectiveMaxHitPoints, effectiveSpeed } from '../lib/conditions';
import { CONDITIONS, EXHAUSTION_RULESET } from '../data/conditions';
import { getSkillProficiencyLevel, nextProficiencyLevel, proficiencyBonusForLevel } from '../lib/proficiency';
import { attunedItemCount, computeAC, currencyInGold, EMPTY_CURRENCY, inventoryWeight } from '../lib/inventory';
import { abilityScoreImprovementsBetween, applyWizardLevelUp, spellSlotsForClassLevel } from '../lib/classProgression';
import { LevelUpDialog } from './LevelUpDialog';
import { isValidUpcastDice } from '../lib/upcasting';
import { Pip, Divider } from './ThemedParts';

const ABILITY_BY_CODE: Record<AbilityCode, Ability> = {
  FUE: 'str',
  DES: 'dex',
  CON: 'con',
  INT: 'int',
  SAB: 'wis',
  CAR: 'cha',
};

const PROFICIENCY_PRESENTATION = {
  none: { label: 'Sin competencia', icon: 'radio_button_unchecked', className: 'text-gray-500' },
  half: { label: 'Media competencia', icon: 'contrast', className: 'text-cyan-300' },
  proficient: { label: 'Competente', icon: 'check_circle', className: 'text-[var(--theme-primary,#fbbf24)]' },
  expertise: { label: 'Pericia', icon: 'workspace_premium', className: 'text-purple-300' },
} as const;

interface CharacterSheetViewProps {
  character: CharacterSheet;
  theme?: ClassTheme;
  activeConditions: ConditionId[];
  concentration: ConcentrationState | null;
  onConcentrationChange: (concentration: ConcentrationState | null) => void;
  onUpdateCharacter: (updater: (prev: CharacterSheet) => CharacterSheet) => void;
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
  onBeforeUndoableAction: () => void;
  onNotify: (message: string) => void;
  onTriggerBurst?: () => void;
}

export const CharacterSheetView: React.FC<CharacterSheetViewProps> = ({
  character,
  theme,
  activeConditions,
  concentration,
  onConcentrationChange,
  onUpdateCharacter,
  onRollDice,
  onShortRest,
  onLongRest,
  onBeforeUndoableAction,
  onNotify,
  onTriggerBurst,
}) => {
  const classKey = character.classKey ?? 'mago';

  // Theme is optional; prefer class-based styling.
  // Modal / Quick addition states for Homebrew
  const [showAddWeapon, setShowAddWeapon] = useState(false);
  const [concentrationCheck, setConcentrationCheck] = useState<{
    damage: number;
    dc: number;
    total?: number;
  } | null>(null);
  const hpEditStartingValue = useRef(character.currentHp);
  const hpEditUndoCaptured = useRef(false);
  const [lastCriticalAttack, setLastCriticalAttack] = useState<string | null>(null);
  const [criticalDamage, setCriticalDamage] = useState<Record<string, boolean>>({});
  const [damageType, setDamageType] = useState('');
  const [damageModifierInput, setDamageModifierInput] = useState('');
  const [damageModifierCategory, setDamageModifierCategory] = useState<'resistances' | 'vulnerabilities' | 'immunities'>('resistances');
  const [newWeapon, setNewWeapon] = useState<Partial<WeaponItem>>({
    name: 'Espada Lunar Homebrew',
    attackBonus: 7,
    damage: '1d8 + 4',
    damageType: 'Radiante',
    reach: '5 ft',
    properties: 'Versátil (1d10), Rúnica',
  });
  const [editingWeaponId, setEditingWeaponId] = useState<string | null>(null);

  const [showAddSpell, setShowAddSpell] = useState(false);
  const [spellFilter, setSpellFilter] = useState<'all' | number>('all');
  const [newSpell, setNewSpell] = useState<Partial<SpellDefinition>>({
    name: 'Ráfaga de Vacío',
    level: 2,
    school: 'Evocación',
    castingTime: '1 Acción',
    range: '60 ft',
    components: 'V, S',
    duration: 'Instantáneo',
    concentration: false,
    attackOrDc: 'CD 15 DES',
    damageOrHeal: '3d8 Fuerza',
    description: 'Emite una onda de choque gravitatoria que repele a las criaturas.',
  });
  const [editingSpellId, setEditingSpellId] = useState<string | null>(null);

  const [showAddFeat, setShowAddFeat] = useState(false);
  const [newFeat, setNewFeat] = useState<Partial<FeatDefinition>>({
    name: 'Maestría Arcana Ancestral',
    prerequisite: 'Capacidad de lanzar conjuros de nivel 2+',
    description: 'Puedes sumar tu bonificador de competencia al daño de un conjuro una vez por turno.',
    abilityBonuses: { INT: 2 },
  });
  const [editingFeatId, setEditingFeatId] = useState<string | null>(null);

  const [inventoryDraft, setInventoryDraft] = useState<Partial<InventoryItem>>({
    name: '', quantity: 1, weight: 0, kind: 'gear',
  });
  const [editingInventoryId, setEditingInventoryId] = useState<string | null>(null);
  const [showInventoryForm, setShowInventoryForm] = useState(false);
  const [levelUpTarget, setLevelUpTarget] = useState<number | null>(null);

  const [showAddSkill, setShowAddSkill] = useState(false);
  const [newSkill, setNewSkill] = useState<Partial<Skill>>({
    name: 'Alquimia Prohibida',
    attr: 'INT',
    proficiencyLevel: 'proficient',
  });

  // Calculate modifier helper
  const calcMod = (base: number) => Math.floor((base - 10) / 2);
  const getFeatBonus = (code: AbilityCode) => (character.feats || []).reduce(
    (total, feat) => total + (feat.abilityBonuses?.[code] || 0),
    0
  );
  const getEffectiveAbility = (code: AbilityCode) => {
    const ability = character.abilities[code];
    const base = ability.base + getFeatBonus(code);
    return { ...ability, base, modifier: calcMod(base) };
  };

  const recalculateDerivedStats = (prev: CharacterSheet, feats: FeatDefinition[]): CharacterSheet => {
    const effectiveAbilities = Object.fromEntries(
      (Object.keys(prev.abilities) as AbilityCode[]).map((code) => {
        const ability = prev.abilities[code];
        const bonus = feats.reduce((total, feat) => total + (feat.abilityBonuses?.[code] || 0), 0);
        const base = ability.base + bonus;
        const modifier = calcMod(base);
        return [code, {
          ...ability,
          modifier,
          savingThrow: modifier + (ability.isProficientSave ? prev.proficiencyBonus : 0),
        }];
      })
    ) as CharacterSheet['abilities'];
    const effectiveSkills = prev.skills.map((skill) => ({
      ...skill,
      modifier: effectiveAbilities[skill.attr].modifier + proficiencyBonusForLevel(
        getSkillProficiencyLevel(skill),
        prev.proficiencyBonus,
      ),
    }));
    const keyModifier = Object.values(effectiveAbilities).find((ability) => ability.isKeyAttribute)?.modifier
      ?? effectiveAbilities.INT.modifier;
    return {
      ...prev,
      feats,
      abilities: effectiveAbilities,
      skills: effectiveSkills,
      passivePerception: 10 + effectiveAbilities.SAB.modifier + proficiencyBonusForLevel(
        getSkillProficiencyLevel(effectiveSkills.find((skill) => skill.name === 'Percepción') ?? { proficiencyLevel: 'none' }),
        prev.proficiencyBonus,
      ),
      spellSaveDc: 8 + prev.proficiencyBonus + keyModifier,
      spellAttackBonus: prev.proficiencyBonus + keyModifier,
    };
  };

  // HP Controls
  const checkConcentrationAfterDamage = (damage: number, remainingHp: number) => {
    if (!concentration) return;
    if (remainingHp === 0) {
      onConcentrationChange(null);
      setConcentrationCheck(null);
      return;
    }
    setConcentrationCheck({ damage, dc: concentrationDC(damage) });
  };

  const handleModifyHp = (delta: number, damageTypeValue = '') => {
    if (delta < 0) {
      const incomingDamage = applyDamage(
        Math.abs(delta),
        damageTypeValue,
        character.damageModifiers ?? { resistances: [], vulnerabilities: [], immunities: [] },
      );
      if (incomingDamage <= 0) return;
      const absorbed = Math.min(character.tempHp, incomingDamage);
      const remainingHp = Math.max(0, character.currentHp - (incomingDamage - absorbed));
      onBeforeUndoableAction();
      checkConcentrationAfterDamage(incomingDamage, remainingHp);
      onUpdateCharacter((prev) => {
        const tempAbsorbed = Math.min(prev.tempHp, incomingDamage);
        const remainingDamage = incomingDamage - tempAbsorbed;
        return {
          ...prev,
          tempHp: prev.tempHp - tempAbsorbed,
          currentHp: Math.max(0, prev.currentHp - remainingDamage),
        };
      });
      return;
    }
    const healing = Math.min(delta, effectiveMaxHitPoints(character.maxHp, character.exhaustionLevel ?? 0) - character.currentHp);
    if (healing <= 0) return;
    onBeforeUndoableAction();
    onUpdateCharacter((prev) => {
      return { ...prev, currentHp: Math.min(effectiveMaxHitPoints(prev.maxHp, prev.exhaustionLevel ?? 0), prev.currentHp + delta) };
    });
  };

  const addDamageModifier = () => {
    const value = damageModifierInput.trim();
    if (!value) return;
    onUpdateCharacter((prev) => {
      const modifiers = prev.damageModifiers ?? { resistances: [], vulnerabilities: [], immunities: [] };
      const current = modifiers[damageModifierCategory];
      if (current.some((entry) => entry.localeCompare(value, undefined, { sensitivity: 'accent' }) === 0)) return prev;
      return {
        ...prev,
        damageModifiers: { ...modifiers, [damageModifierCategory]: [...current, value] },
      };
    });
    setDamageModifierInput('');
  };

  const removeDamageModifier = (category: 'resistances' | 'vulnerabilities' | 'immunities', value: string) => {
    onUpdateCharacter((prev) => {
      const modifiers = prev.damageModifiers ?? { resistances: [], vulnerabilities: [], immunities: [] };
      return {
        ...prev,
        damageModifiers: {
          ...modifiers,
          [category]: modifiers[category].filter((entry) => entry !== value),
        },
      };
    });
  };

  const saveInventoryItem = (event: React.FormEvent) => {
    event.preventDefault();
    if (!inventoryDraft.name?.trim()) return;
    const itemId = editingInventoryId ?? `inv-${Date.now()}`;
    const saved: InventoryItem = {
      ...(character.inventory ?? []).find((item) => item.id === editingInventoryId),
      ...inventoryDraft,
      id: itemId,
      name: inventoryDraft.name.trim(),
      quantity: Math.max(1, Math.trunc(inventoryDraft.quantity ?? 1)),
      weight: Math.max(0, inventoryDraft.weight ?? 0),
      kind: inventoryDraft.kind ?? 'gear',
      ...(inventoryDraft.kind === 'armor' ? {
        armor: inventoryDraft.armor ?? { base: 10, dexCap: null, category: 'light' },
      } : { armor: undefined }),
      ...(inventoryDraft.kind === 'shield' ? {
        shieldBonus: Math.max(0, inventoryDraft.shieldBonus ?? 2),
      } : { shieldBonus: undefined }),
    };
    onUpdateCharacter((prev) => ({
      ...prev,
      inventory: editingInventoryId
        ? (prev.inventory ?? []).map((item) => item.id === itemId ? saved : item)
        : [...(prev.inventory ?? []), saved],
    }));
    setInventoryDraft({ name: '', quantity: 1, weight: 0, kind: 'gear' });
    setEditingInventoryId(null);
    setShowInventoryForm(false);
  };

  const beginInventoryEdit = (item: InventoryItem) => {
    setInventoryDraft({ ...item });
    setEditingInventoryId(item.id);
    setShowInventoryForm(true);
  };

  const toggleAttunement = (item: InventoryItem) => {
    if (!item.attuned && attunedItemCount(character.inventory ?? []) >= 3) {
      window.alert('Un personaje no puede sintonizar más de 3 objetos.');
      return;
    }
    onUpdateCharacter((prev) => ({
      ...prev,
      inventory: (prev.inventory ?? []).map((entry) => entry.id === item.id
        ? { ...entry, attuned: !entry.attuned }
        : entry),
    }));
  };

  // Toggle Inspiration
  const handleToggleInspiration = () => {
    const wasOn = character.hasInspiration;
    onUpdateCharacter((prev) => ({
      ...prev,
      hasInspiration: !prev.hasInspiration,
    }));

    // Visual burst when spending/activating Inspiration.
    if (!wasOn) {
      setFxOn(true);

      setTimeout(() => {
        setFxOn(false);
      }, 1200);
    }
  };

  // Ability score base change handler
  const handleAbilityScoreChange = (code: 'FUE' | 'DES' | 'CON' | 'INT' | 'SAB' | 'CAR', newBase: number) => {
    onUpdateCharacter((prev) => {
      const mod = calcMod(newBase + getFeatBonus(code));
      const ab = prev.abilities[code];
      const newSavingThrow = ab.isProficientSave ? mod + prev.proficiencyBonus : mod;

      const updatedAbilities = {
        ...prev.abilities,
        [code]: {
          ...ab,
          base: newBase,
          modifier: mod,
          savingThrow: newSavingThrow,
        },
      };

      // Recalculate related skills
      const updatedSkills = prev.skills.map((sk) => {
        if (sk.attr === code) {
          const profMod = proficiencyBonusForLevel(getSkillProficiencyLevel(sk), prev.proficiencyBonus);
          return { ...sk, modifier: mod + profMod };
        }
        return sk;
      });

      // Recalculate passive perception if SAB
      const passivePerc = code === 'SAB' 
        ? 10 + mod + proficiencyBonusForLevel(
          getSkillProficiencyLevel(prev.skills.find((s) => s.name === 'Percepción') ?? { proficiencyLevel: 'none' }),
          prev.proficiencyBonus,
        )
        : prev.passivePerception;

      // Recalculate initiative if DES
      const initiative = code === 'DES' ? mod : prev.initiative;
      const spellcastingModifier = Object.values(updatedAbilities)
        .find((ability) => ability.isKeyAttribute)?.modifier ?? updatedAbilities.INT.modifier;

      return {
        ...prev,
        abilities: updatedAbilities,
        skills: updatedSkills,
        passivePerception: passivePerc,
        initiative,
        spellSaveDc: 8 + prev.proficiencyBonus + spellcastingModifier,
        spellAttackBonus: prev.proficiencyBonus + spellcastingModifier,
      };
    });
  };

  // Toggle Saving Throw Proficiency
  const handleToggleSaveProficiency = (code: 'FUE' | 'DES' | 'CON' | 'INT' | 'SAB' | 'CAR') => {
    onUpdateCharacter((prev) => {
      const ab = prev.abilities[code];
      const nextProf = !ab.isProficientSave;
      const nextSave = nextProf ? ab.modifier + prev.proficiencyBonus : ab.modifier;

      return {
        ...prev,
        abilities: {
          ...prev.abilities,
          [code]: {
            ...ab,
            isProficientSave: nextProf,
            savingThrow: nextSave,
          },
        },
      };
    });
  };

  // Toggle Skill Proficiency
  const handleToggleSkillProficiency = (skillName: string) => {
    onUpdateCharacter((prev) => {
      const updatedSkills = prev.skills.map((sk) => {
        if (sk.name === skillName) {
          const nextLevel = nextProficiencyLevel(getSkillProficiencyLevel(sk));
          const attrMod = prev.abilities[sk.attr].modifier;
          const nextMod = attrMod + proficiencyBonusForLevel(nextLevel, prev.proficiencyBonus);
          return {
            ...sk,
            proficiencyLevel: nextLevel,
            isProficient: undefined,
            isExpert: undefined,
            modifier: nextMod,
          };
        }
        return sk;
      });

      // If perception changed, update passive perception
      let passivePerc = prev.passivePerception;
      if (skillName === 'Percepción') {
        const percSkill = updatedSkills.find((s) => s.name === 'Percepción');
        const sabMod = prev.abilities.SAB.modifier;
        passivePerc = 10 + sabMod + proficiencyBonusForLevel(
          getSkillProficiencyLevel(percSkill ?? { proficiencyLevel: 'none' }),
          prev.proficiencyBonus,
        );
      }

      return {
        ...prev,
        skills: updatedSkills,
        passivePerception: passivePerc,
      };
    });
  };

  // Death saves
  const handleToggleDeathSave = (type: 'successes' | 'failures', index: number) => {
    onUpdateCharacter((prev) => {
      const currentVal = prev.deathSaves[type];
      const newVal = index < currentVal ? index : index + 1;
      return {
        ...prev,
        deathSaves: {
          ...prev.deathSaves,
          [type]: newVal,
        },
      };
    });
  };

  // Spell slot toggle
  const handleToggleSpellSlot = (tierIndex: number, slotIndex: number) => {
    onUpdateCharacter((prev) => {
      const newSlots = [...prev.spellSlots];
      const target = { ...newSlots[tierIndex] };
      if (slotIndex < target.current) {
        target.current = Math.max(0, target.current - 1);
      } else {
        target.current = Math.min(target.max, target.current + 1);
      }
      newSlots[tierIndex] = target;
      return { ...prev, spellSlots: newSlots };
    });
  };

  const effectiveMaxHp = effectiveMaxHitPoints(character.maxHp, character.exhaustionLevel ?? 0);
  const hpPct = Math.round((character.currentHp / (effectiveMaxHp || 1)) * 100);
  const displayedSpeed = effectiveSpeed(character.speedFeet, character.exhaustionLevel ?? 0, activeConditions);
  const invalidUpcastDraft = !!newSpell.upcast?.dicePerLevel.trim()
    && !isValidUpcastDice(newSpell.upcast.dicePerLevel);

  const handleWizardLevelUp = (method: 'roll' | 'average') => {
    if (levelUpTarget === null) return;
    const oldLevel = character.level;
    const targetLevel = levelUpTarget;
    const hitDie = getHitDicePool(character).dieSize;
    const hitPointGains = Array.from({ length: targetLevel - oldLevel }, () => {
      const rolled = method === 'roll'
        ? onRollDice('PG al subir de nivel (Mago)', 0, `1d${hitDie}`, hitDie, 1).natural
        : Math.floor(hitDie / 2) + 1;
      return Math.max(1, rolled + character.abilities.CON.modifier);
    });
    const asiLevels = abilityScoreImprovementsBetween(oldLevel, targetLevel);
    onBeforeUndoableAction();
    onUpdateCharacter((previous) => applyWizardLevelUp(previous, targetLevel, hitPointGains));
    onNotify(`Nivel ${targetLevel} alcanzado.${asiLevels.length ? ` Recuerda la mejora de característica de nivel ${asiLevels.join(', ')}.` : ''}`);
    setLevelUpTarget(null);
  };

  return (
    <div
      className={`character-sheet flex flex-col w-full pb-16`}
      onMouseEnter={() => setFxOn(true)}
      onMouseLeave={() => setFxOn(false)}
      style={
        themeResolved
          ? ({
              ['--class-theme-primary' as any]: themeResolved.colors.primary,
              ['--class-theme-primary-container' as any]: themeResolved.colors.primaryContainer,
              ['--class-theme-secondary' as any]: themeResolved.colors.secondary,
              ['--class-theme-secondary-container' as any]: themeResolved.colors.secondaryContainer,
              ['--class-theme-accent' as any]: themeResolved.colors.accent,
            } as React.CSSProperties)
          : undefined
      }
    >
      {/* ========================================================== */}
      {/* 1. ENCABEZADO: NOMBRE, CLASE, NIVEL Y ESPECIE (EDITABLES) */}
      {/* ========================================================== */}
      <div className="relative bg-[#1c1a24] rounded-xl p-5 lg:p-6 mb-6 shadow-xl border border-white/5 overflow-hidden">
        <div         className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-gradient-to-br from-[var(--class-theme-primary,rgba(251,191,36,0.1))] to-[var(--class-theme-secondary-container,rgba(87,27,193,0.15))] blur-3xl pointer-events-none"></div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-center relative z-10">
          {/* Avatar e Inspiración */}
          <div className="lg:col-span-4 xl:col-span-4 flex items-center gap-4">
            <div className="relative group shrink-0">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full p-1 bg-gradient-to-tr from-[var(--theme-primary,#fbbf24)] via-[var(--theme-secondary-container,#571bc1)] to-[var(--theme-primary,#fbbf24)] shadow-xl">
                <img
                  src={character.portraitUrl || 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=600&q=80'}
                  alt={character.name}
                  className="w-full h-full object-cover rounded-full"
                />
              </div>
              <button
                onClick={handleToggleInspiration}
                className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-[#2b2932] border border-white/10 flex items-center justify-center shadow-lg transition-transform hover:scale-110 active:scale-95 cursor-pointer"
                title="Alternar Inspiración Heroica"
              >
                <div
                  className={`w-5 h-5 rounded-full flex items-center justify-center transition-all ${
                    character.hasInspiration
                      ? 'bg-[var(--theme-secondary,#d0bcff)] gem-pulse shadow-[0_0_10px_rgba(208,188,255,0.7)]'
                      : 'bg-[#1c1a24] opacity-40'
                  }`}
                >
                  <span className="material-symbols-outlined text-black text-xs font-bold">
                    {character.hasInspiration ? 'auto_awesome' : 'close'}
                  </span>
                </div>
                {character.hasInspiration && (
                  <span className="inspiracion-badge">INSPIRACIÓN ON</span>
                )}
              </button>
              <button
                onClick={() => {
                  const nextPortrait = window.prompt('URL del avatar', character.portraitUrl);
                  if (nextPortrait !== null) {
                    onUpdateCharacter((prev) => ({ ...prev, portraitUrl: nextPortrait.trim() }));
                  }
                }}
                className="absolute top-1 left-1 w-7 h-7 rounded-full bg-[#2b2932]/90 border border-white/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                title="Cambiar avatar"
                aria-label="Cambiar avatar"
              >
                <span className="material-symbols-outlined text-xs text-white">edit</span>
              </button>
            </div>

            <div className="flex flex-col min-w-0 flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-runic text-[10px] text-[var(--theme-primary,#fbbf24)] tracking-widest uppercase font-bold">
                  HÉROE
                </span>
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded font-bold uppercase ${
                    character.hasInspiration
                      ? 'bg-[var(--theme-secondary-container,#571bc1)] text-[var(--theme-on-secondary-container,#e9ddff)]'
                      : 'bg-white/5 text-gray-500'
                  }`}
                >
                  {character.hasInspiration ? 'Inspiración ON' : 'Sin Inspiración'}
                </span>
              </div>
              <input
                type="text"
                value={character.name}
                onChange={(e) =>
                  onUpdateCharacter((prev) => ({ ...prev, name: e.target.value }))
                }
                className="bg-transparent font-garamond text-2xl lg:text-3xl text-white font-bold focus:outline-none focus:bg-white/10 rounded px-1 -ml-1 transition-colors w-full border-b border-transparent focus:border-[var(--theme-primary,#fbbf24)]"
                placeholder="Nombre del personaje..."
                title="Nombre (editable)"
              />
              <input
                type="text"
                value={character.epithet}
                onChange={(e) =>
                  onUpdateCharacter((prev) => ({ ...prev, epithet: e.target.value }))
                }
                className="bg-transparent text-xs text-gray-400 focus:outline-none focus:bg-white/10 rounded px-1 -ml-1 mt-0.5"
                placeholder="Título o Epíteto..."
              />
            </div>
          </div>

          {/* Campos Clave Editables: Clase, Subclase, Nivel, Especie, Trasfondo, Alineamiento */}
          <div className="lg:col-span-8 xl:col-span-8 grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {/* Clase & Subclase */}
            <div className="bg-[#211e28]/80 p-2.5 rounded-lg border border-white/5 flex flex-col">
              <span className="font-runic text-[10px] text-gray-400 uppercase font-bold">
                Clase & Subclase
              </span>
              <input
                type="text"
                value={character.characterClass}
                onChange={(e) =>
                  onUpdateCharacter((prev) => ({ ...prev, characterClass: e.target.value }))
                }
                className="bg-transparent text-xs text-[var(--theme-primary,#fbbf24)] font-bold focus:outline-none focus:bg-white/10 rounded mt-0.5"
                placeholder="Clase..."
              />
              <input
                type="text"
                value={character.subclass}
                onChange={(e) =>
                  onUpdateCharacter((prev) => ({ ...prev, subclass: e.target.value }))
                }
                className="bg-transparent text-[11px] text-gray-300 focus:outline-none focus:bg-white/10 rounded mt-0.5"
                placeholder="Subclase..."
              />
            </div>

            {/* Nivel */}
            <div className="bg-[#211e28]/80 p-2.5 rounded-lg border border-white/5 flex flex-col">
              <span className="font-runic text-[10px] text-gray-400 uppercase font-bold">
                Nivel
              </span>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="text-xs text-gray-400 font-bold">Nv.</span>
                <input
                  type="number"
                  min="1"
                  max="20"
                  value={character.level}
                  onChange={(e) => {
                    const newLvl = Math.max(1, Math.min(20, parseInt(e.target.value, 10) || 1));
                    if (character.classKey === 'mago' && newLvl > character.level) {
                      setLevelUpTarget(newLvl);
                      return;
                    }
                    const newProf = Math.ceil(1 + newLvl / 4);
                    onUpdateCharacter((prev) => {
                      const spellcastingModifier = Object.values(prev.abilities)
                        .find((ability) => ability.isKeyAttribute)?.modifier ?? prev.abilities.INT.modifier;
                      const hitDicePool = updateHitDicePoolForLevel(getHitDicePool(prev), newLvl);
                      const nextSlots = prev.classKey === 'mago'
                        ? spellSlotsForClassLevel('mago', newLvl, prev.spellSlots)
                        : prev.spellSlots;
                      return {
                        ...prev,
                        level: newLvl,
                        hitDice: `${newLvl}d${hitDicePool.dieSize}`,
                        hitDicePool,
                        spellSlots: nextSlots,
                        proficiencyBonus: newProf,
                        abilities: Object.fromEntries(
                          Object.entries(prev.abilities).map(([code, ability]) => [code, {
                            ...ability,
                            savingThrow: ability.modifier + (ability.isProficientSave ? newProf : 0),
                          }])
                        ) as CharacterSheet['abilities'],
                        skills: prev.skills.map((skill) => ({
                          ...skill,
                          modifier: prev.abilities[skill.attr].modifier + proficiencyBonusForLevel(
                            getSkillProficiencyLevel(skill),
                            newProf,
                          ),
                        })),
                        passivePerception: 10 + prev.abilities.SAB.modifier + proficiencyBonusForLevel(
                          getSkillProficiencyLevel(prev.skills.find((skill) => skill.name === 'Percepción') ?? { proficiencyLevel: 'none' }),
                          newProf,
                        ),
                        spellSaveDc: 8 + newProf + spellcastingModifier,
                        spellAttackBonus: newProf + spellcastingModifier,
                      };
                    });
                  }}
                  className="bg-transparent font-garamond text-xl text-[var(--theme-primary,#fbbf24)] font-bold focus:outline-none focus:bg-white/10 rounded w-12"
                />
                {character.classKey === 'mago' && character.level < 20 && (
                  <button
                    type="button"
                    onClick={() => setLevelUpTarget(character.level + 1)}
                    className="rounded bg-[var(--theme-secondary-container,#571bc1)] px-2 py-1 text-[10px] font-bold text-white"
                    title="Abrir asistente de subida de nivel"
                  >
                    + Nv.
                  </button>
                )}
              </div>
              <span className="text-[10px] text-gray-400">
                Bono Comp: +{character.proficiencyBonus}
              </span>
            </div>

            {/* Especie / Raza */}
            <div className="bg-[#211e28]/80 p-2.5 rounded-lg border border-white/5 flex flex-col">
              <span className="font-runic text-[10px] text-gray-400 uppercase font-bold">
                Especie / Raza
              </span>
              <input
                type="text"
                value={character.race}
                onChange={(e) =>
                  onUpdateCharacter((prev) => ({ ...prev, race: e.target.value }))
                }
                className="bg-transparent text-xs text-gray-200 font-semibold focus:outline-none focus:bg-white/10 rounded mt-0.5"
                placeholder="Especie / Raza..."
              />
              <span className="text-[10px] text-gray-400 mt-0.5">
                Velocidad: {displayedSpeed} ft
              </span>
            </div>

            {/* Trasfondo & Alineamiento */}
            <div className="bg-[#211e28]/80 p-2.5 rounded-lg border border-white/5 flex flex-col">
              <span className="font-runic text-[10px] text-gray-400 uppercase font-bold">
                Trasfondo / Alineación
              </span>
              <input
                type="text"
                value={character.background}
                onChange={(e) =>
                  onUpdateCharacter((prev) => ({ ...prev, background: e.target.value }))
                }
                className="bg-transparent text-xs text-gray-200 focus:outline-none focus:bg-white/10 rounded mt-0.5 truncate"
                placeholder="Trasfondo..."
              />
              <input
                type="text"
                value={character.alignment}
                onChange={(e) =>
                  onUpdateCharacter((prev) => ({ ...prev, alignment: e.target.value }))
                }
                className="bg-transparent text-[11px] text-gray-400 focus:outline-none focus:bg-white/10 rounded mt-0.5 truncate"
                placeholder="Alineamiento..."
              />
            </div>
          </div>
        </div>
      </div>

      <section className="mb-6 grid grid-cols-1 gap-3 lg:grid-cols-2" aria-label="Estados y defensas">
        <div className="rounded-xl border border-red-400/20 bg-[#1c1a24] p-4">
          <h2 className="mb-2 font-garamond text-base font-bold text-white">Condiciones activas</h2>
          <div className="flex flex-wrap gap-1.5">
            {activeConditions.length ? activeConditions.map((conditionId) => {
              const condition = CONDITIONS[conditionId];
              return (
                <span
                  key={conditionId}
                  title={condition.description}
                  className="rounded-full border border-red-400/40 bg-red-500/15 px-2.5 py-1 text-[10px] text-red-200"
                >
                  {condition.name}
                </span>
              );
            }) : <span className="text-xs text-gray-500">Sin condiciones activas.</span>}
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <label htmlFor="exhaustion-level" className="text-xs text-gray-300">Agotamiento (5e {EXHAUSTION_RULESET.edition})</label>
            <select
              id="exhaustion-level"
              value={character.exhaustionLevel ?? 0}
              onChange={(event) => {
                const level = Number(event.target.value);
                if (level >= 6 && concentration) {
                  onConcentrationChange(null);
                  setConcentrationCheck(null);
                }
                onUpdateCharacter((prev) => ({
                  ...prev,
                  exhaustionLevel: level,
                  currentHp: Math.min(
                    prev.currentHp,
                    effectiveMaxHitPoints(prev.maxHp, level),
                  ),
                }));
              }}
              className="rounded border border-white/10 bg-[#211e28] px-2 py-1 text-xs text-white"
            >
              {[0, 1, 2, 3, 4, 5, 6].map((level) => <option key={level} value={level}>{level}</option>)}
            </select>
            <span className="text-[10px] text-gray-500">Velocidad efectiva: {displayedSpeed} ft</span>
          </div>
          {character.exhaustionLevel ? (
            <p className="mt-1 text-[10px] text-gray-500">{EXHAUSTION_RULESET.effects[character.exhaustionLevel - 1]}</p>
          ) : null}
        </div>

        <div className="rounded-xl border border-white/10 bg-[#1c1a24] p-4">
          <h2 className="mb-2 font-garamond text-base font-bold text-white">Resistencias, vulnerabilidades e inmunidades</h2>
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={damageModifierCategory}
              onChange={(event) => setDamageModifierCategory(event.target.value as typeof damageModifierCategory)}
              aria-label="Categoría de modificador de daño"
              className="rounded border border-white/10 bg-[#211e28] px-2 py-1 text-xs text-white"
            >
              <option value="resistances">Resistencia</option>
              <option value="vulnerabilities">Vulnerabilidad</option>
              <option value="immunities">Inmunidad</option>
            </select>
            <input
              value={damageModifierInput}
              onChange={(event) => setDamageModifierInput(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  event.preventDefault();
                  addDamageModifier();
                }
              }}
              placeholder="Tipo de daño…"
              aria-label="Tipo de daño a añadir"
              className="min-w-0 flex-1 rounded border border-white/10 bg-[#211e28] px-2 py-1 text-xs text-white"
            />
            <button type="button" onClick={addDamageModifier} className="rounded bg-[#2b2932] px-2 py-1 text-xs text-gray-200">Añadir</button>
          </div>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {([
              ['resistances', 'Resistencia'],
              ['vulnerabilities', 'Vulnerabilidad'],
              ['immunities', 'Inmunidad'],
            ] as const).flatMap(([category, label]) => (
              (character.damageModifiers?.[category] ?? []).map((value) => (
                <button
                  key={`${category}:${value}`}
                  type="button"
                  onClick={() => removeDamageModifier(category, value)}
                  title={`Quitar ${label.toLowerCase()} a ${value}`}
                  className="rounded-full border border-white/10 bg-[#211e28] px-2 py-0.5 text-[10px] text-gray-300 hover:text-red-300"
                >
                  {label}: {value} ×
                </button>
              ))
            ))}
          </div>
        </div>
      </section>

      <section className="mb-6 rounded-xl border border-white/10 bg-[#1c1a24] p-4" aria-label="Inventario">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-garamond text-xl font-bold text-white">Inventario</h2>
          <button
            type="button"
            onClick={() => {
              setInventoryDraft({ name: '', quantity: 1, weight: 0, kind: 'gear' });
              setEditingInventoryId(null);
              setShowInventoryForm(true);
            }}
            className="rounded bg-[#2b2932] px-3 py-1.5 text-xs text-[var(--theme-primary,#fbbf24)]"
          >
            Añadir objeto
          </button>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-5">
          {(['cp', 'sp', 'ep', 'gp', 'pp'] as const).map((coin) => (
            <label key={coin} className="text-[10px] uppercase text-gray-400">
              {coin}
              <input
                type="number"
                min="0"
                value={(character.currency ?? EMPTY_CURRENCY)[coin]}
                onChange={(event) => onUpdateCharacter((prev) => ({
                  ...prev,
                  currency: {
                    ...EMPTY_CURRENCY,
                    ...prev.currency,
                    [coin]: Math.max(0, Number(event.target.value) || 0),
                  },
                }))}
                className="mt-1 w-full rounded border border-white/10 bg-[#211e28] px-2 py-1 text-xs text-white"
              />
            </label>
          ))}
        </div>
        <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-[11px] text-gray-400">
          <span>Total: {currencyInGold(character.currency ?? EMPTY_CURRENCY).toFixed(2)} po</span>
          <span>Peso: {inventoryWeight(character.inventory ?? [])} / {character.abilities.FUE.base * 15} lb</span>
          {inventoryWeight(character.inventory ?? []) > character.abilities.FUE.base * 15 && (
            <span role="alert" className="text-amber-300">Excede la capacidad de carga.</span>
          )}
          <span>Sintonizados: {attunedItemCount(character.inventory ?? [])}/3</span>
        </div>
        {showInventoryForm && (
          <form onSubmit={saveInventoryItem} className="mt-3 grid grid-cols-2 gap-2 rounded-lg border border-white/10 bg-[#211e28] p-3 md:grid-cols-4">
            <input
              required
              value={inventoryDraft.name ?? ''}
              onChange={(event) => setInventoryDraft((prev) => ({ ...prev, name: event.target.value }))}
              placeholder="Nombre"
              className="rounded border border-white/10 bg-[#14121b] px-2 py-1 text-xs text-white"
            />
            <input
              value={inventoryDraft.description ?? ''}
              onChange={(event) => setInventoryDraft((prev) => ({ ...prev, description: event.target.value }))}
              placeholder="Descripción (opcional)"
              className="rounded border border-white/10 bg-[#14121b] px-2 py-1 text-xs text-white md:col-span-2"
            />
            <select
              value={inventoryDraft.kind ?? 'gear'}
              onChange={(event) => setInventoryDraft((prev) => ({
                ...prev,
                kind: event.target.value as InventoryItem['kind'],
                armor: event.target.value === 'armor' ? prev.armor ?? { base: 10, dexCap: null, category: 'light' } : undefined,
                shieldBonus: event.target.value === 'shield' ? prev.shieldBonus ?? 2 : undefined,
              }))}
              className="rounded border border-white/10 bg-[#14121b] px-2 py-1 text-xs text-white"
            >
              <option value="gear">Equipo</option>
              <option value="weapon">Arma</option>
              <option value="armor">Armadura</option>
              <option value="shield">Escudo</option>
              <option value="consumable">Consumible</option>
              <option value="magic">Mágico</option>
            </select>
            <input
              type="number"
              min="1"
              value={inventoryDraft.quantity ?? 1}
              onChange={(event) => setInventoryDraft((prev) => ({ ...prev, quantity: Number(event.target.value) || 1 }))}
              aria-label="Cantidad"
              placeholder="Cantidad"
              className="rounded border border-white/10 bg-[#14121b] px-2 py-1 text-xs text-white"
            />
            <input
              type="number"
              min="0"
              step="0.1"
              value={inventoryDraft.weight ?? 0}
              onChange={(event) => setInventoryDraft((prev) => ({ ...prev, weight: Number(event.target.value) || 0 }))}
              aria-label="Peso unitario en libras"
              placeholder="Peso (lb)"
              className="rounded border border-white/10 bg-[#14121b] px-2 py-1 text-xs text-white"
            />
            {inventoryDraft.kind === 'armor' && (
              <>
                <input
                  type="number"
                  min="1"
                  value={inventoryDraft.armor?.base ?? 10}
                  onChange={(event) => setInventoryDraft((prev) => ({ ...prev, armor: { ...(prev.armor ?? { dexCap: null, category: 'light' }), base: Number(event.target.value) || 10 } }))}
                  aria-label="CA base de armadura"
                  placeholder="CA base"
                  className="rounded border border-white/10 bg-[#14121b] px-2 py-1 text-xs text-white"
                />
                <select
                  value={inventoryDraft.armor?.dexCap === 0 ? 'none' : inventoryDraft.armor?.dexCap === null ? 'unlimited' : String(inventoryDraft.armor?.dexCap ?? 2)}
                  onChange={(event) => setInventoryDraft((prev) => ({
                    ...prev,
                    armor: { ...(prev.armor ?? { base: 10, category: 'light' }), dexCap: event.target.value === 'none' ? 0 : event.target.value === 'unlimited' ? null : Number(event.target.value) },
                  }))}
                  aria-label="Límite de modificador de Destreza"
                  className="rounded border border-white/10 bg-[#14121b] px-2 py-1 text-xs text-white"
                >
                  <option value="none">Sin DES</option>
                  <option value="2">DES máximo +2</option>
                  <option value="unlimited">DES sin límite</option>
                </select>
                <select
                  value={inventoryDraft.armor?.category ?? 'light'}
                  onChange={(event) => {
                    const category = event.target.value as NonNullable<InventoryItem['armor']>['category'];
                    setInventoryDraft((prev) => ({
                      ...prev,
                      armor: {
                        ...(prev.armor ?? { base: 10, dexCap: null }),
                        category,
                        dexCap: category === 'heavy' ? 0 : category === 'medium' ? 2 : null,
                      },
                    }));
                  }}
                  aria-label="Categoría de armadura"
                  className="rounded border border-white/10 bg-[#14121b] px-2 py-1 text-xs text-white"
                >
                  <option value="light">Ligera</option>
                  <option value="medium">Media</option>
                  <option value="heavy">Pesada</option>
                </select>
              </>
            )}
            {inventoryDraft.kind === 'shield' && (
              <input
                type="number"
                min="0"
                value={inventoryDraft.shieldBonus ?? 2}
                onChange={(event) => setInventoryDraft((prev) => ({ ...prev, shieldBonus: Number(event.target.value) || 0 }))}
                aria-label="Bonificador de escudo"
                placeholder="Bonificador CA"
                className="rounded border border-white/10 bg-[#14121b] px-2 py-1 text-xs text-white"
              />
            )}
            <div className="col-span-full flex justify-end gap-2">
              <button type="button" onClick={() => { setShowInventoryForm(false); setEditingInventoryId(null); }} className="rounded bg-white/10 px-3 py-1 text-xs text-gray-300">Cancelar</button>
              <button type="submit" className="rounded bg-[var(--theme-primary,#fbbf24)] px-3 py-1 text-xs font-bold text-black">{editingInventoryId ? 'Guardar cambios' : 'Guardar objeto'}</button>
            </div>
          </form>
        )}
        <div className="mt-3 space-y-1">
          {(character.inventory ?? []).map((item) => (
            <div key={item.id} className="flex flex-wrap items-center justify-between gap-2 rounded bg-[#211e28] px-2.5 py-2 text-xs">
              <span className="min-w-0 flex-1 text-gray-200">{item.name} ×{item.quantity}{item.weight ? ` • ${item.weight} lb c/u` : ''}</span>
              <div className="flex items-center gap-2">
                <label className="flex items-center gap-1 text-[10px] text-gray-400">
                  <input type="checkbox" checked={!!item.equipped} onChange={() => onUpdateCharacter((prev) => ({
                    ...prev,
                    inventory: (prev.inventory ?? []).map((entry) => entry.id === item.id ? { ...entry, equipped: !entry.equipped } : entry),
                  }))} />
                  Equipado
                </label>
                <label className="flex items-center gap-1 text-[10px] text-gray-400">
                  <input type="checkbox" checked={!!item.attuned} onChange={() => toggleAttunement(item)} />
                  Sintonizado
                </label>
                <button type="button" onClick={() => beginInventoryEdit(item)} title={`Editar ${item.name}`} className="text-gray-400 hover:text-white">Editar</button>
                <button type="button" onClick={() => {
                  onBeforeUndoableAction();
                  onUpdateCharacter((prev) => ({ ...prev, inventory: (prev.inventory ?? []).filter((entry) => entry.id !== item.id) }));
                }} title={`Eliminar ${item.name}`} className="text-red-300 hover:text-red-200">Borrar</button>
              </div>
            </div>
          ))}
          {!character.inventory?.length && <p className="text-xs text-gray-500">Inventario vacío.</p>}
        </div>
      </section>

      {/* ========================================================== */}
      {/* 2. SEIS TARJETAS DE CARACTERÍSTICAS (FUE, DES, CON, INT, SAB, CAR) */}
      {/* Cada una con puntuación grande y modificador               */}
      {/* ========================================================== */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3 px-1">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[var(--theme-primary,#fbbf24)] text-lg">
              token
            </span>
            <h2 className="font-garamond text-xl text-white font-bold tracking-wide">
              Características & Modificadores
            </h2>
          </div>
          <span className="text-xs text-gray-400">
            Haz clic en <span className="text-[var(--theme-primary,#fbbf24)]">Tirar</span> para lanzar d20 + mod
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3">
          {(['FUE', 'DES', 'CON', 'INT', 'SAB', 'CAR'] as Array<keyof typeof character.abilities>).map((code) => {
            const ab = getEffectiveAbility(code);
            const abilityModifier = getAbilityModifier(character, code);
            const savingThrowModifier = getSavingThrowModifier(character, code);
            const isKey = ab.isKeyAttribute;
            return (
              <div
                key={code}
                className={`p-4 rounded-xl shadow-lg flex flex-col items-center text-center relative group transition-all duration-200 hover:-translate-y-0.5 border ${
                  isKey
                    ? 'bg-gradient-to-b from-[#2b2932] to-[#1c1a24] border-[var(--theme-primary,#fbbf24)]/50 shadow-[0_0_16px_rgba(251,191,36,0.15)]'
                    : 'bg-[#1c1a24] border-white/5 hover:border-white/15'
                }`}
              >
                {isKey && (
                  <div className="absolute -top-2.5 px-2 py-0.5 rounded bg-[var(--theme-primary,#fbbf24)] text-[#261a00] font-runic text-[9px] tracking-widest uppercase font-bold shadow">
                    CLAVE
                  </div>
                )}

                {/* Header of ability card */}
                <div className="flex items-center justify-between w-full mb-1">
                  <span
                    className={`font-runic text-xs font-bold ${
                      isKey ? 'text-[var(--theme-primary,#fbbf24)]' : 'text-gray-300'
                    }`}
                  >
                    {ab.name.toUpperCase()} ({code})
                  </span>
                  <button
                    onClick={() => onRollDice(`${ab.name} (Prueba)`, abilityModifier, `Puntuación: ${ab.base}`, 20, 1, 'normal', undefined, false, 'check', ABILITY_BY_CODE[code])}
                    className="text-gray-400 hover:text-[var(--theme-primary,#fbbf24)] transition-colors p-0.5"
                    title={`Tirar d20 de ${ab.name}`}
                  >
                    <span className="material-symbols-outlined text-sm">casino</span>
                  </button>
                </div>

                {/* MODIFICADOR (GRANDE Y DESTACADO) */}
                <div
                  onClick={() => onRollDice(`${ab.name} (Prueba)`, abilityModifier, `Base: ${ab.base}`, 20, 1, 'normal', undefined, false, 'check', ABILITY_BY_CODE[code])}
                  className={`my-1.5 w-16 h-16 rounded-full bg-[#2b2932] flex flex-col items-center justify-center jewel-socket border border-white/10 cursor-pointer transition-transform hover:scale-105 ${
                    isKey ? 'shadow-[0_0_12px_rgba(251,191,36,0.25)]' : ''
                  }`}
                  title="Haz clic para tirar prueba de característica"
                >
                  <span
                    className={`font-garamond text-3xl font-bold leading-none ${
                      isKey ? 'text-[var(--theme-primary,#fbbf24)]' : 'text-white'
                    }`}
                  >
                    {abilityModifier >= 0 ? `+${abilityModifier}` : abilityModifier}
                  </span>
                  <span className="text-[9px] text-gray-400 uppercase font-semibold mt-0.5">
                    Mod
                  </span>
                </div>

                {/* PUNTUACIÓN GRANDE EDITABLE */}
                <div className="flex items-center gap-1.5 bg-[#211e28] px-2.5 py-1 rounded-full mt-1 border border-white/5">
                  <span className="text-[10px] text-gray-400 uppercase font-bold">Puntuación</span>
                  <input
                    type="number"
                    min="1"
                    max="30"
                    value={ab.base}
                    onChange={(e) => {
                      const effectiveScore = parseInt(e.target.value, 10) || 10;
                      handleAbilityScoreChange(code, effectiveScore - getFeatBonus(code));
                    }}
                    className="w-8 text-center bg-transparent text-sm text-white font-bold focus:outline-none focus:bg-white/10 rounded"
                    title="Puntuación efectiva (editable)"
                  />
                </div>

                {/* Salvación & Competencia */}
                <div className="mt-2 pt-2 border-t border-white/5 w-full flex items-center justify-between text-xs">
                  <button
                    onClick={() => handleToggleSaveProficiency(code)}
                    className="flex items-center gap-1 text-gray-400 hover:text-white"
                    title={ab.isProficientSave ? 'Competente (clic para quitar)' : 'Sin competencia (clic para añadir)'}
                  >
                    <span
                      className={`w-3.5 h-3.5 rotate-45 rounded-xs flex items-center justify-center transition-all ${
                        ab.isProficientSave
                          ? 'bg-[var(--theme-primary,#fbbf24)] shadow-[0_0_6px_rgba(251,191,36,0.6)]'
                          : 'bg-[#2b2932] border border-white/10'
                      }`}
                    />
                    <span className="text-[10px] font-semibold">Salvación</span>
                  </button>
                  <button
                    onClick={() =>
                      onRollDice(
                        `Salvación de ${ab.name}`,
                        savingThrowModifier,
                        ab.isProficientSave ? `Competente (+${character.proficiencyBonus})` : 'Normal',
                        20, 1, 'normal', undefined, false, 'save', ABILITY_BY_CODE[code]
                      )
                    }
                    className="font-mono text-xs font-bold text-gray-200 hover:text-[var(--theme-primary,#fbbf24)]"
                  >
                    {savingThrowModifier >= 0 ? `+${savingThrowModifier}` : savingThrowModifier}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ========================================================== */}
      {/* 3. DEBAJO: CA, INICIATIVA, VELOCIDAD, PG Y COMPETENCIA     */}
      {/* ========================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-6">
        {/* Estadísticas de Combate Primarias (CA, Ini, Vel, Bono) */}
        <div className="lg:col-span-4 xl:col-span-4 flex flex-col gap-3">
          <div className="grid grid-cols-2 gap-3">
            {/* Clase de Armadura (CA) */}
            <div className="bg-[#1c1a24] p-4 rounded-xl border border-white/5 flex flex-col items-center justify-center text-center shadow-lg relative group">
              <span className="font-runic text-xs text-gray-300 font-bold uppercase tracking-wider flex items-center gap-1">
                <span className="material-symbols-outlined text-[var(--theme-primary,#fbbf24)] text-sm">
                  shield
                </span>
                Armadura (CA)
              </span>
              <div className="flex items-center gap-1 my-1">
                <input
                  type="number"
                  value={computeAC(character)}
                  disabled={character.manualArmorClass !== true}
                  onChange={(e) => {
                    const newAc = parseInt(e.target.value, 10) || 10;
                    onUpdateCharacter((prev) => ({ ...prev, armorClass: newAc, manualArmorClass: true }));
                  }}
                  className="w-16 rounded bg-transparent text-center font-garamond text-3xl font-bold text-white focus:bg-white/10 focus:outline-none disabled:text-gray-400"
                  title={character.manualArmorClass === true ? 'Clase de Armadura manual' : 'CA calculada automáticamente'}
                />
              </div>
              <label className="mb-1 flex items-center gap-1.5 text-[10px] text-gray-400">
                <input
                  type="checkbox"
                  checked={character.manualArmorClass === true}
                  onChange={(event) => onUpdateCharacter((prev) => ({
                    ...prev,
                    armorClass: event.target.checked ? computeAC(prev) : prev.armorClass,
                    manualArmorClass: event.target.checked,
                  }))}
                />
                CA manual
              </label>
              <input
                type="text"
                value={character.acType}
                onChange={(e) =>
                  onUpdateCharacter((prev) => ({ ...prev, acType: e.target.value }))
                }
                className="bg-transparent text-[10px] text-gray-400 text-center focus:outline-none focus:bg-white/10 rounded w-full"
                placeholder="Tipo (ej. Mágica, Placas)..."
              />
            </div>

            {/* Iniciativa */}
            <div className="bg-[#1c1a24] p-4 rounded-xl border border-white/5 flex flex-col items-center justify-center text-center shadow-lg group">
              <div className="flex items-center justify-between w-full">
                <span className="font-runic text-xs text-gray-300 font-bold uppercase tracking-wider flex items-center gap-1">
                  <span className="material-symbols-outlined text-[var(--theme-secondary,#d0bcff)] text-sm">
                    speed
                  </span>
                  Iniciativa
                </span>
                <button
                  onClick={() => onRollDice('Iniciativa de Combate', character.initiative)}
                  className="text-gray-400 hover:text-white"
                  title="Tirar Iniciativa"
                >
                  <span className="material-symbols-outlined text-sm">casino</span>
                </button>
              </div>
              <div className="flex items-center gap-1 my-1">
                <input
                  type="number"
                  value={character.initiative}
                  onChange={(e) => {
                    const newIni = parseInt(e.target.value, 10) || 0;
                    onUpdateCharacter((prev) => ({ ...prev, initiative: newIni }));
                  }}
                  className="bg-transparent font-garamond text-3xl font-bold text-[var(--theme-secondary,#d0bcff)] text-center w-16 focus:outline-none focus:bg-white/10 rounded"
                  title="Iniciativa (editable)"
                />
              </div>
              <span className="text-[10px] text-gray-400">Mod. Destreza</span>
            </div>

            {/* Velocidad */}
            <div className="bg-[#1c1a24] p-4 rounded-xl border border-white/5 flex flex-col items-center justify-center text-center shadow-lg">
              <span className="font-runic text-xs text-gray-300 font-bold uppercase tracking-wider flex items-center gap-1">
                <span className="material-symbols-outlined text-emerald-400 text-sm">
                  directions_run
                </span>
                Velocidad
              </span>
              <div className="flex items-center gap-1 my-1">
                <input
                  type="number"
                  step="5"
                  value={character.speedFeet}
                  onChange={(e) => {
                    const newSpeed = parseInt(e.target.value, 10) || 30;
                    onUpdateCharacter((prev) => ({ ...prev, speedFeet: newSpeed }));
                  }}
                  className="bg-transparent font-garamond text-3xl font-bold text-white text-center w-16 focus:outline-none focus:bg-white/10 rounded"
                  title="Velocidad en pies (editable)"
                />
                <span className="text-xs text-gray-400 font-bold">pies</span>
              </div>
              <span className="text-[10px] text-gray-400">{Math.round(character.speedFeet / 5)} casillas</span>
            </div>

            {/* Bono de Competencia */}
            <div className="bg-[#1c1a24] p-4 rounded-xl border border-white/5 flex flex-col items-center justify-center text-center shadow-lg">
              <span className="font-runic text-xs text-gray-300 font-bold uppercase tracking-wider flex items-center gap-1">
                <span className="material-symbols-outlined text-[var(--theme-primary,#fbbf24)] text-sm">
                  verified
                </span>
                Competencia
              </span>
              <div className="flex items-center gap-1 my-1">
                <span className="font-garamond text-3xl font-bold text-[var(--theme-primary,#fbbf24)]">
                  +{character.proficiencyBonus}
                </span>
              </div>
              <span className="text-[10px] text-gray-400">Escala con nivel</span>
            </div>
          </div>

          {/* Estadísticas Mágicas Pasivas */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-[#1c1a24] p-3 rounded-lg border border-white/5 flex items-center justify-between">
              <span className="text-xs text-gray-300 font-medium">Percepción Pasiva</span>
              <span className="font-mono text-base font-bold text-white">
                {character.passivePerception}
              </span>
            </div>
            <div className="bg-[#1c1a24] p-3 rounded-lg border border-white/5 flex items-center justify-between">
              <span className="text-xs text-gray-300 font-medium">CD Salv. Conjuro</span>
              <span className="font-mono text-base font-bold text-[var(--theme-secondary,#d0bcff)]">
                {character.spellSaveDc}
              </span>
            </div>
            <div className="bg-[#1c1a24] p-3 rounded-lg border border-white/5 flex items-center justify-between">
              <span className="text-xs text-gray-300 font-medium">Ataque de Conjuro</span>
              <button
                onClick={() => onRollDice('Ataque de Conjuro', getSpellAttackModifier(character), 'Bono de ataque mágico', 20, 1, 'normal', undefined, false, 'attack')}
                className="font-mono text-base font-bold text-[var(--theme-primary,#fbbf24)] hover:brightness-125"
                title="Tirar ataque de conjuro"
              >
                {getSpellAttackModifier(character) >= 0 ? `+${getSpellAttackModifier(character)}` : getSpellAttackModifier(character)}
              </button>
            </div>
          </div>
        </div>

        {/* PG Actuales / Máximos con botones + y -, Dados de Golpe y Salvaciones de Muerte */}
        <div className="lg:col-span-8 xl:col-span-8 bg-[#1c1a24] p-5 rounded-xl border border-white/5 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-red-400 text-xl">
                  favorite
                </span>
                <span className="font-garamond text-lg text-white font-bold">
                  Puntos de Golpe (PG)
                </span>
              </div>

              {/* Botones de Descanso */}
              <div className="flex items-center gap-2">
                <button
                  onClick={onShortRest}
                  className="px-2.5 py-1 rounded bg-[#211e28] hover:bg-[#2b2932] text-xs text-gray-300 border border-white/5 flex items-center gap-1 transition-colors"
                >
                  <span className="material-symbols-outlined text-xs">bedtime</span>
                  <span>D. Corto</span>
                </button>
                <button
                  onClick={onLongRest}
                  className="px-2.5 py-1 rounded bg-[#211e28] hover:bg-[#2b2932] text-xs text-gray-300 border border-white/5 flex items-center gap-1 transition-colors"
                >
                  <span className="material-symbols-outlined text-xs">hotel</span>
                  <span>D. Largo</span>
                </button>
              </div>
            </div>

            {/* Display de PG actual y máximo con botones rápidos */}
            <div className="flex flex-wrap items-center justify-between gap-4 bg-[#211e28]/70 p-4 rounded-xl border border-white/5 mb-4">
              <div className="flex items-center gap-3">
                {/* Botones -5 y -1 */}
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleModifyHp(-5, damageType)}
                    className="w-8 h-8 rounded-lg bg-[#2b2932] hover:bg-red-500/20 text-red-400 hover:text-red-300 font-bold text-xs border border-white/5 flex items-center justify-center transition-colors"
                    title="Restar 5 PG"
                  >
                    -5
                  </button>
                  <button
                    onClick={() => handleModifyHp(-1, damageType)}
                    className="w-8 h-8 rounded-lg bg-[#2b2932] hover:bg-red-500/20 text-red-400 hover:text-red-300 font-bold text-sm border border-white/5 flex items-center justify-center transition-colors"
                    title="Restar 1 PG"
                  >
                    -1
                  </button>
                </div>
                <label className="flex items-center gap-1 text-[10px] text-gray-400">
                  Tipo:
                  <select
                    value={damageType}
                    onChange={(event) => setDamageType(event.target.value)}
                    aria-label="Tipo de daño aplicado"
                    className="max-w-28 rounded border border-white/10 bg-[#2b2932] px-1 py-1 text-[10px] text-gray-200"
                  >
                    <option value="">Sin tipo</option>
                    {['Ácido', 'Contundente', 'Frío', 'Fuego', 'Fuerza', 'Necrótico', 'Perforante', 'Psíquico', 'Radiante', 'Relámpago', 'Veneno', 'Trueno', 'Cortante'].map((type) => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </label>

                {/* PG Actual editable */}
                <div className="flex items-baseline gap-1">
                  <input
                    type="number"
                    min="0"
                    max={effectiveMaxHp}
                    disabled={(character.exhaustionLevel ?? 0) >= 6}
                    value={character.currentHp}
                    onChange={(e) => {
                      const val = parseInt(e.target.value, 10) || 0;
                      const nextHp = Math.min(effectiveMaxHp, Math.max(0, val));
                      if (nextHp !== character.currentHp && !hpEditUndoCaptured.current) {
                        onBeforeUndoableAction();
                        hpEditUndoCaptured.current = true;
                      }
                      if (nextHp === 0 && concentration) {
                        onConcentrationChange(null);
                        setConcentrationCheck(null);
                      }
                      onUpdateCharacter((prev) => ({
                        ...prev,
                        currentHp: Math.min(effectiveMaxHitPoints(prev.maxHp, prev.exhaustionLevel ?? 0), Math.max(0, val)),
                      }));
                    }}
                    onFocus={() => { hpEditStartingValue.current = character.currentHp; hpEditUndoCaptured.current = false; }}
                    onBlur={() => {
                      const damage = hpEditStartingValue.current - character.currentHp;
                      if (damage > 0) checkConcentrationAfterDamage(damage, character.currentHp);
                      hpEditUndoCaptured.current = false;
                    }}
                    className="w-16 bg-transparent font-garamond text-4xl font-bold text-white text-center focus:outline-none focus:bg-white/10 rounded"
                    title={`Puntos de Golpe Actuales (máximo efectivo: ${effectiveMaxHp})`}
                  />
                  <span className="text-xl text-gray-500">/</span>
                  <input
                    type="number"
                    min="1"
                    disabled={(character.exhaustionLevel ?? 0) >= 6}
                    value={effectiveMaxHp}
                    onChange={(e) => {
                      const val = parseInt(e.target.value, 10) || 1;
                      const effectiveMax = Math.max(1, val);
                      if (effectiveMax < character.currentHp) onBeforeUndoableAction();
                      onUpdateCharacter((prev) => ({
                        ...prev,
                        maxHp: effectiveMax * ((prev.exhaustionLevel ?? 0) >= 4 ? 2 : 1),
                        currentHp: Math.min(prev.currentHp, effectiveMax),
                      }));
                    }}
                    className="w-14 bg-transparent font-garamond text-2xl font-bold text-gray-400 text-center focus:outline-none focus:bg-white/10 rounded"
                    title="Puntos de Golpe Máximos (editable)"
                  />
                  <span className="text-xs text-gray-400 uppercase font-bold ml-1">PG</span>
                </div>

                {/* Botones +1 y +5 */}
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleModifyHp(1)}
                    className="w-8 h-8 rounded-lg bg-[#2b2932] hover:bg-emerald-500/20 text-emerald-400 hover:text-emerald-300 font-bold text-sm border border-white/5 flex items-center justify-center transition-colors"
                    title="Sumar 1 PG"
                  >
                    +1
                  </button>
                  <button
                    onClick={() => handleModifyHp(5)}
                    className="w-8 h-8 rounded-lg bg-[#2b2932] hover:bg-emerald-500/20 text-emerald-400 hover:text-emerald-300 font-bold text-xs border border-white/5 flex items-center justify-center transition-colors"
                    title="Sumar 5 PG"
                  >
                    +5
                  </button>
                </div>
              </div>

              {concentrationCheck && concentration && (
                <div role="status" className="basis-full mb-4 rounded-lg border border-[var(--theme-secondary,#d0bcff)]/30 bg-[#211e28] p-3 text-xs">
                  <p className="text-gray-200">
                    Daño recibido: {concentrationCheck.damage} PG. Salvación de Constitución CD {concentrationCheck.dc}.
                  </p>
                  {concentrationCheck.total === undefined ? (
                    <button
                      type="button"
                      onClick={() => {
                        const conSave = character.abilities.CON.savingThrow;
                        const roll = onRollDice(
                          'Salvación de Constitución (Concentración)',
                          conSave,
                          `CD ${concentrationCheck.dc}`,
                          20, 1, 'normal', undefined, false, 'save', 'con'
                        );
                        setConcentrationCheck((previous) => previous
                          ? { ...previous, total: roll.total }
                          : previous);
                      }}
                      className="mt-2 rounded bg-[var(--theme-secondary-container,#571bc1)] px-2.5 py-1.5 text-white font-semibold"
                    >
                      Tirar salvación de CON
                    </button>
                  ) : concentrationCheck.total < concentrationCheck.dc ? (
                    <div className="mt-2 flex items-center gap-2">
                      <span className="text-red-300">
                        Fallida ({concentrationCheck.total}): decide si terminas {concentration.spellName}.
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          onConcentrationChange(null);
                          setConcentrationCheck(null);
                        }}
                        className="rounded bg-red-500/20 px-2.5 py-1.5 text-red-200 hover:bg-red-500/30"
                      >
                        Perder concentración
                      </button>
                    </div>
                  ) : (
                    <p className="mt-2 text-emerald-300">
                      Salvación superada ({concentrationCheck.total}); mantienes {concentration.spellName}.
                    </p>
                  )}
                </div>
              )}

              {/* PG Temporales y Dados de Golpe */}
              <div className="flex items-center gap-4">
                <div className="flex flex-col items-center bg-[#1c1a24] px-3 py-1.5 rounded-lg border border-white/5">
                  <span className="text-[10px] text-gray-400 uppercase font-bold">PG Temp</span>
                  <input
                    type="number"
                    min="0"
                    value={character.tempHp}
                    onChange={(e) => {
                      const val = parseInt(e.target.value, 10) || 0;
                      onUpdateCharacter((prev) => ({ ...prev, tempHp: val }));
                    }}
                    className="w-10 bg-transparent text-center text-sm font-bold text-sky-400 focus:outline-none"
                  />
                </div>

                <div className="flex flex-col items-center bg-[#1c1a24] px-3 py-1.5 rounded-lg border border-white/5">
                  <span className="text-[10px] text-gray-400 uppercase font-bold">Dados Golpe</span>
                  <input
                    type="text"
                    value={character.hitDice}
                    onChange={(e) => onUpdateCharacter((prev) => ({
                      ...prev,
                      hitDice: e.target.value,
                      hitDicePool: updateHitDiceDieSize(e.target.value, prev),
                    }))}
                    className="w-14 bg-transparent text-center text-sm font-bold text-amber-400 focus:outline-none"
                  />
                  <span className="text-[10px] text-gray-400">
                    {getHitDicePool(character).remaining}/{getHitDicePool(character).total}
                  </span>
                </div>
              </div>
            </div>

            {/* Barra de Vida Visual */}
            <div className="w-full bg-[#211e28] rounded-full h-3.5 p-0.5 border border-white/5 overflow-hidden mb-4">
              <div
                className={`h-full rounded-full transition-all duration-300 ${
                  hpPct > 50
                    ? 'bg-gradient-to-r from-emerald-500 to-emerald-400'
                    : hpPct > 20
                    ? 'bg-gradient-to-r from-amber-500 to-amber-400'
                    : 'bg-gradient-to-r from-red-600 to-red-500 animate-pulse'
                }`}
                style={{ width: `${Math.max(0, Math.min(100, hpPct))}%` }}
              />
            </div>
          </div>

          {/* Salvaciones de Muerte Interactivas */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-white/5">
            {/* Éxitos */}
            <div className="flex items-center justify-between bg-[#211e28] px-3 py-2 rounded-lg">
              <span className="font-runic text-xs text-[var(--theme-secondary,#d0bcff)] font-bold uppercase tracking-wider flex items-center gap-1">
                <span className="material-symbols-outlined text-xs">verified</span>
                Éxitos de Muerte
              </span>
              <div className="flex items-center gap-2">
                {[0, 1, 2].map((idx) => {
                  const isMarked = idx < character.deathSaves.successes;
                  return (
                    <button
                      key={`succ-${idx}`}
                      onClick={() => handleToggleDeathSave('successes', idx)}
                      className="w-5 h-5 rotate-45 rounded-xs bg-[#2b2932] border border-white/10 flex items-center justify-center transition-all hover:scale-110"
                      title="Marcar éxito de muerte"
                    >
                      <span
                        className={`w-2.5 h-2.5 rounded-full bg-[var(--theme-secondary,#d0bcff)] ${
                          isMarked ? 'opacity-100 shadow-[0_0_8px_rgba(208,188,255,0.8)]' : 'opacity-0'
                        }`}
                      />
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Fallos */}
            <div className="flex items-center justify-between bg-[#211e28] px-3 py-2 rounded-lg">
              <span className="font-runic text-xs text-red-400 font-bold uppercase tracking-wider flex items-center gap-1">
                <span className="material-symbols-outlined text-xs">heart_broken</span>
                Fallos de Muerte
              </span>
              <div className="flex items-center gap-2">
                {[0, 1, 2].map((idx) => {
                  const isMarked = idx < character.deathSaves.failures;
                  return (
                    <button
                      key={`fail-${idx}`}
                      onClick={() => handleToggleDeathSave('failures', idx)}
                      className="w-5 h-5 rotate-45 rounded-xs bg-[#2b2932] border border-white/10 flex items-center justify-center transition-all hover:scale-110"
                      title="Marcar fallo de muerte"
                    >
                      <span
                        className={`w-2.5 h-2.5 rounded-full bg-red-400 ${
                          isMarked ? 'opacity-100 shadow-[0_0_8px_rgba(248,113,113,0.8)]' : 'opacity-0'
                        }`}
                      />
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================== */}
      {/* 4. LISTA DE HABILIDADES CON CASILLAS DE COMPETENCIA       */}
      {/* ========================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-6">
        {/* Columna Izquierda: Habilidades y Destrezas */}
        <div className="lg:col-span-7 bg-[#1c1a24] p-5 rounded-xl border border-white/5 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[var(--theme-secondary,#d0bcff)] text-xl">
                psychology
              </span>
              <h3 className="font-garamond text-lg text-white font-bold">
                Habilidades & Destrezas
              </h3>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowAddSkill(true)}
                className="flex items-center gap-1 px-2.5 py-1 rounded bg-[#211e28] hover:bg-[#2b2932] text-xs text-[var(--theme-primary,#fbbf24)] border border-white/5 font-semibold transition-colors"
                title="Añadir habilidad personalizada o homebrew"
              >
                <span className="material-symbols-outlined text-xs">add</span>
                <span>+ Homebrew</span>
              </button>
              <span className="font-runic text-[10px] text-gray-400 font-bold uppercase">
                {character.skills.length} DISCIPLINAS
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1.5">
            {character.skills.map((s) => {
              const proficiencyLevel = getSkillProficiencyLevel(s);
              const proficiencyPresentation = PROFICIENCY_PRESENTATION[proficiencyLevel];
              return (
              <div
                key={s.name}
                className={`flex items-center justify-between py-1.5 px-2.5 rounded-lg border transition-all ${
                  proficiencyLevel !== 'none'
                    ? 'bg-[#211e28] border-[var(--theme-primary,#fbbf24)]/30'
                    : 'bg-[#211e28]/40 border-transparent hover:bg-[#211e28]/70'
                }`}
              >
                {/* Casilla de competencia marcable */}
                <div className="flex items-center gap-2.5 flex-1 min-w-0">
                  <button
                    onClick={() => handleToggleSkillProficiency(s.name)}
                    className={`shrink-0 p-0.5 ${proficiencyPresentation.className}`}
                    title={`${proficiencyPresentation.label} · clic para cambiar`}
                    aria-label={`${s.name}: ${proficiencyPresentation.label}. Cambiar nivel de competencia`}
                  >
                    <span className="material-symbols-outlined text-base leading-none">
                      {proficiencyPresentation.icon}
                    </span>
                  </button>
                  <button
                    onClick={() =>
                      onRollDice(
                        `Prueba de ${s.name} (${s.attr})`,
                        getSkillModifier(character, s.name),
                        `${proficiencyPresentation.label} (+${proficiencyBonusForLevel(proficiencyLevel, character.proficiencyBonus)})`,
                        20, 1, 'normal', undefined, false, 'check', ABILITY_BY_CODE[s.attr]
                      )
                    }
                    className={`text-xs text-left truncate hover:text-[var(--theme-primary,#fbbf24)] transition-colors ${
                      proficiencyLevel !== 'none' ? 'text-white font-bold' : 'text-gray-300'
                    }`}
                  >
                    {s.name}
                    {s.isHomebrew && (
                      <span className="ml-1 text-[9px] text-[var(--theme-secondary,#d0bcff)] font-mono">
                        [HB]
                      </span>
                    )}
                  </button>
                  <span className="text-[10px] text-gray-500 font-mono shrink-0">
                    ({s.attr})
                  </span>
                </div>

                {/* Modificador con tirador */}
                <button
                  onClick={() =>
                    onRollDice(
                      `Prueba de ${s.name} (${s.attr})`,
                      getSkillModifier(character, s.name),
                      `${proficiencyPresentation.label} (+${proficiencyBonusForLevel(proficiencyLevel, character.proficiencyBonus)})`,
                      20, 1, 'normal', undefined, false, 'check', ABILITY_BY_CODE[s.attr]
                    )
                  }
                  className="text-xs font-mono font-bold text-[var(--theme-primary,#fbbf24)] hover:brightness-125 px-1.5 py-0.5 rounded hover:bg-white/5"
                  title="Tirar dado"
                >
                  {getSkillModifier(character, s.name) >= 0 ? `+${getSkillModifier(character, s.name)}` : getSkillModifier(character, s.name)}
                </button>
              </div>
            );})}
          </div>

          {/* Modal / Inline Add Homebrew Skill */}
          {showAddSkill && (
            <div className="mt-3 p-3 rounded-lg bg-[#211e28] border border-[var(--theme-primary,#fbbf24)]/30 flex flex-wrap items-center gap-2">
              <input
                type="text"
                value={newSkill.name || ''}
                onChange={(e) => setNewSkill((prev) => ({ ...prev, name: e.target.value }))}
                placeholder="Nombre de Habilidad Homebrew..."
                className="bg-[#1c1a24] text-xs text-white px-2 py-1 rounded border border-white/10 flex-1"
              />
              <select
                value={newSkill.attr || 'INT'}
                onChange={(e) => setNewSkill((prev) => ({ ...prev, attr: e.target.value as AbilityCode }))}
                className="bg-[#1c1a24] text-xs text-gray-200 px-2 py-1 rounded border border-white/10"
              >
                {['FUE', 'DES', 'CON', 'INT', 'SAB', 'CAR'].map((a) => (
                  <option key={a} value={a}>{a}</option>
                ))}
              </select>
              <button
                onClick={() => {
                  if (newSkill.name) {
                    const attribute = newSkill.attr ?? 'INT';
                    const proficiencyLevel = newSkill.proficiencyLevel ?? 'proficient';
                    const attrMod = character.abilities[attribute].modifier;
                    const finalMod = attrMod + proficiencyBonusForLevel(proficiencyLevel, character.proficiencyBonus);
                    onUpdateCharacter((prev) => ({
                      ...prev,
                      skills: [
                        ...prev.skills,
                        {
                          name: newSkill.name!,
                          attr: attribute,
                          proficiencyLevel,
                          modifier: finalMod,
                          isHomebrew: true,
                        },
                      ],
                    }));
                    setShowAddSkill(false);
                    setNewSkill({ name: '', attr: 'INT', proficiencyLevel: 'proficient' });
                  }
                }}
                className="px-3 py-1 bg-[var(--theme-primary,#fbbf24)] text-[#261a00] font-bold text-xs rounded"
              >
                Guardar
              </button>
              <button
                onClick={() => setShowAddSkill(false)}
                className="px-2 py-1 bg-white/10 text-gray-300 text-xs rounded"
              >
                Cancelar
              </button>
            </div>
          )}
        </div>

        {/* Columna Derecha: Ranuras de Conjuro y Ataques de Armas */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          {/* Ranuras de Conjuro Interactivas */}
          <div className="themed-panel bg-[#1c1a24] p-5 rounded-xl border border-white/5 shadow-xl">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[var(--theme-secondary,#d0bcff)] text-xl">
                  auto_awesome
                </span>
                <h3 className="font-garamond text-lg text-white font-bold">
                  Espacios de Conjuro
                </h3>
              </div>
              <span className="text-xs text-gray-400">
                {character.preparedSpellsCount} Preparados
              </span>
            </div>
            <Divider />
            <div className="flex flex-col gap-3 mt-3">
              {character.spellSlots.map((tier, tierIdx) => (
                <div
                  key={`tier-${tier.tier}`}
                  className="flex items-center justify-between bg-[#211e28] p-3 rounded-lg border border-white/5"
                >
                  <div className="flex items-center gap-2">
                    <span className="font-runic text-xs text-gray-300 font-bold uppercase">
                      Nivel {tier.tier}
                    </span>
                    <span className="text-[10px] text-gray-500">
                      ({tier.current}/{tier.max})
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {Array.from({ length: tier.max }).map((_, slotIdx) => {
                      const isAvailable = slotIdx < tier.current;
                      return (
                        <Pip
                          key={`tier-${tier.tier}-slot-${slotIdx}`}
                          used={!isAvailable}
                          onClick={() => {
                            if (isAvailable && onTriggerBurst) onTriggerBurst();
                            handleToggleSpellSlot(tierIdx, slotIdx);
                          }}
                        />
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {(character.classResources ?? []).length > 0 && (
            <section className="themed-panel rounded-xl border border-[var(--theme-primary,#fbbf24)]/20 bg-[#1c1a24] p-4" aria-label="Recursos de clase">
              <h3 className="mb-3 font-garamond text-lg font-bold text-white">Recursos de Clase</h3>
              <Divider />
              <div className="space-y-2 mt-3">
                {character.classResources?.map((resource) => (
                  <div key={resource.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-[#211e28] px-3 py-2">
                    <div>
                      <p className="text-xs font-semibold text-white">{resource.name}</p>
                      <p className="text-[10px] text-gray-500">{resource.description} · Recarga: {resource.recharge.toLowerCase()}</p>
                    </div>
                    <div className="flex items-center gap-1.5" aria-label={`${resource.usesRemaining} de ${resource.usesMax} usos`}>
                      {Array.from({ length: resource.usesMax }).map((_, idx) => {
                        const isAvailable = idx < resource.usesRemaining;
                        return (
                          <Pip
                            key={`res-${resource.id}-${idx}`}
                            used={!isAvailable}
                            onClick={() => {
                              onBeforeUndoableAction();
                              if (isAvailable && onTriggerBurst) onTriggerBurst();
                              onUpdateCharacter((prev) => ({
                                ...prev,
                                classResources: prev.classResources?.map((item) => item.id === resource.id
                                  ? { ...item, usesRemaining: isAvailable ? item.usesRemaining - 1 : item.usesRemaining + 1 }
                                  : item),
                              }));
                            }}
                          />
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Ataques y Armas (Homebrew Ready) */}
          <div className="bg-[#1c1a24] p-5 rounded-xl border border-white/5 shadow-xl">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[var(--theme-primary,#fbbf24)] text-xl">
                  swords
                </span>
                <h3 className="font-garamond text-lg text-white font-bold">
                  Armas & Ataques
                </h3>
              </div>
              <button
                onClick={() => {
                  setEditingWeaponId(null);
                  setNewWeapon({ name: '', attackBonus: 5, damage: '1d8', damageType: 'Cortante', reach: '5 ft', properties: '' });
                  setShowAddWeapon(true);
                }}
                className="flex items-center gap-1 px-2.5 py-1 rounded bg-[#211e28] hover:bg-[#2b2932] text-xs text-[var(--theme-primary,#fbbf24)] border border-white/5 font-semibold transition-colors"
                title="Añadir arma o ataque homebrew"
              >
                <span className="material-symbols-outlined text-xs">add</span>
                <span>+ Arma Homebrew</span>
              </button>
            </div>

            {/* Formulario Añadir Arma Homebrew */}
            {showAddWeapon && (
              <div className="mb-3 p-3 rounded-lg bg-[#211e28] border border-[var(--theme-primary,#fbbf24)]/30 flex flex-col gap-2">
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={newWeapon.name || ''}
                    onChange={(e) => setNewWeapon((prev) => ({ ...prev, name: e.target.value }))}
                    placeholder="Nombre del arma..."
                    className="bg-[#1c1a24] text-xs text-white px-2 py-1 rounded border border-white/10"
                  />
                  <input
                    type="number"
                    value={newWeapon.attackBonus || 0}
                    onChange={(e) => setNewWeapon((prev) => ({ ...prev, attackBonus: parseInt(e.target.value, 10) || 0 }))}
                    placeholder="Bono ataque (+7)..."
                    className="bg-[#1c1a24] text-xs text-white px-2 py-1 rounded border border-white/10"
                  />
                  <input
                    type="text"
                    value={newWeapon.damage || ''}
                    onChange={(e) => setNewWeapon((prev) => ({ ...prev, damage: e.target.value }))}
                    placeholder="Daño (ej. 1d8+4)..."
                    className="bg-[#1c1a24] text-xs text-white px-2 py-1 rounded border border-white/10"
                  />
                  <input
                    type="text"
                    value={newWeapon.damageType || ''}
                    onChange={(e) => setNewWeapon((prev) => ({ ...prev, damageType: e.target.value }))}
                    placeholder="Tipo daño (Cortante)..."
                    className="bg-[#1c1a24] text-xs text-white px-2 py-1 rounded border border-white/10"
                  />
                </div>
                <div className="flex justify-end gap-2 mt-1">
                  <button
                    onClick={() => {
                      if (newWeapon.name) {
                        const item: WeaponItem = {
                          id: editingWeaponId ?? `wpn-${Date.now()}`,
                          name: newWeapon.name,
                          attackBonus: newWeapon.attackBonus || 5,
                          damage: newWeapon.damage || '1d8',
                          damageType: newWeapon.damageType || 'Cortante',
                          reach: newWeapon.reach || '5 ft',
                          properties: newWeapon.properties || 'Versátil',
                          isEquipped: true,
                          isHomebrew: editingWeaponId
                            ? character.weapons?.find((weapon) => weapon.id === editingWeaponId)?.isHomebrew
                            : true,
                        };
                        onUpdateCharacter((prev) => ({
                          ...prev,
                          weapons: editingWeaponId
                            ? (prev.weapons || []).map((weapon) => weapon.id === editingWeaponId ? item : weapon)
                            : [...(prev.weapons || []), item],
                        }));
                        setEditingWeaponId(null);
                        setShowAddWeapon(false);
                      }
                    }}
                    className="px-3 py-1 bg-[var(--theme-primary,#fbbf24)] text-[#261a00] font-bold text-xs rounded"
                  >
                    {editingWeaponId ? 'Guardar cambios' : 'Guardar Arma'}
                  </button>
                  <button
                    onClick={() => { setShowAddWeapon(false); setEditingWeaponId(null); }}
                    className="px-2 py-1 bg-white/10 text-gray-300 text-xs rounded"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            )}

            <div className="flex flex-col gap-2">
              {(character.weapons && character.weapons.length > 0 ? character.weapons : [
                {
                  id: 'wpn-1',
                  name: 'Espada Larga Rúnica',
                  attackBonus: character.abilities.FUE.modifier + character.proficiencyBonus,
                  damage: `1d8 + ${character.abilities.FUE.modifier}`,
                  damageType: 'Cortante',
                  reach: '5 ft',
                  properties: 'Versátil (1d10)',
                },
                {
                  id: 'wpn-2',
                  name: 'Ballesta Ligera',
                  attackBonus: character.abilities.DES.modifier + character.proficiencyBonus,
                  damage: `1d8 + ${character.abilities.DES.modifier}`,
                  damageType: 'Perforante',
                  reach: '80/320 ft',
                  properties: 'A distancia, Recarga',
                },
              ]).map((wpn) => (
                <div
                  key={wpn.id}
                  className="bg-[#211e28] p-3 rounded-lg border border-white/5 flex items-center justify-between"
                >
                  <div className="flex flex-col">
                    <span className="font-semibold text-xs text-white flex items-center gap-1.5">
                      {wpn.name}
                      {wpn.isHomebrew && (
                        <span className="text-[9px] text-[var(--theme-secondary,#d0bcff)] font-mono">
                          [Homebrew]
                        </span>
                      )}
                    </span>
                    <span className="text-[11px] text-gray-400">
                      {wpn.reach} • {wpn.properties}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        const outcome = onRollDice(
                          `Ataque con ${wpn.name}`,
                          wpn.attackBonus,
                          `Daño: ${wpn.damage} (${wpn.damageType})`,
                          20, 1, 'normal', undefined, false, 'attack'
                        );
                        setLastCriticalAttack(outcome.natural === 20 ? `weapon:${wpn.id}` : null);
                      }}
                      className="px-2 py-1 rounded bg-[#2b2932] hover:bg-[var(--theme-primary,#fbbf24)] text-gray-200 hover:text-[#261a00] font-mono text-xs font-bold transition-colors"
                      title="Tirar ataque con d20"
                    >
                      {wpn.attackBonus >= 0 ? `+${wpn.attackBonus}` : wpn.attackBonus} Atk
                    </button>
                    <button
                      onClick={() => {
                        const attackId = `weapon:${wpn.id}`;
                        const isCritical = criticalDamage[attackId] ?? lastCriticalAttack === attackId;
                        const formula = isCritical ? doubleDice(wpn.damage) : wpn.damage;
                        if (!parseDiceExpression(formula)) return;
                        onRollDice(
                          `Daño de ${wpn.name}`,
                          0,
                          wpn.damageType,
                          20,
                          1,
                          'normal',
                          formula,
                          isCritical,
                        );
                      }}
                      className="px-2 py-1 rounded bg-[#2b2932] hover:bg-emerald-500/30 text-emerald-300 font-mono text-xs font-bold"
                      title="Tirar daño"
                    >
                      {criticalDamage[`weapon:${wpn.id}`] || lastCriticalAttack === `weapon:${wpn.id}` ? '¡CRÍTICO! Daño' : 'Daño'}
                    </button>
                    <label className="flex items-center gap-1 text-[10px] text-amber-300">
                      <input
                        type="checkbox"
                        checked={criticalDamage[`weapon:${wpn.id}`] ?? lastCriticalAttack === `weapon:${wpn.id}`}
                        onChange={(event) => setCriticalDamage((previous) => ({
                          ...previous,
                          [`weapon:${wpn.id}`]: event.target.checked,
                        }))}
                      />
                      Crítico
                    </label>
                    {character.weapons?.some((item) => item.id === wpn.id) && (
                      <>
                        <button
                          onClick={() => {
                            setEditingWeaponId(wpn.id);
                            setNewWeapon({ ...wpn });
                            setShowAddWeapon(true);
                          }}
                          className="p-1 text-gray-400 hover:text-white"
                          title={`Editar ${wpn.name}`}
                          aria-label={`Editar ${wpn.name}`}
                        >
                          <span className="material-symbols-outlined text-sm">edit</span>
                        </button>
                        <button
                          onClick={() => {
                            onBeforeUndoableAction();
                            onUpdateCharacter((prev) => ({ ...prev, weapons: (prev.weapons || []).filter((item) => item.id !== wpn.id) }));
                          }}
                          className="p-1 text-gray-500 hover:text-red-400"
                          title="Eliminar arma"
                          aria-label={`Eliminar ${wpn.name}`}
                        >
                          <span className="material-symbols-outlined text-sm">delete</span>
                        </button>
                      </>
                    )}
                    <span className="text-xs font-mono font-semibold text-emerald-400">
                      {wpn.damage}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================== */}
      {/* 5. RASGOS, DOTES (FEATS), MAGIAS Y NOTAS HOMEBREW         */}
      {/* ========================================================== */}
      <div className="bg-[#1c1a24] p-5 rounded-xl border border-white/5 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[var(--theme-primary,#fbbf24)] text-xl">
              military_tech
            </span>
            <h3 className="font-garamond text-lg text-white font-bold">
              Rasgos de Clase, Dotes (Feats) & Magias Homebrew
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => { setEditingFeatId(null); setNewFeat({ name: '', prerequisite: '', description: '', abilityBonuses: { INT: 0 } }); setShowAddFeat(true); }}
              className="flex items-center gap-1 px-2.5 py-1 rounded bg-[#211e28] hover:bg-[#2b2932] text-xs text-[var(--theme-primary,#fbbf24)] border border-white/5 font-semibold transition-colors"
            >
              <span className="material-symbols-outlined text-xs">add</span>
              <span>+ Dote / Feat</span>
            </button>
            <button
              onClick={() => { setEditingSpellId(null); setNewSpell({ name: '', level: 1, school: 'Evocación', castingTime: '1 Acción', range: '60 ft', components: 'V, S', duration: 'Instantáneo', concentration: false, attackOrDc: 'CD 15 DES', damageOrHeal: '3d8', description: '' }); setShowAddSpell(true); }}
              className="flex items-center gap-1 px-2.5 py-1 rounded bg-[#211e28] hover:bg-[#2b2932] text-xs text-[var(--theme-secondary,#d0bcff)] border border-white/5 font-semibold transition-colors"
            >
              <span className="material-symbols-outlined text-xs">add</span>
              <span>+ Magia</span>
            </button>
          </div>
        </div>

        {/* Formulario Añadir Dote */}
        {showAddFeat && (
          <div className="mb-4 p-3 rounded-lg bg-[#211e28] border border-[var(--theme-primary,#fbbf24)]/30 flex flex-col gap-2">
            <input
              type="text"
              value={newFeat.name || ''}
              onChange={(e) => setNewFeat((prev) => ({ ...prev, name: e.target.value }))}
              placeholder="Nombre del Dote (Feat) Homebrew..."
              className="bg-[#1c1a24] text-xs text-white px-2 py-1 rounded border border-white/10"
            />
            <textarea
              value={newFeat.description || ''}
              onChange={(e) => setNewFeat((prev) => ({ ...prev, description: e.target.value }))}
              placeholder="Descripción y mecánica del dote..."
              rows={2}
              className="bg-[#1c1a24] text-xs text-gray-200 px-2 py-1 rounded border border-white/10"
            />
            <div className="flex items-center gap-2">
              <label className="text-[10px] text-gray-400 uppercase font-bold" htmlFor="feat-ability">Bono de característica</label>
              <select
                id="feat-ability"
                value={Object.keys(newFeat.abilityBonuses || {})[0] || 'INT'}
                onChange={(e) => setNewFeat((prev) => ({ ...prev, abilityBonuses: { [e.target.value]: Number(Object.values(prev.abilityBonuses || {})[0] || 0) } }))}
                className="bg-[#1c1a24] text-xs text-white px-2 py-1 rounded border border-white/10"
              >
                {(['FUE', 'DES', 'CON', 'INT', 'SAB', 'CAR'] as AbilityCode[]).map((code) => <option key={code} value={code}>{code}</option>)}
              </select>
              <input
                type="number"
                min="-5"
                max="10"
                value={Object.values(newFeat.abilityBonuses || {})[0] || 0}
                onChange={(e) => setNewFeat((prev) => ({ ...prev, abilityBonuses: { [Object.keys(prev.abilityBonuses || {})[0] || 'INT']: Number(e.target.value) } }))}
                className="w-16 bg-[#1c1a24] text-xs text-white px-2 py-1 rounded border border-white/10"
                aria-label="Cantidad del bono de característica"
              />
            </div>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => {
                  if (newFeat.name) {
                    const featItem: FeatDefinition = {
                      id: editingFeatId ?? `feat-${Date.now()}`,
                      name: newFeat.name,
                      prerequisite: newFeat.prerequisite,
                      description: newFeat.description || '',
                      abilityBonuses: newFeat.abilityBonuses,
                      isHomebrew: editingFeatId
                        ? character.feats?.find((feat) => feat.id === editingFeatId)?.isHomebrew
                        : true,
                    };
                    onUpdateCharacter((prev) => {
                      const oldFeat = (prev.feats || []).find((feat) => feat.id === editingFeatId);
                      const nextFeats = editingFeatId
                        ? (prev.feats || []).map((feat) => feat.id === editingFeatId ? featItem : feat)
                        : [...(prev.feats || []), featItem];
                      const nextTraits = editingFeatId
                        ? prev.traits.map((trait) => trait.isHomebrew && trait.title === oldFeat?.name
                          ? { ...trait, title: featItem.name, description: featItem.description }
                          : trait)
                        : [...prev.traits, {
                          title: featItem.name,
                          badge: 'DOTE',
                          badgeType: 'accent' as const,
                          description: featItem.description,
                          isHomebrew: true,
                        }];
                      return recalculateDerivedStats({
                        ...prev,
                        traits: nextTraits,
                      }, nextFeats);
                    });
                    setShowAddFeat(false);
                    setEditingFeatId(null);
                    setNewFeat((prev) => ({ ...prev, name: '', description: '', abilityBonuses: { INT: 0 } }));
                  }
                }}
                className="px-3 py-1 bg-[var(--theme-primary,#fbbf24)] text-[#261a00] font-bold text-xs rounded"
              >
                {editingFeatId ? 'Guardar cambios' : 'Guardar Dote'}
              </button>
              <button
                onClick={() => { setShowAddFeat(false); setEditingFeatId(null); }}
                className="px-2 py-1 bg-white/10 text-gray-300 text-xs rounded"
              >
                Cancelar
              </button>
            </div>
          </div>
        )}

        {/* Formulario Añadir Magia */}
        {showAddSpell && (
          <div className="mb-4 p-3 rounded-lg bg-[#211e28] border border-[var(--theme-secondary,#d0bcff)]/30 flex flex-col gap-2">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <input
                type="text"
                value={newSpell.name || ''}
                onChange={(e) => setNewSpell((prev) => ({ ...prev, name: e.target.value }))}
                placeholder="Nombre del Conjuro..."
                className="bg-[#1c1a24] text-xs text-white px-2 py-1 rounded border border-white/10"
              />
              <input
                type="number"
                min="0"
                max="9"
                value={newSpell.level ?? 1}
                onChange={(e) => setNewSpell((prev) => ({ ...prev, level: parseInt(e.target.value, 10) || 0 }))}
                placeholder="Nivel de conjuro..."
                className="bg-[#1c1a24] text-xs text-white px-2 py-1 rounded border border-white/10"
              />
              <input
                type="text"
                value={newSpell.damageOrHeal || ''}
                onChange={(e) => setNewSpell((prev) => ({ ...prev, damageOrHeal: e.target.value }))}
                placeholder="Daño / Efecto (ej. 3d8 Fuego)..."
                className="bg-[#1c1a24] text-xs text-white px-2 py-1 rounded border border-white/10"
              />
              <input
                type="text"
                value={newSpell.range || ''}
                onChange={(e) => setNewSpell((prev) => ({ ...prev, range: e.target.value }))}
                placeholder="Alcance (60 ft)..."
                className="bg-[#1c1a24] text-xs text-white px-2 py-1 rounded border border-white/10"
              />
            </div>
            <textarea
              value={newSpell.description || ''}
              onChange={(e) => setNewSpell((prev) => ({ ...prev, description: e.target.value }))}
              placeholder="Descripción del efecto..."
              rows={2}
              className="bg-[#1c1a24] text-xs text-gray-200 px-2 py-1 rounded border border-white/10"
            />
            <label className="flex items-center gap-2 text-xs text-gray-300">
              <input
                type="checkbox"
                checked={!!newSpell.concentration}
                onChange={(event) => setNewSpell((prev) => ({ ...prev, concentration: event.target.checked }))}
                className="accent-[var(--theme-primary,#fbbf24)]"
              />
              Requiere concentración
            </label>
            <label className="flex items-center gap-2 text-xs text-gray-300">
              Dados extra por nivel de espacio (opcional)
              <input
                type="text"
                value={newSpell.upcast?.dicePerLevel ?? ''}
                onChange={(event) => setNewSpell((prev) => ({
                  ...prev,
                  upcast: event.target.value.trim()
                    ? { dicePerLevel: event.target.value }
                    : undefined,
                }))}
                placeholder="1d6"
                aria-label="Dados de daño extra por nivel de espacio"
                className="w-24 rounded border border-white/10 bg-[#1c1a24] px-2 py-1 text-xs text-white"
              />
            </label>
            {invalidUpcastDraft && <p role="alert" className="text-[10px] text-red-300">Usa solo una expresión de dados positiva, por ejemplo 1d6.</p>}
            <div className="flex justify-end gap-2">
              <button
                disabled={invalidUpcastDraft || !newSpell.name?.trim()}
                onClick={() => {
                  if (newSpell.name) {
                    const sp: SpellDefinition = {
                      id: editingSpellId ?? `spl-${Date.now()}`,
                      name: newSpell.name,
                      level: newSpell.level ?? 1,
                      school: newSpell.school || 'Evocación',
                      castingTime: newSpell.castingTime || '1 Acción',
                      range: newSpell.range || '60 ft',
                      components: newSpell.components || 'V, S',
                      duration: newSpell.duration || 'Instantáneo',
                      concentration: !!newSpell.concentration,
                      upcast: newSpell.upcast?.dicePerLevel.trim()
                        ? { dicePerLevel: newSpell.upcast.dicePerLevel.trim() }
                        : undefined,
                      attackOrDc: newSpell.attackOrDc || 'CD 15 DES',
                      damageOrHeal: newSpell.damageOrHeal || '3d8',
                      description: newSpell.description || '',
                      isHomebrew: editingSpellId
                        ? character.spells?.find((spell) => spell.id === editingSpellId)?.isHomebrew
                        : true,
                    };
                    onUpdateCharacter((prev) => ({
                      ...prev,
                      spells: editingSpellId
                        ? (prev.spells || []).map((spell) => spell.id === editingSpellId ? sp : spell)
                        : [...(prev.spells || []), sp],
                    }));
                    setShowAddSpell(false);
                    setEditingSpellId(null);
                  }
                }}
                className="px-3 py-1 bg-[var(--theme-secondary,#d0bcff)] text-black font-bold text-xs rounded"
              >
                {editingSpellId ? 'Guardar cambios' : 'Guardar Conjuro'}
              </button>
              <button
                onClick={() => { setShowAddSpell(false); setEditingSpellId(null); }}
                className="px-2 py-1 bg-white/10 text-gray-300 text-xs rounded"
              >
                Cancelar
              </button>
            </div>
          </div>
        )}

        {/* Lista de Rasgos y Dotes */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {character.traits.map((tr, idx) => (
            <div
              key={`trait-${idx}`}
              className="bg-[#211e28] p-3 rounded-lg border border-white/5 flex flex-col"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-semibold text-xs text-white flex items-center gap-1.5">
                  {tr.title}
                  {tr.isHomebrew && (
                    <span className="text-[9px] text-[var(--theme-primary,#fbbf24)] font-mono">
                      [Homebrew]
                    </span>
                  )}
                </span>
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-white/10 font-mono text-gray-300">
                  {tr.badge}
                </span>
              </div>
              <p className="text-xs text-gray-400 leading-relaxed">
                {tr.description}
              </p>
            </div>
          ))}
        </div>

        {(character.feats?.length || 0) > 0 && (
          <div className="mt-5">
            <h4 className="font-runic text-xs text-[var(--theme-primary,#fbbf24)] uppercase font-bold mb-2">
              Dotes
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {character.feats?.map((feat) => (
                <div key={feat.id} className="bg-[#211e28] p-3 rounded-lg border border-white/5 flex items-start justify-between gap-3">
                  <div>
                    <span className="font-semibold text-xs text-white">{feat.name}</span>
                        <p className="text-xs text-gray-400 mt-1">{feat.description}</p>
                        {feat.abilityBonuses && Object.entries(feat.abilityBonuses).map(([code, bonus]) => (
                          <span key={code} className="text-[10px] text-emerald-300 mt-1">{code} {bonus >= 0 ? `+${bonus}` : bonus}</span>
                        ))}
                  </div>
                  <div className="flex shrink-0 items-start gap-1">
                  <button
                    onClick={() => {
                      setEditingFeatId(feat.id);
                      setNewFeat({ ...feat });
                      setShowAddFeat(true);
                    }}
                    className="p-1 text-gray-400 hover:text-white"
                    title={`Editar ${feat.name}`}
                    aria-label={`Editar ${feat.name}`}
                  >
                    <span className="material-symbols-outlined text-sm">edit</span>
                  </button>
                  <button
                    onClick={() => {
                      onBeforeUndoableAction();
                      onUpdateCharacter((prev) => {
                      const nextFeats = (prev.feats || []).filter((item) => item.id !== feat.id);
                      return recalculateDerivedStats({
                        ...prev,
                        traits: prev.traits.filter((trait) => !(trait.isHomebrew && trait.title === feat.name)),
                      }, nextFeats);
                    });
                    }}
                    className="p-1 text-gray-500 hover:text-red-400 shrink-0"
                    title="Eliminar dote"
                    aria-label={`Eliminar ${feat.name}`}
                  >
                    <span className="material-symbols-outlined text-sm">delete</span>
                  </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {(character.spells?.length || 0) > 0 && (
          <div className="mt-5">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-runic text-xs text-[var(--theme-secondary,#d0bcff)] uppercase font-bold">
                Conjuros & Magias Conocidas
              </h4>
              <div className="flex items-center gap-2">
                <select
                  value={spellFilter}
                  onChange={(event) => setSpellFilter(event.target.value === 'all' ? 'all' : Number(event.target.value))}
                  className="bg-[#211e28] text-[10px] text-gray-300 rounded border border-white/10 px-1.5 py-1"
                  aria-label="Filtrar conjuros por nivel"
                >
                  <option value="all">Todos</option>
                  {Array.from({ length: 10 }, (_, level) => <option key={level} value={level}>{level === 0 ? 'Trucos' : `Nivel ${level}`}</option>)}
                </select>
                <span className="text-[10px] text-gray-500">{character.spells?.filter((spell) => spellFilter === 'all' || spell.level === spellFilter).length} conocidos</span>
              </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
              {character.spells?.filter((spell) => spellFilter === 'all' || spell.level === spellFilter).map((spell) => {
                const attackMatch = spell.attackOrDc.match(/(?:\+|CD\s*)(-?\d+)/i);
                const attackModifier = attackMatch ? Number(attackMatch[1]) : getSpellAttackModifier(character);
                const canCriticallyHit = /ataque|\+/i.test(spell.attackOrDc);
                const damageMatch = spell.damageOrHeal.match(/(\d+)d(\d+)(?:\s*\+\s*(-?\d+))?/i);
                return (
                  <div key={spell.id} className="bg-[#211e28] p-3 rounded-lg border border-white/5">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="font-semibold text-xs text-white">{spell.name}</span>
                        <span className="ml-2 text-[10px] text-[var(--theme-secondary,#d0bcff)]">{spell.level === 0 ? 'Truco' : `Nivel ${spell.level}`}</span>
                      </div>
                      <div className="flex shrink-0 items-center gap-1">
                        <button
                          onClick={() => {
                            setEditingSpellId(spell.id);
                            setNewSpell({ ...spell });
                            setShowAddSpell(true);
                          }}
                          className="p-1 text-gray-400 hover:text-white"
                          title={`Editar ${spell.name}`}
                          aria-label={`Editar ${spell.name}`}
                        >
                          <span className="material-symbols-outlined text-sm">edit</span>
                        </button>
                        <button
                          onClick={() => {
                            onBeforeUndoableAction();
                            onUpdateCharacter((prev) => ({ ...prev, spells: (prev.spells || []).filter((item) => item.id !== spell.id) }));
                          }}
                          className="p-1 text-gray-500 hover:text-red-400"
                          title="Eliminar conjuro"
                          aria-label={`Eliminar ${spell.name}`}
                        >
                          <span className="material-symbols-outlined text-sm">delete</span>
                        </button>
                      </div>
                    </div>
                    <p className="text-[11px] text-gray-400 mt-1">
                      {spell.school} • {spell.range} • {spell.damageOrHeal}
                      {spell.upcast ? ` • +${spell.upcast.dicePerLevel}/nivel de espacio` : ''}
                    </p>
                    <p className="text-xs text-gray-300 mt-1">{spell.description}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <button
                        onClick={() => {
                          const outcome = onRollDice(`Ataque: ${spell.name}`, attackModifier, spell.attackOrDc, 20, 1, 'normal', undefined, false, 'attack');
                          setLastCriticalAttack(outcome.natural === 20 ? `spell:${spell.id}` : null);
                        }}
                        className="px-2 py-1 rounded bg-[#2b2932] hover:bg-[var(--theme-secondary-container,#571bc1)] text-xs text-white"
                      >
                        Tirar ataque
                      </button>
                      {damageMatch && (
                        <>
                          <button
                            onClick={() => {
                              const attackId = `spell:${spell.id}`;
                              const isCritical = criticalDamage[attackId] ?? lastCriticalAttack === attackId;
                              const formula = isCritical ? doubleDice(spell.damageOrHeal) : spell.damageOrHeal;
                              if (!parseDiceExpression(formula)) return;
                              onRollDice(`Daño: ${spell.name}`, 0, spell.damageOrHeal, 20, 1, 'normal', formula, isCritical);
                            }}
                            className="px-2 py-1 rounded bg-[#2b2932] hover:bg-emerald-500/30 text-xs text-emerald-300"
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
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
      {levelUpTarget !== null && (
        <LevelUpDialog
          currentLevel={character.level}
          targetLevel={levelUpTarget}
          hitDie={getHitDicePool(character).dieSize}
          constitutionModifier={character.abilities.CON.modifier}
          onCancel={() => setLevelUpTarget(null)}
          onConfirm={handleWizardLevelUp}
        />
      )}
    </div>
  );
};
