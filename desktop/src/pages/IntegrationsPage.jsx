import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { jinn } from '../api/jinn.js';
import { toast } from 'react-toastify';
import { useModal } from '../hooks/useModal.js';

/**
 * IntegrationsPage - Manage Import/Export and external connections like ICS.
 */
export default function IntegrationsPage({ shell }) {
    const { t } = useTranslation();
    const modal = useModal();
    const [icsToken, setIcsToken] = useState('');
    const [loadingToken, setLoadingToken] = useState(true);

    useEffect(() => {
        shell?.setTitle?.(t("Integrations"));
        shell?.setHeaderActions?.(
            <div className="d-flex gap-2 align-items-center">
                <button
                    className="btn btn-sm btn-outline-secondary"
                    onClick={loadIcsToken}
                    title={t("Refresh")}
                >
                    <i className="bi bi-arrow-clockwise"></i>
                </button>
            </div>
        );
        loadIcsToken();

        return () => {
            shell?.setHeaderActions?.(null);
        };
    }, [shell, t]);

    const loadIcsToken = async () => {
        try {
            setLoadingToken(true);
            // This is a presumed endpoint, let's add it to jinn.js if not present
            const response = await jinn.getCalendarToken(); 
            setIcsToken(response.token);
        } catch (e) {
            console.error("Error loading ICS token", e);
            // Don't show error toast on initial load if it's just not found
        } finally {
            setLoadingToken(false);
        }
    };

    const handleRegenerateToken = async () => {
        const confirmed = await modal.confirm({ title: t("Are you sure you want to regenerate the token?") });
        if (!confirmed) return;
        try {
            const response = await jinn.regenerateCalendarToken();
            setIcsToken(response.token);
            toast.success(t("Token regenerated successfully"));
        } catch (e) {
            toast.error(t("Error regenerating token"));
        }
    };

    const handleExport = async (format) => {
        try {
            if (format === 'csv' && !shell.currentProject) {
                toast.warn(t("Please select a project to export as CSV."));
                return;
            }
            
            if (jinn.isElectron()) {
                if (format === 'json') await jinn.exportJsonDialog();
                if (format === 'csv') await jinn.exportCsvDialog(shell.currentProject.id);
            } else {
                // Web fallback
                const blob = await jinn.exportDatabase(format === 'json' ? 'json' : 'db');
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `jinnlog-backup-${new Date().toISOString().split('T')[0]}.${format === 'json' ? 'json' : 'zip'}`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
            }
        } catch (e) {
            toast.error(`${t("Export failed")}: ${e.message}`);
        }
    };

    const handleImport = async () => {
        const confirmed = await modal.confirm({ title: t("Warning: Importing will overwrite existing data. Continue?") });
        if (!confirmed) return;
        
        if (jinn.isElectron()) {
            await jinn.importJsonDialog();
        } else {
            // Basic web file input for import
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = ".json,.zip";
            input.onchange = async (e) => {
                const file = e.target.files[0];
                if (file) {
                    try {
                        await jinn.importDatabase(file);
                        toast.success(t("Import successful! Restarting..."));
                        setTimeout(() => window.location.reload(), 2000);
                    } catch (err) {
                        toast.error(`${t("Import failed")}: ${err.message}`);
                    }
                }
            };
            input.click();
        }
    };

    const icsUrl = `${jinn.getApiUrl()}/public/calendar/${icsToken}/feed.ics`;

    return (
        <div className="container-fluid p-4">
            <h4 className="mb-4">{t("Integrations & Data")}</h4>

            {/* ICS Calendar Feed */}
            <div className="card shadow-sm mb-4">
                <div className="card-header">
                    <h5 className="mb-0">{t("External Calendar (iCal)")}</h5>
                </div>
                <div className="card-body">
                    <p className="text-muted">{t("Use this link to sync your tasks with Google Calendar, Outlook or Apple Calendar.")}</p>
                    {loadingToken ? (
                        <div className="spinner-border spinner-border-sm"></div>
                    ) : (
                        <div className="input-group">
                            <input type="text" className="form-control" value={icsUrl} readOnly />
                            <button className="btn btn-outline-secondary" onClick={() => { navigator.clipboard.writeText(icsUrl); toast.success(t("Copied to clipboard")); }}>
                                <i className="bi bi-clipboard"></i>
                            </button>
                        </div>
                    )}
                </div>
                <div className="card-footer bg-light">
                    <button className="btn btn-sm btn-outline-secondary" onClick={handleRegenerateToken}>
                        {t("Regenerate Token")}
                    </button>
                </div>
            </div>

            {/* Import / Export */}
            <div className="card shadow-sm">
                <div className="card-header">
                    <h5 className="mb-0">{t("Import / Export Data")}</h5>
                </div>
                <div className="card-body">
                    <div className="row g-3">
                        <div className="col-md-6">
                            <h6>{t("Export")}</h6>
                            <p className="small text-muted">{t("Export your data in various formats.")}</p>
                            <div className="d-flex gap-2">
                                <button className="btn btn-primary" onClick={() => handleExport('json')}>
                                    <i className="bi bi-box-arrow-down me-2"></i>{t("Export JSON")}
                                </button>
                                <button className="btn btn-secondary" onClick={() => handleExport('csv')} disabled={!shell.currentProject}>
                                    <i className="bi bi-file-earmark-spreadsheet me-2"></i>{t("Export CSV (Project)")}
                                </button>
                            </div>
                        </div>
                        <div className="col-md-6">
                            <h6>{t("Import")}</h6>
                            <p className="small text-muted">{t("Import data from a JSON backup. This will overwrite current data.")}</p>
                            <button className="btn btn-danger" onClick={handleImport}>
                                <i className="bi bi-box-arrow-in-up me-2"></i>{t("Import JSON")}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
