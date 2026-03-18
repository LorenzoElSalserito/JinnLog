package com.lorenzodm.jinnlog.api.mapper;

import com.lorenzodm.jinnlog.api.dto.response.ProjectCharterResponse;
import com.lorenzodm.jinnlog.core.entity.ProjectCharter;
import org.springframework.stereotype.Component;

@Component
public class ProjectCharterMapper {

    public ProjectCharterResponse toResponse(ProjectCharter charter) {
        if (charter == null) return null;
        return new ProjectCharterResponse(
                charter.getId(),
                charter.getProject().getId(),
                charter.getSponsor(),
                charter.getProjectManager(),
                charter.getObjectives(),
                charter.getProblemStatement(),
                charter.getBusinessCase(),
                charter.getCreatedAt(),
                charter.getUpdatedAt()
        );
    }
}
