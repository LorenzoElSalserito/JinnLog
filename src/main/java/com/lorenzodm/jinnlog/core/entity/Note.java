package com.lorenzodm.jinnlog.core.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.SQLDelete;
import org.hibernate.annotations.UpdateTimestamp;
import org.hibernate.annotations.Where;

import java.time.Instant;
import java.util.HashSet;
import java.util.Objects;
import java.util.Set;
import java.util.UUID;

/**
 * Represents a structured note associated with a Task or Project.
 * <p>
 * Notes are used for logging updates, comments, or structured information
 * related to a specific context (parent). They support Markdown for rich text formatting.
 * </p>
 *
 * @author Lorenzo DM
 * @since 0.5.0
 * @version 0.5.2
 */
@Entity
@Table(name = "notes", indexes = {
        @Index(name = "idx_note_parent", columnList = "parent_type, parent_id"),
        @Index(name = "idx_note_owner", columnList = "owner_id"),
        @Index(name = "idx_note_project_updated", columnList = "project_id, updated_at")
})
@SQLDelete(sql = "UPDATE notes SET deleted_at = CURRENT_TIMESTAMP WHERE id = ?")
@Where(clause = "deleted_at IS NULL")
public class Note extends BaseSyncEntity {

    /**
     * Defines the type of entity this note is attached to.
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
    @Column(name = "parent_type", nullable = false, length = 20)
    private ParentType parentType;

    @Column(name = "parent_id", nullable = false, length = 36)
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
}
