package com.lorenzodm.jinnlog.api.mapper;

import com.lorenzodm.jinnlog.api.dto.response.RiskRegisterEntryResponse;
import com.lorenzodm.jinnlog.core.entity.RiskRegisterEntry;
import org.springframework.stereotype.Component;

@Component
public class RiskRegisterEntryMapper {

    public RiskRegisterEntryResponse toResponse(RiskRegisterEntry entry) {
        if (entry == null) return null;
        return new RiskRegisterEntryResponse(
                entry.getId(),
                entry.getProject().getId(),
                entry.getDescription(),
                entry.getProbability().name(),
                entry.getImpact().name(),
                entry.getMitigationStrategy(),
                entry.getCreatedAt(),
                entry.getUpdatedAt()
        );
    }
}
