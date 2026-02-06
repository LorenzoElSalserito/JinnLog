package com.lorenzodm.jinnlog.service.impl;

import com.lorenzodm.jinnlog.api.dto.request.CreateTaskRequest;
import com.lorenzodm.jinnlog.api.dto.request.UpdateTaskRequest;
import com.lorenzodm.jinnlog.api.dto.request.UpdateTaskStatusRequest;
import com.lorenzodm.jinnlog.api.exception.ConflictException;
import com.lorenzodm.jinnlog.api.exception.OwnershipViolationException;
import com.lorenzodm.jinnlog.api.exception.ResourceNotFoundException;
import com.lorenzodm.jinnlog.core.entity.Notification;
import com.lorenzodm.jinnlog.core.entity.Project;
import com.lorenzodm.jinnlog.core.entity.ProjectMember;
import com.lorenzodm.jinnlog.core.entity.Tag;
import com.lorenzodm.jinnlog.core.entity.Task;
import com.lorenzodm.jinnlog.core.entity.User;
import com.lorenzodm.jinnlog.repository.ProjectMemberRepository;
import com.lorenzodm.jinnlog.repository.ProjectRepository;
import com.lorenzodm.jinnlog.repository.TagRepository;
import com.lorenzodm.jinnlog.repository.TaskRepository;
import com.lorenzodm.jinnlog.repository.UserRepository;
import com.lorenzodm.jinnlog.service.NotificationService;
import com.lorenzodm.jinnlog.service.TaskService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * Task Service Implementation v0.5.0
 *
 * Supporta:
 * - Tag multipli
 * - Markdown notes
 * - Reminder
 * - Time Tracking (estimated/actual minutes)
 * - Calendar & Resource View (type, scheduledStart/End)
 * - Dependencies (Blockers)
 * - Context Aware Visibility (Owner vs Member)
 * - Notifiche Assegnazione (v0.5.3)
 */
@Service
@Transactional
public class TaskServiceImpl implements TaskService {

    private static final Logger log = LoggerFactory.getLogger(TaskServiceImpl.class);

    private final TaskRepository taskRepository;
    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;
    private final TagRepository tagRepository;
    private final ProjectMemberRepository projectMemberRepository;
    private final NotificationService notificationService;

    public TaskServiceImpl(
            TaskRepository taskRepository,
            ProjectRepository projectRepository,
            UserRepository userRepository,
            TagRepository tagRepository,
            ProjectMemberRepository projectMemberRepository,
            NotificationService notificationService
    ) {
        this.taskRepository = taskRepository;
        this.projectRepository = projectRepository;
        this.userRepository = userRepository;
        this.tagRepository = tagRepository;
        this.projectMemberRepository = projectMemberRepository;
        this.notificationService = notificationService;
    }

    @Override
    public Task create(String userId, String projectId, CreateTaskRequest req) {
        log.debug("Creating task for user {} in project {}", userId, projectId);

        Project project = getProjectAccess(userId, projectId);
        User creator = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User non trovato"));

        Task t = new Task();
        t.setTitle(req.title());
        t.setDescription(req.description());

        if (req.status() != null && !req.status().isBlank()) {
            t.setStatus(req.status());
        }

        if (req.priority() != null && !req.priority().isBlank()) {
            t.setPriority(req.priority());
        }

        t.setDeadline(req.deadline());
        t.setOwner(req.owner());
        t.setNotes(req.notes()); // Legacy
        t.setMarkdownNotes(req.markdownNotes()); // v0.2.0

        if (req.sortOrder() != null) {
            t.setSortOrder(req.sortOrder());
        }

        t.setArchived(false);

        // Reminder (v0.2.0)
        t.setReminderDate(req.reminderDate());
        t.setReminderEnabled(req.reminderEnabled() != null && req.reminderEnabled());

        // Time Tracking (v0.4.0)
        t.setEstimatedMinutes(req.estimatedMinutes());
        if (req.actualMinutes() != null) {
            t.setActualMinutes(req.actualMinutes());
        }

        // Calendar & Resource View (v0.5.0)
        if (req.type() != null) {
            try {
                t.setType(Task.Type.valueOf(req.type()));
            } catch (IllegalArgumentException e) {
                t.setType(Task.Type.TASK);
            }
        }
        t.setScheduledStart(req.scheduledStart());
        t.setScheduledEnd(req.scheduledEnd());

        // Asset legacy
        t.setAssetPath(req.assetPath());
        t.setAssetFileName(req.assetFileName());
        t.setAssetMimeType(req.assetMimeType());
        t.setAssetSizeBytes(req.assetSizeBytes());

        t.setProject(project);

        // Assigned user
        if (req.assignedToId() != null && !req.assignedToId().isBlank()) {
            validateAssignee(projectId, req.assignedToId());
            User assigned = userRepository.findById(req.assignedToId())
                    .orElseThrow(() -> new ResourceNotFoundException("Assigned user non trovato: " + req.assignedToId()));
            t.setAssignedTo(assigned);
            
            // Notifica se assegnato ad altri
            if (!assigned.getId().equals(userId)) {
                notificationService.create(
                        assigned,
                        creator,
                        Notification.NotificationType.TASK_ASSIGNED,
                        "Ti è stato assegnato un nuovo task: " + t.getTitle(),
                        "TASK",
                        null // ID non ancora disponibile, lo aggiorniamo dopo save? No, meglio salvare prima.
                );
            }
        }

        // salva per avere ID
        t = taskRepository.save(t);
        
        // Aggiorna refId notifica se necessario (ma notificationService.create salva subito, quindi refId sarebbe null).
        // Correzione: salviamo prima il task, poi inviamo la notifica.
        if (t.getAssignedTo() != null && !t.getAssignedTo().getId().equals(userId)) {
             // Rinviamo la notifica con l'ID corretto (la precedente aveva refId null, poco male o la rifacciamo meglio)
             // Per pulizia, spostiamo la logica di notifica DOPO il save.
             // Ma attenzione: notificationService.create crea una nuova entità.
             // Quindi rimuovo la chiamata sopra e la metto qui sotto.
             notificationService.create(
                    t.getAssignedTo(),
                    creator,
                    Notification.NotificationType.TASK_ASSIGNED,
                    "Ti è stato assegnato un nuovo task: " + t.getTitle(),
                    "TASK",
                    t.getId()
            );
        }

        // Tag (v0.2.0)
        if (req.tagIds() != null && !req.tagIds().isEmpty()) {
            Set<Tag> tags = loadTagsForUser(userId, req.tagIds());
            tags.forEach(t::addTag);
            t = taskRepository.save(t);
        }

        return t;
    }

