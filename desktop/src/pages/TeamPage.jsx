import React, { useState, useEffect } from 'react';
import { jinn } from '../api/jinn';
import { toast } from 'react-toastify';
import PortalModal from '../components/PortalModal.jsx';
import { useTranslation } from 'react-i18next';
import { useModal } from '../hooks/useModal.js';

const TeamPage = ({ shell }) => {
    const { t } = useTranslation();
    const modal = useModal();
    const [projects, setProjects] = useState([]);
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedProject, setSelectedProject] = useState('');
    const [showModal, setShowModal] = useState(false);

    // Modal State
    const [isRealUser, setIsRealUser] = useState(false); // Checkbox state

    // Form per Utente Locale (Ghost)
    const [localName, setLocalName] = useState('');
    const [localUsername, setLocalUsername] = useState('');

    // Form per Utente Reale (JinnLogger) o Ghost esistente
    const [friends, setFriends] = useState([]);
    const [ghosts, setGhosts] = useState([]);
    const [selectedFriendId, setSelectedFriendId] = useState('');

    // Common
    const [targetProjectId, setTargetProjectId] = useState('');

    // Edit ghost state
    const [showEditModal, setShowEditModal] = useState(false);
    const [editGhost, setEditGhost] = useState(null);
    const [editName, setEditName] = useState('');
    const [editUsername, setEditUsername] = useState('');
    const [editProjects, setEditProjects] = useState(new Set());
    const [savingEdit, setSavingEdit] = useState(false);

    useEffect(() => {
        shell?.setTitle?.(t("Team Management"));

        // Imposta il pannello informativo laterale
        shell?.setRightPanel?.(
            <div className="d-flex flex-column gap-3">
                <div className="fw-bold">{t("Member Management")}</div>

                <div className="p-3 border rounded-3 bg-white">
                    <div className="d-flex align-items-center gap-2 mb-2">
                        <span className="badge bg-primary-subtle text-primary border border-primary-subtle">{t("JinnLog")}</span>
                        <span className="fw-bold small">{t("Real User")}</span>
                    </div>
                    <p className="small text-muted mb-0">
                        {t("A JinnLogger contact...")}
                    </p>
                </div>

                <div className="p-3 border rounded-3 bg-white">
                    <div className="d-flex align-items-center gap-2 mb-2">
                        <span className="badge bg-secondary-subtle text-secondary border border-secondary-subtle">{t("Local")}</span>
                        <span className="fw-bold small">{t("Virtual User")}</span>
                    </div>
                    <p className="small text-muted mb-0">
                        {t("A placeholder created only...")}
                    </p>
                </div>
            </div>
        );

        loadData();
    }, [shell, t]);

    const loadData = async () => {
        try {
            setLoading(true);

            // Usa i metodi di jinn.js invece di fetch dirette
            const [projectsList, friendsList, ghostsList] = await Promise.all([
                jinn.projectsList({ archived: false }),
                jinn.connectionsList(),
                jinn.ghostsList()
            ]);

            setProjects(projectsList);
            setFriends(friendsList);
            setGhosts(ghostsList);

            // Carica membri per ogni progetto
            const allMembers = [];
            for (const p of projectsList) {
                try {
                    const projectMembers = await jinn.projectMembersList(p.id);
                    projectMembers.forEach(m => {
                        allMembers.push({
                            ...m,
                            projectName: p.name,
                            projectId: p.id
                        });
                    });
                } catch (e) {
                    console.warn(`Errore caricamento membri per progetto ${p.name}`, e);
                }
            }
            setMembers(allMembers);
        } catch (e) {
            console.error("Errore caricamento dati team:", e);
            toast.error(t("Error loading"));
        } finally {
            setLoading(false);
        }
    };

    const handleAddMember = async () => {
        if (!targetProjectId) {
            toast.warning(t("Select a project"));
            return;
        }

        try {
            if (isRealUser) {
                // Aggiungi utente reale (amico)
                if (!selectedFriendId) {
                    toast.warning(t("Select JinnLogger *"));
                    return;
                }
                await jinn.projectMembersAdd(targetProjectId, selectedFriendId, "EDITOR");
                toast.success(t("Success"));
            } else {
                // Crea e aggiungi utente locale (Ghost)
                if (!localName || !localUsername) {
                    toast.warning(t("Please fix form errors"));
                    return;
                }
                await jinn.projectMembersCreateGhost(targetProjectId, localUsername, localName);
                toast.success(t("Success"));
            }

            // Reset e reload
            setShowModal(false);
            setLocalName('');
            setLocalUsername('');
            setSelectedFriendId('');
            loadData();
        } catch (e) {
            toast.error(t("Error") + ": " + e.message);
        }
    };

    const openEditGhost = (ghost) => {
        setEditGhost(ghost);
        setEditName(ghost.displayName || '');
        setEditUsername(ghost.username || '');
        // Find which projects this ghost is currently a member of
        const ghostProjects = new Set(
            members.filter(m => m.user.id === ghost.id).map(m => m.projectId)
        );
        setEditProjects(ghostProjects);
        setShowEditModal(true);
    };

    const handleEditGhost = async () => {
        if (!editGhost || !editName || !editUsername) return;
        try {
            setSavingEdit(true);
            // Update name/username
            await jinn.ghostsUpdate(editGhost.id, { username: editUsername, displayName: editName });

            // Sync project assignments
            const currentProjects = new Set(
                members.filter(m => m.user.id === editGhost.id).map(m => m.projectId)
            );
            // Add to new projects
            for (const pid of editProjects) {
                if (!currentProjects.has(pid)) {
                    await jinn.projectMembersAdd(pid, editGhost.id, "EDITOR");
                }
            }
            // Remove from deselected projects
            for (const pid of currentProjects) {
                if (!editProjects.has(pid)) {
                    await jinn.projectMembersRemove(pid, editGhost.id);
                }
            }

            toast.success(t("Member updated"));
            setShowEditModal(false);
            setEditGhost(null);
            loadData();
        } catch (e) {
            toast.error(t("Error") + ": " + e.message);
        } finally {
            setSavingEdit(false);
        }
    };

    const toggleEditProject = (projectId) => {
        setEditProjects(prev => {
            const next = new Set(prev);
            if (next.has(projectId)) next.delete(projectId);
            else next.add(projectId);
            return next;
        });
    };

    const handleRemoveMember = async (member) => {
        const confirmed = await modal.confirm({ title: `${t("Remove")} ${member.user.displayName || member.user.username} ${t("from project")} ${member.projectName}?` });
        if (!confirmed) return;

        try {
            await jinn.projectMembersRemove(member.projectId, member.user.id);
            toast.success(t("Deleted successfully"));
            loadData();
        } catch (e) {
            toast.error(t("Deletion error") + ": " + e.message);
        }
    };

    // Filtra membri
    const filteredMembers = selectedProject
        ? members.filter(m => m.projectId === selectedProject)
        : members;

    if (loading) return <div className="p-5 text-center"><div className="spinner-border text-primary"></div></div>;

    return (
        <div className="container-fluid p-4 fade-in">
            {/* Toolbar */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div className="d-flex gap-3 align-items-center">
                    <select
                        className="form-select"
                        style={{ maxWidth: 250 }}
                        value={selectedProject}
                        onChange={(e) => setSelectedProject(e.target.value)}
                    >
                        <option value="">{t("All projects")}</option>
                        {projects.map(p => (
                            <option key={p.id} value={p.id}>{p.name}</option>
                        ))}
                    </select>
                </div>
                <button className="btn btn-primary" onClick={() => setShowModal(true)}>
                    <i className="bi bi-plus-lg me-2"></i>
                    {t("New Member")}
                </button>
            </div>

            {/* Members Table */}
            <div className="card border-0 shadow-sm">
                <div className="table-responsive">
                    <table className="table table-hover mb-0">
                        <thead className="bg-light">
                        <tr>
                            <th className="ps-4 py-3">{t("Member")}</th>
                            <th className="py-3">{t("Account Type")}</th>
                            <th className="py-3">{t("Project")}</th>
                            <th className="py-3">{t("Role")}</th>
                            <th className="py-3 text-end pe-4">{t("Actions")}</th>
                        </tr>
                        </thead>
                        <tbody>
                        {filteredMembers.length === 0 ? (
                            <tr>
                                <td colSpan="5" className="text-center py-5 text-muted">
                                    {t("No members found.")}
                                </td>
                            </tr>
                        ) : (
                            filteredMembers.map((m, idx) => (
                                <tr key={`${m.projectId}-${m.user.id}-${idx}`}>
                                    <td className="ps-4 py-3 align-middle">
                                        <div className="d-flex align-items-center">
                                            <div className="avatar-circle bg-secondary text-white me-3 d-flex align-items-center justify-content-center" style={{width: 32, height: 32, borderRadius: '50%'}}>
                                                {(m.user.displayName || m.user.username).substring(0, 2).toUpperCase()}
                                            </div>
                                            <div>
                                                <div className="fw-bold">{m.user.displayName || m.user.username}</div>
                                                <div className="small text-muted">@{m.user.username}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        {m.user.ghost ? (
                                            <span className="badge bg-secondary-subtle text-secondary border border-secondary-subtle">{t("Local")}</span>
                                        ) : (
                                            <span className="badge bg-primary-subtle text-primary border border-primary-subtle">{t("JinnLog")}</span>
                                        )}
                                    </td>
                                    <td>
                                            <span className="badge bg-light text-dark border">
                                                {m.projectName}
                                            </span>
                                    </td>
                                    <td>
                                            <span className={`badge ${m.role === 'OWNER' ? 'bg-warning-subtle text-warning-emphasis' : 'bg-info-subtle text-info-emphasis'}`}>
                                                {m.role}
                                            </span>
                                    </td>
                                    <td className="text-end pe-4">
                                        <div className="btn-group">
                                            {m.user.ghost && (
                                                <button
                                                    className="btn btn-sm btn-outline-primary"
                                                    onClick={() => openEditGhost(m.user)}
                                                    title={t("Edit Member")}
                                                >
                                                    <i className="bi bi-pencil"></i>
                                                </button>
                                            )}
                                            {m.role !== 'OWNER' && (
                                                <button
                                                    className="btn btn-sm btn-outline-danger"
                                                    onClick={() => handleRemoveMember(m)}
                                                    title={t("Remove from project")}
                                                >
                                                    <i className="bi bi-trash"></i>
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Edit Ghost Modal */}
            {showEditModal && editGhost && (
                <PortalModal onClick={() => setShowEditModal(false)}>
                    <div className="modal-header">
                        <h5 className="modal-title">{t("Edit Member")}</h5>
                        <button type="button" className="btn-close" onClick={() => setShowEditModal(false)} />
                    </div>
                    <div className="modal-body">
                        <div className="mb-3">
                            <label className="form-label fw-bold">{t("Display Name *")}</label>
                            <input
                                type="text"
                                className="form-control"
                                value={editName}
                                onChange={(e) => setEditName(e.target.value)}
                            />
                        </div>
                        <div className="mb-3">
                            <label className="form-label fw-bold">{t("Username Identifier *")}</label>
                            <input
                                type="text"
                                className="form-control"
                                value={editUsername}
                                onChange={(e) => setEditUsername(e.target.value)}
                            />
                        </div>
                        <hr />
                        <div className="mb-3">
                            <label className="form-label fw-bold">{t("Projects")}</label>
                            {projects.length === 0 ? (
                                <p className="text-muted small">{t("No active projects")}</p>
                            ) : (
                                <div className="list-group">
                                    {projects.map(p => (
                                        <label key={p.id} className="list-group-item d-flex align-items-center gap-2" style={{ cursor: 'pointer' }}>
                                            <input
                                                type="checkbox"
                                                className="form-check-input m-0"
                                                checked={editProjects.has(p.id)}
                                                onChange={() => toggleEditProject(p.id)}
                                            />
                                            <span>{p.name}</span>
                                        </label>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="modal-footer">
                        <button className="btn btn-secondary" onClick={() => setShowEditModal(false)}>{t("Cancel")}</button>
                        <button className="btn btn-primary" onClick={handleEditGhost} disabled={savingEdit || !editName || !editUsername}>
                            {savingEdit ? t("Loading...") : t("Save Changes")}
                        </button>
                    </div>
                </PortalModal>
            )}

            {/* Add Member Modal - CORRETTO: senza doppio wrapping */}
            {showModal && (
                <PortalModal onClick={() => setShowModal(false)}>
                    <div className="modal-header">
                        <h5 className="modal-title">{t("Add Member to Team")}</h5>
                        <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
                    </div>
                    <div className="modal-body">
                        {/* Project Selection */}
                        <div className="mb-3">
                            <label className="form-label fw-bold">{t("Project *")}</label>
                            <select
                                className="form-select"
                                value={targetProjectId}
                                onChange={(e) => setTargetProjectId(e.target.value)}
                            >
                                <option value="">{t("Select project...")}</option>
                                {projects.map(p => (
                                    <option key={p.id} value={p.id}>{p.name}</option>
                                ))}
                            </select>
                        </div>

                        <hr />

                        {/* User Type Toggle */}
                        <div className="mb-3">
                            <div className="form-check form-switch">
                                <input
                                    className="form-check-input"
                                    type="checkbox"
                                    id="userTypeSwitch"
                                    checked={isRealUser}
                                    onChange={(e) => setIsRealUser(e.target.checked)}
                                />
                                <label className="form-check-label fw-bold" htmlFor="userTypeSwitch">
                                    {isRealUser ? t("Connect JinnLog User (Friend)") : t("Create Local User (Virtual)")}
                                </label>
                            </div>
                            <div className="form-text small mt-1">
                                {isRealUser
                                    ? t("Select one of your contacts...")
                                    : t("Create a local profile...")
                                }
                            </div>
                        </div>

                        {/* Dynamic Form Fields */}
                        {isRealUser ? (
                            <div className="mb-3 fade-in">
                                <label className="form-label">{t("Select JinnLogger *")}</label>
                                <select
                                    className="form-select"
                                    value={selectedFriendId}
                                    onChange={(e) => setSelectedFriendId(e.target.value)}
                                >
                                    <option value="">{t("-- Select contact --")}</option>
                                    {friends.length > 0 && (
                                        <optgroup label={t("JinnLoggers")}>
                                            {friends.map(u => {
                                                const alreadyMember = targetProjectId && members.some(m => m.projectId === targetProjectId && m.user.id === u.id);
                                                return (
                                                    <option key={u.id} value={u.id} disabled={alreadyMember}>
                                                        {u.displayName || u.username} (@{u.username}){alreadyMember ? ` - ${t("Already member")}` : ''}
                                                    </option>
                                                );
                                            })}
                                        </optgroup>
                                    )}
                                    {ghosts.length > 0 && (
                                        <optgroup label={t("Virtual Members")}>
                                            {ghosts.map(u => {
                                                const alreadyMember = targetProjectId && members.some(m => m.projectId === targetProjectId && m.user.id === u.id);
                                                return (
                                                    <option key={u.id} value={u.id} disabled={alreadyMember}>
                                                        {u.displayName || u.username} (@{u.username}){alreadyMember ? ` - ${t("Already member")}` : ''}
                                                    </option>
                                                );
                                            })}
                                        </optgroup>
                                    )}
                                </select>
                                {friends.length === 0 && ghosts.length === 0 && (
                                    <div className="alert alert-warning mt-2 small">
                                        {t("No connections yet...")}
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="fade-in">
                                <div className="mb-3">
                                    <label className="form-label">{t("Display Name *")}</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        placeholder={t("Ex. John Doe (External)")}
                                        value={localName}
                                        onChange={(e) => setLocalName(e.target.value)}
                                    />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">{t("Username Identifier *")}</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        placeholder={t("Ex. john.doe.ext")}
                                        value={localUsername}
                                        onChange={(e) => setLocalUsername(e.target.value)}
                                    />
                                    <div className="form-text">{t("Must be unique in the system.")}</div>
                                </div>
                            </div>
                        )}
                    </div>
                    <div className="modal-footer">
                        <button className="btn btn-secondary" onClick={() => setShowModal(false)}>{t("Cancel")}</button>
                        <button className="btn btn-primary" onClick={handleAddMember}>
                            {isRealUser ? t("Add to Team") : t("Create Local")}
                        </button>
                    </div>
                </PortalModal>
            )}
        </div>
    );
};

export default TeamPage;
