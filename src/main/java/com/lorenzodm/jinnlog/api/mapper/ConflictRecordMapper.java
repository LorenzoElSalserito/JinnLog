package com.lorenzodm.jinnlog.api.mapper;

import com.lorenzodm.jinnlog.api.dto.response.ConflictRecordResponse;
import com.lorenzodm.jinnlog.core.entity.ConflictRecord;
import org.springframework.stereotype.Component;

@Component
public class ConflictRecordMapper {

    public ConflictRecordResponse toResponse(ConflictRecord cr) {
        if (cr == null) return null;
        return new ConflictRecordResponse(
                cr.getId(),
                cr.getEntityType(),
                cr.getEntityId(),
                cr.getLocalState(),
                cr.getRemoteState(),
                cr.getDetectedAt(),
                cr.isResolved(),
                cr.getFieldName(),
                cr.getPolicyUsed(),
                cr.getResolution(),
                cr.getResolvedAt(),
                cr.getResolvedBy(),
                cr.getCreatedAt()
        );
    }
}
