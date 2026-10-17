import React, { useState } from 'react';
import { getDieSize } from '../../lib/hitDice';
import { spellSlotsForClassLevel } from '../../lib/classProgression';
import { abilityForSkill } from '../../lib/skillAbilities';
import {
  User,
  Shield,
  Dices,
  BookOpen,
  Swords,
  Check,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  Download,
  Printer,
  Plus,
} from 'lucide-react';
import { CharacterSheet, ClassId, AbilityKey, ProficiencyLevel } from '../../types/character';
import { CLASS_THEMES } from '../../data/classThemes';
import { ClassWidgetFrame } from '../fx/ClassWidgetFrame';
import { ClassSubCard } from '../fx/ClassSubCard';

interface Props {
  onComplete: (newSheet: CharacterSheet) => void;
  onCancel: () => void;
}

const ABILITY_KEYS: AbilityKey[] = ['FUE', 'DES', 'CON', 'INT', 'SAB', 'CAR'];

const BACKGROUNDS: Array<{ name: string; abilities: AbilityKey[] }> = [
  { name: 'Acólito', abilities: ['INT', 'SAB', 'CAR'] },
  { name: 'Artesano', abilities: ['FUE', 'DES', 'INT'] },
  { name: 'Charlatán', abilities: ['DES', 'CON', 'CAR'] },
  { name: 'Criminal', abilities: ['DES', 'CON', 'INT'] },
  { name: 'Ermitaño', abilities: ['CON', 'SAB', 'CAR'] },
  { name: 'Escriba', abilities: ['DES', 'INT', 'SAB'] },
  { name: 'Granjero', abilities: ['FUE', 'CON', 'SAB'] },
  { name: 'Guarda', abilities: ['FUE', 'INT', 'SAB'] },
  { name: 'Guía', abilities: ['DES', 'CON', 'SAB'] },
  { name: 'Marinero', abilities: ['FUE', 'DES', 'SAB'] },
  { name: 'Mercader', abilities: ['CON', 'INT', 'CAR'] },
  { name: 'Noble', abilities: ['FUE', 'INT', 'CAR'] },
  { name: 'Sabio', abilities: ['CON', 'INT', 'SAB'] },
  { name: 'Soldado', abilities: ['FUE', 'DES', 'CON'] },
  { name: 'Vagabundo', abilities: ['DES', 'SAB', 'CAR'] },
  { name: 'Animador', abilities: ['FUE', 'DES', 'CAR'] },
];

const STANDARD_SCORES = [15, 14, 13, 12, 10, 8];

