export interface BardicInspirationResource {
  inspirationCurrent: number;
  inspirationMax: number;
  die: string;
  instrument?: 'laud' | 'flauta' | 'tambor' | 'violin';
}

export function bardicInspirationMax(charismaScore: number): number {
  return Math.max(1, Math.floor((charismaScore - 10) / 2));
}

export function bardicInspirationDie(level: number): string {
  if (level >= 15) return 'd12';
  if (level >= 10) return 'd10';
  if (level >= 5) return 'd8';
  return 'd6';
}

export function normalizeBardicInspiration(
  resource: BardicInspirationResource | undefined,
  level: number,
  charismaScore: number,
): BardicInspirationResource {
  const inspirationMax = bardicInspirationMax(charismaScore);
  return {
    ...resource,
    inspirationCurrent: Math.min(
      inspirationMax,
      Math.max(0, resource?.inspirationCurrent ?? inspirationMax),
    ),
    inspirationMax,
    die: bardicInspirationDie(level),
  };
}
