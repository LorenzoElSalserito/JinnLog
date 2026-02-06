package com.lorenzodm.jinnlog.repository;

import com.lorenzodm.jinnlog.core.entity.Note;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NoteRepository extends JpaRepository<Note, String> {
    List<Note> findByOwnerIdAndParentTypeAndParentIdAndDeletedAtIsNullOrderByUpdatedAtDesc(String ownerId, Note.ParentType parentType, String parentId);
    List<Note> findByOwnerIdAndDeletedAtIsNullOrderByUpdatedAtDesc(String ownerId);
    List<Note> findByOwnerIdAndDeletedAtIsNullAndTitleContainingIgnoreCaseOrContentContainingIgnoreCase(String ownerId, String title, String content);
    
    // Contextual retrieval (Task/Project specific)
    List<Note> findByParentTypeAndParentIdAndDeletedAtIsNullOrderByCreatedAtAsc(Note.ParentType parentType, String parentId);

    // Feed queries (Project scope)
    List<Note> findByProjectIdInAndDeletedAtIsNullOrderByUpdatedAtDesc(List<String> projectIds);
    List<Note> findByProjectIdInAndOwnerIdNotAndDeletedAtIsNullOrderByUpdatedAtDesc(List<String> projectIds, String ownerId);
}
