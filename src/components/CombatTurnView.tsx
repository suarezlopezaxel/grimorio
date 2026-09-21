import React, { useEffect, useState } from 'react';
import { CombatRoundState, TacticalCard } from '../types';

interface CombatTurnViewProps {
  combatState: CombatRoundState;
  cards: TacticalCard[];
  onUpdateCombat: (updater: (prev: CombatRoundState) => CombatRoundState) => void;
  onUpdateCard?: (cardId: string, updates: Partial<TacticalCard>) => void;
  onRollDice: (label: string, modifier: number, subtext?: string) => void;
  onShortRest: () => void;
  onLongRest: () => void;
}

export const CombatTurnView: React.FC<CombatTurnViewProps> = ({
  combatState,
  cards,
  onUpdateCombat,
  onUpdateCard,
  onRollDice,
  onShortRest,
  onLongRest,
}) => {
  // Track cards expended in the current round
  const [roundExpendedCards, setRoundExpendedCards] = useState<Record<string, boolean>>({});
  const [turnFlash, setTurnFlash] = useState(false);

  useEffect(() => {
    const cardIds = new Set(cards.map((card) => card.id));
    setRoundExpendedCards((previous) => {
      const next = Object.fromEntries(
        Object.entries(previous).filter(([cardId]) => cardIds.has(cardId))
      );
      return Object.keys(next).length === Object.keys(previous).length ? previous : next;
    });
  }, [cards]);

  // Toggle card expenditure in current turn
  const handleToggleCardExpend = (cardId: string) => {
    setRoundExpendedCards((prev) => ({
      ...prev,
      [cardId]: !prev[cardId],
    }));
  };

  // Toggle a resource checkbox (e.g. Second Wind ☐ ☐)
  const handleToggleResourceBox = (cardId: string, boxIndex: number, e: React.MouseEvent) => {
    e.stopPropagation();
    const card = cards.find((item) => item.id === cardId);
    if (!card || !onUpdateCard) return;
    const used = card.resourceUsed || 0;
    const nextUsed = boxIndex < used ? used - 1 : used + 1;
    onUpdateCard(cardId, { resourceUsed: Math.max(0, Math.min(card.resourceMax || 0, nextUsed)) });
  };

  // Siguiente Turno: Reinicia las acciones gastadas y avanza asalto
  const handleNextTurn = () => {
    setTurnFlash(true);
    setTimeout(() => setTurnFlash(false), 500);

    // Reinicia las acciones gastadas en este turno
    setRoundExpendedCards({});

    onUpdateCombat((prev) => ({
      ...prev,
      round: prev.round + 1,
      remainingMovement: prev.maxMovement,
      hasDash: false,
      actionUsed: false,
      bonusActionUsed: false,
      reactionUsed: false,
    }));
  };

  const handleSpendMovement = (feet: number) => {
    onUpdateCombat((prev) => ({
      ...prev,
      remainingMovement: Math.max(0, prev.remainingMovement - feet),
    }));
  };

  const handleResetMovement = () => {
    onUpdateCombat((prev) => ({
      ...prev,
      remainingMovement: prev.maxMovement,
    }));
  };

  const handleShortRest = () => {
    setRoundExpendedCards({});
    onShortRest();
  };

  const handleLongRest = () => {
    setRoundExpendedCards({});
    onLongRest();
  };

  const handleToggleDash = () => {
    onUpdateCombat((prev) => {
      const nextDash = !prev.hasDash;
      const nextMax = nextDash ? prev.maxMovement + 30 : Math.max(30, prev.maxMovement - 30);
      const nextRem = nextDash ? prev.remainingMovement + 30 : Math.min(prev.remainingMovement, nextMax);
      return {
        ...prev,
        hasDash: nextDash,
        maxMovement: nextMax,
        remainingMovement: nextRem,
      };
    });
  };

  // Filter cards by the four requested tactical columns:
  // 1. Acción
  // 2. Acción adicional
  // 3. Reacción
  // 4. Movimiento
  const actionCards = cards.filter(
    (c) => c.actionType === 'Acción' || (!c.actionType && c.category === 'attack')
  );
  const bonusActionCards = cards.filter((c) => c.actionType === 'Acción Adicional');
  const reactionCards = cards.filter((c) => c.actionType === 'Reacción');
  const movementCards = cards.filter((c) => c.actionType === 'Movimiento');

  // Fallback cards if some categories don't have user cards
  const standardMovementActions = [
    {
      id: 'move-std-1',
      title: 'Desplazamiento Base',
      actionType: 'Movimiento' as const,
      reach: `${combatState.remainingMovement} ft disponibles`,
      resourceDesc: 'Recurso: Velocidad de marcha',
      summaryLine: 'Moverte hasta tu velocidad máxima en cualquier dirección.',
      mechanic: 'Puedes dividir tu movimiento antes y después de realizar acciones.',
    },
    {
      id: 'move-std-2',
      title: 'Levantarse (Stand Up)',
      actionType: 'Movimiento' as const,
      reach: 'Uno mismo',
      resourceDesc: 'Cuesta: La mitad de tu velocidad (15 ft)',
      summaryLine: 'Dejar de estar derribado (Prone).',
      mechanic: 'Requiere gastar 15 pies de tu movimiento disponible.',
    },
    {
      id: 'move-std-3',
      title: 'Destrabarse (Disengage)',
      actionType: 'Acción' as const,
      reach: 'Uno mismo',
      resourceDesc: 'A voluntad',
      summaryLine: 'Destrabarse - Acción - A voluntad - No provocas ataques de oportunidad este turno.',
      mechanic: 'Tu movimiento no provoca ataques de oportunidad durante el resto del asalto.',
    },
  ];

  return (
    <div className={`flex flex-col w-full pb-16 transition-opacity ${turnFlash ? 'opacity-75' : 'opacity-100'}`}>
      {/* Top Combat Header: Asalto, Iniciativa, Movimiento Restante & Botón Siguiente Turno */}
      <div className="relative overflow-hidden rounded-xl bg-[#1c1a24] shadow-xl border border-white/5 p-4 lg:p-5 mb-6">
        <div className="absolute -right-16 -top-16 w-80 h-80 rounded-full bg-[var(--theme-glow,rgba(87,27,193,0.2))] blur-3xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            {/* Contador de Asalto */}
            <div className="flex items-center gap-2.5 bg-[#0f0d16] px-3.5 py-1.5 rounded-lg border border-white/5 shadow-inner">
              <span className="font-runic text-[10px] text-gray-400 uppercase font-bold">
                Combate
              </span>
              <span className="font-garamond text-xl text-[var(--theme-primary,#fbbf24)] font-bold flex items-center gap-1.5">
                <span className="material-symbols-outlined text-base text-[var(--theme-primary,#fbbf24)]">
                  hourglass_top
                </span>
                <span>Asalto {combatState.round}</span>
              </span>
            </div>

            {/* Iniciativa Score */}
            <div className="flex items-center gap-2 bg-[#0f0d16] px-3 py-1.5 rounded-lg border border-white/5 shadow-inner">
              <span className="font-runic text-[10px] text-gray-400 uppercase font-bold">
                Iniciativa:
              </span>
              <span className="font-garamond text-xl text-[var(--theme-secondary,#d0bcff)] font-bold leading-none">
                {combatState.initiativeScore}
              </span>
            </div>

            {/* Postura y Concentración */}
            <button
              onClick={() => onUpdateCombat((prev) => ({ ...prev, isStanding: !prev.isStanding }))}
              className="flex items-center gap-1.5 bg-[#211e28] hover:bg-[#2b2932] px-2.5 py-1.5 rounded text-gray-200 border border-white/5 text-xs transition-colors"
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  combatState.isStanding ? 'bg-emerald-400' : 'bg-red-400 animate-ping'
                }`}
              />
              <span className="font-semibold">
                {combatState.isStanding ? 'En pie' : 'Derribado (Prone)'}
              </span>
            </button>

            {/* Concentración */}
            <div
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded border text-xs ${
                combatState.concentrationSpell
                  ? 'bg-[var(--theme-secondary-container,#571bc1)]/40 border-[var(--theme-secondary,#d0bcff)]/30 text-[var(--theme-on-secondary-container,#e9ddff)]'
                  : 'bg-[#211e28] border-white/5 text-gray-400'
              }`}
            >
              <span className="material-symbols-outlined text-xs text-[var(--theme-secondary,#d0bcff)]">
                psychology
              </span>
              <span>
                Concentración: <strong>{combatState.concentrationSpell || 'Ninguna'}</strong>
              </span>
            </div>
          </div>

          {/* Quick Rests & Botón Siguiente Turno */}
          <div className="flex items-center gap-2">
            {([
              ['actionUsed', 'Acción'],
              ['bonusActionUsed', 'Adicional'],
              ['reactionUsed', 'Reacción'],
            ] as const).map(([stateKey, label]) => (
              <button
                key={stateKey}
                onClick={() => onUpdateCombat((prev) => ({ ...prev, [stateKey]: !prev[stateKey] }))}
                className={`px-2 py-1.5 rounded border text-[10px] font-bold transition-colors ${
                  combatState[stateKey]
                    ? 'bg-red-500/20 border-red-500/40 text-red-300'
                    : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                }`}
                title={`Marcar ${label}`}
              >
                {label}: {combatState[stateKey] ? 'Gastada' : 'Libre'}
              </button>
            ))}
            <button
              onClick={handleShortRest}
              className="px-2.5 py-1.5 rounded bg-[#211e28] hover:bg-[#2b2932] text-gray-300 text-xs border border-white/5"
              title="Descanso Corto"
            >
              D. Corto
            </button>
            <button
              onClick={handleLongRest}
              className="px-2.5 py-1.5 rounded bg-[#211e28] hover:bg-[#2b2932] text-gray-300 text-xs border border-white/5"
              title="Descanso Largo"
            >
              D. Largo
            </button>

            {/* BOTÓN SIGUIENTE TURNO */}
            <button
              onClick={handleNextTurn}
              id="btn-next-turn"
              className="group flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--theme-primary,#fbbf24)] text-[#261a00] font-bold text-xs transition-all hover:brightness-110 shadow-lg cursor-pointer active:scale-95"
              title="Avanza al siguiente asalto y reinicia todas las acciones gastadas"
            >
              <span className="material-symbols-outlined text-base group-hover:rotate-45 transition-transform">
                swords
              </span>
              <span>Siguiente Turno</span>
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================== */}
      {/* CUATRO COLUMNAS TÁCTICAS:                                 */}
      {/* 1. ACCIÓN | 2. ACCIÓN ADICIONAL | 3. REACCIÓN | 4. MOVIMIENTO */}
      {/* ========================================================== */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {/* ==================================================== */}
        {/* COLUMNA 1: ACCIÓN (Color Carmesí / Rojo Vivo)        */}
        {/* ==================================================== */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between bg-[#1c1a24] px-3.5 py-2 rounded-xl border border-red-500/30 shadow-md">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]"></span>
              <h3 className="font-garamond text-base text-white font-bold tracking-wide">
                Acción
              </h3>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded bg-red-500/20 text-red-300 font-bold border border-red-500/30 uppercase">
              1 por turno
            </span>
          </div>

          <div className="flex flex-col gap-3">
            {actionCards.map((card) => {
              const isExpended = roundExpendedCards[card.id];
              const boxes = card.resourceMax ? Array.from({ length: card.resourceMax }, (_, index) => index < (card.resourceUsed || 0)) : [];

              return (
                <div
                  key={card.id}
                  onClick={() => handleToggleCardExpend(card.id)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer relative group ${
                    isExpended
                      ? 'bg-[#15131b]/60 border-white/5 opacity-50 grayscale'
                      : 'bg-[#1c1a24] border-red-500/20 hover:border-red-500/50 shadow-md hover:-translate-y-0.5'
                  }`}
                >
                  {/* Etiqueta de Tipo de Acción */}
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-red-500/20 text-red-300 border border-red-500/40 uppercase tracking-wider">
                      Acción
                    </span>
                    <span className="text-[11px] text-gray-400 font-medium">
                      {card.reach || '5 ft'}
                    </span>
                  </div>

                  {/* Nombre de la Habilidad / Conjuro */}
                  <div className="flex items-center justify-between mb-1.5">
                    <h4 className="font-garamond text-base font-bold text-white group-hover:text-red-300 transition-colors">
                      {card.title}
                    </h4>
                    {card.rollFormula && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          const bonus = card.hitBonusOrDc.match(/(?:\+|CD\s*)(-?\d+)/i);
                          onRollDice(card.title, bonus ? Number(bonus[1]) : 0, card.primaryDamageOrEffect);
                        }}
                        className="p-1 rounded bg-[#2b2932] hover:bg-red-500/30 text-red-300"
                        title="Tirar ataque"
                      >
                        <span className="material-symbols-outlined text-xs">casino</span>
                      </button>
                    )}
                  </div>

                  {/* Línea de Efecto Resumido */}
                  <div className="bg-[#211e28] p-2 rounded-lg border border-white/5 mb-2 text-xs font-mono text-gray-200">
                    <span className="text-red-300 font-bold">
                      {card.title}
                    </span>{' '}
                    - Acción - {card.resourceDesc || 'A voluntad'} -{' '}
                    <span className="text-emerald-400 font-bold">{card.primaryDamageOrEffect}</span>
                  </div>

                  {/* Casillas de Usos para marcar (☐ ☐) */}
                  {boxes.length > 0 && (
                    <div className="flex items-center justify-between bg-[#15131b] px-2.5 py-1.5 rounded-lg border border-white/5 mb-2">
                      <span className="text-[10px] text-gray-400 uppercase font-bold">
                        Usos:
                      </span>
                      <div className="flex items-center gap-1.5">
                        {boxes.map((checked, bIdx) => (
                          <button
                            key={`box-${card.id}-${bIdx}`}
                            onClick={(e) => handleToggleResourceBox(card.id, bIdx, e)}
                            className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${
                              checked
                                ? 'bg-red-500 border-red-400 shadow-[0_0_6px_rgba(239,68,68,0.7)]'
                                : 'bg-[#2b2932] border-white/20 hover:border-red-400'
                            }`}
                            title={checked ? 'Usado (clic para restaurar)' : 'Disponible (clic para gastar)'}
                          >
                            {checked && (
                              <span className="material-symbols-outlined text-white text-[10px] font-bold">
                                check
                              </span>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Estado de Gasto en Turno */}
                  <div className="flex items-center justify-between text-[10px] text-gray-400 pt-1 border-t border-white/5">
                    <span>{card.recharge || 'Recarga en descanso'}</span>
                    <span className={isExpended ? 'text-red-400 font-bold' : 'text-emerald-400'}>
                      {isExpended ? 'Gastada este asalto' : 'Disponible'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ==================================================== */}
        {/* COLUMNA 2: ACCIÓN ADICIONAL (Color Violeta / Amatista)*/}
        {/* ==================================================== */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between bg-[#1c1a24] px-3.5 py-2 rounded-xl border border-purple-500/30 shadow-md">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.8)]"></span>
              <h3 className="font-garamond text-base text-white font-bold tracking-wide">
                Acción Adicional
              </h3>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 font-bold border border-purple-500/30 uppercase">
              1 por turno
            </span>
          </div>

          <div className="flex flex-col gap-3">
            {bonusActionCards.map((card) => {
              const isExpended = roundExpendedCards[card.id];
              const boxes = card.resourceMax ? Array.from({ length: card.resourceMax }, (_, index) => index < (card.resourceUsed || 0)) : [];

              return (
                <div
                  key={card.id}
                  onClick={() => handleToggleCardExpend(card.id)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer relative group ${
                    isExpended
                      ? 'bg-[#15131b]/60 border-white/5 opacity-50 grayscale'
                      : 'bg-[#1c1a24] border-purple-500/20 hover:border-purple-500/50 shadow-md hover:-translate-y-0.5'
                  }`}
                >
                  {/* Etiqueta de Tipo de Acción */}
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/40 uppercase tracking-wider">
                      Acción Adicional
                    </span>
                    <span className="text-[11px] text-gray-400 font-medium">
                      {card.reach || 'Uno mismo'}
                    </span>
                  </div>

                  {/* Nombre */}
                  <div className="flex items-center justify-between mb-1.5">
                    <h4 className="font-garamond text-base font-bold text-white group-hover:text-purple-300 transition-colors">
                      {card.title}
                    </h4>
                    {card.rollFormula && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onRollDice(card.title, 0, card.primaryDamageOrEffect);
                        }}
                        className="p-1 rounded bg-[#2b2932] hover:bg-purple-500/30 text-purple-300"
                        title="Tirar"
                      >
                        <span className="material-symbols-outlined text-xs">casino</span>
                      </button>
                    )}
                  </div>

                  {/* Línea de Efecto Resumido (Ej. Second Wind - Acción adicional - 2 usos - Recuperas PG) */}
                  <div className="bg-[#211e28] p-2 rounded-lg border border-white/5 mb-2 text-xs font-mono text-gray-200">
                    <span className="text-purple-300 font-bold">
                      {card.title}
                    </span>{' '}
                    - Acción adicional - {card.resourceDesc || 'Usos limitados'} -{' '}
                    <span className="text-emerald-400 font-bold">{card.primaryDamageOrEffect}</span>
                  </div>

                  {/* Casillas de Usos para marcar (☐ ☐) */}
                  {boxes.length > 0 && (
                    <div className="flex items-center justify-between bg-[#15131b] px-2.5 py-1.5 rounded-lg border border-white/5 mb-2">
                      <span className="text-[10px] text-gray-400 uppercase font-bold">
                        Casillas de Uso:
                      </span>
                      <div className="flex items-center gap-1.5">
                        {boxes.map((checked, bIdx) => (
                          <button
                            key={`box-${card.id}-${bIdx}`}
                            onClick={(e) => handleToggleResourceBox(card.id, bIdx, e)}
                            className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${
                              checked
                                ? 'bg-purple-500 border-purple-400 shadow-[0_0_6px_rgba(168,85,247,0.7)]'
                                : 'bg-[#2b2932] border-white/20 hover:border-purple-400'
                            }`}
                            title={checked ? 'Usado (clic para restaurar)' : 'Disponible (clic para gastar)'}
                          >
                            {checked && (
                              <span className="material-symbols-outlined text-white text-[10px] font-bold">
                                check
                              </span>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Estado de Gasto en Turno */}
                  <div className="flex items-center justify-between text-[10px] text-gray-400 pt-1 border-t border-white/5">
                    <span>{card.recharge || 'Descanso Corto'}</span>
                    <span className={isExpended ? 'text-red-400 font-bold' : 'text-purple-300'}>
                      {isExpended ? 'Gastada este asalto' : 'Lista para usar'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ==================================================== */}
        {/* COLUMNA 3: REACCIÓN (Color Ámbar / Oro / Azul)       */}
        {/* ==================================================== */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between bg-[#1c1a24] px-3.5 py-2 rounded-xl border border-amber-500/30 shadow-md">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.8)]"></span>
              <h3 className="font-garamond text-base text-white font-bold tracking-wide">
                Reacción
              </h3>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30 uppercase">
              1 por asalto
            </span>
          </div>

          <div className="flex flex-col gap-3">
            {reactionCards.map((card) => {
              const isExpended = roundExpendedCards[card.id];
              const boxes = card.resourceMax ? Array.from({ length: card.resourceMax }, (_, index) => index < (card.resourceUsed || 0)) : [];

              return (
                <div
                  key={card.id}
                  onClick={() => handleToggleCardExpend(card.id)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer relative group ${
                    isExpended
                      ? 'bg-[#15131b]/60 border-white/5 opacity-50 grayscale'
                      : 'bg-[#1c1a24] border-amber-500/20 hover:border-amber-500/50 shadow-md hover:-translate-y-0.5'
                  }`}
                >
                  {/* Etiqueta de Reacción */}
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 uppercase tracking-wider">
                      Reacción
                    </span>
                    <span className="text-[11px] text-gray-400 font-medium">
                      {card.reach || 'Interrupción'}
                    </span>
                  </div>

                  {/* Nombre */}
                  <h4 className="font-garamond text-base font-bold text-white group-hover:text-amber-300 transition-colors mb-1">
                    {card.title}
                  </h4>

                  {/* Disparador / Trigger (Crucial en Reacciones) */}
                  {card.trigger && (
                    <div className="text-[11px] text-amber-300/90 italic bg-amber-950/30 p-2 rounded border border-amber-500/20 mb-2">
                      ⚡ Trigger: {card.trigger}
                    </div>
                  )}

                  {/* Línea de Efecto Resumido */}
                  <div className="bg-[#211e28] p-2 rounded-lg border border-white/5 mb-2 text-xs font-mono text-gray-200">
                    <span className="text-amber-300 font-bold">
                      {card.title}
                    </span>{' '}
                    - Reacción - {card.primaryDamageOrEffect}
                  </div>

                  {/* Casillas de Usos para marcar (☐ ☐) */}
                  {boxes.length > 0 && (
                    <div className="flex items-center justify-between bg-[#15131b] px-2.5 py-1.5 rounded-lg border border-white/5 mb-2">
                      <span className="text-[10px] text-gray-400 uppercase font-bold">
                        Casillas:
                      </span>
                      <div className="flex items-center gap-1.5">
                        {boxes.map((checked, bIdx) => (
                          <button
                            key={`box-${card.id}-${bIdx}`}
                            onClick={(e) => handleToggleResourceBox(card.id, bIdx, e)}
                            className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${
                              checked
                                ? 'bg-amber-500 border-amber-400 shadow-[0_0_6px_rgba(245,158,11,0.7)]'
                                : 'bg-[#2b2932] border-white/20 hover:border-amber-400'
                            }`}
                          >
                            {checked && (
                              <span className="material-symbols-outlined text-white text-[10px] font-bold">
                                check
                              </span>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Estado de Gasto en Turno */}
                  <div className="flex items-center justify-between text-[10px] text-gray-400 pt-1 border-t border-white/5">
                    <span>Reacción Inmediata</span>
                    <span className={isExpended ? 'text-red-400 font-bold' : 'text-amber-300'}>
                      {isExpended ? 'Reacción Consumida' : 'Lista'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ==================================================== */}
        {/* COLUMNA 4: MOVIMIENTO (Color Verde Esmeralda / Cian) */}
        {/* ==================================================== */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between bg-[#1c1a24] px-3.5 py-2 rounded-xl border border-emerald-500/30 shadow-md">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]"></span>
              <h3 className="font-garamond text-base text-white font-bold tracking-wide">
                Movimiento
              </h3>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30 uppercase">
              {combatState.remainingMovement} / {combatState.maxMovement} ft
            </span>
          </div>

          {/* Medidor de Movimiento Táctico Interactivo */}
          <div className="bg-[#1c1a24] p-4 rounded-xl border border-emerald-500/20 shadow-md">
            <div className="flex items-center justify-between mb-2">
              <span className="font-runic text-xs text-gray-300 font-bold uppercase">
                Pies Restantes
              </span>
              <span className="font-garamond text-xl text-emerald-400 font-bold">
                {combatState.remainingMovement} ft
              </span>
            </div>

            {/* Barra de Movimiento */}
            <div className="w-full bg-[#211e28] rounded-full h-3 p-0.5 border border-white/5 overflow-hidden mb-3">
              <div
                className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-300"
                style={{
                  width: `${Math.max(
                    0,
                    Math.min(100, (combatState.remainingMovement / (combatState.maxMovement || 30)) * 100)
                  )}%`,
                }}
              />
            </div>

            {/* Botones de Gasto Rápido de Movimiento */}
            <div className="grid grid-cols-3 gap-1.5 mb-3">
              <button
                onClick={() => handleSpendMovement(5)}
                disabled={combatState.remainingMovement < 5}
                className="py-1 px-2 rounded bg-[#211e28] hover:bg-[#2b2932] disabled:opacity-40 text-xs font-bold text-gray-200 border border-white/5 transition-colors"
              >
                -5 ft
              </button>
              <button
                onClick={() => handleSpendMovement(10)}
                disabled={combatState.remainingMovement < 10}
                className="py-1 px-2 rounded bg-[#211e28] hover:bg-[#2b2932] disabled:opacity-40 text-xs font-bold text-gray-200 border border-white/5 transition-colors"
              >
                -10 ft
              </button>
              <button
                onClick={() => handleSpendMovement(15)}
                disabled={combatState.remainingMovement < 15}
                className="py-1 px-2 rounded bg-[#211e28] hover:bg-[#2b2932] disabled:opacity-40 text-xs font-bold text-gray-200 border border-white/5 transition-colors"
              >
                -15 ft
              </button>
            </div>

            <div className="flex items-center justify-between gap-2">
              <button
                onClick={handleToggleDash}
                className={`flex-1 py-1.5 px-2.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 border ${
                  combatState.hasDash
                    ? 'bg-emerald-500 text-black border-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.5)]'
                    : 'bg-[#211e28] text-gray-200 border-white/10 hover:bg-[#2b2932]'
                }`}
                title="Acción de Correr: Duplica tu velocidad"
              >
                <span className="material-symbols-outlined text-sm">directions_run</span>
                <span>{combatState.hasDash ? 'Correr Activo (+30ft)' : 'Correr (Dash)'}</span>
              </button>

              <button
                onClick={handleResetMovement}
                className="p-1.5 rounded-lg bg-[#211e28] hover:bg-[#2b2932] text-gray-300 hover:text-white border border-white/5"
                title="Restablecer movimiento a velocidad máxima"
              >
                <span className="material-symbols-outlined text-sm">restart_alt</span>
              </button>
            </div>
          </div>

          {/* Cartas de Movimiento y Maniobras de Posición */}
          <div className="flex flex-col gap-3">
            {[...movementCards, ...standardMovementActions].map((card) => {
              return (
                <div
                  key={card.id}
                  className="p-4 rounded-xl bg-[#1c1a24] border border-emerald-500/20 hover:border-emerald-500/50 shadow-md transition-all"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 uppercase tracking-wider">
                      Movimiento
                    </span>
                    <span className="text-[11px] text-gray-400 font-medium">
                      {card.reach}
                    </span>
                  </div>

                  <h4 className="font-garamond text-base font-bold text-white mb-1">
                    {card.title}
                  </h4>

                  <div className="bg-[#211e28] p-2 rounded-lg border border-white/5 text-xs font-mono text-gray-200 mb-2">
                    {card.summaryLine}
                  </div>

                  <p className="text-[11px] text-gray-400 leading-relaxed">
                    {'mechanic' in card ? (card as any).mechanic : (card as any).description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
