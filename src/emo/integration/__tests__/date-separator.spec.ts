import format from 'date-fns/format';
import es from 'date-fns/locale/es';

import {
  EMOCIONAL_DATE_SEPARATOR_LOCALE,
  formatEmocionalMessageDateSeparator,
  resolveEmocionalDateSeparatorColor,
  resolveEmocionalDateSeparatorLabelColor,
} from '../date-separator';
import { Colors } from '../../../utils/color';
import { Colors as LabelColors } from '../../../ui/Label/types';

describe('emo/integration/date-separator', () => {
  it('uses emocional border color tokens', () => {
    expect(resolveEmocionalDateSeparatorColor()).toBe(Colors.EMOCIONAL_BORDER);
    expect(resolveEmocionalDateSeparatorLabelColor()).toBe(LabelColors.EMOCIONAL_BORDER);
  });

  it('formats message date separators in spanish', () => {
    const formatted = formatEmocionalMessageDateSeparator(
      new Date('2024-03-15T12:00:00Z').getTime(),
      'dd MMM yyyy',
    );

    expect(formatted).toBe(
      format(new Date('2024-03-15T12:00:00Z').getTime(), 'dd MMM yyyy', { locale: es }),
    );
    expect(EMOCIONAL_DATE_SEPARATOR_LOCALE.code).toBe('es');
  });
});
