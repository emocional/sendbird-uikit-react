import { changeColorToClassName, Colors } from '../color';
import { truncateString } from '../index';

describe('color', () => {
  it('check all color enum exist', () => {
    expect(Colors.EMOCIONAL_BORDER).not.toBe(undefined);
    expect(Colors.ONBACKGROUND_1).not.toBe(undefined);
    expect(Colors.ONBACKGROUND_2).not.toBe(undefined);
    expect(Colors.ONBACKGROUND_3).not.toBe(undefined);
    expect(Colors.ONBACKGROUND_4).not.toBe(undefined);
    expect(Colors.ONCONTENT_1).not.toBe(undefined);
    expect(Colors.PRIMARY).not.toBe(undefined);
    expect(Colors.ERROR).not.toBe(undefined);
  });

  it('change color enum to proper className', () => {
    for (const color of Object.values(Colors)) {
      if (color === Colors.EMOCIONAL_BORDER) {
        expect(changeColorToClassName(color)).toBe('sendbird-color--emocional_border');
        continue;
      }
      expect(changeColorToClassName(color)).toBe(`sendbird-color--${color.toLowerCase().replace('_', '-')}`);
    }

    const nonColor = 'not-existing-color-enum-value';
    expect(changeColorToClassName(nonColor)).toBe('');
  });
});

describe('truncateString', () => {
  it('truncate string properly by the given parameter', () => {
    expect(truncateString('this is full string', 10)).toBe('this...ing');
  });
});
