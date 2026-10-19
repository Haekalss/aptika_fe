import { useEffect, useRef, type RefObject } from "react";

const FOCUSABLE =
  'button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * Pola aksesibilitas modal yang sama dengan modal Aset SDM:
 * kunci scroll body, fokus masuk ke dialog, jebakan Tab, tutup dengan Esc, kembalikan fokus saat tutup.
 *
 * `locked` = true ketika ada modal lain yang menumpuk di atasnya, sehingga Esc / Tab
 * hanya ditangani oleh modal paling atas.
 */
export function useModalA11y(
  open: boolean,
  locked: boolean,
  onClose: () => void,
  dialogRef: RefObject<HTMLDivElement | null>
) {
  const onCloseRef = useRef(onClose);
  const lockedRef = useRef(locked);

  useEffect(() => {
    onCloseRef.current = onClose;
    lockedRef.current = locked;
  });

  useEffect(() => {
    if (!open) return;

    const previouslyFocused = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const dialog = dialogRef.current;
    if (dialog && !dialog.contains(document.activeElement)) {
      (dialog.querySelector<HTMLElement>(FOCUSABLE) ?? dialog).focus();
    }

    const onKey = (e: KeyboardEvent) => {
      if (lockedRef.current) return;

      if (e.key === "Escape") {
        e.preventDefault();
        onCloseRef.current();
        return;
      }

      if (e.key === "Tab") {
        const els = dialogRef.current?.querySelectorAll<HTMLElement>(FOCUSABLE);
        if (!els || els.length === 0) {
          e.preventDefault();
          return;
        }
        const first = els[0];
        const last = els[els.length - 1];
        const active = document.activeElement;
        const inside = dialogRef.current?.contains(active);

        if (e.shiftKey && (active === first || !inside)) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && (active === last || !inside)) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = previousOverflow;
      if (previouslyFocused && document.contains(previouslyFocused)) previouslyFocused.focus();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);
}
