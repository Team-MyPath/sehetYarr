import { en } from './en';
import { ur } from './ur';
import { pa } from './pa';

export const dictionaries = {
  en,
  ur,
  pa
};

export type Language = keyof typeof dictionaries;
export type Dictionary = typeof en;

