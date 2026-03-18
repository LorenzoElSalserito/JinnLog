import React, { useState, useEffect, useCallback } from "react";
import { jinn } from "../api/jinn.js";
import { toast } from "react-toastify";
import PortalModal from "../components/PortalModal.jsx";
import { useTranslation } from 'react-i18next';

/**
 * TemplatesPage - Gallery of Project Templates
 * 
 * Allows users to browse templates and create new projects based on them.
 */
export default function TemplatesPage({ shell }) {
    const { t } = useTranslation();
    const [templates, setTemplates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedTemplate, setSelectedTemplate] = useState(null);
    const [showPreviewModal, setShowPreviewModal] = useState(false);
    
    // Instantiation State
    const [projectName, setProjectName] = useState("");
    const [projectDescription, setProjectDescription] = useState("");
    const [isCreating, setIsCreating] = useState(false);

    useEffect(() => {
        shell?.setTitle?.(t("Template Gallery"));
        shell?.setHeaderActions?.(
            <div className="d-flex gap-2 align-items-center">
                <button
                    className="btn btn-sm btn-outline-secondary"
                    onClick={loadTemplates}
                    title={t("Refresh")}
                >
                    <i className="bi bi-arrow-clockwise"></i>
                </button>
            </div>
        );
        loadTemplates();

        return () => {
            shell?.setHeaderActions?.(null);
        };
    }, [shell, t]);

    const loadTemplates = useCallback(async () => {
        try {
            setLoading(true);
            const list = await jinn.templatesList();
            setTemplates(list || []);
        } catch (e) {
            toast.error(t("Error loading templates"));
            console.error(e);
        } finally {
            setLoading(false);
        }
    }, [t]);

    const handleSelectTemplate = (template) => {
        setSelectedTemplate(template);
        setProjectName(`${t("New Project")} - ${template.name}`);
        setProjectDescription(template.description || "");
        setShowPreviewModal(true);
    };

    const handleInstantiate = async () => {
        if (!selectedTemplate || !projectName.trim()) return;

        setIsCreating(true);
        try {
            // Instantiate the project
            // Assuming the endpoint returns the created project
            const newProject = await jinn.templatesInstantiate(selectedTemplate.id, {
                projectName: projectName,
                description: projectDescription
            });

            toast.success(t("Project created successfully"));
            setShowPreviewModal(false);
            
            // Refresh shell projects list and navigate to the new project
            await shell.refreshProjects();
            shell.setCurrentProject(newProject);
            shell.navigate('dashboard'); // Or 'charter' or 'gantt' depending on template type? Let's go to Dashboard.

        } catch (e) {
            toast.error(t("Error creating project") + ": " + e.message);
        } finally {
            setIsCreating(false);
        }
    };

    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center h-100">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">{t("Loading...")}</span>
                </div>
            </div>
        );
    }

    return (
        <div className="container-fluid p-4">
            <div className="row mb-4">
                <div className="col">
                    <h4>{t("Project Templates")}</h4>
                    <p className="text-muted">{t("Start your project with a pre-configured structure.")}</p>
                </div>
            </div>

            <div className="row g-4">
                {templates.map(tpl => (
                    <div key={tpl.id} className="col-md-6 col-lg-4 col-xl-3">
                        <div className="card h-100 shadow-sm template-card cursor-pointer" onClick={() => handleSelectTemplate(tpl)}>
                            <div className="card-body d-flex flex-column">
                                <div className="d-flex justify-content-between align-items-start mb-3">
                                    <div className="rounded p-2 bg-primary bg-opacity-10 text-primary">
                                        <i className={`bi ${tpl.icon || 'bi-layout-text-window-reverse'} fs-4`}></i>
                                    </div>
                                    {tpl.isSystem && <span className="badge bg-secondary">{t("System")}</span>}
                                </div>
                                <h5 className="card-title mb-2">{tpl.name}</h5>
                                <p className="card-text text-muted small flex-grow-1 line-clamp-3">
                                    {tpl.description}
                                </p>
                                <div className="mt-3 pt-3 border-top d-flex justify-content-between text-muted small">
                                    <span><i className="bi bi-list-task me-1"></i> {tpl.taskCount || 0} {t("tasks")}</span>
                                    <span><i className="bi bi-flag me-1"></i> {tpl.milestoneCount || 0} {t("milestones")}</span>
                                </div>
                            </div>
                            <div className="card-footer bg-white border-top-0 pb-3 pt-0">
                                <button className="btn btn-outline-primary w-100 btn-sm">
                                    {t("Preview & Use")}
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
                
                {templates.length === 0 && (
                    <div className="col-12 text-center py-5 text-muted">
                        <i className="bi bi-inbox fs-1 mb-3 d-block"></i>
                        <p>{t("No templates available.")}</p>
                    </div>
                )}
            </div>

            {/* Template Preview & Use Modal */}
            {showPreviewModal && selectedTemplate && (
                <PortalModal onClick={() => setShowPreviewModal(false)} className="modal-lg">
                    <div className="modal-header">
                        <h5 className="modal-title">{t("Use Template")}: {selectedTemplate.name}</h5>
                        <button type="button" className="btn-close" onClick={() => setShowPreviewModal(false)}></button>
                    </div>
                    <div className="modal-body">
                        <div className="row">
                            <div className="col-md-6 border-end">
                                <h6 className="mb-3">{t("Template Details")}</h6>
                                <p className="text-muted small">{selectedTemplate.description}</p>
                                
                                <div className="mb-3">
                                    <strong>{t("Included Features")}:</strong>
                                    <ul className="small text-muted ps-3 mt-1">
                                        {selectedTemplate.features?.map((f, i) => <li key={i}>{f}</li>)}
                                        {!selectedTemplate.features && <li>{t("Standard Tasks & Phases")}</li>}
                                    </ul>
                                </div>
                            </div>
                            <div className="col-md-6 ps-4">
                                <h6 className="mb-3">{t("Project Configuration")}</h6>
                                <div className="mb-3">
                                    <label className="form-label">{t("Project Name")} <span className="text-danger">*</span></label>
                                    <input 
                                        type="text" 
                                        className="form-control" 
                                        value={projectName} 
                                        onChange={e => setProjectName(e.target.value)} 
                                        autoFocus
                                    />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">{t("Description")}</label>
                                    <textarea 
                                        className="form-control" 
                                        rows="3" 
                                        value={projectDescription} 
                                        onChange={e => setProjectDescription(e.target.value)} 
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="modal-footer">
                        <button className="btn btn-secondary" onClick={() => setShowPreviewModal(false)}>{t("Cancel")}</button>
                        <button 
                            className="btn btn-primary" 
                            onClick={handleInstantiate} 
                            disabled={isCreating || !projectName.trim()}
                        >
                            {isCreating ? (
                                <>
                                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                    {t("Creating...")}
                                </>
                            ) : (
                                <>
                                    <i className="bi bi-rocket-takeoff me-2"></i>
                                    {t("Create Project")}
                                </>
                            )}
                        </button>
                    </div>
                </PortalModal>
            )}
        </div>
    );
}
