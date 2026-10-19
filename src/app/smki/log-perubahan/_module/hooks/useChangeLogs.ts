"use client";

import { useEffect, useState } from "react";
import { createStore, useStore } from "zustand";
import { type ChangeLog, type LogInput, emptyInput, isLogReferences } from "../lib/model";
import { createChangeLog, deleteChangeLog, finalizeChangeLog, listChangeLogs, updateChangeLog } from "../lib/api";

interface State {
  logs: ChangeLog[];
  localLogs: ChangeLog[];
  ready: boolean;
  storageError: string;
  hydrate: () => Promise<void>;
  save: (input: LogInput, previous?: ChangeLog) => Promise<ChangeLog>;
  finalize: (id: string) => Promise<ChangeLog>;
  remove: (id: string) => Promise<void>;
}

function isLog(value: unknown): value is ChangeLog {
  if (!value || typeof value !== "object") return false;
  const item = value as Record<string, unknown>;
  return [...Object.keys(emptyInput).filter(key => key !== "attachments" && key !== "needsFollowUp"), "id", "number", "createdAt", "updatedAt", "finalizedAt"]
    .every(key => typeof item[key] === "string") && ["Draf", "Final"].includes(String(item.status))
    && (item.references === undefined || isLogReferences(item.references))
    && typeof item.needsFollowUp === "boolean" && Array.isArray(item.attachments)
    && item.attachments.every(file => file && typeof file.name === "string" && typeof file.id === "string"
      && typeof file.size === "number" && typeof file.dataUrl === "string" && file.dataUrl.startsWith("data:"));
}

export function useChangeLogs(scope: string) {
  const [store] = useState(() => createStore<State>((set, get) => {
    const key = `aptika:fr032:v1:${scope}`;
    const previousKey = `aptika:fr032:mockup:v1:${scope}`;
    let hydrating = false;
    const persistLocal = (remaining: ChangeLog[]) => localStorage.setItem(key, JSON.stringify(remaining));
    const cleanImportedLocal = (remaining: ChangeLog[]) => {
      try { persistLocal(remaining); }
      catch { /* A server-confirmed record remains saved even if local cleanup fails. */ }
    };
    const replace = (log: ChangeLog) => set(state => ({ logs: [log, ...state.logs.filter(item => item.id !== log.id)] }));
    return {
      logs: [], localLogs: [], ready: false, storageError: "",
      hydrate: async () => {
        if (get().ready || hydrating) return;
        hydrating = true;
        let local: ChangeLog[] = [];
        try {
          const saved = localStorage.getItem(key) ?? localStorage.getItem(previousKey);
          if (saved !== null) {
            const parsed: unknown = JSON.parse(saved);
            if (!Array.isArray(parsed) || !parsed.every(isLog)) throw new Error("Data lokal tidak valid.");
            local = parsed;
          }
        } catch {
          set({ ready: true, storageError: "Data lama di browser tidak dapat dibaca. Data tersebut tetap disimpan untuk diperiksa." });
          return;
        }
        try {
          const server = await listChangeLogs();
          let remaining = local.filter(log => !server.some(item => item.clientLogId === log.id));
          for (const log of [...remaining]) {
            if (log.status === "Final" || !isLogReferences(log.references)) continue;
            try {
              const created = await createChangeLog(log, log.id);
              server.push(created);
              remaining = remaining.filter(item => item.id !== log.id);
              cleanImportedLocal(remaining);
            } catch {
              // Keep the browser record if a master reference is stale or import fails.
            }
          }
          cleanImportedLocal(remaining);
          set({ logs: [...server, ...remaining], localLogs: remaining, ready: true });
        } catch {
          set({ logs: local, localLogs: local, ready: true, storageError: "Server log perubahan tidak dapat dihubungi. Data lokal masih tersedia untuk dilihat; coba muat ulang halaman." });
        }
      },
      save: async (input, previous) => {
        if (get().storageError) throw new Error("Server log perubahan belum tersedia.");
        const oldLocal = previous && get().localLogs.some(item => item.id === previous.id);
        const log = previous && !oldLocal
          ? await updateChangeLog(previous.id, input)
          : await createChangeLog(input, oldLocal ? previous.id : undefined);
        if (oldLocal) {
          const remaining = get().localLogs.filter(item => item.id !== previous.id);
          cleanImportedLocal(remaining);
          set({ localLogs: remaining, logs: get().logs.filter(item => item.id !== previous.id) });
        }
        replace(log);
        return log;
      },
      finalize: async id => {
        const log = await finalizeChangeLog(id);
        replace(log);
        return log;
      },
      remove: async id => {
        if (get().localLogs.some(item => item.id === id)) {
          const remaining = get().localLogs.filter(item => item.id !== id);
          persistLocal(remaining);
          set({ localLogs: remaining, logs: get().logs.filter(item => item.id !== id) });
          return;
        }
        await deleteChangeLog(id);
        set({ logs: get().logs.filter(item => item.id !== id) });
      },
    };
  }));
  const state = useStore(store);
  useEffect(() => { void store.getState().hydrate(); }, [store]);
  return state;
}
