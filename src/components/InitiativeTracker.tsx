import React, { useState } from 'react';
import type { CharacterSheet, Combatant, ConditionId, Encounter } from '../types';
import { sortEncounter, removeCombatant, updateCombatant } from '../lib/initiative';
import { computeAC } from '../lib/inventory';

interface InitiativeTrackerProps {
  encounter: Encounter;
  character: CharacterSheet;
  currentConditions: ConditionId[];
  round: number;
  onEncounterChange: (encounter: Encounter) => void;
  onUpdateCharacter: (updater: (prev: CharacterSheet) => CharacterSheet) => void;
  onRollInitiative: (combatant: Combatant) => number;
  onLinkedConditionsChange: (conditions: ConditionId[]) => void;
}

const SIDES: Array<{ id: Combatant['side']; label: string; className: string }> = [
  { id: 'player', label: 'Jugador', className: 'text-[var(--theme-primary,#fbbf24)]' },
  { id: 'ally', label: 'Aliado', className: 'text-emerald-300' },
  { id: 'enemy', label: 'Enemigo', className: 'text-red-300' },
];

const CONDITIONS: Array<{ id: ConditionId; label: string }> = [
  { id: 'blinded', label: 'Cegado' },
  { id: 'frightened', label: 'Asustado' },
  { id: 'grappled', label: 'Agarrado' },
  { id: 'paralyzed', label: 'Paralizado' },
  { id: 'poisoned', label: 'Envenenado' },
  { id: 'prone', label: 'Derribado' },
  { id: 'restrained', label: 'Apresado' },
  { id: 'stunned', label: 'Aturdido' },
];

