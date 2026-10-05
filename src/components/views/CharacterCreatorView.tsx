import React, { useState } from 'react';
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
    FUE: 10,
    DES: 14,
    CON: 14,
    INT: 12,
    SAB: 16,
    CAR: 8,
  });

  const [statMethod, setStatMethod] = useState<'standard' | 'pointbuy' | '4d6'>('standard');

  // Background & Skills
  const [background, setBackground] = useState('Ermitaño');
  const [selectedSkills, setSelectedSkills] = useState<string[]>([
    'Percepción',
    'Supervivencia',
    'Trato con Animales',
    'Medicina',
  ]);

  // Equipment & Homebrew
  const [armorType, setArmorType] = useState('Pieles & Escudo');
  const [baseAC, setBaseAC] = useState(15);
  const [weaponsList, setWeaponsList] = useState<string[]>(['Cimitarra de la Luna (1d6 + 3)']);
  const [newWeaponName, setNewWeaponName] = useState('');
  const [newWeaponDamage, setNewWeaponDamage] = useState('1d8+3');

  const [spellsList, setSpellsList] = useState<string[]>(['Producir Llama • Truco']);
  const [newSpellName, setNewSpellName] = useState('');
  const [newSpellLevel, setNewSpellLevel] = useState('Truco');

  const [featsList, setFeatsList] = useState<{ name: string; desc: string }[]>([
    { name: 'Adepto de la Forma Salvaje', desc: 'Ganas 1 uso adicional de Forma Salvaje por descanso corto.' },
  ]);
  const [newFeatName, setNewFeatName] = useState('');
  const [newFeatDesc, setNewFeatDesc] = useState('');

  const getMod = (score: number) => Math.floor((score - 10) / 2);
  const formatMod = (mod: number) => (mod >= 0 ? `+${mod}` : `${mod}`);

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
    const conMod = getMod(abilities.CON);
    const dieNum = parseInt(hitDie.replace(/\D/g, '')) || 8;
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
      background,
      portraitUrl,
      inspiration: true,
      elementalAffinity: 'normal',

      armorClass: baseAC,
      manualArmorClass: true,
      armorTypeDescription: armorType,
      initiativeBonus: getMod(abilities.DES),
      speed,
      proficiencyBonus: profBonus,

      hitPoints: { current: Math.max(1, maxHp), max: Math.max(1, maxHp), temp: 0 },
      hitDice: { die: `${level}${hitDie}`, current: level, max: level },
      deathSaves: { successes: 0, failures: 0 },

      abilities: {
        FUE: { key: 'FUE', label: 'Fuerza', score: abilities.FUE, proficientSave: false },
        DES: { key: 'DES', label: 'Destreza', score: abilities.DES, proficientSave: false },
        CON: { key: 'CON', label: 'Constitución', score: abilities.CON, proficientSave: false },
        INT: { key: 'INT', label: 'Inteligencia', score: abilities.INT, proficientSave: classId === 'mago' },
        SAB: { key: 'SAB', label: 'Sabiduría', score: abilities.SAB, proficientSave: classId === 'druida' || classId === 'clerigo' },
        CAR: { key: 'CAR', label: 'Carisma', score: abilities.CAR, proficientSave: classId === 'bardo' || classId === 'paladin' || classId === 'hechicero' || classId === 'brujo' },
      },

      skills: ALL_SKILLS.map((skillName) => ({
        name: skillName,
        ability: 'DES',
        level: selectedSkills.includes(skillName) ? 'proficient' : 'none',
      })),

      activeConditions: [],
      exhaustion: 0,
      defenses: { resistances: [], vulnerabilities: [], immunities: [] },
      inventory: [],
      currency: { cp: 0, sp: 0, ep: 0, gp: 50, pp: 0 },
      carryingCapacityMax: abilities.FUE * 15,
      attunementSlotsUsed: 0,

      spellcastingAbility: classId === 'mago' ? 'INT' : classId === 'druida' || classId === 'clerigo' ? 'SAB' : 'CAR',
      spellSaveDC: 8 + profBonus + getMod(abilities.SAB),
      spellAttackBonus: profBonus + getMod(abilities.SAB),
      spellSlots: [
        { level: 1, max: 4, used: 0 },
        { level: 2, max: 2, used: 0 },
        { level: 3, max: 0, used: 0 },
      ],
      knownSpells: spellsList.map((s, i) => ({
        id: `sp-${i}`,
        name: s,
        level: 1,
        school: 'Evocación',
        castTime: '1 Acción',
        range: '60 ft',
        description: 'Conjuro de héroe recién preparado.',
        prepared: true,
      })),
      weapons: weaponsList.map((w, i) => ({
        id: `wep-${i}`,
        name: w,
        attackBonus: 5,
        damage: '1d8 + 3',
        damageType: 'Cortante',
        range: '5 ft',
        properties: 'Versátil',
      })),
      features: featsList.map((f, i) => ({
        id: `feat-${i}`,
        name: f.name,
        source: 'Trasfondo & Rasgo',
        actionType: 'Pasiva',
        description: f.desc,
      })),
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
    { num: 5, label: 'Equipo & Homebrew', icon: <Swords className="h-4 w-4" /> },
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
                    onClick={() => setStatMethod('standard')}
                    className={`px-2 py-0.5 rounded text-[10px] ${
                      statMethod === 'standard' ? 'bg-zinc-700 text-white font-bold' : 'text-zinc-400'
                    }`}
                  >
                    Estándar
                  </button>
                  <button
                    onClick={() => {
                      setStatMethod('4d6');
                      setAbilities({
                        FUE: Math.floor(Math.random() * 8) + 10,
                        DES: Math.floor(Math.random() * 8) + 10,
                        CON: Math.floor(Math.random() * 8) + 10,
                        INT: Math.floor(Math.random() * 8) + 10,
                        SAB: Math.floor(Math.random() * 8) + 10,
                        CAR: Math.floor(Math.random() * 8) + 10,
                      });
                    }}
                    className={`px-2 py-0.5 rounded text-[10px] ${
                      statMethod === '4d6' ? 'bg-zinc-700 text-white font-bold' : 'text-zinc-400'
                    }`}
                  >
                    Tirada 4d6
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {(['FUE', 'DES', 'CON', 'INT', 'SAB', 'CAR'] as AbilityKey[]).map((key) => {
                  const val = abilities[key];
                  const mod = getMod(val);
                  return (
                    <div key={key} className="rounded-xl border border-zinc-800 bg-[#161828] p-3 text-center">
                      <span className="font-cinzel font-bold text-zinc-300 block mb-1">{key}</span>
                      <div className="font-cinzel text-2xl font-bold text-emerald-400">{formatMod(mod)}</div>
                      <input
                        type="number"
                        min="1"
                        max="20"
                        value={val}
                        onChange={(e) =>
                          setAbilities({ ...abilities, [key]: parseInt(e.target.value) || 10 })
                        }
                        className="w-16 mx-auto mt-2 rounded border border-zinc-700 bg-zinc-900 py-1 text-center font-bold text-white text-xs"
                      />
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

              <div>
                <label className="text-zinc-300 font-semibold block mb-1">Trasfondo Heroico:</label>
                <input
                  type="text"
                  value={background}
                  onChange={(e) => setBackground(e.target.value)}
                  className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-white"
                />
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

          {/* STEP 5: Equipo, Armas, Dotes & Magias */}
          {currentStep === 5 && (
            <div className="space-y-4 text-xs">
              <div className="border-b border-zinc-800 pb-2">
                <h3 className="font-cinzel text-base font-bold text-zinc-100">
                  Paso 5: Equipo, Armas, Dotes & Magias
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

              {/* Weapons list */}
              <div>
                <label className="text-zinc-300 font-semibold block mb-1 font-cinzel">Armas & Ataques:</label>
                <div className="flex items-center gap-2 mb-2">
                  <input
                    type="text"
                    placeholder="Nombre del arma homebrew..."
                    value={newWeaponName}
                    onChange={(e) => setNewWeaponName(e.target.value)}
                    className="flex-1 rounded border border-zinc-700 bg-zinc-900 px-2.5 py-1.5 text-white text-xs"
                  />
                  <button
                    onClick={() => {
                      if (newWeaponName.trim()) {
                        setWeaponsList([...weaponsList, `${newWeaponName.trim()} (${newWeaponDamage})`]);
                        setNewWeaponName('');
                      }
                    }}
                    className="rounded bg-emerald-600 px-3 py-1.5 font-bold text-stone-950"
                  >
                    + Añadir
                  </button>
                </div>
                <div className="space-y-1">
                  {weaponsList.map((w, idx) => (
                    <div key={idx} className="p-2 rounded bg-zinc-900 border border-zinc-800 text-zinc-200">
                      {w}
                    </div>
                  ))}
                </div>
              </div>

              {/* Starter Feat */}
              <div>
                <label className="text-zinc-300 font-semibold block mb-1 font-cinzel">
                  Dotes (Feats) & Rasgos Especiales:
                </label>
                <div className="space-y-1.5">
                  {featsList.map((f, i) => (
                    <div key={i} className="p-2.5 rounded-lg border border-zinc-800 bg-zinc-900/60">
                      <strong className="text-zinc-200 block font-cinzel">{f.name}</strong>
                      <p className="text-[11px] text-zinc-400">{f.desc}</p>
                    </div>
                  ))}
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
                <span className="font-bold font-mono">{formatMod(getMod(abilities.DES))}</span>
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
                  <span className="text-xs font-bold font-mono">{abilities[k]}</span>
                  <span className="text-[9px] block font-mono font-semibold">{formatMod(getMod(abilities[k]))}</span>
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
