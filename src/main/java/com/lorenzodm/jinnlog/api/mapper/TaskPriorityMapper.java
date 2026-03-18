package com.lorenzodm.jinnlog.api.mapper;

import com.lorenzodm.jinnlog.api.dto.response.TaskPriorityResponse;
import com.lorenzodm.jinnlog.core.entity.TaskPriority;
import org.springframework.stereotype.Component;

@Component
public class TaskPriorityMapper {

    public TaskPriorityResponse toResponse(TaskPriority priority) {
        if (priority == null) return null;
        return new TaskPriorityResponse(
                priority.getId(),
                priority.getName(),
                priority.getLevel(),
                priority.getColor(),
                priority.getCreatedAt()
        );
    }
}
