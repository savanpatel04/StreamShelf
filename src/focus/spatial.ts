export type Direction = 'left' | 'right' | 'up' | 'down';

export type FocusRect = {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
};

function center(rect: FocusRect) {
  return { x: rect.x + rect.width / 2, y: rect.y + rect.height / 2 };
}

export function findNeighbor(
  origin: FocusRect,
  direction: Direction,
  candidates: FocusRect[],
): FocusRect | undefined {
  const originCenter = center(origin);
  let best: { item: FocusRect; score: number } | undefined;

  for (const candidate of candidates) {
    if (candidate.id === origin.id) {
      continue;
    }
    const candidateCenter = center(candidate);
    const dx = candidateCenter.x - originCenter.x;
    const dy = candidateCenter.y - originCenter.y;

    const inDirection =
      direction === 'left'
        ? dx < -4
        : direction === 'right'
          ? dx > 4
          : direction === 'up'
            ? dy < -4
            : dy > 4;

    if (!inDirection) {
      continue;
    }

    const primary = direction === 'left' || direction === 'right' ? Math.abs(dx) : Math.abs(dy);
    const secondary = direction === 'left' || direction === 'right' ? Math.abs(dy) : Math.abs(dx);
    const score = primary + secondary * 2.4;

    if (!best || score < best.score) {
      best = { item: candidate, score };
    }
  }

  return best?.item;
}

export function eventToDirection(eventType: string): Direction | undefined {
  if (eventType === 'left' || eventType === 'right' || eventType === 'up' || eventType === 'down') {
    return eventType;
  }
  return undefined;
}
