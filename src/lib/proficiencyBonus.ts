export function getProficiencyBonus(level: number): number {
  const lvl = Math.max(1, Math.min(20, Math.floor(level)));
  if (lvl >= 17) return 6;
  if (lvl >= 13) return 5;
  if (lvl >= 9) return 4;
  if (lvl >= 5) return 3;
  return 2;
}
