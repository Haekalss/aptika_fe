"use client";

import { useEffect, useState } from "react";
import { createStore, useStore } from "zustand";
import { type ChangeLog, type LogInput } from "../lib/model";
import { createChangeLog, deleteChangeLog, listChangeLogs, updateChangeLog } from "../lib/api";

type Status = "Draf" | "Tersimpan";
interface State {
  logs: ChangeLog[];
  ready: boolean;
  storageError: string;
  hydrate: () => Promise<void>;
  save: (input: LogInput, status: Status, previous?: ChangeLog) => Promise<ChangeLog>;
  remove: (id: string) => Promise<void>;
}

export function useChangeLogs(scope: string) {
  const [store] = useState(() => createStore<State>((set, get) => {
    let hydrating = false;
    return {
      logs: [], ready: false, storageError: "",
      hydrate: async () => {
        if (get().ready || hydrating) return;
        hydrating = true;
        try {
          const logs = await listChangeLogs();
          // The previous browser-only mockup records are retired with the old format.
          try {
            localStorage.removeItem(`aptika:fr032:v1:${scope}`);
            localStorage.removeItem(`aptika:fr032:mockup:v1:${scope}`);
          } catch { /* Server records remain usable if browser storage is unavailable. */ }
          set({ logs, ready: true });
        } catch {
          set({ ready: true, storageError: "Server log perubahan tidak dapat dihubungi. Muat ulang halaman setelah koneksi tersedia." });
        } finally { hydrating = false; }
      },
      save: async (input, status, previous) => {
        if (get().storageError) throw new Error("Server log perubahan belum tersedia.");
        const log = previous
          ? await updateChangeLog(previous.id, input, status)
          : await createChangeLog(input, status);
        set(state => ({ logs: [log, ...state.logs.filter(item => item.id !== log.id)] }));
        return log;
      },
      remove: async id => {
        if (get().storageError) throw new Error("Server log perubahan belum tersedia.");
        await deleteChangeLog(id);
        set(state => ({ logs: state.logs.filter(item => item.id !== id) }));
      },
    };
  }));
  const state = useStore(store);
  useEffect(() => { void store.getState().hydrate(); }, [store]);
  return state;
}
