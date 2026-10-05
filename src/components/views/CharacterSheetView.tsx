import React, { useState } from 'react';
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
import {
  CharacterSheet,
  AbilityKey,
  ProficiencyLevel,
  InventoryItem,
} from '../../types/character';
import { CLASS_THEMES } from '../../data/classThemes';
import { ClassFeatureDispatcher } from '../classFeatures/ClassFeatureDispatcher';
import { ClassAbilityBox } from '../fx/ClassAbilityBox';
import {
  ClassStyledContainer,
  ClassWidget,
  ClassBox,
  ClassSubBox,
} from '../fx/ClassStyledContainer';

interface Props {
  character: CharacterSheet;
  onUpdate: (updated: CharacterSheet) => void;
  onOpenDiceTray: (formula?: string) => void;
  onOpenLevelUp: () => void;
  onOpenShortRest: () => void;
  onTriggerShake?: () => void;
  onTriggerAuraPulse?: () => void;
  onEmitRipple?: (x: number, y: number) => void;
  onEmitNote?: (x: number, y: number) => void;
  onToggleStealthMode?: (active: boolean) => void;
  onTriggerWildSurge?: (result: string) => void;
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
}) => {
  const theme = CLASS_THEMES[character.classId] || CLASS_THEMES.mago;
  const [selectedDamageType, setSelectedDamageType] = useState('Sin tipo');
  const [newResistance, setNewResistance] = useState('');
  const [resistanceType, setResistanceType] = useState<'Resistencia' | 'Inmunidad' | 'Vulnerabilidad'>('Resistencia');

  // Ability modifier calculator
  const getMod = (score: number) => Math.floor((score - 10) / 2);
  const formatMod = (mod: number) => (mod >= 0 ? `+${mod}` : `${mod}`);

  // Skill bonus calculator
  const getSkillBonus = (ability: AbilityKey, prof: ProficiencyLevel) => {
    const mod = getMod(character.abilities[ability].score);
    if (prof === 'expertise') return mod + character.proficiencyBonus * 2;
    if (prof === 'proficient') return mod + character.proficiencyBonus;
    if (prof === 'half') return mod + Math.floor(character.proficiencyBonus / 2);
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
      Math.min(character.hitPoints.max, character.hitPoints.current + delta),
    );
    onUpdate({
      ...character,
      hitPoints: { ...character.hitPoints, current: next },
    });
  };

  const handleLongRest = () => {
    onUpdate({
      ...character,
      hitPoints: {
        ...character.hitPoints,
        current: character.hitPoints.max,
        temp: 0,
      },
      hitDice: { ...character.hitDice, current: character.hitDice.max },
      spellSlots: character.spellSlots.map((s) => ({ ...s, used: 0 })),
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
    onUpdate({
      ...character,
      inventory: character.inventory.filter((i) => i.id !== id),
    });
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

  // Toggle Spell Slot (equivalente a CW for MCU 11.1)
  const toggleSpellSlot = (tierIndex: number, slotIndex: number) => {
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
        onRollDiceFormula={(formula) => onOpenDiceTray(formula)}
        onTriggerWildSurge={onTriggerWildSurge}
      />

      {/* 3. Condiciones Activas & Defensas */}
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
              ? 'Sin condiciones activas. Velocidad efectiva: ' + character.speed + ' ft'
              : character.activeConditions.join(', ')}
          </ClassSubBox>
        </ClassWidget>

        {/* Resistencias / Inmunidades */}
        <ClassWidget classId={character.classId} className="p-4 md:p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="font-cinzel text-xs font-bold">
              Resistencias, Vulnerabilidades e Inmunidades:
            </span>
          </div>

          <div className="flex items-center gap-2 mb-2">
            <select
              value={resistanceType}
              onChange={(e) => setResistanceType(e.target.value as any)}
              className="rounded border border-white/10 bg-black/40 px-2 py-1 text-xs"
            >
              <option value="Resistencia">Resistencia</option>
              <option value="Inmunidad">Inmunidad</option>
              <option value="Vulnerabilidad">Vulnerabilidad</option>
            </select>
            <input
              type="text"
              placeholder="Tipo de daño..."
              value={newResistance}
              onChange={(e) => setNewResistance(e.target.value)}
              className="flex-1 rounded border border-white/10 bg-black/40 px-2.5 py-1 text-xs"
            />
            <button
              onClick={addDefense}
              className="rounded bg-black/40 hover:bg-black/60 border border-white/15 px-3 py-1 text-xs font-semibold cursor-pointer"
            >
              Añadir
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            {character.defenses.resistances.map((r, i) => (
              <ClassSubBox key={i} classId={character.classId} className="px-2.5 py-1 text-[11px] font-semibold flex items-center gap-1">
                <span>🛡️</span>
                <span>{r}</span>
              </ClassSubBox>
            ))}
            {character.defenses.immunities.map((im, i) => (
              <ClassSubBox key={i} classId={character.classId} className="px-2.5 py-1 text-[11px] font-semibold flex items-center gap-1">
                <span>✨</span>
                <span>{im}</span>
              </ClassSubBox>
            ))}
          </div>
        </ClassWidget>
      </div>

      {/* 4. Inventario & Monedas */}
      <ClassWidget classId={character.classId} className="p-4 md:p-5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <h3 className="font-cinzel text-sm font-bold">Inventario & Bolsa de Equipo</h3>
            <span className="text-xs opacity-75">
              • Peso: {character.inventory.reduce((a, b) => a + b.weight * b.quantity, 0)} / {character.carryingCapacityMax} lb
              • Sintonizados: {character.inventory.filter((i) => i.attuned).length}/3
            </span>
          </div>
          <button
            onClick={addItem}
            className="flex items-center gap-1 rounded-lg bg-black/40 hover:bg-black/60 border border-white/15 px-3 py-1 text-xs font-semibold transition cursor-pointer"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Añadir Objeto</span>
          </button>
        </div>

        {/* Currency row */}
        <div className="grid grid-cols-5 gap-2 mb-3 text-center text-xs">
          <ClassSubBox classId={character.classId} className="p-1.5">
            <span className="text-[10px] opacity-75 block font-mono">CP</span>
            <span className="font-bold text-amber-500 font-mono text-sm">{character.currency.cp}</span>
          </ClassSubBox>
          <ClassSubBox classId={character.classId} className="p-1.5">
            <span className="text-[10px] opacity-75 block font-mono">SP</span>
            <span className="font-bold text-slate-200 font-mono text-sm">{character.currency.sp}</span>
          </ClassSubBox>
          <ClassSubBox classId={character.classId} className="p-1.5">
            <span className="text-[10px] opacity-75 block font-mono">EP</span>
            <span className="font-bold text-cyan-300 font-mono text-sm">{character.currency.ep}</span>
          </ClassSubBox>
          <ClassSubBox classId={character.classId} className="p-1.5">
            <span className="text-[10px] opacity-75 block font-mono">GP</span>
            <span className="font-bold text-amber-400 font-mono text-sm">{character.currency.gp}</span>
          </ClassSubBox>
          <ClassSubBox classId={character.classId} className="p-1.5">
            <span className="text-[10px] opacity-75 block font-mono">PP</span>
            <span className="font-bold text-indigo-300 font-mono text-sm">{character.currency.pp}</span>
          </ClassSubBox>
        </div>

        {/* Items List */}
        <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
          {character.inventory.map((item) => (
            <ClassSubBox
              key={item.id}
              classId={character.classId}
              className="flex items-center justify-between text-xs py-2 px-3"
            >
              <div className="flex items-center gap-3">
                <span className="font-semibold">{item.name}</span>
                <span className="opacity-70 font-mono">x{item.quantity}</span>
                <span className="opacity-70 font-mono">{item.weight} lb</span>
                {item.attuned && (
                  <span className="text-[10px] text-purple-300 bg-purple-950/80 px-1.5 py-0.5 rounded border border-purple-500/40">
                    Sintonizado
                  </span>
                )}
              </div>
              <button
                onClick={() => removeItem(item.id)}
                className="opacity-60 hover:opacity-100 hover:text-rose-400 p-1 cursor-pointer"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </ClassSubBox>
          ))}
        </div>
      </ClassWidget>

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
            const mod = getMod(ab.score);
            const isSpellPrimary = character.spellcastingAbility === key;
            const saveBonus = ab.proficientSave ? mod + character.proficiencyBonus : mod;

            return (
              <ClassAbilityBox
                key={key}
                abilityKey={key}
                label={ab.label}
                score={ab.score}
                mod={mod}
                proficientSave={ab.proficientSave}
                saveBonus={saveBonus}
                isSpellPrimary={isSpellPrimary}
                classId={character.classId}
                onRoll={() => onOpenDiceTray(`1d20 + ${mod}`)}
                onToggleSave={() => toggleSaveProficiency(key)}
              />
            );
          })}
        </div>
      </ClassWidget>

      {/* 6. Combat Stats Row: CA, Iniciativa, Velocidad, Competencia, Pasiva, CD Conjuro */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* Armadura (CA) */}
        <ClassBox classId={character.classId} withCorners className="text-center p-3">
          <div className="flex items-center justify-center gap-1.5 text-xs font-bold opacity-75 mb-1">
            <Shield className="h-4 w-4 text-emerald-400" />
            <span className="font-cinzel text-[11px]">ARMADURA (CA)</span>
          </div>
          <div className="font-cinzel text-3xl font-extrabold my-1 drop-shadow">{character.armorClass}</div>
          <div className="text-[10px] opacity-75 truncate">{character.armorTypeDescription}</div>
        </ClassBox>

        {/* Iniciativa */}
        <ClassBox
          classId={character.classId}
          withCorners
          hoverable
          className="text-center p-3 cursor-pointer"
        >
          <div
            onClick={() => onOpenDiceTray(`1d20 + ${character.initiativeBonus}`)}
            className="w-full h-full"
          >
            <div className="flex items-center justify-center gap-1.5 text-xs font-bold opacity-75 mb-1">
              <Zap className="h-4 w-4 text-purple-400" />
              <span className="font-cinzel text-[11px]">INICIATIVA</span>
            </div>
            <div className="font-cinzel text-3xl font-extrabold my-1 drop-shadow">
              {formatMod(character.initiativeBonus)}
            </div>
            <div className="text-[10px] opacity-75">Mod. Destreza</div>
          </div>
        </ClassBox>

        {/* Velocidad */}
        <ClassBox classId={character.classId} withCorners className="text-center p-3">
          <div className="text-xs font-bold opacity-75 mb-1 font-cinzel text-[11px]">VELOCIDAD</div>
          <div className="font-cinzel text-3xl font-extrabold my-1 drop-shadow">{character.speed}</div>
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

        {/* CD Salv. Conjuro */}
        <ClassBox classId={character.classId} withCorners className="text-center p-3">
          <div className="text-xs font-bold opacity-75 mb-1 font-cinzel text-[11px]">CD SALV. CONJURO</div>
          <div className="font-cinzel text-3xl font-extrabold my-1 drop-shadow">
            {character.spellSaveDC}
          </div>
          <div className="text-[10px] opacity-75">8 + Bono + Mod</div>
        </ClassBox>

        {/* Ataque de Conjuro */}
        <ClassBox
          classId={character.classId}
          withCorners
          hoverable
          className="text-center p-3 cursor-pointer"
        >
          <div
            onClick={() => onOpenDiceTray(`1d20 + ${character.spellAttackBonus}`)}
            className="w-full h-full"
          >
            <div className="text-xs font-bold opacity-75 mb-1 font-cinzel text-[11px]">ATAQUE CONJURO</div>
            <div className="font-cinzel text-3xl font-extrabold my-1 drop-shadow">
              +{character.spellAttackBonus}
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
            <span className="opacity-70 font-cinzel text-xl">/ {character.hitPoints.max} PG</span>
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
                {character.hitDice.current}d{character.hitDice.die.replace(/\D/g, '')}
              </span>
            </div>
          </div>
        </ClassSubBox>

        {/* HP Bar */}
        <div className="mt-3 h-2.5 w-full rounded-full bg-zinc-800 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-300"
            style={{
              width: `${Math.min(100, Math.max(0, (character.hitPoints.current / character.hitPoints.max) * 100))}%`,
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
            const bonus = getSkillBonus(skill.ability, skill.level);
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
                      skill.level === 'expertise'
                        ? 'border-purple-300 bg-purple-500 shadow-[0_0_8px_#a855f7]'
                        : skill.level === 'proficient'
                        ? 'border-emerald-300 bg-emerald-500 shadow-[0_0_8px_#10b981]'
                        : skill.level === 'half'
                        ? 'border-amber-300 bg-amber-500/60'
                        : 'border-white/20 bg-black/40'
                    }`}
                    title={`Estado: ${skill.level}`}
                  />
                  <div>
                    <span className="text-xs font-semibold">{skill.name}</span>
                    <span className="text-[10px] opacity-70 ml-1.5 font-mono">({skill.ability})</span>
                  </div>
                </div>

                <button
                  onClick={() => onOpenDiceTray(`1d20 + ${bonus}`)}
                  className="font-mono font-bold text-xs hover:underline px-2 py-0.5 rounded hover:bg-black/30 cursor-pointer"
                >
                  {formatMod(bonus)}
                </button>
              </ClassSubBox>
            );
          })}
        </div>
      </ClassWidget>

      {/* 9. Espacios de Conjuro & Armas y Ataques */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Espacios de Conjuro */}
        <ClassWidget classId={character.classId} className="p-4 md:p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-cinzel text-sm font-bold flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              <span>Espacios de Conjuro</span>
            </h3>
            <span className="text-xs opacity-75">
              {character.knownSpells.filter((s) => s.prepared).length} Preparados
            </span>
          </div>

          <div className="space-y-2">
            {character.spellSlots.map((slot) => {
              if (slot.max === 0) return null;
              return (
                <ClassSubBox
                  key={slot.level}
                  classId={character.classId}
                  className="flex items-center justify-between p-2.5"
                >
                  <span className="text-xs font-semibold font-cinzel">
                    NIVEL {slot.level} ({slot.max - slot.used} / {slot.max})
                  </span>

                  <div className="flex items-center gap-2">
                    {Array.from({ length: slot.max }).map((_, i) => {
                      const isAvailable = i >= slot.used;
                      return (
                        <button
                          key={i}
                          onClick={() => toggleSpellSlot(slot.level, i)}
                          className={`h-4 w-4 rounded-full border transition cursor-pointer ${
                            isAvailable
                              ? 'border-indigo-300 bg-indigo-500 shadow-[0_0_8px_#6366f1]'
                              : 'border-white/20 bg-black/50'
                          }`}
                        />
                      );
                    })}
                  </div>
                </ClassSubBox>
              );
            })}
          </div>
        </ClassWidget>

        {/* Armas & Ataques */}
        <ClassWidget classId={character.classId} className="p-4 md:p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-cinzel text-sm font-bold flex items-center gap-2">
              <span>⚔️</span>
              <span>Armas & Ataques</span>
            </h3>
          </div>

          <div className="space-y-2.5">
            {character.weapons.map((wep) => (
              <ClassSubBox
                key={wep.id}
                classId={character.classId}
                className="flex items-center justify-between p-3"
              >
                <div>
                  <div className="font-cinzel text-xs font-bold">{wep.name}</div>
                  <div className="text-[10px] opacity-75">
                    {wep.range} • {wep.properties}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onOpenDiceTray(`1d20 + ${wep.attackBonus}`)}
                    className="rounded bg-black/40 hover:bg-black/60 border border-white/15 px-2.5 py-1 text-xs font-bold transition cursor-pointer"
                  >
                    +{wep.attackBonus} Atk
                  </button>

                  <button
                    onClick={() => onOpenDiceTray(wep.damage)}
                    className="rounded bg-black/40 hover:bg-black/60 border border-white/15 px-2.5 py-1 text-xs font-bold transition cursor-pointer"
                  >
                    Daño: {wep.damage}
                  </button>
                </div>
              </ClassSubBox>
            ))}
          </div>
        </ClassWidget>
      </div>
    </div>
  );
};
