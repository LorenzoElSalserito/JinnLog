package com.lorenzodm.jinnlog.api.mapper;

import com.lorenzodm.jinnlog.api.dto.response.DeliverableResponse;
import com.lorenzodm.jinnlog.core.entity.Deliverable;
import org.springframework.stereotype.Component;

@Component
public class DeliverableMapper {

    public DeliverableResponse toResponse(Deliverable deliverable) {
        if (deliverable == null) return null;
        return new DeliverableResponse(
                deliverable.getId(),
                deliverable.getProject().getId(),
                deliverable.getName(),
                deliverable.getDescription(),
                deliverable.getDueDate(),
                deliverable.getProgress(),
                deliverable.getRiskStatus() != null ? deliverable.getRiskStatus().name() : null,
                deliverable.getCompletedAt(),
                deliverable.getCreatedAt(),
                deliverable.getUpdatedAt()
        );
    }
}
