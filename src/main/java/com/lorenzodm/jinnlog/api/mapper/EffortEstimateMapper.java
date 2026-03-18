package com.lorenzodm.jinnlog.api.mapper;

import com.lorenzodm.jinnlog.api.dto.response.EffortEstimateResponse;
import com.lorenzodm.jinnlog.core.entity.EffortEstimate;
import org.springframework.stereotype.Component;

@Component
public class EffortEstimateMapper {

    public EffortEstimateResponse toResponse(EffortEstimate estimate) {
        if (estimate == null) return null;
        return new EffortEstimateResponse(
                estimate.getId(),
                estimate.getTask().getId(),
                estimate.getTask().getTitle(),
                estimate.getEstimator() != null ? estimate.getEstimator().getId() : null,
                estimate.getEstimator() != null ? estimate.getEstimator().getDisplayName() : null,
                estimate.getEstimatedMinutes(),
                estimate.getEstimationDate(),
                estimate.getRationale(),
                estimate.getCreatedAt()
        );
    }
}
