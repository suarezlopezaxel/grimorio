import React, { useState } from 'react';
import {
  Swords,
  Shield,
  Zap,
  Play,
  RotateCcw,
  Sparkles,
  Heart,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Dices,
} from 'lucide-react';
import { CharacterSheet, Combatant, ActiveEffect, GrimoireCard } from '../../types/character';
import { CLASS_THEMES } from '../../data/classThemes';
import { ClassWidgetFrame } from '../fx/ClassWidgetFrame';
import { ClassSubCard } from '../fx/ClassSubCard';

interface Props {
  character: CharacterSheet;
  onUpdate: (updated: CharacterSheet) => void;
  onOpenDiceTray: (formula?: string) => void;
}

export const CombatTurnView: React.FC<Props> = ({ character, onUpdate, onOpenDiceTray }) => {
  const theme = CLASS_THEMES[character.classId] || CLASS_THEMES.mago;

  // Turn state
  const [round, setRound] = useState<number>(3);
  const [isProne, setIsProne] = useState<boolean>(false);
  const [concentrationSpell, setConcentrationSpell] = useState<string | null>('Escudo de Fe');

  // Turn budget
  const [actionUsed, setActionUsed] = useState<boolean>(false);
  const [bonusActionUsed, setBonusActionUsed] = useState<boolean>(false);
  const [reactionUsed, setReactionUsed] = useState<boolean>(false);
  const [movementLeft, setMovementLeft] = useState<number>(character.speed);

  // Critical mode
  const [isCritical, setIsCritical] = useState<boolean>(false);

  // Initiative Order
  const [combatants, setCombatants] = useState<Combatant[]>([
    { id: 'c-player', name: character.name, type: 'player', initiative: 18, hp: character.hitPoints.current, maxHp: character.hitPoints.max, ac: character.armorClass, conditions: [] },
    { id: 'c-enemy1', name: 'Caballero Espectral', type: 'enemy', initiative: 15, hp: 45, maxHp: 45, ac: 16, conditions: ['Asustado'] },
    { id: 'c-ally1', name: 'Lobo Compañero', type: 'ally', initiative: 12, hp: 22, maxHp: 22, ac: 13, conditions: [] },
  ]);

  const [newCombatantName, setNewCombatantName] = useState('');
  const [newCombatantType, setNewCombatantType] = useState<'player' | 'ally' | 'enemy'>('enemy');
  const [newCombatantHp, setNewCombatantHp] = useState(30);
  const [newCombatantAc, setNewCombatantAc] = useState(14);

  // Active Effects
  const [activeEffects, setActiveEffects] = useState<ActiveEffect[]>([
    { id: 'eff-1', name: 'Escudo de Fe', durationRounds: 10, concentration: true, notes: '+2 a la CA' },
    { id: 'eff-2', name: 'Bendición', durationRounds: 8, concentration: false, notes: '+1d4 a tiradas de ataque y salvación' },
  ]);

  const [newEffectName, setNewEffectName] = useState('');
  const [newEffectDuration, setNewEffectDuration] = useState(3);
  const [newEffectConcentration, setNewEffectConcentration] = useState(false);

  const CONDITIONS_LIST = [
    'Cegado', 'Hechizado', 'Ensordecido', 'Asustado', 'Agarrado',
    'Incapacitado', 'Invisible', 'Paralizado', 'Petrificado',
    'Envenenado', 'Derribado', 'Apresado', 'Aturdido', 'Inconsciente',
  ];

  // Advance to next turn
  const handleNextTurn = () => {
    // Reset turn resources
    setActionUsed(false);
    setBonusActionUsed(false);
    setReactionUsed(false);
    setMovementLeft(character.speed);

    // Decrement effect durations
    const nextEffects = activeEffects
      .map((e) => ({ ...e, durationRounds: e.durationRounds - 1 }))
      .filter((e) => e.durationRounds > 0);

    setActiveEffects(nextEffects);
    setRound((r) => r + 1);
  };

  const endCombat = () => {
    setRound(1);
    setActiveEffects([]);
    setConcentrationSpell(null);
    setActionUsed(false);
    setBonusActionUsed(false);
    setReactionUsed(false);
  };

  const addCombatant = () => {
    if (!newCombatantName.trim()) return;
    const initRoll = Math.floor(Math.random() * 20) + 1;
    const newC: Combatant = {
      id: `c-${Date.now()}`,
      name: newCombatantName.trim(),
      type: newCombatantType,
      initiative: initRoll,
      hp: newCombatantHp,
      maxHp: newCombatantHp,
      ac: newCombatantAc,
      conditions: [],
    };
    setCombatants((prev) => [...prev, newC].sort((a, b) => b.initiative - a.initiative));
    setNewCombatantName('');
  };

  const addPresetEffect = (name: string, duration: number, concentration: boolean) => {
    setActiveEffects((prev) => [
      ...prev,
      { id: `eff-${Date.now()}`, name, durationRounds: duration, concentration },
    ]);
    if (concentration) {
      setConcentrationSpell(name);
    }
  };

  const toggleCondition = (cond: string) => {
    const exists = character.activeConditions.includes(cond);
    const updated = exists
      ? character.activeConditions.filter((c) => c !== cond)
      : [...character.activeConditions, cond];
    onUpdate({ ...character, activeConditions: updated });
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* 1. Header Bar: Combat Tracker Banner */}
      <ClassWidgetFrame classId={character.classId} className="p-4 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            {/* Round Badge */}
            <div className="flex items-center gap-2 rounded-xl bg-black/40 border border-black/40 px-3.5 py-2 shadow-inner">
              <span className="text-xs font-bold text-zinc-400 font-cinzel">COMBATE</span>
              <span className="text-xs text-zinc-600">•</span>
              <span className="text-base font-extrabold text-emerald-400 font-cinzel">
                ⏳ Asalto {round}
              </span>
            </div>

            {/* Initiative */}
            <div className="flex items-center gap-1.5 rounded-xl bg-black/40 border border-black/40 px-3 py-2 text-xs shadow-inner">
              <span className="text-zinc-400 font-cinzel">INICIATIVA:</span>
              <span className="font-extrabold text-purple-300 font-mono text-sm">18</span>
            </div>

            {/* Prone Toggle */}
            <button
              onClick={() => setIsProne(!isProne)}
              className={`rounded-xl px-3 py-2 text-xs font-bold border transition cursor-pointer ${
                isProne
                  ? 'border-rose-500 bg-rose-950/60 text-rose-300'
                  : 'border-zinc-700 bg-black/40 text-zinc-300'
              }`}
            >
              {isProne ? '🤕 Derribado' : '🧍 En pie'}
            </button>

            {/* Concentration Indicator */}
            {concentrationSpell ? (
              <div className="flex items-center gap-2 rounded-xl border border-purple-500/40 bg-purple-950/40 px-3 py-2 text-xs text-purple-200 shadow-[0_0_10px_rgba(168,85,247,0.25)]">
                <Sparkles className="h-4 w-4 text-purple-400 animate-spin" />
                <span>Concentración: <strong>{concentrationSpell}</strong></span>
                <button
                  onClick={() => setConcentrationSpell(null)}
                  className="rounded bg-purple-900/60 hover:bg-purple-800 px-2 py-0.5 text-[10px] text-purple-300 ml-1 cursor-pointer"
                >
                  Terminar
                </button>
              </div>
            ) : (
              <span className="text-xs text-zinc-500 italic">Sin concentración activa</span>
            )}
          </div>

          {/* Action budget & Next Turn button */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setActionUsed(!actionUsed)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition ${
                actionUsed
                  ? 'bg-zinc-900 border-zinc-700 text-zinc-500 line-through'
                  : 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300'
              }`}
            >
              Acción: {actionUsed ? 'Gastada' : 'Libre'}
            </button>

            <button
              onClick={() => setBonusActionUsed(!bonusActionUsed)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition ${
                bonusActionUsed
                  ? 'bg-zinc-900 border-zinc-700 text-zinc-500 line-through'
                  : 'bg-purple-950/60 border-purple-500/40 text-purple-300'
              }`}
            >
              Adicional: {bonusActionUsed ? 'Gastada' : 'Libre'}
            </button>

            <button
              onClick={() => setReactionUsed(!reactionUsed)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition ${
                reactionUsed
                  ? 'bg-zinc-900 border-zinc-700 text-zinc-500 line-through'
                  : 'bg-amber-950/60 border-amber-500/40 text-amber-300'
              }`}
            >
              Reacción: {reactionUsed ? 'Gastada' : 'Libre'}
            </button>

            {/* Siguiente Turno */}
            <button
              onClick={handleNextTurn}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 px-4 py-2 font-cinzel text-xs font-bold text-stone-950 shadow-lg cursor-pointer transition active:scale-95"
            >
              <Swords className="h-4 w-4" />
              <span>Siguiente Turno</span>
            </button>
          </div>
        </div>
      </ClassWidgetFrame>

      {/* 2. Orden de Iniciativa */}
      <ClassWidgetFrame classId={character.classId} className="p-4 shadow-xl">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <h3 className="font-cinzel text-sm font-bold text-zinc-100">Orden de Iniciativa</h3>
            <span className="text-xs text-zinc-400 font-mono">Asalto {round}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() =>
                setCombatants((prev) =>
                  [...prev].map((c) => ({
                    ...c,
                    initiative: Math.floor(Math.random() * 20) + 1,
                  })).sort((a, b) => b.initiative - a.initiative)
                )
              }
              className="rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-1 text-xs text-zinc-300 hover:bg-zinc-700 cursor-pointer"
            >
              🎲 Tirar todos
            </button>
          </div>
        </div>

        {/* Add combatant input row */}
        <div className="flex flex-wrap items-center gap-2 mb-3 bg-black/40 p-2.5 rounded-xl border border-black/40 text-xs shadow-inner">
          <input
            type="text"
            placeholder="Nombre del combatiente..."
            value={newCombatantName}
            onChange={(e) => setNewCombatantName(e.target.value)}
            className="flex-1 rounded border border-zinc-700 bg-zinc-900 px-3 py-1.5 text-white"
          />

          <select
            value={newCombatantType}
            onChange={(e) => setNewCombatantType(e.target.value as any)}
            className="rounded border border-zinc-700 bg-zinc-900 px-2.5 py-1.5 text-white"
          >
            <option value="enemy">Enemigo</option>
            <option value="ally">Aliado</option>
            <option value="player">Jugador</option>
          </select>

          <input
            type="number"
            placeholder="PG"
            value={newCombatantHp}
            onChange={(e) => setNewCombatantHp(parseInt(e.target.value) || 1)}
            className="w-16 rounded border border-zinc-700 bg-zinc-900 px-2 py-1.5 text-white text-center"
          />

          <input
            type="number"
            placeholder="CA"
            value={newCombatantAc}
            onChange={(e) => setNewCombatantAc(parseInt(e.target.value) || 10)}
            className="w-16 rounded border border-zinc-700 bg-zinc-900 px-2 py-1.5 text-white text-center"
          />

          <button
            onClick={addCombatant}
            className="rounded bg-emerald-600 hover:bg-emerald-500 px-3 py-1.5 font-bold text-stone-950 cursor-pointer"
          >
            Añadir
          </button>
        </div>

        {/* Combatants list */}
        <div className="space-y-1.5">
          {combatants.map((c) => (
            <ClassSubCard
              key={c.id}
              classId={character.classId}
              className="flex items-center justify-between p-2.5 text-xs transition"
            >
              <div className="flex items-center gap-3">
                <span className="font-mono font-bold text-sm opacity-90 w-6 text-center">
                  {c.initiative}
                </span>
                <span className="font-semibold">{c.name}</span>
                <span className="text-[10px] uppercase font-bold opacity-60">({c.type})</span>
              </div>

              <div className="flex items-center gap-3">
                <span className="opacity-75 font-mono">{c.hp} / {c.maxHp} PG</span>
                <span className="opacity-75 font-mono">{c.ac} CA</span>
                <button
                  onClick={() => setCombatants(combatants.filter((item) => item.id !== c.id))}
                  className="p-1 opacity-60 hover:opacity-100 hover:text-rose-400 cursor-pointer"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </ClassSubCard>
          ))}
        </div>
      </ClassWidgetFrame>

      {/* 3. Condiciones Activas & Efectos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Condiciones */}
        <ClassWidgetFrame classId={character.classId} className="p-4">
          <div className="text-xs font-bold font-cinzel mb-3">Condiciones de Combate:</div>
          <div className="flex flex-wrap gap-1.5">
            {CONDITIONS_LIST.map((cond) => {
              const isActive = character.activeConditions.includes(cond);
              return (
                <button
                  key={cond}
                  onClick={() => toggleCondition(cond)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium transition cursor-pointer ${
                    isActive
                      ? 'border border-amber-400 bg-amber-400/20 text-amber-200 shadow-sm font-bold'
                      : 'border border-white/10 bg-black/40 opacity-75 hover:opacity-100'
                  }`}
                >
                  {cond}
                </button>
              );
            })}
          </div>
        </ClassWidgetFrame>

        {/* Efectos Activos con Duración */}
        <ClassWidgetFrame classId={character.classId} className="p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="font-cinzel text-xs font-bold">
              Efectos Activos (Avanzan al Siguiente Turno):
            </span>
          </div>

          <div className="flex flex-wrap gap-2 mb-3">
            <button
              onClick={() => addPresetEffect('Bendición', 10, true)}
              className="rounded bg-black/40 border border-white/15 px-2 py-1 text-xs hover:bg-black/60 cursor-pointer"
            >
              + Bendición (10 asaltos)
            </button>
            <button
              onClick={() => addPresetEffect('Marca del Cazador', 60, true)}
              className="rounded bg-black/40 border border-white/15 px-2 py-1 text-xs hover:bg-black/60 cursor-pointer"
            >
              + Marca del Cazador (60 asaltos)
            </button>
            <button
              onClick={() => addPresetEffect('Escudo de Fe', 100, true)}
              className="rounded bg-black/40 border border-white/15 px-2 py-1 text-xs hover:bg-black/60 cursor-pointer"
            >
              + Escudo de Fe (100 asaltos)
            </button>
          </div>

          <div className="space-y-1.5">
            {activeEffects.map((eff) => (
              <ClassSubCard
                key={eff.id}
                classId={character.classId}
                className="flex items-center justify-between p-2.5 text-xs"
              >
                <div>
                  <span className="font-bold">{eff.name}</span>
                  {eff.notes && <span className="text-[11px] opacity-75 ml-2">({eff.notes})</span>}
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-mono">{eff.durationRounds} asaltos</span>
                  <button
                    onClick={() => setActiveEffects(activeEffects.filter((e) => e.id !== eff.id))}
                    className="opacity-60 hover:opacity-100 hover:text-rose-400 cursor-pointer"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </ClassSubCard>
            ))}
          </div>
        </ClassWidgetFrame>
      </div>

      {/* 4. Action Columns: Acción, Acción Adicional, Reacción, Movimiento */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Col 1: Acción */}
        <ClassWidgetFrame classId={character.classId} className="p-4">
          <div className="flex items-center justify-between pb-2 mb-3 border-b border-white/10">
            <span className="font-cinzel text-xs font-bold">🔴 Acción</span>
            <span className="text-[10px] font-mono font-bold bg-black/40 px-2 py-0.5 rounded border border-white/10">
              1 POR TURNO
            </span>
          </div>

          <div className="space-y-2">
            {character.cards
              .filter((c) => c.actionType === 'Acción')
              .map((card) => (
                <ClassSubCard key={card.id} classId={character.classId} className="p-3 text-xs">
                  <div className="font-cinzel font-bold">{card.title}</div>
                  <div className="text-[10px] opacity-75 my-1">{card.range} • {card.target}</div>
                  <button
                    onClick={() => onOpenDiceTray(card.effectOrDamage)}
                    className="w-full mt-2 py-1.5 rounded bg-black/40 hover:bg-black/60 border border-white/15 font-semibold cursor-pointer"
                  >
                    🎲 Tirar: {card.effectOrDamage}
                  </button>
                </ClassSubCard>
              ))}
          </div>
        </ClassWidgetFrame>

        {/* Col 2: Acción Adicional */}
        <ClassWidgetFrame classId={character.classId} className="p-4">
          <div className="flex items-center justify-between pb-2 mb-3 border-b border-white/10">
            <span className="font-cinzel text-xs font-bold">🟣 Acción Adicional</span>
            <span className="text-[10px] font-mono font-bold bg-black/40 px-2 py-0.5 rounded border border-white/10">
              1 POR TURNO
            </span>
          </div>

          <div className="space-y-2">
            {character.cards
              .filter((c) => c.actionType === 'Acción Adicional')
              .map((card) => (
                <ClassSubCard key={card.id} classId={character.classId} className="p-3 text-xs">
                  <div className="font-cinzel font-bold">{card.title}</div>
                  <div className="text-[10px] opacity-75 my-1">{card.effectOrDamage}</div>
                  <button
                    onClick={() => onOpenDiceTray(card.effectOrDamage)}
                    className="w-full mt-2 py-1.5 rounded bg-black/40 hover:bg-black/60 border border-white/15 font-semibold cursor-pointer"
                  >
                    Desplegar Acción Adicional
                  </button>
                </ClassSubCard>
              ))}
          </div>
        </ClassWidgetFrame>

        {/* Col 3: Reacción */}
        <ClassWidgetFrame classId={character.classId} className="p-4">
          <div className="flex items-center justify-between pb-2 mb-3 border-b border-white/10">
            <span className="font-cinzel text-xs font-bold">🟡 Reacción</span>
            <span className="text-[10px] font-mono font-bold bg-black/40 px-2 py-0.5 rounded border border-white/10">
              1 POR ASALTO
            </span>
          </div>

          <div className="space-y-2">
            {character.cards
              .filter((c) => c.actionType === 'Reacción')
              .map((card) => (
                <ClassSubCard key={card.id} classId={character.classId} className="p-3 text-xs">
                  <div className="font-cinzel font-bold">{card.title}</div>
                  <div className="text-[10px] opacity-75 my-1">{card.trigger || card.effectOrDamage}</div>
                  <button
                    onClick={() => onOpenDiceTray(card.effectOrDamage)}
                    className="w-full mt-2 py-1.5 rounded bg-black/40 hover:bg-black/60 border border-white/15 font-semibold cursor-pointer"
                  >
                    Activar Reacción
                  </button>
                </ClassSubCard>
              ))}
          </div>
        </ClassWidgetFrame>

        {/* Col 4: Movimiento */}
        <ClassWidgetFrame classId={character.classId} className="p-4">
          <div className="flex items-center justify-between pb-2 mb-3 border-b border-white/10">
            <span className="font-cinzel text-xs font-bold">🟢 Movimiento</span>
            <span className="text-[10px] font-mono font-bold bg-black/40 px-2 py-0.5 rounded border border-white/10">
              {movementLeft} / {character.speed} FT
            </span>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setMovementLeft(Math.max(0, movementLeft - 5))}
                className="flex-1 py-1.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-mono"
              >
                -5 ft
              </button>
              <button
                onClick={() => setMovementLeft(Math.max(0, movementLeft - 10))}
                className="flex-1 py-1.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-mono"
              >
                -10 ft
              </button>
              <button
                onClick={() => setMovementLeft(Math.max(0, movementLeft - 15))}
                className="flex-1 py-1.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-mono"
              >
                -15 ft
              </button>
              <button
                onClick={() => setMovementLeft(character.speed)}
                className="p-1.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-400"
                title="Restablecer pies"
              >
                <RotateCcw className="h-3.5 w-3.5" />
              </button>
            </div>

            <button
              onClick={() => setMovementLeft((prev) => prev + character.speed)}
              className="w-full py-2 rounded-lg bg-teal-950 border border-teal-600/40 text-teal-200 font-bold hover:bg-teal-900 transition flex items-center justify-center gap-2"
            >
              🏃 Correr (Dash: +{character.speed} ft)
            </button>

            <div className="p-2.5 rounded-lg border border-zinc-800 bg-zinc-900/40 space-y-1 text-[11px] text-zinc-400">
              <div><strong>Desplazamiento Base:</strong> Terreno difícil cuesta el doble.</div>
              <div><strong>Levantarse:</strong> Requiere la mitad de tu velocidad.</div>
              <div><strong>Destrabarse:</strong> No provocas ataques de oportunidad este turno.</div>
            </div>
          </div>
        </ClassWidgetFrame>
      </div>
    </div>
  );
};
