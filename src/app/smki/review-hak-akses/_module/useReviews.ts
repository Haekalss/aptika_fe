"use client";
import { useCallback, useEffect, useState } from "react";
import { isAxiosError } from "axios";
import { api } from "@/services/api";
import { parseReviews, validateReview, type Review, type ReviewInput } from "./model";

const endpoint = "/smki/review-hak-akses";
export class ReviewSaveError extends Error {
  constructor(message: string, public fields: Record<string, string> = {}) { super(message); }
}
function serverError(error: unknown): ReviewSaveError {
  if (isAxiosError(error)) {
    const fields: Record<string, string> = {};
    const errors = error.response?.data?.errors;
    if (errors && typeof errors === "object") for (const [key, messages] of Object.entries(errors)) {
      if (Array.isArray(messages) && typeof messages[0] === "string") fields[key] = messages[0];
    }
    return new ReviewSaveError(Object.keys(fields).length ? "Periksa isian yang ditandai." : "Data review belum dapat disimpan. Periksa koneksi lalu coba lagi.", fields);
  }
  return error instanceof ReviewSaveError ? error : new ReviewSaveError("Penyimpanan review gagal. Silakan coba kembali.");
}

export function useReviews(userId: number) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    async function load() {
      const all: Review[] = [];
      let page = 1;
      let lastPage = 1;
      try {
        do {
          const response = await api.get(endpoint, {params: {page, per_page: 100}, signal: controller.signal, timeout: 15000});
          if (!response.data.success || !Number.isSafeInteger(response.data.meta?.last_page)) throw new Error("Format respons tidak valid.");
          all.push(...parseReviews(JSON.stringify(response.data.data)));
          lastPage = response.data.meta.last_page;
          page++;
        } while (page <= lastPage);
        if (!controller.signal.aborted) {setReviews(all); setError(""); setReady(true);}
      } catch {
        if (!controller.signal.aborted) {setError("Daftar review gagal dimuat dari server. Periksa koneksi lalu pilih Coba Lagi."); setReady(true);}
      }
    }
    void load();
    return () => controller.abort();
  }, [userId, attempt]);
  const save = async (input: ReviewInput, complete: boolean, previous?: Review): Promise<Review> => {
    const fields = validateReview(input, complete);
    if (Object.keys(fields).length) throw new ReviewSaveError("Lengkapi atau perbaiki isian yang ditandai.", fields);
    try {
      const payload = {...input, status: complete ? "Tersimpan" : "Draf"};
      const response = previous ? await api.put(`${endpoint}/${previous.id}`, payload) : await api.post(endpoint, payload);
      if (!response.data.success) throw new Error("Penyimpanan gagal.");
      const [review] = parseReviews(JSON.stringify([response.data.data]));
      setReviews(current => [review, ...current.filter(item => item.id !== review.id)]);
      return review;
    } catch (error) {throw serverError(error);}
  };
  const remove = async (id: string) => {
    await api.delete(`${endpoint}/${id}`);
    setReviews(current => current.filter(item => item.id !== id));
  };
  const retry = useCallback(() => setAttempt(value => value + 1), []);
  return {reviews, ready, error, save, remove, retry};
}
