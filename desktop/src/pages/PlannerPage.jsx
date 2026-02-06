import { useState, useEffect, useCallback, useMemo } from "react";
import { jinn } from "../api/jinn.js";
import { toast } from "react-toastify";
import TaskEditorModal from "../components/TaskEditorModal.jsx";
import { useTranslation } from 'react-i18next';

/**
 * PlannerPage - Vista lista per gestione task
 *
 * Features:
 * - Lista task ottimizzata
 * - Filtri e ricerca
 * - Creazione Task via modale completa (TaskEditorModal)
 * - Menu contestuale per azioni rapide (completa, elimina)
 * - Navigazione alle Note
 * - Menu contestuale Progetto (v0.4.2)
 *
 * @author Lorenzo DM
 * @since 0.2.0
 * @updated 0.8.0 - Integrazione TaskEditorModal e Note
 */

// ========================================
// PlannerPage Main Component
// ========================================

export default function PlannerPage({ shell }) {
    const { t } = useTranslation();
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterStatus, setFilterStatus] = useState("");
    const [filterPriority, setFilterPriority] = useState("");

    const [showTaskModal, setShowTaskModal] = useState(false);
    const [selectedTask, setSelectedTask] = useState(null);

    // Setup shell header
    useEffect(() => {
        shell?.setTitle?.(t("Planner"));
        shell?.setHeaderActions?.(
            <div className="d-flex gap-2 align-items-center">
                <select
                    className="form-select form-select-sm"
                    value={shell?.currentProject?.id || "__SELECT__"}
                    onChange={(e) => {
                        if (e.target.value === "__SELECT__") {
                            shell?.navigate?.("menu");
                        } else {
                            const project = shell?.projects?.find(p => p.id === e.target.value);
                            shell?.setCurrentProject?.(project);
                        }
                    }}
                    style={{ width: 200 }}
                >
                    <option value="__SELECT__">{t("Select project...")}</option>
                    {shell?.projects?.map((p) => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                </select>

                <input
                    type="text"
                    className="form-control form-control-sm"
                    placeholder={t("Search...")}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{ width: 150 }}
                />

                <button
                    className="btn btn-sm btn-primary"
                    onClick={() => {
                        setSelectedTask(null); // Null per nuovo task
                        setShowTaskModal(true);
                    }}
                    disabled={!shell?.currentProject}
                >
                    <i className="bi bi-plus-lg me-1"></i>
                    {t("Task")}
                </button>
            </div>
        );
    }, [shell, searchTerm, shell?.currentProject, shell?.projects, t]);

    // Load tasks
    const loadTasks = useCallback(async () => {
        if (!shell?.currentProject) {
            setTasks([]);
            setLoading(false);
            return;
        }
        try {
            setLoading(true);
            const tasksList = await jinn.tasksList(shell.currentProject.id, {
                status: filterStatus || undefined,
                priority: filterPriority || undefined,
                search: searchTerm || undefined,
            });
            setTasks(tasksList || []);
        } catch (e) {
            toast.error(t("Error loading tasks") + ": " + e.message);
        } finally {
            setLoading(false);
        }
    }, [shell?.currentProject, filterStatus, filterPriority, searchTerm]);

    useEffect(() => {
        loadTasks();
    }, [loadTasks]);

    // Handlers
    const handleSaveTask = async (taskData, uploadedFiles) => {
        if (!shell?.currentProject) return;
        try {
            let taskId = taskData.id;
            
            if (taskId) {
                await jinn.tasksUpdate(shell.currentProject.id, taskId, taskData);
                toast.success(t("Task updated"));
            } else {
                const created = await jinn.tasksCreate(shell.currentProject.id, taskData);
                taskId = created.id;
                toast.success(t("Task created"));
            }
            
            // Upload assets se presenti, collegandoli al task
            if (uploadedFiles && uploadedFiles.length > 0) {
                await jinn.assetsUploadMultiple(uploadedFiles, `Allegato Task: ${taskData.title}`, taskId);
            }

            setShowTaskModal(false);
            loadTasks();
        } catch (e) {
            toast.error(t("Error") + ": " + e.message);
        }
    };

    const handleDeleteTask = async (taskId) => {
        if (!shell?.currentProject) return;
        try {
            await jinn.tasksDelete(shell.currentProject.id, taskId);
            toast.success(t("Task deleted"));
            setShowTaskModal(false);
            loadTasks();
        } catch (e) {
            toast.error(t("Error") + ": " + e.message);
        }
    };

    const handleSetStatus = async (taskId, newStatus) => {
        if (!shell?.currentProject) return;
        try {
            await jinn.tasksUpdateStatus(shell.currentProject.id, taskId, newStatus);
            loadTasks();
        } catch (e) {
            toast.error(t("Error") + ": " + e.message);
        }
    };

    const handleOpenNotes = (task) => {
        shell?.navigate?.("notes", { taskId: task.id, projectId: shell.currentProject.id });
    };

    if (loading) return <div className="text-center py-5"><div className="spinner-border text-primary"></div></div>;
    if (!shell?.currentProject) return <div className="text-center py-5 text-muted">{t("No project selected")}</div>;

    return (
        <div className="planner-page h-100 p-3">
            <div className="list-group shadow-sm">
                {tasks.map(task => {
                    const isOverdue = task.deadline && new Date(task.deadline) < new Date() && task.status !== "DONE";
                    const checklistProgress = task.checklistItems?.length > 0
                        ? `${task.checklistItems.filter(i => i.done).length}/${task.checklistItems.length}`
                        : null;

                    return (
                        <div key={task.id} className={`list-group-item list-group-item-action d-flex align-items-center gap-3 ${isOverdue ? "border-danger" : ""}`}>
                            <div className="form-check">
                                <input
                                    className="form-check-input"
                                    type="checkbox"
                                    checked={task.status === "DONE"}
                                    onChange={() => handleSetStatus(task.id, task.status === "DONE" ? "TODO" : "DONE")}
                                />
                            </div>
                            <div className="flex-grow-1" onClick={() => { setSelectedTask(task); setShowTaskModal(true); }} style={{ cursor: "pointer" }}>
                                <div className="d-flex align-items-center gap-2">
                                    <span className={`fw-bold ${task.status === "DONE" ? "text-decoration-line-through text-muted" : ""}`}>
                                        {task.title}
                                    </span>
                                    {isOverdue && <span className="badge bg-danger">{t("Overdue").toUpperCase()}</span>}
                                    <span className={`badge ${
                                        task.priority === 'HIGH' ? 'bg-danger' :
                                            task.priority === 'MED' ? 'bg-warning text-dark' : 'bg-secondary'
                                    } scale-75`}>
                                        {task.priority}
                                    </span>
                                </div>
                                <div className="small text-muted d-flex gap-3 mt-1">
                                    {task.deadline && (
                                        <span><i className="bi bi-calendar3 me-1"></i>{new Date(task.deadline).toLocaleDateString()}</span>
                                    )}
                                    {task.owner && (
                                        <span><i className="bi bi-person me-1"></i>{task.owner}</span>
                                    )}
                                    {task.assignedTo && (
                                        <span><i className="bi bi-person-check me-1"></i>{task.assignedTo.displayName || task.assignedTo.username}</span>
                                    )}
                                    {checklistProgress && (
                                        <span><i className="bi bi-check2-square me-1"></i>{checklistProgress}</span>
                                    )}
                                </div>
                            </div>
                            <button
                                className="btn btn-outline-secondary btn-sm"
                                onClick={(e) => { e.stopPropagation(); handleOpenNotes(task); }}
                                title={t("Open Notes")}
                            >
                                <i className="bi bi-journal-text me-1"></i>
                                {t("Notes")}
                            </button>
                            <div className="dropdown">
                                <button className="btn btn-sm btn-link text-muted" type="button" data-bs-toggle="dropdown">
                                    <i className="bi bi-three-dots-vertical"></i>
                                </button>
                                <ul className="dropdown-menu dropdown-menu-end">
                                    <li><button className="dropdown-item" onClick={() => handleSetStatus(task.id, "DONE")}>{t("Mark as complete")}</button></li>
                                    <li><hr className="dropdown-divider" /></li>
                                    <li><button className="dropdown-item text-danger" onClick={() => handleDeleteTask(task.id)}>{t("Delete Task")}</button></li>
                                </ul>
                            </div>
                        </div>
                    );
                })}
                {tasks.length === 0 && (
                    <div className="list-group-item text-center text-muted py-5">
                        {t("No tasks found. Click on '+ Task' to create one.")}
                    </div>
                )}
            </div>

            <TaskEditorModal
                show={showTaskModal}
                onHide={() => setShowTaskModal(false)}
                task={selectedTask}
                projectId={shell.currentProject.id}
                onSave={handleSaveTask}
                onNavigateToNote={(note) => shell.navigate('notes', { noteId: note.id })}
            />
        </div>
    );
}
