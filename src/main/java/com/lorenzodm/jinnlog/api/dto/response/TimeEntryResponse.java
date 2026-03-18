package com.lorenzodm.jinnlog.api.dto.response;

import java.time.Instant;
import java.time.LocalDateTime;

public record TimeEntryResponse(
        String id,
        String taskId,
        String taskTitle,
        String userId,
        String userDisplayName,
        LocalDateTime entryDate,
        int durationMinutes,
        String type,
        String description,
        Instant createdAt
) {}
