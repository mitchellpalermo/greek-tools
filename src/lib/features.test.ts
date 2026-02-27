import { describe, it, expect } from 'vitest';
import { isDrillsEnabled } from './features';

describe('isDrillsEnabled', () => {
  it('returns true when DRILLS_ENABLED is "true"', () => {
    expect(isDrillsEnabled({ DRILLS_ENABLED: 'true' })).toBe(true);
  });

  it('returns false when DRILLS_ENABLED is "false"', () => {
    expect(isDrillsEnabled({ DRILLS_ENABLED: 'false' })).toBe(false);
  });

  it('returns false when DRILLS_ENABLED is absent', () => {
    expect(isDrillsEnabled({})).toBe(false);
  });

  it('returns false when env is undefined (static page context)', () => {
    expect(isDrillsEnabled(undefined)).toBe(false);
  });

  it('returns false for any value other than "true"', () => {
    expect(isDrillsEnabled({ DRILLS_ENABLED: '1' })).toBe(false);
    expect(isDrillsEnabled({ DRILLS_ENABLED: 'yes' })).toBe(false);
    expect(isDrillsEnabled({ DRILLS_ENABLED: 'TRUE' })).toBe(false);
    expect(isDrillsEnabled({ DRILLS_ENABLED: '' })).toBe(false);
  });
});
