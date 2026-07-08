import { useSettings } from '../stores/SettingsStore';
import { en, type TranslationKey } from './en';

export function useTranslation() {
  const { state } = useSettings();
  const lang = state.language;

  const t = (key: TranslationKey): string => {
    return en[key] || key;
  };

  return { t, lang };
}
