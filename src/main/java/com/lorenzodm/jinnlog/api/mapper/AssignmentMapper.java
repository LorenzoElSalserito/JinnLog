package com.lorenzodm.jinnlog.api.mapper;

import com.lorenzodm.jinnlog.api.dto.response.AssignmentResponse;
import com.lorenzodm.jinnlog.core.entity.Assignment;
import org.springframework.stereotype.Component;

@Component
public class AssignmentMapper {

    public AssignmentResponse toResponse(Assignment assignment) {
        if (assignment == null) return null;
        return new AssignmentResponse(
                assignment.getId(),
                assignment.getTask().getId(),
                assignment.getTask().getTitle(),
                assignment.getUser().getId(),
                assignment.getUser().getDisplayName(),
                assignment.getRole() != null ? assignment.getRole().getId() : null,
                assignment.getRole() != null ? assignment.getRole().getName() : null,
                assignment.getAssignedAt(),
                assignment.getCreatedAt()
        );
    }
}
