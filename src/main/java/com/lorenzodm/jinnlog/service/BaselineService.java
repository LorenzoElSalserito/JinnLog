package com.lorenzodm.jinnlog.service;

import com.lorenzodm.jinnlog.api.dto.request.CreateBaselineRequest;
import com.lorenzodm.jinnlog.core.entity.Baseline;

import java.util.List;

public interface BaselineService {

    /**
     * Creates an immutable snapshot of the current project plan (PRD-11-FR-001).
     * Snapshots all tasks with their current plannedStart, plannedFinish, estimatedEffort.
     */
    Baseline create(String userId, String projectId, CreateBaselineRequest req);

    Baseline getById(String userId, String projectId, String baselineId);

    List<Baseline> listByProject(String userId, String projectId);

    void delete(String userId, String projectId, String baselineId);
}
