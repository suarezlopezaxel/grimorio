import type { Combatant, Encounter } from '../types';

export function sortCombatants(combatants: Combatant[]): Combatant[] {
  return [...combatants].sort((a, b) => (
    b.initiative - a.initiative
      || (b.initiativeBonus ?? 0) - (a.initiativeBonus ?? 0)
      || a.name.localeCompare(b.name)
  ));
}

export function sortEncounter(encounter: Encounter): Encounter {
  const currentId = encounter.combatants[encounter.turnIndex]?.id;
  const combatants = sortCombatants(encounter.combatants);
  const currentIndex = currentId
    ? combatants.findIndex((combatant) => combatant.id === currentId)
    : -1;
  return {
    ...encounter,
    combatants,
    turnIndex: currentIndex >= 0 ? currentIndex : 0,
  };
}

export function advanceEncounter(encounter: Encounter): {
  encounter: Encounter;
  wrapped: boolean;
  currentCombatant: Combatant | null;
} {
  const current = sortEncounter(encounter);
  if (current.combatants.length === 0) {
    return {
      encounter: { ...current, turnIndex: 0 },
      wrapped: true,
      currentCombatant: null,
    };
  }

  const nextIndex = current.turnIndex + 1;
  const wrapped = nextIndex >= current.combatants.length;
  const turnIndex = wrapped ? 0 : nextIndex;
  const round = wrapped ? current.round + 1 : current.round;
  const advanced = { ...current, turnIndex, round };
  return {
    encounter: advanced,
    wrapped,
    currentCombatant: advanced.combatants[turnIndex],
  };
}

export function updateCombatant(
  encounter: Encounter,
  combatantId: string,
  update: (combatant: Combatant) => Combatant,
): Encounter {
  const updated = {
    ...encounter,
    combatants: encounter.combatants.map((combatant) => (
      combatant.id === combatantId ? update(combatant) : combatant
    )),
  };
  return sortEncounter(updated);
}

export function removeCombatant(encounter: Encounter, combatantId: string): Encounter {
  const ordered = sortEncounter(encounter);
  const currentId = ordered.combatants[ordered.turnIndex]?.id;
  const removedIndex = ordered.combatants.findIndex((combatant) => combatant.id === combatantId);
  const combatants = ordered.combatants.filter((combatant) => combatant.id !== combatantId);
  const nextId = currentId === combatantId
    ? ordered.combatants[(removedIndex + 1) % ordered.combatants.length]?.id
    : currentId;
  const currentIndex = combatants.findIndex((combatant) => combatant.id === nextId);
  return {
    ...ordered,
    combatants,
    turnIndex: currentIndex >= 0 ? currentIndex : 0,
  };
}
