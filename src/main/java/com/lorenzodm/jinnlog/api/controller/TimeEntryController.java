package com.lorenzodm.jinnlog.api.controller;

import com.lorenzodm.jinnlog.api.dto.request.CreateTimeEntryRequest;
import com.lorenzodm.jinnlog.api.dto.request.UpdateTimeEntryRequest;
import com.lorenzodm.jinnlog.api.dto.response.EffortDeviationResponse;
import com.lorenzodm.jinnlog.api.dto.response.TimeEntryResponse;
import com.lorenzodm.jinnlog.api.mapper.TimeEntryMapper;
import com.lorenzodm.jinnlog.core.entity.TimeEntry;
import com.lorenzodm.jinnlog.security.CurrentUser;
import com.lorenzodm.jinnlog.service.TimeEntryService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/time-entries")
public class TimeEntryController {

    private final TimeEntryService service;
    private final TimeEntryMapper mapper;

    public TimeEntryController(TimeEntryService service, TimeEntryMapper mapper) {
        this.service = service;
        this.mapper = mapper;
    }

    @PostMapping
    public ResponseEntity<TimeEntryResponse> create(
            @CurrentUser String userId,
            @Valid @RequestBody CreateTimeEntryRequest request) {
        TimeEntry entry = service.create(userId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(mapper.toResponse(entry));
    }

    @GetMapping("/{id}")
    public ResponseEntity<TimeEntryResponse> getById(@PathVariable String id) {
        return ResponseEntity.ok(mapper.toResponse(service.getById(id)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<TimeEntryResponse> update(
            @PathVariable String id,
            @Valid @RequestBody UpdateTimeEntryRequest request) {
        return ResponseEntity.ok(mapper.toResponse(service.update(id, request)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable String id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/task/{taskId}")
    public ResponseEntity<List<TimeEntryResponse>> findByTaskId(@PathVariable String taskId) {
        List<TimeEntryResponse> response = service.findByTaskId(taskId).stream()
                .map(mapper::toResponse).toList();
        return ResponseEntity.ok(response);
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<TimeEntryResponse>> findByUserId(@PathVariable String userId) {
        List<TimeEntryResponse> response = service.findByUserId(userId).stream()
                .map(mapper::toResponse).toList();
        return ResponseEntity.ok(response);
    }

    @GetMapping("/project/{projectId}")
    public ResponseEntity<List<TimeEntryResponse>> findByProjectId(@PathVariable String projectId) {
        List<TimeEntryResponse> response = service.findByProjectId(projectId).stream()
                .map(mapper::toResponse).toList();
        return ResponseEntity.ok(response);
    }

    @GetMapping("/task/{taskId}/total")
    public ResponseEntity<Integer> getTotalMinutesByTask(@PathVariable String taskId) {
        return ResponseEntity.ok(service.getTotalMinutesByTaskId(taskId));
    }

    @GetMapping("/task/{taskId}/deviation")
    public ResponseEntity<EffortDeviationResponse> calculateDeviation(@PathVariable String taskId) {
        return ResponseEntity.ok(service.calculateDeviation(taskId));
    }
}
