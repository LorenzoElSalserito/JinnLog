import React, { useState, useEffect } from 'react';
import { jinn } from '../api/jinn';
import { toast } from 'react-toastify';
import { Tooltip } from 'react-tooltip';
import PortalModal from '../components/PortalModal.jsx';
import { useTranslation } from 'react-i18next';

const ResourcePage = ({ shell }) => {
    const { t, i18n } = useTranslation();
    const [projects, setProjects] = useState([]);
    const [selectedProjectId, setSelectedProjectId] = useState('');
    const [allocations, setAllocations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
    const [rangeDays, setRangeDays] = useState(14); // 2 settimane default

    // Modal State
    const [showTaskModal, setShowTaskModal] = useState(false);
    const [showMemberModal, setShowMemberModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [selectedDate, setSelectedDate] = useState(null);
    const [userTasks, setUserTasks] = useState([]);

    useEffect(() => {
        shell?.setTitle?.(t("Resources & Workload"));
        loadProjects();
    }, [shell, t]);

    useEffect(() => {
        if (selectedProjectId) {
            loadAllocations();
        } else {
            setAllocations([]);
        }
    }, [selectedProjectId, startDate, rangeDays]);

    const loadProjects = async () => {
        try {
            const list = await jinn.projectsList({ archived: false });
            setProjects(list);
            if (list.length > 0) {
                setSelectedProjectId(list[0].id);
            }
        } catch (e) {
            toast.error(t("Error loading"));
        } finally {
            setLoading(false);
        }
    };

    const loadAllocations = async () => {
        try {
            setLoading(true);
            const start = new Date(startDate);
            const end = new Date(start);
            end.setDate(end.getDate() + rangeDays - 1);

            const data = await jinn.resourceAllocation(selectedProjectId, startDate, end.toISOString().split('T')[0]);
            setAllocations(data.allocations);

        } catch (e) {
            console.error(e);
            toast.error(t("Error loading"));
        } finally {
            setLoading(false);
        }
    };

    const handleMemberClick = (userId, userName) => {
        setSelectedUser({ id: userId, name: userName });
        setShowMemberModal(true);
    };

    const handleCellClick = async (userId, userName, dateStr) => {
        setSelectedUser({ id: userId, name: userName });
        setSelectedDate(dateStr);
        setShowTaskModal(true);

        try {
            const tasks = await jinn.tasksList(selectedProjectId);
            const date = new Date(dateStr);

            const filtered = tasks.filter(t => {
                const assigneeId = t.assignedTo ? t.assignedTo.id : "unassigned";
                if (assigneeId !== userId) return false;

                if (t.scheduledStart) {
                    const start = new Date(t.scheduledStart);
                    const end = t.scheduledEnd ? new Date(t.scheduledEnd) : start;
                    start.setHours(0,0,0,0);
                    end.setHours(0,0,0,0);
                    date.setHours(0,0,0,0);
                    return date >= start && date <= end;
                } else if (t.deadline) {
                    return t.deadline === dateStr;
                }
                return false;
            });

            setUserTasks(filtered);
        } catch (e) {
            toast.error(t("Error loading"));
        }
    };

    const handleUnassignTask = async (taskId) => {
        if (!confirm(t("Confirm"))) return;
        try {
            await jinn.tasksUpdate(selectedProjectId, taskId, { assignedToId: "" });
            toast.success(t("Success"));
            setShowTaskModal(false);
            loadAllocations();
        } catch (e) {
            toast.error(t("Update error"));
        }
    };

    const handleRemoveMember = async () => {
        if (!selectedUser || !selectedProjectId) return;
        if (!confirm(`${t("Remove")} ${selectedUser.name}?`)) return;

        try {
            await jinn.projectMembersRemove(selectedProjectId, selectedUser.id);
            toast.success(t("Deleted successfully"));
            setShowMemberModal(false);
            loadAllocations();
        } catch (e) {
            toast.error(t("Deletion error") + ": " + e.message);
        }
    };

    // Genera date per l'header
    const dates = [];
    for (let i = 0; i < rangeDays; i++) {
        const d = new Date(startDate);
        d.setDate(d.getDate() + i);
        dates.push(d);
    }

    const getCellColor = (minutes) => {
        if (!minutes) return 'bg-light cursor-pointer';
        const hours = minutes / 60;
        if (hours <= 4) return 'bg-success-subtle text-success-emphasis cursor-pointer';
        if (hours <= 8) return 'bg-warning-subtle text-warning-emphasis cursor-pointer';
        return 'bg-danger-subtle text-danger-emphasis fw-bold cursor-pointer';
    };

    if (loading && projects.length === 0) return <div className="p-5 text-center"><div className="spinner-border text-primary"></div></div>;

    return (
        <div className="container-fluid p-4 fade-in">
            {/* Toolbar */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div className="d-flex gap-3 align-items-center">
                    <select
                        className="form-select"
                        style={{ maxWidth: 300 }}
                        value={selectedProjectId}
                        onChange={(e) => setSelectedProjectId(e.target.value)}
                    >
                        {projects.map(p => (
                            <option key={p.id} value={p.id}>{p.name}</option>
                        ))}
                    </select>

                    <input
                        type="date"
                        className="form-control"
                        style={{ maxWidth: 180 }}
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                    />

                    <select
                        className="form-select"
                        style={{ maxWidth: 150 }}
                        value={rangeDays}
                        onChange={(e) => setRangeDays(parseInt(e.target.value))}
                    >
                        <option value="7">{t("7 days")}</option>
                        <option value="14">{t("14 days")}</option>
                        <option value="21">{t("21 days")}</option>
                        <option value="30">{t("30 days")}</option>
                    </select>
                </div>
            </div>

            {/* Resource Grid */}
            <div className="card border-0 shadow-sm">
                <div className="table-responsive" style={{ overflowX: 'auto' }}>
                    <table className="table table-bordered mb-0" style={{ minWidth: 800 }}>
                        <thead className="bg-light">
                        <tr>
                            <th style={{ width: 200, minWidth: 200 }} className="ps-4 py-3">{t("Member")}</th>
                            {dates.map(d => (
                                <th key={d.toISOString()} className="text-center small py-3" style={{ width: 100, minWidth: 100 }}>
                                    <div className="fw-bold">{d.toLocaleDateString(i18n.language, { weekday: 'short' })}</div>
                                    <div className="text-muted">{d.getDate()}</div>
                                </th>
                            ))}
                        </tr>
                        </thead>
                        <tbody>
                        {allocations.length === 0 ? (
                            <tr>
                                <td colSpan={dates.length + 1} className="text-center py-5 text-muted">
                                    {t("No data available...")}
                                </td>
                            </tr>
                        ) : (
                            allocations.map(user => (
                                <tr key={user.userId}>
                                    <td
                                        className="ps-4 py-3 align-middle bg-white position-sticky start-0 border-end shadow-sm"
                                        style={{ cursor: 'pointer' }}
                                        onClick={() => handleMemberClick(user.userId, user.userName)}
                                    >
                                        <div className="d-flex align-items-center">
                                            <div className="avatar-circle bg-secondary text-white me-2 d-flex align-items-center justify-content-center" style={{width: 32, height: 32, borderRadius: '50%'}}>
                                                {user.userName.substring(0, 2).toUpperCase()}
                                            </div>
                                            <div className="text-truncate fw-medium">{user.userName}</div>
                                        </div>
                                    </td>
                                    {dates.map(d => {
                                        const dateStr = d.toISOString().split('T')[0];
                                        const minutes = user.dailyMinutes[dateStr] || 0;
                                        const hours = (minutes / 60).toFixed(1);

                                        return (
                                            <td
                                                key={dateStr}
                                                className={`text-center align-middle p-1 ${getCellColor(minutes)}`}
                                                onClick={() => handleCellClick(user.userId, user.userName, dateStr)}
                                            >
                                                {minutes > 0 && (
                                                    <div
                                                        className="rounded p-1"
                                                        data-tooltip-id="resource-tooltip"
                                                        data-tooltip-content={`${hours} ${t("estimated hours")}`}
                                                    >
                                                        {hours}h
                                                    </div>
                                                )}
                                            </td>
                                        );
                                    })}
                                </tr>
                            ))
                        )}
                        </tbody>
                    </table>
                </div>
            </div>
            <Tooltip id="resource-tooltip" />

            <div className="d-flex gap-3 mt-3 small text-muted">
                <div className="d-flex align-items-center gap-1">
                    <div className="rounded bg-success-subtle border border-success-subtle" style={{width: 16, height: 16}}></div>
                    <span>{t("Optimal")}</span>
                </div>
                <div className="d-flex align-items-center gap-1">
                    <div className="rounded bg-warning-subtle border border-warning-subtle" style={{width: 16, height: 16}}></div>
                    <span>{t("Full")}</span>
                </div>
                <div className="d-flex align-items-center gap-1">
                    <div className="rounded bg-danger-subtle border border-danger-subtle" style={{width: 16, height: 16}}></div>
                    <span>{t("Overload")}</span>
                </div>
            </div>

            {/* Task Management Modal - CORRETTO: senza doppio wrapping */}
            {showTaskModal && (
                <PortalModal onClick={() => setShowTaskModal(false)}>
                    <div className="modal-header">
                        <h5 className="modal-title">{t("Task")}: {selectedUser?.name}</h5>
                        <button type="button" className="btn-close" onClick={() => setShowTaskModal(false)}></button>
                    </div>
                    <div className="modal-body">
                        <p className="text-muted small mb-3">
                            {t("Day:")} <strong>{new Date(selectedDate).toLocaleDateString()}</strong>
                        </p>

                        {userTasks.length === 0 ? (
                            <div className="text-center text-muted py-3">{t("No tasks assigned...")}</div>
                        ) : (
                            <div className="list-group">
                                {userTasks.map(task => (
                                    <div key={task.id} className="list-group-item d-flex justify-content-between align-items-center">
                                        <div>
                                            <div className="fw-bold">{task.title}</div>
                                            <small className="text-muted">
                                                {task.estimatedMinutes ? `${task.estimatedMinutes} ${t("min")}` : t("Not set")}
                                            </small>
                                        </div>
                                        <button
                                            className="btn btn-sm btn-outline-danger"
                                            onClick={() => handleUnassignTask(task.id)}
                                            title={t("Remove assignment")}
                                        >
                                            <i className="bi bi-person-x"></i>
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                    <div className="modal-footer">
                        <button className="btn btn-secondary" onClick={() => setShowTaskModal(false)}>{t("Close")}</button>
                    </div>
                </PortalModal>
            )}

            {/* Member Management Modal - CORRETTO: senza doppio wrapping */}
            {showMemberModal && (
                <PortalModal onClick={() => setShowMemberModal(false)}>
                    <div className="modal-header">
                        <h5 className="modal-title">{t("Member Management:")} {selectedUser?.name}</h5>
                        <button type="button" className="btn-close" onClick={() => setShowMemberModal(false)}></button>
                    </div>
                    <div className="modal-body">
                        <div className="d-flex flex-column gap-3">
                            <div className="alert alert-light border">
                                <div className="fw-bold mb-1">{t("Details")}</div>
                                <div className="small text-muted">{t("ID:")} {selectedUser?.id}</div>
                            </div>

                            <button
                                className="btn btn-outline-danger w-100"
                                onClick={handleRemoveMember}
                            >
                                <i className="bi bi-person-dash me-2"></i>
                                {t("Remove from Project")}
                            </button>
                        </div>
                    </div>
                    <div className="modal-footer">
                        <button className="btn btn-secondary" onClick={() => setShowMemberModal(false)}>{t("Close")}</button>
                    </div>
                </PortalModal>
            )}
        </div>
    );
};

export default ResourcePage;
