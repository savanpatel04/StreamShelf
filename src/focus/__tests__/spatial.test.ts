import { findNeighbor, eventToDirection, type FocusRect } from '../spatial';

const rect = (id: string, x: number, y: number): FocusRect => ({
  id,
  x,
  y,
  width: 100,
  height: 40,
});

describe('findNeighbor', () => {
  const nodes = [rect('a', 0, 0), rect('b', 200, 0), rect('c', 0, 80)];

  it('moves right to the nearest item on the same row', () => {
    expect(findNeighbor(nodes[0], 'right', nodes)?.id).toBe('b');
  });

  it('moves down to the item below', () => {
    expect(findNeighbor(nodes[0], 'down', nodes)?.id).toBe('c');
  });

  it('stays put when nothing exists in that direction', () => {
    expect(findNeighbor(nodes[0], 'left', nodes)).toBeUndefined();
  });
});

describe('eventToDirection', () => {
  it('maps remote event names', () => {
    expect(eventToDirection('left')).toBe('left');
    expect(eventToDirection('select')).toBeUndefined();
  });
});