function createCombatant(name: string, side: Combatant['side']): Combatant {
  return {
    id: `combatant-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    name,
    side,
    initiative: 0,
    initiativeBonus: 0,
    conditions: [],
  };
}

export const InitiativeTracker: React.FC<InitiativeTrackerProps> = ({
  encounter,
  character,
  currentConditions,
  round,
  onEncounterChange,
  onUpdateCharacter,
  onRollInitiative,
  onLinkedConditionsChange,
}) => {
  const [newName, setNewName] = useState('');
  const [newSide, setNewSide] = useState<Combatant['side']>('enemy');
  const [newMaxHp, setNewMaxHp] = useState('');
  const [newAc, setNewAc] = useState('');
  const orderedEncounter = sortEncounter(encounter);
  const hasLinkedCharacter = encounter.combatants.some((combatant) => combatant.isCurrentCharacter);

  const updateCombatantField = (combatantId: string, update: (combatant: Combatant) => Combatant) => {
    onEncounterChange(updateCombatant(encounter, combatantId, update));
  };

  const addCombatant = (combatant: Combatant) => {
    const nextEncounter = sortEncounter({
      ...encounter,
      combatants: [...encounter.combatants, combatant],
    });
    onEncounterChange(nextEncounter);
  };

  const handleAddLinkedCharacter = () => {
    if (hasLinkedCharacter) return;
    addCombatant({
      ...createCombatant(character.name, 'player'),
      initiativeBonus: character.initiative,
      hp: character.currentHp,
      maxHp: character.maxHp,
      ac: computeAC(character),
      conditions: currentConditions,
      isCurrentCharacter: true,
    });
  };

  const handleAdd = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const name = newName.trim();
    if (!name) return;
    const maxHp = Number(newMaxHp);
    const ac = Number(newAc);
    addCombatant({
      ...createCombatant(name, newSide),
      ...(newMaxHp.trim() ? { hp: maxHp, maxHp } : {}),
      ...(newAc.trim() ? { ac } : {}),
    });
    setNewName('');
    setNewMaxHp('');
    setNewAc('');
  };

  const handleRollOne = (combatant: Combatant) => {
    const initiativeBonus = combatant.isCurrentCharacter
      ? character.initiative
      : combatant.initiativeBonus ?? 0;
    const initiative = onRollInitiative({ ...combatant, initiativeBonus });
    updateCombatantField(combatant.id, (current) => ({ ...current, initiative, initiativeBonus }));
  };

  const handleRollAll = () => {
    const rolled = encounter.combatants.map((combatant) => {
      const initiativeBonus = combatant.isCurrentCharacter
        ? character.initiative
        : combatant.initiativeBonus ?? 0;
      return {
        ...combatant,
        initiativeBonus,
        initiative: onRollInitiative({ ...combatant, initiativeBonus }),
      };
    });
    onEncounterChange(sortEncounter({ ...encounter, combatants: rolled }));
  };

  const handleHpChange = (combatant: Combatant, delta: number) => {
    if (combatant.isCurrentCharacter) {
      onUpdateCharacter((prev) => ({
        ...prev,
        currentHp: Math.min(prev.maxHp, Math.max(0, prev.currentHp + delta)),
      }));
      updateCombatantField(combatant.id, (current) => ({
        ...current,
        hp: Math.min(current.maxHp ?? Number.POSITIVE_INFINITY, Math.max(0, (current.hp ?? 0) + delta)),
      }));
      return;
    }
    updateCombatantField(combatant.id, (current) => {
      if (current.hp === undefined) return current;
      return {
        ...current,
        hp: Math.min(current.maxHp ?? Number.POSITIVE_INFINITY, Math.max(0, current.hp + delta)),
      };
    });
  };

  const handleLinkCharacter = (combatantId: string, link: boolean) => {
    const combatants = encounter.combatants.map((combatant) => {
      if (combatant.id === combatantId) {
        return {
          ...combatant,
          ...(link ? {
            side: 'player' as const,
            isCurrentCharacter: true,
            name: character.name,
            initiativeBonus: character.initiative,
            hp: character.currentHp,
            maxHp: character.maxHp,
            ac: computeAC(character),
            conditions: currentConditions,
          } : { isCurrentCharacter: false }),
        };
      }
      return link && combatant.isCurrentCharacter
        ? { ...combatant, isCurrentCharacter: false }
        : combatant;
    });
    onEncounterChange(sortEncounter({ ...encounter, combatants }));
  };

  return (
    <section className="mb-6 rounded-xl border border-amber-400/20 bg-[#1c1a24] p-4" aria-label="Orden de iniciativa">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="font-garamond text-lg font-bold text-white">Orden de iniciativa</h2>
          <p className="text-[10px] text-gray-500">Asalto {encounter.round || round} · turno {encounter.combatants.length ? encounter.turnIndex + 1 : 0}/{encounter.combatants.length}</p>
        </div>
        <div className="flex gap-2">
          {!hasLinkedCharacter && (
            <button
              type="button"
              onClick={handleAddLinkedCharacter}
              className="rounded border border-[var(--theme-primary,#fbbf24)]/30 px-2.5 py-1 text-[11px] text-[var(--theme-primary,#fbbf24)]"
            >
              Añadir mi ficha
            </button>
          )}
          <button
            type="button"
            onClick={handleRollAll}
            disabled={encounter.combatants.length === 0}
            className="rounded bg-[#2b2932] px-2.5 py-1 text-[11px] text-gray-200 disabled:opacity-40"
          >
            Tirar todos
          </button>
        </div>
      </div>

      <form onSubmit={handleAdd} className="mb-3 flex flex-wrap gap-2">
        <input
          value={newName}
          onChange={(event) => setNewName(event.target.value)}
          placeholder="Nombre del combatiente"
          aria-label="Nombre del combatiente"
          required
          className="min-w-40 flex-1 rounded border border-white/10 bg-[#211e28] px-2.5 py-1.5 text-xs text-white"
        />
        <select
          value={newSide}
          onChange={(event) => setNewSide(event.target.value as Combatant['side'])}
          aria-label="Equipo del combatiente"
          className="rounded border border-white/10 bg-[#211e28] px-2 py-1.5 text-xs text-white"
        >
          {SIDES.map((side) => <option key={side.id} value={side.id}>{side.label}</option>)}
        </select>
        <input
          type="number"
          min="1"
          value={newMaxHp}
          onChange={(event) => setNewMaxHp(event.target.value)}
          placeholder="PG máx."
          aria-label="Puntos de golpe máximos del combatiente"
          className="w-20 rounded border border-white/10 bg-[#211e28] px-2 py-1.5 text-xs text-white"
        />
        <input
          type="number"
          min="0"
          value={newAc}
          onChange={(event) => setNewAc(event.target.value)}
          placeholder="CA"
          aria-label="Clase de armadura del combatiente"
          className="w-16 rounded border border-white/10 bg-[#211e28] px-2 py-1.5 text-xs text-white"
        />
        <button type="submit" className="rounded bg-[var(--theme-secondary-container,#571bc1)] px-3 py-1.5 text-xs font-semibold text-white">Añadir</button>
      </form>

      {orderedEncounter.combatants.length === 0 ? (
        <p className="rounded-lg border border-dashed border-white/10 p-3 text-xs text-gray-500">Añade combatientes para comenzar a seguir la iniciativa.</p>
      ) : (
        <ol className="space-y-2">
          {orderedEncounter.combatants.map((combatant, index) => {
            const isCurrent = index === orderedEncounter.turnIndex;
            const side = SIDES.find((item) => item.id === combatant.side)!;
            const hp = combatant.isCurrentCharacter ? character.currentHp : combatant.hp;
            const maxHp = combatant.isCurrentCharacter ? character.maxHp : combatant.maxHp;
            const isDefeated = hp !== undefined && hp <= 0;
            return (
              <li
                key={combatant.id}
                className={`rounded-lg border p-3 ${isCurrent ? 'border-amber-400/60 bg-amber-500/10 shadow-[0_0_12px_rgba(251,191,36,0.12)]' : 'border-white/5 bg-[#211e28]'}`}
              >
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`w-7 text-center font-garamond text-lg font-bold ${isCurrent ? 'text-amber-300' : 'text-gray-400'}`}>{index + 1}</span>
                  <div className="min-w-32 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`text-xs font-bold ${isDefeated ? 'text-gray-500 line-through' : 'text-white'}`}>{combatant.isCurrentCharacter ? character.name : combatant.name}</span>
                      <span className={`text-[9px] uppercase ${side.className}`}>{side.label}</span>
                      {isCurrent && <span className="rounded bg-amber-400/20 px-1.5 py-0.5 text-[9px] font-bold text-amber-200">TURNO ACTUAL</span>}
                      {isDefeated && <span className="rounded bg-red-500/20 px-1.5 py-0.5 text-[9px] font-bold text-red-300">DERROTADO</span>}
                    </div>
                    <div className="mt-1 flex flex-wrap items-center gap-2 text-[10px] text-gray-400">
                      <label className="flex items-center gap-1">
                        Inic.
                        <input
                          type="number"
                          value={combatant.initiative}
                          onChange={(event) => updateCombatantField(combatant.id, (current) => ({ ...current, initiative: Number(event.target.value) || 0 }))}
                          className="w-12 rounded border border-white/10 bg-[#15131b] px-1 py-0.5 text-center text-xs text-white [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                          aria-label={`Iniciativa de ${combatant.name}`}
                        />
                      </label>
                      <label className="flex items-center gap-1">
                        Bono
                        <input
                          type="number"
                          value={combatant.isCurrentCharacter ? character.initiative : combatant.initiativeBonus ?? 0}
                          disabled={combatant.isCurrentCharacter}
                          onChange={(event) => updateCombatantField(combatant.id, (current) => ({ ...current, initiativeBonus: Number(event.target.value) || 0 }))}
                          className="w-12 rounded border border-white/10 bg-[#15131b] px-1 py-0.5 text-center text-xs text-white disabled:opacity-60 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                          aria-label={`Bono de iniciativa de ${combatant.name}`}
                        />
                      </label>
                      <button type="button" onClick={() => handleRollOne(combatant)} className="rounded bg-[#2b2932] px-2 py-0.5 text-[10px] text-amber-200">Tirar</button>
                      {hp !== undefined && (
                        <span className="flex items-center gap-1">
                          PG
                          <button type="button" onClick={() => handleHpChange(combatant, -1)} className="rounded bg-red-500/10 px-1.5 text-red-300">−</button>
                          <span className={isDefeated ? 'text-red-300' : 'text-gray-200'}>{hp}{maxHp !== undefined ? `/${maxHp}` : ''}</span>
                          <button type="button" onClick={() => handleHpChange(combatant, 1)} disabled={maxHp !== undefined && hp >= maxHp} className="rounded bg-emerald-500/10 px-1.5 text-emerald-300 disabled:opacity-40">+</button>
                        </span>
                      )}
                      {combatant.ac !== undefined && <span>CA {combatant.ac}</span>}
                      {!combatant.isCurrentCharacter && (
                        <button
                          type="button"
                          disabled={hasLinkedCharacter}
                          onClick={() => handleLinkCharacter(combatant.id, true)}
                          className="text-[var(--theme-primary,#fbbf24)] disabled:opacity-40"
                        >
                          Vincular ficha
                        </button>
                      )}
                      {combatant.isCurrentCharacter && (
                        <button type="button" onClick={() => handleLinkCharacter(combatant.id, false)} className="text-gray-500">Desvincular</button>
                      )}
                      <button
                        type="button"
                        onClick={() => onEncounterChange(removeCombatant(encounter, combatant.id))}
                        className="ml-auto text-red-300 hover:text-red-200"
                      >
                        Eliminar
                      </button>
                    </div>
                  </div>
                </div>
                <div className="mt-2 flex flex-wrap gap-1">
                  {CONDITIONS.map((condition) => {
                    const active = combatant.conditions.includes(condition.id);
                    return (
                      <button
                        key={condition.id}
                        type="button"
                        aria-pressed={active}
                        onClick={() => {
                          const conditions = active
                            ? combatant.conditions.filter((item) => item !== condition.id)
                            : [...combatant.conditions, condition.id];
                          updateCombatantField(combatant.id, (current) => ({ ...current, conditions }));
                          if (combatant.isCurrentCharacter) onLinkedConditionsChange(conditions);
                        }}
                        className={`rounded-full border px-2 py-0.5 text-[9px] ${active ? 'border-red-400/40 bg-red-500/15 text-red-200' : 'border-white/5 text-gray-500 hover:text-gray-300'}`}
                      >
                        {condition.label}
                      </button>
                    );
                  })}
                </div>
              </li>
            );
          })}
        </ol>
      )}
    </section>
  );
};
