import React, { useState, useEffect, useCallback } from 'react';
import {
  CharacterSheet,
  CombatRoundState,
  TacticalCard,
  ScreenId,
  ClassKey,
  ElementAffinity,
  DiceRollResult,
} from './types';
import { CLASS_THEMES, ELEMENT_ACCENTS } from './themes';
import {
  DEFAULT_CHARACTER,
  DEFAULT_COMBAT_STATE,
  DEFAULT_TACTICAL_CARDS,
} from './data/defaultData';
import {
  playDiceRollSound,
  playNat20Sound,
  playNat1Sound,
  playSpellCastSound,
  playHealSound,
} from './utils/audio';

import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { CharacterSheetView } from './components/CharacterSheetView';
import { CombatTurnView } from './components/CombatTurnView';
import { GrimoireCardsView } from './components/GrimoireCardsView';
import { CharacterCreatorView } from './components/CharacterCreatorView';
import { DiceTrayModal } from './components/DiceTrayModal';
import { ManageSheetModal } from './components/ManageSheetModal';
import { ClassResonanceSelector } from './components/ClassResonanceSelector';

export function App() {
  // Navigation & Class Tuning State
  const [currentScreen, setCurrentScreen] = useState<ScreenId>('hoja-de-personaje');
  const [currentClass, setCurrentClass] = useState<ClassKey>('mago');
  const [currentElement, setCurrentElement] = useState<ElementAffinity>('neutral');

  // Core Applet State
  const [character, setCharacter] = useState<CharacterSheet>(DEFAULT_CHARACTER);
  const [combatState, setCombatState] = useState<CombatRoundState>(DEFAULT_COMBAT_STATE);
  const [cards, setCards] = useState<TacticalCard[]>(DEFAULT_TACTICAL_CARDS);

  // Dice Rolls
  const [latestRoll, setLatestRoll] = useState<DiceRollResult | null>(null);
  const [isDiceTrayOpen, setIsDiceTrayOpen] = useState<boolean>(false);
  const [rollHistory, setRollHistory] = useState<DiceRollResult[]>([]);

  // Modals & Drawers
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isManageModalOpen, setIsManageModalOpen] = useState(false);
  const [bannerMessage, setBannerMessage] = useState<string | null>(null);

  // Dynamic CSS Variables sync based on selected Class & Element
  useEffect(() => {
    const theme = CLASS_THEMES[currentClass] || CLASS_THEMES.mago;
    const elem = ELEMENT_ACCENTS[currentElement];

    const root = document.documentElement;
    // Primary & containers
    root.style.setProperty('--theme-primary', currentElement !== 'neutral' ? elem.color : theme.colors.primary);
    root.style.setProperty('--theme-primary-container', theme.colors.primaryContainer);
    root.style.setProperty('--theme-on-primary-container', theme.colors.onPrimaryContainer);

    // Secondary & glow
    root.style.setProperty('--theme-secondary', theme.colors.secondary);
    root.style.setProperty('--theme-secondary-container', theme.colors.secondaryContainer);
    root.style.setProperty('--theme-on-secondary-container', theme.colors.onSecondaryContainer);
    root.style.setProperty('--theme-glow', currentElement !== 'neutral' ? elem.glow : theme.colors.borderGlow);
    root.style.setProperty('--theme-accent', currentElement !== 'neutral' ? elem.color : theme.colors.accent);
  }, [currentClass, currentElement]);

  const handleSelectClass = (classKey: ClassKey) => {
    setCurrentClass(classKey);
    setCharacter((prev) => ({ ...prev, classKey }));
  };

  const showBanner = (msg: string) => {
    setBannerMessage(msg);
    setTimeout(() => {
      setBannerMessage(null);
    }, 3000);
  };

  // Roll Dice Engine
  const handleRollDice = useCallback(
    (
      label: string,
      modifier: number,
      subtext?: string,
      sides = 20,
      count = 1,
      advantageMode: 'normal' | 'advantage' | 'disadvantage' = 'normal'
    ) => {
      playDiceRollSound();
      const rolls = Array.from({ length: count }, () => Math.floor(Math.random() * sides) + 1);
      const d20 = advantageMode === 'advantage'
        ? Math.max(...rolls)
        : advantageMode === 'disadvantage'
          ? Math.min(...rolls)
          : rolls.reduce((sum, value) => sum + value, 0);
      const total = d20 + modifier;
      const isNat20 = sides === 20 && count === 1 && d20 === 20;
      const isNat1 = sides === 20 && count === 1 && d20 === 1;

      if (isNat20) {
        setTimeout(playNat20Sound, 150);
      } else if (isNat1) {
        setTimeout(playNat1Sound, 150);
      }

      const result: DiceRollResult = {
        id: `roll-${Date.now()}`,
        title: label,
        d20,
        modifier,
        total,
        isNat20,
        isNat1,
        subtext,
        timestamp: new Date(),
        diceSides: sides,
        diceCount: count,
        advantageMode,
      };

      setLatestRoll(result);
      setRollHistory((prev) => [result, ...prev.slice(0, 19)]);
      setIsDiceTrayOpen(true);
    },
    []
  );

  // Quick d20 roll from header
  const handleQuickRoll = () => {
    handleRollDice('Tirada Rápida d20', 0, 'Sin modificador');
  };

  // Resting Handlers
  const handleShortRest = () => {
    playHealSound();
    setCharacter((prev) => {
      const restoredHp = Math.min(prev.maxHp, prev.currentHp + 8);
      return {
        ...prev,
        currentHp: restoredHp,
      };
    });
    setCards((prev) => prev.map((card) => (
      card.recharge === 'Descanso Corto'
        ? { ...card, resourceUsed: 0, isExpended: false }
        : card
    )));
    showBanner('Descanso Corto completado: Se han recuperado puntos de golpe y recursos breves.');
  };

  const handleLongRest = () => {
    playHealSound();
    setCharacter((prev) => ({
      ...prev,
      currentHp: prev.maxHp,
      tempHp: 0,
      deathSaves: { successes: 0, failures: 0 },
      spellSlots: prev.spellSlots.map((s) => ({ ...s, current: s.max })),
    }));
    setCombatState((prev) => ({
      ...prev,
      round: 1,
      remainingMovement: prev.maxMovement,
      actionUsed: false,
      bonusActionUsed: false,
      reactionUsed: false,
    }));
    setCards((prev) => prev.map((card) => (
      card.recharge === 'Descanso Corto' || card.recharge === 'Descanso Largo'
        ? { ...card, resourceUsed: 0, isExpended: false }
        : card
    )));
    showBanner('Descanso Largo completado: Vitalidad al 100%, ranuras de conjuro restauradas.');
  };

  // Card Handlers
  const handleAddCard = (newCard: TacticalCard) => {
    playSpellCastSound();
    setCards((prev) => [newCard, ...prev]);
    showBanner(`Tarjeta "${newCard.title}" añadida al Grimorio.`);
  };

  const handleDeleteCard = (cardId: string) => {
    setCards((prev) => prev.filter((c) => c.id !== cardId));
    showBanner('Tarjeta eliminada del grimorio.');
  };

  // Character Created
  const handleCharacterCreated = (newChar: CharacterSheet, classKey: ClassKey) => {
    setCharacter(newChar);
    setCurrentClass(classKey);
    setCurrentScreen('hoja-de-personaje');
    showBanner(`¡Héroe ${newChar.name} forjado con éxito!`);
  };

  return (
    <div className="min-h-screen bg-[#14121b] text-[#e6e0ee] flex">
      {/* Notification Toast */}
      {bannerMessage && (
        <div className="fixed top-24 right-4 z-50 bg-[#1c1a24] text-white px-4 py-2.5 rounded-lg border border-[var(--theme-primary,#fbbf24)] shadow-2xl flex items-center gap-2 font-medium text-xs animate-bounce">
          <span className="material-symbols-outlined text-[var(--theme-primary,#fbbf24)] text-base">
            auto_awesome
          </span>
          <span>{bannerMessage}</span>
        </div>
      )}

      {/* Persistent Left Sidebar */}
      <Sidebar
        currentScreen={currentScreen}
        onNavigate={setCurrentScreen}
        currentClass={currentClass}
        onSelectClass={handleSelectClass}
        onSaveSheet={() => setIsManageModalOpen(true)}
        onOpenLoadModal={() => setIsManageModalOpen(true)}
        onNewSheet={() => setCurrentScreen('creador-de-personaje')}
        isMobileOpen={isMobileMenuOpen}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
      />

      {/* Main Container */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-72">
        {/* Fixed Header */}
        <Header
          character={character}
          onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
          onTriggerQuickRoll={handleQuickRoll}
          onSaveSheet={() => setIsManageModalOpen(true)}
          onOpenLoadModal={() => setIsManageModalOpen(true)}
          onNewSheet={() => setCurrentScreen('creador-de-personaje')}
        />

        {/* Dynamic Main View Area */}
        <main className="flex-1 pt-24 px-4 lg:px-8 max-w-7xl w-full mx-auto">
          <ClassResonanceSelector
            currentClass={currentClass}
            onSelectClass={handleSelectClass}
            currentElement={currentElement}
            onSelectElement={setCurrentElement}
            onSaveSheet={() => setIsManageModalOpen(true)}
            onOpenLoadModal={() => setIsManageModalOpen(true)}
            onNewSheet={() => setCurrentScreen('creador-de-personaje')}
          />
          {/* Screen Routing */}
          {currentScreen === 'hoja-de-personaje' && (
            <CharacterSheetView
              character={character}
              onUpdateCharacter={setCharacter}
              onRollDice={handleRollDice}
              onShortRest={handleShortRest}
              onLongRest={handleLongRest}
            />
          )}

          {currentScreen === 'turno-de-combate' && (
            <CombatTurnView
              combatState={combatState}
              cards={cards}
              onUpdateCombat={setCombatState}
              onUpdateCard={(cardId, updates) => {
                setCards((prev) => prev.map((c) => (c.id === cardId ? { ...c, ...updates } : c)));
              }}
              onRollDice={handleRollDice}
              onShortRest={handleShortRest}
              onLongRest={handleLongRest}
            />
          )}

          {currentScreen === 'grimorio-de-tarjetas' && (
            <GrimoireCardsView
              cards={cards}
              onAddCard={handleAddCard}
              onDeleteCard={handleDeleteCard}
              onRollDice={handleRollDice}
            />
          )}

          {currentScreen === 'creador-de-personaje' && (
            <CharacterCreatorView
              onCharacterCreated={handleCharacterCreated}
              onCancel={() => setCurrentScreen('hoja-de-personaje')}
            />
          )}
        </main>
      </div>

      {/* Floating HUD: Dice Tray */}
      <DiceTrayModal
        latestRoll={latestRoll}
        isOpen={isDiceTrayOpen}
        onClose={() => setIsDiceTrayOpen(false)}
        rollHistory={rollHistory}
        onRollDice={handleRollDice}
      />

      {/* Manage Sheet / Save / Load Modal */}
      <ManageSheetModal
        isOpen={isManageModalOpen}
        onClose={() => setIsManageModalOpen(false)}
        currentCharacter={character}
        currentCards={cards}
        onLoadCharacter={(char, loadedCards, classKey) => {
          setCharacter(char);
          if (loadedCards && loadedCards.length > 0) setCards(loadedCards);
          if (classKey) handleSelectClass(classKey);
          showBanner(`Ficha "${char.name}" cargada.`);
        }}
        onResetDefaults={() => {
          setCharacter(DEFAULT_CHARACTER);
          setCards(DEFAULT_TACTICAL_CARDS);
          setCombatState(DEFAULT_COMBAT_STATE);
          setCurrentClass('mago');
          showBanner('Personaje restablecido a los valores por defecto.');
        }}
      />
    </div>
  );
}
export default App;
