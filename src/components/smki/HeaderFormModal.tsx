import React, { useState, useEffect } from "react";
import { X, Save } from "lucide-react";
import { HeaderInfoFR010 } from "@/services/smki/komunikasiService";

interface HeaderFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    initialData: HeaderInfoFR010;
    onSubmit: (data: Partial<HeaderInfoFR010>) => Promise<void>;
}

export default function HeaderFormModal({ isOpen, onClose, initialData, onSubmit }: HeaderFormModalProps) {
    const [formData, setFormData] = useState<HeaderInfoFR010>(initialData);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Reset form ketika modal dibuka
    useEffect(() => {
        if (isOpen) {
            setFormData(initialData);
        }
    }, [isOpen, initialData]);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await onSubmit(formData);
            onClose();
        } catch (error) {
            console.error(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
            <div className="bg-white dark:bg-[#0d1d36] w-full max-w-md rounded-2xl shadow-xl overflow-hidden border border-slate-200 dark:border-slate-800">

                {/* Modal Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
                    <h2 className="text-lg font-bold text-slate-800 dark:text-white">Edit Metadata Dokumen</h2>
                    <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                        <X size={20} />
                    </button>
                </div>

                {/* Modal Body (Form) */}
                <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4">
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Nomor Dokumen</label>
                        <input
                            type="text"
                            required
                            value={formData.no_dokumen}
                            onChange={(e) => setFormData({ ...formData, no_dokumen: e.target.value })}
                            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#071733] text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-[#0f8b58]/20 focus:border-[#0f8b58] outline-none"
                            placeholder="Contoh: FR-010/KOM.03.05/SANDIKAMI"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Nomor Revisi</label>
                        <input
                            type="text"
                            required
                            value={formData.no_revisi}
                            onChange={(e) => setFormData({ ...formData, no_revisi: e.target.value })}
                            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#071733] text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-[#0f8b58]/20 focus:border-[#0f8b58] outline-none"
                            placeholder="Contoh: 1.1"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Tanggal Berlaku</label>
                        <input
                            type="text"
                            required
                            value={formData.tanggal_berlaku}
                            onChange={(e) => setFormData({ ...formData, tanggal_berlaku: e.target.value })}
                            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#071733] text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-[#0f8b58]/20 focus:border-[#0f8b58] outline-none"
                            placeholder="Contoh: 07 Juli 2022"
                        />
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center justify-end gap-3 mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 rounded-xl transition-colors"
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="px-5 py-2 text-sm font-bold text-white bg-[#0f8b58] hover:bg-[#0c7449] active:scale-[0.98] rounded-xl flex items-center gap-2 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {isSubmitting ? "Menyimpan..." : (
                                <>
                                    <Save size={16} />
                                    Simpan Perubahan
                                </>
                            )}
                        </button>
                    </div>
                </form>

            </div>
        </div>
    );
}