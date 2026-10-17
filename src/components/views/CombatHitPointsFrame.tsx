import React, { useState } from 'react';
import { Heart, Moon, Sun } from 'lucide-react';
import { CharacterSheet } from '../../types/character';
import { getDieSize } from '../../lib/hitDice';
import { ClassWidgetFrame } from '../fx/ClassWidgetFrame';
import { ClassSubCard } from '../fx/ClassSubCard';
import { getEffectiveAbilityScore } from '../../lib/itemEffects';

interface Props {
  character: CharacterSheet;
  onUpdate: (updated: CharacterSheet) => void;
  onOpenShortRest: () => void;
}

export const CombatHitPointsFrame: React.FC<Props> = ({
  character,
  onUpdate,
  onOpenShortRest,
}) => {
  const [selectedDamageType, setSelectedDamageType] = useState('Sin tipo');
  const getAbilityModifier = (score: number) => Math.floor((score - 10) / 2);
  const constitutionScore = getEffectiveAbilityScore(
    character.cards,
    'CON',
    character.abilities.CON.score,
  );
  const maxHp = Math.max(
    1,
    character.hitPoints.max
      + (getAbilityModifier(constitutionScore)
        - getAbilityModifier(character.abilities.CON.score)) * character.level,
  );
  const hpPercent = Math.min(100, Math.max(0, (character.hitPoints.current / maxHp) * 100));

  const adjustHp = (amount: number) => {
    onUpdate({
      ...character,
      hitPoints: {
        ...character.hitPoints,
        current: Math.max(0, Math.min(maxHp, character.hitPoints.current + amount)),
      },
    });
  };

  const toggleDeathSave = (type: 'successes' | 'failures', index: number) => {
    const current = character.deathSaves[type];
    onUpdate({
      ...character,
      deathSaves: {
        ...character.deathSaves,
        [type]: index < current ? index : index + 1,
      },
    });
  };

  const handleLongRest = () => {
    const druidMaxUses = character.level >= 17 ? 4 : character.level >= 6 ? 3 : 2;
    onUpdate({
      ...character,
      hitPoints: {
        ...character.hitPoints,
        current: maxHp,
        temp: 0,
      },
      hitDice: { ...character.hitDice, current: character.hitDice.max },
      spellSlots: character.spellSlots.map((slot) => ({ ...slot, used: 0 })),
      cards: character.cards.map((card) => (
        card.uses?.recharge === 'short'
        || card.uses?.recharge === 'long'
        || card.uses?.recharge === 'dawn'
        || card.uses?.recharge === 'dusk'
          ? { ...card, uses: { ...card.uses, current: card.uses.max } }
          : card
      )),
      classResources: character.classId === 'druida'
        ? {
            ...character.classResources,
            druid: {
              ...(character.classResources.druid ?? {
                wildShapeCurrent: druidMaxUses,
                wildShapeMax: druidMaxUses,
                activeForm: null,
                forms: [],
              }),
              wildShapeCurrent: druidMaxUses,
              wildShapeMax: druidMaxUses,
            },
          }
        : character.classResources,
      deathSaves: { successes: 0, failures: 0 },
    });
  };

  return (
    <ClassWidgetFrame classId={character.classId} className="mb-6 p-4 md:p-5">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Heart className="h-6 w-6 animate-pulse text-red-500" />
          <div>
            <h2 className="font-cinzel text-base font-bold text-white">Puntos de Golpe (PG)</h2>
            <p className="text-xs text-gray-400">Control de vida, curación y descansos</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={onOpenShortRest}
            className="flex items-center gap-1.5 rounded-lg border border-indigo-500/40 bg-indigo-950/40 px-3 py-1.5 text-xs font-semibold text-indigo-300 transition hover:bg-indigo-900/50"
          >
            <Moon className="h-3.5 w-3.5" />
            D. Corto
          </button>
          <button
            type="button"
            onClick={handleLongRest}
            className="flex items-center gap-1.5 rounded-lg border border-amber-500/40 bg-amber-950/40 px-3 py-1.5 text-xs font-semibold text-amber-300 transition hover:bg-amber-900/50"
          >
            <Sun className="h-3.5 w-3.5" />
            D. Largo
          </button>
        </div>
      </div>

      <ClassSubCard
        classId={character.classId}
        className="flex flex-wrap items-center justify-between gap-4 p-4"
      >
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => adjustHp(-5)}
            className="rounded-lg border border-white/10 bg-black/40 px-3 py-1.5 font-mono text-xs font-bold text-rose-300 transition hover:bg-rose-950/80"
          >
            -5
          </button>
          <button
            type="button"
            onClick={() => adjustHp(-1)}
            className="rounded-lg border border-white/10 bg-black/40 px-3 py-1.5 font-mono text-xs font-bold text-rose-300 transition hover:bg-rose-950/80"
          >
            -1
          </button>
          <select
            value={selectedDamageType}
            onChange={(event) => setSelectedDamageType(event.target.value)}
            aria-label="Tipo de daño"
            className="rounded-lg border border-white/10 bg-black/40 px-2 py-1.5 text-xs text-white"
          >
            <option value="Sin tipo">Sin tipo</option>
            <option value="Fuego">Fuego</option>
            <option value="Frío">Frío</option>
            <option value="Relámpago">Relámpago</option>
            <option value="Veneno">Veneno</option>
          </select>
        </div>

        <div className="flex items-baseline gap-2">
          <span className="font-cinzel text-4xl font-extrabold text-white drop-shadow">
            {character.hitPoints.current}
          </span>
          <span className="font-cinzel text-xl text-gray-400">/ {maxHp} PG</span>
          {character.hitPoints.temp > 0 && (
            <span className="ml-2 text-xs font-semibold text-sky-300">
              +{character.hitPoints.temp} temporales
            </span>
          )}
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => adjustHp(1)}
              className="rounded-lg border border-white/10 bg-black/40 px-3 py-1.5 font-mono text-xs font-bold text-emerald-300 transition hover:bg-emerald-950/80"
            >
              +1
            </button>
            <button
              type="button"
              onClick={() => adjustHp(5)}
              className="rounded-lg border border-white/10 bg-black/40 px-3 py-1.5 font-mono text-xs font-bold text-emerald-300 transition hover:bg-emerald-950/80"
            >
              +5
            </button>
          </div>
          <div className="border-l border-white/15 pl-4 text-center">
            <span className="block font-mono text-[10px] text-gray-400">DADOS DE GOLPE</span>
            <span className="font-mono text-xs font-bold text-amber-400">
              {character.hitDice.current}d{getDieSize(character.hitDice.die)}
            </span>
          </div>
        </div>
      </ClassSubCard>

      <div
        className="mt-3 h-2.5 w-full overflow-hidden rounded-full bg-zinc-800"
        role="progressbar"
        aria-label="Puntos de golpe actuales"
        aria-valuenow={character.hitPoints.current}
        aria-valuemin={0}
        aria-valuemax={maxHp}
      >
        <div
          className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-300"
          style={{ width: `${hpPercent}%` }}
        />
      </div>

      <ClassSubCard
        classId={character.classId}
        className="mt-4 flex flex-wrap items-center justify-between gap-4 p-3 text-xs"
      >
        <div className="flex items-center gap-3">
          <span className="font-cinzel font-bold text-emerald-400">ÉXITOS DE MUERTE:</span>
          <div className="flex items-center gap-1.5">
            {[0, 1, 2].map((index) => (
              <button
                key={index}
                type="button"
                onClick={() => toggleDeathSave('successes', index)}
                aria-label={`Éxito de muerte ${index + 1}`}
                aria-pressed={index < character.deathSaves.successes}
                className={`h-4 w-4 rotate-45 rounded-sm border transition ${
                  index < character.deathSaves.successes
                    ? 'border-emerald-400 bg-emerald-500 shadow-[0_0_8px_#10b981]'
                    : 'border-white/20 bg-black/50'
                }`}
              />
            ))}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="font-cinzel font-bold text-rose-500">FALLOS DE MUERTE:</span>
          <div className="flex items-center gap-1.5">
            {[0, 1, 2].map((index) => (
              <button
                key={index}
                type="button"
                onClick={() => toggleDeathSave('failures', index)}
                aria-label={`Fallo de muerte ${index + 1}`}
                aria-pressed={index < character.deathSaves.failures}
                className={`h-4 w-4 rotate-45 rounded-sm border transition ${
                  index < character.deathSaves.failures
                    ? 'border-rose-500 bg-rose-600 shadow-[0_0_8px_#f43f5e]'
                    : 'border-white/20 bg-black/50'
                }`}
              />
            ))}
          </div>
        </div>
      </ClassSubCard>
    </ClassWidgetFrame>
  );
};
