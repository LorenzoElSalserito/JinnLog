package com.lorenzodm.jinnlog.service;

import com.lorenzodm.jinnlog.api.dto.request.CreateTaskPriorityRequest;
import com.lorenzodm.jinnlog.api.dto.request.UpdateTaskPriorityRequest;
import com.lorenzodm.jinnlog.core.entity.TaskPriority;

import java.util.List;

public interface TaskPriorityService {
    TaskPriority create(CreateTaskPriorityRequest request);
    TaskPriority getById(String id);
    List<TaskPriority> listAll();
    TaskPriority update(String id, UpdateTaskPriorityRequest request);
    void delete(String id);
}
