import React, { useState, useEffect, useCallback, useRef } from 'react';
import { CharacterSheet, ClassId, ElementalAffinity, Combatant } from './types/character';
import { DEFAULT_CHARACTERS } from './data/defaultCharacters';
import { CLASS_THEMES } from './data/classThemes';
import { Sidebar, ActiveTab } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { ClassResonanceBanner } from './components/layout/ClassResonanceBanner';
import { CharacterSheetView } from './components/views/CharacterSheetView';
import { CombatTurnView } from './components/views/CombatTurnView';
import { GrimoireCardsView } from './components/views/GrimoireCardsView';
import { CharacterCreatorView } from './components/views/CharacterCreatorView';
import { FxLayer } from './components/fx/FxLayer';
import { ClassFrameDecorations } from './components/fx/ClassFrameDecorations';
import { DiceTrayModal } from './components/modals/DiceTrayModal';
import { ManageSheetModal } from './components/modals/ManageSheetModal';
import { ClassSelectorModal } from './components/modals/ClassSelectorModal';
import { LevelUpDialog } from './components/modals/LevelUpDialog';
import { ShortRestDialog } from './components/modals/ShortRestDialog';
import { spellSlotsForClassLevel } from './lib/classProgression';
import { normalizeBardicInspiration } from './lib/bardicInspiration';
import { getEffectiveAbilityScore } from './lib/itemEffects';

const STORAGE_KEY = 'grimorio_arcanum_active_character_v5';

function readCombatants(characterId: string, fallback: Combatant[]): Combatant[] {
  try {
    const stored = localStorage.getItem(`grimorio_combatants_${characterId}`);
    if (!stored) return fallback;

    const parsed: unknown = JSON.parse(stored);
    if (!Array.isArray(parsed) || !parsed.every((combatant) =>
      combatant !== null
      && typeof combatant === 'object'
      && 'id' in combatant
      && typeof combatant.id === 'string'
      && 'name' in combatant
      && typeof combatant.name === 'string'
      && 'type' in combatant
      && (combatant.type === 'player' || combatant.type === 'ally' || combatant.type === 'enemy')
      && 'initiative' in combatant
      && typeof combatant.initiative === 'number'
      && 'hp' in combatant
      && typeof combatant.hp === 'number'
      && 'maxHp' in combatant
      && typeof combatant.maxHp === 'number'
      && 'ac' in combatant
      && typeof combatant.ac === 'number'
      && 'conditions' in combatant
      && Array.isArray(combatant.conditions)
      && combatant.conditions.every((condition: unknown) => typeof condition === 'string'),
    )) {
      return fallback;
    }

    return parsed as Combatant[];
  } catch (error) {
    console.error('No se pudo restaurar la iniciativa del combate.', error);
    return fallback;
  }
}

