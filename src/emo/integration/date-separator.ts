import format from 'date-fns/format';
import es from 'date-fns/locale/es';

import { Colors } from '../../utils/color';
import { Colors as LabelColors } from '../../ui/Label/types';

export const EMOCIONAL_DATE_SEPARATOR_LOCALE = es;

export function resolveEmocionalDateSeparatorColor(): Colors {
  return Colors.EMOCIONAL_BORDER;
}

export function resolveEmocionalDateSeparatorLabelColor(): typeof LabelColors.EMOCIONAL_BORDER {
  return LabelColors.EMOCIONAL_BORDER;
}

export function formatEmocionalMessageDateSeparator(
  createdAt: number,
  dateFormat: string,
): string {
  return format(createdAt, dateFormat, { locale: EMOCIONAL_DATE_SEPARATOR_LOCALE });
}
