import { useState } from "react";
import { jinn } from "../api/jinn.js";

export default function DataActions({ selectedProjectId, onImported }) {
    const [busy, setBusy] = useState(false);
    const [message, setMessage] = useState("");

    async function doExportJson() {
        setBusy(true);
        setMessage("");
        try {
            jinn.log("[UI] Export JSON dialog");
            const res = await jinn.exportJsonDialog();
            if (res?.ok) setMessage(`Esportato JSON: ${res.filePath}`);
            else if (res?.canceled) setMessage("Esportazione annullata");
            else setMessage("Esportazione fallita");
        } catch (e) {
            jinn.error("Export JSON error", e);
            setMessage("Errore export JSON (vedi log)");
        } finally {
            setBusy(false);
        }
    }

    async function doExportCsv() {
        setBusy(true);
        setMessage("");
        try {
            if (!selectedProjectId) {
                setMessage("Seleziona un progetto per esportare CSV");
                return;
            }
            jinn.log("[UI] Export CSV dialog projectId=", selectedProjectId);
            const res = await jinn.exportCsvDialog(selectedProjectId);
            if (res?.ok) setMessage(`Esportato CSV: ${res.filePath}`);
            else if (res?.canceled) setMessage("Esportazione annullata");
            else setMessage(res?.error ?? "Esportazione fallita");
        } catch (e) {
            jinn.error("Export CSV error", e);
            setMessage("Errore export CSV (vedi log)");
        } finally {
            setBusy(false);
        }
    }

    async function doImportJson() {
        setBusy(true);
        setMessage("");
        try {
            jinn.log("[UI] Import JSON dialog");
            const res = await jinn.importJsonDialog();
            if (res?.ok) {
                setMessage(
                    `Import OK: progetti=${res.stats.projects}, task=${res.stats.tasks}, sessioni=${res.stats.focusSessions}`
                );
                if (onImported) await onImported();
            } else if (res?.canceled) {
                setMessage("Import annullato");
            } else {
                setMessage("Import fallito");
            }
        } catch (e) {
            jinn.error("Import JSON error", e);
            setMessage("Errore import JSON (vedi log)");
        } finally {
            setBusy(false);
        }
    }

    return (
        <div className="d-flex flex-column gap-2 align-items-end">
            <div className="d-flex gap-2 flex-wrap justify-content-end">
                <button className="btn btn-outline-light" disabled={busy} onClick={doExportJson}>
                    Export JSON
                </button>
                <button
                    className="btn btn-outline-light"
                    disabled={busy || !selectedProjectId}
                    onClick={doExportCsv}
                    title={!selectedProjectId ? "Seleziona un progetto" : ""}
                >
                    Export CSV (Progetto)
                </button>
                <button className="btn btn-outline-warning" disabled={busy} onClick={doImportJson}>
                    Import JSON
                </button>
            </div>

            {message && <div className="text-secondary small text-end">{message}</div>}
        </div>
    );
}
