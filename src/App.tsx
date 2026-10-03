import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  CharacterSheet,
  CombatRoundState,
  TacticalCard,
  ScreenId,
  ClassKey,
  ElementAffinity,
  AppSettings,
  DiceRollResult,
  DiceRollOutcome,
  RollKind,
  Ability,
  ConditionId,
  ConcentrationState,
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
import { usePersistentState } from './hooks/usePersistentState';
import { getHitDicePool, longRestHitDiceRecovery, shortRestHeal } from './lib/hitDice';
import { ShortRestDialog } from './components/ShortRestDialog';
import { getActiveConcentration } from './lib/concentration';
import { parseDiceExpression } from './lib/critical';
import { undoCardResourceUse, useCardResource } from './lib/cardResources';
import { effectiveMaxHitPoints, resolveRollModeWithExhaustion } from './lib/conditions';
import { normalizeCharacterSheet, restoreAppSettings } from './lib/persistence';
import { removeConcentrationEffects } from './lib/activeEffects';
import { rechargeClassResources } from './lib/classProgression';

import { ThemedRoot } from './components/ThemedParts';

const PERSISTENCE_VERSION = 1;

interface UndoSnapshot {
  character: CharacterSheet;
  cards: TacticalCard[];
  combat: CombatRoundState;
}

function restoreRollHistory(rolls: DiceRollResult[]): DiceRollResult[] {
  return rolls.map((roll) => ({
    ...roll,
    timestamp: new Date(String(roll.timestamp)),
  }));
}

