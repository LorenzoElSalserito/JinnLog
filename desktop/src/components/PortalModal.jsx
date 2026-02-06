import { useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";

/**
 * PortalModal - Wrapper per modali che usa React Portal
 *
 * Versione 14.0 (Fix Focus Stealing):
 * - RIMOSSA chiamata a jinn.focusWindow() - causava loop di focus!
 * - Il FocusManager globale gestisce il focus per le text-box
 * - USA CLASSI BOOTSTRAP NATIVE per rispettare il tema chiaro/scuro
 * - Fornisce automaticamente modal-dialog e modal-content
 * - Supporta classi Bootstrap come modal-lg, modal-xl, modal-dialog-scrollable
 * - I children devono essere solo il contenuto interno (modal-header, modal-body, modal-footer)
 *
 * USAGE:
 * <PortalModal className="modal-lg" onClick={onClose}>
 *     <div className="modal-header">...</div>
 *     <div className="modal-body">...</div>
 *     <div className="modal-footer">...</div>
 * </PortalModal>
 *
 * @author Lorenzo DM
 * @since 0.6.13
 * @updated 0.6.14 - Fix focus stealing: rimossa chiamata a focusWindow()
 */
export default function PortalModal({ children, className = "", style = {}, onClick }) {
    const mount = document.body;
    const modalRef = useRef(null);
    const trapRef = useRef(null);
    // Usa useRef per tracciare se l'effetto è già stato eseguito
    const initializedRef = useRef(false);

    // Memoizza la callback per ESC
    const handleEsc = useCallback((e) => {
        if (e.key === "Escape" && onClick) {
            onClick();
        }
    }, [onClick]);

    useEffect(() => {
        // Evita di eseguire più volte
        if (initializedRef.current) return;
        initializedRef.current = true;

        const originalOverflow = mount.style.overflow;
        mount.style.overflow = "hidden";

        // 1. Force Reflow
        if (modalRef.current) {
            void modalRef.current.offsetHeight;
        }

        // 2. RIMOSSO: NON chiamare jinn.focusWindow() qui!
        // Questo causava un loop di focus che rubava il focus dalle text-box.
        // Il FocusManager globale gestisce il focus per le text-box automaticamente.
        //
        // VECCHIO CODICE (RIMOSSO):
        // if (window.jinn && window.jinn.focusWindow) {
        //     window.jinn.focusWindow();
        // }

        // 3. Focus Management - usa un approccio più gentile
        const timer = setTimeout(() => {
            if (modalRef.current) {
                // Cerca l'input con autofocus o il primo input
                const autoFocus = modalRef.current.querySelector('[autofocus], [data-autofocus="true"]');
                const firstInput = modalRef.current.querySelector('input:not([type=hidden]), textarea, select');

                const targetEl = autoFocus || firstInput;

                if (targetEl) {
                    // Focus diretto senza blur/trap tricks
                    try {
                        targetEl.focus({ preventScroll: true });
                    } catch (e) {
                        try { targetEl.focus(); } catch (e2) { /* ignore */ }
                    }
                }
            }
        }, 100); // Delay leggermente più lungo per stabilità

        // 4. ESC key handler
        document.addEventListener("keydown", handleEsc);

        return () => {
            clearTimeout(timer);
            document.removeEventListener("keydown", handleEsc);
            mount.style.overflow = originalOverflow;
            mount.classList.remove("modal-open");
            document.querySelectorAll(".modal-backdrop").forEach(el => el.remove());
            initializedRef.current = false;
        };
    }, [mount, handleEsc]); // Dipende solo da mount e handleEsc memoizzato

    // Handler per click sul backdrop
    const handleBackdropClick = useCallback((e) => {
        if (e.target === e.currentTarget && onClick) {
            onClick();
        }
    }, [onClick]);

    // Handler per stopPropagation sul dialog
    const handleDialogClick = useCallback((e) => {
        e.stopPropagation();
    }, []);

    // Usa le classi Bootstrap native per rispettare il tema!
    return createPortal(
        <div
            className="modal show d-block"
            style={{ backgroundColor: "rgba(0,0,0,0.5)", zIndex: 10000 }}
            onClick={handleBackdropClick}
            data-portal-modal="true"
        >
            <div
                ref={modalRef}
                className={`modal-dialog ${className}`}
                style={style}
                onClick={handleDialogClick}
            >
                {/* Input Trap Invisibile - RIMOSSO: non serve più e può causare problemi
                <input
                    ref={trapRef}
                    style={{ opacity: 0, position: 'absolute', pointerEvents: 'none' }}
                    readOnly
                    tabIndex={-1}
                />
                */}

                <div
                    className="modal-content"
                    style={{
                        maxHeight: "calc(100vh - 3.5rem)",
                        overflowY: "auto"
                    }}
                >
                    {children}
                </div>
            </div>
        </div>,
        mount
    );
}