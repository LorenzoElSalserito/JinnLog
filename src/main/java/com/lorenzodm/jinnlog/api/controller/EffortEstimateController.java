package com.lorenzodm.jinnlog.api.controller;

import com.lorenzodm.jinnlog.api.dto.request.CreateEffortEstimateRequest;
import com.lorenzodm.jinnlog.api.dto.response.EffortEstimateResponse;
import com.lorenzodm.jinnlog.api.mapper.EffortEstimateMapper;
import com.lorenzodm.jinnlog.core.entity.EffortEstimate;
import com.lorenzodm.jinnlog.security.CurrentUser;
import com.lorenzodm.jinnlog.service.EffortEstimateService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/effort-estimates")
public class EffortEstimateController {

    private final EffortEstimateService service;
    private final EffortEstimateMapper mapper;

    public EffortEstimateController(EffortEstimateService service, EffortEstimateMapper mapper) {
        this.service = service;
        this.mapper = mapper;
    }

    @PostMapping
    public ResponseEntity<EffortEstimateResponse> create(
            @CurrentUser String userId,
            @Valid @RequestBody CreateEffortEstimateRequest request) {
        EffortEstimate estimate = service.create(userId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(mapper.toResponse(estimate));
    }

    @GetMapping("/{id}")
    public ResponseEntity<EffortEstimateResponse> getById(@PathVariable String id) {
        return ResponseEntity.ok(mapper.toResponse(service.getById(id)));
    }

    @GetMapping("/task/{taskId}")
    public ResponseEntity<List<EffortEstimateResponse>> findByTaskId(@PathVariable String taskId) {
        List<EffortEstimateResponse> response = service.findByTaskId(taskId).stream()
                .map(mapper::toResponse).toList();
        return ResponseEntity.ok(response);
    }

    @GetMapping("/task/{taskId}/latest")
    public ResponseEntity<EffortEstimateResponse> findLatestByTaskId(@PathVariable String taskId) {
        return ResponseEntity.ok(mapper.toResponse(service.findLatestByTaskId(taskId)));
    }

    @GetMapping("/project/{projectId}")
    public ResponseEntity<List<EffortEstimateResponse>> findByProjectId(@PathVariable String projectId) {
        List<EffortEstimateResponse> response = service.findByProjectId(projectId).stream()
                .map(mapper::toResponse).toList();
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable String id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}
