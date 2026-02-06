import { useState, useEffect, useCallback } from "react";
import { jinn } from "../api/jinn.js";
import { toast } from "react-toastify";
import { useTranslation } from 'react-i18next';

/**
 * SettingsPage - Pagina impostazioni utente
 *
 * Features:
 * - Tema (chiaro/scuro) con applicazione immediata
 * - Lingua
 * - Notifiche
 * - Focus Timer defaults
 * - Backup automatico
 * - Import/Export database (PRD-01)
 * - iCal Export (PRD-15)
 * - Connessione DB Esterno (PRD-01)
 *
 * @author Lorenzo DM
 * @since 0.5.2
 * @updated 0.5.3 - Aggiunta UI iCal e DB Esterno
 */
export default function SettingsPage({ shell }) {
    const { t, i18n } = useTranslation();

    // ========================================
    // State
    // ========================================

    const [settings, setSettings] = useState({
        theme: "dark",
        language: "it",
        notificationsEnabled: true,
        focusTimerDefaultMinutes: 25,
        autoBackupEnabled: true,
        backupIntervalDays: 7,
        calendarToken: "", // PRD-15
    });

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [hasChanges, setHasChanges] = useState(false);
    const [icalUrl, setIcalUrl] = useState("");

    // ========================================
    // Effects
    // ========================================

    useEffect(() => {
        shell?.setTitle?.(t("Settings"));
        shell?.setHeaderActions?.(null);
        shell?.setRightPanel?.(null);
    }, [shell, t]);

    // Carica impostazioni
    useEffect(() => {
        async function loadSettings() {
            try {
                setLoading(true);
                const data = await jinn.settingsGet();
                if (data) {
                    setSettings(prev => ({
                        ...prev,
                        ...data,
                        backupIntervalDays: data.backupIntervalDays || 7,
                    }));
                    
                    // Imposta la lingua in i18next
                    if (data.language) {
                        i18n.changeLanguage(data.language);
                    }

                    // Genera URL iCal se token presente
                    if (data.calendarToken) {
                        const baseUrl = await jinn.init().then(r => r.baseUrl);
                        const userId = jinn.getCurrentUser();
                        setIcalUrl(`${baseUrl}/calendar/${userId}/feed.ics?token=${data.calendarToken}`);
                    }
                }
            } catch (e) {
                console.error("[SettingsPage] Errore caricamento:", e);
                toast.error("Errore caricamento impostazioni");
            } finally {
                setLoading(false);
            }
        }
        loadSettings();
    }, [i18n]);

    // ========================================
    // Handlers
    // ========================================

    const handleChange = (key, value) => {
        setSettings((prev) => ({ ...prev, [key]: value }));
        setHasChanges(true);

        if (key === "theme") {
            applyThemePreview(value);
        }
        
        if (key === "language") {
            i18n.changeLanguage(value);
        }
    };

    const applyThemePreview = (theme) => {
        document.documentElement.setAttribute('data-theme', theme);
        document.body.setAttribute('data-theme', theme);

        if (theme === 'dark') {
            document.documentElement.setAttribute('data-bs-theme', 'dark');
        } else {
            document.documentElement.removeAttribute('data-bs-theme');
        }

        if (shell?.setTheme) {
            shell.setTheme(theme);
        }
    };

    const handleSave = async () => {
        try {
            setSaving(true);
            await jinn.settingsUpdate(settings);
            setHasChanges(false);

            if (shell?.setTheme) {
                shell.setTheme(settings.theme);
            }

            toast.success(t("Saved"));
        } catch (e) {
            console.error("[SettingsPage] Errore salvataggio:", e);
            toast.error("Errore salvataggio: " + e.message);
        } finally {
            setSaving(false);
        }
    };

    const handleReset = async () => {
        if (!confirm("Sei sicuro di voler ripristinare le impostazioni di default?")) {
            return;
        }

        try {
            const defaults = await jinn.settingsReset();
            setSettings(prev => ({
                ...prev,
                ...defaults,
                backupIntervalDays: 7,
            }));
            setHasChanges(false);
            applyThemePreview(defaults.theme || "dark");
            if (defaults.language) {
                i18n.changeLanguage(defaults.language);
            }
            toast.success("Impostazioni ripristinate");
        } catch (e) {
            console.error("[SettingsPage] Errore reset:", e);
            toast.error("Errore reset: " + e.message);
        }
    };

    const handleExportDb = async () => {
        try {
            if (jinn.isElectron()) {
                const result = await window.jinn.ipc.invoke('db:export');
                if (result.success) {
                    toast.success(`Database esportato in: ${result.path}`);
                } else if (result.error) {
                    toast.error("Errore export: " + result.error);
                }
            } else {
                try {
                    const blob = await jinn.exportDatabase();
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement("a");
                    a.href = url;
                    a.download = `jinnlog-backup-${new Date().toISOString().split("T")[0]}.db`;
                    a.click();
                    URL.revokeObjectURL(url);
                    toast.success("Database scaricato");
                } catch (e) {
                    await jinn.exportJsonDialog();
                    toast.success("Database esportato (JSON)");
                }
            }
        } catch (e) {
            console.error("[SettingsPage] Errore export:", e);
            toast.error("Errore export: " + e.message);
        }
    };

    const handleImportDb = async () => {
        if (!confirm("ATTENZIONE: L'importazione sovrascriverà TUTTI i dati attuali. Vuoi continuare?")) {
            return;
        }

        try {
            if (jinn.isElectron()) {
                const result = await window.jinn.ipc.invoke('db:import');
                if (result.success) {
                    toast.success("Database importato. Riavvio applicazione...");
                    setTimeout(() => window.location.reload(), 2000);
                } else if (result.error) {
                    toast.error("Errore import: " + result.error);
                }
            } else {
                const input = document.createElement("input");
                input.type = "file";
                input.accept = ".db,.sqlite";
                input.onchange = async (e) => {
                    const file = e.target.files[0];
                    if (file) {
                        try {
                            await jinn.importDatabase(file);
                            toast.success("Database importato. Ricarica la pagina.");
                            setTimeout(() => window.location.reload(), 2000);
                        } catch (err) {
                            toast.error("Errore import: " + err.message);
                        }
                    }
                };
                input.click();
            }
        } catch (e) {
            console.error("[SettingsPage] Errore import:", e);
            toast.error("Errore import: " + e.message);
        }
    };

    const handleRotateCalendarToken = async () => {
        if (!confirm("Rigenerando il token, dovrai aggiornare il link su tutti i tuoi calendari esterni. Continuare?")) return;
        
        try {
            const userId = jinn.getCurrentUser();
            const response = await fetch(`${await jinn.init().then(r => r.baseUrl)}/calendar/${userId}/rotate-token`, {
                method: 'POST',
                headers: { 'X-User-Id': userId }
            });
            
            if (response.ok) {
                const data = await response.json();
                const baseUrl = await jinn.init().then(r => r.baseUrl);
                setIcalUrl(`${baseUrl}/calendar/${userId}/feed.ics?token=${data.token}`);
                toast.success("Token rigenerato");
            }
        } catch (e) {
            toast.error("Errore rotazione token");
        }
    };

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        toast.success(t("Copied to clipboard"));
    };

    const handleBugReport = () => {
        const recipient = "commercial.lorenzodm@gmail.com";
        const subject = "[RILEVATO BUG JINNLOG]";
        const body = `Descrivi il bug qui:\n\nVersione JinnLog: v0.5.2\nSistema Operativo: ${navigator.platform}\nBrowser/Electron: ${navigator.userAgent}`;
        window.open(`mailto:${recipient}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`);
    };

    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center py-5">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Caricamento...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="settings-page container-fluid py-3" style={{ maxWidth: 800 }}>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h4 className="mb-0">
                    <i className="bi bi-gear me-2"></i>
                    {t("Settings")}
                </h4>

                <div className="d-flex gap-2">
                    <button
                        className="btn btn-outline-secondary btn-sm"
                        onClick={handleReset}
                    >
                        <i className="bi bi-arrow-counterclockwise me-1"></i>
                        {t("Restore Defaults")}
                    </button>

                    <button
                        className={`btn btn-sm ${hasChanges ? "btn-success" : "btn-outline-secondary"}`}
                        onClick={handleSave}
                        disabled={!hasChanges || saving}
                    >
                        {saving ? (
                            <span className="spinner-border spinner-border-sm me-1"></span>
                        ) : (
                            <i className="bi bi-check-lg me-1"></i>
                        )}
                        {saving ? t("Saving...") : t("Save Changes")}
                    </button>
                </div>
            </div>

            {/* Aspetto */}
            <div className="card mb-4">
                <div className="card-header">
                    <i className="bi bi-palette me-2"></i>
                    {t("Appearance")}
                </div>
                <div className="card-body">
                    <div className="row mb-3">
                        <label className="col-sm-4 col-form-label">{t("Theme")}</label>
                        <div className="col-sm-8">
                            <select
                                className="form-select"
                                value={settings.theme}
                                onChange={(e) => handleChange("theme", e.target.value)}
                            >
                                <option value="light">{t("Light")}</option>
                                <option value="dark">{t("Dark")}</option>
                            </select>
                        </div>
                    </div>

                    <div className="row">
                        <label className="col-sm-4 col-form-label">{t("Language")}</label>
                        <div className="col-sm-8">
                            <select
                                className="form-select"
                                value={settings.language}
                                onChange={(e) => handleChange("language", e.target.value)}
                            >
                                <option value="it">{t("Italian")}</option>
                                <option value="en">{t("English")}</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>

            {/* Calendario Esterno (iCal) */}
            <div className="card mb-4">
                <div className="card-header">
                    <i className="bi bi-calendar-check me-2"></i>
                    {t("External Calendar (iCal)")}
                </div>
                <div className="card-body">
                    <p className="small text-muted">
                        {t("Use this link to sync your tasks with Google Calendar, Outlook or Apple Calendar.")}
                    </p>
                    <div className="input-group mb-3">
                        <input 
                            type="text" 
                            className="form-control" 
                            value={icalUrl} 
                            readOnly 
                            onClick={(e) => e.target.select()}
                        />
                        <button className="btn btn-outline-secondary" onClick={() => copyToClipboard(icalUrl)}>
                            <i className="bi bi-clipboard"></i> {t("Copy")}
                        </button>
                    </div>
                    <button className="btn btn-sm btn-outline-danger" onClick={handleRotateCalendarToken}>
                        <i className="bi bi-arrow-repeat me-1"></i> {t("Regenerate Token")}
                    </button>
                </div>
            </div>

            {/* Database Esterno (Placeholder UI) */}
            <div className="card mb-4">
                <div className="card-header">
                    <i className="bi bi-database me-2"></i>
                    {t("External Database")}
                </div>
                <div className="card-body">
                    <div className="alert alert-info small">
                        <i className="bi bi-info-circle me-2"></i>
                        {t("You are currently using the local SQLite database.")}
                    </div>
                    <div className="row g-3">
                        <div className="col-md-6">
                            <label className="form-label">{t("Database Type")}</label>
                            <select className="form-select" disabled>
                                <option>{t("SQLite (Local)")}</option>
                                <option>{t("PostgreSQL (Coming Soon)")}</option>
                                <option>{t("MySQL (Coming Soon)")}</option>
                            </select>
                        </div>
                        <div className="col-md-6">
                            <label className="form-label">{t("Host")}</label>
                            <input type="text" className="form-control" placeholder="localhost" disabled />
                        </div>
                        <div className="col-12">
                            <button className="btn btn-primary btn-sm" disabled>
                                {t("Connect to External DB")}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Backup */}
            <div className="card mb-4">
                <div className="card-header">
                    <i className="bi bi-cloud-download me-2"></i>
                    {t("Backup and Synchronization")}
                </div>
                <div className="card-body">
                    <div className="form-check form-switch mb-3">
                        <input
                            className="form-check-input"
                            type="checkbox"
                            id="autoBackupEnabled"
                            checked={settings.autoBackupEnabled}
                            onChange={(e) => handleChange("autoBackupEnabled", e.target.checked)}
                        />
                        <label className="form-check-label" htmlFor="autoBackupEnabled">
                            {t("Automatic Backup")}
                        </label>
                    </div>

                    <div className="d-flex gap-2 flex-wrap">
                        <button className="btn btn-outline-primary" onClick={handleExportDb}>
                            <i className="bi bi-box-arrow-up me-2"></i>
                            {t("Export Database (.db)")}
                        </button>

                        <button className="btn btn-outline-danger" onClick={handleImportDb}>
                            <i className="bi bi-box-arrow-in-down me-2"></i>
                            {t("Import Database (.db)")}
                        </button>
                    </div>
                </div>
            </div>

            {/* Bug Report */}
            <div className="card mb-4">
                <div className="card-header">
                    <i className="bi bi-bug me-2"></i>
                    {t("Bug Report")}
                </div>
                <div className="card-body">
                    <p className="card-text small text-muted">
                        {t("Found a bug? Help us improve JinnLog by reporting it!")}
                    </p>
                    <button className="btn btn-warning" onClick={handleBugReport}>
                        <i className="bi bi-envelope me-2"></i>
                        {t("Report a Bug")}
                    </button>
                </div>
            </div>

            {/* Info */}
            <div className="card">
                <div className="card-header">
                    <i className="bi bi-info-circle me-2"></i>
                    {t("Information")}
                </div>
                <div className="card-body">
                    <div className="row mb-1">
                        <div className="col-sm-4 text-muted">{t("Version")}</div>
                        <div className="col-sm-8">JinnLog v0.5.2</div>
                    </div>
                    <div className="row mb-1">
                        <div className="col-sm-4 text-muted">{t("Copyright")}</div>
                        <div className="col-sm-8">© Lorenzo DM 2026</div>
                    </div>
                    <div className="row mb-1">
                        <div className="col-sm-4 text-muted">{t("License")}</div>
                        <div className="col-sm-8">AGPLv3</div>
                    </div>
                    <div className="row mb-1">
                        <div className="col-sm-4 text-muted">{t("Website")}</div>
                        <div className="col-sm-8">
                            <a href="https://www.lorenzodm.it" target="_blank" rel="noopener noreferrer">
                                https://www.lorenzodm.it
                            </a>
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-sm-4 text-muted">{t("Support")}</div>
                        <div className="col-sm-8">
                            {t("If you like JinnLog, please consider supporting its development!")}
                        </div>
                    </div>
                    <div className="row mt-2">
                        <div className="col-sm-4 text-muted">{t("Platform")}</div>
                        <div className="col-sm-8">{jinn.isElectron() ? t("Desktop (Electron)") : t("Web")}</div>
                    </div>
                </div>
            </div>
        </div>
    );
}
