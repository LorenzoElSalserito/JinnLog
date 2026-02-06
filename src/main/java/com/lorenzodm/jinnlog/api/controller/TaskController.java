package com.lorenzodm.jinnlog.api.controller;

import com.lorenzodm.jinnlog.api.dto.request.CreateTaskRequest;
import com.lorenzodm.jinnlog.api.dto.request.UpdateTaskRequest;
import com.lorenzodm.jinnlog.api.dto.request.UpdateTaskStatusRequest;
import com.lorenzodm.jinnlog.api.dto.response.TaskResponse;
import com.lorenzodm.jinnlog.api.mapper.TaskMapper;
import com.lorenzodm.jinnlog.core.entity.Task;
import com.lorenzodm.jinnlog.service.TaskService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/users/{userId}/projects/{projectId}/tasks")
public class TaskController {

    private final TaskService taskService;
    private final TaskMapper taskMapper;

    public TaskController(TaskService taskService, TaskMapper taskMapper) {
        this.taskService = taskService;
        this.taskMapper = taskMapper;
    }

    @PostMapping
    public ResponseEntity<TaskResponse> create(
            @PathVariable String userId,
            @PathVariable String projectId,
            @Valid @RequestBody CreateTaskRequest req
    ) {
        Task created = taskService.create(userId, projectId, req);
        return ResponseEntity.created(URI.create("/api/users/" + userId + "/projects/" + projectId + "/tasks/" + created.getId()))
                .body(taskMapper.toResponse(created));
    }

    @GetMapping("/{taskId}")
    public ResponseEntity<TaskResponse> get(@PathVariable String userId, @PathVariable String projectId, @PathVariable String taskId) {
        return ResponseEntity.ok(taskMapper.toResponse(taskService.getOwned(userId, projectId, taskId)));
    }

    @GetMapping
    public ResponseEntity<List<TaskResponse>> list(
            @PathVariable String userId,
            @PathVariable String projectId,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String priority,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "false") boolean includeArchived
    ) {
        List<TaskResponse> out = taskService.listOwned(userId, projectId, status, priority, search, includeArchived)
                .stream().map(taskMapper::toResponse).toList();
        return ResponseEntity.ok(out);
    }

    @PutMapping("/{taskId}")
    public ResponseEntity<TaskResponse> update(
            @PathVariable String userId,
            @PathVariable String projectId,
            @PathVariable String taskId,
            @Valid @RequestBody UpdateTaskRequest req
    ) {
        return ResponseEntity.ok(taskMapper.toResponse(taskService.update(userId, projectId, taskId, req)));
    }

    @PatchMapping("/{taskId}/status")
    public ResponseEntity<TaskResponse> updateStatus(
            @PathVariable String userId,
            @PathVariable String projectId,
            @PathVariable String taskId,
            @Valid @RequestBody UpdateTaskStatusRequest req
    ) {
        return ResponseEntity.ok(taskMapper.toResponse(taskService.updateStatus(userId, projectId, taskId, req)));
    }

    @PatchMapping("/{taskId}/archived")
    public ResponseEntity<TaskResponse> setArchived(
            @PathVariable String userId,
            @PathVariable String projectId,
            @PathVariable String taskId,
            @RequestParam boolean archived
    ) {
        return ResponseEntity.ok(taskMapper.toResponse(taskService.setArchived(userId, projectId, taskId, archived)));
    }

    @PutMapping("/reorder")
    public ResponseEntity<Void> reorder(
            @PathVariable String userId,
            @PathVariable String projectId,
            @RequestBody List<String> orderedTaskIds
    ) {
        taskService.reorder(userId, projectId, orderedTaskIds);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{taskId}/blockers")
    public ResponseEntity<Void> addBlocker(
            @PathVariable String userId,
            @PathVariable String projectId,
            @PathVariable String taskId,
            @RequestBody Map<String, String> payload
    ) {
        String blockerTaskId = payload.get("blockerTaskId");
        taskService.addBlocker(userId, projectId, taskId, blockerTaskId);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{taskId}/blockers/{blockerTaskId}")
    public ResponseEntity<Void> removeBlocker(
            @PathVariable String userId,
            @PathVariable String projectId,
            @PathVariable String taskId,
            @PathVariable String blockerTaskId
    ) {
        taskService.removeBlocker(userId, projectId, taskId, blockerTaskId);
        return ResponseEntity.ok().build();
    }
}
