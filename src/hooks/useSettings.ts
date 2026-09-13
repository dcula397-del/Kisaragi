// ============================================================
// src/hooks/useSettings.ts
// ============================================================
import { useCallback } from "react";
import { useLocalStorage } from "./useLocalStorage";

export interface Settings {
  /** Play a soft chime when a session completes */
  soundEnabled: boolean;
}

const STORAGE_KEY = "kisaragi.settings";

const DEFAULT_SETTINGS: Settings = {
  soundEnabled: true,
};

export function useSettings() {
  const [settings, setSettings] = useLocalStorage<Settings>(
    STORAGE_KEY,
    DEFAULT_SETTINGS
  );

  const setSoundEnabled = useCallback(
    (enabled: boolean) => {
      setSettings((prev) => ({ ...prev, soundEnabled: enabled }));
    },
    [setSettings]
  );

  const toggleSound = useCallback(() => {
    setSettings((prev) => ({ ...prev, soundEnabled: !prev.soundEnabled }));
  }, [setSettings]);

  return {
    settings,
    setSoundEnabled,
    toggleSound,
  };
}
