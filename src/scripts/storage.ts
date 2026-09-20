export type Scores = Record<string, number>;
export function read<T>(key: string, fallback: T): T {
  try {
    const parsed: unknown = JSON.parse(
      localStorage.getItem(`durnoty:${key}`) || 'null',
    );
    if (parsed === null || typeof parsed !== typeof fallback) return fallback;
    if (
      Array.isArray(fallback) &&
      (!Array.isArray(parsed) ||
        !parsed.every((item) => typeof item === 'string'))
    )
      return fallback;
    if (!Array.isArray(fallback) && Array.isArray(parsed)) return fallback;
    if (typeof parsed === 'number' && !Number.isFinite(parsed)) return fallback;
    if (
      typeof fallback === 'object' &&
      !Array.isArray(fallback) &&
      !Object.values(parsed as object).every(
        (value) => typeof value === 'number' && Number.isFinite(value),
      )
    )
      return fallback;
    return parsed as T;
  } catch {
    return fallback;
  }
}
export function write(key: string, value: unknown): void {
  try {
    localStorage.setItem(`durnoty:${key}`, JSON.stringify(value));
  } catch {
    /* Private/full storage: play continues for this visit. */
  }
}
export function event(
  name: string,
  detail: Record<string, unknown> = {},
): void {
  window.dispatchEvent(
    new CustomEvent('durnoty:event', { detail: { name, ...detail } }),
  );
}
export function unlock(id: string): void {
  const saved = read<string[]>('achievements', []);
  if (saved.includes(id)) return;
  write('achievements', [...saved, id]);
  window.dispatchEvent(new CustomEvent('durnoty:achievement', { detail: id }));
}
export function saveScore(
  game: string,
  value: number,
  lowerIsBetter = false,
): void {
  const scores = read<Scores>('scores', {});
  if (
    !(game in scores) ||
    (lowerIsBetter ? value < scores[game]! : value > scores[game]!)
  ) {
    scores[game] = value;
    write('scores', scores);
  }
  event('game_completed', { game, score: value });
}
