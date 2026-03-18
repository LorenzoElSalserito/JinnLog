package com.lorenzodm.jinnlog.api.dto.response;

import java.time.Instant;
import java.time.LocalDate;

public record ResourceAllocationItemResponse(
        String id,
        String userId,
        String userDisplayName,
        String projectId,
        String projectName,
        LocalDate startDate,
        LocalDate endDate,
        int percentage,
        Instant createdAt
) {}
