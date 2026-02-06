package com.lorenzodm.jinnlog.service.impl;

import com.lorenzodm.jinnlog.api.dto.request.CreateNoteRequest;
import com.lorenzodm.jinnlog.api.dto.request.UpdateNoteRequest;
import com.lorenzodm.jinnlog.api.exception.ForbiddenException;
import com.lorenzodm.jinnlog.api.exception.OwnershipViolationException;
import com.lorenzodm.jinnlog.api.exception.ResourceNotFoundException;
import com.lorenzodm.jinnlog.core.entity.*;
import com.lorenzodm.jinnlog.repository.*;
import com.lorenzodm.jinnlog.service.NoteService;
import com.lorenzodm.jinnlog.service.NotificationService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@Transactional
public class NoteServiceImpl implements NoteService {

    private final NoteRepository noteRepository;
    private final UserRepository userRepository;
    private final TagRepository tagRepository;
    private final TaskRepository taskRepository;
    private final ProjectMemberRepository projectMemberRepository;
    private final NotificationService notificationService;

    public NoteServiceImpl(NoteRepository noteRepository, UserRepository userRepository, TagRepository tagRepository,
                           TaskRepository taskRepository, ProjectMemberRepository projectMemberRepository,
                           NotificationService notificationService) {
        this.noteRepository = noteRepository;
        this.userRepository = userRepository;
        this.tagRepository = tagRepository;
        this.taskRepository = taskRepository;
        this.projectMemberRepository = projectMemberRepository;
        this.notificationService = notificationService;
    }

    // =================================================================================
    // METODI CONTESTUALI (TASK / PROJECT)
    // =================================================================================

    @Override
    public Note createForTask(String userId, String taskId, CreateNoteRequest request) {
        return createInternal(userId, Note.ParentType.TASK, taskId, request);
    }

