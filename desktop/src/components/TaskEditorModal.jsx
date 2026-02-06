import { useState, useEffect, useRef } from "react";
import MDEditor from "@uiw/react-md-editor";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useDropzone } from "react-dropzone";
import { toast } from "react-toastify";
import PortalModal from "./PortalModal.jsx";
import { jinn } from "../api/jinn";
import { useTranslation } from 'react-i18next';

/**
 * TaskEditorModal - Modale per creare/editare task
 *
 * Stile conformato a ProjectDetailModal (PortalModal + Bootstrap classes)
 */
export default function TaskEditorModal({
                                            show,
                                            onHide,
                                            task = null,
                                            projectId,
                                            onSave,
                                            onNavigateToNote // Callback per navigare alla pagina note
                                        }) {
    const { t } = useTranslation();
    
    // Form state
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [markdownNotes, setMarkdownNotes] = useState("");
    const [status, setStatus] = useState("TODO");
    const [priority, setPriority] = useState("MED");
    const [deadline, setDeadline] = useState(null);
    const [owner, setOwner] = useState("");
    const [tags, setTags] = useState([]);
    const [newTag, setNewTag] = useState("");

    // Assets state
    const [uploadedFiles, setUploadedFiles] = useState([]);
    const [existingAssets, setExistingAssets] = useState([]);

    // UI state
    const [showPreview, setShowPreview] = useState(false);
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [activeTab, setActiveTab] = useState("details"); // 'details' | 'notes'

    // Notes (Chat) state
    const [taskNotes, setTaskNotes] = useState([]);
    const [newNoteContent, setNewNoteContent] = useState("");
    const [loadingNotes, setLoadingNotes] = useState(false);
    const notesEndRef = useRef(null);
    const currentUserId = jinn.getCurrentUser();

    useEffect(() => {
        if (show && task) {
            setTitle(task.title || "");
            setDescription(task.description || "");
            setMarkdownNotes(task.notes || "");
            setStatus(task.status || "TODO");
            setPriority(task.priority || "MED");
            setDeadline(task.deadline ? new Date(task.deadline) : null);
            setOwner(task.owner || "");
            setTags(task.tags || []);
            setExistingAssets(task.assets || []);
            
            // Load notes if tab is active or just pre-load
            loadTaskNotes(task.id);
        } else if (show) {
            resetForm();
        }
    }, [show, task]);

    useEffect(() => {
        if (activeTab === "notes" && notesEndRef.current) {
            notesEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [taskNotes, activeTab]);

    const loadTaskNotes = async (taskId) => {
        try {
            setLoadingNotes(true);
            // Use new specific endpoint
            const notes = await jinn.notesListTask(taskId);
            setTaskNotes(notes);
        } catch (e) {
            console.error("Errore caricamento note:", e);
        } finally {
            setLoadingNotes(false);
        }
    };

    const handleSendNote = async (e) => {
        e.preventDefault();
        if (!newNoteContent.trim() || !task) return;

        try {
            const noteData = {
                title: t("Task Note"), // Titolo opzionale o fisso
                content: newNoteContent
            };
            // Use new specific endpoint
            await jinn.notesCreateTask(task.id, noteData);
            setNewNoteContent("");
            loadTaskNotes(task.id); // Refresh notes
        } catch (e) {
            toast.error(t("Error sending note"));
        }
    };

    const handleDeleteNote = async (noteId) => {
        if (!confirm(t("Delete this note?"))) return;
        try {
            await jinn.notesDelete(noteId);
            setTaskNotes(prev => prev.filter(n => n.id !== noteId));
        } catch (e) {
            toast.error(t("Error deleting note"));
        }
    };

    const handleEditNote = (note) => {
        if (onNavigateToNote) {
            onNavigateToNote(note);
            onHide(); // Chiudi la modale
        }
    };

    const resetForm = () => {
        setTitle("");
        setDescription("");
        setMarkdownNotes("");
        setStatus("TODO");
        setPriority("MED");
        setDeadline(null);
        setOwner("");
        setTags([]);
        setUploadedFiles([]);
        setExistingAssets([]);
        setErrors({});
        setActiveTab("details");
        setTaskNotes([]);
        setNewNoteContent("");
    };

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop: (acceptedFiles) => {
            setUploadedFiles((prev) => [...prev, ...acceptedFiles]);
            toast.success(`${acceptedFiles.length} ${t("files uploaded")}`);
        },
        multiple: true,
        maxSize: 10485760, // 10MB
    });

    const addTag = () => {
        const trimmed = newTag.trim();
        if (trimmed && !tags.includes(trimmed)) {
            setTags([...tags, trimmed]);
            setNewTag("");
        }
    };

    const removeTag = (tagToRemove) => {
        setTags(tags.filter((t) => t !== tagToRemove));
    };

    const validateForm = () => {
        const newErrors = {};
        if (!title.trim()) newErrors.title = t("Title is required");
        if (title.length > 500) newErrors.title = t("Title cannot exceed 500 characters");
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSave = async () => {
        if (!validateForm()) {
            toast.error(t("Please fix form errors"));
            return;
        }

        setIsSubmitting(true);

        try {
            const taskData = {
                title: title.trim(),
                description: description.trim(),
                notes: markdownNotes,
                status,
                priority,
                deadline: deadline ? deadline.toISOString().split('T')[0] : null,
                owner: owner.trim(),
                tags,
                projectId,
            };

            if (task) {
                taskData.id = task.id;
            }

            await onSave(taskData, uploadedFiles);
            toast.success(task ? t("Task updated!") : t("Task created!"));
            handleClose();
        } catch (error) {
            console.error("Errore salvataggio task:", error);
            toast.error(t("Error saving task"));
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleClose = () => {
        resetForm();
        onHide();
    };

    const removeFile = (index) => {
        setUploadedFiles(uploadedFiles.filter((_, i) => i !== index));
    };

    const removeExistingAsset = (assetId) => {
        setExistingAssets(existingAssets.filter((a) => a.id !== assetId));
    };

    if (!show) return null;

    return (
        <PortalModal
            className="modal-xl modal-dialog-scrollable"
            onClick={handleClose}
            style={{ maxWidth: "1140px" }}
        >
            <div style={{ maxHeight: "90vh", display: "flex", flexDirection: "column" }}>
                <div className="modal-header">
                    <h5 className="modal-title">
                        {task ? t("Edit Task") : t("New Task")}
                    </h5>
                    <button type="button" className="btn-close" onClick={handleClose}></button>
                </div>

                {/* Tabs Navigation */}
                {task && (
                    <div className="modal-header border-bottom-0 pb-0 pt-0">
                        <ul className="nav nav-tabs w-100 border-bottom-0">
                            <li className="nav-item">
                                <button 
                                    className={`nav-link ${activeTab === 'details' ? 'active fw-bold' : ''}`}
                                    onClick={() => setActiveTab('details')}
                                >
                                    <i className="bi bi-pencil me-2"></i>
                                    {t("Details")}
                                </button>
                            </li>
                            <li className="nav-item">
                                <button 
                                    className={`nav-link ${activeTab === 'notes' ? 'active fw-bold' : ''}`}
                                    onClick={() => setActiveTab('notes')}
                                >
                                    <i className="bi bi-chat-square-text me-2"></i>
                                    {t("Notes & Discussion")}
                                    {taskNotes.length > 0 && <span className="badge bg-secondary ms-2 rounded-pill">{taskNotes.length}</span>}
                                </button>
                            </li>
                        </ul>
                    </div>
                )}

                <div className="modal-body bg-light" style={{ overflowY: "auto", flexGrow: 1, padding: "1.5rem" }}>
                    
                    {/* TAB DETTAGLI */}
                    {activeTab === 'details' && (
                        <form className="bg-white p-4 rounded shadow-sm">
                            {/* Titolo Task */}
                            <div className="mb-3">
                                <label className="form-label fw-bold">
                                    {t("Title")} <span className="text-danger">*</span>
                                </label>
                                <input
                                    type="text"
                                    className={`form-control ${errors.title ? "is-invalid" : ""}`}
                                    placeholder={t("Ex: Complete project presentation...")}
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    autoFocus
                                />
                                {errors.title && <div className="invalid-feedback">{errors.title}</div>}
                            </div>

                            {/* Descrizione breve */}
                            <div className="mb-3">
                                <label className="form-label fw-bold">{t("Short Description")}</label>
                                <textarea
                                    className="form-control"
                                    rows="2"
                                    placeholder={t("Brief task description...")}
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                ></textarea>
                            </div>

                            {/* Row: Status, Priority, Deadline, Owner */}
                            <div className="row mb-3">
                                <div className="col-md-3">
                                    <label className="form-label fw-bold">{t("Status")}</label>
                                    <select
                                        className="form-select"
                                        value={status}
                                        onChange={(e) => setStatus(e.target.value)}
                                    >
                                        <option value="TODO">TODO</option>
                                        <option value="DOING">DOING</option>
                                        <option value="DONE">DONE</option>
                                    </select>
                                </div>

                                <div className="col-md-3">
                                    <label className="form-label fw-bold">{t("Priority")}</label>
                                    <select
                                        className="form-select"
                                        value={priority}
                                        onChange={(e) => setPriority(e.target.value)}
                                    >
                                        <option value="LOW">LOW</option>
                                        <option value="MED">MEDIUM</option>
                                        <option value="HIGH">HIGH</option>
                                    </select>
                                </div>

                                <div className="col-md-3">
                                    <label className="form-label fw-bold">{t("Deadline")}</label>
                                    <div className="d-block">
                                        <DatePicker
                                            selected={deadline}
                                            onChange={(date) => setDeadline(date)}
                                            dateFormat="dd/MM/yyyy"
                                            placeholderText={t("Select date")}
                                            className="form-control w-100"
                                            isClearable
                                        />
                                    </div>
                                </div>

                                <div className="col-md-3">
                                    <label className="form-label fw-bold">{t("Owner")}</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        placeholder={t("Owner name")}
                                        value={owner}
                                        onChange={(e) => setOwner(e.target.value)}
                                    />
                                </div>
                            </div>

                            {/* Tags */}
                            <div className="mb-3">
                                <label className="form-label fw-bold">{t("Tags")}</label>
                                <div className="d-flex gap-2 mb-2 flex-wrap">
                                    {tags.map((tag, idx) => (
                                        <span
                                            key={idx}
                                            className="badge bg-info text-dark d-flex align-items-center gap-1"
                                            style={{ fontSize: "0.9rem" }}
                                        >
                                            {tag}
                                            <i 
                                                className="bi bi-x-lg ms-1"
                                                style={{ cursor: "pointer" }}
                                                onClick={() => removeTag(tag)}
                                            ></i>
                                        </span>
                                    ))}
                                </div>
                                <div className="input-group">
                                    <input
                                        type="text"
                                        className="form-control"
                                        placeholder={t("Add tag...")}
                                        value={newTag}
                                        onChange={(e) => setNewTag(e.target.value)}
                                        onKeyPress={(e) => {
                                            if (e.key === "Enter") {
                                                e.preventDefault();
                                                addTag();
                                            }
                                        }}
                                    />
                                    <button
                                        className="btn btn-outline-secondary"
                                        type="button"
                                        onClick={addTag}
                                        disabled={!newTag.trim()}
                                    >
                                        <i className="bi bi-plus-lg"></i>
                                    </button>
                                </div>
                            </div>

                            {/* Editor Markdown per Note */}
                            <div className="mb-3">
                                <div className="d-flex justify-content-between align-items-center mb-2">
                                    <label className="form-label fw-bold mb-0">
                                        {t("Markdown Notes (Personal)")}
                                    </label>
                                    <div className="form-check form-switch">
                                        <input
                                            className="form-check-input"
                                            type="checkbox"
                                            id="previewSwitch"
                                            checked={showPreview}
                                            onChange={(e) => setShowPreview(e.target.checked)}
                                        />
                                        <label className="form-check-label" htmlFor="previewSwitch">{t("Preview")}</label>
                                    </div>
                                </div>
                                <div data-color-mode="light">
                                    <MDEditor
                                        value={markdownNotes}
                                        onChange={setMarkdownNotes}
                                        preview={showPreview ? "preview" : "edit"}
                                        height={300}
                                        visibleDragbar={false}
                                        textareaProps={{
                                            placeholder: t("Write your notes in Markdown...")
                                        }}
                                    />
                                </div>
                            </div>

                            {/* Upload Assets */}
                            <div className="mb-3">
                                <label className="form-label fw-bold">{t("Attachments")}</label>

                                {/* Dropzone */}
                                <div
                                    {...getRootProps()}
                                    className={`border rounded p-4 text-center ${
                                        isDragActive ? "bg-light border-primary" : "bg-white border-secondary"
                                    }`}
                                    style={{ cursor: "pointer", borderStyle: "dashed" }}
                                >
                                    <input {...getInputProps()} />
                                    <i className="bi bi-cloud-upload fs-2 mb-2 text-muted d-block"></i>
                                    <p className="mb-0 text-muted">
                                        {isDragActive
                                            ? t("Drop files here...")
                                            : t("Drag files here or click to select")}
                                    </p>
                                    <small className="text-muted">{t("Max 10MB per file")}</small>
                                </div>

                                {/* Lista file caricati */}
                                {uploadedFiles.length > 0 && (
                                    <div className="mt-3">
                                        <h6>{t("Files to upload:")}</h6>
                                        {uploadedFiles.map((file, idx) => (
                                            <div
                                                key={idx}
                                                className="d-flex align-items-center justify-content-between p-2 bg-light border rounded mb-2"
                                            >
                                                <div className="d-flex align-items-center gap-2">
                                                    <i className="bi bi-file-earmark"></i>
                                                    <span>{file.name}</span>
                                                    <small className="text-muted">
                                                        ({(file.size / 1024).toFixed(1)} KB)
                                                    </small>
                                                </div>
                                                <button
                                                    type="button"
                                                    className="btn btn-outline-danger btn-sm"
                                                    onClick={() => removeFile(idx)}
                                                >
                                                    <i className="bi bi-trash"></i>
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* Asset esistenti (in edit mode) */}
                                {existingAssets.length > 0 && (
                                    <div className="mt-3">
                                        <h6>{t("Existing assets:")}</h6>
                                        {existingAssets.map((asset) => (
                                            <div
                                                key={asset.id}
                                                className="d-flex align-items-center justify-content-between p-2 bg-light border border-success rounded mb-2"
                                            >
                                                <div className="d-flex align-items-center gap-2">
                                                    <i className="bi bi-file-earmark text-success"></i>
                                                    <span>{asset.fileName}</span>
                                                </div>
                                                <button
                                                    type="button"
                                                    className="btn btn-outline-danger btn-sm"
                                                    onClick={() => removeExistingAsset(asset.id)}
                                                >
                                                    <i className="bi bi-trash"></i>
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </form>
                    )}

                    {/* TAB NOTE (CHAT) */}
                    {activeTab === 'notes' && (
                        <div className="d-flex flex-column h-100 bg-white rounded shadow-sm overflow-hidden">
                            <div className="flex-grow-1 p-3 overflow-auto" style={{ minHeight: '300px' }}>
                                {loadingNotes && <div className="text-center text-muted">{t("Loading notes...")}</div>}
                                {!loadingNotes && taskNotes.length === 0 && (
                                    <div className="text-center text-muted mt-5">
                                        <i className="bi bi-chat-square-text fs-1 mb-3 opacity-25 d-block"></i>
                                        <p>{t("No notes yet. Start the discussion!")}</p>
                                    </div>
                                )}
                                {taskNotes.map(note => {
                                    const isMe = note.owner.id === currentUserId;
                                    return (
                                        <div key={note.id} className={`d-flex mb-3 ${isMe ? 'justify-content-end' : 'justify-content-start'}`}>
                                            {!isMe && (
                                                <div className="me-2">
                                                    <div className="avatar-circle bg-secondary text-white d-flex align-items-center justify-content-center" style={{width: 32, height: 32, borderRadius: '50%', fontSize: '0.8rem'}}>
                                                        {(note.owner.displayName || note.owner.username).substring(0, 2).toUpperCase()}
                                                    </div>
                                                </div>
                                            )}
                                            <div className={`card border-0 shadow-sm ${isMe ? 'bg-primary text-white' : 'bg-light'}`} style={{ maxWidth: '75%' }}>
                                                <div className="card-body p-2 px-3">
                                                    {!isMe && <div className="fw-bold small mb-1 text-primary">{note.owner.displayName || note.owner.username}</div>}
                                                    <div style={{ whiteSpace: 'pre-wrap' }}>{note.content}</div>
                                                    <div className={`d-flex justify-content-between align-items-center mt-1 ${isMe ? 'text-white-50' : 'text-muted'}`} style={{ fontSize: '0.7rem' }}>
                                                        <span>{new Date(note.createdAt).toLocaleString()}</span>
                                                        <div className="d-flex gap-2 ms-2">
                                                            {isMe && (
                                                                <>
                                                                    <button className="btn btn-link p-0 text-white-50" onClick={() => handleEditNote(note)} title={t("Edit")}>
                                                                        <i className="bi bi-pencil"></i>
                                                                    </button>
                                                                    <button className="btn btn-link p-0 text-white-50" onClick={() => handleDeleteNote(note.id)} title={t("Delete")}>
                                                                        <i className="bi bi-trash"></i>
                                                                    </button>
                                                                </>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                                <div ref={notesEndRef} />
                            </div>
                            <div className="p-3 border-top bg-light">
                                <form onSubmit={handleSendNote} className="d-flex gap-2">
                                    <input
                                        type="text"
                                        className="form-control"
                                        placeholder={t("Write a note...")}
                                        value={newNoteContent}
                                        onChange={(e) => setNewNoteContent(e.target.value)}
                                    />
                                    <button type="submit" className="btn btn-primary" disabled={!newNoteContent.trim()}>
                                        <i className="bi bi-send"></i>
                                    </button>
                                </form>
                            </div>
                        </div>
                    )}
                </div>

                <div className="modal-footer bg-light">
                    <button type="button" className="btn btn-outline-secondary" onClick={handleClose}>
                        {t("Close")}
                    </button>
                    {activeTab === 'details' && (
                        <button
                            type="button"
                            className="btn btn-primary"
                            onClick={handleSave}
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? t("Saving...") : (task ? t("Update") : t("Create Task"))}
                        </button>
                    )}
                </div>
            </div>
        </PortalModal>
    );
}
