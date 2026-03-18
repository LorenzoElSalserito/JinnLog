package com.lorenzodm.jinnlog.core.entity;

import jakarta.persistence.*;
import org.hibernate.annotations.SQLDelete;
import org.hibernate.annotations.Where;

import java.util.HashSet;
import java.util.Set;

/**
 * Represents a structured note within the system.
 * <p>
 * Notes are used for logging updates, comments, or structured information.
 * They support Markdown for rich text formatting and can be linked to multiple
 * domain entities (like Tasks, Projects, etc.) via the {@link NoteLink} entity,
 * making them a core part of the contextual knowledge layer.
 * </p>
 *
 * @author Lorenzo DM
 * @since 0.5.0
 * @version 1.0.0
 */
@Entity
@Table(name = "notes", indexes = {
        @Index(name = "idx_note_owner", columnList = "owner_id"),
        @Index(name = "idx_note_project_updated", columnList = "project_id, updated_at"),
        @Index(name = "idx_note_parent", columnList = "parent_type, parent_id")
})
@SQLDelete(sql = "UPDATE notes SET deleted_at = CURRENT_TIMESTAMP WHERE id = ?")
@Where(clause = "deleted_at IS NULL")
public class Note extends BaseSyncEntity {

    /**
     * Defines the type of entity this note is directly attached to.
     * This is the primary (single-parent) context for a note.
     * For polymorphic links to multiple entities, use {@link NoteLink}.
     */
    public enum ParentType {
        TASK,
        PROJECT
    }

    @Column(length = 200)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String content; // Markdown content

    @Enumerated(EnumType.STRING)
    @Column(name = "parent_type", length = 20)
    private ParentType parentType;

    @Column(name = "parent_id", length = 36)
    private String parentId;

    @Column(name = "project_id", length = 36)
    private String projectId; // Denormalized for feed queries

    @Version
    private Long version;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "owner_id", nullable = false)
    private User owner;

    @ManyToMany(fetch = FetchType.LAZY, cascade = {CascadeType.PERSIST, CascadeType.MERGE})
    @JoinTable(
            name = "note_tags",
            joinColumns = @JoinColumn(name = "note_id"),
            inverseJoinColumns = @JoinColumn(name = "tag_id")
    )
    private Set<Tag> tags = new HashSet<>();

    @OneToMany(mappedBy = "note", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private Set<NoteLink> links = new HashSet<>();

    public Note() {
        super();
    }

    // Getters & Setters

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public ParentType getParentType() {
        return parentType;
    }

    public void setParentType(ParentType parentType) {
        this.parentType = parentType;
    }

    public String getParentId() {
        return parentId;
    }

    public void setParentId(String parentId) {
        this.parentId = parentId;
    }

    public String getProjectId() {
        return projectId;
    }

    public void setProjectId(String projectId) {
        this.projectId = projectId;
    }

    public User getOwner() {
        return owner;
    }

    public void setOwner(User owner) {
        this.owner = owner;
    }

    public Set<Tag> getTags() {
        return tags;
    }

    public void setTags(Set<Tag> tags) {
        this.tags = tags;
    }

    public Long getVersion() {
        return version;
    }

    public void setVersion(Long version) {
        this.version = version;
    }

    public Set<NoteLink> getLinks() {
        return links;
    }

    public void setLinks(Set<NoteLink> links) {
        this.links = links;
    }

    // Helper methods
    
    /**
     * Adds a link to another entity and maintains the bidirectional relationship.
     * @param link The NoteLink to add.
     */
    public void addLink(NoteLink link) {
        links.add(link);
        link.setNote(this);
    }

    /**
     * Removes a link to another entity.
     * @param link The NoteLink to remove.
     */
    public void removeLink(NoteLink link) {
        links.remove(link);
        link.setNote(null);
    }
}
