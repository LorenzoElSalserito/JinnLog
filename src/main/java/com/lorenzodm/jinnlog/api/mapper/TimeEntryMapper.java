package com.lorenzodm.jinnlog.api.mapper;

import com.lorenzodm.jinnlog.api.dto.response.TimeEntryResponse;
import com.lorenzodm.jinnlog.core.entity.TimeEntry;
import org.springframework.stereotype.Component;

@Component
public class TimeEntryMapper {

    public TimeEntryResponse toResponse(TimeEntry entry) {
        if (entry == null) return null;
        return new TimeEntryResponse(
                entry.getId(),
                entry.getTask().getId(),
                entry.getTask().getTitle(),
                entry.getUser() != null ? entry.getUser().getId() : null,
                entry.getUser() != null ? entry.getUser().getDisplayName() : null,
                entry.getEntryDate(),
                entry.getDurationMinutes(),
                entry.getType().name(),
                entry.getDescription(),
                entry.getCreatedAt()
        );
    }
}
