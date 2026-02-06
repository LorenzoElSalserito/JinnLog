import { useEffect, useRef } from "react";

/**
 * FocusManager - Gestione globale del focus per text-box in Electron
 *
 * Versione 3.2 - Fix webContents key focus su Linux
 *
 * PROBLEMA RISOLTO:
 * Su Linux, dopo Alt+Tab o azioni come "elimina nota", può succedere che:
 * - window.isFocused() = true (la finestra ha focus a livello window manager)
 * - webContents NON ha il "key focus" interno
 * - Risultato: la tastiera non funziona anche se la finestra è in primo piano!
 *
 * SOLUZIONE v3.2:
 * - Quando clicchi su una text-box, verifica DOPO 100ms se il focus è arrivato
 * - Se NON è arrivato, chiama il nuovo IPC handler `jl:ensure-webcontent-focus`
 *   che forza webContents.focus() per recuperare il key focus
 * - POI applica focus alla text-box
 *
 * @author Lorenzo DM
 * @since 0.2.0
 * @updated 0.8.3 - Fix webContents key focus con nuovo IPC handler
 */

// Selettore per text-box (esclude bottoni, checkbox, radio, file input)
const TEXTBOX_SELECTOR = [
  "textarea",
  "input:not([type=button]):not([type=submit]):not([type=reset]):not([type=checkbox]):not([type=radio]):not([type=file])",
  '[contenteditable="true"]',
].join(",");

/**
 * Verifica se un elemento è disabilitato o read-only
 */
function isDisabledLike(el) {
  return !!(el?.disabled || el?.readOnly);
}

/**
 * Verifica se un elemento è una text-box
 */
function isTextBox(el) {
  return !!el?.matches?.(TEXTBOX_SELECTOR);
}

/**
 * Posiziona il caret alla fine del testo in un elemento
 * Funziona con input, textarea e contenteditable
 */
function placeCaretAtEnd(el) {
  if (!el || !el.isConnected || isDisabledLike(el)) return false;

  // Focus con preventScroll per evitare scroll indesiderati
  try {
    el.focus?.({ preventScroll: true });
  } catch (e) {
    try { el.focus?.(); } catch (e2) { return false; }
  }

  // Posiziona caret per input/textarea
  if (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement) {
    const len = (el.value ?? "").length;
    try {
      el.setSelectionRange(len, len);
    } catch (e) {
      // Alcuni tipi di input (es. date) non supportano setSelectionRange
    }
    return true;
  }

  // Posiziona caret per contenteditable
  if (el?.isContentEditable) {
    try {
      const range = document.createRange();
      range.selectNodeContents(el);
      range.collapse(false);
      const sel = window.getSelection();
      sel?.removeAllRanges();
      sel?.addRange(range);
    } catch (e) {
      // Fallback
    }
    return true;
  }

  return true;
}

// Throttling per le richieste di focus alla finestra
let _lastWindowFocusRequestAt = 0;
const WINDOW_FOCUS_THROTTLE_MS = 500;

/**
 * Richiede il key-focus della finestra in modo sincrono
 * Chiama SOLO se !document.hasFocus()
 */
function requestWindowKeyFocusSync(reason = 'textbox') {
  const now = Date.now();

  // Throttling
  if (now - _lastWindowFocusRequestAt < WINDOW_FOCUS_THROTTLE_MS) {
    return;
  }
  _lastWindowFocusRequestAt = now;

  // Se la finestra è già focused, non fare nulla
  if (document.hasFocus()) {
    return;
  }

  console.log(`[FocusManager] Requesting window focus (${reason})`);

  try {
    window.JLWindow?.forceFocusSync?.(reason);
  } catch (e) {
    try { window.JLWindow?.forceFocus?.(reason); } catch (e2) { /* ignore */ }
  }

  try { window.focus?.(); } catch (e) { /* ignore */ }
}

/**
 * NUOVO in v3.2: Forza webContents.focus() per recuperare il key focus
 *
 * Questo è il fix per il caso dove:
 * - La finestra è focused (document.hasFocus() = true)
 * - MA webContents non ha il key focus
 * - Quindi la tastiera non funziona
 */
function ensureWebContentFocus(reason = 'ensure') {
  console.log(`[FocusManager] Ensuring webContent focus (${reason})`);

  try {
    // Usa il nuovo IPC handler che SEMPRE chiama webContents.focus()
    window.JLWindow?.ensureWebContentFocusSync?.(reason);
  } catch (e) {
    console.warn('[FocusManager] ensureWebContentFocusSync failed:', e);
    // Fallback: prova con forceFocusSync
    try {
      window.JLWindow?.forceFocusSync?.(reason);
    } catch (e2) { /* ignore */ }
  }
}

