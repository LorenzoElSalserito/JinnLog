package com.lorenzodm.jinnlog.service;

import com.lorenzodm.jinnlog.api.dto.request.CreateTaskStatusRequest;
import com.lorenzodm.jinnlog.api.dto.request.UpdateTaskStatusRequest;
import com.lorenzodm.jinnlog.core.entity.TaskStatus;

import java.util.List;

public interface TaskStatusService {
    TaskStatus create(CreateTaskStatusRequest request);
    TaskStatus getById(String id);
    List<TaskStatus> listAll();
    TaskStatus update(String id, UpdateTaskStatusRequest request);
    void delete(String id);
}
