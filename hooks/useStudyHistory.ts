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
import {
  createOfflineProgressMutation,
  enqueueProgressMutation,
  listProgressMutations,
  removeProgressMutations,
} from "@/lib/offline-storage";
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
  const [pendingMutationVersion, setPendingMutationVersion] = useState(0);
  const localBootStateRef = useRef<StudyHistoryState>(createEmptyHistoryState());
  const migratedFromLocalAtRef = useRef<string | null>(null);
  const lastRemoteSerializedRef = useRef<string | null>(null);
  const moduleMutationPendingRef = useRef(false);

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

    if (moduleMutationPendingRef.current) {
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

  useEffect(() => {
    if (!hydrated || sessionPending || !sessionData?.user?.id || !remoteReady) {
      return;
    }

    if (typeof navigator !== "undefined" && !navigator.onLine) {
      return;
    }

    let cancelled = false;

    const flushMutations = async () => {
      const mutations = await listProgressMutations();

      if (!mutations.length) {
        moduleMutationPendingRef.current = false;
        return;
      }

      moduleMutationPendingRef.current = true;
      setSyncStatus("syncing");

      try {
        const response = await fetch("/api/user-progress/sync", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "same-origin",
          body: JSON.stringify({ mutations }),
        });

        if (!response.ok) {
          throw new Error("Failed to sync progress mutations.");
        }

        const payload = (await response.json()) as {
          state?: unknown;
          migratedFromLocalAt?: string | null;
          appliedMutationIds?: string[];
        };

        await removeProgressMutations(payload.appliedMutationIds ?? mutations.map((mutation) => mutation.id));

        if (cancelled) {
          return;
        }

        const remoteState = normalizeHistoryState(payload.state);
        migratedFromLocalAtRef.current = payload.migratedFromLocalAt ?? migratedFromLocalAtRef.current;
        lastRemoteSerializedRef.current = JSON.stringify(remoteState);
        moduleMutationPendingRef.current = false;
        setState(remoteState);
        setSyncStatus("synced");
      } catch {
        if (!cancelled) {
          moduleMutationPendingRef.current = true;
          setSyncStatus("error");
        }
      }
    };

    void flushMutations();

    return () => {
      cancelled = true;
    };
  }, [hydrated, pendingMutationVersion, remoteReady, sessionData?.user?.id, sessionPending]);

  useEffect(() => {
    function retrySync() {
      setPendingMutationVersion((current) => current + 1);
    }

    window.addEventListener("online", retrySync);
    return () => window.removeEventListener("online", retrySync);
  }, []);

  function queueMutation(mutation: ReturnType<typeof createOfflineProgressMutation>) {
    moduleMutationPendingRef.current = true;
    void enqueueProgressMutation(mutation).finally(() => {
      setPendingMutationVersion((current) => current + 1);
    });
  }

  const value: StudyHistoryContextValue = {
    hydrated,
    isAuthenticated: Boolean(sessionData?.user?.id),
    syncStatus,
    state,
    markVisited(moduleRef: ModuleReference) {
      setState((current) => updateModuleVisit(current, moduleRef));
      queueMutation(
        createOfflineProgressMutation({
          type: "visit",
          moduleRef,
          visitDelta: 1,
        }),
      );
    },
    setDone(moduleRef: ModuleReference, nextValue?: boolean) {
      setState((current) => {
        const currentRecord = current.modules[getModuleKey(moduleRef.subjectSlug, moduleRef.moduleSlug)];
        const resolvedValue = typeof nextValue === "boolean" ? nextValue : !currentRecord?.done;
        queueMutation(
          createOfflineProgressMutation({
            type: "done",
            moduleRef,
            value: resolvedValue,
          }),
        );
        return setModuleDone(current, moduleRef, resolvedValue);
      });
    },
    setNeedsRevision(moduleRef: ModuleReference, nextValue?: boolean) {
      setState((current) => {
        const currentRecord = current.modules[getModuleKey(moduleRef.subjectSlug, moduleRef.moduleSlug)];
        const resolvedValue = typeof nextValue === "boolean" ? nextValue : !currentRecord?.needsRevision;
        queueMutation(
          createOfflineProgressMutation({
            type: "needsRevision",
            moduleRef,
            value: resolvedValue,
          }),
        );
        return setModuleNeedsRevision(current, moduleRef, resolvedValue);
      });
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
