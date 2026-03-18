package com.lorenzodm.jinnlog.api.controller;

import com.lorenzodm.jinnlog.api.dto.request.CreateBaselineRequest;
import com.lorenzodm.jinnlog.api.dto.response.BaselineResponse;
import com.lorenzodm.jinnlog.api.dto.response.VarianceResponse;
import com.lorenzodm.jinnlog.api.mapper.BaselineMapper;
import com.lorenzodm.jinnlog.service.BaselineService;
import com.lorenzodm.jinnlog.service.VarianceService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/api/users/{userId}/projects/{projectId}/baselines")
public class BaselineController {

    private final BaselineService baselineService;
    private final VarianceService varianceService;
    private final BaselineMapper baselineMapper;

    public BaselineController(BaselineService baselineService,
                              VarianceService varianceService,
                              BaselineMapper baselineMapper) {
        this.baselineService = baselineService;
        this.varianceService = varianceService;
        this.baselineMapper = baselineMapper;
    }

    @PostMapping
    public ResponseEntity<BaselineResponse> create(
            @PathVariable String userId, @PathVariable String projectId,
            @Valid @RequestBody CreateBaselineRequest req
    ) {
        var created = baselineService.create(userId, projectId, req);
        return ResponseEntity.created(URI.create(
                "/api/users/" + userId + "/projects/" + projectId + "/baselines/" + created.getId()))
                .body(baselineMapper.toResponse(created));
    }

    @GetMapping
    public ResponseEntity<List<BaselineResponse>> list(
            @PathVariable String userId, @PathVariable String projectId
    ) {
        return ResponseEntity.ok(baselineService.listByProject(userId, projectId)
                .stream().map(baselineMapper::toResponse).toList());
    }

    @GetMapping("/{baselineId}")
    public ResponseEntity<BaselineResponse> get(
            @PathVariable String userId, @PathVariable String projectId,
            @PathVariable String baselineId
    ) {
        return ResponseEntity.ok(baselineMapper.toResponse(
                baselineService.getById(userId, projectId, baselineId)));
    }

    @DeleteMapping("/{baselineId}")
    public ResponseEntity<Void> delete(
            @PathVariable String userId, @PathVariable String projectId,
            @PathVariable String baselineId
    ) {
        baselineService.delete(userId, projectId, baselineId);
        return ResponseEntity.noContent().build();
    }

    // --- Variance ---

    @GetMapping("/{baselineId}/variance")
    public ResponseEntity<VarianceResponse> getVariance(
            @PathVariable String userId, @PathVariable String projectId,
            @PathVariable String baselineId
    ) {
        return ResponseEntity.ok(varianceService.calculateVariance(userId, projectId, baselineId));
    }

    @GetMapping("/latest/variance")
    public ResponseEntity<VarianceResponse> getLatestVariance(
            @PathVariable String userId, @PathVariable String projectId
    ) {
        return ResponseEntity.ok(varianceService.calculateLatestVariance(userId, projectId));
    }
}
