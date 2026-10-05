import React, { useState, useEffect, useCallback } from 'react';
import { CharacterSheet, ClassId, ElementalAffinity } from './types/character';
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

const STORAGE_KEY = 'grimorio_arcanum_active_character_v5';

export default function App() {
  // Active Character State with Undo stack
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

  // Visual FX Triggers
  const [isShaking, setIsShaking] = useState(false);
  const [stealthActive, setStealthActive] = useState(false);
  const [auraActive, setAuraActive] = useState(false);

  const currentTheme = CLASS_THEMES[character.classId] || CLASS_THEMES.mago;

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
    setUndoStack((prev) => [...prev.slice(-15), character]);
    setCharacter(updated);
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

  const handleShortRestHealing = (hpRegained: number, diceSpent: number) => {
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
          onOpenDiceTray={() => setDiceTrayOpen(true)}
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
              onOpenDiceTray={() => setDiceTrayOpen(true)}
              onOpenLevelUp={() => setLevelUpModalOpen(true)}
              onOpenShortRest={() => setShortRestModalOpen(true)}
              onTriggerShake={handleTriggerShake}
              onTriggerAuraPulse={handleTriggerAuraPulse}
              onToggleStealthMode={(active) => setStealthActive(active)}
            />
          )}

          {activeTab === 'combat' && (
            <CombatTurnView
              character={character}
              onUpdate={updateCharacter}
              onOpenDiceTray={() => setDiceTrayOpen(true)}
            />
          )}

          {activeTab === 'grimoire' && (
            <GrimoireCardsView
              character={character}
              onUpdate={updateCharacter}
              onOpenDiceTray={() => setDiceTrayOpen(true)}
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
        onClose={() => setDiceTrayOpen(false)}
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
