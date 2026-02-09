import { useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";

/**
 * PortalModal - Wrapper per modali che usa React Portal
 *
 * Versione 14.1 (Fix Focus Stealing):
 * - Separati useEffect per gestione eventi e focus iniziale.
 * - Il focus viene impostato solo al primo mount, non ad ogni re-render.
 * - Usato un ref per la callback onClick per evitare di rimetterla nelle dipendenze.
 *
 * @author Lorenzo DM
 * @since 0.6.13
 * @updated 0.6.15
 */
export default function PortalModal({ children, className = "", style = {}, onClick }) {
    const mount = document.body;
    const modalRef = useRef(null);
    const onClickRef = useRef(onClick);

    // Mantiene la ref sempre aggiornata con l'ultima callback
    useEffect(() => {
        onClickRef.current = onClick;
    }, [onClick]);

    // Effetto per la gestione degli eventi (ESC e backdrop)
    useEffect(() => {
        const handleEsc = (e) => {
            if (e.key === "Escape" && onClickRef.current) {
                onClickRef.current();
            }
        };

        document.addEventListener("keydown", handleEsc);
        return () => document.removeEventListener("keydown", handleEsc);
    }, []); // Eseguito solo una volta

    // Effetto per il setup/teardown della modale (stile e focus)
    useEffect(() => {
        const originalOverflow = mount.style.overflow;
        mount.style.overflow = "hidden";
        mount.classList.add("modal-open");

        // Forza reflow per transizioni
        if (modalRef.current) {
            void modalRef.current.offsetHeight;
        }

        // Imposta il focus solo al mount iniziale
        const timer = setTimeout(() => {
            if (modalRef.current) {
                const autoFocusEl = modalRef.current.querySelector('[autofocus], [data-autofocus="true"]');
                const firstFocusableEl = modalRef.current.querySelector('input:not([type=hidden]), textarea, select, button');
                
                const targetEl = autoFocusEl || firstFocusableEl;

                if (targetEl) {
                    try {
                        targetEl.focus({ preventScroll: true });
                    } catch (e) {
                        try { targetEl.focus(); } catch (e2) { /* ignore */ }
                    }
                }
            }
        }, 100);

        return () => {
            clearTimeout(timer);
            mount.style.overflow = originalOverflow;
            mount.classList.remove("modal-open");
            // Il backdrop viene gestito dal componente stesso, non serve rimuoverlo globalmente
        };
    }, [mount]); // Eseguito solo al mount/unmount

    const handleBackdropClick = useCallback((e) => {
        if (e.target === e.currentTarget && onClickRef.current) {
            onClickRef.current();
        }
    }, []);

    const handleDialogClick = useCallback((e) => {
        e.stopPropagation();
    }, []);

    return createPortal(
        <div
            className="modal fade show d-block"
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
