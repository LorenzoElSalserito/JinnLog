package com.lorenzodm.jinnlog.service;

import com.lorenzodm.jinnlog.api.dto.request.CreateEffortEstimateRequest;
import com.lorenzodm.jinnlog.core.entity.EffortEstimate;

import java.util.List;

public interface EffortEstimateService {
    EffortEstimate create(String userId, CreateEffortEstimateRequest request);
    EffortEstimate getById(String id);
    List<EffortEstimate> findByTaskId(String taskId);
    EffortEstimate findLatestByTaskId(String taskId);
    List<EffortEstimate> findByProjectId(String projectId);
    void delete(String id);
}
