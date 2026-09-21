import React, { useState } from 'react';
import { CharacterSheet, AbilityCode, AbilityScore, Skill, WeaponItem, SpellDefinition, FeatDefinition } from '../types';

interface CharacterSheetViewProps {
  character: CharacterSheet;
  onUpdateCharacter: (updater: (prev: CharacterSheet) => CharacterSheet) => void;
  onRollDice: (
    label: string,
    modifier: number,
    subtext?: string,
    sides?: number,
    count?: number
  ) => void;
  onShortRest: () => void;
  onLongRest: () => void;
}

export const CharacterSheetView: React.FC<CharacterSheetViewProps> = ({
  character,
  onUpdateCharacter,
  onRollDice,
  onShortRest,
  onLongRest,
}) => {
  // Modal / Quick addition states for Homebrew
  const [showAddWeapon, setShowAddWeapon] = useState(false);
  const [newWeapon, setNewWeapon] = useState<Partial<WeaponItem>>({
    name: 'Espada Lunar Homebrew',
    attackBonus: 7,
    damage: '1d8 + 4',
    damageType: 'Radiante',
    reach: '5 ft',
    properties: 'Versátil (1d10), Rúnica',
  });

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

  const [showAddFeat, setShowAddFeat] = useState(false);
  const [newFeat, setNewFeat] = useState<Partial<FeatDefinition>>({
    name: 'Maestría Arcana Ancestral',
    prerequisite: 'Capacidad de lanzar conjuros de nivel 2+',
    description: 'Puedes sumar tu bonificador de competencia al daño de un conjuro una vez por turno.',
    abilityBonuses: { INT: 2 },
  });

  const [showAddSkill, setShowAddSkill] = useState(false);
  const [newSkill, setNewSkill] = useState<Partial<Skill>>({
    name: 'Alquimia Prohibida',
    attr: 'INT',
    isProficient: true,
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
      modifier: effectiveAbilities[skill.attr].modifier + (skill.isProficient ? prev.proficiencyBonus : 0),
    }));
    const keyModifier = Object.values(effectiveAbilities).find((ability) => ability.isKeyAttribute)?.modifier
      ?? effectiveAbilities.INT.modifier;
    return {
      ...prev,
      feats,
      abilities: effectiveAbilities,
      skills: effectiveSkills,
      passivePerception: 10 + effectiveAbilities.SAB.modifier + (effectiveSkills.find((skill) => skill.name === 'Percepción')?.isProficient ? prev.proficiencyBonus : 0),
      spellSaveDc: 8 + prev.proficiencyBonus + keyModifier,
      spellAttackBonus: prev.proficiencyBonus + keyModifier,
    };
  };

  // HP Controls
  const handleModifyHp = (delta: number) => {
    onUpdateCharacter((prev) => {
      if (delta < 0) {
        const incomingDamage = Math.abs(delta);
        const absorbed = Math.min(prev.tempHp, incomingDamage);
        const remainingDamage = incomingDamage - absorbed;
        return {
          ...prev,
          tempHp: prev.tempHp - absorbed,
          currentHp: Math.max(0, prev.currentHp - remainingDamage),
        };
      }
      return { ...prev, currentHp: Math.min(prev.maxHp, prev.currentHp + delta) };
    });
  };

  // Toggle Inspiration
  const handleToggleInspiration = () => {
    onUpdateCharacter((prev) => ({
      ...prev,
      hasInspiration: !prev.hasInspiration,
    }));
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
          const profMod = sk.isProficient ? prev.proficiencyBonus : 0;
          return { ...sk, modifier: mod + profMod };
        }
        return sk;
      });

      // Recalculate passive perception if SAB
      const passivePerc = code === 'SAB' 
        ? 10 + mod + (prev.skills.find((s) => s.name === 'Percepción')?.isProficient ? prev.proficiencyBonus : 0)
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
          const nextProf = !sk.isProficient;
          const attrMod = prev.abilities[sk.attr].modifier;
          const nextMod = nextProf ? attrMod + prev.proficiencyBonus : attrMod;
          return {
            ...sk,
            isProficient: nextProf,
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
        passivePerc = 10 + sabMod + (percSkill?.isProficient ? prev.proficiencyBonus : 0);
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

  const hpPct = Math.round((character.currentHp / (character.maxHp || 1)) * 100);

  return (
    <div className="flex flex-col w-full pb-16">
      {/* ========================================================== */}
      {/* 1. ENCABEZADO: NOMBRE, CLASE, NIVEL Y ESPECIE (EDITABLES) */}
      {/* ========================================================== */}
      <div className="relative bg-[#1c1a24] rounded-xl p-5 lg:p-6 mb-6 shadow-xl border border-white/5 overflow-hidden">
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-gradient-to-br from-[var(--theme-primary,rgba(251,191,36,0.1))] to-[var(--theme-secondary-container,rgba(87,27,193,0.15))] blur-3xl pointer-events-none"></div>

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
                    const newProf = Math.ceil(1 + newLvl / 4);
                    onUpdateCharacter((prev) => {
                      const spellcastingModifier = Object.values(prev.abilities)
                        .find((ability) => ability.isKeyAttribute)?.modifier ?? prev.abilities.INT.modifier;
                      return {
                        ...prev,
                        level: newLvl,
                        proficiencyBonus: newProf,
                        abilities: Object.fromEntries(
                          Object.entries(prev.abilities).map(([code, ability]) => [code, {
                            ...ability,
                            savingThrow: ability.modifier + (ability.isProficientSave ? newProf : 0),
                          }])
                        ) as CharacterSheet['abilities'],
                        skills: prev.skills.map((skill) => ({
                          ...skill,
                          modifier: prev.abilities[skill.attr].modifier + (skill.isProficient ? newProf : 0),
                        })),
                        passivePerception: 10 + prev.abilities.SAB.modifier + (prev.skills.find((skill) => skill.name === 'Percepción')?.isProficient ? newProf : 0),
                        spellSaveDc: 8 + newProf + spellcastingModifier,
                        spellAttackBonus: newProf + spellcastingModifier,
                      };
                    });
                  }}
                  className="bg-transparent font-garamond text-xl text-[var(--theme-primary,#fbbf24)] font-bold focus:outline-none focus:bg-white/10 rounded w-12"
                />
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
                Velocidad: {character.speedFeet} ft
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
                    onClick={() => onRollDice(`${ab.name} (Prueba)`, ab.modifier, `Puntuación: ${ab.base}`)}
                    className="text-gray-400 hover:text-[var(--theme-primary,#fbbf24)] transition-colors p-0.5"
                    title={`Tirar d20 de ${ab.name}`}
                  >
                    <span className="material-symbols-outlined text-sm">casino</span>
                  </button>
                </div>

                {/* MODIFICADOR (GRANDE Y DESTACADO) */}
                <div
                  onClick={() => onRollDice(`${ab.name} (Prueba)`, ab.modifier, `Base: ${ab.base}`)}
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
                    {ab.modifier >= 0 ? `+${ab.modifier}` : ab.modifier}
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
                        ab.savingThrow,
                        ab.isProficientSave ? `Competente (+${character.proficiencyBonus})` : 'Normal'
                      )
                    }
                    className="font-mono text-xs font-bold text-gray-200 hover:text-[var(--theme-primary,#fbbf24)]"
                  >
                    {ab.savingThrow >= 0 ? `+${ab.savingThrow}` : ab.savingThrow}
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
                  value={character.armorClass}
                  onChange={(e) => {
                    const newAc = parseInt(e.target.value, 10) || 10;
                    onUpdateCharacter((prev) => ({ ...prev, armorClass: newAc }));
                  }}
                  className="bg-transparent font-garamond text-3xl font-bold text-white text-center w-16 focus:outline-none focus:bg-white/10 rounded"
                  title="Clase de Armadura (editable)"
                />
              </div>
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
                onClick={() => onRollDice('Ataque de Conjuro', character.spellAttackBonus, 'Bono de ataque mágico')}
                className="font-mono text-base font-bold text-[var(--theme-primary,#fbbf24)] hover:brightness-125"
                title="Tirar ataque de conjuro"
              >
                {character.spellAttackBonus >= 0 ? `+${character.spellAttackBonus}` : character.spellAttackBonus}
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
                    onClick={() => handleModifyHp(-5)}
                    className="w-8 h-8 rounded-lg bg-[#2b2932] hover:bg-red-500/20 text-red-400 hover:text-red-300 font-bold text-xs border border-white/5 flex items-center justify-center transition-colors"
                    title="Restar 5 PG"
                  >
                    -5
                  </button>
                  <button
                    onClick={() => handleModifyHp(-1)}
                    className="w-8 h-8 rounded-lg bg-[#2b2932] hover:bg-red-500/20 text-red-400 hover:text-red-300 font-bold text-sm border border-white/5 flex items-center justify-center transition-colors"
                    title="Restar 1 PG"
                  >
                    -1
                  </button>
                </div>

                {/* PG Actual editable */}
                <div className="flex items-baseline gap-1">
                  <input
                    type="number"
                    min="0"
                    max={character.maxHp}
                    value={character.currentHp}
                    onChange={(e) => {
                      const val = parseInt(e.target.value, 10) || 0;
                      onUpdateCharacter((prev) => ({ ...prev, currentHp: Math.min(prev.maxHp, Math.max(0, val)) }));
                    }}
                    className="w-16 bg-transparent font-garamond text-4xl font-bold text-white text-center focus:outline-none focus:bg-white/10 rounded"
                    title="Puntos de Golpe Actuales (editable)"
                  />
                  <span className="text-xl text-gray-500">/</span>
                  <input
                    type="number"
                    min="1"
                    value={character.maxHp}
                    onChange={(e) => {
                      const val = parseInt(e.target.value, 10) || 1;
                      onUpdateCharacter((prev) => ({ ...prev, maxHp: val }));
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
                    onChange={(e) =>
                      onUpdateCharacter((prev) => ({ ...prev, hitDice: e.target.value }))
                    }
                    className="w-14 bg-transparent text-center text-sm font-bold text-amber-400 focus:outline-none"
                  />
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
            {character.skills.map((s) => (
              <div
                key={s.name}
                className={`flex items-center justify-between py-1.5 px-2.5 rounded-lg border transition-all ${
                  s.isProficient
                    ? 'bg-[#211e28] border-[var(--theme-primary,#fbbf24)]/30'
                    : 'bg-[#211e28]/40 border-transparent hover:bg-[#211e28]/70'
                }`}
              >
                {/* Casilla de competencia marcable */}
                <div className="flex items-center gap-2.5 flex-1 min-w-0">
                  <button
                    onClick={() => handleToggleSkillProficiency(s.name)}
                    className="shrink-0 p-0.5"
                    title={s.isProficient ? 'Quitar competencia' : 'Marcar competencia'}
                  >
                    <span
                      className={`w-3.5 h-3.5 rotate-45 rounded-xs flex items-center justify-center transition-all ${
                        s.isProficient
                          ? 'bg-[var(--theme-primary,#fbbf24)] shadow-[0_0_6px_rgba(251,191,36,0.6)]'
                          : 'bg-[#2b2932] border border-white/10'
                      }`}
                    />
                  </button>
                  <button
                    onClick={() =>
                      onRollDice(
                        `Prueba de ${s.name} (${s.attr})`,
                        s.modifier,
                        s.isProficient ? `Competente (+${character.proficiencyBonus})` : 'Sin competencia'
                      )
                    }
                    className={`text-xs text-left truncate hover:text-[var(--theme-primary,#fbbf24)] transition-colors ${
                      s.isProficient ? 'text-white font-bold' : 'text-gray-300'
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
                      s.modifier,
                      s.isProficient ? `Competente (+${character.proficiencyBonus})` : 'Sin competencia'
                    )
                  }
                  className="text-xs font-mono font-bold text-[var(--theme-primary,#fbbf24)] hover:brightness-125 px-1.5 py-0.5 rounded hover:bg-white/5"
                  title="Tirar dado"
                >
                  {s.modifier >= 0 ? `+${s.modifier}` : s.modifier}
                </button>
              </div>
            ))}
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
                onChange={(e) => setNewSkill((prev) => ({ ...prev, attr: e.target.value as any }))}
                className="bg-[#1c1a24] text-xs text-gray-200 px-2 py-1 rounded border border-white/10"
              >
                {['FUE', 'DES', 'CON', 'INT', 'SAB', 'CAR'].map((a) => (
                  <option key={a} value={a}>{a}</option>
                ))}
              </select>
              <button
                onClick={() => {
                  if (newSkill.name) {
                    const attrMod = character.abilities[newSkill.attr as keyof typeof character.abilities].modifier;
                    const finalMod = attrMod + character.proficiencyBonus;
                    onUpdateCharacter((prev) => ({
                      ...prev,
                      skills: [
                        ...prev.skills,
                        {
                          name: newSkill.name!,
                          attr: newSkill.attr as any,
                          isProficient: true,
                          modifier: finalMod,
                          isHomebrew: true,
                        },
                      ],
                    }));
                    setShowAddSkill(false);
                    setNewSkill({ name: '', attr: 'INT', isProficient: true });
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
          <div className="bg-[#1c1a24] p-5 rounded-xl border border-white/5 shadow-xl">
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

            <div className="flex flex-col gap-3">
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
                        <button
                          key={`tier-${tier.tier}-slot-${slotIdx}`}
                          onClick={() => handleToggleSpellSlot(tierIdx, slotIdx)}
                          className="w-6 h-6 rounded-full bg-[#2b2932] border border-white/10 flex items-center justify-center transition-all hover:scale-110"
                          title={isAvailable ? 'Espacio disponible (clic para gastar)' : 'Espacio gastado (clic para recuperar)'}
                        >
                          <span
                            className={`w-3 h-3 rounded-full bg-[var(--theme-secondary,#d0bcff)] transition-opacity ${
                              isAvailable
                                ? 'opacity-100 shadow-[0_0_8px_rgba(208,188,255,0.8)]'
                                : 'opacity-10'
                            }`}
                          />
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>

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
                onClick={() => setShowAddWeapon(true)}
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
                          id: `wpn-${Date.now()}`,
                          name: newWeapon.name,
                          attackBonus: newWeapon.attackBonus || 5,
                          damage: newWeapon.damage || '1d8',
                          damageType: newWeapon.damageType || 'Cortante',
                          reach: newWeapon.reach || '5 ft',
                          properties: newWeapon.properties || 'Versátil',
                          isEquipped: true,
                          isHomebrew: true,
                        };
                        onUpdateCharacter((prev) => ({
                          ...prev,
                          weapons: [...(prev.weapons || []), item],
                        }));
                        setShowAddWeapon(false);
                      }
                    }}
                    className="px-3 py-1 bg-[var(--theme-primary,#fbbf24)] text-[#261a00] font-bold text-xs rounded"
                  >
                    Guardar Arma
                  </button>
                  <button
                    onClick={() => setShowAddWeapon(false)}
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
                      onClick={() =>
                        onRollDice(
                          `Ataque con ${wpn.name}`,
                          wpn.attackBonus,
                          `Daño: ${wpn.damage} (${wpn.damageType})`
                        )
                      }
                      className="px-2 py-1 rounded bg-[#2b2932] hover:bg-[var(--theme-primary,#fbbf24)] text-gray-200 hover:text-[#261a00] font-mono text-xs font-bold transition-colors"
                      title="Tirar ataque con d20"
                    >
                      {wpn.attackBonus >= 0 ? `+${wpn.attackBonus}` : wpn.attackBonus} Atk
                    </button>
                    <button
                      onClick={() => {
                        const damageMatch = wpn.damage.match(/(\d+)d(\d+)(?:\s*\+\s*(-?\d+))?/i);
                        onRollDice(
                          `Daño de ${wpn.name}`,
                          damageMatch?.[3] ? Number(damageMatch[3]) : 0,
                          wpn.damageType,
                          damageMatch?.[2] ? Number(damageMatch[2]) : 20,
                          damageMatch?.[1] ? Number(damageMatch[1]) : 1
                        );
                      }}
                      className="px-2 py-1 rounded bg-[#2b2932] hover:bg-emerald-500/30 text-emerald-300 font-mono text-xs font-bold"
                      title="Tirar daño"
                    >
                      Daño
                    </button>
                    {character.weapons?.some((item) => item.id === wpn.id) && (
                      <button
                        onClick={() => onUpdateCharacter((prev) => ({ ...prev, weapons: (prev.weapons || []).filter((item) => item.id !== wpn.id) }))}
                        className="p-1 text-gray-500 hover:text-red-400"
                        title="Eliminar arma"
                        aria-label={`Eliminar ${wpn.name}`}
                      >
                        <span className="material-symbols-outlined text-sm">delete</span>
                      </button>
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
              onClick={() => setShowAddFeat(true)}
              className="flex items-center gap-1 px-2.5 py-1 rounded bg-[#211e28] hover:bg-[#2b2932] text-xs text-[var(--theme-primary,#fbbf24)] border border-white/5 font-semibold transition-colors"
            >
              <span className="material-symbols-outlined text-xs">add</span>
              <span>+ Dote / Feat</span>
            </button>
            <button
              onClick={() => setShowAddSpell(true)}
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
                      id: `feat-${Date.now()}`,
                      name: newFeat.name,
                      prerequisite: newFeat.prerequisite,
                      description: newFeat.description || '',
                      abilityBonuses: newFeat.abilityBonuses,
                      isHomebrew: true,
                    };
                    onUpdateCharacter((prev) => {
                      const nextFeats = [...(prev.feats || []), featItem];
                      return recalculateDerivedStats({
                        ...prev,
                      feats: [...(prev.feats || []), featItem],
                      traits: [
                        ...prev.traits,
                        {
                          title: featItem.name,
                          badge: 'DOTE',
                          badgeType: 'accent',
                          description: featItem.description,
                          isHomebrew: true,
                        },
                      ],
                      }, nextFeats);
                    });
                    setShowAddFeat(false);
                    setNewFeat((prev) => ({ ...prev, name: '', description: '', abilityBonuses: { INT: 0 } }));
                  }
                }}
                className="px-3 py-1 bg-[var(--theme-primary,#fbbf24)] text-[#261a00] font-bold text-xs rounded"
              >
                Guardar Dote
              </button>
              <button
                onClick={() => setShowAddFeat(false)}
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
                value={newSpell.level || 1}
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
            <div className="flex justify-end gap-2">
              <button
                onClick={() => {
                  if (newSpell.name) {
                    const sp: SpellDefinition = {
                      id: `spl-${Date.now()}`,
                      name: newSpell.name,
                      level: newSpell.level ?? 1,
                      school: newSpell.school || 'Evocación',
                      castingTime: newSpell.castingTime || '1 Acción',
                      range: newSpell.range || '60 ft',
                      components: newSpell.components || 'V, S',
                      duration: newSpell.duration || 'Instantáneo',
                      concentration: !!newSpell.concentration,
                      attackOrDc: newSpell.attackOrDc || 'CD 15 DES',
                      damageOrHeal: newSpell.damageOrHeal || '3d8',
                      description: newSpell.description || '',
                      isHomebrew: true,
                    };
                    onUpdateCharacter((prev) => ({
                      ...prev,
                      spells: [...(prev.spells || []), sp],
                    }));
                    setShowAddSpell(false);
                  }
                }}
                className="px-3 py-1 bg-[var(--theme-secondary,#d0bcff)] text-black font-bold text-xs rounded"
              >
                Guardar Conjuro
              </button>
              <button
                onClick={() => setShowAddSpell(false)}
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
                  <button
                    onClick={() => onUpdateCharacter((prev) => {
                      const nextFeats = (prev.feats || []).filter((item) => item.id !== feat.id);
                      return recalculateDerivedStats({
                        ...prev,
                        traits: prev.traits.filter((trait) => !(trait.isHomebrew && trait.title === feat.name)),
                      }, nextFeats);
                    })}
                    className="p-1 text-gray-500 hover:text-red-400 shrink-0"
                    title="Eliminar dote"
                    aria-label={`Eliminar ${feat.name}`}
                  >
                    <span className="material-symbols-outlined text-sm">delete</span>
                  </button>
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
                  {[0, 1, 2, 3, 4, 5].map((level) => <option key={level} value={level}>{level === 0 ? 'Trucos' : `Nivel ${level}`}</option>)}
                </select>
                <span className="text-[10px] text-gray-500">{character.spells?.filter((spell) => spellFilter === 'all' || spell.level === spellFilter).length} conocidos</span>
              </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
              {character.spells?.filter((spell) => spellFilter === 'all' || spell.level === spellFilter).map((spell) => {
                const attackMatch = spell.attackOrDc.match(/(?:\+|CD\s*)(-?\d+)/i);
                const attackModifier = attackMatch ? Number(attackMatch[1]) : character.spellAttackBonus;
                const damageMatch = spell.damageOrHeal.match(/(\d+)d(\d+)(?:\s*\+\s*(-?\d+))?/i);
                return (
                  <div key={spell.id} className="bg-[#211e28] p-3 rounded-lg border border-white/5">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="font-semibold text-xs text-white">{spell.name}</span>
                        <span className="ml-2 text-[10px] text-[var(--theme-secondary,#d0bcff)]">{spell.level === 0 ? 'Truco' : `Nivel ${spell.level}`}</span>
                      </div>
                      <button
                        onClick={() => onUpdateCharacter((prev) => ({ ...prev, spells: (prev.spells || []).filter((item) => item.id !== spell.id) }))}
                        className="p-1 text-gray-500 hover:text-red-400"
                        title="Eliminar conjuro"
                        aria-label={`Eliminar ${spell.name}`}
                      >
                        <span className="material-symbols-outlined text-sm">delete</span>
                      </button>
                    </div>
                    <p className="text-[11px] text-gray-400 mt-1">{spell.school} • {spell.range} • {spell.damageOrHeal}</p>
                    <p className="text-xs text-gray-300 mt-1">{spell.description}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <button
                        onClick={() => onRollDice(`Ataque: ${spell.name}`, attackModifier, spell.attackOrDc)}
                        className="px-2 py-1 rounded bg-[#2b2932] hover:bg-[var(--theme-secondary-container,#571bc1)] text-xs text-white"
                      >
                        Tirar ataque
                      </button>
                      {damageMatch && (
                        <button
                          onClick={() => onRollDice(`Daño: ${spell.name}`, damageMatch[3] ? Number(damageMatch[3]) : 0, spell.damageOrHeal, Number(damageMatch[2]), Number(damageMatch[1]))}
                          className="px-2 py-1 rounded bg-[#2b2932] hover:bg-emerald-500/30 text-xs text-emerald-300"
                        >
                          Tirar daño
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
