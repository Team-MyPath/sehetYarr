import { en } from './en';
import { ur } from './ur';
import { pa } from './pa';
import { sd } from './sd';
import { ps } from './ps';

export const dictionaries = {
  en,
  ur,
  pa,
  sd,
  ps
};

export type Language = keyof typeof dictionaries;
export type Dictionary = typeof en;

