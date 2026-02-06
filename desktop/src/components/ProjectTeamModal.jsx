import { useState, useEffect } from "react";
import { jinn } from "../api/jinn.js";
import { toast } from "react-toastify";
import PortalModal from "./PortalModal.jsx";

export default function ProjectTeamModal({ project, onClose }) {
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("list"); // list, add

    // Add Member State
    const [isRealUser, setIsRealUser] = useState(false);
    const [selectedRole, setSelectedRole] = useState("EDITOR");

    // Search Real User State
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [selectedRealUser, setSelectedRealUser] = useState(null);
    const [isSearching, setIsSearching] = useState(false);

    // Create Local User State
    const [localName, setLocalName] = useState("");
    const [localUsername, setLocalUsername] = useState("");

    useEffect(() => {
        loadMembers();
    }, [project.id]);

    // Debounce search
    useEffect(() => {
        if (!isRealUser || !searchQuery || searchQuery.length < 2) {
            setSearchResults([]);
            return;
        }

        const timer = setTimeout(async () => {
            setIsSearching(true);
            try {
                const results = await jinn.usersSearch(searchQuery);
                // Filtra utenti già membri
                const memberIds = new Set(members.map(m => m.user.id));
                setSearchResults(results.filter(u => !memberIds.has(u.id)));
            } catch (e) {
                console.error("Errore ricerca:", e);
            } finally {
                setIsSearching(false);
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [searchQuery, isRealUser, members]);

    const loadMembers = async () => {
        try {
            setLoading(true);
            const list = await jinn.projectMembersList(project.id);
            setMembers(list || []);
        } catch (e) {
            toast.error("Errore caricamento membri: " + e.message);
        } finally {
            setLoading(false);
        }
    };

    const handleAddMember = async () => {
        try {
            if (isRealUser) {
                if (!selectedRealUser) return;
                await jinn.projectMembersAdd(project.id, selectedRealUser.id, selectedRole);
                toast.success("Membro aggiunto");
            } else {
                if (!localName || !localUsername) return;
                await jinn.projectMembersCreateGhost(project.id, localUsername, localName);
                toast.success("Utente locale creato");
            }
            setActiveTab("list");
            loadMembers();
            // Reset form
            setSearchQuery("");
            setSelectedRealUser(null);
            setLocalName("");
            setLocalUsername("");
        } catch (e) {
            toast.error("Errore: " + e.message);
        }
    };

    const handleRemoveMember = async (userId) => {
        if (!confirm("Rimuovere questo membro dal progetto?")) return;
        try {
            await jinn.projectMembersRemove(project.id, userId);
            toast.success("Membro rimosso");
            loadMembers();
        } catch (e) {
            toast.error("Errore rimozione: " + e.message);
        }
    };

    return (
        <PortalModal onClick={onClose}>
            {/* NOTA: PortalModal fornisce già modal-dialog e modal-content,
                quindi qui passiamo solo il contenuto interno */}
            <div className="modal-header">
                <h5 className="modal-title">Gestione Team: {project.name}</h5>
                <button type="button" className="btn-close" onClick={onClose}></button>
            </div>
            <div className="modal-body">
                <ul className="nav nav-tabs mb-3">
                    <li className="nav-item">
                        <button className={`nav-link ${activeTab === "list" ? "active" : ""}`} onClick={() => setActiveTab("list")}>Membri</button>
                    </li>
                    <li className="nav-item">
                        <button className={`nav-link ${activeTab === "add" ? "active" : ""}`} onClick={() => setActiveTab("add")}>Aggiungi</button>
                    </li>
                </ul>

                {activeTab === "list" && (
                    <div className="list-group list-group-flush">
                        {loading ? (
                            <div className="text-center py-3"><div className="spinner-border spinner-border-sm"></div></div>
                        ) : members.length === 0 ? (
                            <div className="text-center text-muted py-3">Nessun membro</div>
                        ) : (
                            members.map(m => (
                                <div key={m.user.id} className="list-group-item d-flex justify-content-between align-items-center">
                                    <div>
                                        <div className="fw-bold d-flex align-items-center gap-2">
                                            {m.user.displayName || m.user.username}
                                            {m.user.isGhost ? (
                                                <span className="badge bg-secondary-subtle text-secondary border border-secondary-subtle" style={{fontSize: '0.6rem'}}>LOCALE</span>
                                            ) : (
                                                <span className="badge bg-primary-subtle text-primary border border-primary-subtle" style={{fontSize: '0.6rem'}}>JINNLOG</span>
                                            )}
                                        </div>
                                        <small className="text-muted">{m.role}</small>
                                    </div>
                                    {m.role !== "OWNER" && (
                                        <button className="btn btn-sm btn-outline-danger" onClick={() => handleRemoveMember(m.user.id)}>
                                            <i className="bi bi-trash"></i>
                                        </button>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                )}

                {activeTab === "add" && (
                    <div className="d-flex flex-column gap-3">
                        <div className="form-check form-switch mb-2">
                            <input
                                className="form-check-input"
                                type="checkbox"
                                id="modalUserTypeSwitch"
                                checked={isRealUser}
                                onChange={(e) => setIsRealUser(e.target.checked)}
                            />
                            <label className="form-check-label fw-bold" htmlFor="modalUserTypeSwitch">
                                {isRealUser ? "Collega Utente JinnLog" : "Crea Utente Locale"}
                            </label>
                        </div>

                        {isRealUser ? (
                            <>
                                <div className="position-relative">
                                    <label className="form-label">Cerca Utente</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        placeholder="Nome, username o email..."
                                        value={searchQuery}
                                        onChange={(e) => {
                                            setSearchQuery(e.target.value);
                                            setSelectedRealUser(null);
                                        }}
                                    />
                                    {isSearching && (
                                        <div className="position-absolute top-50 end-0 translate-middle-y me-2" style={{marginTop: 12}}>
                                            <div className="spinner-border spinner-border-sm text-secondary"></div>
                                        </div>
                                    )}

                                    {/* Search Results Dropdown */}
                                    {searchResults.length > 0 && !selectedRealUser && (
                                        <div className="list-group position-absolute w-100 mt-1 shadow-sm" style={{ zIndex: 1060, maxHeight: 200, overflowY: 'auto' }}>
                                            {searchResults.map(u => (
                                                <button
                                                    key={u.id}
                                                    className="list-group-item list-group-item-action"
                                                    onClick={() => {
                                                        setSelectedRealUser(u);
                                                        setSearchQuery(u.displayName || u.username);
                                                        setSearchResults([]);
                                                    }}
                                                >
                                                    <div className="fw-bold">{u.displayName || u.username}</div>
                                                    <small className="text-muted">@{u.username}</small>
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                {selectedRealUser && (
                                    <div className="text-success small">
                                        <i className="bi bi-check-circle me-1"></i>
                                        Selezionato: <strong>{selectedRealUser.displayName || selectedRealUser.username}</strong>
                                    </div>
                                )}
                                <div>
                                    <label className="form-label">Ruolo</label>
                                    <select className="form-select" value={selectedRole} onChange={(e) => setSelectedRole(e.target.value)}>
                                        <option value="EDITOR">Editor</option>
                                        <option value="VIEWER">Viewer</option>
                                    </select>
                                </div>
                            </>
                        ) : (
                            <>
                                <div>
                                    <label className="form-label">Nome Visualizzato</label>
                                    <input type="text" className="form-control" value={localName} onChange={(e) => setLocalName(e.target.value)} placeholder="Es. Mario Rossi (Esterno)" />
                                </div>
                                <div>
                                    <label className="form-label">Username (univoco)</label>
                                    <input type="text" className="form-control" value={localUsername} onChange={(e) => setLocalUsername(e.target.value)} placeholder="mario.rossi.local" />
                                </div>
                            </>
                        )}

                        <button
                            className="btn btn-primary mt-2"
                            onClick={handleAddMember}
                            disabled={isRealUser ? !selectedRealUser : (!localName || !localUsername)}
                        >
                            {isRealUser ? "Aggiungi al Team" : "Crea e Aggiungi"}
                        </button>
                    </div>
                )}
            </div>
        </PortalModal>
    );
}