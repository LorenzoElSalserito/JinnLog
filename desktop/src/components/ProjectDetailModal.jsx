import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import ProjectNotesWidget from "./ProjectNotesWidget.jsx";
import PortalModal from "./PortalModal.jsx";
import ProjectTeamModal from "./ProjectTeamModal.jsx";
import { useTranslation } from 'react-i18next';

export default function ProjectDetailModal({ project, onClose, onUpdate, onDelete, onArchive, onNavigateToPlanner, onNavigateToNotes }) {
    const { t } = useTranslation();
    const [activeTab, setActiveTab] = useState("info");
    const [editValues, setEditValues] = useState({ ...project });
    const [showTeamModal, setShowTeamModal] = useState(false);

    useEffect(() => {
        setEditValues({ ...project });
    }, [project]);

    const handleSave = async () => {
        try {
            await onUpdate(project.id, editValues);
            toast.success(t("Project updated"));
        } catch (e) {
            toast.error(t("Update error") + ": " + e.message);
        }
    };

    return (
        <>
            <PortalModal
                className="modal-lg modal-dialog-scrollable"
                onClick={onClose}
                style={{ maxWidth: "800px" }}
            >
                {/* NOTA: PortalModal fornisce già modal-dialog e modal-content,
                    le classi modal-lg e modal-dialog-scrollable vengono passate via className */}
                <div style={{ height: "80vh", display: "flex", flexDirection: "column" }}>
                    <div className="modal-header">
                        <h5 className="modal-title">{t("Project Detail")}: {project.name}</h5>
                        <button type="button" className="btn-close" onClick={onClose}></button>
                    </div>
                    <div className="modal-body p-0 d-flex flex-column flex-grow-1" style={{ overflow: "hidden" }}>
                        <ul className="nav nav-tabs px-3 pt-3 bg-light">
                            <li className="nav-item">
                                <button className={`nav-link ${activeTab === "info" ? "active" : ""}`} onClick={() => setActiveTab("info")}>{t("Info")}</button>
                            </li>
                            <li className="nav-item">
                                <button className={`nav-link ${activeTab === "notes" ? "active" : ""}`} onClick={() => setActiveTab("notes")}>{t("Notes")}</button>
                            </li>
                            <li className="nav-item">
                                <button className={`nav-link ${activeTab === "team" ? "active" : ""}`} onClick={() => setActiveTab("team")}>{t("Team")}</button>
                            </li>
                        </ul>

                        <div className="flex-grow-1 p-3 overflow-auto">
                            {activeTab === "info" && (
                                <div className="d-flex flex-column gap-3">
                                    <div>
                                        <label className="form-label fw-bold">{t("Project Name")}</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            value={editValues.name}
                                            onChange={(e) => setEditValues({ ...editValues, name: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="form-label fw-bold">{t("Description")}</label>
                                        <textarea
                                            className="form-control"
                                            rows="4"
                                            value={editValues.description || ""}
                                            onChange={(e) => setEditValues({ ...editValues, description: e.target.value })}
                                        ></textarea>
                                    </div>
                                    <div className="d-flex gap-2 mt-3">
                                        <button className="btn btn-primary" onClick={handleSave}>{t("Save Changes")}</button>
                                    </div>
                                </div>
                            )}

                            {activeTab === "notes" && (
                                <ProjectNotesWidget
                                    projectId={project.id}
                                    onNavigateToNotes={onNavigateToNotes}
                                />
                            )}

                            {activeTab === "team" && (
                                <div className="text-center py-5 text-muted">
                                    <i className="bi bi-people fs-1 d-block mb-2"></i>
                                    <p>{t("Manage team members for this project.")}</p>
                                    <button className="btn btn-outline-primary btn-sm" onClick={() => setShowTeamModal(true)}>
                                        {t("Open Team Management")}
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="modal-footer bg-light justify-content-between">
                        <div>
                            <button
                                className="btn btn-outline-danger me-2"
                                onClick={() => { if(confirm(t("Delete project?"))) onDelete(project.id); }}
                            >
                                <i className="bi bi-trash me-1"></i> {t("Delete")}
                            </button>
                            <button
                                className="btn btn-outline-secondary"
                                onClick={() => onArchive(project)}
                            >
                                <i className={`bi ${project.archived ? 'bi-arrow-counterclockwise' : 'bi-archive'} me-1`}></i>
                                {project.archived ? t("Reopen") : t("Archive")}
                            </button>
                        </div>
                        <button className="btn btn-success" onClick={() => onNavigateToPlanner(project)}>
                            {t("Go to Planner")} <i className="bi bi-arrow-right ms-1"></i>
                        </button>
                    </div>
                </div>
            </PortalModal>

            {showTeamModal && (
                <ProjectTeamModal
                    project={project}
                    onClose={() => setShowTeamModal(false)}
                />
            )}
        </>
    );
}
