import { useState, useEffect } from "react";
import { Modal, Button, Form, Badge, ListGroup, InputGroup } from "react-bootstrap";
import { FiPlus, FiEdit2, FiTrash2, FiTag, FiSearch } from "react-icons/fi";
import { toast } from "react-toastify";
import { jinn } from "../api/jinn.js";

/**
 * TagManager - Componente per gestione tag
 * 
 * Features:
 * - Lista tag esistenti
 * - Creazione nuovo tag
 * - Modifica tag (nome, colore)
 * - Eliminazione tag
 * - Ricerca tag
 * - Statistiche utilizzo
 * 
 * @author Lorenzo DM
 * @since 0.2.0
 */
export default function TagManager({ show, onHide }) {
    const [tags, setTags] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [newTagName, setNewTagName] = useState("");
    const [newTagColor, setNewTagColor] = useState("#3cb6ff");
    const [editingTag, setEditingTag] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    // Colori predefiniti
    const predefinedColors = [
        "#dc3545", // Rosso
        "#fd7e14", // Arancione
        "#ffc107", // Giallo
        "#28a745", // Verde
        "#20c997", // Turchese
        "#17a2b8", // Azzurro
        "#007bff", // Blu
        "#6610f2", // Viola
        "#e83e8c", // Rosa
        "#6c757d", // Grigio
    ];

    useEffect(() => {
        if (show) {
            loadTags();
        }
    }, [show]);

    const loadTags = async () => {
        setIsLoading(true);
        try {
            const data = await jinn.tagsList();
            setTags(data);
        } catch (error) {
            console.error("Errore caricamento tag:", error);
            toast.error("Errore durante il caricamento dei tag");
        } finally {
            setIsLoading(false);
        }
    };

    const handleCreateTag = async () => {
        if (!newTagName.trim()) {
            toast.error("Inserisci un nome per il tag");
            return;
        }

        try {
            await jinn.tagsCreate(newTagName.trim(), newTagColor);
            toast.success("Tag creato!");
            setNewTagName("");
            setNewTagColor("#3cb6ff");
            await loadTags();
        } catch (error) {
            console.error("Errore creazione tag:", error);
            toast.error("Errore durante la creazione del tag");
        }
    };

    const handleUpdateTag = async () => {
        if (!editingTag) return;

        try {
            await jinn.tagsUpdate(editingTag.id, {
                name: editingTag.name,
                color: editingTag.color,
            });
            toast.success("Tag aggiornato!");
            setEditingTag(null);
            await loadTags();
        } catch (error) {
            console.error("Errore aggiornamento tag:", error);
            toast.error("Errore durante l'aggiornamento del tag");
        }
    };

    const handleDeleteTag = async (tagId, tagName) => {
        const confirm = window.confirm(
            `Eliminare il tag "${tagName}"? VerrÃ  rimosso da tutti i task.`
        );
        if (!confirm) return;

        try {
            await jinn.tagsDelete(tagId);
            toast.success("Tag eliminato!");
            await loadTags();
        } catch (error) {
            console.error("Errore eliminazione tag:", error);
            toast.error("Errore durante l'eliminazione del tag");
        }
    };

    const filteredTags = tags.filter((tag) =>
        tag.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <Modal show={show} onHide={onHide} size="lg" centered>
            <Modal.Header closeButton className="bg-dark text-light border-secondary">
                <Modal.Title>
                    <FiTag className="me-2" />
                    Gestione Tag
                </Modal.Title>
            </Modal.Header>

            <Modal.Body className="bg-dark text-light">
                {/* Crea nuovo tag */}
                <div className="mb-4">
                    <h6 className="mb-3">Nuovo Tag</h6>
                    <InputGroup className="mb-2">
                        <Form.Control
                            type="text"
                            placeholder="Nome tag..."
                            value={newTagName}
                            onChange={(e) => setNewTagName(e.target.value)}
                            onKeyPress={(e) => {
                                if (e.key === "Enter") handleCreateTag();
                            }}
                            className="bg-dark text-light border-secondary"
                        />
                        <Form.Control
                            type="color"
                            value={newTagColor}
                            onChange={(e) => setNewTagColor(e.target.value)}
                            className="bg-dark border-secondary"
                            style={{ maxWidth: "60px" }}
                        />
                        <Button variant="primary" onClick={handleCreateTag}>
                            <FiPlus /> Crea
                        </Button>
                    </InputGroup>

                    {/* Colori predefiniti */}
                    <div className="d-flex gap-2 flex-wrap">
                        {predefinedColors.map((color) => (
                            <div
                                key={color}
                                onClick={() => setNewTagColor(color)}
                                style={{
                                    width: "30px",
                                    height: "30px",
                                    backgroundColor: color,
                                    borderRadius: "6px",
                                    cursor: "pointer",
                                    border:
                                        newTagColor === color
                                            ? "3px solid white"
                                            : "2px solid transparent",
                                }}
                                title={color}
                            />
                        ))}
                    </div>
                </div>

                {/* Ricerca */}
                <div className="mb-3">
                    <InputGroup>
                        <InputGroup.Text className="bg-dark text-light border-secondary">
                            <FiSearch />
                        </InputGroup.Text>
                        <Form.Control
                            type="text"
                            placeholder="Cerca tag..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="bg-dark text-light border-secondary"
                        />
                    </InputGroup>
                </div>

                {/* Lista tag */}
                <div>
                    <h6 className="mb-2">
                        Tag Esistenti ({filteredTags.length})
                    </h6>
                    {isLoading ? (
                        <p className="text-center text-secondary">
                            Caricamento...
                        </p>
                    ) : filteredTags.length === 0 ? (
                        <p className="text-center text-secondary">
                            Nessun tag trovato
                        </p>
                    ) : (
                        <ListGroup>
                            {filteredTags.map((tag) => (
                                <ListGroup.Item
                                    key={tag.id}
                                    className="bg-dark text-light border-secondary d-flex justify-content-between align-items-center"
                                >
                                    {editingTag?.id === tag.id ? (
                                        // ModalitÃ  edit
                                        <div className="d-flex gap-2 flex-grow-1">
                                            <Form.Control
                                                type="text"
                                                value={editingTag.name}
                                                onChange={(e) =>
                                                    setEditingTag({
                                                        ...editingTag,
                                                        name: e.target.value,
                                                    })
                                                }
                                                className="bg-dark text-light border-secondary"
                                            />
                                            <Form.Control
                                                type="color"
                                                value={editingTag.color}
                                                onChange={(e) =>
                                                    setEditingTag({
                                                        ...editingTag,
                                                        color: e.target.value,
                                                    })
                                                }
                                                className="bg-dark border-secondary"
                                                style={{ maxWidth: "60px" }}
                                            />
                                            <Button
                                                variant="success"
                                                size="sm"
                                                onClick={handleUpdateTag}
                                            >
                                                Salva
                                            </Button>
                                            <Button
                                                variant="secondary"
                                                size="sm"
                                                onClick={() =>
                                                    setEditingTag(null)
                                                }
                                            >
                                                Annulla
                                            </Button>
                                        </div>
                                    ) : (
                                        // ModalitÃ  visualizzazione
                                        <>
                                            <div className="d-flex align-items-center gap-2">
                                                <Badge
                                                    style={{
                                                        backgroundColor:
                                                            tag.color,
                                                        fontSize: "1rem",
                                                        padding: "8px 12px",
                                                    }}
                                                >
                                                    {tag.name}
                                                </Badge>
                                                {tag.taskCount > 0 && (
                                                    <small className="text-secondary">
                                                        {tag.taskCount}{" "}
                                                        task
                                                    </small>
                                                )}
                                            </div>
                                            <div className="d-flex gap-2">
                                                <Button
                                                    variant="outline-light"
                                                    size="sm"
                                                    onClick={() =>
                                                        setEditingTag(tag)
                                                    }
                                                >
                                                    <FiEdit2 />
                                                </Button>
                                                <Button
                                                    variant="outline-danger"
                                                    size="sm"
                                                    onClick={() =>
                                                        handleDeleteTag(
                                                            tag.id,
                                                            tag.name
                                                        )
                                                    }
                                                >
                                                    <FiTrash2 />
                                                </Button>
                                            </div>
                                        </>
                                    )}
                                </ListGroup.Item>
                            ))}
                        </ListGroup>
                    )}
                </div>
            </Modal.Body>

            <Modal.Footer className="bg-dark text-light border-secondary">
                <Button variant="secondary" onClick={onHide}>
                    Chiudi
                </Button>
            </Modal.Footer>
        </Modal>
    );
}
