package com.lorenzodm.jinnlog.api.mapper;

import com.lorenzodm.jinnlog.api.dto.response.FocusSessionResponse;
import com.lorenzodm.jinnlog.core.entity.FocusSession;
import org.springframework.stereotype.Component;

@Component
public class FocusSessionMapper {

    public FocusSessionResponse toResponse(FocusSession fs) {
        return new FocusSessionResponse(
                fs.getId(),
                fs.getStartedAt(),
                fs.getEndedAt(),
                fs.getDurationMs(),
                fs.getNotes(),
                fs.getSessionType(),
                fs.getCreatedAt(),
                fs.getLastSyncedAt(),
                fs.getSyncStatus(),
                fs.getTask() != null ? fs.getTask().getId() : null,
                fs.getUser() != null ? fs.getUser().getId() : null,
                fs.isRunning()
        );
    }
}
