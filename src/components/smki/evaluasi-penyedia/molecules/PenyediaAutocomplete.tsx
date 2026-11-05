"use client";

import { useEffect, useState } from "react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Modal from "@/components/ui/Modal";
import { showToast } from "@/components/ui/Toast";
import { useFr021PenyediaLookup, useFr021Mutations } from "../hooks/useFr021Queries";
import { readFr021Error } from "@/services/smki/evaluasiPenyediaService";
import type { Fr021FormState } from "../types";
import type { Fr021Penyedia } from "@/services/smki/evaluasiPenyedia.types";

export default function PenyediaAutocomplete({
  form,
  errors,
  onChange,
  disabled,
}: {
  form: Fr021FormState;
  errors: Record<string, string[]>;
  onChange: (changes: Partial<Fr021FormState>) => void;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState(form.penyedia_nama);
  const [showCreate, setShowCreate] = useState(false);
  const [newNama, setNewNama] = useState("");
  const [newContact, setNewContact] = useState("");
  const [newEmail, setNewEmail] = useState("");

  const lookup = useFr021PenyediaLookup(query, open);
  const { createPenyedia } = useFr021Mutations();

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setQuery(form.penyedia_nama);
  }, [form.penyedia_nama]);

  function selectPenyedia(penyedia: Fr021Penyedia) {
    onChange({
      penyedia_id: penyedia.id,
      penyedia_nama: penyedia.nama_penyedia,
      contact_person: penyedia.contact_person ?? "",
      email: penyedia.email ?? "",
    });
    setQuery(penyedia.nama_penyedia);
    setOpen(false);
  }

  async function handleCreate() {
    if (!newNama.trim()) return;
    try {
      const created = await createPenyedia.mutateAsync({
        nama_penyedia: newNama.trim(),
        contact_person: newContact.trim() || undefined,
        email: newEmail.trim() || undefined,
      });
      selectPenyedia(created);
      setShowCreate(false);
      setNewNama("");
      setNewContact("");
      setNewEmail("");
      showToast.success("Penyedia baru berhasil dibuat.");
    } catch (error) {
      const parsed = await readFr021Error(error);
      showToast.error(parsed.message);
    }
  }

  return (
    <div className="relative">
      <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1 uppercase tracking-wide">
        Penyedia Jasa
      </label>
      <div className="relative">
        <input
          type="text"
          value={query}
          placeholder="Pilih atau cari penyedia jasa dari master data..."
          disabled={disabled}
        onFocus={() => setOpen(true)}
        onChange={(event) => {
          const value = event.target.value;
          setQuery(value);
          onChange({ penyedia_id: null, penyedia_nama: value });
          setOpen(true);
        }}
        onBlur={() => {
          // Tutup dropdown setelah klik item sempat terproses.
          window.setTimeout(() => setOpen(false), 150);
        }}
        className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 pr-9 text-sm text-slate-700 dark:text-slate-100 focus:ring-2 focus:ring-emerald-600 focus:outline-none disabled:opacity-60"
      />
        <button
          type="button"
          disabled={disabled}
          onClick={() => setOpen((prev) => !prev)}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-100"
          aria-label="Tampilkan daftar penyedia"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m6 9 6 6 6-6" />
          </svg>
        </button>
      </div>
      {errors.penyedia_id && (
        <p className="text-[10px] font-semibold text-rose-500 mt-1">
          {errors.penyedia_id[0]}
        </p>
      )}

      {open && !disabled && (
        <div className="absolute z-20 mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-lg">
          {lookup.isLoading && (
            <p className="px-3 py-2 text-xs text-slate-500">Memuat...</p>
          )}
          {!lookup.isLoading && (lookup.data ?? []).length === 0 && (
            <p className="px-3 py-2 text-xs text-slate-500">
              Tidak ada penyedia yang cocok.
            </p>
          )}
          {(lookup.data ?? []).map((item) => (
            <button
              key={item.id}
              type="button"
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => selectPenyedia(item)}
              className="block w-full px-3 py-2 text-left text-sm hover:bg-slate-50 dark:hover:bg-slate-800"
            >
              <span className="font-semibold text-slate-800 dark:text-slate-100">
                {item.nama_penyedia}
              </span>
              {item.contact_person && (
                <span className="block text-[11px] text-slate-500">
                  {item.contact_person}
                  {item.email ? ` · ${item.email}` : ""}
                </span>
              )}
            </button>
          ))}
          <button
            type="button"
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => {
              setNewNama(query);
              setShowCreate(true);
              setOpen(false);
            }}
            className="block w-full border-t border-slate-100 dark:border-slate-800 px-3 py-2 text-left text-xs font-semibold text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/30"
          >
            + Buat penyedia baru
          </button>
        </div>
      )}

      <Modal
        isOpen={showCreate}
        onClose={() => setShowCreate(false)}
        title="Buat Penyedia Baru"
        size="sm"
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowCreate(false)}>
              Batal
            </Button>
            <Button
              onClick={handleCreate}
              disabled={createPenyedia.isPending || !newNama.trim()}
            >
              {createPenyedia.isPending ? "Menyimpan..." : "Simpan"}
            </Button>
          </div>
        }
      >
        <div className="space-y-3">
          <Input
            label="Nama Penyedia"
            value={newNama}
            onChange={(event) => setNewNama(event.target.value)}
            required
          />
          <Input
            label="Contact Person"
            value={newContact}
            onChange={(event) => setNewContact(event.target.value)}
          />
          <Input
            label="Email"
            type="email"
            value={newEmail}
            onChange={(event) => setNewEmail(event.target.value)}
          />
        </div>
      </Modal>
    </div>
  );
}
