package com.lorenzodm.jinnlog.service;

import com.lorenzodm.jinnlog.api.dto.request.CreateAssignmentRequest;
import com.lorenzodm.jinnlog.core.entity.Assignment;

import java.util.List;

public interface AssignmentService {
    Assignment create(String currentUserId, CreateAssignmentRequest request);
    Assignment getById(String id);
    List<Assignment> findByTaskId(String taskId);
    List<Assignment> findByUserId(String userId);
    List<Assignment> findByProjectId(String projectId);
    void delete(String id);
}
