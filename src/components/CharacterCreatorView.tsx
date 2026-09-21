import React, { useState } from 'react';
import { CharacterSheet, AbilityCode, ClassKey, WeaponItem, ArmorItem, SpellDefinition, FeatDefinition } from '../types';
import { CLASS_THEMES } from '../themes';

interface CharacterCreatorViewProps {
  onCharacterCreated: (character: CharacterSheet, classKey: ClassKey) => void;
  onCancel: () => void;
}

export const CharacterCreatorView: React.FC<CharacterCreatorViewProps> = ({
  onCharacterCreated,
  onCancel,
}) => {
  const [currentStep, setCurrentStep] = useState<number>(1);

  // Step 1: Identity & Species / Race (Homebrew friendly)
  const [name, setName] = useState('Elandor Hojaverde');
  const [epithet, setEpithet] = useState('Centinela del Bosque Esmeralda');
  const [race, setRace] = useState('Elfo de los Bosques');
  const [isHomebrewRace, setIsHomebrewRace] = useState(false);
  const [speedFeet, setSpeedFeet] = useState(35);
  const [portraitUrl, setPortraitUrl] = useState(
    'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=600&q=80'
  );
  const [alignment, setAlignment] = useState('Caótico Bueno');
  const [level, setLevel] = useState(3);

  // Step 2: Class & Subclass (Any D&D class + Homebrew)
  const [selectedClassKey, setSelectedClassKey] = useState<ClassKey>('druida');
  const [subclass, setSubclass] = useState('Círculo de la Luna');
  const [hitDie, setHitDie] = useState('d8');

  // Step 3: Ability Scores & Allocation Mode
  // Modes: '4d6' | 'pointbuy' | 'standard' | 'manual'
  const [scoreMode, setScoreMode] = useState<'4d6' | 'pointbuy' | 'standard' | 'manual'>('standard');
  const [scores, setScores] = useState({
    FUE: 10,
    DES: 14,
    CON: 14,
    INT: 12,
    SAB: 16,
    CAR: 8,
  });

  // 4d6 roll log
  const [rollLogs, setRollLogs] = useState<Record<string, number[]>>({});

  // Point Buy tracking (27 points total, scores from 8 to 15)
  // Costs: 8:0, 9:1, 10:2, 11:3, 12:4, 13:5, 14:7, 15:9
  const POINT_BUY_COSTS: Record<number, number> = {
    8: 0,
    9: 1,
    10: 2,
    11: 3,
    12: 4,
    13: 5,
    14: 7,
    15: 9,
  };

  const calculatePointBuySpent = (currentScores: typeof scores) => {
    return Object.values(currentScores).reduce((acc, val) => {
      return acc + (POINT_BUY_COSTS[val] ?? (val > 15 ? 9 + (val - 15) * 2 : 0));
    }, 0);
  };

  const pointsSpent = calculatePointBuySpent(scores);
  const pointsRemaining = 27 - pointsSpent;

  // Step 4: Background & Skills
  const [background, setBackground] = useState('Ermitaño');
  const [selectedSkills, setSelectedSkills] = useState<string[]>([
    'Percepción',
    'Supervivencia',
    'Trato con Animales',
    'Medicina',
  ]);
  const [homebrewSkills, setHomebrewSkills] = useState<string[]>([]);
  const [newHomebrewSkillName, setNewHomebrewSkillName] = useState('');

  // Step 5: Equipment, Weapons, Armor, Spells, Feats (Homebrew ready)
  const [weapons, setWeapons] = useState<WeaponItem[]>([
    {
      id: 'wpn-init-1',
      name: 'Cimitarra de la Luna',
      attackBonus: 5,
      damage: '1d6 + 3',
      damageType: 'Cortante',
      reach: '5 ft',
      properties: 'Sutil, Ligera',
      isEquipped: true,
    },
  ]);
  const [newWpnName, setNewWpnName] = useState('');
  const [newWpnDmg, setNewWpnDmg] = useState('1d8+3');

  const [armorType, setArmorType] = useState('Pieles & Escudo');
  const [armorClassBase, setArmorClassBase] = useState(15);

  const [feats, setFeats] = useState<FeatDefinition[]>([
    {
      id: 'feat-1',
      name: 'Adepto de la Forma Salvaje',
      description: 'Ganas 1 uso adicional de Forma Salvaje por descanso corto.',
      isHomebrew: true,
    },
  ]);
  const [newFeatName, setNewFeatName] = useState('');
  const [newFeatDesc, setNewFeatDesc] = useState('');
  const [newFeatAbility, setNewFeatAbility] = useState<AbilityCode>('INT');
  const [newFeatBonus, setNewFeatBonus] = useState(0);

  const [spells, setSpells] = useState<SpellDefinition[]>([
    {
      id: 'spl-1',
      name: 'Producir Llama',
      level: 0,
      school: 'Evocación',
      castingTime: '1 Acción',
      range: '30 ft',
      components: 'V, S',
      duration: '10 minutos',
      concentration: false,
      attackOrDc: '+5 Ataque',
      damageOrHeal: '1d8 Fuego',
      description: 'Una llama parpadea en tu mano.',
    },
  ]);
  const [newSpellName, setNewSpellName] = useState('');

  // Calculations
  const calculateMod = (val: number) => Math.floor((val - 10) / 2);
  const proficiencyBonus = Math.ceil(1 + level / 4);
  const conMod = calculateMod(scores.CON);
  const sabMod = calculateMod(scores.SAB);
  const desMod = calculateMod(scores.DES);
  const intMod = calculateMod(scores.INT);
  const classSavingThrows: Record<ClassKey, Array<keyof typeof scores>> = {
    barbaro: ['FUE', 'CON'],
    bardo: ['DES', 'CAR'],
    clerigo: ['SAB', 'CAR'],
    druida: ['INT', 'SAB'],
    guerrero: ['FUE', 'CON'],
    picaro: ['DES', 'INT'],
    hechicero: ['CON', 'CAR'],
    brujo: ['SAB', 'CAR'],
    mago: ['INT', 'SAB'],
    monje: ['FUE', 'DES'],
    artifice: ['CON', 'INT'],
    homebrew: [],
  };
  const classKeyAttributes: Record<ClassKey, keyof typeof scores> = {
    barbaro: 'FUE', bardo: 'CAR', clerigo: 'SAB', druida: 'SAB', guerrero: 'FUE',
    picaro: 'DES', hechicero: 'CAR', brujo: 'CAR', mago: 'INT', monje: 'SAB', artifice: 'INT', homebrew: 'INT',
  };
  const savingThrows = classSavingThrows[selectedClassKey];
  const spellKey = classKeyAttributes[selectedClassKey];
  const spellKeyMod = calculateMod(scores[spellKey]);

  // Roll 4d6 drop lowest
  const handleRoll4d6 = () => {
    const newScores = { ...scores };
    const logs: Record<string, number[]> = {};

    (['FUE', 'DES', 'CON', 'INT', 'SAB', 'CAR'] as const).forEach((stat) => {
      const dice = Array.from({ length: 4 }, () => Math.floor(Math.random() * 6) + 1);
      logs[stat] = [...dice];
      const sorted = [...dice].sort((a, b) => a - b);
      const sum = sorted[1] + sorted[2] + sorted[3];
      newScores[stat] = sum;
    });

    setScores(newScores);
    setRollLogs(logs);
  };

  // Apply Standard Array
  const handleApplyStandardArray = () => {
    setScores({
      FUE: 10,
      DES: 14,
      CON: 13,
      INT: 12,
      SAB: 15,
      CAR: 8,
    });
  };

  // Toggle Skill
  const handleToggleSkill = (sName: string) => {
    setSelectedSkills((prev) =>
      prev.includes(sName) ? prev.filter((x) => x !== sName) : [...prev, sName]
    );
  };

  // Add Homebrew Skill
  const handleAddHomebrewSkill = () => {
    if (newHomebrewSkillName.trim()) {
      setHomebrewSkills((prev) => [...prev, newHomebrewSkillName.trim()]);
      setSelectedSkills((prev) => [...prev, newHomebrewSkillName.trim()]);
      setNewHomebrewSkillName('');
    }
  };

  // Add Homebrew Weapon
  const handleAddWeapon = () => {
    if (newWpnName.trim()) {
      setWeapons((prev) => [
        ...prev,
        {
          id: `wpn-${Date.now()}`,
          name: newWpnName.trim(),
          attackBonus: desMod + proficiencyBonus,
          damage: newWpnDmg,
          damageType: 'Cortante',
          reach: '5 ft',
          properties: 'Homebrew',
          isEquipped: true,
          isHomebrew: true,
        },
      ]);
      setNewWpnName('');
    }
  };

  // Add Homebrew Feat
  const handleAddFeat = () => {
    if (newFeatName.trim()) {
      setFeats((prev) => [
        ...prev,
        {
          id: `feat-${Date.now()}`,
          name: newFeatName.trim(),
          description: newFeatDesc || 'Dote personalizado.',
          abilityBonuses: newFeatBonus === 0 ? undefined : { [newFeatAbility]: newFeatBonus },
          isHomebrew: true,
        },
      ]);
      setNewFeatName('');
      setNewFeatDesc('');
      setNewFeatBonus(0);
    }
  };

  // Finish and Build Sheet
  const buildCharacterSheet = (): CharacterSheet => {
    const featBonus = (code: AbilityCode) => feats.reduce((total, feat) => total + (feat.abilityBonuses?.[code] || 0), 0);
    const finalScores = {
      FUE: scores.FUE + featBonus('FUE'), DES: scores.DES + featBonus('DES'), CON: scores.CON + featBonus('CON'),
      INT: scores.INT + featBonus('INT'), SAB: scores.SAB + featBonus('SAB'), CAR: scores.CAR + featBonus('CAR'),
    };
    const finalMods = {
      FUE: calculateMod(finalScores.FUE), DES: calculateMod(finalScores.DES), CON: calculateMod(finalScores.CON),
      INT: calculateMod(finalScores.INT), SAB: calculateMod(finalScores.SAB), CAR: calculateMod(finalScores.CAR),
    };
    const baseHp = (hitDie === 'd12' ? 12 : hitDie === 'd10' ? 10 : hitDie === 'd8' ? 8 : 6);
    const calculatedHp = baseHp + finalMods.CON + (level - 1) * (Math.floor(baseHp / 2) + 1 + finalMods.CON);

    const fullSkills = [
      { name: 'Acrobacias', attr: 'DES' as const },
      { name: 'Arcanos', attr: 'INT' as const },
      { name: 'Atletismo', attr: 'FUE' as const },
      { name: 'Engaño', attr: 'CAR' as const },
      { name: 'Historia', attr: 'INT' as const },
      { name: 'Intimidación', attr: 'CAR' as const },
      { name: 'Investigación', attr: 'INT' as const },
      { name: 'Juego de Manos', attr: 'DES' as const },
      { name: 'Medicina', attr: 'SAB' as const },
      { name: 'Naturaleza', attr: 'INT' as const },
      { name: 'Percepción', attr: 'SAB' as const },
      { name: 'Perspicacia', attr: 'SAB' as const },
      { name: 'Persuasión', attr: 'CAR' as const },
      { name: 'Religión', attr: 'INT' as const },
      { name: 'Sigilo', attr: 'DES' as const },
      { name: 'Supervivencia', attr: 'SAB' as const },
      { name: 'Trato con Animales', attr: 'SAB' as const },
      { name: 'Interpretación', attr: 'CAR' as const },
      ...homebrewSkills.map((hb) => ({ name: hb, attr: 'INT' as const })),
    ].map((sk) => {
      const isProf = selectedSkills.includes(sk.name);
      const attrMod = finalMods[sk.attr];
      return {
        name: sk.name,
        attr: sk.attr,
        isProficient: isProf,
        modifier: isProf ? attrMod + proficiencyBonus : attrMod,
        isHomebrew: homebrewSkills.includes(sk.name),
      };
    });

    return {
      id: `char-${Date.now()}`,
      name,
      epithet,
      characterClass: CLASS_THEMES[selectedClassKey].name,
      subclass,
      level,
      race,
      background,
      alignment,
      experience: level * 3500,
      nextLevelXp: (level + 1) * 4500,
      hasInspiration: true,

      armorClass: armorClassBase,
      acType: armorType,
      initiative: finalMods.DES,
      speedFeet,
      proficiencyBonus,
      passivePerception: 10 + finalMods.SAB + (selectedSkills.includes('Percepción') ? proficiencyBonus : 0),
      spellSaveDc: 8 + proficiencyBonus + finalMods[spellKey],
      spellAttackBonus: proficiencyBonus + finalMods[spellKey],

      currentHp: Math.max(1, calculatedHp),
      maxHp: Math.max(1, calculatedHp),
      tempHp: 0,
      hitDice: `${level}${hitDie}`,
      deathSaves: { successes: 0, failures: 0 },

      abilities: {
        FUE: { name: 'Fuerza', code: 'FUE', base: finalScores.FUE, modifier: finalMods.FUE, savingThrow: finalMods.FUE + (savingThrows.includes('FUE') ? proficiencyBonus : 0), isProficientSave: savingThrows.includes('FUE'), isKeyAttribute: spellKey === 'FUE' },
        DES: { name: 'Destreza', code: 'DES', base: finalScores.DES, modifier: finalMods.DES, savingThrow: finalMods.DES + (savingThrows.includes('DES') ? proficiencyBonus : 0), isProficientSave: savingThrows.includes('DES'), isKeyAttribute: spellKey === 'DES' },
        CON: { name: 'Constitución', code: 'CON', base: finalScores.CON, modifier: finalMods.CON, savingThrow: finalMods.CON + (savingThrows.includes('CON') ? proficiencyBonus : 0), isProficientSave: savingThrows.includes('CON'), isKeyAttribute: spellKey === 'CON' },
        INT: { name: 'Inteligencia', code: 'INT', base: finalScores.INT, modifier: finalMods.INT, savingThrow: finalMods.INT + (savingThrows.includes('INT') ? proficiencyBonus : 0), isProficientSave: savingThrows.includes('INT'), isKeyAttribute: spellKey === 'INT' },
        SAB: { name: 'Sabiduría', code: 'SAB', base: finalScores.SAB, modifier: finalMods.SAB, savingThrow: finalMods.SAB + (savingThrows.includes('SAB') ? proficiencyBonus : 0), isProficientSave: savingThrows.includes('SAB'), isKeyAttribute: spellKey === 'SAB' },
        CAR: { name: 'Carisma', code: 'CAR', base: finalScores.CAR, modifier: finalMods.CAR, savingThrow: finalMods.CAR + (savingThrows.includes('CAR') ? proficiencyBonus : 0), isProficientSave: savingThrows.includes('CAR'), isKeyAttribute: spellKey === 'CAR' },
      },

      skills: fullSkills,

      spellSlots: [
        { tier: 1, max: 4, current: 4 },
        { tier: 2, max: 2, current: 2 },
      ],
      preparedSpellsCount: Math.max(1, level + spellKeyMod),

      weapons,
      feats,
      spells,

      traits: [
        {
          title: `Rasgo de ${CLASS_THEMES[selectedClassKey].name}`,
          badge: 'CLASE',
          badgeType: 'action',
          description: `Canaliza los dones de la senda heroica de ${CLASS_THEMES[selectedClassKey].name}.`,
        },
        ...feats.map((f) => ({
          title: f.name,
          badge: 'DOTE',
          badgeType: 'accent' as const,
          description: f.description,
          isHomebrew: f.isHomebrew,
        })),
      ],

      senses: [{ name: 'Visión en la Oscuridad', detail: '60 pies' }],
      languages: ['Común', 'Élfico', 'Druídico'],
      portraitUrl,
      classKey: selectedClassKey,
    };
  };

  const handleFinish = () => {
    if (scoreMode === 'pointbuy' && pointsRemaining < 0) return;
    const sheet = buildCharacterSheet();
    onCharacterCreated(sheet, selectedClassKey);
  };

  const handleExportJson = () => {
    const sheet = buildCharacterSheet();
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(sheet, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `${name.toLowerCase().replace(/\s+/g, '-')}-dnd5e.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handlePrint = () => {
    window.print();
  };

  const steps = [
    { num: 1, title: 'Especie', icon: 'person' },
    { num: 2, title: 'Clase', icon: 'shield' },
    { num: 3, title: 'Características', icon: 'casino' },
    { num: 4, title: 'Trasfondo', icon: 'auto_stories' },
    { num: 5, title: 'Equipo & Homebrew', icon: 'swords' },
  ];

  return (
    <div className="flex flex-col w-full pb-16">
      {/* Stepper Progress Bar */}
      <div className="bg-[#1c1a24] rounded-xl p-4 lg:p-5 mb-6 shadow-xl border border-white/5">
        <div className="flex items-center justify-between mb-3">
          <span className="font-garamond text-lg font-bold text-white">
            Asistente de Creación de Personaje
          </span>
          <span className="text-xs text-[var(--theme-primary,#fbbf24)] font-bold">
            Paso {currentStep} de 5: {steps[currentStep - 1].title}
          </span>
        </div>

        {/* Progress Bar Track */}
        <div className="w-full bg-[#0f0d16] rounded-full h-2.5 p-0.5 border border-white/5 mb-4">
          <div
            className="h-full rounded-full bg-gradient-to-r from-[var(--theme-primary,#fbbf24)] to-[var(--theme-secondary,#d0bcff)] transition-all duration-300"
            style={{ width: `${(currentStep / 5) * 100}%` }}
          />
        </div>

        {/* Step Icons */}
        <div className="grid grid-cols-5 gap-2">
          {steps.map((s) => {
            const isActive = currentStep === s.num;
            const isDone = currentStep > s.num;
            return (
              <button
                key={s.num}
                onClick={() => setCurrentStep(s.num)}
                className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-all ${
                  isActive
                    ? 'bg-[var(--theme-primary,#fbbf24)]/10 border border-[var(--theme-primary,#fbbf24)] text-[var(--theme-primary,#fbbf24)]'
                    : isDone
                    ? 'bg-white/5 text-gray-300'
                    : 'text-gray-500 hover:text-gray-400'
                }`}
              >
                <span className="material-symbols-outlined text-base">{s.icon}</span>
                <span className="text-[10px] font-bold uppercase truncate">{s.title}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Stepper Body: Form on Left, Live Preview on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Form Container (7 cols) */}
        <div className="lg:col-span-7 bg-[#1c1a24] rounded-xl p-5 shadow-xl border border-white/5">
          {/* ======================================================= */}
          {/* PASO 1: ESPECIE / RAZA (EDITABLE & HOMEBREW)            */}
          {/* ======================================================= */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-white/5 pb-2">
                <h3 className="font-garamond text-xl font-bold text-white">
                  Paso 1: Especie & Identidad
                </h3>
                <span className="text-xs text-gray-400">Totalmente editable</span>
              </div>

              <div>
                <label className="block text-xs font-runic text-gray-400 uppercase mb-1">
                  Nombre del Héroe
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-[#0f0d16] text-sm text-white px-3 py-2 rounded-lg border border-white/10 focus:outline-none focus:border-[var(--theme-primary,#fbbf24)]"
                  placeholder="ej. Lyra Lunargentea..."
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-runic text-gray-400 uppercase mb-1">
                    Especie / Raza
                  </label>
                  <input
                    type="text"
                    value={race}
                    onChange={(e) => setRace(e.target.value)}
                    className="w-full bg-[#0f0d16] text-xs text-white px-3 py-2 rounded-lg border border-white/10 focus:outline-none"
                    placeholder="ej. Elfo, Humano, Homebrew..."
                  />
                </div>
                <div>
                  <label className="block text-xs font-runic text-gray-400 uppercase mb-1">
                    Epíteto o Título
                  </label>
                  <input
                    type="text"
                    value={epithet}
                    onChange={(e) => setEpithet(e.target.value)}
                    className="w-full bg-[#0f0d16] text-xs text-white px-3 py-2 rounded-lg border border-white/10 focus:outline-none"
                    placeholder="ej. Cazador de Sombras..."
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-runic text-gray-400 uppercase mb-1">
                    Velocidad (pies)
                  </label>
                  <input
                    type="number"
                    step="5"
                    value={speedFeet}
                    onChange={(e) => setSpeedFeet(parseInt(e.target.value, 10) || 30)}
                    className="w-full bg-[#0f0d16] text-xs text-white px-3 py-2 rounded-lg border border-white/10 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-runic text-gray-400 uppercase mb-1">
                    Nivel Inicial
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="20"
                    value={level}
                    onChange={(e) => setLevel(parseInt(e.target.value, 10) || 1)}
                    className="w-full bg-[#0f0d16] text-xs text-white px-3 py-2 rounded-lg border border-white/10 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-runic text-gray-400 uppercase mb-1">
                    Alineamiento
                  </label>
                  <select
                    value={alignment}
                    onChange={(e) => setAlignment(e.target.value)}
                    className="w-full bg-[#0f0d16] text-xs text-white px-2 py-2 rounded-lg border border-white/10 focus:outline-none"
                  >
                    <option value="Legal Bueno">Legal Bueno</option>
                    <option value="Neutral Bueno">Neutral Bueno</option>
                    <option value="Caótico Bueno">Caótico Bueno</option>
                    <option value="Legal Neutral">Legal Neutral</option>
                    <option value="Neutral">Neutral</option>
                    <option value="Caótico Neutral">Caótico Neutral</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-runic text-gray-400 uppercase mb-1">
                  URL del Retrato o Avatar
                </label>
                <input
                  type="text"
                  value={portraitUrl}
                  onChange={(e) => setPortraitUrl(e.target.value)}
                  className="w-full bg-[#0f0d16] text-xs text-gray-300 px-3 py-2 rounded-lg border border-white/10 focus:outline-none font-mono"
                />
              </div>
            </div>
          )}

          {/* ======================================================= */}
          {/* PASO 2: CLASE (TODAS LAS CLASES D&D + HOMEBREW)         */}
          {/* ======================================================= */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-white/5 pb-2">
                <h3 className="font-garamond text-xl font-bold text-white">
                  Paso 2: Selección de Clase
                </h3>
                <span className="text-xs text-[var(--theme-primary,#fbbf24)] font-bold">
                  Adapta paleta visual y mecánicas
                </span>
              </div>

              {/* Grid de Clases */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-h-64 overflow-y-auto pr-1">
                {(Object.keys(CLASS_THEMES) as ClassKey[]).map((cKey) => {
                  const item = CLASS_THEMES[cKey];
                  const isSelected = selectedClassKey === cKey;
                  return (
                    <button
                      key={cKey}
                      type="button"
                      onClick={() => {
                        setSelectedClassKey(cKey);
                        if (cKey === 'barbaro') setHitDie('d12');
                        else if (['guerrero', 'paladin', 'explorador'].includes(cKey)) setHitDie('d10');
                        else if (['mago', 'hechicero'].includes(cKey)) setHitDie('d6');
                        else setHitDie('d8');
                      }}
                      className={`p-2.5 rounded-lg border text-left transition-all flex flex-col gap-1 ${
                        isSelected
                          ? 'border-[var(--theme-primary,#fbbf24)] bg-white/10 shadow-md'
                          : 'border-white/5 bg-[#0f0d16] hover:bg-[#211e28]'
                      }`}
                    >
                      <div className="flex items-center gap-1.5">
                        <span
                          className="material-symbols-outlined text-sm"
                          style={{ color: item.colors.primary }}
                        >
                          {item.icon}
                        </span>
                        <span className="font-runic text-[11px] font-bold text-white truncate">
                          {item.name}
                        </span>
                      </div>
                      <span className="text-[10px] text-gray-400 line-clamp-1 leading-tight">
                        {item.description}
                      </span>
                    </button>
                  );
                })}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-runic text-gray-400 uppercase mb-1">
                    Subclase / Especialidad
                  </label>
                  <input
                    type="text"
                    value={subclass}
                    onChange={(e) => setSubclass(e.target.value)}
                    className="w-full bg-[#0f0d16] text-xs text-white px-3 py-2 rounded-lg border border-white/10 focus:outline-none"
                    placeholder="ej. Círculo de la Luna, Escribas..."
                  />
                </div>
                <div>
                  <label className="block text-xs font-runic text-gray-400 uppercase mb-1">
                    Dado de Golpe
                  </label>
                  <select
                    value={hitDie}
                    onChange={(e) => setHitDie(e.target.value)}
                    className="w-full bg-[#0f0d16] text-xs text-white px-3 py-2 rounded-lg border border-white/10 focus:outline-none"
                  >
                    <option value="d6">d6 (Mago, Hechicero)</option>
                    <option value="d8">d8 (Druida, Bardo, Clérigo, Pícaro)</option>
                    <option value="d10">d10 (Guerrero, Paladín, Explorador)</option>
                    <option value="d12">d12 (Bárbaro)</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* ======================================================= */}
          {/* PASO 3: CARACTERÍSTICAS (4D6, POINT BUY, STANDARD)     */}
          {/* ======================================================= */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-white/5 pb-2">
                <h3 className="font-garamond text-xl font-bold text-white">
                  Paso 3: Puntuaciones de Característica
                </h3>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-gray-400">Método:</span>
                  <div className="flex rounded bg-[#0f0d16] p-0.5 border border-white/10">
                    <button
                      type="button"
                      onClick={() => {
                        setScoreMode('standard');
                        handleApplyStandardArray();
                      }}
                      className={`px-2 py-0.5 text-[10px] font-bold rounded ${
                        scoreMode === 'standard' ? 'bg-[var(--theme-primary,#fbbf24)] text-black' : 'text-gray-400'
                      }`}
                    >
                      Estándar
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setScoreMode('pointbuy');
                      }}
                      className={`px-2 py-0.5 text-[10px] font-bold rounded ${
                        scoreMode === 'pointbuy' ? 'bg-[var(--theme-primary,#fbbf24)] text-black' : 'text-gray-400'
                      }`}
                    >
                      Point Buy (27)
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setScoreMode('4d6');
                        handleRoll4d6();
                      }}
                      className={`px-2 py-0.5 text-[10px] font-bold rounded ${
                        scoreMode === '4d6' ? 'bg-[var(--theme-primary,#fbbf24)] text-black' : 'text-gray-400'
                      }`}
                    >
                      Tirada 4d6
                    </button>
                  </div>
                </div>
              </div>

              {/* Banner contextual del modo elegido */}
              {scoreMode === 'pointbuy' && (
                <div className="bg-[#0f0d16] p-3 rounded-lg border border-white/5 flex items-center justify-between text-xs">
                  <span className="text-gray-300">
                    Puntos disponibles: <strong>27</strong>
                  </span>
                  <span
                    className={`font-mono font-bold ${
                      pointsRemaining < 0
                        ? 'text-red-400'
                        : pointsRemaining === 0
                        ? 'text-emerald-400'
                        : 'text-[var(--theme-primary,#fbbf24)]'
                    }`}
                  >
                    Restantes: {pointsRemaining} pts
                  </span>
                  {pointsRemaining < 0 && (
                    <span className="text-red-400 font-semibold">Excedes el límite de 27</span>
                  )}
                </div>
              )}

              {scoreMode === '4d6' && (
                <div className="flex items-center justify-between bg-[#0f0d16] p-3 rounded-lg border border-white/5">
                  <span className="text-xs text-gray-300">
                    4 dados de 6 caras descartando el menor por cada estadística.
                  </span>
                  <button
                    type="button"
                    onClick={handleRoll4d6}
                    className="flex items-center gap-1 px-2.5 py-1 rounded bg-[var(--theme-primary,#fbbf24)] text-black font-bold text-xs"
                  >
                    <span className="material-symbols-outlined text-xs">casino</span>
                    <span>Tirar de Nuevo</span>
                  </button>
                </div>
              )}

              {/* Grid de las 6 Características con Ajustadores */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {(['FUE', 'DES', 'CON', 'INT', 'SAB', 'CAR'] as const).map((stat) => {
                  const val = scores[stat];
                  const mod = calculateMod(val);

                  return (
                    <div
                      key={stat}
                      className="bg-[#0f0d16] p-3 rounded-xl border border-white/5 flex flex-col items-center shadow-inner"
                    >
                      <span className="font-runic text-xs font-bold text-gray-300 mb-1">
                        {stat}
                      </span>

                      {/* Modificador Calculado */}
                      <div className="w-12 h-12 rounded-full bg-[#211e28] flex items-center justify-center font-garamond text-2xl font-bold text-[var(--theme-primary,#fbbf24)] mb-2 shadow-inner border border-white/5">
                        {mod >= 0 ? `+${mod}` : mod}
                      </div>

                      {/* Controles de Puntuación */}
                      <div className="flex items-center gap-2">
                        {scoreMode === 'pointbuy' && (
                          <button
                            type="button"
                            disabled={val <= 8}
                            onClick={() => setScores((p) => ({ ...p, [stat]: Math.max(8, p[stat] - 1) }))}
                            className="w-6 h-6 rounded bg-[#211e28] hover:bg-[#2b2932] disabled:opacity-30 text-white font-bold text-xs"
                          >
                            -
                          </button>
                        )}

                        <input
                          type="number"
                          min="3"
                          max="20"
                          value={val}
                          onChange={(e) => {
                            const n = parseInt(e.target.value, 10) || 10;
                            setScores((prev) => ({ ...prev, [stat]: n }));
                          }}
                          className="w-12 text-center bg-[#1c1a24] text-sm text-white font-bold py-1 rounded border border-white/10"
                        />

                        {scoreMode === 'pointbuy' && (
                          <button
                            type="button"
                            disabled={val >= 15 || pointsRemaining <= 0}
                            onClick={() => setScores((p) => ({ ...p, [stat]: Math.min(15, p[stat] + 1) }))}
                            className="w-6 h-6 rounded bg-[#211e28] hover:bg-[#2b2932] disabled:opacity-30 text-white font-bold text-xs"
                          >
                            +
                          </button>
                        )}
                      </div>

                      {/* Dados del log si se tiró con 4d6 */}
                      {rollLogs[stat] && (
                        <span className="text-[10px] text-gray-500 font-mono mt-1">
                          [{rollLogs[stat].join(', ')}]
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ======================================================= */}
          {/* PASO 4: TRASFONDO & HABILIDADES                         */}
          {/* ======================================================= */}
          {currentStep === 4 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-white/5 pb-2">
                <h3 className="font-garamond text-xl font-bold text-white">
                  Paso 4: Trasfondo & Disciplinas
                </h3>
                <span className="text-xs text-gray-400">Selecciona competencias</span>
              </div>

              <div>
                <label className="block text-xs font-runic text-gray-400 uppercase mb-1">
                  Trasfondo Heroico
                </label>
                <input
                  type="text"
                  value={background}
                  onChange={(e) => setBackground(e.target.value)}
                  className="w-full bg-[#0f0d16] text-xs text-white px-3 py-2 rounded-lg border border-white/10 focus:outline-none"
                  placeholder="ej. Ermitaño, Acólito, Sabio, Homebrew..."
                />
              </div>

              {/* Selección de Habilidades */}
              <div>
                <label className="block text-xs font-runic text-gray-400 uppercase mb-2">
                  Competencias en Habilidades ({selectedSkills.length} seleccionadas)
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-52 overflow-y-auto pr-1">
                  {[
                    'Acrobacias',
                    'Arcanos',
                    'Atletismo',
                    'Engaño',
                    'Historia',
                    'Intimidación',
                    'Investigación',
                    'Juego de Manos',
                    'Medicina',
                    'Naturaleza',
                    'Percepción',
                    'Perspicacia',
                    'Persuasión',
                    'Religión',
                    'Sigilo',
                    'Supervivencia',
                    'Trato con Animales',
                    'Interpretación',
                    ...homebrewSkills,
                  ].map((sName) => {
                    const isSelected = selectedSkills.includes(sName);
                    return (
                      <button
                        key={sName}
                        type="button"
                        onClick={() => handleToggleSkill(sName)}
                        className={`flex items-center justify-between p-2 rounded-lg border text-xs text-left transition-all ${
                          isSelected
                            ? 'bg-[var(--theme-primary,#fbbf24)]/15 border-[var(--theme-primary,#fbbf24)] text-white font-bold'
                            : 'bg-[#0f0d16] border-white/5 text-gray-400 hover:bg-[#211e28]'
                        }`}
                      >
                        <span className="truncate">{sName}</span>
                        <span
                          className={`w-3 h-3 rotate-45 rounded-xs ${
                            isSelected ? 'bg-[var(--theme-primary,#fbbf24)]' : 'bg-[#211e28]'
                          }`}
                        />
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Agregar Habilidad Homebrew */}
              <div className="flex items-center gap-2 pt-2 border-t border-white/5">
                <input
                  type="text"
                  value={newHomebrewSkillName}
                  onChange={(e) => setNewHomebrewSkillName(e.target.value)}
                  placeholder="Nombre de Habilidad Homebrew..."
                  className="flex-1 bg-[#0f0d16] text-xs text-white px-3 py-1.5 rounded-lg border border-white/10"
                />
                <button
                  type="button"
                  onClick={handleAddHomebrewSkill}
                  className="px-3 py-1.5 rounded bg-[var(--theme-secondary-container,#571bc1)] text-white text-xs font-bold"
                >
                  + Añadir Homebrew
                </button>
              </div>
            </div>
          )}

          {/* ======================================================= */}
          {/* PASO 5: EQUIPO, ARMAS, MAGIAS & FEATS (HOMEBREW)        */}
          {/* ======================================================= */}
          {currentStep === 5 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-white/5 pb-2">
                <h3 className="font-garamond text-xl font-bold text-white">
                  Paso 5: Equipo, Armas, Dotes & Magias
                </h3>
                <span className="text-xs text-[var(--theme-primary,#fbbf24)] font-bold">
                  Personalización Homebrew Total
                </span>
              </div>

              {/* Armadura & CA */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-runic text-gray-400 uppercase mb-1">
                    Tipo de Armadura
                  </label>
                  <input
                    type="text"
                    value={armorType}
                    onChange={(e) => setArmorType(e.target.value)}
                    className="w-full bg-[#0f0d16] text-xs text-white px-3 py-2 rounded-lg border border-white/10"
                    placeholder="ej. Placas, Cuero, Mágica..."
                  />
                </div>
                <div>
                  <label className="block text-xs font-runic text-gray-400 uppercase mb-1">
                    Clase de Armadura (CA Base)
                  </label>
                  <input
                    type="number"
                    value={armorClassBase}
                    onChange={(e) => setArmorClassBase(parseInt(e.target.value, 10) || 10)}
                    className="w-full bg-[#0f0d16] text-xs text-white px-3 py-2 rounded-lg border border-white/10"
                  />
                </div>
              </div>

              {/* Armas Homebrew */}
              <div className="bg-[#0f0d16] p-3 rounded-lg border border-white/5">
                <span className="text-xs font-runic text-gray-300 font-bold uppercase block mb-2">
                  Armas & Ataques
                </span>
                <div className="flex items-center gap-2 mb-2">
                  <input
                    type="text"
                    value={newWpnName}
                    onChange={(e) => setNewWpnName(e.target.value)}
                    placeholder="Nombre del arma homebrew..."
                    className="flex-1 bg-[#1c1a24] text-xs text-white px-2.5 py-1.5 rounded border border-white/10"
                  />
                  <input
                    type="text"
                    value={newWpnDmg}
                    onChange={(e) => setNewWpnDmg(e.target.value)}
                    placeholder="Daño (1d8+3)..."
                    className="w-24 bg-[#1c1a24] text-xs text-white px-2.5 py-1.5 rounded border border-white/10"
                  />
                  <button
                    type="button"
                    onClick={handleAddWeapon}
                    className="px-2.5 py-1.5 rounded bg-[var(--theme-primary,#fbbf24)] text-black font-bold text-xs"
                  >
                    + Añadir
                  </button>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {weapons.map((w) => (
                    <span
                      key={w.id}
                      className="text-xs bg-[#211e28] text-white px-2.5 py-1 rounded-lg border border-white/5"
                    >
                      {w.name} ({w.damage})
                    </span>
                  ))}
                </div>
              </div>

              {/* Dotes (Feats) Homebrew */}
              <div className="bg-[#0f0d16] p-3 rounded-lg border border-white/5">
                <span className="text-xs font-runic text-gray-300 font-bold uppercase block mb-2">
                  Dotes (Feats) & Rasgos Especiales
                </span>
                <div className="flex flex-col gap-1.5 mb-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={newFeatName}
                      onChange={(e) => setNewFeatName(e.target.value)}
                      placeholder="Nombre del dote homebrew..."
                      className="flex-1 bg-[#1c1a24] text-xs text-white px-2.5 py-1.5 rounded border border-white/10"
                    />
                    <button
                      type="button"
                      onClick={handleAddFeat}
                      className="px-2.5 py-1.5 rounded bg-[var(--theme-secondary-container,#571bc1)] text-white font-bold text-xs"
                    >
                      + Añadir Dote
                    </button>
                  </div>
                  <input
                    type="text"
                    value={newFeatDesc}
                    onChange={(e) => setNewFeatDesc(e.target.value)}
                    placeholder="Descripción de la regla mecánica..."
                    className="w-full bg-[#1c1a24] text-xs text-gray-300 px-2.5 py-1 rounded border border-white/10"
                  />
                  <div className="flex items-center gap-2">
                    <label className="text-[10px] text-gray-400 uppercase font-bold" htmlFor="creator-feat-ability">Bono</label>
                    <select
                      id="creator-feat-ability"
                      value={newFeatAbility}
                      onChange={(e) => setNewFeatAbility(e.target.value as AbilityCode)}
                      className="bg-[#1c1a24] text-xs text-white px-2 py-1 rounded border border-white/10"
                    >
                      {(['FUE', 'DES', 'CON', 'INT', 'SAB', 'CAR'] as AbilityCode[]).map((code) => <option key={code} value={code}>{code}</option>)}
                    </select>
                    <input
                      type="number"
                      min="-5"
                      max="10"
                      value={newFeatBonus}
                      onChange={(e) => setNewFeatBonus(Number(e.target.value))}
                      className="w-16 bg-[#1c1a24] text-xs text-white px-2 py-1 rounded border border-white/10"
                      aria-label="Bono numérico de la dote"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  {feats.map((f) => (
                    <div
                      key={f.id}
                      className="text-xs bg-[#211e28] p-2 rounded border border-white/5 flex flex-col"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <strong className="text-white">{f.name}</strong>
                        <button
                          type="button"
                          onClick={() => setFeats((prev) => prev.filter((feat) => feat.id !== f.id))}
                          className="p-1 text-gray-500 hover:text-red-400"
                          title="Eliminar dote"
                          aria-label={`Eliminar ${f.name}`}
                        >
                          <span className="material-symbols-outlined text-sm">delete</span>
                        </button>
                      </div>
                      <span className="text-gray-400 text-[11px]">{f.description}</span>
                      {f.abilityBonuses && Object.entries(f.abilityBonuses).map(([code, bonus]) => <span key={code} className="text-emerald-300 text-[10px]">{code} +{bonus}</span>)}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Stepper Navigation Buttons */}
          <div className="flex items-center justify-between pt-5 mt-4 border-t border-white/5">
            <button
              type="button"
              disabled={currentStep === 1}
              onClick={() => setCurrentStep((p) => Math.max(1, p - 1))}
              className="px-4 py-2 rounded-lg bg-[#211e28] text-gray-300 text-xs hover:bg-[#2b2932] disabled:opacity-30"
            >
              Anterior
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onCancel}
                className="px-3 py-2 rounded-lg bg-white/5 text-gray-400 hover:text-white text-xs"
              >
                Cancelar
              </button>

              {currentStep < 5 ? (
                <button
                  type="button"
                  onClick={() => setCurrentStep((p) => Math.min(5, p + 1))}
                  className="px-4 py-2 rounded-lg bg-[var(--theme-secondary-container,#571bc1)] text-white text-xs font-bold hover:brightness-110 shadow-md"
                >
                  Siguiente Paso
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleFinish}
                  className="px-5 py-2 rounded-lg bg-[var(--theme-primary,#fbbf24)] text-[#261a00] text-xs font-bold hover:brightness-110 shadow-lg cursor-pointer"
                >
                  Engarzar a la Hoja
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Live Preview & Final Output (5 cols) */}
        <div className="lg:col-span-5 bg-[#1c1a24] rounded-xl p-5 shadow-xl border border-white/5 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <span className="font-runic text-[10px] text-gray-400 uppercase font-bold tracking-wider">
              Vista Previa Lista para Jugar
            </span>
            <div className="flex items-center gap-1.5">
              <button
                onClick={handleExportJson}
                className="px-2 py-1 rounded bg-[#211e28] hover:bg-[#2b2932] text-[10px] text-gray-300 border border-white/5 font-semibold flex items-center gap-1"
                title="Exportar a archivo JSON"
              >
                <span className="material-symbols-outlined text-xs">download</span>
                <span>JSON</span>
              </button>
              <button
                onClick={handlePrint}
                className="px-2 py-1 rounded bg-[#211e28] hover:bg-[#2b2932] text-[10px] text-gray-300 border border-white/5 font-semibold flex items-center gap-1"
                title="Imprimir o guardar en PDF"
              >
                <span className="material-symbols-outlined text-xs">print</span>
                <span>Imprimir</span>
              </button>
            </div>
          </div>

          <div className="bg-[#0f0d16] rounded-xl p-4 border border-white/5 flex flex-col gap-3 relative overflow-hidden">
            <div className="flex items-center gap-3">
              <img
                src={portraitUrl}
                alt={name}
                className="w-16 h-16 rounded-full object-cover border-2 border-[var(--theme-primary,#fbbf24)] shadow-md"
              />
              <div className="flex flex-col min-w-0">
                <span className="font-runic text-[9px] text-[var(--theme-primary,#fbbf24)] font-bold uppercase tracking-widest">
                  {epithet || 'AVENTURERO'}
                </span>
                <h4 className="font-garamond text-xl text-white font-bold truncate">
                  {name || 'Sin Nombre'}
                </h4>
                <span className="text-xs text-gray-400">
                  Nv. {level} • {CLASS_THEMES[selectedClassKey].name} ({subclass})
                </span>
              </div>
            </div>

            {/* Vitales Calculados */}
            <div className="grid grid-cols-4 gap-1.5 text-center bg-[#14121b] p-2 rounded-lg border border-white/5 text-xs">
              <div>
                <span className="text-[8px] text-gray-500 font-runic block">CA</span>
                <span className="font-bold text-white">{armorClassBase}</span>
              </div>
              <div>
                <span className="text-[8px] text-gray-500 font-runic block">INICIATIVA</span>
                <span className="font-bold text-[var(--theme-secondary,#d0bcff)]">
                  {desMod >= 0 ? `+${desMod}` : desMod}
                </span>
              </div>
              <div>
                <span className="text-[8px] text-gray-500 font-runic block">VELOCIDAD</span>
                <span className="font-bold text-emerald-400">{speedFeet} ft</span>
              </div>
              <div>
                <span className="text-[8px] text-gray-500 font-runic block">COMPETENCIA</span>
                <span className="font-bold text-[var(--theme-primary,#fbbf24)]">
                  +{proficiencyBonus}
                </span>
              </div>
            </div>

            {/* 6 Características con modificadores */}
            <div className="grid grid-cols-6 gap-1 text-center bg-[#14121b] p-1.5 rounded-lg border border-white/5">
              {(['FUE', 'DES', 'CON', 'INT', 'SAB', 'CAR'] as const).map((stat) => {
                const mod = calculateMod(scores[stat]);
                return (
                  <div key={stat} className="flex flex-col">
                    <span className="text-[8px] font-mono text-gray-500">{stat}</span>
                    <span className="text-xs font-bold text-white">{scores[stat]}</span>
                    <span className="text-[10px] font-bold text-[var(--theme-secondary,#d0bcff)]">
                      {mod >= 0 ? `+${mod}` : mod}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="bg-[#14121b] p-2 rounded-lg border border-white/5 text-xs text-gray-300">
              <span className="text-[10px] text-gray-400 uppercase font-bold block mb-1">
                Competencias Marcadas ({selectedSkills.length})
              </span>
              <p className="text-[11px] line-clamp-2 text-gray-400">
                {selectedSkills.join(', ')}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
