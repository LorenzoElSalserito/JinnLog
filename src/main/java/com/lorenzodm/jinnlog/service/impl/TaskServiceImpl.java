package com.lorenzodm.jinnlog.service.impl;

import com.lorenzodm.jinnlog.api.dto.request.CreateTaskRequest;
import com.lorenzodm.jinnlog.api.dto.request.UpdateTaskRequest;
import com.lorenzodm.jinnlog.api.dto.request.ChangeTaskStatusRequest;
import com.lorenzodm.jinnlog.api.exception.ConflictException;
import com.lorenzodm.jinnlog.api.exception.OwnershipViolationException;
import com.lorenzodm.jinnlog.api.exception.ResourceNotFoundException;
import com.lorenzodm.jinnlog.core.entity.Notification;
import com.lorenzodm.jinnlog.core.entity.Project;
import com.lorenzodm.jinnlog.core.entity.ProjectMember;
import com.lorenzodm.jinnlog.core.entity.Tag;
import com.lorenzodm.jinnlog.core.entity.Task;
import com.lorenzodm.jinnlog.core.entity.TaskPriority;
import com.lorenzodm.jinnlog.core.entity.TaskStatus;
import com.lorenzodm.jinnlog.core.entity.User;
import com.lorenzodm.jinnlog.repository.ProjectMemberRepository;
import com.lorenzodm.jinnlog.repository.ProjectRepository;
import com.lorenzodm.jinnlog.repository.TagRepository;
import com.lorenzodm.jinnlog.repository.TaskPriorityRepository;
import com.lorenzodm.jinnlog.repository.TaskRepository;
import com.lorenzodm.jinnlog.repository.TaskStatusRepository;
import com.lorenzodm.jinnlog.repository.UserRepository;
import com.lorenzodm.jinnlog.service.NotificationService;
import com.lorenzodm.jinnlog.service.PlanningEngine;
import com.lorenzodm.jinnlog.service.TaskService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.DayOfWeek;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
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
 * - Planning Engine Integration (PRD-08)
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
    private final TaskStatusRepository taskStatusRepository;
    private final TaskPriorityRepository taskPriorityRepository;
    private final PlanningEngine planningEngine;

    public TaskServiceImpl(
            TaskRepository taskRepository,
            ProjectRepository projectRepository,
            UserRepository userRepository,
            TagRepository tagRepository,
            ProjectMemberRepository projectMemberRepository,
            NotificationService notificationService,
            TaskStatusRepository taskStatusRepository,
            TaskPriorityRepository taskPriorityRepository,
            PlanningEngine planningEngine
    ) {
        this.taskRepository = taskRepository;
        this.projectRepository = projectRepository;
        this.userRepository = userRepository;
        this.tagRepository = tagRepository;
        this.projectMemberRepository = projectMemberRepository;
        this.notificationService = notificationService;
        this.taskStatusRepository = taskStatusRepository;
        this.taskPriorityRepository = taskPriorityRepository;
        this.planningEngine = planningEngine;
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

        // Status entity lookup
        if (req.statusId() != null && !req.statusId().isBlank()) {
            TaskStatus status = taskStatusRepository.findById(req.statusId())
                    .orElseThrow(() -> new ResourceNotFoundException("Stato non trovato: " + req.statusId()));
            t.setStatus(status);
        } else {
            // Default to TODO
            taskStatusRepository.findByNameIgnoreCase("TODO").ifPresent(t::setStatus);
        }

        // Priority entity lookup
        if (req.priorityId() != null && !req.priorityId().isBlank()) {
            TaskPriority priority = taskPriorityRepository.findById(req.priorityId())
                    .orElseThrow(() -> new ResourceNotFoundException("Priorità non trovata: " + req.priorityId()));
            t.setPriority(priority);
        } else {
            // Default to MEDIUM
            taskPriorityRepository.findByNameIgnoreCase("MEDIUM").ifPresent(t::setPriority);
        }

        t.setDeadline(req.deadline());
        t.setOwner(req.owner());
        t.setNotes(req.notes());
        t.setMarkdownNotes(req.markdownNotes());

        if (req.sortOrder() != null) {
            t.setSortOrder(req.sortOrder());
        }

        t.setArchived(false);

        // Reminder
        t.setReminderDate(req.reminderDate());
        t.setReminderEnabled(req.reminderEnabled() != null && req.reminderEnabled());

        // Time Tracking
        t.setEstimatedEffort(req.estimatedEffort());
        if (req.actualEffort() != null) {
            t.setActualEffort(req.actualEffort());
        }

        // Task type & planning
        if (req.type() != null) {
            try {
                t.setType(Task.Type.valueOf(req.type()));
            } catch (IllegalArgumentException e) {
                t.setType(Task.Type.TASK);
            }
        }
        t.setPlannedStart(req.plannedStart());
        t.setPlannedFinish(req.plannedFinish());

        // Auto-calculate effort from dates if not provided
        if (t.getEstimatedEffort() == null && t.getPlannedStart() != null && t.getPlannedFinish() != null) {
            t.setEstimatedEffort(calculateEffortFromDates(t.getPlannedStart(), t.getPlannedFinish()));
        }

        // Parent task (SUMMARY_TASK hierarchy)
        if (req.parentTaskId() != null && !req.parentTaskId().isBlank()) {
            Task parent = taskRepository.findByIdAndProjectId(req.parentTaskId(), projectId)
                    .orElseThrow(() -> new ResourceNotFoundException("Parent task non trovato: " + req.parentTaskId()));
            t.setParentTask(parent);
        }

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
        }

        // Save to generate ID
        t = taskRepository.save(t);

        // Send notification after save (so we have the task ID)
        if (t.getAssignedTo() != null && !t.getAssignedTo().getId().equals(userId)) {
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

        // Trigger Planning Engine if dates or parent set
        if (t.getPlannedStart() != null || t.getParentTask() != null) {
            planningEngine.recalculatePlan(projectId);
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
                tasks = taskRepository.findByProjectIdAndStatusName(project.getId(), status);
            } else if (priority != null && !priority.isBlank()) {
                tasks = taskRepository.findByProjectIdAndPriorityName(project.getId(), priority);
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

        // Status entity lookup
        if (req.statusId() != null) {
            TaskStatus newStatus = taskStatusRepository.findById(req.statusId())
                    .orElseThrow(() -> new ResourceNotFoundException("Stato non trovato: " + req.statusId()));
            String statusName = newStatus.getName().toUpperCase();
            if (("DONE".equals(statusName) || "COMPLETED".equals(statusName)) && t.isBlocked()) {
                throw new ConflictException("Impossibile completare il task: ci sono dipendenze non risolte.");
            }
            t.setStatus(newStatus);
        }

        // Priority entity lookup
        if (req.priorityId() != null) {
            TaskPriority newPriority = taskPriorityRepository.findById(req.priorityId())
                    .orElseThrow(() -> new ResourceNotFoundException("Priorità non trovata: " + req.priorityId()));
            t.setPriority(newPriority);
        }

        if (req.deadline() != null) t.setDeadline(req.deadline());
        if (req.owner() != null) t.setOwner(req.owner());
        if (req.notes() != null) t.setNotes(req.notes());

        if (req.markdownNotes() != null) t.setMarkdownNotes(req.markdownNotes());

        if (req.archived() != null) t.setArchived(req.archived());
        if (req.sortOrder() != null) t.setSortOrder(req.sortOrder());

        if (req.reminderDate() != null) t.setReminderDate(req.reminderDate());
        if (req.reminderEnabled() != null) t.setReminderEnabled(req.reminderEnabled());

        if (req.estimatedEffort() != null) t.setEstimatedEffort(req.estimatedEffort());
        if (req.actualEffort() != null) t.setActualEffort(req.actualEffort());

        if (req.type() != null) {
            try {
                t.setType(Task.Type.valueOf(req.type()));
            } catch (IllegalArgumentException e) {
                // ignore invalid type
            }
        }
        if (req.plannedStart() != null) t.setPlannedStart(req.plannedStart());
        if (req.plannedFinish() != null) t.setPlannedFinish(req.plannedFinish());

        // Auto-recalculate effort when dates change and no explicit effort was provided
        if (req.estimatedEffort() == null
                && (req.plannedStart() != null || req.plannedFinish() != null)
                && t.getPlannedStart() != null && t.getPlannedFinish() != null) {
            t.setEstimatedEffort(calculateEffortFromDates(t.getPlannedStart(), t.getPlannedFinish()));
        }

        // Parent task hierarchy (Phase 2)
        if (req.parentTaskId() != null) {
            if (req.parentTaskId().isBlank()) {
                t.setParentTask(null);
            } else {
                Task parent = taskRepository.findByIdAndProjectId(req.parentTaskId(), projectId)
                        .orElseThrow(() -> new ResourceNotFoundException("Parent task non trovato"));
                t.setParentTask(parent);
            }
        }

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

        Task saved = taskRepository.save(t);

        // Trigger Planning Engine on significant changes
        boolean planningRelevant = req.plannedStart() != null || req.plannedFinish() != null || 
                                   req.estimatedEffort() != null || req.parentTaskId() != null;
        if (planningRelevant) {
            planningEngine.recalculatePlan(projectId);
        }

        return saved;
    }

    @Override
    public Task updateStatus(String userId, String projectId, String taskId, ChangeTaskStatusRequest req) {
        log.debug("Updating task {} status to {} for user {}", taskId, req.statusId(), userId);

        Task t = getOwned(userId, projectId, taskId);

        TaskStatus newStatus = taskStatusRepository.findById(req.statusId())
                .orElseThrow(() -> new ResourceNotFoundException("Stato non trovato: " + req.statusId()));

        String statusName = newStatus.getName().toUpperCase();
        if (("DONE".equals(statusName) || "COMPLETED".equals(statusName)) && t.isBlocked()) {
            throw new ConflictException("Impossibile completare il task: ci sono dipendenze non risolte.");
        }

        t.setStatus(newStatus);
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
        // Recalculate plan after deletion
        planningEngine.recalculatePlan(projectId);
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
        
        // Recalculate plan after dependency change
        planningEngine.recalculatePlan(projectId);
    }

    public void removeBlocker(String userId, String projectId, String taskId, String blockerTaskId) {
        Task t = getOwned(userId, projectId, taskId);
        Task blocker = getOwned(userId, projectId, blockerTaskId);

        t.removeBlocker(blocker);
        taskRepository.save(t);
        
        // Recalculate plan after dependency change
        planningEngine.recalculatePlan(projectId);
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

    /**
     * Calculates estimated effort in minutes from planned dates.
     * Uses business days (Mon-Fri) × 480 min (8h/day).
     */
    private int calculateEffortFromDates(LocalDateTime start, LocalDateTime finish) {
        int days = 0;
        var cur = start.toLocalDate();
        var end = finish.toLocalDate();
        while (cur.isBefore(end)) {
            DayOfWeek dow = cur.getDayOfWeek();
            if (dow != DayOfWeek.SATURDAY && dow != DayOfWeek.SUNDAY) {
                days++;
            }
            cur = cur.plusDays(1);
        }
        return Math.max(1, days) * 480;
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
