import { useState, useEffect, useCallback, useMemo } from "react";
import { jinn } from "../api/jinn.js";
import { toast } from "react-toastify";
import { useTranslation } from 'react-i18next';

/**
 * KanbanPage - Vista Kanban per gestione task
 * 
 * Features:
 * - Colonne per status (TODO, DOING, DONE)
 * - Drag and drop tra colonne
 * - Quick actions sui task
 * - Filtri e ricerca
 * - Integrazione Focus Timer con spostamento automatico (PRD-04)
 * - Badge progresso checklist (PRD-09)
 * 
 * @author Lorenzo DM
 * @since 0.2.0
 * @updated 0.4.3 - Aggiunto badge checklist
 */

// ========================================
// Configurazione Colonne
// ========================================

const getColumns = (t) => [
    { id: "TODO", label: t("To Do"), color: "#6c757d", icon: "bi-circle" },
    { id: "DOING", label: t("In Progress"), color: "#0d6efd", icon: "bi-play-circle" },
    { id: "DONE", label: t("Done"), color: "#198754", icon: "bi-check-circle" },
];

// ========================================
// KanbanCard Component
// ========================================

function KanbanCard({ task, onStatusChange, onEdit, onDelete, onTimerToggle, runningTimer, t }) {
    const [isDragging, setIsDragging] = useState(false);

    const priorityColors = {
        HIGH: { bg: "#dc3545", text: "white" },
        MED: { bg: "#ffc107", text: "black" },
        LOW: { bg: "#6c757d", text: "white" },
    };

    const priority = priorityColors[task.priority] || priorityColors.MED;

    const handleDragStart = (e) => {
        e.dataTransfer.setData("taskId", task.id);
        e.dataTransfer.setData("currentStatus", task.status);
        setIsDragging(true);
    };

    const handleDragEnd = () => {
        setIsDragging(false);
    };

    const isOverdue = task.deadline && new Date(task.deadline) < new Date() && task.status !== "DONE";
    const isTimerRunningOnThis = runningTimer && runningTimer.taskId === task.id;
    const checklistProgress = task.checklistItems?.length > 0 
        ? `${task.checklistItems.filter(i => i.done).length}/${task.checklistItems.length}`
        : null;

    return (
        <div
            className={`kanban-card card mb-2 shadow-sm ${isDragging ? "dragging" : ""} ${isTimerRunningOnThis ? "border-success" : ""}`}
            draggable
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            style={{
                cursor: "grab",
                opacity: isDragging ? 0.5 : 1,
                borderLeft: `4px solid ${priority.bg}`,
                borderRight: isTimerRunningOnThis ? `4px solid #198754` : 'none',
            }}
        >
            <div className="card-body p-2">
                {/* Header con titolo e azioni */}
                <div className="d-flex justify-content-between align-items-start mb-1">
                    <h6 className="card-title mb-0 flex-grow-1" style={{ fontSize: "0.9rem" }}>
                        {task.title}
                    </h6>
                    <div className="dropdown">
                        <button
                            className="btn btn-sm btn-link text-muted p-0"
                            type="button"
                            data-bs-toggle="dropdown"
                            aria-expanded="false"
                        >
                            <i className="bi bi-three-dots-vertical"></i>
                        </button>
                        <ul className="dropdown-menu dropdown-menu-end">
                            <li>
                                <button className="dropdown-item" onClick={() => onEdit(task)}>
                                    <i className="bi bi-pencil me-2"></i>{t("Edit")}
                                </button>
                            </li>
                            <li><hr className="dropdown-divider" /></li>
                            <li>
                                <button 
                                    className="dropdown-item text-danger" 
                                    onClick={() => onDelete(task)}
                                >
                                    <i className="bi bi-trash me-2"></i>{t("Delete")}
                                </button>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Descrizione (troncata) */}
                {task.description && (
                    <p className="card-text text-muted small mb-2" style={{ 
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                    }}>
                        {task.description}
                    </p>
                )}

                {/* Footer con metadata */}
                <div className="d-flex justify-content-between align-items-center">
                    {/* Priorità e Checklist */}
                    <div className="d-flex align-items-center gap-2">
                        <span
                            className="badge"
                            style={{
                                backgroundColor: priority.bg,
                                color: priority.text,
                                fontSize: "0.7rem",
                            }}
                        >
                            {task.priority}
                        </span>
                        {checklistProgress && (
                            <span className="badge bg-light text-dark border">
                                <i className="bi bi-check2-square me-1"></i>
                                {checklistProgress}
                            </span>
                        )}
                    </div>

                    {/* Deadline */}
                    {task.deadline && (
                        <span className={`small ${isOverdue ? "text-danger fw-bold" : "text-muted"}`}>
                            <i className={`bi ${isOverdue ? "bi-exclamation-triangle" : "bi-calendar"} me-1`}></i>
                            {new Date(task.deadline).toLocaleDateString("it-IT", {
                                day: "2-digit",
                                month: "short",
                            })}
                        </span>
                    )}

                    {/* Focus Timer Button */}
                    <button 
                        className={`btn btn-sm p-1 ${isTimerRunningOnThis ? "btn-success" : "btn-outline-secondary"}`}
                        onClick={() => onTimerToggle(task)}
                        title={isTimerRunningOnThis ? t("Stop timer") : t("Start timer")}
                    >
                        <i className={`bi ${isTimerRunningOnThis ? "bi-stop-fill" : "bi-play-fill"}`}></i>
                    </button>
                </div>
            </div>
        </div>
    );
}

