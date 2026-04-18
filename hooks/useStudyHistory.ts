"use client";

import {
  createContext,
  createElement,
  useContext,
  useEffect,
  useRef,
  useState,
  type PropsWithChildren,
} from "react";
import { authClient } from "@/lib/auth-client";
import {
  createEmptyHistoryState,
  exportHistoryAsText,
  getModuleKey,
  loadHistoryState,
  mergeHistoryStates,
  normalizeHistoryState,
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

function hasMeaningfulHistory(state: StudyHistoryState) {
  return (
    Object.keys(state.modules).length > 0 ||
    state.recentActivity.length > 0 ||
    state.preferences.theme !== "light" ||
    state.preferences.font !== "outfit"
  );
}

export function StudyHistoryProvider({ children }: PropsWithChildren) {
  const { data: sessionData, isPending: sessionPending } = authClient.useSession();
  const [state, setState] = useState<StudyHistoryState>(createEmptyHistoryState);
  const [hydrated, setHydrated] = useState(false);
  const [syncStatus, setSyncStatus] = useState<"local" | "syncing" | "synced" | "error">("local");
  const [remoteReady, setRemoteReady] = useState(false);
  const localBootStateRef = useRef<StudyHistoryState>(createEmptyHistoryState());
  const migratedFromLocalAtRef = useRef<string | null>(null);
  const lastRemoteSerializedRef = useRef<string | null>(null);

  useEffect(() => {
    const loaded = normalizeHistoryState(loadHistoryState());
    localBootStateRef.current = loaded;
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

  useEffect(() => {
    if (!hydrated) {
      return;
    }

    if (sessionPending) {
      return;
    }

    if (!sessionData?.user?.id) {
      setRemoteReady(false);
      setSyncStatus("local");
      migratedFromLocalAtRef.current = null;
      lastRemoteSerializedRef.current = null;
      return;
    }

    let cancelled = false;

    const loadRemoteProgress = async () => {
      setSyncStatus("syncing");

      try {
        const response = await fetch("/api/user-progress", {
          method: "GET",
          cache: "no-store",
          credentials: "same-origin",
        });

        if (!response.ok) {
          throw new Error("Failed to load remote progress.");
        }

        const payload = (await response.json()) as {
          state?: unknown;
          migratedFromLocalAt?: string | null;
        };

        let remoteState = normalizeHistoryState(payload.state);
        let migratedFromLocalAt = payload.migratedFromLocalAt ?? null;

        if (!migratedFromLocalAt && hasMeaningfulHistory(localBootStateRef.current)) {
          remoteState = mergeHistoryStates(remoteState, localBootStateRef.current, "merge");
          migratedFromLocalAt = new Date().toISOString();

          await fetch("/api/user-progress", {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            credentials: "same-origin",
            body: JSON.stringify({
              state: remoteState,
              migratedFromLocalAt,
            }),
          });
        }

        if (cancelled) {
          return;
        }

        migratedFromLocalAtRef.current = migratedFromLocalAt;
        lastRemoteSerializedRef.current = JSON.stringify(normalizeHistoryState(remoteState));
        setState(remoteState);
        setRemoteReady(true);
        setSyncStatus("synced");
      } catch {
        if (!cancelled) {
          setRemoteReady(false);
          setSyncStatus("error");
        }
      }
    };

    void loadRemoteProgress();

    return () => {
      cancelled = true;
    };
  }, [hydrated, sessionData?.user?.id, sessionPending]);

  useEffect(() => {
    if (!hydrated || sessionPending || !sessionData?.user?.id || !remoteReady) {
      return;
    }

    const serialized = JSON.stringify(normalizeHistoryState(state));

    if (serialized === lastRemoteSerializedRef.current) {
      return;
    }

    setSyncStatus("syncing");

    const timeout = window.setTimeout(async () => {
      try {
        const response = await fetch("/api/user-progress", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "same-origin",
          body: JSON.stringify({
            state,
            migratedFromLocalAt: migratedFromLocalAtRef.current,
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to save remote progress.");
        }

        lastRemoteSerializedRef.current = serialized;
        setSyncStatus("synced");
      } catch {
        setSyncStatus("error");
      }
    }, 350);

    return () => {
      window.clearTimeout(timeout);
    };
  }, [hydrated, remoteReady, sessionData?.user?.id, sessionPending, state]);

  const value: StudyHistoryContextValue = {
    hydrated,
    isAuthenticated: Boolean(sessionData?.user?.id),
    syncStatus,
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
      return state.modules[getModuleKey(subjectSlug, moduleSlug)];
    },
    exportText() {
      return exportHistoryAsText(state);
    },
    importText(raw: string, mode: ImportMode): ImportValidationResult {
      const parsed = parseTextImport(raw);
      if (!parsed.valid || !parsed.state) {
        return parsed;
      }

      setState((current) => mergeHistoryStates(current, parsed.state!, mode));
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