export default function FocusManager() {
  // Ref per la text-box che l'utente sta cercando di usare
  const pendingElRef = useRef(null);
  // Ref per l'ultima text-box che aveva focus
  const lastEditorRef = useRef(null);
  // Timestamp dell'ultimo click su text-box
  const lastTextboxClickRef = useRef(0);
  // Flag per evitare chiamate multiple
  const isProcessingRef = useRef(false);

  useEffect(() => {
    /**
     * Verifica se il focus è arrivato sulla text-box target
     * Se no, aiuta a darglielo - con FIX per webContents key focus
     */
    const ensureFocusOnTextbox = (targetEl, delay = 100) => {
      if (!targetEl || !targetEl.isConnected || isDisabledLike(targetEl)) return;
      if (isProcessingRef.current) return;

      isProcessingRef.current = true;

      setTimeout(() => {
        isProcessingRef.current = false;

        // Se l'elemento non è più nel DOM, cerca alternative
        if (!targetEl.isConnected) {
          const modal = document.querySelector(".modal.show");
          const fallback = modal?.querySelector(TEXTBOX_SELECTOR) ||
              document.querySelector(`${TEXTBOX_SELECTOR}:focus`);
          if (fallback && fallback.isConnected && !isDisabledLike(fallback)) {
            placeCaretAtEnd(fallback);
          }
          return;
        }

        // Se il focus è già sull'elemento target, tutto OK
        if (document.activeElement === targetEl) {
          return;
        }

        // Se il focus è su UN'ALTRA text-box, l'utente ha probabilmente cliccato altrove
        // Non interferire
        if (isTextBox(document.activeElement)) {
          return;
        }

        // Il focus non è arrivato - QUESTO È IL CASO PROBLEMATICO
        console.log('[FocusManager] Focus assist needed - focus did not arrive on textbox');

        // PRIMA: assicurati che webContents abbia il key focus
        // Questo è il FIX per il problema "window focused ma webContents no"
        ensureWebContentFocus('focus-assist');

        // POI: applica focus alla text-box dopo un breve delay
        // per dare tempo a webContents.focus() di completare
        setTimeout(() => {
          if (targetEl.isConnected && !isDisabledLike(targetEl)) {
            console.log('[FocusManager] Applying focus to textbox after webContent focus');
            placeCaretAtEnd(targetEl);
          }
        }, 30);

      }, delay);
    };

    /**
     * Pianifica il focus quando la finestra sarà key-focused
     */
    const scheduleFocusWhenReady = (el) => {
      pendingElRef.current = el;

      const attempt = (tries = 0) => {
        const target = pendingElRef.current;
        if (!target || !target.isConnected) return;

        if (document.hasFocus()) {
          placeCaretAtEnd(target);
          pendingElRef.current = null;
          return;
        }

        if (tries < 12) {
          requestAnimationFrame(() => attempt(tries + 1));
        }
      };

      requestAnimationFrame(() => attempt(0));
    };

    // ========================================
    // REGOLA 1: Intercetta click su text-box
    // ========================================
    const onPointerDownCapture = (e) => {
      const raw = e.target;
      if (!raw?.closest) return;

      const el = raw.closest(TEXTBOX_SELECTOR);

      if (el && el.isConnected && !isDisabledLike(el)) {
        lastEditorRef.current = el;
        lastTextboxClickRef.current = Date.now();

        // Se la finestra NON è key-focused, richiedi focus
        if (!document.hasFocus()) {
          requestWindowKeyFocusSync('pointerdown-textbox');
          scheduleFocusWhenReady(el);
          return;
        }

        // La finestra È focused - verifica dopo un po' se il focus è arrivato
        // Questo cattura il caso "webContents non ha key focus"
        ensureFocusOnTextbox(el, 100);
        return;
      }
    };

    // ========================================
    // REGOLA 2: Quando la finestra torna attiva
    // ========================================
    const onWindowFocus = () => {
      const el = pendingElRef.current;
      if (el && el.isConnected && !isDisabledLike(el)) {
        placeCaretAtEnd(el);
        pendingElRef.current = null;
      }
    };

    // ========================================
    // REGOLA 3: Auto-focus su apertura modale
    // ========================================
    let lastModalSeen = null;
    let modalCheckTimeout = null;

    const mutationObserver = new MutationObserver(() => {
      const modal =
          document.querySelector(".modal.show") ||
          document.querySelector("[data-portal-modal='true']") ||
          document.querySelector("[role='dialog'][data-open='true']");

      if (!modal) {
        lastModalSeen = null;
        return;
      }

      if (modal === lastModalSeen) return;
      lastModalSeen = modal;

      // Cancella timeout precedente
      if (modalCheckTimeout) clearTimeout(modalCheckTimeout);

      // Delay per dare tempo alla modale di stabilizzarsi
      modalCheckTimeout = setTimeout(() => {
        const autoFocusEl =
            modal.querySelector("[data-autofocus='true']") ||
            modal.querySelector("[autofocus]") ||
            modal.querySelector(TEXTBOX_SELECTOR);

        if (autoFocusEl && autoFocusEl.isConnected && !isDisabledLike(autoFocusEl)) {
          if (!document.hasFocus()) {
            requestWindowKeyFocusSync('modal-open');
          }

          // Verifica dopo un po' se il focus è arrivato
          ensureFocusOnTextbox(autoFocusEl, 100);
        }
      }, 50);
    });

    // ========================================
    // REGOLA 4: Recupero focus dopo azioni che lo perdono
    // ========================================
    const onFocusOut = (e) => {
      // Se il focus sta andando via da una text-box
      if (!isTextBox(e.target)) return;

      // E non sta andando verso un'altra text-box
      const relatedTarget = e.relatedTarget;
      if (relatedTarget && isTextBox(relatedTarget)) return;

      // Salva l'ultima text-box usata
      lastEditorRef.current = e.target;
    };

    // ========================================
    // SETUP LISTENERS
    // ========================================
    document.addEventListener("pointerdown", onPointerDownCapture, { capture: true });
    document.addEventListener("focusout", onFocusOut, { capture: true });
    window.addEventListener("focus", onWindowFocus, true);

    mutationObserver.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["class", "data-open", "aria-hidden"]
    });

    // ========================================
    // CLEANUP
    // ========================================
    return () => {
      document.removeEventListener("pointerdown", onPointerDownCapture, { capture: true });
      document.removeEventListener("focusout", onFocusOut, { capture: true });
      window.removeEventListener("focus", onWindowFocus, true);
      mutationObserver.disconnect();
      if (modalCheckTimeout) clearTimeout(modalCheckTimeout);
    };
  }, []);

  return null;
}