// ========================================
// KanbanColumn Component
// ========================================

function KanbanColumn({ column, tasks, onDrop, onEdit, onDelete, onStatusChange, onTimerToggle, runningTimer, t }) {
    const [isDragOver, setIsDragOver] = useState(false);

    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragOver(true);
    };

    const handleDragLeave = () => {
        setIsDragOver(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragOver(false);

        const taskId = e.dataTransfer.getData("taskId");
        const currentStatus = e.dataTransfer.getData("currentStatus");

        if (currentStatus !== column.id) {
            onDrop(taskId, column.id);
        }
    };

    return (
        <div
            className={`kanban-column flex-grow-1 ${isDragOver ? "drag-over" : ""}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            style={{
                minWidth: 280,
                maxWidth: 400,
                backgroundColor: "#f1f2f4", // Sfondo chiaro
                borderRadius: "8px",
                transition: "background-color 0.2s",
            }}
        >
            {/* Column Header */}
            <div
                className="kanban-column-header p-2 rounded-top"
                style={{
                    backgroundColor: column.color,
                    color: "white",
                }}
            >
                <div className="d-flex justify-content-between align-items-center">
                    <span className="fw-bold">
                        <i className={`bi ${column.icon} me-2`}></i>
                        {column.label}
                    </span>
                    <span className="badge bg-light text-dark">{tasks.length}</span>
                </div>
            </div>

            {/* Column Body */}
            <div
                className="kanban-column-body p-2"
                style={{
                    minHeight: 400,
                    maxHeight: "calc(100vh - 250px)",
                    overflowY: "auto",
                }}
            >
                {tasks.length === 0 ? (
                    <div className="text-center text-muted py-4">
                        <i className="bi bi-inbox fs-1 d-block mb-2"></i>
                        <small>{t("No tasks")}</small>
                    </div>
                ) : (
                    tasks.map((task) => (
                        <KanbanCard
                            key={task.id}
                            task={task}
                            onStatusChange={onStatusChange}
                            onEdit={onEdit}
                            onDelete={onDelete}
                            onTimerToggle={onTimerToggle}
                            runningTimer={runningTimer}
                            t={t}
                        />
                    ))
                )}
            </div>
        </div>
    );
}

// ========================================
// KanbanPage Main Component
// ========================================

export default function KanbanPage({ shell }) {
    const { t } = useTranslation();
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterPriority, setFilterPriority] = useState("");
    const [runningTimer, setRunningTimer] = useState(null);
    const COLUMNS = useMemo(() => getColumns(t), [t]);

    // Setup shell
    useEffect(() => {
        shell?.setTitle?.(t("Kanban"));
        shell?.setHeaderActions?.(
            <div className="d-flex gap-2 align-items-center">
                {/* Search */}
                <input
                    type="text"
                    className="form-control form-control-sm"
                    placeholder={t("Search tasks...")}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{ width: 200 }}
                />
                {/* Refresh */}
                <button
                    className="btn btn-sm btn-outline-secondary"
                    onClick={loadTasks}
                    title={t("Refresh")}
                >
                    <i className="bi bi-arrow-clockwise"></i>
                </button>
            </div>
        );
    }, [shell, searchTerm, filterPriority, t]);

    // Load Tasks & Timer
    const loadTasks = useCallback(async () => {
        if (!shell?.currentProject) {
            setTasks([]);
            setLoading(false);
            return;
        }
        try {
            setLoading(true);
            const [tasksList, timer] = await Promise.all([
                jinn.tasksList(shell.currentProject.id),
                jinn.focusRunning()
            ]);
            setTasks(tasksList || []);
            setRunningTimer(timer);
        } catch (e) {
            console.error("[KanbanPage] Errore caricamento:", e);
            toast.error(t("Error loading") + ": " + e.message);
        } finally {
            setLoading(false);
        }
    }, [shell?.currentProject, t]);

    useEffect(() => {
        loadTasks();
    }, [loadTasks]);

    // Filtered Tasks
    const filteredTasks = useMemo(() => {
        return tasks.filter((task) => {
            if (searchTerm && !task.title?.toLowerCase().includes(searchTerm.toLowerCase())) return false;
            if (filterPriority && task.priority !== filterPriority) return false;
            if (task.archived) return false;
            return true;
        });
    }, [tasks, searchTerm, filterPriority]);

    // Group Tasks by Status
    const tasksByColumn = useMemo(() => {
        const grouped = {};
        COLUMNS.forEach((col) => {
            grouped[col.id] = filteredTasks.filter((t) => t.status === col.id);
        });
        return grouped;
    }, [filteredTasks, COLUMNS]);

    // Handlers
    const handleDrop = async (taskId, newStatus) => {
        if (!shell?.currentProject) return;
        try {
            setTasks((prev) => prev.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t)));
            await jinn.tasksUpdateStatus(shell.currentProject.id, taskId, newStatus);
            toast.success(`${t("Task moved to")} "${COLUMNS.find(c => c.id === newStatus)?.label}"`);
        } catch (e) {
            toast.error(t("Update error") + ": " + e.message);
            loadTasks();
        }
    };

    const handleTimerToggle = async (task) => {
        try {
            if (runningTimer && runningTimer.taskId === task.id) {
                await jinn.focusStop();
                setRunningTimer(null);
                toast.info(t("Timer stopped"));
            } else {
                const newTimer = await jinn.focusStart(task.id);
                setRunningTimer(newTimer);
                toast.success(t("Timer started on") + ": " + task.title);

                // Sposta automaticamente in "DOING" se non lo è già
                if (task.status !== "DOING") {
                    handleDrop(task.id, "DOING");
                }
            }
        } catch (e) {
            toast.error(t("Timer error") + ": " + e.message);
        }
    };

    const handleEdit = (task) => toast.info(t("Task editor coming soon..."));
    const handleDelete = async (task) => {
        if (!shell?.currentProject || !confirm(`${t("Delete")} "${task.title}"?`)) return;
        try {
            await jinn.tasksDelete(shell.currentProject.id, task.id);
            setTasks((prev) => prev.filter((t) => t.id !== task.id));
            toast.success(t("Task deleted"));
        } catch (e) {
            toast.error(t("Deletion error") + ": " + e.message);
        }
    };

    if (loading) return <div className="d-flex justify-content-center align-items-center py-5"><div className="spinner-border text-primary"></div></div>;
    if (!shell?.currentProject) return <div className="text-center py-5 text-muted">{t("Select a project")}</div>;

    return (
        <div className="kanban-page h-100">
            <div className="kanban-board d-flex gap-3 p-3" style={{ overflowX: "auto", minHeight: "calc(100vh - 200px)" }}>
                {COLUMNS.map((column) => (
                    <KanbanColumn
                        key={column.id}
                        column={column}
                        tasks={tasksByColumn[column.id] || []}
                        onDrop={handleDrop}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                        onTimerToggle={handleTimerToggle}
                        runningTimer={runningTimer}
                        t={t}
                    />
                ))}
            </div>
            <style>{`
                .kanban-card.dragging { transform: rotate(3deg); box-shadow: 0 8px 16px rgba(0,0,0,0.2); }
                .kanban-column.drag-over { border: 2px dashed #0d6efd; }
                .kanban-card { transition: transform 0.15s, box-shadow 0.15s; }
                .kanban-card:hover { transform: translateY(-2px); box-shadow: 0 4px 8px rgba(0,0,0,0.15); }
            `}</style>
        </div>
    );
}
