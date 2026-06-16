import getStringSet from '../../../ui/Label/stringSet';
import { getEmocionalStringSet } from '../get-emocional-string-set';

describe('getEmocionalStringSet', () => {
  it('returns Spanish overrides merged with English base', () => {
    const es = getEmocionalStringSet('es');
    const en = getStringSet('en');

    expect(es.BUTTON__CANCEL).toBe('Cancelar');
    expect(Object.keys(es).length).toBe(Object.keys(en).length);
  });
});