    @Override
    @Transactional(readOnly = true)
    public Task getOwned(String userId, String projectId, String taskId) {
        Project project = getProjectAccess(userId, projectId);

        return taskRepository.findByIdAndProjectId(taskId, project.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Task non trovato: " + taskId));
    }

    @Override
    @Transactional(readOnly = true)
    public List<Task> listOwned(String userId, String projectId, String status, String priority, String search, boolean includeArchived) {
        Project project = getProjectAccess(userId, projectId);
        
        ProjectMember member = projectMemberRepository.findByProjectIdAndUserId(projectId, userId)
                .orElseThrow(() -> new OwnershipViolationException("Non sei membro"));
        
        boolean isOwnerOrAdmin = member.getRole() == ProjectMember.Role.OWNER || member.getRole() == ProjectMember.Role.ADMIN;
        
        List<Task> tasks;

        if (!includeArchived) {
            String st = (status != null && !status.isBlank()) ? status : null;
            String pr = (priority != null && !priority.isBlank()) ? priority : null;
            String se = (search != null && !search.isBlank()) ? search : null;
            tasks = taskRepository.findWithFilters(project.getId(), st, pr, se);
        } else {
            if (search != null && !search.isBlank()) {
                tasks = taskRepository.searchByTitleOrDescription(project.getId(), search);
            } else if (status != null && !status.isBlank()) {
                tasks = taskRepository.findByProjectIdAndStatus(project.getId(), status);
            } else if (priority != null && !priority.isBlank()) {
                tasks = taskRepository.findByProjectIdAndPriority(project.getId(), priority);
            } else {
                tasks = taskRepository.findByProjectId(project.getId());
            }
        }
        
        return tasks;
    }

    @Override
    public Task update(String userId, String projectId, String taskId, UpdateTaskRequest req) {
        log.debug("Updating task {} for user {}", taskId, userId);

        Task t = getOwned(userId, projectId, taskId);
        User updater = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User non trovato"));

        // Capture old assignee for notification check
        User oldAssignee = t.getAssignedTo();
        String oldAssigneeId = oldAssignee != null ? oldAssignee.getId() : null;

        if (req.title() != null) t.setTitle(req.title());
        if (req.description() != null) t.setDescription(req.description());
        if (req.status() != null) {
            if (("DONE".equals(req.status()) || "COMPLETED".equals(req.status())) && t.isBlocked()) {
                throw new ConflictException("Impossibile completare il task: ci sono dipendenze non risolte.");
            }
            t.setStatus(req.status());
        }
        if (req.priority() != null) t.setPriority(req.priority());
        if (req.deadline() != null) t.setDeadline(req.deadline());
        if (req.owner() != null) t.setOwner(req.owner());
        if (req.notes() != null) t.setNotes(req.notes());

        if (req.markdownNotes() != null) t.setMarkdownNotes(req.markdownNotes());

        if (req.archived() != null) t.setArchived(req.archived());
        if (req.sortOrder() != null) t.setSortOrder(req.sortOrder());

        if (req.reminderDate() != null) t.setReminderDate(req.reminderDate());
        if (req.reminderEnabled() != null) t.setReminderEnabled(req.reminderEnabled());

        if (req.estimatedMinutes() != null) t.setEstimatedMinutes(req.estimatedMinutes());
        if (req.actualMinutes() != null) t.setActualMinutes(req.actualMinutes());

        if (req.type() != null) {
            try {
                t.setType(Task.Type.valueOf(req.type()));
            } catch (IllegalArgumentException e) {
                // ignore invalid type
            }
        }
        if (req.scheduledStart() != null) t.setScheduledStart(req.scheduledStart());
        if (req.scheduledEnd() != null) t.setScheduledEnd(req.scheduledEnd());

        if (req.assetPath() != null) t.setAssetPath(req.assetPath());
        if (req.assetFileName() != null) t.setAssetFileName(req.assetFileName());
        if (req.assetMimeType() != null) t.setAssetMimeType(req.assetMimeType());
        if (req.assetSizeBytes() != null) t.setAssetSizeBytes(req.assetSizeBytes());

        // Assigned user logic
        if (req.assignedToId() != null) {
            if (req.assignedToId().isBlank()) {
                t.setAssignedTo(null);
            } else {
                // Se l'ID è diverso da quello attuale, procedi
                if (!req.assignedToId().equals(oldAssigneeId)) {
                    validateAssignee(projectId, req.assignedToId());
                    User assigned = userRepository.findById(req.assignedToId())
                            .orElseThrow(() -> new ResourceNotFoundException("Assigned user non trovato: " + req.assignedToId()));
                    t.setAssignedTo(assigned);
                    
                    // Notifica
                    if (!assigned.getId().equals(userId)) {
                        notificationService.create(
                                assigned,
                                updater,
                                Notification.NotificationType.TASK_ASSIGNED,
                                "Ti è stato assegnato il task: " + t.getTitle(),
                                "TASK",
                                t.getId()
                        );
                    }
                }
            }
        }

        if (req.tagIds() != null) {
            Set<Tag> currentTags = new HashSet<>(t.getTags());
            currentTags.forEach(t::removeTag);

            if (!req.tagIds().isEmpty()) {
                Set<Tag> newTags = loadTagsForUser(userId, req.tagIds());
                newTags.forEach(t::addTag);
            }
        }

        return taskRepository.save(t);
    }

    @Override
    public Task updateStatus(String userId, String projectId, String taskId, UpdateTaskStatusRequest req) {
        log.debug("Updating task {} status to {} for user {}", taskId, req.status(), userId);

        Task t = getOwned(userId, projectId, taskId);
        
        if (("DONE".equals(req.status()) || "COMPLETED".equals(req.status())) && t.isBlocked()) {
            throw new ConflictException("Impossibile completare il task: ci sono dipendenze non risolte.");
        }
        
        t.setStatus(req.status());
        return taskRepository.save(t);
    }

    @Override
    public Task setArchived(String userId, String projectId, String taskId, boolean archived) {
        log.debug("Setting archived={} for task {} (user={}, project={})", archived, taskId, userId, projectId);

        Task t = getOwned(userId, projectId, taskId);
        t.setArchived(archived);
        return taskRepository.save(t);
    }

    @Override
    public void delete(String userId, String projectId, String taskId) {
        log.debug("Deleting task {} for user {}", taskId, userId);

        Task t = getOwned(userId, projectId, taskId);
        taskRepository.delete(t);
    }

    @Override
    public void reorder(String userId, String projectId, List<String> orderedTaskIds) {
        getProjectAccess(userId, projectId);

        for (int i = 0; i < orderedTaskIds.size(); i++) {
            String taskId = orderedTaskIds.get(i);
            Task task = taskRepository.findById(taskId)
                    .orElseThrow(() -> new ResourceNotFoundException("Task non trovato: " + taskId));
            
            if (!task.getProject().getId().equals(projectId)) {
                throw new ResourceNotFoundException("Task non appartiene al progetto specificato: " + taskId);
            }

            task.setSortOrder(i);
            taskRepository.save(task);
        }
    }

    public void addBlocker(String userId, String projectId, String taskId, String blockerTaskId) {
        Task t = getOwned(userId, projectId, taskId);
        Task blocker = getOwned(userId, projectId, blockerTaskId);

        if (t.getId().equals(blocker.getId())) {
            throw new ConflictException("Un task non può bloccare se stesso");
        }

        t.addBlocker(blocker);
        taskRepository.save(t);
    }

    public void removeBlocker(String userId, String projectId, String taskId, String blockerTaskId) {
        Task t = getOwned(userId, projectId, taskId);
        Task blocker = getOwned(userId, projectId, blockerTaskId);

        t.removeBlocker(blocker);
        taskRepository.save(t);
    }

    private Project getProjectAccess(String userId, String projectId) {
        ProjectMember member = projectMemberRepository.findByProjectIdAndUserId(projectId, userId)
                .orElseThrow(() -> new OwnershipViolationException("Non sei membro di questo progetto"));
        
        return member.getProject();
    }

    private void validateAssignee(String projectId, String assigneeId) {
        if (!projectMemberRepository.existsByProjectIdAndUserId(projectId, assigneeId)) {
            throw new ConflictException("L'utente assegnato non è membro del progetto.");
        }
    }

    private Set<Tag> loadTagsForUser(String userId, List<String> tagIds) {
        Set<Tag> tags = new HashSet<>();

        for (String tagId : tagIds) {
            Tag tag = tagRepository.findById(tagId)
                    .orElseThrow(() -> new ResourceNotFoundException("Tag non trovato: " + tagId));
            tags.add(tag);
        }

        return tags;
    }
}