export function App() {
  // Navigation & Class Tuning State
  const [currentScreen, setCurrentScreen] = useState<ScreenId>('hoja-de-personaje');
  const [currentElement, setCurrentElement] = useState<ElementAffinity>('neutral');

  // Core Applet State
  const [character, setCharacter, clearCharacter, characterSaveStatus] = usePersistentState<CharacterSheet>(
    'grimorio:character',
    DEFAULT_CHARACTER,
    PERSISTENCE_VERSION,
    normalizeCharacterSheet,
  );
  const [currentClass, setCurrentClass] = useState<ClassKey>(() => character.classKey ?? 'mago');

  const currentTheme = CLASS_THEMES[currentClass];
  const [combatState, setCombatState, clearCombatState, combatSaveStatus] = usePersistentState<CombatRoundState>(
    'grimorio:combat',
    DEFAULT_COMBAT_STATE,
    PERSISTENCE_VERSION,
  );
  const [cards, setCards, clearCards, cardsSaveStatus] = usePersistentState<TacticalCard[]>(
    'grimorio:cards',
    DEFAULT_TACTICAL_CARDS,
    PERSISTENCE_VERSION,
  );
  const [undoHistory, setUndoHistory] = useState<UndoSnapshot[]>([]);
  const [burstCount, setBurstCount] = useState(0);
  const triggerBurst = () => setBurstCount(b => b + 1);
  const [settings, setSettings, , settingsSaveStatus] = usePersistentState<AppSettings>(
    'grimorio:settings',
    { autoTrackActions: false },
    PERSISTENCE_VERSION,
    restoreAppSettings,
  );

  // Dice Rolls
  const [latestRoll, setLatestRoll] = useState<DiceRollResult | null>(null);
  const [isDiceTrayOpen, setIsDiceTrayOpen] = useState<boolean>(false);
  const [rollHistory, setRollHistory, clearRollHistory, rollHistorySaveStatus] = usePersistentState<DiceRollResult[]>(
    'grimorio:rollHistory',
    [],
    PERSISTENCE_VERSION,
    restoreRollHistory,
  );

  // Modals & Drawers
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isManageModalOpen, setIsManageModalOpen] = useState(false);
  const [isShortRestDialogOpen, setIsShortRestDialogOpen] = useState(false);
  const [shortRestDiceToSpend, setShortRestDiceToSpend] = useState(0);
  const [bannerMessage, setBannerMessage] = useState<string | null>(null);
  const recordUndo = useCallback(() => {
    setUndoHistory((previous) => [...previous, { character, cards, combat: combatState }].slice(-30));
  }, [character, cards, combatState]);
  const storageErrorNotified = useRef(false);
  const persistenceStatuses = [characterSaveStatus, combatSaveStatus, cardsSaveStatus, rollHistorySaveStatus, settingsSaveStatus];
  const hasPersistenceError = persistenceStatuses.includes('error');
  const isPersistenceSaving = persistenceStatuses.includes('saving');
  const isPersistenceSaved = persistenceStatuses.includes('saved') && !hasPersistenceError;

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

  const updateConcentration = (concentration: ConcentrationState | null) => {
    setCombatState((prev) => ({
      ...prev,
      concentration,
      concentrationSpell: concentration?.spellName ?? null,
      activeEffects: concentration
        ? prev.activeEffects
        : removeConcentrationEffects(prev.activeEffects ?? []),
    }));
  };

  const showBanner = useCallback((msg: string) => {
    setBannerMessage(msg);
    setTimeout(() => {
      setBannerMessage(null);
    }, 3000);
  }, []);

  const undoLastAction = useCallback(() => {
    const snapshot = undoHistory[undoHistory.length - 1];
    if (!snapshot) return;
    setCharacter(snapshot.character);
    setCards(snapshot.cards);
    setCombatState(snapshot.combat);
    setUndoHistory((previous) => previous.slice(0, -1));
    showBanner('Último cambio deshecho.');
  }, [undoHistory, setCharacter, setCards, setCombatState, showBanner]);

  useEffect(() => {
    const handleUndoShortcut = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'z') {
        const target = event.target as HTMLElement | null;
        if (target?.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target?.tagName ?? '')) return;
        event.preventDefault();
        undoLastAction();
      }
    };
    window.addEventListener('keydown', handleUndoShortcut);
    return () => window.removeEventListener('keydown', handleUndoShortcut);
  }, [undoLastAction]);

  const handleStorageError = useCallback(() => {
    if (storageErrorNotified.current) return;
    storageErrorNotified.current = true;
    setBannerMessage('No se pudo acceder al almacenamiento local; los cambios siguen disponibles en esta sesión.');
    setTimeout(() => setBannerMessage(null), 3000);
  }, []);

  useEffect(() => {
    if (hasPersistenceError) handleStorageError();
  }, [handleStorageError, hasPersistenceError]);

  // Roll Dice Engine
  const handleRollDice = useCallback(
    (
      label: string,
      modifier: number,
      subtext?: string,
      sides = 20,
      count = 1,
      advantageMode: 'normal' | 'advantage' | 'disadvantage' = 'normal',
      formula?: string,
      isCriticalDamage = false,
      rollKind?: RollKind,
      ability?: Ability,
    ): DiceRollOutcome => {
      playDiceRollSound();
      const storedConditions = combatState.conditions ?? [];
      const activeConditions: ConditionId[] = !combatState.isStanding && !storedConditions.includes('prone')
        ? [...storedConditions, 'prone']
        : storedConditions;
      const conditionResolution = rollKind && sides === 20 && !formula
        ? resolveRollModeWithExhaustion(
          advantageMode,
          activeConditions,
          rollKind,
          ability,
          character.exhaustionLevel ?? 0,
        )
        : { mode: advantageMode, reasons: [], autoFailed: false };
      const resolvedMode = conditionResolution.mode;
      const rollSubtext = [...(subtext ? [subtext] : []), ...conditionResolution.reasons].join(' · ');
      const parsedFormula = formula ? parseDiceExpression(formula) : null;
      const formulaRolls = parsedFormula?.dice.flatMap((term) => (
        Array.from(
          { length: term.count },
          () => term.sign * (Math.floor(Math.random() * term.sides) + 1),
        )
      ));
      const rollCount = !formula && sides === 20 && count === 1 && resolvedMode !== 'normal'
        ? 2
        : count;
      const rolls = conditionResolution.autoFailed
        ? []
        : formulaRolls ?? Array.from({ length: rollCount }, () => Math.floor(Math.random() * sides) + 1);
      const d20 = conditionResolution.autoFailed
        ? 0
        : resolvedMode === 'advantage'
        ? Math.max(...rolls)
        : resolvedMode === 'disadvantage'
          ? Math.min(...rolls)
          : rolls.reduce((sum, value) => sum + value, 0);
      const finalModifier = parsedFormula?.modifier ?? modifier;
      const total = conditionResolution.autoFailed ? 0 : d20 + finalModifier;
      const isSingleD20 = parsedFormula
        ? parsedFormula.dice.length === 1
          && parsedFormula.dice[0].count === 1
          && parsedFormula.dice[0].sides === 20
          && parsedFormula.dice[0].sign === 1
        : sides === 20 && count === 1;
      const natural = isSingleD20
        ? resolvedMode === 'advantage'
          ? Math.max(...rolls)
          : resolvedMode === 'disadvantage'
            ? Math.min(...rolls)
            : rolls[0] ?? 0
        : 0;
      const isNat20 = isSingleD20 && natural === 20;
      const isNat1 = isSingleD20 && natural === 1;

      if (isNat20) {
        setTimeout(playNat20Sound, 150);
      } else if (isNat1) {
        setTimeout(playNat1Sound, 150);
      }

      const result: DiceRollResult = {
        id: `roll-${Date.now()}`,
        title: label,
        d20,
        natural,
        modifier: finalModifier,
        total,
        isNat20,
        isNat1,
        subtext: rollSubtext,
        timestamp: new Date(),
        diceSides: sides,
        diceCount: parsedFormula
          ? parsedFormula.dice.reduce((sum, term) => sum + term.count, 0)
          : count,
        advantageMode: resolvedMode,
        diceFormula: formula,
        isCriticalDamage,
        autoFailed: conditionResolution.autoFailed,
      };

      setLatestRoll(result);
      setRollHistory((prev) => [result, ...prev.slice(0, 19)]);
      setIsDiceTrayOpen(true);
      return { natural, total, autoFailed: conditionResolution.autoFailed };
    },
    [character.exhaustionLevel, combatState.conditions]
  );

  // Quick d20 roll from header
  const handleQuickRoll = () => {
    handleRollDice('Tirada Rápida d20', 0, 'Sin modificador');
  };

  // Resting Handlers
  const handleShortRest = () => {
    setShortRestDiceToSpend(0);
    setIsShortRestDialogOpen(true);
  };

  const completeShortRest = () => {
    recordUndo();
    const pool = getHitDicePool(character);
    const diceCount = Math.max(0, Math.min(pool.remaining, shortRestDiceToSpend));
    const conMod = character.abilities.CON.modifier;
    const rolls = Array.from({ length: diceCount }, (_, index) => (
      handleRollDice(
        `Descanso corto: dado ${index + 1}/${diceCount}`,
        conMod,
        `1d${pool.dieSize} + CON (${conMod >= 0 ? '+' : ''}${conMod})`,
        pool.dieSize,
        1,
      ).natural
    ));
    const healing = shortRestHeal(rolls, conMod);
    if (healing > 0) playHealSound();
    setCharacter((prev) => {
      const currentPool = getHitDicePool(prev);
      return {
        ...prev,
        currentHp: Math.min(effectiveMaxHitPoints(prev.maxHp, prev.exhaustionLevel ?? 0), prev.currentHp + healing),
        hitDicePool: {
          ...currentPool,
          remaining: Math.max(0, currentPool.remaining - diceCount),
        },
        classResources: rechargeClassResources(prev.classResources, 'short'),
      };
    });
    setCards((prev) => prev.map((card) => (
      card.recharge === 'Descanso Corto'
        ? { ...card, resourceUsed: 0, isExpended: false }
        : card
    )));
    setIsShortRestDialogOpen(false);
    showBanner(`Descanso corto completado: ${healing} PG recuperados y recursos breves restaurados.`);
  };

  const handleLongRest = () => {
    recordUndo();
    playHealSound();
    setCharacter((prev) => ({
      ...prev,
      currentHp: effectiveMaxHitPoints(prev.maxHp, prev.exhaustionLevel ?? 0),
      tempHp: 0,
      deathSaves: { successes: 0, failures: 0 },
      spellSlots: prev.spellSlots.map((s) => ({ ...s, current: s.max })),
      hitDicePool: (() => {
        const pool = getHitDicePool(prev);
        return {
          ...pool,
          remaining: Math.min(pool.total, pool.remaining + longRestHitDiceRecovery(pool.total)),
        };
      })(),
      classResources: rechargeClassResources(prev.classResources, 'long'),
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
    const existingCard = cards.find((card) => card.id === newCard.id);
    if (existingCard) {
      setCards((prev) => prev.map((card) => card.id === newCard.id
        ? { ...newCard, resourceUsed: existingCard.resourceUsed, isExpended: existingCard.isExpended }
        : card));
      showBanner(`Tarjeta "${newCard.title}" actualizada.`);
    } else {
      setCards((prev) => [newCard, ...prev]);
      showBanner(`Tarjeta "${newCard.title}" añadida al Grimorio.`);
    }
  };

  const handleDeleteCard = (cardId: string) => {
    recordUndo();
    setCards((prev) => prev.filter((c) => c.id !== cardId));
    showBanner('Tarjeta eliminada del grimorio.');
  };

  const handleUseCard = (cardId: string): boolean => {
    const card = cards.find((item) => item.id === cardId);
    if (!card) return false;

    const result = useCardResource(card);
    if (!result.allowed) {
      const confirmed = window.confirm(`"${card.title}" no tiene usos disponibles. ¿Quieres usarla de todos modos?`);
      if (!confirmed) return false;
      const confirmedUse = useCardResource(card, true);
      if (!confirmedUse.allowed) return false;
      if (card.consumesResource && (card.resourceMax ?? 0) > 0) recordUndo();
      setCards((prev) => prev.map((item) => item.id === cardId
        ? { ...item, resourceUsed: confirmedUse.resourceUsed }
        : item));
      return true;
    }

    if (card.consumesResource && (card.resourceMax ?? 0) > 0) {
      recordUndo();
      setCards((prev) => prev.map((item) => item.id === cardId
        ? { ...item, resourceUsed: result.resourceUsed }
        : item));
    }
    return true;
  };

  const handleUndoCardUse = (cardId: string) => {
    setCards((prev) => prev.map((card) => card.id === cardId
      ? { ...card, resourceUsed: undoCardResourceUse(card) }
      : card));
  };

  // Character Created
  const handleCharacterCreated = (newChar: CharacterSheet, classKey: ClassKey) => {
    setUndoHistory([]);
    setCharacter(normalizeCharacterSheet(newChar));
    setCurrentClass(classKey);
    setCurrentScreen('hoja-de-personaje');
    showBanner(`¡Héroe ${newChar.name} forjado con éxito!`);
  };

  return (
    <ThemedRoot cls={currentClass} element={currentElement} state="default" burst={burstCount}>
      <div
        className="min-h-screen bg-transparent text-[#e6e0ee] flex"
      >
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
          onUndo={undoLastAction}
          canUndo={undoHistory.length > 0}
        />

        {/* Dynamic Main View Area */}
        <main className="flex-1 pt-24 px-4 lg:px-8 max-w-7xl w-full mx-auto">
          <div aria-live="polite" className="h-4 text-right text-[10px] text-gray-400">
            {isPersistenceSaving ? 'Guardando…' : isPersistenceSaved ? 'Guardado' : ''}
          </div>
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
              activeConditions={combatState.conditions ?? (combatState.isStanding ? [] : ['prone'])}
              concentration={getActiveConcentration(combatState)}
              onConcentrationChange={updateConcentration}
              onUpdateCharacter={setCharacter}
              onRollDice={handleRollDice}
              onShortRest={handleShortRest}
              onLongRest={handleLongRest}
              onBeforeUndoableAction={recordUndo}
              onNotify={showBanner}
              onTriggerBurst={triggerBurst}
            />
          )}

          {currentScreen === 'turno-de-combate' && (
            <CombatTurnView
              combatState={combatState}
              character={character}
              cards={cards}
              settings={settings}
              onSettingsChange={setSettings}
              onUpdateCombat={setCombatState}
              onUpdateCharacter={setCharacter}
              onUpdateCard={(cardId, updates) => {
                setCards((prev) => prev.map((c) => (c.id === cardId ? { ...c, ...updates } : c)));
              }}
              onUseCard={handleUseCard}
              onUndoCardUse={handleUndoCardUse}
              onRollDice={handleRollDice}
              onShortRest={handleShortRest}
              onLongRest={handleLongRest}
              onNotify={showBanner}
              onBeforeUndoableAction={recordUndo}
              onTriggerBurst={triggerBurst}
            />
          )}

          {currentScreen === 'grimorio-de-tarjetas' && (
            <GrimoireCardsView
              character={character}
              cards={cards}
              onAddCard={handleAddCard}
              onDeleteCard={handleDeleteCard}
              onUseCard={handleUseCard}
              onUndoCardUse={handleUndoCardUse}
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

      {isShortRestDialogOpen && (
        <ShortRestDialog
          hitDicePool={getHitDicePool(character)}
          diceToSpend={shortRestDiceToSpend}
          onDiceToSpendChange={(count) => setShortRestDiceToSpend(count)}
          onCancel={() => setIsShortRestDialogOpen(false)}
          onConfirm={completeShortRest}
        />
      )}

      {/* Manage Sheet / Save / Load Modal */}
      <ManageSheetModal
        isOpen={isManageModalOpen}
        onClose={() => setIsManageModalOpen(false)}
        currentCharacter={character}
        currentCards={cards}
        currentCombat={combatState}
        onStorageError={handleStorageError}
        onLoadCharacter={(char, loadedCards, classKey, loadedCombat) => {
          setUndoHistory([]);
          setCharacter(normalizeCharacterSheet(char));
          if (loadedCards && loadedCards.length > 0) setCards(loadedCards);
          if (classKey) handleSelectClass(classKey);
          setCombatState(loadedCombat ?? DEFAULT_COMBAT_STATE);
          showBanner(`Ficha "${char.name}" cargada.`);
        }}
        onResetDefaults={() => {
          setUndoHistory([]);
          clearCharacter();
          clearCards();
          clearCombatState();
          clearRollHistory();
          setCharacter(normalizeCharacterSheet(DEFAULT_CHARACTER));
          setCards(DEFAULT_TACTICAL_CARDS);
          setCombatState(DEFAULT_COMBAT_STATE);
          setCurrentClass('mago');
          showBanner('Personaje restablecido a los valores por defecto.');
        }}
      />
    </div>
    </ThemedRoot>
  );
}
export default App;