export default function App() {
  // Active Character State with Undo stack
  const syncSheetFromCards = (input: CharacterSheet): CharacterSheet => {
    // Preserve currency editability (CP/SP/EP/GP/PP)
    const preservedCurrency = input.currency;

    const attackCards = input.cards.filter((c) => c.category === 'attack');
    const itemCards = input.cards.filter((c) => c.category === 'item');

    const spellSlots = spellSlotsForClassLevel(input.classId, input.level, input.spellSlots);
    const classResources = input.classResources;

    const weapons = attackCards.map((c) => ({
      id: c.id,
      name: c.title,
      attackBonus: 0,
      damage: c.effectOrDamage || '—',
      damageType: c.attackOrDC || 'Daño',
      range: c.range || 'Me`elee',
      properties: c.actionType || 'Ataque',
      isHomebrew: (c as any).isHomebrew ?? false,
      // Keep equipped semantics consistent with existing sheet usage.
      isEquipped: true,
    }));

    const cardInventory = itemCards.map((c) => ({
      id: c.id,
      cardId: c.id,
      name: c.name || c.title,
      quantity: c.item?.quantity ?? 1,
      weight: c.item?.weight ?? 0,
      attuned: Boolean(c.item?.attuned),
      requiresAttunement: Boolean(c.item?.requiresAttunement),
      equipped: Boolean(c.equipped),
      value: c.item?.value || '—',
      notes: c.description,
    }));
    const inventory = [
      ...cardInventory,
      ...input.inventory.filter((item) => !item.cardId && !itemCards.some((card) => card.id === item.id)),
    ];

    return {
      ...input,
      currency: preservedCurrency,
      spellSlots,
      weapons,
      inventory,
      classResources,
    };
  };

  const [character, setCharacter] = useState<CharacterSheet>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return DEFAULT_CHARACTERS[0];
  });

  const [undoStack, setUndoStack] = useState<CharacterSheet[]>([]);
  const [activeTab, setActiveTab] = useState<ActiveTab>('sheet');
  const [isSavedJustNow, setIsSavedJustNow] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Modals
  const [diceTrayOpen, setDiceTrayOpen] = useState(false);
  const [manageModalOpen, setManageModalOpen] = useState(false);
  const [classSelectorModalOpen, setClassSelectorModalOpen] = useState(false);
  const [levelUpModalOpen, setLevelUpModalOpen] = useState(false);
  const [shortRestModalOpen, setShortRestModalOpen] = useState(false);

  // Combatants & Dice Tray Sync State
  const [combatants, setCombatants] = useState<Combatant[]>(() => readCombatants(character.id, [
    { id: 'c-player', name: character.name, type: 'player', initiative: 15, hp: character.hitPoints.current, maxHp: character.hitPoints.max, ac: character.armorClass, conditions: [] },
    { id: 'c-enemy1', name: 'Caballero Espectral', type: 'enemy', initiative: 15, hp: 45, maxHp: 45, ac: 16, conditions: ['Asustado'] },
    { id: 'c-ally1', name: 'Lobo Compañero', type: 'ally', initiative: 12, hp: 22, maxHp: 22, ac: 13, conditions: [] },
  ]));
  const [diceTrayFormula, setDiceTrayFormula] = useState<string | null>(null);
  const diceTrayCallbackRef = useRef<((result: number) => void) | null>(null);

  const handleOpenDiceTray = (formula?: string, callback?: (result: number) => void) => {
    setDiceTrayFormula(formula || null);
    diceTrayCallbackRef.current = callback || null;
    setDiceTrayOpen(true);
  };

  const handleUpdateInitiative = (init: number) => {
    setCombatants((prev) => {
      const hasPlayer = prev.some((c) => c.type === 'player' || c.id === 'c-player');
      let updated: Combatant[];
      if (hasPlayer) {
        updated = prev.map((c) =>
          c.type === 'player' || c.id === 'c-player'
            ? {
                ...c,
                initiative: init,
                name: character.name,
                hp: character.hitPoints.current,
                maxHp: character.hitPoints.max,
                ac: character.armorClass,
              }
            : c
        );
      } else {
        updated = [
          {
            id: 'c-player',
            name: character.name,
            type: 'player',
            initiative: init,
            hp: character.hitPoints.current,
            maxHp: character.hitPoints.max,
            ac: character.armorClass,
            conditions: [],
          },
          ...prev,
        ];
      }
      return updated.sort((a, b) => b.initiative - a.initiative);
    });
  };

  // Visual FX Triggers
  const [isShaking, setIsShaking] = useState(false);
  const [stealthActive, setStealthActive] = useState(false);
  const [auraActive, setAuraActive] = useState(false);

  const currentTheme = CLASS_THEMES[character.classId] || CLASS_THEMES.mago;

  useEffect(() => {
    try {
      localStorage.setItem(`grimorio_combatants_${character.id}`, JSON.stringify(combatants));
    } catch (error) {
      console.error('No se pudo guardar la iniciativa del combate.', error);
    }
  }, [character.id, combatants]);

  // Sync all theme palette variables to the document root (camelCase -> kebab-case)
  useEffect(() => {
    const root = document.documentElement;
    Object.entries(currentTheme.palette).forEach(([key, value]) => {
      const cssVar = key.replace(/[A-Z]/g, (m) => `-${m.toLowerCase()}`);
      root.style.setProperty(`--theme-${cssVar}`, value as string);
    });
  }, [currentTheme]);

  // Update Character with undo push
  const updateCharacter = useCallback((updated: CharacterSheet) => {
    const before = updated.classResources?.fighter;
    const synced = syncSheetFromCards(updated);
    const after = synced.classResources?.fighter;
    // eslint-disable-next-line no-console
    // console.log('[updateCharacter] fighter before -> after', { before, after });
    setUndoStack((prev) => [...prev.slice(-15), character]);
    setCharacter(synced);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch {
      // storage unavailable
    }
  }, [character]);

  const handleUndo = useCallback(() => {
    if (undoStack.length === 0) return;
    const last = undoStack[undoStack.length - 1];
    setUndoStack((prev) => prev.slice(0, -1));
    setCharacter(last);
  }, [undoStack]);

  // Keyboard shortcut Ctrl+Z
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        e.preventDefault();
        handleUndo();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleUndo]);

  const handleSaveSheet = () => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(character));
      setIsSavedJustNow(true);
      setTimeout(() => setIsSavedJustNow(false), 2000);
    } catch {
      // handle error
    }
  };

  const handleTriggerShake = () => {
    setIsShaking(true);
    setTimeout(() => setIsShaking(false), 600);
  };

  const handleTriggerAuraPulse = () => {
    setAuraActive(true);
    setTimeout(() => setAuraActive(false), 2000);
  };

  const handleLevelUpConfirm = (newLevel: number, hpIncrease: number) => {
    const profBonus = Math.floor((newLevel - 1) / 4) + 2;
    updateCharacter({
      ...character,
      level: newLevel,
      proficiencyBonus: profBonus,
      hitPoints: {
        ...character.hitPoints,
        max: character.hitPoints.max + hpIncrease,
        current: character.hitPoints.current + hpIncrease,
      },
      hitDice: {
        ...character.hitDice,
        max: newLevel,
        current: character.hitDice.current + 1,
      },
    });
  };

  const SHORT_REST_SECOND_WIND_MAX = (level: number) => (level >= 10 ? 4 : level >= 4 ? 3 : 2);

  const handleShortRest = () => {
    // El descanso corto se maneja a través del diálogo de descanso corto (handleShortRestHealing)
    // que permite gastar dados de golpe y aplica la recuperación del Guerrero (+1 uso de Segundo Aliento, etc.).
    // Si se invoca directamente, delega en la misma lógica restaurando 1 uso de Segundo Aliento y Action Surge.
    handleShortRestHealing(0, 0);
  };

  const handleShortRestHealing = (hpRegained: number, diceSpent: number) => {
    const druidMaxUses =
      character.level >= 17 ? 4 : character.level >= 6 ? 3 : 2;
    const druidResources = character.classResources.druid;
    const normalizedBardResources = normalizeBardicInspiration(
      character.classResources.bard,
      character.level,
      getEffectiveAbilityScore(character.cards, 'CAR', character.abilities.CAR.score),
    );

    const currentFighter = character.classResources.fighter;
    const secondWindMax = SHORT_REST_SECOND_WIND_MAX(character.level);
    const currentSecondWind = currentFighter?.secondWindUsesCurrent ?? 0;
    const restoredSecondWind = Math.min(secondWindMax, currentSecondWind + 1);

    updateCharacter({
      ...character,
      hitPoints: {
        ...character.hitPoints,
        current: Math.min(character.hitPoints.max, character.hitPoints.current + hpRegained),
      },
      hitDice: {
        ...character.hitDice,
        current: Math.max(0, character.hitDice.current - diceSpent),
      },
      cards: character.cards.map((card) => card.uses?.recharge === 'short'
        ? { ...card, uses: { ...card.uses, current: card.uses.max } }
        : card),
      classResources: {
        ...character.classResources,
        ...(character.classId === 'guerrero'
          ? {
              fighter: {
                ...(currentFighter ?? {
                  secondWindUsesCurrent: 0,
                  secondWindUsesMax: 0,
                  actionSurgeUsed: false,
                }),
                secondWindUsesMax: secondWindMax,
                secondWindUsesCurrent: restoredSecondWind,
                actionSurgeMax: (character.level >= 17 ? 2 : 1),
                actionSurgeCurrent: (character.level >= 17 ? 2 : 1),
                actionSurgeUsed: false,
              },
            }
          : {}),
        ...(character.classId === 'druida'
          ? {
              druid: {
                ...(druidResources ?? {
                  wildShapeCurrent: druidMaxUses,
                  wildShapeMax: druidMaxUses,
                  activeForm: null,
                  forms: [],
                }),
                wildShapeMax: druidMaxUses,
                wildShapeCurrent: Math.min(
                  druidMaxUses,
                  (druidResources?.wildShapeCurrent ?? druidMaxUses) + 1
                ),
              },
            }
          : {}),
        ...(character.classId === 'bardo' && character.level >= 5
          ? {
              bard: {
                ...normalizedBardResources,
                inspirationCurrent: normalizedBardResources.inspirationMax,
              },
            }
          : {}),
      },
    });
  };

  return (
    <div
      className={`min-h-screen relative text-zinc-100 transition-colors duration-500 overflow-x-hidden bg-class-${character.classId} ${
        isShaking ? 'shake-active' : ''
      } ${stealthActive ? 'stealth-shadows' : ''}`}
    >
      {/* Background Weather / Particles / Vignette FX Engine */}
      <FxLayer
        classId={character.classId}
        isShaking={isShaking}
        isStealth={stealthActive}
        isRaging={character.classResources.barbarian?.isRaging ?? false}
        auraActive={auraActive}
      />

      {/* Class Thematic SVG Borders & Corner Ornaments */}
      <ClassFrameDecorations classId={character.classId} />

      {/* Desktop Fixed Sidebar */}
      <div className="hidden lg:block">
        <Sidebar
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          onSaveSheet={handleSaveSheet}
          onOpenManageModal={() => setManageModalOpen(true)}
          onOpenNewCharacter={() => setActiveTab('creator')}
          isSavedJustNow={isSavedJustNow}
          character={character}
        />
      </div>

      {/* Mobile Drawer Sidebar */}
      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setMobileSidebarOpen(false)}
          />
          <div className="relative z-50">
            <Sidebar
              activeTab={activeTab}
              onSelectTab={(tab) => {
                setActiveTab(tab);
                setMobileSidebarOpen(false);
              }}
              onSaveSheet={handleSaveSheet}
              onOpenManageModal={() => {
                setManageModalOpen(true);
                setMobileSidebarOpen(false);
              }}
              onOpenNewCharacter={() => {
                setActiveTab('creator');
                setMobileSidebarOpen(false);
              }}
              isSavedJustNow={isSavedJustNow}
              character={character}
            />
          </div>
        </div>
      )}

      {/* Main Content Area (Offset by 288px on lg screens) */}
      <div className="lg:pl-72 flex flex-col min-h-screen relative z-10">
        {/* Top Header */}
        <Header
          character={character}
          onToggleMobileSidebar={() => setMobileSidebarOpen(!mobileSidebarOpen)}
          onUndo={handleUndo}
          canUndo={undoStack.length > 0}
          onSaveSheet={handleSaveSheet}
          onOpenManageModal={() => setManageModalOpen(true)}
          onOpenNewCharacter={() => setActiveTab('creator')}
          onOpenDiceTray={() => handleOpenDiceTray()}
        />

        {/* Content Container */}
        <main className="flex-1 px-4 md:px-8 py-6 max-w-7xl w-full mx-auto">
          {/* Class Resonance & Profile Banner */}
          <ClassResonanceBanner
            character={character}
            onUpdateClass={(classId: ClassId) => updateCharacter({ ...character, classId })}
            onUpdateElement={(elementalAffinity: ElementalAffinity) =>
              updateCharacter({ ...character, elementalAffinity })
            }
            onSaveSheet={handleSaveSheet}
            onOpenManageModal={() => setManageModalOpen(true)}
            onOpenNewCharacter={() => setActiveTab('creator')}
            onOpenClassSelectorModal={() => setClassSelectorModalOpen(true)}
          />

          {/* Active View */}
          {activeTab === 'sheet' && (
            <CharacterSheetView
              character={character}
              onUpdate={updateCharacter}
              onOpenDiceTray={handleOpenDiceTray}
              onOpenLevelUp={() => setLevelUpModalOpen(true)}
              onOpenShortRest={() => setShortRestModalOpen(true)}
              onTriggerShake={handleTriggerShake}
              onTriggerAuraPulse={handleTriggerAuraPulse}
              onToggleStealthMode={(active) => setStealthActive(active)}
              onUpdateInitiative={handleUpdateInitiative}
            />
          )}

          {activeTab === 'combat' && (
            <CombatTurnView
              key={character.id}
              character={character}
              onUpdate={updateCharacter}
              onOpenDiceTray={handleOpenDiceTray}
              onOpenShortRest={() => setShortRestModalOpen(true)}
              combatants={combatants}
              onUpdateCombatants={setCombatants}
            />
          )}

          {activeTab === 'grimoire' && (
            <GrimoireCardsView
              character={character}
              onUpdate={updateCharacter}
              onOpenDiceTray={handleOpenDiceTray}
            />
          )}

          {activeTab === 'creator' && (
            <CharacterCreatorView
              onComplete={(newSheet) => {
                updateCharacter(newSheet);
                setActiveTab('sheet');
              }}
              onCancel={() => setActiveTab('sheet')}
            />
          )}
        </main>
      </div>

      {/* Modals */}
      <DiceTrayModal
        isOpen={diceTrayOpen}
        onClose={() => {
          setDiceTrayOpen(false);
          setDiceTrayFormula(null);
          diceTrayCallbackRef.current = null;
        }}
        presetFormula={diceTrayFormula}
        character={character}
        onRollComplete={(res) => {
          if (diceTrayCallbackRef.current) {
            diceTrayCallbackRef.current(res);
          }
          // Clear after handling so next roll can't reuse an old callback.
          diceTrayCallbackRef.current = null;
        }}
      />

      <ManageSheetModal
        isOpen={manageModalOpen}
        onClose={() => setManageModalOpen(false)}
        currentCharacter={character}
        onLoadCharacter={(char) => updateCharacter(char)}
        onResetDefaults={() => updateCharacter(DEFAULT_CHARACTERS[0])}
      />

      <ClassSelectorModal
        isOpen={classSelectorModalOpen}
        onClose={() => setClassSelectorModalOpen(false)}
        currentClassId={character.classId}
        onSelectClass={(classId) => updateCharacter({ ...character, classId })}
      />

      <LevelUpDialog
        isOpen={levelUpModalOpen}
        onClose={() => setLevelUpModalOpen(false)}
        character={character}
        onConfirmLevelUp={handleLevelUpConfirm}
      />

      <ShortRestDialog
        isOpen={shortRestModalOpen}
        onClose={() => setShortRestModalOpen(false)}
        character={character}
        onApplyHealing={handleShortRestHealing}
      />
    </div>
  );
}
