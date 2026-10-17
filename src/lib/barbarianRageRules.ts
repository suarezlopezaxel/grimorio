export function barbarianRageMaxForLevel(level: number): number {
  const lvl = Math.max(1, Math.min(20, Math.floor(level)));
  if (lvl <= 2) return 2;
  if (lvl <= 5) return 3;
  if (lvl <= 11) return 4;
  if (lvl <= 16) return 5;
  if (lvl <= 19) return 6;
  return 100; // placeholder for effectively "unlimited"
}

export function barbarianRageDamageBonusForLevel(level: number): number {
  const lvl = Math.max(1, Math.min(20, Math.floor(level)));
  if (lvl <= 8) return 2;
  if (lvl <= 15) return 3;
  return 4;
}
