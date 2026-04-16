"use client";

import {
  createContext,
  createElement,
  useContext,
  useEffect,
  useState,
  type PropsWithChildren,
} from "react";
import {
  createEmptyHistoryState,
  exportHistoryAsCsv,
  exportHistoryAsText,
  loadHistoryState,
  mergeHistoryStates,
  normalizeHistoryState,
  parseCsvImport,
  parseTextImport,
  persistHistoryState,
  setFontPreference,
  setModuleDone,
  setModuleNeedsRevision,
  setThemePreference,
  updateModuleVisit,
} from "@/lib/history";
import type {
  ImportMode,
  ImportValidationResult,
  ModuleReference,
  ReadingFont,
  StudyHistoryContextValue,
  StudyHistoryState,
  ThemeMode,
} from "@/types/history";

const StudyHistoryContext = createContext<StudyHistoryContextValue | null>(null);

function applyDocumentPreferences(state: StudyHistoryState) {
  document.documentElement.dataset.theme = state.preferences.theme;
  document.documentElement.dataset.font = state.preferences.font;
}

export function StudyHistoryProvider({ children }: PropsWithChildren) {
  const [state, setState] = useState<StudyHistoryState>(createEmptyHistoryState);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const loaded = normalizeHistoryState(loadHistoryState());
    setState(loaded);
    applyDocumentPreferences(loaded);
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) {
      return;
    }

    persistHistoryState(state);
    applyDocumentPreferences(state);
  }, [hydrated, state]);

  const value: StudyHistoryContextValue = {
    hydrated,
    state,
    markVisited(moduleRef: ModuleReference) {
      setState((current) => updateModuleVisit(current, moduleRef));
    },
    setDone(moduleRef: ModuleReference, nextValue?: boolean) {
      setState((current) => setModuleDone(current, moduleRef, nextValue));
    },
    setNeedsRevision(moduleRef: ModuleReference, nextValue?: boolean) {
      setState((current) => setModuleNeedsRevision(current, moduleRef, nextValue));
    },
    setTheme(theme: ThemeMode) {
      setState((current) => setThemePreference(current, theme));
    },
    setFont(font: ReadingFont) {
      setState((current) => setFontPreference(current, font));
    },
    getModuleRecord(subjectSlug: string, moduleSlug: string) {
      return state.modules[`${subjectSlug}::${moduleSlug}`];
    },
    exportText() {
      return exportHistoryAsText(state);
    },
    exportCsv() {
      return exportHistoryAsCsv(state);
    },
    importText(raw: string, mode: ImportMode): ImportValidationResult {
      const parsed = parseTextImport(raw);
      if (!parsed.valid || !parsed.state) {
        return parsed;
      }

      setState((current) => mergeHistoryStates(current, parsed.state!, mode));
      return parsed;
    },
    importCsv(raw: string, mode: ImportMode): ImportValidationResult {
      const parsed = parseCsvImport(raw);
      if (!parsed.valid || !parsed.state) {
        return parsed;
      }

      setState((current) => {
        const merged = mergeHistoryStates(current, parsed.state!, mode);
        return mode === "merge"
          ? {
              ...merged,
              preferences: current.preferences,
            }
          : merged;
      });
      return parsed;
    },
    resetState() {
      setState(createEmptyHistoryState());
    },
  };

  return createElement(StudyHistoryContext.Provider, { value }, children);
}

export function useStudyHistory() {
  const context = useContext(StudyHistoryContext);

  if (!context) {
    throw new Error("useStudyHistory must be used within StudyHistoryProvider.");
  }

  return context;
}
