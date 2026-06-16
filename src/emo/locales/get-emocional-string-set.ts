import type { Locale } from 'date-fns';
import es from 'date-fns/locale/es';
import en from 'date-fns/locale/en-US';

import getStringSet, { type StringSet } from '../../ui/Label/stringSet';
import { ES_STRING_SET_OVERRIDES } from './es-string-set-overrides';

export type EmocionalLocale = 'en' | 'es';

export const getEmocionalStringSet = (locale: EmocionalLocale = 'es'): StringSet => {
  const base = getStringSet('en');
  if (locale === 'en') {
    return base;
  }
  return { ...base, ...ES_STRING_SET_OVERRIDES };
};

export const getEmocionalDateLocale = (locale: EmocionalLocale = 'es'): Locale => (
  locale === 'es' ? es : en
);

export const resolveEmocionalLocalization = ({
  defaultLocale = 'es',
  stringSet,
  dateLocale,
}: {
  defaultLocale?: EmocionalLocale;
  stringSet?: Partial<StringSet>;
  dateLocale?: Locale;
}): { stringSet: StringSet; dateLocale: Locale } => {
  const resolvedBase = getEmocionalStringSet(defaultLocale);
  return {
    stringSet: { ...resolvedBase, ...stringSet },
    dateLocale: dateLocale ?? getEmocionalDateLocale(defaultLocale),
  };
};
