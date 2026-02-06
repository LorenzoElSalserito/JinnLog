import { useState, useEffect, useCallback, useMemo } from "react";
import { jinn } from "../api/jinn.js";
import { toast } from "react-toastify";
import MDEditor from "@uiw/react-md-editor";
import { useTranslation } from 'react-i18next';

/**
 * NotesPage - Pagina per gestione note markdown (Feed/Inbox)
 * 
 * Features:
 * - Feed note (Inbox, Sent, All)
 * - Filtri contestuali (Progetto/Task)
 * - Editor Markdown completo
 * - Preview in tempo reale
 * - Creazione/Modifica/Eliminazione note
 * - Ricerca full-text
 * - Deep Linking (apertura nota specifica da contesto)
 * 
 * @author Lorenzo DM
 * @since 0.2.0
 * @updated 0.8.0 - Filtri contestuali e Deep Linking
 */

// ========================================
// NoteCard Component
// ========================================

function NoteCard({ note, isActive, onClick, onDelete, currentUserId, t }) {
    const isOwner = note.owner?.id === currentUserId;
    
    const updatedAt = note.updatedAt 
        ? new Date(note.updatedAt).toLocaleDateString("it-IT", {
            day: "2-digit",
            month: "short",
            hour: "2-digit",
            minute: "2-digit",
        })
        : null;

    const preview = useMemo(() => {
        if (!note.content) return t("No content");
        const text = note.content
            .replace(/#{1,6}\s/g, "")
            .replace(/\*\*/g, "")
            .replace(/\*/g, "")
            .replace(/`/g, "")
            .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
            .trim();
        return text.length > 100 ? text.substring(0, 100) + "..." : text;
    }, [note.content, t]);

    return (
        <div
            className={`note-card card mb-2 ${isActive ? "border-primary" : ""}`}
            onClick={onClick}
            style={{
                cursor: "pointer",
                borderLeftWidth: 4,
                borderLeftColor: isActive ? "#0d6efd" : (isOwner ? "#198754" : "#6c757d"),
            }}
        >
            <div className="card-body p-3">
                <div className="d-flex justify-content-between align-items-start">
                    <h6 className="card-title mb-1 text-truncate" style={{maxWidth: "85%"}}>
                        {note.title || t("Untitled")}
                    </h6>
                    {isOwner && (
                        <button
                            className="btn btn-sm btn-link text-danger p-0"
                            onClick={(e) => {
                                e.stopPropagation();
                                onDelete(note);
                            }}
                            title={t("Delete")}
                        >
                            <i className="bi bi-trash"></i>
                        </button>
                    )}
                </div>
                
                {!isOwner && (
                    <div className="small text-primary mb-1">
                        <i className="bi bi-person-circle me-1"></i>
                        {note.owner?.displayName || note.owner?.username || t("Unknown")}
                    </div>
                )}
                
                <p className="card-text text-muted small mb-1" style={{ 
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                }}>
                    {preview}
                </p>

                <div className="d-flex justify-content-between align-items-center mt-2">
                    {updatedAt && (
                        <small className="text-muted" style={{fontSize: '0.7rem'}}>
                            {updatedAt}
                        </small>
                    )}
                    
                    <div className="d-flex gap-1">
                        <span className="badge bg-light text-dark border" style={{fontSize: '0.65rem'}}>
                            {note.parentType === "TASK" ? "TASK" : "PROJ"}
                        </span>
                        {note.parentTitle && (
                            <span className="badge bg-light text-secondary border text-truncate" style={{fontSize: '0.65rem', maxWidth: '80px'}} title={note.parentTitle}>
                                {note.parentTitle}
                            </span>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

// ========================================
// NotesPage Main Component
// ========================================

export default function NotesPage({ shell }) {
    const { t } = useTranslation();
    const [notes, setNotes] = useState([]);
    const [activeNote, setActiveNote] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    
    // Filtri
    const [scope, setScope] = useState("ALL"); // ALL, INBOX, SENT
    const [contextFilter, setContextFilter] = useState("ALL"); // ALL, PROJECT, TASK
    const [contextId, setContextId] = useState(""); // ID specifico se filtrato
    
    // Liste per filtri
    const [availableTasks, setAvailableTasks] = useState([]);
    
    const context = shell?.navContext;
    const currentUserId = jinn.getCurrentUser();

    const [editTitle, setEditTitle] = useState("");
    const [editContent, setEditContent] = useState("");
    const [editorMode, setEditorMode] = useState("edit");
    const [hasChanges, setHasChanges] = useState(false);

    // Stato per il modale di creazione
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newNoteTitle, setNewNoteTitle] = useState("");
    const [newNoteParentType, setNewNoteParentType] = useState("PROJECT");
    const [newNoteParentId, setNewNoteParentId] = useState("");

    // Inizializzazione da contesto navigazione
    useEffect(() => {
        if (context?.noteId) {
            // Se c'è un noteId, caricheremo la nota specifica dopo
            // Ma prima carichiamo il feed per avere il contesto
        }
        
        if (context?.taskId) {
            setContextFilter("TASK");
            setContextId(context.taskId);
        } else if (context?.projectId) {
            setContextFilter("PROJECT");
            setContextId(context.projectId);
        }
    }, [context]);

    // Caricamento Task per filtri e creazione
    useEffect(() => {
        if (shell?.currentProject) {
            jinn.tasksList(shell.currentProject.id)
                .then(tasks => setAvailableTasks(tasks))
                .catch(err => console.error("Errore caricamento task", err));
        }
    }, [shell?.currentProject]);

    useEffect(() => {
        shell?.setTitle?.(t("Notes & Feed"));
        
        const headerActions = (
            <div className="d-flex gap-2 align-items-center">
                <div className="input-group input-group-sm" style={{ width: 250 }}>
                    <span className="input-group-text bg-transparent border-end-0">
                        <i className="bi bi-search"></i>
                    </span>
                    <input
                        type="text"
                        className="form-control border-start-0 ps-0"
                        placeholder={t("Search notes...")}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                
                <button
                    className="btn btn-sm btn-primary"
                    onClick={() => {
                        setNewNoteTitle("");
                        // Pre-fill based on current filter
                        if (contextFilter === "TASK" && contextId) {
                            setNewNoteParentType("TASK");
                            setNewNoteParentId(contextId);
                        } else {
                            setNewNoteParentType("PROJECT");
                            setNewNoteParentId(shell.currentProject?.id || "");
                        }
                        setShowCreateModal(true);
                    }}
                >
                    <i className="bi bi-plus-lg me-1"></i>
                    {t("New Note")}
                </button>
            </div>
        );

        shell?.setHeaderActions?.(headerActions);
        shell?.setRightPanel?.(null);
    }, [shell, searchTerm, contextFilter, contextId, t]);

    const loadNotes = useCallback(async () => {
        if (!shell?.currentProject) {
            setNotes([]);
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            let fetchedNotes = [];

            // Logica di caricamento basata sui filtri
            if (contextFilter === "TASK" && contextId) {
                fetchedNotes = await jinn.notesListTask(contextId);
            } else if (contextFilter === "PROJECT" && contextId) {
                fetchedNotes = await jinn.notesListProject(contextId);
            } else {
                // Feed generale (filtrato per scope)
                fetchedNotes = await jinn.notesFeed(scope);
            }
            
            // Filtro client-side per ricerca veloce
            if (searchTerm) {
                const lower = searchTerm.toLowerCase();
                fetchedNotes = fetchedNotes.filter(n => 
                    (n.title && n.title.toLowerCase().includes(lower)) || 
                    (n.content && n.content.toLowerCase().includes(lower))
                );
            }

            setNotes(fetchedNotes || []);
            
            // Deep Linking: Se c'è un noteId nel contesto, trovalo o caricalo
            if (context?.noteId) {
                const target = fetchedNotes.find(n => n.id === context.noteId);
                if (target) {
                    setActiveNote(target);
                } else {
                    // Se non è nella lista (es. lista filtrata), prova a caricarlo singolarmente
                    try {
                        const singleNote = await jinn.notesGet(context.noteId);
                        setActiveNote(singleNote);
                        // Opzionale: aggiungilo alla lista se coerente
                        setNotes(prev => [singleNote, ...prev]);
                    } catch (e) {
                        console.warn("Nota deep-link non trovata", e);
                    }
                }
                // Pulisci il contesto per evitare loop o reload indesiderati
                // (Richiede che shell.navigate gestisca la pulizia o che lo ignoriamo dopo)
            } else if (activeNote && !fetchedNotes.find(n => n.id === activeNote.id)) {
                // Se cambio filtro e la nota attiva sparisce, deseleziona
                setActiveNote(null);
            }
        } catch (e) {
            toast.error(t("Error loading notes") + ": " + e.message);
        } finally {
            setLoading(false);
        }
    }, [shell?.currentProject, contextFilter, contextId, scope, searchTerm, context]);

    useEffect(() => {
        loadNotes();
    }, [loadNotes]);

    useEffect(() => {
        if (activeNote) {
            setEditTitle(activeNote.title || "");
            setEditContent(activeNote.content || "");
            setHasChanges(false);
        } else {
            setEditTitle("");
            setEditContent("");
            setHasChanges(false);
        }
    }, [activeNote]);

    const handleCreateNote = async () => {
        if (!newNoteTitle.trim()) {
            toast.warn(t("Please enter a title"));
            return;
        }
        
        if (!newNoteParentId) {
            toast.warn(t("Please select a valid context"));
            return;
        }

        try {
            let newNote;
            const noteData = {
                title: newNoteTitle,
                content: ""
            };

            if (newNoteParentType === "TASK") {
                newNote = await jinn.notesCreateTask(newNoteParentId, noteData);
            } else {
                newNote = await jinn.notesCreateProject(newNoteParentId, noteData);
            }

            setNotes((prev) => [newNote, ...prev]);
            setActiveNote(newNote);
            setShowCreateModal(false);
            toast.success(t("Note created"));
        } catch (e) {
            toast.error(t("Error creating note") + ": " + e.message);
        }
    };

    const handleSave = async () => {
        if (!activeNote) return;
        try {
            setSaving(true);
            const updatedNote = await jinn.notesUpdate(activeNote.id, {
                title: editTitle,
                content: editContent,
            });
            setActiveNote(updatedNote);
            setNotes((prev) => prev.map((n) => n.id === activeNote.id ? updatedNote : n));
            setHasChanges(false);
            toast.success(t("Note saved"));
        } catch (e) {
            toast.error(t("Error saving note") + ": " + e.message);
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (note) => {
        if (!confirm(t("Are you sure you want to delete") + ` "${note.title}"?`)) return;
        try {
            await jinn.notesDelete(note.id);
            setNotes((prev) => prev.filter((n) => n.id !== note.id));
            if (activeNote?.id === note.id) setActiveNote(null);
            toast.success(t("Note deleted"));
        } catch (e) {
            toast.error(t("Error deleting note") + ": " + e.message);
        }
    };

    const handleTitleChange = (value) => {
        setEditTitle(value);
        setHasChanges(true);
    };

    const handleContentChange = (value) => {
        setEditContent(value || "");
        setHasChanges(true);
    };

    const isOwner = activeNote?.owner?.id === currentUserId;

    if (loading && notes.length === 0) return <div className="d-flex justify-content-center align-items-center py-5"><div className="spinner-border text-primary"></div></div>;
    if (!shell?.currentProject) return <div className="text-center py-5"><i className="bi bi-folder2-open fs-1 text-muted d-block mb-3"></i><h5 className="text-muted">{t("No project selected")}</h5><p className="text-muted small">{t("Select or create a project to manage notes.")}</p></div>;

    return (
        <div className="notes-page d-flex h-100" style={{ minHeight: "calc(100vh - 150px)" }}>
            <div className="notes-sidebar border-end bg-light d-flex flex-column" style={{ width: 320, minWidth: 280 }}>
                {/* Filtri Scope (Inbox/Sent/All) */}
                <div className="p-2 border-bottom bg-white">
                    <div className="d-flex gap-1 justify-content-center mb-2">
                        <button 
                            className={`btn btn-sm flex-grow-1 ${scope === 'ALL' ? 'btn-primary' : 'btn-outline-secondary'}`}
                            onClick={() => { setScope('ALL'); setContextFilter('ALL'); }}
                        >
                            {t("All")}
                        </button>
                        <button 
                            className={`btn btn-sm flex-grow-1 ${scope === 'INBOX' ? 'btn-primary' : 'btn-outline-secondary'}`}
                            onClick={() => { setScope('INBOX'); setContextFilter('ALL'); }}
                        >
                            {t("Inbox")}
                        </button>
                        <button 
                            className={`btn btn-sm flex-grow-1 ${scope === 'SENT' ? 'btn-primary' : 'btn-outline-secondary'}`}
                            onClick={() => { setScope('SENT'); setContextFilter('ALL'); }}
                        >
                            {t("Sent")}
                        </button>
                    </div>
                    
                    {/* Filtri Contestuali */}
                    <div className="d-flex gap-2">
                        <select 
                            className="form-select form-select-sm"
                            value={contextFilter}
                            onChange={(e) => {
                                setContextFilter(e.target.value);
                                if (e.target.value === "PROJECT") setContextId(shell.currentProject.id);
                                if (e.target.value === "ALL") setContextId("");
                                if (e.target.value === "TASK") setContextId(""); // Reset per forzare selezione
                            }}
                        >
                            <option value="ALL">{t("All contexts")}</option>
                            <option value="PROJECT">{t("Project")}</option>
                            <option value="TASK">{t("Task")}</option>
                        </select>
                        
                        {contextFilter === "TASK" && (
                            <select 
                                className="form-select form-select-sm"
                                value={contextId}
                                onChange={(e) => setContextId(e.target.value)}
                            >
                                <option value="">{t("Select Task...")}</option>
                                {availableTasks.map(t => (
                                    <option key={t.id} value={t.id}>{t.title.substring(0, 20)}...</option>
                                ))}
                            </select>
                        )}
                    </div>
                </div>

                {/* Lista Note */}
                <div className="flex-grow-1 overflow-auto p-2">
                    {notes.length === 0 ? (
                        <div className="text-center text-muted py-4">
                            <i className="bi bi-journal-text fs-1 d-block mb-2"></i>
                            <small>{t("No notes found")}</small>
                            <br />
                            <button className="btn btn-sm btn-primary mt-2" onClick={() => setShowCreateModal(true)}>{t("Create the first note")}</button>
                        </div>
                    ) : (
                        notes.map((note) => (
                            <NoteCard
                                key={note.id}
                                note={note}
                                isActive={activeNote?.id === note.id}
                                onClick={() => setActiveNote(note)}
                                onDelete={handleDelete}
                                currentUserId={currentUserId}
                                t={t}
                            />
                        ))
                    )}
                </div>
            </div>

            <div className="notes-editor flex-grow-1 d-flex flex-column">
                {activeNote ? (
                    <>
                        <div className="editor-toolbar border-bottom p-2 bg-white d-flex justify-content-between align-items-center">
                            <div className="d-flex align-items-center gap-2 flex-grow-1">
                                {!isOwner && (
                                    <span className="badge bg-secondary me-2">
                                        <i className="bi bi-lock-fill me-1"></i>
                                        {t("Read Only")}
                                    </span>
                                )}
                                <input
                                    type="text"
                                    className="form-control form-control-sm border-0 fs-5 fw-bold"
                                    value={editTitle}
                                    onChange={(e) => handleTitleChange(e.target.value)}
                                    placeholder={t("Title")}
                                    style={{ maxWidth: 400 }}
                                    disabled={!isOwner}
                                />
                            </div>
                            <div className="d-flex gap-2 align-items-center">
                                <div className="btn-group btn-group-sm">
                                    <button className={`btn ${editorMode === "edit" ? "btn-primary" : "btn-outline-secondary"}`} onClick={() => setEditorMode("edit")} title={t("Editor")}><i className="bi bi-pencil"></i></button>
                                    <button className={`btn ${editorMode === "live" ? "btn-primary" : "btn-outline-secondary"}`} onClick={() => setEditorMode("live")} title={t("Editor + Preview")}><i className="bi bi-layout-split"></i></button>
                                    <button className={`btn ${editorMode === "preview" ? "btn-primary" : "btn-outline-secondary"}`} onClick={() => setEditorMode("preview")} title={t("Preview")}><i className="bi bi-eye"></i></button>
                                </div>
                                {isOwner && (
                                    <button
                                        className={`btn btn-sm ${hasChanges ? "btn-success" : "btn-outline-secondary"}`}
                                        onClick={handleSave}
                                        disabled={!hasChanges || saving}
                                    >
                                        {saving ? <span className="spinner-border spinner-border-sm me-1"></span> : <i className="bi bi-check-lg me-1"></i>}
                                        {hasChanges ? t("Save") : t("Saved")}
                                    </button>
                                )}
                            </div>
                        </div>
                        <div className="editor-content flex-grow-1" data-color-mode={shell.currentTheme === 'dark' ? 'dark' : 'light'}>
                            <MDEditor
                                value={editContent}
                                onChange={handleContentChange}
                                preview={!isOwner ? "preview" : editorMode}
                                height="100%"
                                style={{ height: "100%" }}
                                hideToolbar={editorMode === "preview" || !isOwner}
                                visibleDragbar={false}
                                textareaProps={{
                                    disabled: !isOwner
                                }}
                            />
                        </div>
                    </>
                ) : (
                    <div className="d-flex flex-column align-items-center justify-content-center h-100 text-muted">
                        <i className="bi bi-journal-richtext fs-1 mb-3"></i>
                        <h5>{t("Select a note")}</h5>
                        <p className="small">
                            {t("Choose a note from the list or")} <button className="btn btn-link btn-sm p-0 ms-1" onClick={() => setShowCreateModal(true)}>{t("create a new one")}</button>
                        </p>
                    </div>
                )}
            </div>

            {/* Modal Creazione Nota */}
            {showCreateModal && (
                <div className="modal show d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)", zIndex: 1050 }}>
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">{t("New Note")}</h5>
                                <button type="button" className="btn-close" onClick={() => setShowCreateModal(false)}></button>
                            </div>
                            <div className="modal-body">
                                <div className="mb-3">
                                    <label className="form-label">{t("Title")}</label>
                                    <input 
                                        type="text" 
                                        className="form-control" 
                                        value={newNoteTitle}
                                        onChange={(e) => setNewNoteTitle(e.target.value)}
                                        placeholder={t("Enter title...")}
                                        autoFocus
                                    />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">{t("Associate to")}</label>
                                    <select 
                                        className="form-select mb-2"
                                        value={newNoteParentType}
                                        onChange={(e) => {
                                            setNewNoteParentType(e.target.value);
                                            if (e.target.value === "PROJECT") {
                                                setNewNoteParentId(shell.currentProject.id);
                                            } else {
                                                setNewNoteParentId(""); // Reset per forzare selezione task
                                            }
                                        }}
                                    >
                                        <option value="PROJECT">{t("Current Project")}</option>
                                        <option value="TASK">{t("Specific Task")}</option>
                                    </select>

                                    {newNoteParentType === "TASK" && (
                                        <select 
                                            className="form-select"
                                            value={newNoteParentId}
                                            onChange={(e) => setNewNoteParentId(e.target.value)}
                                        >
                                            <option value="">{t("Select a task...")}</option>
                                            {availableTasks.map(task => (
                                                <option key={task.id} value={task.id}>{task.title}</option>
                                            ))}
                                        </select>
                                    )}
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button className="btn btn-secondary" onClick={() => setShowCreateModal(false)}>{t("Cancel")}</button>
                                <button className="btn btn-primary" onClick={handleCreateNote}>{t("Create Note")}</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <style>{`
                .notes-page .wmde-markdown-var { --color-canvas-default: white; }
                [data-theme="dark"] .notes-page .wmde-markdown-var { --color-canvas-default: #1e1e1e; }
                .note-card:hover { background-color: #f8f9fa; }
                [data-theme="dark"] .note-card:hover { background-color: rgba(255,255,255,0.05); }
                .note-card.border-primary { background-color: rgba(13, 110, 253, 0.05); }
                .editor-content .w-md-editor { height: 100% !important; }
                .editor-content .w-md-editor-content { height: calc(100% - 29px) !important; }
                
                /* Dark mode overrides for sidebar */
                [data-theme="dark"] .notes-sidebar {
                    background-color: var(--jl-bg-secondary) !important;
                    border-color: var(--jl-border-color) !important;
                }
                [data-theme="dark"] .notes-sidebar .bg-white {
                    background-color: var(--jl-bg-secondary) !important;
                    color: var(--jl-text-primary);
                }
                [data-theme="dark"] .notes-sidebar .bg-light {
                    background-color: var(--jl-bg-secondary) !important;
                }
                [data-theme="dark"] .editor-toolbar {
                    background-color: var(--jl-bg-secondary) !important;
                    border-color: var(--jl-border-color) !important;
                }
                [data-theme="dark"] .editor-toolbar input {
                    background-color: transparent;
                    color: var(--jl-text-primary);
                }
            `}</style>
        </div>
    );
}