export const CharacterCreatorView: React.FC<Props> = ({ onComplete, onCancel }) => {
  const [currentStep, setCurrentStep] = useState<number>(1);

  // Form State
  const [name, setName] = useState('Elandor Hojaverde');
  const [epithet, setEpithet] = useState('Centinela del Bosque Esmeralda');
  const [species, setSpecies] = useState('Elfo de los Bosques');
  const [speed, setSpeed] = useState(35);
  const [level, setLevel] = useState(3);
  const [alignment, setAlignment] = useState('Caótico Bueno');
  const [portraitUrl, setPortraitUrl] = useState(
    'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=600&q=80'
  );

  const [classId, setClassId] = useState<ClassId>('druida');
  const [subclass, setSubclass] = useState('Círculo de la Luna');
  const [hitDie, setHitDie] = useState('d8');

  // Ability Scores
  const [abilities, setAbilities] = useState<Record<AbilityKey, number>>({
    FUE: 15,
    DES: 14,
    CON: 13,
    INT: 12,
    SAB: 10,
    CAR: 8,
  });

  const [statMethod, setStatMethod] = useState<'standard' | '4d6' | 'manual'>('standard');
  const [scorePool, setScorePool] = useState(() =>
    STANDARD_SCORES.map((score, index) => ({ id: `standard-${index}`, score, dice: [] as number[] })),
  );
  const [scoreAssignments, setScoreAssignments] = useState<Record<AbilityKey, string>>({
    FUE: 'standard-0',
    DES: 'standard-1',
    CON: 'standard-2',
    INT: 'standard-3',
    SAB: 'standard-4',
    CAR: 'standard-5',
  });
  const [backgroundAbilityChoices, setBackgroundAbilityChoices] = useState<AbilityKey[]>(['CON', 'SAB', 'CAR']);
  const [backgroundIncreaseMode, setBackgroundIncreaseMode] = useState<'2+1' | '1+1+1'>('2+1');
  const [twoPointAbility, setTwoPointAbility] = useState<AbilityKey>('SAB');
  const [onePointAbility, setOnePointAbility] = useState<AbilityKey>('CON');
  const [threePointAbilities, setThreePointAbilities] = useState<AbilityKey[]>(['CON', 'SAB', 'CAR']);
  const [rollLogs, setRollLogs] = useState<Record<string, number[]>>({});

  // Background & Skills
  const [background, setBackground] = useState('Ermitaño');
  const [customBackgroundName, setCustomBackgroundName] = useState('');
  const [selectedSkills, setSelectedSkills] = useState<string[]>([
    'Percepción',
    'Supervivencia',
    'Trato con Animales',
    'Medicina',
  ]);

  // Equipment & Homebrew
  const [armorType, setArmorType] = useState('Pieles & Escudo');
  const [baseAC, setBaseAC] = useState(15);

  const [spellsList, setSpellsList] = useState<string[]>(['Producir Llama • Truco']);
  const [newSpellName, setNewSpellName] = useState('');
  const [newSpellLevel, setNewSpellLevel] = useState('Truco');

  const getMod = (score: number) => Math.floor((score - 10) / 2);
  const formatMod = (mod: number) => (mod >= 0 ? `+${mod}` : `${mod}`);

  const getBackgroundAbilities = (name: string) =>
    BACKGROUNDS.find((entry) => entry.name === name)?.abilities
      ?? (name === 'Personalizado' ? backgroundAbilityChoices : []);

  const selectBackground = (name: string) => {
    setBackground(name);
    const choices = BACKGROUNDS.find((entry) => entry.name === name)?.abilities;
    if (choices) {
      setBackgroundAbilityChoices(choices);
      setTwoPointAbility(choices[0]);
      setOnePointAbility(choices[1]);
      setThreePointAbilities(choices);
    }
  };

  const getAbilityIncreases = (): Partial<Record<AbilityKey, number>> => {
    const choices = getBackgroundAbilities(background);
    if (background === 'Personalizado' && choices.length !== 3) return {};
    if (backgroundIncreaseMode === '2+1') {
      if (!choices.includes(twoPointAbility) || !choices.includes(onePointAbility)
        || twoPointAbility === onePointAbility
        || abilities[twoPointAbility] + 2 > 20
        || abilities[onePointAbility] + 1 > 20) return {};
      return { [twoPointAbility]: 2, [onePointAbility]: 1 };
    }
    if (threePointAbilities.length !== 3 || new Set(threePointAbilities).size !== 3
      || threePointAbilities.some((ability) => !choices.includes(ability) || abilities[ability] + 1 > 20)) return {};
    return Object.fromEntries(threePointAbilities.map((ability) => [ability, 1])) as Partial<Record<AbilityKey, number>>;
  };

  const abilityIncreases = getAbilityIncreases();
  const finalAbilities = Object.fromEntries(ABILITY_KEYS.map((ability) => [
    ability,
    Math.min(20, abilities[ability] + (abilityIncreases[ability] ?? 0)),
  ])) as Record<AbilityKey, number>;

  const assignScore = (ability: AbilityKey, scoreId: string) => {
    const occupiedBy = ABILITY_KEYS.find((key) => key !== ability && scoreAssignments[key] === scoreId);
    const currentScoreId = scoreAssignments[ability];
    const score = scorePool.find((entry) => entry.id === scoreId)?.score;
    if (score == null) return;
    setScoreAssignments((current) => ({
      ...current,
      [ability]: scoreId,
      ...(occupiedBy && currentScoreId ? { [occupiedBy]: currentScoreId } : {}),
    }));
    const displacedScore = scorePool.find((entry) => entry.id === currentScoreId)?.score;
    setAbilities((current) => ({
      ...current,
      [ability]: score,
      ...(occupiedBy && displacedScore != null ? { [occupiedBy]: displacedScore } : {}),
    }));
  };

  const useStandardArray = () => {
    const pool = STANDARD_SCORES.map((score, index) => ({
      id: `standard-${index}`,
      score,
      dice: [] as number[],
    }));
    const assignments = Object.fromEntries(ABILITY_KEYS.map((ability, index) => [ability, pool[index].id])) as Record<AbilityKey, string>;
    setStatMethod('standard');
    setScorePool(pool);
    setScoreAssignments(assignments);
    setAbilities(Object.fromEntries(ABILITY_KEYS.map((ability, index) => [ability, pool[index].score])) as Record<AbilityKey, number>);
    setRollLogs({});
  };

  const useManualScores = () => {
    setStatMethod('manual');
    setRollLogs({});
  };

  const roll4d6Scores = () => {
    const rolls = ABILITY_KEYS.map((_, index) => {
      const dice = Array.from({ length: 4 }, () => Math.floor(Math.random() * 6) + 1);
      return {
        id: `roll-${Date.now()}-${index}`,
        dice,
        score: dice.slice().sort((a, b) => b - a).slice(0, 3).reduce((sum, die) => sum + die, 0),
      };
    });
    const assignments = Object.fromEntries(ABILITY_KEYS.map((ability, index) => [ability, rolls[index].id])) as Record<AbilityKey, string>;
    setStatMethod('4d6');
    setScorePool(rolls);
    setScoreAssignments(assignments);
    setAbilities(Object.fromEntries(ABILITY_KEYS.map((ability, index) => [ability, rolls[index].score])) as Record<AbilityKey, number>);
    setRollLogs(Object.fromEntries(rolls.map((roll, index) => [ABILITY_KEYS[index], roll.dice])));
  };

  const ALL_SKILLS = [
    'Acrobacias', 'Arcanos', 'Atletismo', 'Engaño', 'Historia',
    'Intimidación', 'Investigación', 'Juego de Manos', 'Medicina',
    'Naturaleza', 'Percepción', 'Perspicacia', 'Persuasión', 'Religión',
    'Sigilo', 'Supervivencia', 'Trato con Animales', 'Interpretación',
  ];

  const toggleSkill = (skill: string) => {
    if (selectedSkills.includes(skill)) {
      setSelectedSkills(selectedSkills.filter((s) => s !== skill));
    } else {
      setSelectedSkills([...selectedSkills, skill]);
    }
  };

  const handleFinish = () => {
    const profBonus = Math.floor((level - 1) / 4) + 2;
    if (ABILITY_KEYS.some((ability) =>
      !Number.isInteger(abilities[ability]) || abilities[ability] < 1 || abilities[ability] > 20,
    )) {
      setCurrentStep(3);
      return;
    }
    if (Object.values(abilityIncreases).reduce((total, amount) => total + amount, 0) !== 3) {
      setCurrentStep(4);
      return;
    }
    const conMod = getMod(finalAbilities.CON);
    const dieNum = getDieSize(hitDie);
    const maxHp = dieNum + conMod + (level - 1) * (Math.floor(dieNum / 2) + 1 + conMod);

    const newSheet: CharacterSheet = {
      id: `char-${Date.now()}`,
      name: name.trim() || 'Héroe Nuevo',
      epithet: epithet.trim() || 'Aventurero Novicio',
      classId,
      subclass: subclass.trim() || 'Círculo Primordial',
      level,
      xp: 0,
      species,
      alignment,
      background: background === 'Personalizado' ? customBackgroundName.trim() || 'Personalizado' : background,
      portraitUrl,
      inspiration: true,
      elementalAffinity: 'normal',

      armorClass: baseAC,
      manualArmorClass: true,
      armorTypeDescription: armorType,
      initiativeBonus: getMod(finalAbilities.DES),
      speed,
      proficiencyBonus: profBonus,

      hitPoints: { current: Math.max(1, maxHp), max: Math.max(1, maxHp), temp: 0 },
      hitDice: { die: `${level}${hitDie}`, current: level, max: level },
      deathSaves: { successes: 0, failures: 0 },

      abilities: {
        FUE: { key: 'FUE', label: 'Fuerza', score: finalAbilities.FUE, proficientSave: false },
        DES: { key: 'DES', label: 'Destreza', score: finalAbilities.DES, proficientSave: false },
        CON: { key: 'CON', label: 'Constitución', score: finalAbilities.CON, proficientSave: false },
        INT: { key: 'INT', label: 'Inteligencia', score: finalAbilities.INT, proficientSave: classId === 'mago' },
        SAB: { key: 'SAB', label: 'Sabiduría', score: finalAbilities.SAB, proficientSave: classId === 'druida' || classId === 'clerigo' },
        CAR: { key: 'CAR', label: 'Carisma', score: finalAbilities.CAR, proficientSave: classId === 'bardo' || classId === 'paladin' || classId === 'hechicero' || classId === 'brujo' },
      },

      skills: ALL_SKILLS.map((skillName) => ({
        name: skillName,
        ability: abilityForSkill(skillName, 'INT'),
        level: selectedSkills.includes(skillName) ? 'proficient' : 'none',
      })),

      activeConditions: [],
      exhaustion: 0,
      defenses: { resistances: [], vulnerabilities: [], immunities: [] },
      inventory: [],
      currency: { cp: 0, sp: 0, ep: 0, gp: 50, pp: 0 },
      carryingCapacityMax: finalAbilities.FUE * 15,
      attunementSlotsUsed: 0,

      spellcastingAbility: classId === 'mago' ? 'INT' : classId === 'druida' || classId === 'clerigo' ? 'SAB' : 'CAR',
      spellSaveDC: 8 + profBonus + getMod(finalAbilities.SAB),
      spellAttackBonus: profBonus + getMod(finalAbilities.SAB),
      spellSlots: spellSlotsForClassLevel(classId, level),
      knownSpells: spellsList.map((s, i) => ({
        id: `sp-${i}`,
        name: s,
        level: 1,
        school: 'Evocación',
        castTime: '1 Acción',
        range: '60 ft',
        description: 'Hechizo de héroe recién preparado.',
        prepared: true,
      })),
      weapons: [],
      features: [],
      classResources: {},
      cards: [],
    };

    onComplete(newSheet);
  };

  const steps = [
    { num: 1, label: 'Especie', icon: <User className="h-4 w-4" /> },
    { num: 2, label: 'Clase', icon: <Shield className="h-4 w-4" /> },
    { num: 3, label: 'Características', icon: <Dices className="h-4 w-4" /> },
    { num: 4, label: 'Trasfondo', icon: <BookOpen className="h-4 w-4" /> },
    { num: 5, label: 'Equipo', icon: <Swords className="h-4 w-4" /> },
  ];

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* 1. Stepper Tabs Header */}
      <ClassWidgetFrame classId={classId} className="p-4 shadow-xl">
        <div className="flex items-center justify-between mb-3 text-xs opacity-75">
          <span className="font-cinzel font-bold">Asistente de Creación de Personaje</span>
          <span className="font-mono">Paso {currentStep} de 5: {steps[currentStep - 1].label}</span>
        </div>

        <div className="grid grid-cols-5 gap-2">
          {steps.map((st) => {
            const isActive = currentStep === st.num;
            const isCompleted = currentStep > st.num;
            return (
              <button
                key={st.num}
                onClick={() => setCurrentStep(st.num)}
                className={`flex flex-col sm:flex-row items-center justify-center gap-2 p-2.5 rounded-xl border text-xs font-semibold transition cursor-pointer ${
                  isActive
                    ? 'border-amber-400 bg-amber-400/20 text-amber-200 shadow-sm font-bold'
                    : isCompleted
                    ? 'border-white/20 bg-black/40 text-white'
                    : 'border-white/10 bg-black/20 opacity-50'
                }`}
              >
                <span>{st.icon}</span>
                <span className="hidden sm:inline font-cinzel">{st.label}</span>
              </button>
            );
          })}
        </div>
      </ClassWidgetFrame>

      {/* 2. Main Two-Column Layout: Left Form + Right Live Sheet Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Form: 7 cols */}
        <ClassWidgetFrame classId={classId} className="lg:col-span-7 p-6 shadow-xl space-y-4">
          {/* STEP 1: Especie & Identidad */}
          {currentStep === 1 && (
            <div className="space-y-4 text-xs">
              <div className="border-b border-zinc-800 pb-2">
                <h3 className="font-cinzel text-base font-bold text-zinc-100">
                  Paso 1: Especie & Identidad
                </h3>
                <span className="text-[11px] text-zinc-400">Totalmente editable en cualquier momento</span>
              </div>

              <div>
                <label className="text-zinc-300 font-semibold block mb-1">Nombre del Héroe:</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-white font-medium"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-zinc-300 font-semibold block mb-1">Especie / Raza:</label>
                  <input
                    type="text"
                    value={species}
                    onChange={(e) => setSpecies(e.target.value)}
                    className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="text-zinc-300 font-semibold block mb-1">Epíteto o Título:</label>
                  <input
                    type="text"
                    value={epithet}
                    onChange={(e) => setEpithet(e.target.value)}
                    className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-zinc-300 font-semibold block mb-1">Velocidad (Pies):</label>
                  <input
                    type="number"
                    value={speed}
                    onChange={(e) => setSpeed(parseInt(e.target.value) || 30)}
                    className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-white text-center font-mono"
                  />
                </div>
                <div>
                  <label className="text-zinc-300 font-semibold block mb-1">Nivel Inicial:</label>
                  <input
                    type="number"
                    min="1"
                    max="20"
                    value={level}
                    onChange={(e) => setLevel(parseInt(e.target.value) || 1)}
                    className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-white text-center font-mono"
                  />
                </div>
                <div>
                  <label className="text-zinc-300 font-semibold block mb-1">Alineamiento:</label>
                  <select
                    value={alignment}
                    onChange={(e) => setAlignment(e.target.value)}
                    className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-2 py-2 text-white"
                  >
                    <option value="Legal Bueno">Legal Bueno</option>
                    <option value="Neutral Bueno">Neutral Bueno</option>
                    <option value="Caótico Bueno">Caótico Bueno</option>
                    <option value="Legal Neutral">Legal Neutral</option>
                    <option value="Neutral Auténtico">Neutral Auténtico</option>
                    <option value="Caótico Neutral">Caótico Neutral</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-zinc-300 font-semibold block mb-1">URL del Retrato o Avatar:</label>
                <input
                  type="text"
                  value={portraitUrl}
                  onChange={(e) => setPortraitUrl(e.target.value)}
                  className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-white text-xs font-mono"
                />
              </div>
            </div>
          )}

          {/* STEP 2: Selección de Clase */}
          {currentStep === 2 && (
            <div className="space-y-4 text-xs">
              <div className="border-b border-zinc-800 pb-2 flex items-center justify-between">
                <div>
                  <h3 className="font-cinzel text-base font-bold text-zinc-100">
                    Paso 2: Selección de Clase
                  </h3>
                  <span className="text-[11px] text-zinc-400">Adapta la paleta visual, mecánicas y marcos</span>
                </div>
              </div>

              {/* Class Buttons Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {Object.values(CLASS_THEMES).map((theme) => {
                  const isSelected = classId === theme.id;
                  return (
                    <button
                      key={theme.id}
                      onClick={() => setClassId(theme.id)}
                      className={`p-3 rounded-xl border text-left transition cursor-pointer ${
                        isSelected
                          ? 'border-emerald-400 bg-emerald-950/40 shadow-[0_0_12px_rgba(16,185,129,0.3)]'
                          : 'border-zinc-800 bg-zinc-900/60 hover:border-zinc-700'
                      }`}
                    >
                      <div className="font-cinzel font-bold text-zinc-100 text-xs mb-1">
                        {theme.name}
                      </div>
                      <div className="text-[10px] text-zinc-400 line-clamp-1">{theme.subtitle}</div>
                    </button>
                  );
                })}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="text-zinc-300 font-semibold block mb-1">Subclase / Especialidad:</label>
                  <input
                    type="text"
                    value={subclass}
                    onChange={(e) => setSubclass(e.target.value)}
                    className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="text-zinc-300 font-semibold block mb-1">Dado de Golpe:</label>
                  <select
                    value={hitDie}
                    onChange={(e) => setHitDie(e.target.value)}
                    className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-white"
                  >
                    <option value="d6">d6 (Mago, Hechicero)</option>
                    <option value="d8">d8 (Bardo, Clérigo, Druida, Pícaro, Monje, Brujo, Artífice)</option>
                    <option value="d10">d10 (Guerrero, Paladín, Explorador)</option>
                    <option value="d12">d12 (Bárbaro)</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Características */}
          {currentStep === 3 && (
            <div className="space-y-4 text-xs">
              <div className="border-b border-zinc-800 pb-2 flex items-center justify-between">
                <div>
                  <h3 className="font-cinzel text-base font-bold text-zinc-100">
                    Paso 3: Puntuaciones de Característica
                  </h3>
                  <span className="text-[11px] text-zinc-400">Asigna tus 6 características principales</span>
                </div>

                <div className="flex items-center gap-1 bg-zinc-900 p-1 rounded-lg border border-zinc-800">
                  <button
                    type="button"
                    onClick={useStandardArray}
                    className={`px-2 py-0.5 rounded text-[10px] ${
                      statMethod === 'standard' ? 'bg-zinc-700 text-white font-bold' : 'text-zinc-400'
                    }`}
                  >
                    Estándar (15, 14, 13, 12, 10, 8)
                  </button>
                  <button
                    type="button"
                    onClick={roll4d6Scores}
                    className={`px-2 py-0.5 rounded text-[10px] ${
                      statMethod === '4d6' ? 'bg-zinc-700 text-white font-bold' : 'text-zinc-400'
                    }`}
                  >
                    Tirar 4d6 seis veces
                  </button>
                  <button
                    type="button"
                    onClick={useManualScores}
                    className={`px-2 py-0.5 rounded text-[10px] ${
                      statMethod === 'manual' ? 'bg-zinc-700 text-white font-bold' : 'text-zinc-400'
                    }`}
                  >
                    Personalizadas
                  </button>
                </div>
              </div>

              <div className="rounded-lg border border-zinc-800 bg-black/20 p-3">
                <p className="mb-2 text-[11px] text-zinc-300">
                  {statMethod === 'manual'
                    ? 'Introduce manualmente las puntuaciones base (de 1 a 20).'
                    : statMethod === 'standard'
                    ? 'Matriz estándar. Asigna cada puntuación una sola vez.'
                    : 'Cada tirada suma los tres dados más altos; puedes reasignar las seis puntuaciones.'}
                </p>
                {ABILITY_KEYS.some((ability) =>
                  !Number.isInteger(abilities[ability]) || abilities[ability] < 1 || abilities[ability] > 20,
                ) && (
                  <p role="alert" className="mb-2 text-[10px] text-rose-300">
                    Cada puntuación personalizada debe ser un número entero entre 1 y 20.
                  </p>
                )}
                {statMethod !== 'manual' && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {scorePool.map((entry) => (
                      <div key={entry.id} className="rounded border border-white/10 bg-zinc-900/70 px-2 py-1 text-center">
                        <span className="font-mono font-bold text-emerald-300">{entry.score}</span>
                        {entry.dice.length > 0 && (
                          <span className="ml-1 text-[9px] text-zinc-400">[{entry.dice.join(', ')}; descarta {Math.min(...entry.dice)}]</span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {ABILITY_KEYS.map((key) => {
                  const val = abilities[key];
                  const mod = getMod(val);
                  return (
                    <div key={key} className="rounded-xl border border-zinc-800 bg-[#161828] p-3 text-center">
                      <span className="font-cinzel font-bold text-zinc-300 block mb-1">{key}</span>
                      <div className="font-cinzel text-2xl font-bold text-emerald-400">{val} <span className="text-xs">({formatMod(mod)})</span></div>
                      {finalAbilities[key] !== val && (
                        <div className="text-[10px] text-amber-300">
                          Trasfondo +{finalAbilities[key] - val} → {finalAbilities[key]}
                        </div>
                      )}
                      {statMethod === 'manual' ? (
                        <input
                          type="number"
                          min="1"
                          max="20"
                          value={val}
                          onChange={(e) => {
                            const value = Number(e.target.value);
                            setAbilities((current) => ({
                              ...current,
                              [key]: e.target.value === '' ? 0 : value,
                            }));
                          }}
                          className="mt-2 w-full rounded border border-zinc-700 bg-zinc-900 px-2 py-1 text-center font-bold text-white text-xs"
                          aria-label={`Puntuación personalizada de ${key}`}
                        />
                      ) : (
                        <select
                          value={scoreAssignments[key]}
                          onChange={(e) => assignScore(key, e.target.value)}
                          className="mt-2 w-full rounded border border-zinc-700 bg-zinc-900 px-2 py-1 text-center font-bold text-white text-xs"
                          aria-label={`Puntuación base de ${key}`}
                        >
                          {scorePool.map((entry) => (
                            <option key={entry.id} value={entry.id}>
                              {entry.score}
                            </option>
                          ))}
                        </select>
                      )}
                      {rollLogs[key] && (
                        <span className="mt-1 block text-[9px] text-zinc-500 font-mono">
                          Tirada: [{rollLogs[key].join(', ')}], se descarta {Math.min(...rollLogs[key])}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 4: Trasfondo & Disciplinas */}
          {currentStep === 4 && (
            <div className="space-y-4 text-xs">
              <div className="border-b border-zinc-800 pb-2">
                <h3 className="font-cinzel text-base font-bold text-zinc-100">
                  Paso 4: Trasfondo & Disciplinas
                </h3>
                <span className="text-[11px] text-zinc-400">Selecciona competencias en habilidades</span>
              </div>

              <div className="space-y-3 rounded-xl border border-zinc-800 bg-[#161828] p-3">
                <div>
                  <label className="text-zinc-300 font-semibold block mb-1">Trasfondo 2024:</label>
                  <select
                    value={background}
                    onChange={(e) => selectBackground(e.target.value)}
                    className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-white"
                  >
                    {BACKGROUNDS.map((entry) => <option key={entry.name} value={entry.name}>{entry.name}</option>)}
                    <option value="Personalizado">Personalizado</option>
                  </select>
                  {background === 'Personalizado' && (
                    <>
                      <input
                        type="text"
                        value={customBackgroundName}
                        onChange={(e) => setCustomBackgroundName(e.target.value)}
                        placeholder="Nombre de trasfondo personalizado"
                        className="mt-2 w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-white"
                      />
                      <p className="mt-2 text-[10px] text-zinc-400">Elige las tres características que permite este trasfondo:</p>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {ABILITY_KEYS.map((ability) => (
                          <label key={ability} className="flex items-center gap-1 text-zinc-300">
                            <input
                              type="checkbox"
                              checked={backgroundAbilityChoices.includes(ability)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  if (backgroundAbilityChoices.length < 3) {
                                    setBackgroundAbilityChoices((current) => [...current, ability]);
                                  }
                                } else {
                                  setBackgroundAbilityChoices((current) => current.filter((choice) => choice !== ability));
                                  setThreePointAbilities((current) => current.filter((choice) => choice !== ability));
                                }
                              }}
                            />
                            {ability}
                          </label>
                        ))}
                      </div>
                      <p className="mt-1 text-[10px] text-zinc-400">Seleccionadas: {backgroundAbilityChoices.length}/3</p>
                    </>
                  )}
                </div>

                <div>
                  <p className="text-zinc-300 font-semibold mb-2">Aumentos de característica del trasfondo:</p>
                  <div className="flex flex-wrap gap-4 mb-2">
                    <label className="flex items-center gap-1 text-zinc-300">
                      <input type="radio" checked={backgroundIncreaseMode === '2+1'} onChange={() => setBackgroundIncreaseMode('2+1')} />
                      +2 a una y +1 a otra
                    </label>
                    <label className="flex items-center gap-1 text-zinc-300">
                      <input type="radio" checked={backgroundIncreaseMode === '1+1+1'} onChange={() => setBackgroundIncreaseMode('1+1+1')} />
                      +1 a tres distintas
                    </label>
                  </div>

                  {backgroundIncreaseMode === '2+1' ? (
                    <div className="grid grid-cols-2 gap-2">
                      {([
                        ['Aumentar +2', twoPointAbility, setTwoPointAbility, 2],
                        ['Aumentar +1', onePointAbility, setOnePointAbility, 1],
                      ] as const).map(([label, selected, setSelected, amount]) => (
                        <label key={label} className="text-[10px] text-zinc-400">
                          {label}
                          <select value={selected} onChange={(e) => setSelected(e.target.value as AbilityKey)} className="mt-1 w-full rounded border border-zinc-700 bg-zinc-900 px-2 py-1.5 text-white">
                            {getBackgroundAbilities(background).map((ability) => (
                              <option key={ability} value={ability} disabled={
                                (amount === 2 && ability === onePointAbility)
                                || (amount === 1 && ability === twoPointAbility)
                                || abilities[ability] + amount > 20
                              }>
                                {ability} · base {abilities[ability]}
                              </option>
                            ))}
                          </select>
                        </label>
                      ))}
                    </div>
                  ) : (
                    <div className="grid grid-cols-3 gap-2">
                      {getBackgroundAbilities(background).map((ability) => (
                        <label key={ability} className={`flex items-center gap-1 rounded border px-2 py-1.5 ${threePointAbilities.includes(ability) ? 'border-emerald-500/50 text-emerald-200' : 'border-zinc-700 text-zinc-400'}`}>
                          <input
                            type="checkbox"
                            checked={threePointAbilities.includes(ability)}
                            disabled={!threePointAbilities.includes(ability) && threePointAbilities.length >= 3}
                            onChange={(e) => setThreePointAbilities((current) =>
                              e.target.checked
                                ? [...current, ability]
                                : current.filter((choice) => choice !== ability),
                            )}
                          />
                          {ability} {abilities[ability]}→{Math.min(20, abilities[ability] + 1)}
                        </label>
                      ))}
                    </div>
                  )}
                  {(Object.values(abilityIncreases).reduce((total, amount) => total + amount, 0) !== 3
                    || (background === 'Personalizado' && backgroundAbilityChoices.length !== 3)) && (
                    <p role="alert" className="mt-2 text-[10px] text-rose-300">
                      Completa una combinación válida de aumentos; ninguna puntuación puede superar 20.
                      {background === 'Personalizado' && backgroundAbilityChoices.length !== 3 ? ' Selecciona exactamente tres características permitidas.' : ''}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <span className="text-zinc-300 font-semibold block mb-2 font-cinzel">
                  Competencias en Habilidades ({selectedSkills.length} seleccionadas):
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-56 overflow-y-auto pr-1">
                  {ALL_SKILLS.map((sk) => {
                    const isChecked = selectedSkills.includes(sk);
                    return (
                      <button
                        key={sk}
                        onClick={() => toggleSkill(sk)}
                        className={`p-2 rounded-lg border text-left flex items-center justify-between transition cursor-pointer ${
                          isChecked
                            ? 'border-emerald-400 bg-emerald-950/40 text-emerald-200'
                            : 'border-zinc-800 bg-zinc-900/40 text-zinc-400'
                        }`}
                      >
                        <span className="truncate">{sk}</span>
                        {isChecked && <Check className="h-3.5 w-3.5 text-emerald-400 shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* STEP 5: Equipo & Magias */}
          {currentStep === 5 && (
            <div className="space-y-4 text-xs">
              <div className="border-b border-zinc-800 pb-2">
                <h3 className="font-cinzel text-base font-bold text-zinc-100">
                  Paso 5: Equipo
                </h3>
                <span className="text-[11px] text-zinc-400">Personalización completa para engarzar</span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-zinc-300 font-semibold block mb-1">Tipo de Armadura:</label>
                  <input
                    type="text"
                    value={armorType}
                    onChange={(e) => setArmorType(e.target.value)}
                    className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="text-zinc-300 font-semibold block mb-1">Clase de Armadura (CA Base):</label>
                  <input
                    type="number"
                    value={baseAC}
                    onChange={(e) => setBaseAC(parseInt(e.target.value) || 10)}
                    className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-white text-center font-mono"
                  />
                </div>
              </div>

            </div>
          )}

          {/* Stepper Navigation Buttons */}
          <div className="flex items-center justify-between pt-4 border-t border-zinc-800">
            <button
              onClick={() => setCurrentStep((prev) => Math.max(1, prev - 1))}
              disabled={currentStep === 1}
              className="flex items-center gap-1.5 rounded-lg px-4 py-2 text-xs font-semibold text-zinc-400 hover:text-white disabled:opacity-30 cursor-pointer"
            >
              <ChevronLeft className="h-4 w-4" />
              <span>Anterior</span>
            </button>

            <button onClick={onCancel} className="text-xs text-zinc-500 hover:text-zinc-300">
              Cancelar
            </button>

            {currentStep < 5 ? (
              <button
                onClick={() => setCurrentStep((prev) => Math.min(5, prev + 1))}
                className="flex items-center gap-1.5 rounded-xl bg-purple-700 hover:bg-purple-600 px-5 py-2 text-xs font-bold text-white shadow-md transition cursor-pointer"
              >
                <span>Siguiente Paso</span>
                <ChevronRight className="h-4 w-4" />
              </button>
            ) : (
              <button
                onClick={handleFinish}
                className="flex items-center gap-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 px-5 py-2 text-xs font-bold text-stone-950 shadow-lg transition cursor-pointer"
              >
                <Sparkles className="h-4 w-4" />
                <span>Engarzar a la Hoja</span>
              </button>
            )}
          </div>
        </ClassWidgetFrame>

        {/* Right Preview: 5 cols (Sticky Live Character Preview Sheet) */}
        <ClassWidgetFrame classId={classId} className="lg:col-span-5 p-5 shadow-2xl space-y-4 sticky top-20">
          <div className="flex items-center justify-between border-b border-white/10 pb-2">
            <span className="font-cinzel text-xs font-bold uppercase tracking-wider">
              Vista Previa Lista Para Jugar
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => window.print()}
                className="flex items-center gap-1 text-[11px] opacity-75 hover:opacity-100 cursor-pointer"
              >
                <Printer className="h-3 w-3" />
                <span>Imprimir</span>
              </button>
            </div>
          </div>

          {/* Mini Sheet Preview Card */}
          <ClassSubCard classId={classId} className="p-4 space-y-3">
            <div className="flex items-center gap-3">
              <img
                src={portraitUrl}
                alt="Portrait"
                className="h-12 w-12 rounded-full object-cover border border-amber-400"
              />
              <div>
                <span className="text-[10px] text-amber-400 font-bold uppercase block">{epithet}</span>
                <h4 className="font-cinzel text-sm font-bold">{name}</h4>
                <div className="text-[11px] opacity-75">
                  Nv. {level} • {CLASS_THEMES[classId]?.name || 'Clase'} ({subclass})
                </div>
              </div>
            </div>

            {/* Core Stats */}
            <div className="grid grid-cols-4 gap-2 text-center text-xs py-2 border-y border-white/10">
              <div>
                <span className="text-[9px] opacity-75 block">CA</span>
                <span className="font-bold font-mono">{baseAC}</span>
              </div>
              <div>
                <span className="text-[9px] opacity-75 block">INICIATIVA</span>
                <span className="font-bold font-mono">{formatMod(getMod(finalAbilities.DES))}</span>
              </div>
              <div>
                <span className="text-[9px] opacity-75 block">VELOCIDAD</span>
                <span className="font-bold font-mono">{speed} ft</span>
              </div>
              <div>
                <span className="text-[9px] opacity-75 block">COMPETENCIA</span>
                <span className="font-bold font-mono">+{Math.floor((level - 1) / 4) + 2}</span>
              </div>
            </div>

            {/* Modifiers */}
            <div className="grid grid-cols-6 gap-1 text-center">
              {(['FUE', 'DES', 'CON', 'INT', 'SAB', 'CAR'] as AbilityKey[]).map((k) => (
                <div key={k} className="p-1 rounded bg-black/40 border border-white/10">
                  <span className="text-[8px] opacity-75 block font-mono">{k}</span>
                  <span className="text-xs font-bold font-mono">{finalAbilities[k]}</span>
                  <span className="text-[9px] block font-mono font-semibold">{formatMod(getMod(finalAbilities[k]))}</span>
                </div>
              ))}
            </div>

            {/* Marked Competencies */}
            <div className="text-[11px] opacity-80 pt-2 border-t border-white/10">
              <strong className="block mb-1">Competencias Marcadas ({selectedSkills.length}):</strong>
              <div className="line-clamp-2 italic">
                {selectedSkills.join(', ') || 'Ninguna seleccionada'}
              </div>
            </div>
          </ClassSubCard>
        </ClassWidgetFrame>
      </div>
    </div>
  );
};
