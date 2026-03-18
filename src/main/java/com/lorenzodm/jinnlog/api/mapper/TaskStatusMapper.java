package com.lorenzodm.jinnlog.api.mapper;

import com.lorenzodm.jinnlog.api.dto.response.TaskStatusResponse;
import com.lorenzodm.jinnlog.core.entity.TaskStatus;
import org.springframework.stereotype.Component;

@Component
public class TaskStatusMapper {

    public TaskStatusResponse toResponse(TaskStatus status) {
        if (status == null) return null;
        return new TaskStatusResponse(
                status.getId(),
                status.getName(),
                status.getDescription(),
                status.getColor(),
                status.getCreatedAt()
        );
    }
}