    @Override
    public Note createForProject(String userId, String projectId, CreateNoteRequest request) {
        return createInternal(userId, Note.ParentType.PROJECT, projectId, request);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Note> listForTask(String userId, String taskId) {
        verifyContextAccess(userId, Note.ParentType.TASK, taskId);
        return noteRepository.findByParentTypeAndParentIdAndDeletedAtIsNullOrderByCreatedAtAsc(Note.ParentType.TASK, taskId);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Note> listForProject(String userId, String projectId) {
        verifyContextAccess(userId, Note.ParentType.PROJECT, projectId);
        return noteRepository.findByParentTypeAndParentIdAndDeletedAtIsNullOrderByCreatedAtAsc(Note.ParentType.PROJECT, projectId);
    }

    // =================================================================================
    // METODI CRUD SU SINGOLA NOTA (CON SICUREZZA RAFFORZATA)
    // =================================================================================

    @Override
    @Transactional(readOnly = true)
    public Note get(String userId, String noteId) {
        Note note = noteRepository.findById(noteId)
                .orElseThrow(() -> new ResourceNotFoundException("Nota non trovata: " + noteId));
        
        if (note.getDeletedAt() != null) {
            throw new ResourceNotFoundException("Nota non trovata (eliminata)");
        }

        // ANTI-IDOR: Verifica accesso al contesto
        verifyContextAccess(userId, note.getParentType(), note.getParentId());
        
        return note;
    }

    @Override
    public Note update(String userId, String noteId, UpdateNoteRequest request) {
        Note note = noteRepository.findById(noteId)
                .orElseThrow(() -> new ResourceNotFoundException("Nota non trovata: " + noteId));

        if (note.getDeletedAt() != null) {
            throw new ResourceNotFoundException("Nota non trovata (eliminata)");
        }

        // ANTI-IDOR: Verifica accesso al contesto (anche se sei owner, devi avere ancora accesso)
        verifyContextAccess(userId, note.getParentType(), note.getParentId());

        // OWNERSHIP: Solo owner può modificare
        if (!note.getOwner().getId().equals(userId)) {
            throw new OwnershipViolationException("Non puoi modificare una nota di un altro utente");
        }

        // WHITELIST UPDATE: Solo title e content
        if (request.title() != null) note.setTitle(request.title());
        if (request.content() != null) note.setContent(request.content());

        if (request.tagIds() != null) {
            Set<Tag> tags = loadTagsForUser(userId, request.tagIds());
            note.setTags(tags);
        }

        return noteRepository.save(note);
    }

    @Override
    public void delete(String userId, String noteId) {
        Note note = noteRepository.findById(noteId)
                .orElseThrow(() -> new ResourceNotFoundException("Nota non trovata: " + noteId));

        if (note.getDeletedAt() != null) {
            return; // Already deleted
        }

        // ANTI-IDOR: Verifica accesso al contesto
        verifyContextAccess(userId, note.getParentType(), note.getParentId());

        // OWNERSHIP: Solo owner può eliminare
        if (!note.getOwner().getId().equals(userId)) {
            throw new OwnershipViolationException("Non puoi eliminare una nota di un altro utente");
        }
        
        // Soft delete
        note.setDeletedAt(Instant.now());
        noteRepository.save(note);
    }

    // =================================================================================
    // FEED E RICERCA
    // =================================================================================

    @Override
    @Transactional(readOnly = true)
    public List<Note> search(String userId, String query) {
        // TODO: Implementare ricerca sicura (filtrando per progetti accessibili)
        // Per ora manteniamo compatibilità ma è un punto da migliorare
        if (query == null || query.isBlank()) {
            return noteRepository.findByOwnerIdAndDeletedAtIsNullOrderByUpdatedAtDesc(userId);
        }
        return noteRepository.findByOwnerIdAndDeletedAtIsNullAndTitleContainingIgnoreCaseOrContentContainingIgnoreCase(userId, query, query);
    }
    
    @Override
    @Transactional(readOnly = true)
    public List<Note> getFeed(String userId, String scope, String parentType, String parentId) {
        List<String> projectIds = projectMemberRepository.findByUserId(userId).stream()
                .map(pm -> pm.getProject().getId())
                .collect(Collectors.toList());
        
        if (projectIds.isEmpty()) {
            return new ArrayList<>();
        }

        if ("INBOX".equalsIgnoreCase(scope)) {
            return noteRepository.findByProjectIdInAndOwnerIdNotAndDeletedAtIsNullOrderByUpdatedAtDesc(projectIds, userId);
        } else if ("SENT".equalsIgnoreCase(scope)) {
            return noteRepository.findByOwnerIdAndDeletedAtIsNullOrderByUpdatedAtDesc(userId);
        } else {
            return noteRepository.findByProjectIdInAndDeletedAtIsNullOrderByUpdatedAtDesc(projectIds);
        }
    }

    // =================================================================================
    // METODI DEPRECATI / COMPATIBILITÀ
    // =================================================================================

    @Override
    public Note create(String userId, String parentTypeStr, String parentId, CreateNoteRequest request) {
        Note.ParentType parentType = Note.ParentType.valueOf(parentTypeStr);
        return createInternal(userId, parentType, parentId, request);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Note> list(String userId, String parentType, String parentId) {
        if (parentType != null && parentId != null) {
            Note.ParentType type = Note.ParentType.valueOf(parentType);
            verifyContextAccess(userId, type, parentId);
            return noteRepository.findByParentTypeAndParentIdAndDeletedAtIsNullOrderByCreatedAtAsc(type, parentId);
        }
        // Fallback legacy
        return noteRepository.findByOwnerIdAndDeletedAtIsNullOrderByUpdatedAtDesc(userId);
    }

    // =================================================================================
    // HELPER PRIVATI
    // =================================================================================

    private Note createInternal(String userId, Note.ParentType parentType, String parentId, CreateNoteRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User non trovato: " + userId));

        // 1. Verifica accesso e risoluzione Project ID
        String projectId = resolveProjectIdAndVerifyAccess(userId, parentType, parentId);

        // 2. Creazione Nota
        Note note = new Note();
        note.setTitle(request.title());
        note.setContent(request.content());
        note.setParentType(parentType);
        note.setParentId(parentId);
        note.setOwner(user);
        note.setProjectId(projectId); // Denormalized field

        if (request.tagIds() != null && !request.tagIds().isEmpty()) {
            Set<Tag> tags = loadTagsForUser(userId, request.tagIds());
            note.setTags(tags);
        }

        Note savedNote = noteRepository.save(note);
        
        // 3. Notifiche
        triggerNotifications(savedNote, user, projectId);
        
        return savedNote;
    }

    private String resolveProjectIdAndVerifyAccess(String userId, Note.ParentType parentType, String parentId) {
        String projectId = null;
        if (parentType == Note.ParentType.TASK) {
            Task task = taskRepository.findById(parentId)
                    .orElseThrow(() -> new ResourceNotFoundException("Task non trovato: " + parentId));
            projectId = task.getProject().getId();
        } else if (parentType == Note.ParentType.PROJECT) {
            projectId = parentId;
        }

        if (projectId == null) {
            throw new IllegalArgumentException("Impossibile determinare il progetto per il contesto: " + parentType);
        }

        // Check membership
        if (projectMemberRepository.findByProjectIdAndUserId(projectId, userId).isEmpty()) {
            throw new ForbiddenException("Non hai accesso al contesto (Progetto/Task)");
        }
        
        return projectId;
    }

    private void verifyContextAccess(String userId, Note.ParentType parentType, String parentId) {
        resolveProjectIdAndVerifyAccess(userId, parentType, parentId);
    }

    private void triggerNotifications(Note note, User author, String projectId) {
        if (projectId == null) return;

        List<ProjectMember> members = projectMemberRepository.findByProjectId(projectId);
        
        String contextName = (note.getParentType() == Note.ParentType.TASK) ? "un task" : "un progetto";
        
        for (ProjectMember member : members) {
            if (!member.getUser().getId().equals(author.getId())) {
                notificationService.create(
                    member.getUser(),
                    author,
                    Notification.NotificationType.NEW_NOTE,
                    author.getDisplayName() + " ha commentato su " + contextName,
                    note.getParentType().name(),
                    note.getParentId()
                );
            }
        }
    }

    private Set<Tag> loadTagsForUser(String userId, List<String> tagIds) {
        Set<Tag> tags = new HashSet<>();
        for (String tagId : tagIds) {
            Tag tag = tagRepository.findById(tagId)
                    .orElseThrow(() -> new ResourceNotFoundException("Tag non trovato: " + tagId));
            if (!tag.getOwner().getId().equals(userId)) {
                throw new OwnershipViolationException("Tag non appartiene all'utente: " + tagId);
            }
            tags.add(tag);
        }
        return tags;
    }
}
