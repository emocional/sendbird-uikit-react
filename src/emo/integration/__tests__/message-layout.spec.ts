import { resolveEmocionalIsByMe, EMOCIONAL_FORCE_INCOMING_MESSAGE_LAYOUT } from '../message-layout';

describe('message-layout', () => {
  it('forces incoming layout when enabled', () => {
    expect(EMOCIONAL_FORCE_INCOMING_MESSAGE_LAYOUT).toBe(true);
    expect(resolveEmocionalIsByMe(true)).toBe(false);
    expect(resolveEmocionalIsByMe(false)).toBe(false);
  });
});
